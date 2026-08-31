import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-global-timer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule
  ],
  template: `
    <div class="floating-timer-container" [class.expanded]="expanded">
      <!-- Floating Icon Trigger -->
      <button mat-fab color="accent" class="timer-trigger" (click)="toggleExpand()" [class.running]="running">
        <mat-icon>{{ running ? 'hourglass_top' : 'schedule' }}</mat-icon>
        <span class="pulse-ring" *ngIf="running"></span>
      </button>

      <!-- Expanded Panel -->
      <div class="timer-card glass-panel" *ngIf="expanded">
        <div class="timer-header">
          <h3>Cronômetro de Perícias</h3>
          <button mat-icon-button (click)="toggleExpand()"><mat-icon>close</mat-icon></button>
        </div>

        <div class="timer-body">
          <div class="time-display">{{ formatTime() }}</div>

          <mat-form-field appearance="outline" class="w-100">
            <mat-label>Projeto / Perícia</mat-label>
            <mat-select [(ngModel)]="selectedProjectId" [disabled]="running">
              <mat-option *ngFor="let p of projects" [value]="p.id">{{ p.name }}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-100" *ngIf="!running && elapsedSeconds > 0">
            <mat-label>O que você fez?</mat-label>
            <input matInput [(ngModel)]="description" placeholder="Ex: Análise de documentos CNJ" />
          </mat-form-field>

          <div class="controls-row">
            <button mat-flat-button color="primary" *ngIf="!running" (click)="start()" [disabled]="!selectedProjectId">
              <mat-icon>play_arrow</mat-icon> Iniciar
            </button>
            <button mat-flat-button color="warn" *ngIf="running" (click)="stop()">
              <mat-icon>pause</mat-icon> Pausar
            </button>
            <button mat-stroked-button color="primary" *ngIf="!running && elapsedSeconds > 0" (click)="save()">
              <mat-icon>save</mat-icon> Salvar Tempo
            </button>
            <button mat-button color="warn" *ngIf="!running && elapsedSeconds > 0" (click)="reset()">
              Descartar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .floating-timer-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 16px;

      &.expanded {
        align-items: stretch;
      }
    }

    .timer-trigger {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
      position: relative;

      &.running {
        background-color: #e11d48 !important;
        animation: spin-pulse 2s infinite ease-in-out;
      }

      .pulse-ring {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 4px solid rgba(225, 29, 72, 0.5);
        animation: pulse 1.5s infinite;
      }
    }

    .timer-card {
      width: 320px;
      border-radius: 16px;
      background: var(--card-bg);
      backdrop-filter: blur(15px);
      border: 1px solid var(--hairline-strong);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
      overflow: hidden;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;

      .timer-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: var(--ink);
        }

        button {
          color: var(--muted);
        }
      }

      .timer-body {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;

        .time-display {
          font-family: 'Courier New', Courier, monospace;
          font-size: 36px;
          font-weight: 800;
          color: var(--ink);
          letter-spacing: 2px;
          padding: 8px 16px;
          background: var(--bg-elevated);
          border-radius: 8px;
          width: 100%;
          text-align: center;
          border: 1px solid var(--hairline);
        }

        .w-100 {
          width: 100%;
        }

        .controls-row {
          display: flex;
          gap: 8px;
          width: 100%;
          justify-content: center;

          button {
            border-radius: 8px;
            font-weight: 600;
          }
        }
      }
    }

    @keyframes pulse {
      0% { transform: scale(0.95); opacity: 0.8; }
      50% { transform: scale(1.1); opacity: 0.4; }
      100% { transform: scale(1.2); opacity: 0; }
    }
  `]
})
export class GlobalTimerComponent implements OnInit, OnDestroy {
  expanded = false;
  running = false;
  elapsedSeconds = 0;
  timerInterval: any = null;

  projects: any[] = [];
  selectedProjectId = '';
  description = '';
  startTime: Date | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  loadProjects(): void {
    // Load projects list
    this.http.get<any>(`${environment.apiUrl}/projects?size=100`).subscribe({
      next: (res) => {
        this.projects = res.content || [];
      }
    });
  }

  toggleExpand(): void {
    this.expanded = !this.expanded;
    if (this.expanded) {
      this.loadProjects();
    }
  }

  start(): void {
    if (!this.selectedProjectId) return;
    this.running = true;
    this.startTime = new Date();
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds++;
    }, 1000);
  }

  stop(): void {
    this.running = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  reset(): void {
    this.stop();
    this.elapsedSeconds = 0;
    this.description = '';
    this.startTime = null;
  }

  save(): void {
    if (!this.selectedProjectId || this.elapsedSeconds === 0) return;

    const user = this.authService.currentUser;
    if (!user) {
      this.snackBar.open('Você precisa estar autenticado.', 'OK', { duration: 3000 });
      return;
    }

    const durationMin = Math.max(1, Math.round(this.elapsedSeconds / 60));
    const now = new Date();
    const start = this.startTime || new Date(now.getTime() - this.elapsedSeconds * 1000);

    const payload = {
      userId: user.id,
      projectId: this.selectedProjectId,
      startTime: start.toISOString(),
      endTime: now.toISOString(),
      durationMinutes: durationMin,
      description: this.description || 'Log de tempo via cronômetro global',
      hourlyRate: 150.00 // standard mock rate
    };

    this.http.post(`${environment.apiUrl}/time-entries`, payload).subscribe({
      next: () => {
        this.snackBar.open(`Tempo de ${durationMin} min salvo no projeto!`, 'OK', { duration: 3000 });
        this.reset();
      },
      error: () => {
        this.snackBar.open('Erro ao salvar lançamento de horas.', 'OK', { duration: 3000 });
      }
    });
  }

  formatTime(): string {
    const hrs = Math.floor(this.elapsedSeconds / 3600);
    const mins = Math.floor((this.elapsedSeconds % 3600) / 60);
    const secs = this.elapsedSeconds % 60;
    return `${this.pad(hrs)}:${this.pad(mins)}:${this.pad(secs)}`;
  }

  private pad(val: number): string {
    return String(val).padStart(2, '0');
  }
}
