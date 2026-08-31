import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { ListPageComponent, ColumnDef, KpiDef } from '../../shared/list-page/list-page.component';
import { FormDialogComponent, FieldDef, FormDialogData } from '../../shared/form-dialog/form-dialog.component';
import { BaseService } from '../../core/services/base.service';
import { Task, Page } from '../../core/models/models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-tasks-list',
  standalone: true,
  imports: [
    CommonModule,
    ListPageComponent,
    MatButtonModule,
    MatIconModule,
    DragDropModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatButtonToggleModule,
    FormsModule
  ],
  template: `
    <div class="flex flex-col h-full">
      <div class="flex items-center justify-between p-4 border-b" style="border-color: var(--hairline); background: var(--card-bg);">
        <h1 class="page-title" style="margin:0; font-family:'Outfit',sans-serif; font-size:24px; font-weight:700; color:var(--ink);">Tarefas</h1>
        <div class="flex items-center gap-4">
          <mat-button-toggle-group [(ngModel)]="viewMode" aria-label="Modo de visualização">
            <mat-button-toggle value="kanban"><mat-icon>view_kanban</mat-icon></mat-button-toggle>
            <mat-button-toggle value="list"><mat-icon>view_list</mat-icon></mat-button-toggle>
          </mat-button-toggle-group>
          <button mat-flat-button color="primary" (click)="openDialog()">
            <mat-icon>add</mat-icon> Nova Tarefa
          </button>
        </div>
      </div>

      <!-- KANBAN VIEW -->
      <div *ngIf="viewMode === 'kanban'" class="flex-1 overflow-x-auto p-6" style="background: var(--bg);">
        <div cdkDropListGroup class="kanban-board" style="min-width: max-content; display:flex; gap:20px; align-items:start; height:100%;">

          @for (stage of stages; track stage.value) {
            <div class="kanban-col">
              <div class="kanban-col-header">
                <h3>{{ stage.label }}</h3>
                <span class="count-badge">{{ (groupedTasks[stage.value] || []).length }}</span>
              </div>

              <div
                cdkDropList
                [cdkDropListData]="groupedTasks[stage.value]"
                (cdkDropListDropped)="drop($event, stage.value)"
                class="kanban-list"
              >
                @for (task of groupedTasks[stage.value]; track task.id) {
                  <mat-card cdkDrag class="kanban-card">
                    <mat-card-content style="padding:16px;">
                      <div class="flex justify-between items-start" style="margin-bottom:12px;">
                        <h4 class="card-title" style="font-family:'Outfit',sans-serif; font-weight:700; font-size:14px; margin:0; cursor:pointer; color:var(--ink);" (click)="openDialog(task)">{{ task.title }}</h4>
                        <button mat-icon-button (click)="openDialog(task)" style="flex-shrink:0; width:32px; height:32px; line-height:32px;">
                          <mat-icon style="font-size:16px; width:16px; height:16px;">edit</mat-icon>
                        </button>
                      </div>

                      <div style="margin-bottom:12px;">
                        @if (task.description) {
                          <p style="font-size:12.5px; color:var(--muted); margin:0; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">{{ task.description }}</p>
                        }
                      </div>

                      <div class="flex items-center gap-2" style="margin-bottom:8px;">
                        @if (task.dueDate) {
                          <span class="meta-chip" [class.overdue]="isOverdue(task.dueDate)">
                            <mat-icon>calendar_today</mat-icon>
                            {{ task.dueDate | date:'shortDate' }}
                          </span>
                        }
                        @if (task.priority) {
                          <span class="meta-chip" [style.background]="priorityColor(task.priority)">
                            {{ task.priority }}
                          </span>
                        }
                      </div>

                      <div class="flex items-center justify-between" style="padding-top:12px; border-top:1px solid var(--hairline);">
                        <span style="font-size:12px; color:var(--muted);">{{ task.assignedToName || 'Não atribuído' }}</span>
                        <mat-chip style="font-size:11px;" [color]="task.status === 'COMPLETED' ? 'accent' : 'primary'" selected>
                          {{ statusLabel(task.status) }}
                        </mat-chip>
                      </div>
                    </mat-card-content>
                  </mat-card>
                }
              </div>
            </div>
          }

        </div>
      </div>

      <!-- LIST VIEW -->
      <div *ngIf="viewMode === 'list'" class="flex-1 overflow-hidden" style="padding:24px;">
        <app-list-page
          [columns]="columns"
          [data]="items"
          [totalElements]="totalElements"
          [pageSize]="pageSize"
          [loading]="loading"
          [kpis]="kpis"
          emptyMessage="Nenhuma tarefa encontrada."
          emptyIcon="assignment"
          emptyActionLabel="Criar Tarefa"
          (pageChange)="onPage($event)"
          (sortChange)="onSort($event)"
          (add)="openDialog()"
          (edit)="openDialog($event)"
          (remove)="onDelete($event)"
        ></app-list-page>
      </div>
    </div>
  `,
  styles: [`
    .kanban-col {
      width: 300px;
      display: flex;
      flex-direction: column;
      max-height: 100%;
      border-radius: 16px;
      border: 1px solid var(--hairline);
      background: var(--card-bg);
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    .kanban-col-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--hairline);
      background: var(--bg-elevated);
      border-top-left-radius: 16px;
      border-top-right-radius: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .kanban-col-header h3 {
      font-family: 'Outfit', sans-serif;
      font-weight: 600;
      color: var(--ink);
      font-size: 14px;
      margin: 0;
    }
    .count-badge {
      background: var(--bg-elevated);
      color: var(--muted);
      font-size: 11px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 9999px;
      border: 1px solid var(--hairline);
    }
    .kanban-list {
      flex: 1;
      padding: 12px;
      overflow-y: auto;
      min-height: 200px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .kanban-list::-webkit-scrollbar { width: 6px; }
    .kanban-list::-webkit-scrollbar-thumb { background: var(--muted); border-radius: 3px; }
    .kanban-card {
      border-radius: 12px;
      border: 1px solid var(--hairline);
      background: var(--card-bg);
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .kanban-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.15);
    }
    .kanban-card.cdk-drag-placeholder {
      opacity: 0.3;
      border: 2px dashed var(--muted);
      background: transparent;
    }
    .meta-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 500;
      color: var(--muted);
      background: var(--bg-elevated);
    }
    .meta-chip mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }
    .meta-chip.overdue {
      color: #ef4444;
      background: rgba(239,68,68,0.12);
    }
  `]
})
export class TasksListComponent implements OnInit {
  items: Task[] = [];
  totalElements = 0;
  pageSize = 10;
  page = 0;
  sort = 'id,asc';
  loading = true;

  viewMode: 'list' | 'kanban' = 'list';

  stages = [
    { value: 'PENDING', label: 'Pendente' },
    { value: 'IN_PROGRESS', label: 'Em Progresso' },
    { value: 'BLOCKED', label: 'Bloqueado' },
    { value: 'COMPLETED', label: 'Concluído' },
    { value: 'CANCELLED', label: 'Cancelado' },
  ];

  groupedTasks: Record<string, Task[]> = {
    'PENDING': [],
    'IN_PROGRESS': [],
    'BLOCKED': [],
    'COMPLETED': [],
    'CANCELLED': [],
  };

  get kpis(): KpiDef[] {
    const pending = this.items.filter(t => t.status === 'PENDING').length;
    const inProgress = this.items.filter(t => t.status === 'IN_PROGRESS').length;
    const completed = this.items.filter(t => t.status === 'COMPLETED').length;
    return [
      { label: 'Total de Tarefas', value: this.totalElements, icon: 'assignment', color: 'var(--primary)' },
      { label: 'Pendentes', value: pending, icon: 'hourglass_empty', color: '#f59e0b' },
      { label: 'Em Andamento', value: inProgress, icon: 'sync', color: '#3b82f6' },
      { label: 'Concluídas', value: completed, icon: 'check_circle', color: '#22c55e' },
    ];
  }

  users: any[] = [];
  leads: any[] = [];
  clients: any[] = [];
  deals: any[] = [];

  columns: ColumnDef[] = [
    { key: 'title', label: 'Título' },
    { key: 'status', label: 'Status' },
    { key: 'dueDate', label: 'Prazo' },
    { key: 'assignedToName', label: 'Atribuído a' },
  ];

  fields: FieldDef[] = [
    { key: 'title', label: 'Título', type: 'text', required: true },
    { key: 'description', label: 'Descrição', type: 'textarea' },
    { key: 'status', label: 'Status', type: 'select', required: true, options: [
      { value: 'PENDING', label: 'Pendente' },
      { value: 'IN_PROGRESS', label: 'Em Progresso' },
      { value: 'BLOCKED', label: 'Bloqueado' },
      { value: 'COMPLETED', label: 'Concluído' },
      { value: 'CANCELLED', label: 'Cancelado' }
    ]},
    { key: 'dueDate', label: 'Prazo', type: 'date' },
    { key: 'assignedToUserId', label: 'Responsável', type: 'select', required: true, options: [] },
    { key: 'leadId', label: 'Lead', type: 'select', options: [] },
    { key: 'clientId', label: 'Cliente', type: 'select', options: [] },
    { key: 'dealId', label: 'Negócio', type: 'select', options: [] }
  ];

  constructor(
    private svc: BaseService<Task>,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadRelations();
  }

  loadRelations(): void {
    this.loading = true;
    forkJoin({
      usersPage: this.svc.getPage('users', 0, 1000, 'name,asc'),
      leadsPage: this.svc.getPage('leads', 0, 1000, 'name,asc'),
      clientsPage: this.svc.getPage('clients', 0, 1000, 'name,asc'),
      dealsPage: this.svc.getPage('deals', 0, 1000, 'title,asc')
    }).subscribe({
      next: (res: any) => {
        this.users = res.usersPage.content;
        this.leads = res.leadsPage.content;
        this.clients = res.clientsPage.content;
        this.deals = res.dealsPage.content;

        const userField = this.fields.find(f => f.key === 'assignedToUserId');
        if (userField) userField.options = this.users.map(u => ({ value: u.id, label: u.fullName || u.name }));

        const leadField = this.fields.find(f => f.key === 'leadId');
        if (leadField) leadField.options = [
          { value: '', label: 'Nenhum' },
          ...this.leads.map(l => ({ value: l.id, label: l.name }))
        ];

        const clientField = this.fields.find(f => f.key === 'clientId');
        if (clientField) clientField.options = [
          { value: '', label: 'Nenhum' },
          ...this.clients.map(c => ({ value: c.id, label: c.name }))
        ];

        const dealField = this.fields.find(f => f.key === 'dealId');
        if (dealField) dealField.options = [
          { value: '', label: 'Nenhum' },
          ...this.deals.map(d => ({ value: d.id, label: d.title }))
        ];

        this.load();
      },
      error: () => this.load()
    });
  }

  load(): void {
    this.loading = true;
    this.svc.getPage('tasks', this.page, this.pageSize, this.sort).subscribe({
      next: (p: Page<Task>) => {
        this.items = p.content;
        this.totalElements = p.totalElements;
        this.groupTasks();
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  groupTasks(): void {
    this.groupedTasks = {
      'PENDING': [],
      'IN_PROGRESS': [],
      'BLOCKED': [],
      'COMPLETED': [],
      'CANCELLED': [],
    };
    for (const t of this.items) {
      const status = t.status || 'PENDING';
      if (this.groupedTasks[status]) {
        this.groupedTasks[status].push(t);
      } else {
        this.groupedTasks['PENDING'].push(t);
      }
    }
  }

  drop(event: any, newStatus: string): void {
    if (event.previousContainer === event.container) {
      import('@angular/cdk/drag-drop').then(m => {
        m.moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      });
    } else {
      import('@angular/cdk/drag-drop').then(m => {
        m.transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex,
        );
        const moved = event.container.data[event.currentIndex];
        moved.status = newStatus;
        this.svc.update('tasks', moved.id!, { status: newStatus }).subscribe({
          error: () => {
            this.snackBar.open('Erro ao mudar status', 'OK', { duration: 3000 });
            this.load();
          }
        });
      });
    }
  }

  isOverdue(date: string): boolean {
    if (!date) return false;
    return new Date(date) < new Date();
  }

  priorityColor(priority: string): string {
    const colors: Record<string, string> = {
      HIGH: 'rgba(239,68,68,0.12)',
      MEDIUM: 'rgba(245,158,11,0.12)',
      LOW: 'rgba(34,197,94,0.12)',
    };
    return colors[priority] || 'var(--bg-elevated)';
  }

  statusLabel(status: string | undefined): string {
    const labels: Record<string, string> = {
      'PENDING': 'Pendente',
      'IN_PROGRESS': 'Em Progresso',
      'BLOCKED': 'Bloqueado',
      'COMPLETED': 'Concluído',
      'CANCELLED': 'Cancelado',
    };
    return labels[status || ''] || status || 'Desconhecido';
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

  openDialog(entity?: Task): void {
    const formEntity = entity ? {
      title: entity.title,
      description: entity.description,
      status: entity.status,
      dueDate: entity.dueDate ? entity.dueDate.split('T')[0] : '',
      assignedToUserId: entity.assignedToUserId,
      leadId: entity.leadId || '',
      clientId: entity.clientId || '',
      dealId: entity.dealId || '',
    } : undefined;

    const data: FormDialogData = {
      title: entity ? 'Editar Tarefa' : 'Nova Tarefa',
      fields: this.fields,
      entity: formEntity,
    };

    this.dialog.open(FormDialogComponent, { data, width: '520px' })
      .afterClosed()
      .subscribe(result => {
        if (!result) return;
        // Keep required values when a dialog field is left untouched or emits
        // an empty value while editing an existing task.
        if (entity) {
          result.title = (result.title || '').trim() || entity.title;
          result.assignedToUserId = result.assignedToUserId || entity.assignedToUserId;
          result.status = result.status || entity.status;
        }
        if (result.leadId === '') result.leadId = null;
        if (result.clientId === '') result.clientId = null;
        if (result.dealId === '') result.dealId = null;

        const op = entity
          ? this.svc.update('tasks', entity.id!, result)
          : this.svc.create('tasks', result);
        op.subscribe({
          next: () => {
            this.snackBar.open('Salvo com sucesso!', 'OK', { duration: 3000 });
            this.load();
          },
          error: () => this.snackBar.open('Erro ao salvar', 'OK', { duration: 3000 }),
        });
      });
  }

  onDelete(entity: Task): void {
    if (!confirm('Deseja excluir esta tarefa?')) return;
    this.svc.delete('tasks', entity.id!).subscribe({
      next: () => {
        this.snackBar.open('Excluída!', 'OK', { duration: 3000 });
        this.load();
      },
      error: () => this.snackBar.open('Erro ao excluir', 'OK', { duration: 3000 }),
    });
  }
}
