import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-client-portal',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="portal-container">
      <div class="portal-header">
        <mat-icon class="portal-logo">hub</mat-icon>
        <div class="title-area">
          <h1>Portal do Cliente</h1>
          <p>Acompanhe o andamento dos seus projetos e perícias judiciais</p>
        </div>
      </div>

      <div class="loading-spinner" *ngIf="loading">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Carregando seus dados...</p>
      </div>

      <div class="content-area" *ngIf="!loading">
        <div class="no-data glass-panel" *ngIf="projects.length === 0">
          <mat-icon>folder_open</mat-icon>
          <p>Nenhum projeto ativo encontrado para a sua conta.</p>
        </div>

        <div class="projects-list" *ngIf="projects.length > 0">
          <div class="project-card glass-panel" *ngFor="let p of projects">
            <div class="card-header">
              <h3>{{ p.name }}</h3>
              <span class="status-badge" [attr.data-status]="p.status">{{ p.status }}</span>
            </div>
            
            <p class="desc-text">{{ p.description || 'Sem descrição cadastrada.' }}</p>

            <div class="project-details">
              <div class="detail-item" *ngIf="p.cnjNumber">
                <mat-icon>gavel</mat-icon>
                <div>
                  <span class="label">Nº Processo CNJ</span>
                  <span class="value">{{ p.cnjNumber }}</span>
                </div>
              </div>

              <div class="detail-item" *ngIf="p.expertType">
                <mat-icon>account_balance</mat-icon>
                <div>
                  <span class="label">Atuação (Perícia)</span>
                  <span class="value">{{ p.expertType }}</span>
                </div>
              </div>

              <div class="detail-item" *ngIf="p.deliveryDeadline">
                <mat-icon>event</mat-icon>
                <div>
                  <span class="label">Prazo de Laudo</span>
                  <span class="value">{{ p.deliveryDeadline | date:'dd/MM/yyyy' }}</span>
                </div>
              </div>
            </div>
          </div>
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
      background: linear-gradient(135deg, var(--bg-elevated), var(--bg-dark));
      color: #ffffff;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);

      .portal-logo {
        font-size: 40px;
        width: 40px;
        height: 40px;
        color: #3b82f6;
      }

      .title-area {
        h1 {
          font-size: 24px;
          margin: 0 0 4px 0;
          font-weight: 700;
        }
        p {
          font-size: 13px;
          color: var(--muted);
          margin: 0;
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

    .projects-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .project-card {
      padding: 24px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(10px);
      border: 1px solid var(--hairline);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: var(--ink);
        }

        .status-badge {
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          background: var(--primary-light);
          color: var(--info);

          &[data-status="EM_ANDAMENTO"] {
            background: rgba(16, 185, 129, 0.16);
            color: #047857;
          }
          &[data-status="CONCLUIDO"] {
            background: #faf5ff;
            color: #6b21a8;
          }
        }
      }

      .desc-text {
        font-size: 13px;
        color: var(--body);
        line-height: 1.5;
        margin-bottom: 20px;
      }

      .project-details {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        background: var(--bg-elevated);
        padding: 16px;
        border-radius: 8px;
        border: 1px solid var(--hairline);

        .detail-item {
          display: flex;
          align-items: center;
          gap: 12px;

          mat-icon {
            color: var(--muted);
            font-size: 24px;
            width: 24px;
            height: 24px;
          }

          div {
            display: flex;
            flex-direction: column;

            .label {
              font-size: 10px;
              text-transform: uppercase;
              font-weight: 600;
              color: var(--muted);
            }

            .value {
              font-size: 13px;
              font-weight: 700;
              color: var(--ink);
            }
          }
        }
      }
    }
  `]
})
export class ClientPortalComponent implements OnInit {
  projects: any[] = [];
  loading = true;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Fetch all projects for the client portal.
    // If no specific client auth, load general projects list as read-only.
    this.http.get<any>(`${environment.apiUrl}/projects?size=10`).subscribe({
      next: (res) => {
        this.projects = res.content || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
