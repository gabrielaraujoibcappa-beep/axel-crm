import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormDialogComponent, FieldDef, FormDialogData } from '../../shared/form-dialog/form-dialog.component';
import { BaseService } from '../../core/services/base.service';
import { Proposal, Page } from '../../core/models/models';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-proposals-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    DragDropModule,
    MatCardModule,
    MatChipsModule,
    MatButtonToggleModule,
  ],
  template: `
    <div class="flex flex-col h-full" style="font-family:'IBM Plex Sans',sans-serif;">
      <div class="proposals-header">
        <h1 style="margin:0;font-family:'Outfit',sans-serif;font-size:24px;font-weight:700;color:var(--ink);">Propostas Comerciais</h1>
        <div class="flex items-center gap-4">
          <mat-button-toggle-group [(ngModel)]="viewMode" aria-label="Modo de visualização">
            <mat-button-toggle value="kanban"><mat-icon>view_kanban</mat-icon></mat-button-toggle>
            <mat-button-toggle value="list"><mat-icon>view_list</mat-icon></mat-button-toggle>
          </mat-button-toggle-group>
          <button mat-flat-button color="primary" (click)="openDialog()">
            <mat-icon>add</mat-icon> Nova Proposta
          </button>
        </div>
      </div>

      @if (loading) {
        <div style="display:flex;justify-content:center;padding:80px 0;">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (viewMode === 'list') {
        <div class="list-page" style="max-width:1200px;margin:0 auto;padding:24px;">
          <div class="table-container" style="overflow-x:auto;border-radius:16px;background:var(--card-bg);border:1px solid var(--hairline);box-shadow:0 4px 20px rgba(0,0,0,0.1);">
            <table mat-table [dataSource]="items" matSort (matSortChange)="onSort($event)" style="width:100%;">
              <ng-container matColumnDef="proposalCode">
                <th mat-header-cell *matHeaderCellDef mat-sort-header style="color:var(--primary);font-weight:700;font-size:11.5px;text-transform:uppercase;letter-spacing:0.8px;background:var(--bg-elevated);border-bottom:1px solid var(--hairline);padding:16px;">Código</th>
                <td mat-cell *matCellDef="let row" style="padding:16px;font-weight:700;font-size:13px;color:var(--primary);border-bottom:1px solid var(--hairline);">{{ row.proposalCode || 'N/A' }}</td>
              </ng-container>
              <ng-container matColumnDef="title">
                <th mat-header-cell *matHeaderCellDef mat-sort-header style="color:var(--primary);font-weight:700;font-size:11.5px;text-transform:uppercase;letter-spacing:0.8px;background:var(--bg-elevated);border-bottom:1px solid var(--hairline);padding:16px;">Título</th>
                <td mat-cell *matCellDef="let row" style="padding:16px;font-weight:500;font-size:13px;color:var(--ink);border-bottom:1px solid var(--hairline);">{{ row.title }}</td>
              </ng-container>
              <ng-container matColumnDef="clientName">
                <th mat-header-cell *matHeaderCellDef mat-sort-header style="color:var(--primary);font-weight:700;font-size:11.5px;text-transform:uppercase;letter-spacing:0.8px;background:var(--bg-elevated);border-bottom:1px solid var(--hairline);padding:16px;">Cliente</th>
                <td mat-cell *matCellDef="let row" style="padding:16px;font-size:13px;color:var(--body);border-bottom:1px solid var(--hairline);">{{ row.clientName }}</td>
              </ng-container>
              <ng-container matColumnDef="totalAmount">
                <th mat-header-cell *matHeaderCellDef mat-sort-header style="color:var(--primary);font-weight:700;font-size:11.5px;text-transform:uppercase;letter-spacing:0.8px;background:var(--bg-elevated);border-bottom:1px solid var(--hairline);padding:16px;">Valor Total</th>
                <td mat-cell *matCellDef="let row" style="padding:16px;font-weight:600;font-size:13px;color:var(--ink);border-bottom:1px solid var(--hairline);">{{ formatCurrency(row.totalAmount) }}</td>
              </ng-container>
              <ng-container matColumnDef="validUntil">
                <th mat-header-cell *matHeaderCellDef mat-sort-header style="color:var(--primary);font-weight:700;font-size:11.5px;text-transform:uppercase;letter-spacing:0.8px;background:var(--bg-elevated);border-bottom:1px solid var(--hairline);padding:16px;">Válida Até</th>
                <td mat-cell *matCellDef="let row" style="padding:16px;font-size:13px;color:var(--body);border-bottom:1px solid var(--hairline);">{{ (row.validUntil | date:'dd/MM/yyyy') || 'N/A' }}</td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header style="color:var(--primary);font-weight:700;font-size:11.5px;text-transform:uppercase;letter-spacing:0.8px;background:var(--bg-elevated);border-bottom:1px solid var(--hairline);padding:16px;">Status</th>
                <td mat-cell *matCellDef="let row" style="padding:16px;border-bottom:1px solid var(--hairline);">
                  <span class="px-2.5 py-1 rounded-full text-xs font-bold"
                    [ngClass]="{
                      'bg-green-100 text-green-700': row.status === 'ACCEPTED',
                      'bg-blue-100 text-blue-700': row.status === 'SENT',
                      'bg-gray-100 text-gray-600': row.status === 'DRAFT',
                      'bg-yellow-100 text-yellow-700': row.status === 'NEGOTIATING' || row.status === 'VIEWED',
                      'bg-red-100 text-red-700': row.status === 'REJECTED' || row.status === 'EXPIRED'
                    }">
                    {{ translateStatus(row.status) }}
                  </span>
                </td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef style="color:var(--primary);font-weight:700;font-size:11.5px;text-transform:uppercase;letter-spacing:0.8px;background:var(--bg-elevated);border-bottom:1px solid var(--hairline);padding:16px;text-align:right;">Ações</th>
                <td mat-cell *matCellDef="let row" style="padding:16px;text-align:right;border-bottom:1px solid var(--hairline);">
                  <button mat-icon-button matTooltip="Copiar Link Público" (click)="copyPublicLink(row)"><mat-icon style="color:var(--primary);">link</mat-icon></button>
                  <button mat-icon-button matTooltip="Baixar PDF" (click)="downloadPdf(row)"><mat-icon style="color:#ef4444;">picture_as_pdf</mat-icon></button>
                  @if (row.status === 'ACCEPTED') {
                    <button mat-icon-button matTooltip="Converter em Projeto" (click)="convertToProject(row)"><mat-icon style="color:#22c55e;">play_circle_outline</mat-icon></button>
                  }
                  <button mat-icon-button matTooltip="Editar" (click)="openDialog(row)"><mat-icon>edit</mat-icon></button>
                  <button mat-icon-button matTooltip="Excluir" (click)="onDelete(row)"><mat-icon style="color:#ef4444;">delete</mat-icon></button>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="displayedColumns" style="background:var(--bg-elevated);"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" style="transition:background-color 0.2s;background:transparent;border-bottom:1px solid var(--hairline);"
                (mouseenter)="$any($event.target).closest('tr').style.backgroundColor = 'var(--bg-elevated)'"
                (mouseleave)="$any($event.target).closest('tr').style.backgroundColor = 'transparent'">
              </tr>
            </table>
          </div>
          <mat-paginator
            [length]="totalElements"
            [pageSize]="pageSize"
            [pageSizeOptions]="[5, 10, 25, 50]"
            (page)="onPage($event)"
            showFirstLastButtons
            style="margin-top:16px;background:transparent;color:var(--muted);font-size:12px;">
          </mat-paginator>
        </div>
      } @else {
        <!-- KANBAN VIEW -->
        <div class="flex-1 overflow-x-auto p-6" style="background:var(--bg);">
          <div cdkDropListGroup class="kanban-board" style="min-width:max-content;display:flex;gap:20px;align-items:start;height:100%;">
            @for (stage of stages; track stage.value) {
              <div class="kanban-col">
                <div class="kanban-col-header">
                  <h3>{{ stage.label }}</h3>
                  <span class="count-badge">{{ (grouped[stage.value] || []).length }}</span>
                </div>
                <div cdkDropList [cdkDropListData]="grouped[stage.value]" (cdkDropListDropped)="drop($event, stage.value)" class="kanban-list">
                  @for (item of grouped[stage.value]; track item.id) {
                    <mat-card cdkDrag class="kanban-card">
                      <mat-card-content style="padding:16px;">
                        <div class="flex justify-between items-start" style="margin-bottom:12px;">
                          <div>
                            <div style="font-size:11px;color:var(--muted);margin-bottom:2px;">{{ item.proposalCode || 'N/A' }}</div>
                            <h4 style="font-family:'Outfit',sans-serif;font-weight:700;font-size:14px;margin:0;cursor:pointer;color:var(--ink);" (click)="openDialog(item)">{{ item.title }}</h4>
                          </div>
                          <div class="flex" style="gap:2px;flex-shrink:0;">
                            <button mat-icon-button matTooltip="Copiar Link" (click)="copyPublicLink(item)" style="width:28px;height:28px;"><mat-icon style="font-size:14px;width:14px;height:14px;">link</mat-icon></button>
                            <button mat-icon-button matTooltip="Editar" (click)="openDialog(item)" style="width:28px;height:28px;"><mat-icon style="font-size:14px;width:14px;height:14px;">edit</mat-icon></button>
                          </div>
                        </div>
                        <div style="margin-bottom:8px;">
                          <span style="font-size:12px;color:var(--muted);">{{ item.client?.name }}</span>
                        </div>
                        @if (item.totalAmount) {
                          <div class="meta-chip">
                            <mat-icon>attach_money</mat-icon>
                            {{ formatCurrency(item.totalAmount) }}
                          </div>
                        }
                        <div class="flex items-center justify-between" style="padding-top:12px;border-top:1px solid var(--hairline);margin-top:12px;">
                          @if (item.validUntil) {
                            <span style="font-size:11px;color:var(--muted);">Válida até {{ item.validUntil | date:'dd/MM/yyyy' }}</span>
                          }
                        </div>
                      </mat-card-content>
                    </mat-card>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .proposals-header { display:flex; align-items:center; justify-content:space-between; padding:16px; border-bottom:1px solid var(--hairline); background:var(--card-bg); }
    @media (max-width:768px) { .proposals-header { flex-direction:column; align-items:stretch; gap:12px; } }
    .kanban-col { width:280px; display:flex; flex-direction:column; max-height:100%; border-radius:16px; border:1px solid var(--hairline); background:var(--card-bg); box-shadow:0 4px 20px rgba(0,0,0,0.1); }
    .kanban-col-header { padding:16px 20px; border-bottom:1px solid var(--hairline); background:var(--bg-elevated); border-top-left-radius:16px; border-top-right-radius:16px; display:flex; justify-content:space-between; align-items:center; }
    .kanban-col-header h3 { font-family:'Outfit',sans-serif; font-weight:600; color:var(--ink); font-size:14px; margin:0; }
    .count-badge { background:var(--bg-elevated); color:var(--muted); font-size:11px; font-weight:600; padding:4px 10px; border-radius:9999px; border:1px solid var(--hairline); }
    .kanban-list { flex:1; padding:12px; overflow-y:auto; min-height:200px; display:flex; flex-direction:column; gap:10px; }
    .kanban-list::-webkit-scrollbar { width:6px; }
    .kanban-list::-webkit-scrollbar-thumb { background:var(--muted); border-radius:3px; }
    .kanban-card { border-radius:12px; border:1px solid var(--hairline); background:var(--card-bg); box-shadow:0 2px 8px rgba(0,0,0,0.1); transition:transform 0.2s,box-shadow 0.2s; }
    .kanban-card:hover { transform:translateY(-2px); box-shadow:0 8px 16px rgba(0,0,0,0.15); }
    .kanban-card.cdk-drag-placeholder { opacity:0.3; border:2px dashed var(--muted); background:transparent; }
    .meta-chip { display:inline-flex; align-items:center; gap:4px; padding:3px 8px; border-radius:6px; font-size:11px; font-weight:500; color:var(--muted); background:var(--bg-elevated); }
    .meta-chip mat-icon { font-size:14px; width:14px; height:14px; }
  `]
})
export class ProposalsListComponent implements OnInit {
  items: Proposal[] = [];
  totalElements = 0;
  pageSize = 10;
  page = 0;
  sort = 'createdAt,desc';
  loading = true;

  viewMode: 'list' | 'kanban' = 'list';

  stages = [
    { value: 'DRAFT', label: 'Rascunho' },
    { value: 'SENT', label: 'Enviada' },
    { value: 'VIEWED', label: 'Visualizada' },
    { value: 'NEGOTIATING', label: 'Negociando' },
    { value: 'ACCEPTED', label: 'Aceita' },
    { value: 'REJECTED', label: 'Rejeitada' },
    { value: 'EXPIRED', label: 'Expirada' },
  ];

  grouped: Record<string, Proposal[]> = {
    'DRAFT': [], 'SENT': [], 'VIEWED': [], 'NEGOTIATING': [], 'ACCEPTED': [], 'REJECTED': [], 'EXPIRED': [],
  };

  clients: any[] = [];
  users: any[] = [];
  partners: any[] = [];
  lawyers: any[] = [];
  projects: any[] = [];

  referralSources = [
    { value: '', label: 'Não informada' },
    { value: 'WEBSITE', label: 'Site' },
    { value: 'SOCIAL_MEDIA', label: 'Redes Sociais' },
    { value: 'REFERRAL', label: 'Indicação' },
    { value: 'EMAIL', label: 'Email' },
    { value: 'PHONE', label: 'Telefone' },
    { value: 'EVENT', label: 'Evento' },
    { value: 'ADVERTISEMENT', label: 'Anúncio' },
    { value: 'PARTNER', label: 'Parceiro' },
    { value: 'OTHER', label: 'Outro' },
  ];

  displayedColumns: string[] = ['proposalCode', 'title', 'clientName', 'totalAmount', 'validUntil', 'status', 'actions'];

  fields: FieldDef[] = [
    { key: 'title', label: 'Título', type: 'text', required: true },
    { key: 'description', label: 'Descrição', type: 'textarea' },
    { key: 'clientId', label: 'Cliente', type: 'select', required: true, options: [] },
    { key: 'assignedToUserId', label: 'Responsável', type: 'select', options: [] },
    { key: 'validUntil', label: 'Válida Até', type: 'date' },
    { key: 'discountAmount', label: 'Desconto', type: 'number' },

    // Dados jurídicos e periciais
    { key: 'lawyerContactId', label: 'Advogado Vinculado', type: 'select', options: [] },
    { key: 'lawyerName', label: 'Nome do Advogado (se não cadastrado)', type: 'text' },
    { key: 'expertUserId', label: 'Perito Responsável', type: 'select', options: [] },
    { key: 'technicalManagerUserId', label: 'Responsável Técnico', type: 'select', options: [] },
    { key: 'projectId', label: 'Vincular Projeto', type: 'select', options: [] },

    // Indicação e rateio de comissão
    { key: 'partnerId', label: 'Quem Indicou (Parceiro/Indicador)', type: 'select', options: [] },
    { key: 'referralSource', label: 'Origem da Indicação', type: 'select', options: this.referralSources },
    { key: 'partnerRate', label: 'Taxa Parceiro (ex: 0.05)', type: 'number' },
    { key: 'captureUserId', label: 'Captador (Captação)', type: 'select', options: [] },
    { key: 'captureRate', label: 'Taxa Captação (ex: 0.10)', type: 'number' },
    { key: 'sellerUserId', label: 'Vendedor (Vendas)', type: 'select', options: [] },
    { key: 'sellerRate', label: 'Taxa Vendas (ex: 0.10)', type: 'number' },
    { key: 'collaboratorUserId', label: 'Técnico Colaborador', type: 'select', options: [] },
    { key: 'collaboratorRate', label: 'Taxa Técnico (ex: 0.20)', type: 'number' },
    { key: 'status', label: 'Status', type: 'select', options: [
      { value: 'DRAFT', label: 'Rascunho' },
      { value: 'SENT', label: 'Enviada' },
      { value: 'VIEWED', label: 'Visualizada' },
      { value: 'NEGOTIATING', label: 'Negociando' },
      { value: 'ACCEPTED', label: 'Aceita' },
      { value: 'REJECTED', label: 'Rejeitada' },
      { value: 'EXPIRED', label: 'Expirada' }
    ]}
  ];

  constructor(
    private svc: BaseService<Proposal>,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadRelations();
  }

  private setOptions(key: string, options: { value: any; label: string }[]): void {
    const field = this.fields.find(f => f.key === key);
    if (field) field.options = options;
  }

  private userOptions(): { value: any; label: string }[] {
    return this.users.map(u => ({ value: u.id, label: u.fullName || u.name }));
  }

  loadRelations(): void {
    this.loading = true;

    // Uma lista vazia mantém o formulário utilizável mesmo se uma das origens falhar.
    const emptyOnError = (source: any) => source.pipe(catchError(() => of({ content: [] })));

    forkJoin({
      clients: emptyOnError(this.svc.getPage('clients', 0, 1000, 'name,asc')),
      users: emptyOnError(this.svc.getPage('users', 0, 1000, 'name,asc')),
      partners: emptyOnError(this.svc.getPage('partners', 0, 1000, 'name,asc')),
      contacts: emptyOnError(this.svc.getPage('contacts', 0, 1000, 'name,asc')),
      projects: emptyOnError(this.svc.getPage('projects', 0, 1000, 'name,asc')),
    }).subscribe({
      next: (res: any) => {
        const none = { value: '', label: 'Nenhum' };

        this.clients = res.clients.content ?? [];
        this.users = res.users.content ?? [];
        this.partners = res.partners.content ?? [];
        this.projects = res.projects.content ?? [];
        // O advogado é escolhido entre os contatos cadastrados com esse tipo.
        this.lawyers = (res.contacts.content ?? []).filter((c: any) => c.contactType === 'LAWYER');

        this.setOptions('clientId', this.clients.map(c => ({ value: c.id, label: c.name })));
        this.setOptions('assignedToUserId', this.userOptions());

        for (const key of ['captureUserId', 'sellerUserId', 'collaboratorUserId', 'expertUserId', 'technicalManagerUserId']) {
          this.setOptions(key, [none, ...this.userOptions()]);
        }

        this.setOptions('partnerId', [none, ...this.partners.map(p => ({ value: p.id, label: p.name }))]);
        this.setOptions('lawyerContactId', [none, ...this.lawyers.map(c => ({ value: c.id, label: c.name }))]);
        this.setOptions('projectId', [none, ...this.projects.map(p => ({ value: p.id, label: p.name }))]);

        this.load();
      },
      error: () => this.load(),
    });
  }

  load(): void {
    this.loading = true;
    this.svc.getPage('proposals', this.page, this.pageSize, this.sort).subscribe({
      next: (p: Page<Proposal>) => {
        this.items = p.content.map((item: any) => ({
          ...item,
          clientName: item.client?.name || 'Sem Cliente'
        }));
        this.totalElements = p.totalElements;
        this.groupItems();
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  groupItems(): void {
    this.grouped = { 'DRAFT': [], 'SENT': [], 'VIEWED': [], 'NEGOTIATING': [], 'ACCEPTED': [], 'REJECTED': [], 'EXPIRED': [] };
    for (const item of this.items) {
      const s = item.status || 'DRAFT';
      if (this.grouped[s]) this.grouped[s].push(item);
      else this.grouped['DRAFT'].push(item);
    }
  }

  drop(event: any, newStatus: string): void {
    if (event.previousContainer === event.container) {
      import('@angular/cdk/drag-drop').then(m => m.moveItemInArray(event.container.data, event.previousIndex, event.currentIndex));
    } else {
      import('@angular/cdk/drag-drop').then(m => {
        m.transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
        const moved = event.container.data[event.currentIndex];
        moved.status = newStatus;
        this.http.patch(`${environment.apiUrl}/proposals/${moved.id}`, { status: newStatus }).subscribe({
          error: () => { this.snackBar.open('Erro ao mudar status', 'OK', { duration: 3000 }); this.load(); }
        });
      });
    }
  }

  onPage(e: PageEvent): void {
    this.page = e.pageIndex;
    this.pageSize = e.pageSize;
    this.load();
  }

  onSort(e: Sort): void {
    this.sort = e.active && e.direction ? `${e.active},${e.direction}` : 'createdAt,desc';
    this.load();
  }

  openDialog(entity?: Proposal): void {
    const formEntity = entity ? {
      title: entity.title,
      description: entity.description,
      clientId: entity.clientId,
      assignedToUserId: entity.assignedToUserId,
      partnerId: entity.partnerId,
      validUntil: entity.validUntil,
      discountAmount: entity.discountAmount,
      status: entity.status,
      partnerRate: (entity as any).partnerRate,
      captureUserId: (entity as any).captureUserId || '',
      captureRate: (entity as any).captureRate,
      sellerUserId: (entity as any).sellerUserId || '',
      sellerRate: (entity as any).sellerRate,
      collaboratorUserId: (entity as any).collaboratorUserId || '',
      collaboratorRate: (entity as any).collaboratorRate,
      lawyerContactId: (entity as any).lawyerContactId || '',
      // Com advogado vinculado, o nome vem do contato e o campo livre fica vazio.
      lawyerName: (entity as any).lawyerContactId ? '' : ((entity as any).lawyerName || ''),
      referralSource: (entity as any).referralSource || '',
      expertUserId: (entity as any).expertUserId || (entity as any).expertUser?.id || '',
      technicalManagerUserId: (entity as any).technicalManagerUserId || (entity as any).technicalManagerUser?.id || '',
      projectId: (entity as any).projectId || '',
    } : undefined;

    const data: FormDialogData = {
      title: entity ? 'Editar Proposta' : 'Nova Proposta',
      fields: this.fields,
      entity: formEntity,
    };

    this.dialog.open(FormDialogComponent, { data, width: '520px' })
      .afterClosed()
      .subscribe(result => {
        if (!result) return;
        // Select vazio significa "sem vínculo": o backend espera null, não string vazia.
        for (const key of [
          'captureUserId', 'sellerUserId', 'collaboratorUserId', 'partnerId',
          'lawyerContactId', 'expertUserId', 'technicalManagerUserId', 'projectId', 'referralSource',
        ]) {
          if (result[key] === '') result[key] = null;
        }
        if (result.lawyerName === '') result.lawyerName = null;
        const op = entity
          ? this.svc.update('proposals', entity.id!, result)
          : this.svc.create('proposals', result);
        op.subscribe({
          next: () => {
            this.snackBar.open('Salvo com sucesso!', 'OK', { duration: 3000 });
            this.load();
          },
          error: () => this.snackBar.open('Erro ao salvar', 'OK', { duration: 3000 }),
        });
      });
  }

  onDelete(entity: Proposal): void {
    if (!confirm('Deseja excluir esta proposta?')) return;
    this.svc.delete('proposals', entity.id!).subscribe({
      next: () => {
        this.snackBar.open('Excluída!', 'OK', { duration: 3000 });
        this.load();
      },
      error: () => this.snackBar.open('Erro ao excluir', 'OK', { duration: 3000 }),
    });
  }

  downloadPdf(proposal: Proposal): void {
    const api = environment.apiUrl;
    const url = `${api}/proposals/${proposal.id}/pdf`;
    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob: Blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `proposta-${proposal.proposalCode || proposal.id}.pdf`;
        link.click();
        window.URL.revokeObjectURL(downloadUrl);
      },
      error: () => {
        this.snackBar.open('Erro ao baixar PDF da proposta.', 'OK', { duration: 3000 });
      }
    });
  }

  copyPublicLink(proposal: Proposal): void {
    if (!proposal.publicToken) {
      this.snackBar.open('Essa proposta não tem token público gerado.', 'OK', { duration: 3000 });
      return;
    }
    const publicUrl = `${window.location.origin}/public/proposals/${proposal.publicToken}`;
    navigator.clipboard.writeText(publicUrl).then(() => {
      this.snackBar.open('Link público copiado para a área de transferência!', 'OK', { duration: 3000 });
    }).catch(() => {
      this.snackBar.open('Falha ao copiar link.', 'OK', { duration: 3000 });
    });
  }

  convertToProject(proposal: Proposal): void {
    if (!confirm(`Deseja converter a proposta "${proposal.title}" em um novo Projeto?`)) return;
    const api = environment.apiUrl;
    this.http.post(`${api}/proposals/${proposal.id}/convert-to-project`, {}).subscribe({
      next: () => {
        this.snackBar.open('Convertido em Projeto com sucesso!', 'OK', { duration: 3000 });
        this.load();
      },
      error: () => {
        this.snackBar.open('Erro ao converter proposta em projeto.', 'OK', { duration: 3000 });
      }
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  translateStatus(status: string): string {
    const translations: Record<string, string> = {
      'DRAFT': 'Rascunho', 'SENT': 'Enviada', 'VIEWED': 'Visualizada',
      'NEGOTIATING': 'Negociando', 'ACCEPTED': 'Aceita', 'REJECTED': 'Rejeitada', 'EXPIRED': 'Expirada'
    };
    return translations[status] || status;
  }
}
