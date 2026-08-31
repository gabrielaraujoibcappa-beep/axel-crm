import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { Sort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';
import { ListPageComponent, ColumnDef } from '../../shared/list-page/list-page.component';
import { FormDialogComponent, FieldDef, FormDialogData } from '../../shared/form-dialog/form-dialog.component';
import { BankIconComponent } from '../../shared/bank-icon/bank-icon.component';
import { BaseService } from '../../core/services/base.service';
import { BankAccount, Page } from '../../core/models/models';

export const BANCOS_BRASIL_OPTIONS = [
  { value: 'Nubank', label: 'Nubank (260)' },
  { value: 'Banco do Brasil', label: 'Banco do Brasil (001)' },
  { value: 'Itaú Unibanco', label: 'Itaú Unibanco (341)' },
  { value: 'Bradesco', label: 'Banco Bradesco (237)' },
  { value: 'Caixa Econômica Federal', label: 'Caixa Econômica Federal (104)' },
  { value: 'Santander', label: 'Banco Santander (033)' },
  { value: 'Banco Inter', label: 'Banco Inter (077)' },
  { value: 'C6 Bank', label: 'C6 Bank (336)' },
  { value: 'BTG Pactual', label: 'BTG Pactual (208)' },
  { value: 'Cora', label: 'Cora SCD (403)' },
  { value: 'Sicoob', label: 'Sicoob (756)' },
  { value: 'Sicredi', label: 'Sicredi (748)' },
  { value: 'Banco Safra', label: 'Banco Safra (422)' },
  { value: 'PagBank', label: 'PagBank / PagSeguro (290)' },
  { value: 'Mercado Pago', label: 'Mercado Pago (323)' },
  { value: 'PicPay', label: 'PicPay (380)' },
  { value: 'Asaas', label: 'Asaas (461)' },
  { value: 'Stone', label: 'Stone Pagamentos (197)' },
  { value: 'Neon', label: 'Banco Neon (735)' },
  { value: 'BS2', label: 'Banco BS2 (218)' },
  { value: 'Banco Original', label: 'Banco Original (212)' },
  { value: 'Banco Pan', label: 'Banco Pan (623)' },
  { value: 'Agibank', label: 'Agibank (121)' },
  { value: 'Banco BMG', label: 'Banco BMG (318)' },
  { value: 'Efi Bank', label: 'Efi Bank / Gerencianet (249)' },
  { value: 'InfinitePay', label: 'InfinitePay / CloudWalk' },
  { value: 'XP Investimentos', label: 'XP Investimentos (102)' },
  { value: 'Rico', label: 'Rico Investimentos' },
  { value: 'Wise', label: 'Wise Brasil' },
  { value: 'Avenue', label: 'Avenue Securities' },
  { value: 'Nomad', label: 'Nomad Global' },
  { value: 'Outro', label: 'Outro Banco / Instituição' },
];

@Component({
  selector: 'app-bank-accounts-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonToggleModule,
    ListPageComponent,
    BankIconComponent
  ],
  template: `
    <div class="bank-accounts-container">
      <div class="header-section">
        <div>
          <h1 class="page-title">Contas Bancárias</h1>
          <p class="subtitle">Gerencie suas contas, saldos e integrações bancárias</p>
        </div>
        <div class="header-actions">
          <mat-button-toggle-group [(ngModel)]="viewMode" aria-label="Modo de Exibição">
            <mat-button-toggle value="cards" matTooltip="Visualização em Cartões">
              <mat-icon>grid_view</mat-icon>
            </mat-button-toggle>
            <mat-button-toggle value="table" matTooltip="Visualização em Tabela">
              <mat-icon>table_chart</mat-icon>
            </mat-button-toggle>
          </mat-button-toggle-group>
          <button mat-raised-button color="primary" (click)="openDialog()">
            <mat-icon>add</mat-icon>
            Nova Conta
          </button>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div class="kpi-grid">
        <div class="kpi-card balance">
          <div class="kpi-icon"><mat-icon>account_balance_wallet</mat-icon></div>
          <div class="kpi-info">
            <span class="kpi-value">{{ totalBalance | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
            <span class="kpi-label">Saldo Total Consolidado</span>
          </div>
        </div>
        <div class="kpi-card active-accounts">
          <div class="kpi-icon"><mat-icon>account_balance</mat-icon></div>
          <div class="kpi-info">
            <span class="kpi-value">{{ activeCount }} / {{ totalElements }}</span>
            <span class="kpi-label">Contas Ativas</span>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      @if (loading) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (items.length === 0) {
        <div class="empty-state">
          <mat-icon class="empty-icon">account_balance</mat-icon>
          <span class="empty-text">Nenhuma conta bancária cadastrada.</span>
          <button mat-raised-button color="primary" (click)="openDialog()">
            <mat-icon>add</mat-icon>
            Cadastrar Primeira Conta
          </button>
        </div>
      } @else if (viewMode === 'cards') {
        <!-- CARDS VIEW WITH BRANDED BANK LOGOS -->
        <div class="cards-grid">
          @for (acc of items; track acc.id) {
            <div class="bank-card" [class.inactive]="acc.active === false">
              <div class="card-header">
                <div class="bank-brand">
                  <app-bank-icon [name]="acc.bankName || acc.name" [size]="42" format="quadrado"></app-bank-icon>
                  <div class="bank-meta">
                    <span class="bank-name">{{ acc.bankName || 'Banco' }}</span>
                    <span class="account-name">{{ acc.name }}</span>
                  </div>
                </div>
                <div class="card-actions">
                  <button mat-icon-button matTooltip="Editar" (click)="openDialog(acc)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button matTooltip="Excluir" color="warn" (click)="onDelete(acc)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>

              <div class="card-body">
                <div class="account-details">
                  <div class="detail-item">
                    <span class="detail-label">Agência</span>
                    <span class="detail-value">{{ acc.agency || '-' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Conta</span>
                    <span class="detail-value">{{ acc.accountNumber }}</span>
                  </div>
                </div>

                <div class="balance-display">
                  <span class="balance-label">Saldo Disponível</span>
                  <span class="balance-value" [class.negative]="(acc.currentBalance ?? acc.balance ?? 0) < 0">
                    {{ (acc.currentBalance ?? acc.balance ?? 0) | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                  </span>
                </div>
              </div>

              <div class="card-footer">
                <span class="status-badge" [class.active]="acc.active !== false">
                  <span class="status-dot"></span>
                  {{ acc.active !== false ? 'Ativa' : 'Inativa' }}
                </span>
              </div>
            </div>
          }
        </div>
      } @else {
        <!-- TABLE VIEW -->
        <div class="table-card">
          <table mat-table [dataSource]="items" matSort (matSortChange)="onSort($event)">
            <ng-container matColumnDef="bankLogo">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let row" style="width: 56px;">
                <app-bank-icon [name]="row.bankName || row.name" [size]="28" format="quadrado"></app-bank-icon>
              </td>
            </ng-container>

            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Nome da Conta</th>
              <td mat-cell *matCellDef="let row"><strong>{{ row.name }}</strong></td>
            </ng-container>

            <ng-container matColumnDef="bankName">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Banco</th>
              <td mat-cell *matCellDef="let row">{{ row.bankName || '-' }}</td>
            </ng-container>

            <ng-container matColumnDef="agency">
              <th mat-header-cell *matHeaderCellDef>Agência</th>
              <td mat-cell *matCellDef="let row">{{ row.agency || '-' }}</td>
            </ng-container>

            <ng-container matColumnDef="accountNumber">
              <th mat-header-cell *matHeaderCellDef>Número</th>
              <td mat-cell *matCellDef="let row">{{ row.accountNumber }}</td>
            </ng-container>

            <ng-container matColumnDef="currentBalance">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Saldo Atual</th>
              <td mat-cell *matCellDef="let row" [style.color]="(row.currentBalance ?? row.balance ?? 0) < 0 ? '#e11d48' : '#059669'">
                <strong>{{ (row.currentBalance ?? row.balance ?? 0) | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</strong>
              </td>
            </ng-container>

            <ng-container matColumnDef="active">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let row">
                <span class="status-badge" [class.active]="row.active !== false">
                  <span class="status-dot"></span>
                  {{ row.active !== false ? 'Ativa' : 'Inativa' }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef style="text-align: right;">Ações</th>
              <td mat-cell *matCellDef="let row" style="text-align: right;">
                <button mat-icon-button matTooltip="Editar" (click)="openDialog(row)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button matTooltip="Excluir" color="warn" (click)="onDelete(row)">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <mat-paginator
            [length]="totalElements"
            [pageSize]="pageSize"
            [pageSizeOptions]="[6, 12, 24]"
            (page)="onPage($event)"
            showFirstLastButtons
          ></mat-paginator>
        </div>
      }
    </div>
  `,
  styles: [`
    .bank-accounts-container {
      padding: 24px;
      max-width: 1300px;
      margin: 0 auto;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      gap: 16px;
      flex-wrap: wrap;
    }

    .page-title {
      font-size: 26px;
      font-weight: 700;
      margin: 0;
      color: #1e293b;
    }

    .subtitle {
      font-size: 14px;
      color: #64748b;
      margin: 4px 0 0 0;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 16px;
      margin-bottom: 28px;
    }

    .kpi-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 18px 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .kpi-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #eff6ff;
      color: #2563eb;
    }

    .kpi-info {
      display: flex;
      flex-direction: column;
    }

    .kpi-value {
      font-size: 22px;
      font-weight: 700;
      color: #0f172a;
    }

    .kpi-label {
      font-size: 13px;
      color: #64748b;
      font-weight: 500;
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 20px;
    }

    .bank-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 16px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.04);
      transition: all 0.2s ease-in-out;
      position: relative;
      overflow: hidden;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 18px rgba(0,0,0,0.08);
        border-color: #cbd5e1;
      }

      &.inactive {
        opacity: 0.65;
        background: #f8fafc;
      }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .bank-brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .bank-meta {
      display: flex;
      flex-direction: column;
    }

    .bank-name {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
    }

    .account-name {
      font-size: 13px;
      color: #64748b;
    }

    .card-actions {
      display: flex;
      gap: 4px;
    }

    .account-details {
      display: flex;
      gap: 20px;
      background: #f8fafc;
      padding: 10px 14px;
      border-radius: 10px;
      margin-bottom: 14px;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
    }

    .detail-label {
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .detail-value {
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
    }

    .balance-display {
      display: flex;
      flex-direction: column;
    }

    .balance-label {
      font-size: 12px;
      color: #64748b;
      font-weight: 500;
    }

    .balance-value {
      font-size: 24px;
      font-weight: 800;
      color: #059669;

      &.negative {
        color: #e11d48;
      }
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #f1f5f9;
      padding-top: 12px;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 20px;
      background: #f1f5f9;
      color: #64748b;

      &.active {
        background: #dcfce7;
        color: #15803d;

        .status-dot {
          background: #16a34a;
        }
      }
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #94a3b8;
    }

    .table-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      overflow: hidden;
    }

    table {
      width: 100%;
    }

    .loading-container, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      background: #ffffff;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      gap: 16px;
    }

    .empty-icon {
      font-size: 54px;
      width: 54px;
      height: 54px;
      color: #94a3b8;
    }

    .empty-text {
      font-size: 16px;
      color: #64748b;
      font-weight: 500;
    }
  `]
})
export class BankAccountsListComponent implements OnInit {
  items: BankAccount[] = [];
  totalElements = 0;
  pageSize = 12;
  page = 0;
  sort = 'id,asc';
  loading = true;
  viewMode: 'cards' | 'table' = 'cards';

  displayedColumns: string[] = ['bankLogo', 'name', 'bankName', 'agency', 'accountNumber', 'currentBalance', 'active', 'actions'];

  fields: FieldDef[] = [
    { key: 'name', label: 'Nome da Conta', type: 'text', required: true },
    { key: 'bankName', label: 'Banco / Instituição', type: 'select', options: BANCOS_BRASIL_OPTIONS, required: true },
    { key: 'accountNumber', label: 'Número da Conta', type: 'text', required: true },
    { key: 'agency', label: 'Agência', type: 'text' },
    { key: 'currentBalance', label: 'Saldo Inicial', type: 'number' },
    { key: 'active', label: 'Ativo', type: 'checkbox' },
  ];

  constructor(
    private svc: BaseService<BankAccount>,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void { this.load(); }

  get totalBalance(): number {
    return this.items.reduce((acc, curr) => acc + (curr.currentBalance ?? curr.balance ?? 0), 0);
  }

  get activeCount(): number {
    return this.items.filter(i => i.active !== false).length;
  }

  load(): void {
    this.loading = true;
    this.svc.getPage('bank-accounts', this.page, this.pageSize, this.sort).subscribe({
      next: (p: Page<BankAccount>) => {
        this.items = p.content;
        this.totalElements = p.totalElements;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  onPage(e: PageEvent): void {
    this.page = e.pageIndex;
    this.pageSize = e.pageSize;
    this.load();
  }

  onSort(e: Sort): void {
    this.sort = e.active && e.direction ? `${e.active},${e.direction}` : 'id,asc';
    this.load();
  }

  openDialog(entity?: any): void {
    const formEntity = entity ? {
      name: entity.name,
      bankName: entity.bankName,
      accountNumber: entity.accountNumber,
      agency: entity.agency,
      currentBalance: entity.balance !== undefined ? entity.balance : entity.currentBalance,
      active: entity.active !== false,
    } : { active: true };

    const data: FormDialogData = {
      title: entity ? 'Editar Conta Bancária' : 'Nova Conta Bancária',
      fields: this.fields,
      entity: formEntity,
    };

    this.dialog.open(FormDialogComponent, { data, width: '540px' })
      .afterClosed()
      .subscribe(result => {
        if (!result) return;
        const op = entity
          ? this.svc.update('bank-accounts', entity.id!, result)
          : this.svc.create('bank-accounts', result);
        op.subscribe({
          next: () => {
            this.snackBar.open('Conta bancária salva com sucesso!', 'OK', { duration: 3000 });
            this.load();
          },
          error: () => this.snackBar.open('Erro ao salvar conta bancária', 'OK', { duration: 3000 }),
        });
      });
  }

  onDelete(entity: BankAccount): void {
    if (!confirm(`Deseja realmente excluir a conta "${entity.name}"?`)) return;
    this.svc.delete('bank-accounts', entity.id!).subscribe({
      next: () => {
        this.snackBar.open('Conta excluída com sucesso!', 'OK', { duration: 3000 });
        this.load();
      },
      error: () => this.snackBar.open('Erro ao excluir conta bancária', 'OK', { duration: 3000 }),
    });
  }
}
