import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-partner-portal',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="portal-container">
      <div class="portal-header">
        <mat-icon class="portal-logo">handshake</mat-icon>
        <div class="title-area">
          <h1>Portal do Parceiro / Indicador</h1>
          <p>Consulte suas comissões, taxas de indicação e datas de pagamento estimadas (D+30)</p>
        </div>
      </div>

      <!-- Quick summary cards -->
      <div class="summary-cards" *ngIf="!loading">
        <div class="summary-card glass-panel">
          <span class="label">Comissões Recebidas</span>
          <span class="value">{{ totalPaid | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
        </div>
        <div class="summary-card glass-panel">
          <span class="label">A Receber (Agendadas)</span>
          <span class="value pending">{{ totalPending | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</span>
        </div>
      </div>

      <div class="loading-spinner" *ngIf="loading">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Carregando comissões...</p>
      </div>

      <div class="content-area" *ngIf="!loading">
        <div class="no-data glass-panel" *ngIf="commissions.length === 0">
          <mat-icon>monetization_on</mat-icon>
          <p>Nenhuma comissão registrada para sua conta ainda.</p>
        </div>

        <div class="table-card glass-panel" *ngIf="commissions.length > 0">
          <table mat-table [dataSource]="commissions" class="w-100">
            <ng-container matColumnDef="proposal">
              <th mat-header-cell *matHeaderCellDef>Proposta / Negócio</th>
              <td mat-cell *matCellDef="let row">
                {{ row.proposalTitle || 'Indicação Comercial' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Valor da Comissão</th>
              <td mat-cell *matCellDef="let row" class="amount-col">
                {{ row.amount | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="availableAt">
              <th mat-header-cell *matHeaderCellDef>Data de Liberação</th>
              <td mat-cell *matCellDef="let row">
                {{ row.availableAt ? (row.availableAt | date:'dd/MM/yyyy') : 'Sob confirmação' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let row">
                <span class="status-badge" [attr.data-status]="row.paid ? 'PAID' : 'PENDING'">
                  {{ row.paid ? 'Pago' : 'Pendente (D+30)' }}
                </span>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .portal-container {
      padding: 32px;
      max-width: 900px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .portal-header {
      display: flex;
      align-items: center;
      gap: 16px;
      background: linear-gradient(135deg, #0d9488, #115e59);
      color: #ffffff;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);

      .portal-logo {
        font-size: 40px;
        width: 40px;
        height: 40px;
        color: #99f6e4;
      }

      .title-area {
        h1 {
          font-size: 24px;
          margin: 0 0 4px 0;
          font-weight: 700;
        }
        p {
          font-size: 13px;
          color: #ccfbf1;
          margin: 0;
        }
      }
    }

    .summary-cards {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;

      @media (max-width: 480px) {
        grid-template-columns: 1fr;
      }

      .summary-card {
        padding: 20px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(10px);
        border: 1px solid var(--hairline);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        display: flex;
        flex-direction: column;
        gap: 4px;

        .label {
          font-size: 11px;
          font-weight: 600;
          color: var(--muted);
          text-transform: uppercase;
        }

        .value {
          font-size: 24px;
          font-weight: 800;
          color: #0d9488;

          &.pending {
            color: #b45309;
          }
        }
      }
    }

    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 60px;
      gap: 12px;
      color: var(--muted);
    }

    .no-data {
      padding: 40px;
      text-align: center;
      border-radius: 12px;
      color: var(--muted);
      
      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 12px;
      }
    }

    .table-card {
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(10px);
      border: 1px solid var(--hairline);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      overflow: hidden;
      padding: 8px;

      .w-100 {
        width: 100%;
      }

      th {
        font-size: 11px;
        text-transform: uppercase;
        font-weight: 600;
        color: var(--muted);
      }

      td {
        font-size: 13px;
        color: var(--body);
      }

      .amount-col {
        font-weight: 700;
      }

      .status-badge {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 700;
        background: var(--bg-elevated);
        color: var(--body);

        &[data-status="PAID"] {
          background: rgba(16, 185, 129, 0.16);
          color: #047857;
        }

        &[data-status="PENDING"] {
          background: rgba(245, 158, 11, 0.12);
          color: #b45309;
        }
      }
    }
  `]
})
export class PartnerPortalComponent implements OnInit {
  commissions: any[] = [];
  loading = true;
  totalPaid = 0;
  totalPending = 0;

  displayedColumns: string[] = ['proposal', 'amount', 'availableAt', 'status'];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Fetch commissions for partner portal
    this.http.get<any>(`${environment.apiUrl}/commissions?size=20`).subscribe({
      next: (res) => {
        this.commissions = res.content || [];
        this.calculateTotals();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private calculateTotals(): void {
    this.totalPaid = this.commissions.filter(c => c.paid).reduce((sum, c) => sum + c.amount, 0);
    this.totalPending = this.commissions.filter(c => !c.paid).reduce((sum, c) => sum + c.amount, 0);
  }
}
