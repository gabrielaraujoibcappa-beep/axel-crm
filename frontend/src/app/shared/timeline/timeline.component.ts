import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TimelineItem } from '../../core/models/models';
import { TimelineService } from '../../core/services/timeline.service';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="timeline-root">
      <div class="add-note-section">
        <h3 class="section-title">Adicionar Comentário</h3>
        <div class="note-input-row">
          <textarea
            [(ngModel)]="noteText"
            placeholder="Escreva um comentário..."
            rows="3"
            class="note-textarea"
            (keydown.enter)="$any($event).shiftKey ? null : submitNote()">
          </textarea>
          <button mat-flat-button color="primary"
            [disabled]="!noteText.trim() || submitting"
            (click)="submitNote()"
            class="note-btn">
            <mat-icon>send</mat-icon>
            {{ submitting ? 'Enviando...' : 'Enviar' }}
          </button>
        </div>
      </div>

      <div>
        <h3 class="section-title">Histórico</h3>
        @if (loading) {
          <div class="status-msg">Carregando...</div>
        } @else if (items.length === 0) {
          <div class="status-msg empty">
            <mat-icon>history</mat-icon>
            <p>Nenhum registro de alteração ainda.</p>
          </div>
        } @else {
          <div class="timeline-list">
            @for (item of items; track item.id) {
              <div class="timeline-item">
                <div class="timeline-dot"
                  [class.dot-note]="item.type === 'NOTE'"
                  [class.dot-system]="item.type === 'SYSTEM_LOG'">
                  <mat-icon class="dot-icon">
                    {{ item.type === 'NOTE' ? 'comment' : 'auto_awesome' }}
                  </mat-icon>
                </div>
                <div class="timeline-content"
                  [class.content-note]="item.type === 'NOTE'"
                  [class.content-system]="item.type === 'SYSTEM_LOG'">
                  <div class="timeline-header">
                    <span class="timeline-user">
                      <mat-icon class="user-icon">person</mat-icon>
                      {{ item.userName || 'Sistema' }}
                    </span>
                    <span class="timeline-time">{{ formatDate(item.createdAt) }}</span>
                    <div class="flex-1"></div>
                    @if (item.type === 'NOTE') {
                      <button class="delete-btn" (click)="deleteNote(item)">
                        <mat-icon>close</mat-icon>
                      </button>
                    }
                  </div>
                  <p class="timeline-text">{{ item.content || item.action }}</p>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .timeline-root { font-family:'IBM Plex Sans',sans-serif; }
    .section-title { font-family:'Outfit',sans-serif; font-size:16px; font-weight:600; color:var(--ink); margin:0 0 16px 0; }
    .status-msg { text-align:center; padding:32px 0; color:var(--muted); font-size:13px; }
    .status-msg.empty mat-icon { font-size:40px; width:40px; height:40px; margin-bottom:8px; opacity:0.4; }
    .status-msg.empty p { margin:0; }
    .timeline-list { position:relative; padding-left:32px; }
    .timeline-list::before { content:''; position:absolute; left:16px; top:4px; bottom:0; width:2px; background:var(--hairline); border-radius:1px; }
    .timeline-item { position:relative; margin-bottom:20px; }
    .timeline-dot { position:absolute; left:-32px; top:4px; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; z-index:1; }
    .dot-note { background:var(--primary); }
    .dot-system { background:#14b8a6; }
    .dot-icon { font-size:16px; width:16px; height:16px; color:#fff; }
    .timeline-content { padding:12px 16px; border-radius:12px; border:1px solid var(--hairline); background:var(--card-bg); transition:box-shadow 0.2s; }
    .timeline-content:hover { box-shadow:0 2px 12px rgba(0,0,0,0.1); }
    .content-note { border-left:3px solid var(--primary); }
    .content-system { border-left:3px solid #14b8a6; }
    .timeline-header { display:flex; align-items:center; gap:8px; margin-bottom:6px; }
    .timeline-user { font-size:12px; font-weight:600; color:var(--ink); display:flex; align-items:center; gap:4px; }
    .user-icon { font-size:14px; width:14px; height:14px; color:var(--muted); }
    .timeline-time { font-size:11px; color:var(--muted); }
    .delete-btn { width:20px; height:20px; line-height:20px; display:inline-flex; align-items:center; justify-content:center; border:none; background:transparent; cursor:pointer; border-radius:4px; }
    .delete-btn mat-icon { font-size:14px; width:14px; height:14px; color:var(--muted); }
    .delete-btn:hover { background:rgba(239,68,68,0.1); }
    .delete-btn:hover mat-icon { color:#ef4444; }
    .timeline-text { margin:0; font-size:13px; color:var(--body); word-break:break-word; line-height:1.5; }
    .add-note-section { margin-bottom:24px; padding-bottom:24px; border-bottom:1px solid var(--hairline); }
    .note-input-row { display:flex; gap:12px; align-items:flex-start; }
    .note-textarea { flex:1; padding:10px 14px; border-radius:12px; border:1px solid var(--hairline); background:var(--bg-elevated); color:var(--ink); font-family:'IBM Plex Sans',sans-serif; font-size:13px; line-height:1.5; resize:vertical; min-height:64px; transition:border-color 0.2s; outline:none; }
    .note-textarea:focus { border-color:var(--primary); }
    .note-textarea::placeholder { color:var(--muted); }
    .note-btn { white-space:nowrap; min-width:100px; margin-top:4px; }
    .flex-1 { flex:1; }
  `]
})
export class TimelineComponent implements OnInit {
  @Input() entityType = '';
  @Input() entityId = '';

  items: TimelineItem[] = [];
  loading = false;
  noteText = '';
  submitting = false;

  constructor(
    private timelineService: TimelineService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadTimeline();
  }

  loadTimeline(): void {
    if (!this.entityType || !this.entityId) return;
    this.loading = true;
    this.timelineService.getTimeline(this.entityType, this.entityId).subscribe({
      next: (data) => { this.items = data; this.loading = false; },
      error: () => { this.loading = false; this.snackBar.open('Erro ao carregar histórico.', 'OK', { duration: 3000 }); }
    });
  }

  submitNote(): void {
    if (!this.noteText.trim() || !this.entityType || !this.entityId) return;
    this.submitting = true;
    this.timelineService.addNote(this.entityType, this.entityId, this.noteText.trim()).subscribe({
      next: () => {
        this.noteText = '';
        this.submitting = false;
        this.loadTimeline();
        this.snackBar.open('Comentário adicionado!', 'OK', { duration: 3000 });
      },
      error: () => {
        this.submitting = false;
        this.snackBar.open('Erro ao adicionar comentário.', 'OK', { duration: 3000 });
      }
    });
  }

  deleteNote(item: TimelineItem): void {
    if (!confirm('Deseja excluir este comentário?')) return;
    this.timelineService.deleteNote(this.entityType, this.entityId, item.id).subscribe({
      next: () => {
        this.loadTimeline();
        this.snackBar.open('Comentário excluído.', 'OK', { duration: 3000 });
      },
      error: () => this.snackBar.open('Erro ao excluir comentário.', 'OK', { duration: 3000 })
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Agora';
    if (diffMin < 60) return `Há ${diffMin}min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `Há ${diffH}h`;
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
  }
}
