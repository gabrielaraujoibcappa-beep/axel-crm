import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Subject, interval, takeUntil, switchMap, takeWhile } from 'rxjs';
import {
  WhatsappService,
  ConversationSummary,
  WhatsAppMessage,
  WhatsAppStatus,
  WaFilter,
  CrmSearchResult,
} from './whatsapp.service';
import {
  WhatsappLinkDialogComponent,
  WhatsappLinkDialogData,
} from './whatsapp-link-dialog.component';
import { WhatsappQrDialogComponent } from './whatsapp-qr-dialog.component';

@Component({
  selector: 'app-whatsapp-inbox',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  templateUrl: './whatsapp-inbox.component.html',
  styleUrl: './whatsapp-inbox.component.scss',
})
export class WhatsappInboxComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesEnd') messagesEnd?: ElementRef<HTMLDivElement>;
  @ViewChild('composerInput') composerInput?: ElementRef<HTMLTextAreaElement>;

  conversations: ConversationSummary[] = [];
  filtered: ConversationSummary[] = [];
  messages: WhatsAppMessage[] = [];
  selected: ConversationSummary | null = null;
  status: WhatsAppStatus | null = null;

  search = '';
  draft = '';
  filter: WaFilter = 'all';
  linking = false;
  loadingList = true;
  loadingChat = false;
  sending = false;
  mobileShowChat = false;
  connecting = false;

  private destroy$ = new Subject<void>();
  private shouldScroll = false;
  private pollMs = 5000;
  private qrDialogRef: MatDialogRef<WhatsappQrDialogComponent> | null = null;

  constructor(
    private wa: WhatsappService,
    private snack: MatSnackBar,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.refreshStatus();
    this.loadConversations();

    interval(this.pollMs)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.refreshStatus(true);
        this.loadConversations(true);
        if (this.selected) {
          this.loadMessages(this.selected.phone, true);
        }
      });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get totalUnread(): number {
    return this.conversations.reduce((s, c) => s + (c.unreadCount || 0), 0);
  }

  get isConnected(): boolean {
    return this.status?.status === 'CONNECTED';
  }

  get isDisconnected(): boolean {
    return !this.status || this.status.status === 'DISCONNECTED';
  }

  get isConnecting(): boolean {
    return this.status?.status === 'CONNECTING' || this.connecting;
  }

  get isDemo(): boolean {
    return this.wa.useMock;
  }

  refreshStatus(silent = false): void {
    this.wa.getStatus().subscribe({
      next: (s) => {
        this.status = s;
        if (s.status === 'CONNECTED') this.connecting = false;
      },
      error: () => {
        if (!silent) {
          this.status = { status: 'DISCONNECTED' };
          this.snack.open('Não foi possível consultar o status do WhatsApp.', 'Fechar', {
            duration: 4000,
          });
        }
      },
    });
  }

  loadConversations(silent = false): void {
    if (!silent) this.loadingList = true;
    this.wa.getConversations().subscribe({
      next: (list) => {
        this.conversations = list;
        this.applyFilter();
        this.loadingList = false;
        if (this.selected) {
          const updated = list.find((c) => c.phone === this.selected!.phone);
          if (updated) this.selected = updated;
        }
      },
      error: () => {
        this.loadingList = false;
        if (!silent) {
          this.snack.open('Não foi possível carregar as conversas.', 'Fechar', {
            duration: 4000,
          });
        }
      },
    });
  }

  applyFilter(): void {
    const q = this.search.trim().toLowerCase();
    this.filtered = this.conversations.filter((c) => {
      if (this.filter === 'unread' && !(c.unreadCount > 0)) return false;
      if (this.filter === 'unlinked' && c.linkedId) return false;
      if (!q) return true;
      return (
        (c.contactName || '').toLowerCase().includes(q) ||
        (c.phone || '').includes(q) ||
        (c.lastMessage || '').toLowerCase().includes(q)
      );
    });
  }

  setFilter(filter: WaFilter): void {
    this.filter = filter;
    this.applyFilter();
  }

  get unlinkedCount(): number {
    return this.conversations.filter((c) => !c.linkedId).length;
  }

  get unreadConvCount(): number {
    return this.conversations.filter((c) => c.unreadCount > 0).length;
  }

  selectConversation(conv: ConversationSummary): void {
    this.selected = conv;
    this.mobileShowChat = true;
    this.loadMessages(conv.phone, false, true);
    conv.unreadCount = 0;
  }

  /** Persists read state for every unread inbound message of the open chat. */
  private markConversationRead(phone: string, msgs: WhatsAppMessage[]): void {
    const unreadIds = msgs
      .filter((m) => m.direction === 'INBOUND' && m.isRead !== true)
      .map((m) => m.id);
    if (unreadIds.length === 0 && !this.wa.useMock) return;
    this.wa.markConversationRead(phone, unreadIds).subscribe({
      next: () => {
        this.messages = this.messages.map((m) =>
          m.direction === 'INBOUND' ? { ...m, isRead: true } : m,
        );
        this.loadConversations(true);
      },
      error: () => {
        this.snack.open('Não foi possível marcar a conversa como lida.', 'Fechar', {
          duration: 3500,
        });
      },
    });
  }

  backToList(): void {
    this.mobileShowChat = false;
  }

  loadMessages(phone: string, silent = false, markRead = false): void {
    if (!silent) this.loadingChat = true;
    this.wa.getMessages(phone).subscribe({
      next: (msgs) => {
        const prevLen = this.messages.length;
        this.messages = msgs;
        this.loadingChat = false;
        if (!silent || msgs.length !== prevLen) {
          this.shouldScroll = true;
        }
        if (markRead) this.markConversationRead(phone, msgs);
      },
      error: () => {
        this.loadingChat = false;
        if (!silent) {
          this.snack.open('Não foi possível carregar o histórico.', 'Fechar', {
            duration: 3500,
          });
        }
      },
    });
  }

  send(): void {
    const text = this.draft.trim();
    if (!text || !this.selected || this.sending) return;
    if (!this.isConnected) {
      this.snack.open(
        'WhatsApp desconectado. Conecte o gateway para enviar mensagens.',
        'Fechar',
        { duration: 4000 },
      );
      return;
    }

    this.sending = true;
    const phone = this.selected.phone;
    this.wa.sendMessage(phone, text).subscribe({
      next: (msg) => {
        this.messages = [...this.messages, msg];
        this.draft = '';
        this.sending = false;
        this.shouldScroll = true;
        this.loadConversations(true);
        // Soft status upgrade for UX
        setTimeout(() => {
          const m = this.messages.find((x) => x.id === msg.id);
          if (m && m.status === 'SENT') m.status = 'DELIVERED';
        }, 900);
      },
      error: () => {
        this.sending = false;
        this.snack.open('Falha ao enviar mensagem.', 'Fechar', { duration: 3500 });
      },
    });
  }

  onComposerKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  connectGateway(): void {
    this.connecting = true;
    this.wa.connect().subscribe({
      next: (s) => {
        this.status = s;
        if (s.status === 'CONNECTED') {
          this.connecting = false;
          this.snack.open('WhatsApp conectado.', 'Fechar', { duration: 3000 });
          return;
        }
        if (s.status === 'CONNECTING') {
          if (s.qrcode) {
            this.openQrDialog(s.qrcode);
          } else {
            this.snack.open('Aguardando leitura do QR code…', 'Fechar', { duration: 3000 });
          }
          this.pollUntilConnected();
        }
      },
      error: (err: HttpErrorResponse) => {
        this.connecting = false;
        const message =
          err.status === 404
            ? 'Nenhuma integração de WhatsApp configurada para esta organização.'
            : 'Não foi possível iniciar a conexão.';
        this.snack.open(message, 'Fechar', { duration: 5000 });
      },
    });
  }

  /** Reabre o modal se o usuário fechou a janela antes de parear. */
  reopenQrDialog(): void {
    const qrcode = this.status?.qrcode;
    if (!qrcode) {
      this.snack.open('Nenhum QR code disponível. Clique em conectar novamente.', 'Fechar', {
        duration: 4000,
      });
      return;
    }
    this.connecting = true;
    this.openQrDialog(qrcode);
  }

  /** Abre o QR em modal e para o polling se o usuário desistir e fechar a janela. */
  private openQrDialog(qrcode: string): void {
    this.qrDialogRef = this.dialog.open(WhatsappQrDialogComponent, {
      data: { qrcode },
      width: '420px',
      maxWidth: '95vw',
      autoFocus: 'dialog',
      restoreFocus: true,
      ariaLabel: 'Conectar WhatsApp lendo o QR code',
    });

    this.qrDialogRef.afterClosed().subscribe(() => {
      this.qrDialogRef = null;
      this.connecting = false;
    });
  }

  /** Consulta o gateway até o pareamento concluir; fecha o modal ao conectar. */
  private pollUntilConnected(): void {
    interval(2000)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.wa.getStatus()),
        takeWhile((st) => st.status !== 'CONNECTED', true),
      )
      .subscribe((st) => {
        this.status = st;
        if (st.status !== 'CONNECTED') return;
        this.connecting = false;
        this.qrDialogRef?.close();
        this.snack.open('WhatsApp conectado.', 'Fechar', { duration: 3000 });
      });
  }

  disconnectGateway(): void {
    this.wa.disconnect().subscribe({
      next: (s) => {
        this.status = s;
        this.snack.open('WhatsApp desconectado.', 'Fechar', { duration: 3000 });
      },
    });
  }

  /** Opens the search dialog and links the picked lead/client to this number. */
  openLinkDialog(): void {
    if (!this.selected || this.linking) return;
    const phone = this.selected.phone;
    const data: WhatsappLinkDialogData = {
      phone: this.phoneLabel(phone),
      contactName: this.selected.contactName,
    };

    this.dialog
      .open<WhatsappLinkDialogComponent, WhatsappLinkDialogData, CrmSearchResult | null>(
        WhatsappLinkDialogComponent,
        { data, autoFocus: 'first-tabbable', restoreFocus: true },
      )
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((picked) => {
        if (!picked) return;
        this.applyLink(phone, picked);
      });
  }

  private applyLink(phone: string, picked: CrmSearchResult): void {
    this.linking = true;
    // Store the raw name: the API returns the plain record name too, so the
    // "Lead · Nome" prefix is composed at render time and survives a refresh.
    this.wa.linkConversation(phone, picked.type, picked.id, picked.name).subscribe({
      next: () => {
        this.linking = false;
        this.patchConversationLink(phone, picked.type, picked.id, picked.name);
        const label = this.wa.linkLabel(picked.type, picked.name);
        this.snack.open(`Conversa vinculada a ${label}.`, 'Fechar', { duration: 3000 });
        this.loadConversations(true);
      },
      error: () => {
        this.linking = false;
        this.snack.open('Falha ao vincular a conversa.', 'Fechar', { duration: 3500 });
      },
    });
  }

  /** Removes the CRM association from the open conversation. */
  unlinkConversation(): void {
    if (!this.selected?.linkedId || this.linking) return;
    const phone = this.selected.phone;
    this.linking = true;
    this.wa.unlinkConversation(phone).subscribe({
      next: () => {
        this.linking = false;
        this.patchConversationLink(phone, null, null, null);
        this.snack.open('Vínculo removido.', 'Fechar', { duration: 3000 });
        this.loadConversations(true);
      },
      error: () => {
        this.linking = false;
        this.snack.open('Falha ao remover o vínculo.', 'Fechar', { duration: 3500 });
      },
    });
  }

  private patchConversationLink(
    phone: string,
    linkedType: ConversationSummary['linkedType'],
    linkedId: string | null,
    linkedLabel: string | null,
  ): void {
    this.conversations = this.conversations.map((c) =>
      c.phone === phone ? { ...c, linkedType, linkedId, linkedLabel } : c,
    );
    if (this.selected?.phone === phone) {
      this.selected = { ...this.selected, linkedType, linkedId, linkedLabel };
    }
    this.applyFilter();
  }

  /** Router path for the linked record, or null when it is not navigable. */
  get linkedRoute(): string | null {
    return this.wa.linkedRoute(this.selected?.linkedType, this.selected?.linkedId);
  }

  /** "Lead · Nome" / "Cliente · Nome", composed from the type and raw name. */
  get linkedDisplayLabel(): string {
    if (!this.selected?.linkedId) return '';
    const { linkedType, linkedLabel } = this.selected;
    if (!linkedLabel) return 'Registro vinculado';
    return linkedType ? this.wa.linkLabel(linkedType, linkedLabel) : linkedLabel;
  }

  formatTime(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const sameDay =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();
    if (sameDay) {
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear()
    ) {
      return 'Ontem';
    }
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }

  formatMsgTime(iso: string): string {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  statusIcon(status: string): string {
    switch (status) {
      case 'READ':
        return 'done_all';
      case 'DELIVERED':
        return 'done_all';
      case 'FAILED':
        return 'error_outline';
      case 'PENDING':
        return 'schedule';
      default:
        return 'done';
    }
  }

  statusClass(status: string): string {
    if (status === 'READ') return 'ticks-read';
    if (status === 'FAILED') return 'ticks-fail';
    return 'ticks-sent';
  }

  phoneLabel(phone: string): string {
    return this.wa.formatPhone(phone);
  }

  trackConv(_: number, c: ConversationSummary): string {
    return c.phone;
  }

  trackMsg(_: number, m: WhatsAppMessage): string {
    return m.id;
  }

  private scrollToBottom(): void {
    try {
      this.messagesEnd?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
    } catch {
      /* ignore */
    }
  }
}
