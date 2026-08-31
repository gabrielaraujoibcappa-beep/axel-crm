import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, of, catchError, map, tap, throwError, forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Client, Lead, Page } from '../../core/models/models';

export type WaConnectionStatus = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED';

/** CRM entity kinds a conversation can be linked to. */
export type WaLinkedType = 'LEAD' | 'CLIENT' | 'PROSPECT' | 'CONTACT';

/** Conversation list filters exposed in the inbox sidebar. */
export type WaFilter = 'all' | 'unread' | 'unlinked';

/** A lead/client candidate rendered in the "vincular ao CRM" dialog. */
export interface CrmSearchResult {
  type: WaLinkedType;
  id: string;
  name: string;
  phone?: string;
  email?: string;
  subtitle?: string;
}

export interface ConversationSummary {
  phone: string;
  contactName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  direction?: 'INBOUND' | 'OUTBOUND';
  linkedType?: WaLinkedType | null;
  linkedId?: string | null;
  linkedLabel?: string | null;
  avatarInitials?: string;
}

export interface WhatsAppMessage {
  id: string;
  phone: string;
  direction: 'INBOUND' | 'OUTBOUND';
  body: string;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  sentAt: string;
  isRead?: boolean;
}

export interface WhatsAppStatus {
  status: WaConnectionStatus;
  provider?: string;
  instanceId?: string;
  lastSeenAt?: string | null;
  qrcode?: string | null;
}

@Injectable({ providedIn: 'root' })
export class WhatsappService {
  private readonly base = `${environment.apiUrl}/whatsapp`;
  /** Demo mode when backend endpoints are not ready. */
  useMock = false;

  private mockConversations: ConversationSummary[] = [
    {
      phone: '5511987654321',
      contactName: 'Ana Souza',
      lastMessage: 'Pode me enviar a proposta atualizada?',
      lastMessageAt: new Date(Date.now() - 4 * 60_000).toISOString(),
      unreadCount: 2,
      direction: 'INBOUND',
      linkedType: 'LEAD',
      linkedId: 'demo-lead-1',
      linkedLabel: 'Lead · Tech Solutions',
      avatarInitials: 'AS',
    },
    {
      phone: '5511912345678',
      contactName: 'Carlos Mendes',
      lastMessage: 'Perfeito, até amanhã então.',
      lastMessageAt: new Date(Date.now() - 45 * 60_000).toISOString(),
      unreadCount: 0,
      direction: 'OUTBOUND',
      linkedType: 'CLIENT',
      linkedId: 'demo-client-1',
      linkedLabel: 'Cliente · Mendes & Cia',
      avatarInitials: 'CM',
    },
    {
      phone: '5511998877665',
      contactName: 'Juliana Prado',
      lastMessage: 'Bom dia! Vocês atendem SP capital?',
      lastMessageAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
      unreadCount: 1,
      direction: 'INBOUND',
      linkedType: null,
      linkedId: null,
      linkedLabel: null,
      avatarInitials: 'JP',
    },
    {
      phone: '5511970011223',
      contactName: 'Ricardo Alves',
      lastMessage: 'Enviamos o contrato por e-mail também.',
      lastMessageAt: new Date(Date.now() - 26 * 3600_000).toISOString(),
      unreadCount: 0,
      direction: 'OUTBOUND',
      linkedType: 'PROSPECT',
      linkedId: 'demo-prospect-1',
      linkedLabel: 'Prospect · Alves Group',
      avatarInitials: 'RA',
    },
  ];

  private mockMessages: Record<string, WhatsAppMessage[]> = {
    '5511987654321': [
      {
        id: 'm1',
        phone: '5511987654321',
        direction: 'INBOUND',
        body: 'Olá! Vi a apresentação de vocês e gostaria de saber mais sobre o plano Team.',
        status: 'READ',
        sentAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
        isRead: true,
      },
      {
        id: 'm2',
        phone: '5511987654321',
        direction: 'OUTBOUND',
        body: 'Oi Ana! Claro — o plano Team inclui CRM, financeiro e operações em um painel. Posso enviar a proposta?',
        status: 'READ',
        sentAt: new Date(Date.now() - 110 * 60_000).toISOString(),
        isRead: true,
      },
      {
        id: 'm3',
        phone: '5511987654321',
        direction: 'INBOUND',
        body: 'Sim, por favor. Preferimos mensal no início.',
        status: 'READ',
        sentAt: new Date(Date.now() - 90 * 60_000).toISOString(),
        isRead: true,
      },
      {
        id: 'm4',
        phone: '5511987654321',
        direction: 'OUTBOUND',
        body: 'Combinado. Estou montando com 5 usuários e implantamento em 15 dias.',
        status: 'DELIVERED',
        sentAt: new Date(Date.now() - 30 * 60_000).toISOString(),
        isRead: true,
      },
      {
        id: 'm5',
        phone: '5511987654321',
        direction: 'INBOUND',
        body: 'Pode me enviar a proposta atualizada?',
        status: 'DELIVERED',
        sentAt: new Date(Date.now() - 4 * 60_000).toISOString(),
        isRead: false,
      },
    ],
    '5511912345678': [
      {
        id: 'c1',
        phone: '5511912345678',
        direction: 'OUTBOUND',
        body: 'Carlos, a reunião de onboarding ficou confirmada para amanhã às 10h.',
        status: 'READ',
        sentAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
      },
      {
        id: 'c2',
        phone: '5511912345678',
        direction: 'INBOUND',
        body: 'Perfeito, até amanhã então.',
        status: 'READ',
        sentAt: new Date(Date.now() - 45 * 60_000).toISOString(),
      },
    ],
    '5511998877665': [
      {
        id: 'j1',
        phone: '5511998877665',
        direction: 'INBOUND',
        body: 'Bom dia! Vocês atendem SP capital?',
        status: 'DELIVERED',
        sentAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
        isRead: false,
      },
    ],
    '5511970011223': [
      {
        id: 'r1',
        phone: '5511970011223',
        direction: 'OUTBOUND',
        body: 'Ricardo, enviamos o contrato por e-mail também.',
        status: 'READ',
        sentAt: new Date(Date.now() - 26 * 3600_000).toISOString(),
      },
    ],
  };

  private mockStatus: WhatsAppStatus = {
    status: 'CONNECTED',
    provider: 'Evolution API (demo)',
    instanceId: 'axel-demo',
    lastSeenAt: new Date().toISOString(),
    qrcode: null,
  };

  constructor(private http: HttpClient) {}

  /**
   * Mock data is a stand-in for endpoints that do not exist yet — never a way to
   * hide real API failures. Only a network-level error (status 0: offline, DNS,
   * CORS, connection refused) or a 404 (route not deployed) triggers the demo
   * fallback. 401/403/5xx must surface so the user sees the real problem.
   */
  private shouldFallback(err: unknown): boolean {
    if (!(err instanceof HttpErrorResponse)) return false;
    return err.status === 0 || err.status === 404;
  }

  /** Wraps a fallback so non-fallback errors keep propagating to the caller. */
  private withFallback<T>(fallback: () => T) {
    return (err: unknown): Observable<T> => {
      if (!this.shouldFallback(err)) return throwError(() => err);
      this.useMock = true;
      return of(fallback());
    };
  }

  /**
   * The backend DTO spells the QR field `qrCode`; the UI model uses `qrcode`.
   * Normalise here so the QR banner renders regardless of which casing arrives.
   */
  private normalizeStatus(raw: WhatsAppStatus & { qrCode?: string | null }): WhatsAppStatus {
    return { ...raw, qrcode: raw.qrcode ?? raw.qrCode ?? null };
  }

  getStatus(): Observable<WhatsAppStatus> {
    return this.http.get<WhatsAppStatus>(`${this.base}/status`).pipe(
      tap(() => (this.useMock = false)),
      map((s) => this.normalizeStatus(s)),
      catchError(this.withFallback(() => ({ ...this.mockStatus }))),
    );
  }

  connect(): Observable<WhatsAppStatus> {
    if (this.useMock) {
      this.mockStatus = {
        status: 'CONNECTING',
        provider: 'Evolution API (demo)',
        qrcode: 'DEMO-QR-CODE-PLACEHOLDER',
        lastSeenAt: new Date().toISOString(),
      };
      setTimeout(() => {
        this.mockStatus = {
          status: 'CONNECTED',
          provider: 'Evolution API (demo)',
          instanceId: 'axel-demo',
          lastSeenAt: new Date().toISOString(),
          qrcode: null,
        };
      }, 2500);
      return of({ ...this.mockStatus });
    }
    return this.http.post<WhatsAppStatus>(`${this.base}/connect`, {}).pipe(
      map((s) => this.normalizeStatus(s)),
      catchError((err) => {
        // Diferente dos demais endpoints, um 404 aqui significa "nenhuma integracao de
        // WhatsApp configurada para esta organizacao" — um erro de configuracao real que
        // o usuario precisa ver. Cair no mock mostraria um QR ficticio e esconderia a causa.
        if (!(err instanceof HttpErrorResponse) || err.status !== 0) {
          return throwError(() => err);
        }
        this.useMock = true;
        return this.connect();
      }),
    );
  }

  disconnect(): Observable<WhatsAppStatus> {
    if (this.useMock) {
      this.mockStatus = { status: 'DISCONNECTED', provider: 'Evolution API (demo)' };
      return of({ ...this.mockStatus });
    }
    // The endpoint answers 204 with no body, so synthesise the resulting state
    // instead of propagating null into the connection banner.
    return this.http.post<void>(`${this.base}/disconnect`, {}).pipe(
      map<void, WhatsAppStatus>(() => ({ status: 'DISCONNECTED', qrcode: null })),
      catchError(
        this.withFallback<WhatsAppStatus>(() => {
          this.mockStatus = { status: 'DISCONNECTED' };
          return { ...this.mockStatus };
        }),
      ),
    );
  }

  getConversations(): Observable<ConversationSummary[]> {
    return this.http.get<ConversationSummary[]>(`${this.base}/conversations`).pipe(
      tap(() => (this.useMock = false)),
      map((list) =>
        (list || []).map((c) => ({
          ...c,
          avatarInitials: c.avatarInitials || this.initials(c.contactName || c.phone),
        })),
      ),
      catchError(this.withFallback(() => this.mockConversations.map((c) => ({ ...c })))),
    );
  }

  getMessages(phone: string, page = 0, size = 50): Observable<WhatsAppMessage[]> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http
      .get<WhatsAppMessage[] | { content: WhatsAppMessage[] }>(
        `${this.base}/conversations/${encodeURIComponent(phone)}/messages`,
        { params },
      )
      .pipe(
        // The API pages newest-first (correct for pagination); the chat renders
        // top-to-bottom oldest-first, so flip the page before handing it over.
        map((res) => {
          const rows = Array.isArray(res) ? res : res?.content || [];
          return [...rows].sort(
            (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
          );
        }),
        catchError(this.withFallback(() => [...(this.mockMessages[phone] || [])])),
      );
  }

  sendMessage(phone: string, body: string): Observable<WhatsAppMessage> {
    const payload = { body };
    if (this.useMock) {
      const msg: WhatsAppMessage = {
        id: `local-${Date.now()}`,
        phone,
        direction: 'OUTBOUND',
        body,
        status: 'SENT',
        sentAt: new Date().toISOString(),
        isRead: true,
      };
      if (!this.mockMessages[phone]) this.mockMessages[phone] = [];
      this.mockMessages[phone] = [...this.mockMessages[phone], msg];
      const conv = this.mockConversations.find((c) => c.phone === phone);
      if (conv) {
        conv.lastMessage = body;
        conv.lastMessageAt = msg.sentAt;
        conv.direction = 'OUTBOUND';
        conv.unreadCount = 0;
      }
      // Simulate delivery
      setTimeout(() => {
        msg.status = 'DELIVERED';
      }, 800);
      return of({ ...msg });
    }
    return this.http
      .post<WhatsAppMessage>(
        `${this.base}/conversations/${encodeURIComponent(phone)}/messages`,
        payload,
      )
      .pipe(
        catchError((err) => {
          if (!this.shouldFallback(err)) return throwError(() => err);
          this.useMock = true;
          return this.sendMessage(phone, body);
        }),
      );
  }

  /** Marks a single message as read. */
  markRead(messageId: string): Observable<void> {
    if (this.useMock) {
      this.markMockMessageRead(messageId);
      return of(void 0);
    }
    return this.http
      .post<void>(`${this.base}/messages/${messageId}/read`, {})
      .pipe(catchError(this.withFallback(() => this.markMockMessageRead(messageId))));
  }

  /**
   * Marks every unread inbound message of a conversation as read. Prefers the
   * bulk endpoint; on 404 it falls back to per-message calls so the feature
   * still works against a partially implemented backend.
   */
  markConversationRead(phone: string, messageIds: string[] = []): Observable<void> {
    if (this.useMock) {
      this.markMockConversationRead(phone);
      return of(void 0);
    }
    return this.http
      .post<void>(`${this.base}/conversations/${encodeURIComponent(phone)}/read`, {})
      .pipe(
        catchError((err) => {
          if (!this.shouldFallback(err)) return throwError(() => err);
          if (messageIds.length === 0) {
            this.markMockConversationRead(phone);
            return of(void 0);
          }
          return forkJoin(messageIds.map((id) => this.markRead(id))).pipe(map(() => void 0));
        }),
      );
  }

  /** Associates a conversation's phone number with an existing CRM record. */
  linkConversation(
    phone: string,
    type: WaLinkedType,
    id: string,
    label: string,
  ): Observable<ConversationSummary | null> {
    if (this.useMock) {
      return of(this.applyMockLink(phone, type, id, label));
    }
    return this.http
      .post<ConversationSummary>(
        `${this.base}/conversations/${encodeURIComponent(phone)}/link`,
        { linkedType: type, linkedId: id },
      )
      .pipe(catchError(this.withFallback(() => this.applyMockLink(phone, type, id, label))));
  }

  /** Removes the CRM association from a conversation. */
  unlinkConversation(phone: string): Observable<ConversationSummary | null> {
    if (this.useMock) {
      return of(this.applyMockLink(phone, null, null, null));
    }
    return this.http
      .delete<ConversationSummary>(`${this.base}/conversations/${encodeURIComponent(phone)}/link`)
      .pipe(catchError(this.withFallback(() => this.applyMockLink(phone, null, null, null))));
  }

  /**
   * Searches leads and clients for the link dialog. The backend list endpoints
   * expose no query parameter, so a page is fetched and filtered locally.
   */
  searchCrmRecords(query: string, limit = 25): Observable<CrmSearchResult[]> {
    const params = new HttpParams().set('page', 0).set('size', 200).set('sort', 'name,asc');
    const leads$ = this.http
      .get<Page<Lead>>(`${environment.apiUrl}/leads`, { params })
      .pipe(catchError(() => of({ content: [] } as unknown as Page<Lead>)));
    const clients$ = this.http
      .get<Page<Client>>(`${environment.apiUrl}/clients`, { params })
      .pipe(catchError(() => of({ content: [] } as unknown as Page<Client>)));

    return forkJoin({ leads: leads$, clients: clients$ }).pipe(
      map(({ leads, clients }) => {
        const mapped: CrmSearchResult[] = [
          ...(leads?.content || []).map((l) => ({
            type: 'LEAD' as const,
            id: String(l.id),
            name: l.name || `${l.firstName || ''} ${l.lastName || ''}`.trim() || l.email,
            phone: l.phone,
            email: l.email,
            subtitle: l.companyName || l.email,
          })),
          ...(clients?.content || []).map((c) => ({
            type: 'CLIENT' as const,
            id: String(c.id),
            name: c.name,
            phone: c.phone,
            email: c.email,
            subtitle: c.companyName || c.email,
          })),
        ];
        return this.filterCrmResults(mapped, query).slice(0, limit);
      }),
    );
  }

  /** Human-readable label stored on the conversation after linking. */
  linkLabel(type: WaLinkedType, name: string): string {
    const prefix =
      type === 'LEAD' ? 'Lead' : type === 'CLIENT' ? 'Cliente' : type === 'PROSPECT' ? 'Prospect' : 'Contato';
    return `${prefix} · ${name}`;
  }

  /** Router path to the CRM record's detail page, or null when not navigable. */
  linkedRoute(type?: WaLinkedType | null, id?: string | null): string | null {
    if (!type || !id) return null;
    if (type === 'LEAD') return `/leads/${id}`;
    if (type === 'CLIENT') return `/clients/${id}`;
    return null;
  }

  private filterCrmResults(items: CrmSearchResult[], query: string): CrmSearchResult[] {
    const q = (query || '').trim().toLowerCase();
    if (!q) return items;
    const digits = q.replace(/\D/g, '');
    return items.filter(
      (r) =>
        (r.name || '').toLowerCase().includes(q) ||
        (r.email || '').toLowerCase().includes(q) ||
        (r.subtitle || '').toLowerCase().includes(q) ||
        (digits.length >= 3 && (r.phone || '').replace(/\D/g, '').includes(digits)),
    );
  }

  private markMockMessageRead(messageId: string): void {
    Object.values(this.mockMessages).forEach((list) => {
      list.forEach((m) => {
        if (m.id === messageId) m.isRead = true;
      });
    });
  }

  private markMockConversationRead(phone: string): void {
    const conv = this.mockConversations.find((c) => c.phone === phone);
    if (conv) conv.unreadCount = 0;
    (this.mockMessages[phone] || []).forEach((m) => {
      m.isRead = true;
    });
  }

  private applyMockLink(
    phone: string,
    type: WaLinkedType | null,
    id: string | null,
    label: string | null,
  ): ConversationSummary | null {
    const conv = this.mockConversations.find((c) => c.phone === phone);
    if (!conv) return null;
    conv.linkedType = type;
    conv.linkedId = id;
    conv.linkedLabel = label;
    return { ...conv };
  }

  private initials(name: string): string {
    const parts = (name || '?').trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  formatPhone(phone: string): string {
    const d = (phone || '').replace(/\D/g, '');
    if (d.length === 13 && d.startsWith('55')) {
      return `+55 (${d.slice(2, 4)}) ${d.slice(4, 9)}-${d.slice(9)}`;
    }
    if (d.length === 11) {
      return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    }
    return phone;
  }
}
