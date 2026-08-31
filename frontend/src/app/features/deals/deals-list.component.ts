import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';

import { ListPageComponent, ColumnDef, KpiDef } from '../../shared/list-page/list-page.component';
import { FormDialogComponent, FieldDef, FormDialogData } from '../../shared/form-dialog/form-dialog.component';
import { BaseService } from '../../core/services/base.service';
import { Deal, Page } from '../../core/models/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-deals-list',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    DragDropModule,
    ListPageComponent
  ],
  template: `
    <div class="deals-page">
      <!-- Cabeçalho Customizado -->
      <div class="deals-header">
        <div class="title-section">
          <h1 class="page-title">Negócios</h1>
          
          <!-- Seletor de Pipeline -->
          @if (pipelines.length > 0) {
            <mat-form-field appearance="outline" class="pipeline-selector">
              <mat-label>Pipeline</mat-label>
              <mat-select [value]="activePipelineId" (selectionChange)="onPipelineChange($event.value)">
                @for (p of pipelines; track p.id) {
                  <mat-option [value]="p.id">{{ p.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          }
        </div>

        <div class="actions-section">
          <!-- Alternador de Visualização -->
          <div class="view-toggle">
            <button mat-icon-button [class.active]="viewMode === 'kanban'" (click)="setViewMode('kanban')" matTooltip="Visualização Kanban">
              <mat-icon>view_kanban</mat-icon>
            </button>
            <button mat-icon-button [class.active]="viewMode === 'list'" (click)="setViewMode('list')" matTooltip="Visualização Lista">
              <mat-icon>view_list</mat-icon>
            </button>
          </div>

          <button mat-raised-button color="primary" (click)="openDialog()">
            <mat-icon>add</mat-icon>
            Novo Negócio
          </button>
        </div>
      </div>

      @if (loading) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <!-- Visualização Lista -->
        @if (viewMode === 'list') {
          <app-list-page
            [columns]="columns"
            [data]="items"
            [totalElements]="totalElements"
            [pageSize]="pageSize"
            [loading]="loading"
            [kpis]="kpis"
            emptyMessage="Nenhum negócio encontrado."
            emptyIcon="trending_up"
            emptyActionLabel="Criar Negócio"
            (pageChange)="onPage($event)"
            (sortChange)="onSort($event)"
            (add)="openDialog()"
            (edit)="openDialog($event)"
            (remove)="onDelete($event)"
          ></app-list-page>
        }

        <!-- Visualização Kanban -->
        @if (viewMode === 'kanban') {
          <div cdkDropListGroup class="kanban-board">
            @for (stage of activeStages; track stage.id) {
              <div class="kanban-column">
                <!-- Cabeçalho da Coluna -->
                <div class="column-header">
                  <div class="header-main">
                    <span class="stage-name">{{ stage.name }}</span>
                    <span class="count-badge">{{ (groupedDeals[stage.id] || []).length }}</span>
                  </div>
                  <div class="stage-total">
                    {{ getStageTotal(stage.id) | currency:'BRL':'symbol':'1.2-2' }}
                  </div>
                </div>

                <!-- Lista de Cartões (Drop Zone) -->
                <div
                  cdkDropList
                  [cdkDropListData]="groupedDeals[stage.id] || []"
                  (cdkDropListDropped)="onDragDrop($event, stage.id)"
                  class="card-list">
                  
                  @for (deal of groupedDeals[stage.id] || []; track deal.id) {
                    <div cdkDrag class="deal-card">
                      <div class="card-indicator"></div>
                      <div class="card-body">
                        <h3 class="deal-title" (click)="openDialog(deal)">{{ deal.title }}</h3>
                        <p class="deal-client">{{ deal.clientName || 'Sem cliente' }}</p>
                        
                        <div class="card-footer">
                          <span class="deal-value">{{ (deal.value || 0) | currency:'BRL':'symbol':'1.2-2' }}</span>
                          @if (deal.expectedCloseDate) {
                            <span class="deal-date" matTooltip="Previsão de Fechamento">
                              <mat-icon class="footer-icon">schedule</mat-icon>
                              {{ deal.expectedCloseDate | date:'dd/MM/yyyy' }}
                            </span>
                          }
                        </div>
                      </div>
                      
                      <div class="card-actions">
                        <button mat-icon-button (click)="openDialog(deal)" matTooltip="Editar">
                          <mat-icon>edit</mat-icon>
                        </button>
                        <button mat-icon-button color="warn" (click)="onDelete(deal)" matTooltip="Excluir">
                          <mat-icon>delete</mat-icon>
                        </button>
                      </div>
                    </div>
                  } @empty {
                    <div class="empty-column-placeholder">
                      Nenhum negócio
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .deals-page {
      padding: 24px;
      display: flex;
      flex-direction: column;
      height: calc(100vh - 100px);
      box-sizing: border-box;
      font-family: 'IBM Plex Sans', system-ui, sans-serif;
      color: var(--ink);
      background: transparent;

      @media (max-width: 768px) {
        padding: 12px;
        height: calc(100vh - 60px);
      }
    }

    .deals-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;

      @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
      }
    }

    .title-section {
      display: flex;
      align-items: center;
      gap: 24px;

      @media (max-width: 768px) {
        flex-wrap: wrap;
        gap: 12px;
      }
    }

    .page-title {
      font-family: 'Outfit', sans-serif;
      font-size: 28px;
      font-weight: 700;
      margin: 0;
      color: var(--ink);
      letter-spacing: -0.02em;

      @media (max-width: 768px) {
        font-size: 22px;
      }
    }

    .pipeline-selector {
      width: 200px;
      margin-bottom: -1.25em;

      ::ng-deep .mat-mdc-text-field-wrapper {
        background-color: var(--bg-elevated) !important;
      }
    }

    .actions-section {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .view-toggle {
      display: flex;
      background: var(--card-bg);
      border: 1px solid var(--hairline);
      border-radius: 8px;
      padding: 2px;

      button {
        border-radius: 6px;
        color: var(--muted) !important;
        width: 38px;
        height: 38px;

        &.active {
          background: var(--primary-light) !important;
          color: var(--primary) !important;
        }
      }
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      flex: 1;
      color: var(--muted);
    }

    /* Kanban Board Layout */
    .kanban-board {
      display: flex;
      gap: 24px;
      overflow-x: auto;
      flex: 1;
      align-items: stretch;
      padding-bottom: 16px;
      box-sizing: border-box;

      &::-webkit-scrollbar {
        height: 6px;
      }
      &::-webkit-scrollbar-thumb {
        background: var(--bg-elevated);
        border-radius: 3px;
      }
    }

    .kanban-column {
      flex: 0 0 320px;
      background: var(--bg-elevated);
      backdrop-filter: blur(8px);
      border-radius: 16px;
      border: 1px solid var(--hairline);
      box-shadow: 0 6px 22px rgba(0, 0, 0, 0.28);
      display: flex;
      flex-direction: column;
      max-height: 100%;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        border-color: var(--hairline-strong);
        box-shadow: 0 8px 28px rgba(0, 0, 0, 0.32);
      }
    }

    .column-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--hairline);
      background: var(--card-bg);
      border-top-left-radius: 16px;
      border-top-right-radius: 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .header-main {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stage-name {
      font-family: 'Outfit', sans-serif;
      font-weight: 600;
      font-size: 15px;
      color: var(--ink);
    }

    .count-badge {
      background: var(--bg-elevated);
      color: var(--body);
      font-size: 11px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 9999px;
      border: 1px solid var(--hairline);
    }

    .stage-total {
      font-family: 'Outfit', sans-serif;
      font-size: 13px;
      font-weight: 700;
      color: var(--success);
    }

    .card-list {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      flex: 1;
      overflow-y: auto;
      min-height: 200px;
      background: transparent;

      &::-webkit-scrollbar {
        width: 6px;
      }
      &::-webkit-scrollbar-thumb {
        background: var(--hairline-strong);
        border-radius: 3px;
      }
    }

    /* Deal Card Styling */
    .deal-card {
      background: var(--card-bg);
      border: 1px solid var(--hairline);
      border-radius: 12px;
      position: relative;
      display: flex;
      transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease, border-color 0.2s ease;
      cursor: grab;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.22);
      overflow: hidden;

      &:active {
        cursor: grabbing;
      }

      &:hover {
        transform: translateY(-3px);
        border-color: var(--hairline-strong);
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.35);
        .card-actions {
          opacity: 1;
        }
        .deal-title {
          color: var(--primary);
        }
        .card-indicator {
          background: var(--primary);
        }
      }
    }

    .card-indicator {
      width: 4px;
      flex-shrink: 0;
      background: var(--primary);
      border-radius: 12px 0 0 12px;
    }

    .card-body {
      flex: 1;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      overflow: hidden;
      min-width: 0;
    }

    .deal-title {
      font-family: 'Outfit', sans-serif;
      font-size: 14.5px;
      font-weight: 700;
      color: var(--ink);
      margin: 0;
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: color 0.2s ease;
    }

    .deal-client {
      font-size: 12.5px;
      color: var(--muted);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 8px;
      font-size: 11px;
      gap: 8px;
    }

    .deal-value {
      font-family: 'Outfit', sans-serif;
      font-weight: 700;
      color: var(--ink);
    }

    .deal-date {
      color: var(--muted);
      display: flex;
      align-items: center;
      gap: 3px;
    }

    .footer-icon {
      font-size: 13px;
      width: 13px;
      height: 13px;
      color: var(--muted);
    }

    .card-actions {
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 4px;
      opacity: 0;
      transition: opacity 0.2s;
      border-left: 1px solid var(--hairline);
      background: var(--bg-elevated);

      button {
        width: 32px;
        height: 32px;
        line-height: 32px;
        color: var(--body) !important;

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }
      }
    }

    .empty-column-placeholder {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 80px;
      border: 1px dashed var(--hairline-strong);
      border-radius: 8px;
      color: var(--muted);
      font-size: 12px;
      background: var(--card-bg);
    }

    /* CDK Drag & Drop styles */
    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 12px;
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4);
      background: var(--card-bg);
      border: 1px solid var(--primary);
      color: var(--ink);

      .card-indicator {
        background: var(--primary);
      }
      .card-actions {
        display: none;
      }
    }

    .cdk-drag-placeholder {
      opacity: 0.45;
      border: 2px dashed var(--primary) !important;
      background: var(--primary-light) !important;
      box-shadow: none !important;
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .card-list.cdk-drop-list-receiving,
    .card-list.cdk-drop-list-dragging {
      background: var(--primary-light);
      border-radius: 0 0 16px 16px;
    }

    .card-list.cdk-drop-list-receiving {
      border: 1px dashed rgba(252, 110, 32, 0.4);
      border-top: none;
    }
  `]
})
export class DealsListComponent implements OnInit {
  items: Deal[] = [];
  totalElements = 0;
  pageSize = 10;
  page = 0;
  sort = 'id,asc';
  loading = true;

  get kpis(): KpiDef[] {
    const totalValue = this.items.reduce((s, d) => s + (Number(d.value || d.amount) || 0), 0);
    const won = this.items.filter(d => d.won).length;
    const active = this.items.filter(d => !d.won).length;
    return [
      { label: 'Total de Negócios', value: this.totalElements, icon: 'trending_up', color: 'var(--primary)' },
      { label: 'Ativos', value: active, icon: 'rocket_launch', color: '#FC6E20' },
      { label: 'Ganhos', value: won, icon: 'emoji_events', color: '#10b981' },
      { label: 'Valor Total', value: totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), icon: 'attach_money', color: '#f59e0b' },
    ];
  }

  // View state
  viewMode: 'list' | 'kanban' = 'kanban';
  activePipelineId = '';
  activeStages: any[] = [];
  groupedDeals: Record<string, Deal[]> = {};

  // Form options
  clients: any[] = [];
  pipelines: any[] = [];
  contacts: any[] = [];

  columns: ColumnDef[] = [
    { key: 'title', label: 'Título' },
    { key: 'clientName', label: 'Cliente' },
    { key: 'stageName', label: 'Estágio' },
    { key: 'value', label: 'Valor' },
    { key: 'expectedCloseDate', label: 'Previsão Fechamento' }
  ];

  fields: FieldDef[] = [
    { key: 'title', label: 'Título', type: 'text', required: true },
    { key: 'description', label: 'Descrição', type: 'textarea' },
    { key: 'value', label: 'Valor', type: 'number' },
    { key: 'pipelineId', label: 'Pipeline', type: 'select', required: true, options: [] },
    { key: 'stageId', label: 'Estágio', type: 'select', required: true, options: [] },
    { key: 'clientId', label: 'Cliente', type: 'select', required: true, options: [] },
    { key: 'contactId', label: 'Contato Relacionado', type: 'select', options: [] },
    { key: 'expectedCloseDate', label: 'Previsão Fechamento', type: 'date' }
  ];

  constructor(
    private svc: BaseService<Deal>,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadRelations();
  }

  loadRelations(): void {
    this.loading = true;
    this.svc.getPage('clients', 0, 1000, 'name,asc').subscribe({
      next: (cPage: any) => {
        this.clients = cPage.content;
        const cField = this.fields.find(f => f.key === 'clientId');
        if (cField) cField.options = this.clients.map(c => ({ value: c.id, label: c.name }));

        this.svc.getPage('pipelines', 0, 1000, 'name,asc').subscribe({
          next: (pPage: any) => {
            this.pipelines = pPage.content;
            const pField = this.fields.find(f => f.key === 'pipelineId');
            if (pField) pField.options = this.pipelines.map(p => ({ value: p.id, label: p.name }));

            if (!this.activePipelineId && this.pipelines.length > 0) {
              this.activePipelineId = this.pipelines[0].id;
            }

            this.svc.getPage('contacts', 0, 1000, 'name,asc').subscribe({
              next: (ctPage: any) => {
                this.contacts = ctPage.content;
                const ctField = this.fields.find(f => f.key === 'contactId');
                if (ctField) {
                  ctField.options = [{value: null, label: 'Nenhum'}, ...this.contacts.map(ct => ({ value: ct.id, label: ct.firstName + (ct.lastName ? ' ' + ct.lastName : '') }))];
                }
                this.loadStagesAndDeals();
              },
              error: () => this.loadStagesAndDeals()
            });
          },
          error: () => this.load()
        });
      },
      error: () => this.load()
    });
  }

  loadStagesAndDeals(): void {
    if (!this.activePipelineId) {
      this.loading = false;
      return;
    }

    this.loading = true;
    this.http.get<any[]>(`${environment.apiUrl}/pipelines/${this.activePipelineId}/stages`).subscribe({
      next: (stages) => {
        this.activeStages = stages.sort((a, b) => (a.position ?? a.orderIndex ?? 0) - (b.position ?? b.orderIndex ?? 0));

        // Update stage field options in forms dynamically
        const stageField = this.fields.find(f => f.key === 'stageId');
        if (stageField) {
          stageField.options = this.activeStages.map(s => ({ value: s.id, label: s.name }));
        }

        // Fetch all deals
        this.svc.getPage('deals', 0, 1000, 'createdAt,desc').subscribe({
          next: (p: Page<Deal>) => {
            this.items = p.content;
            this.totalElements = p.totalElements;

            // Group deals
            this.groupedDeals = {};
            this.activeStages.forEach(stage => {
              this.groupedDeals[stage.id] = this.items.filter(d => d.stageId === stage.id);
            });

            this.loading = false;
          },
          error: () => { this.loading = false; }
        });
      },
      error: () => { this.loading = false; }
    });
  }

  load(): void {
    this.loadStagesAndDeals();
  }

  onPipelineChange(pipelineId: string): void {
    this.activePipelineId = pipelineId;
    this.loadStagesAndDeals();
  }

  setViewMode(mode: 'list' | 'kanban'): void {
    this.viewMode = mode;
  }

  getStageTotal(stageId: string): number {
    const deals = this.groupedDeals[stageId] || [];
    return deals.reduce((sum, d) => sum + (d.value || 0), 0);
  }

  onDragDrop(event: CdkDragDrop<Deal[]>, targetStageId: string): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // visual move
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // get deal
      const deal = event.container.data[event.currentIndex];

      // update backend
      const updatedDeal: Partial<Deal> = {
        title: deal.title,
        description: deal.description,
        value: deal.value,
        pipelineId: deal.pipelineId,
        stageId: targetStageId,
        clientId: deal.clientId,
        expectedCloseDate: deal.expectedCloseDate ? deal.expectedCloseDate.split('T')[0] : undefined
      };

      this.svc.update('deals', deal.id!, updatedDeal).subscribe({
        next: (res: any) => {
          deal.stageId = targetStageId;
          deal.stageName = res.stageName;
          this.snackBar.open(`Negócio "${deal.title}" movido para "${res.stageName}"!`, 'OK', { duration: 3000 });
        },
        error: () => {
          this.snackBar.open('Erro ao atualizar estágio do negócio', 'OK', { duration: 3000 });
          this.loadRelations(); // rollback
        }
      });
    }
  }

  onPage(e: PageEvent): void {
    this.page = e.pageIndex;
    this.pageSize = e.pageSize;
    this.loadStagesAndDeals();
  }

  onSort(e: Sort): void {
    this.sort = e.active && e.direction ? `${e.active},${e.direction}` : 'id,asc';
    this.loadStagesAndDeals();
  }

  openDialog(entity?: Deal): void {
    const formEntity = entity ? {
      title: entity.title,
      description: entity.description,
      value: entity.value,
      pipelineId: entity.pipelineId,
      stageId: entity.stageId,
      clientId: entity.clientId,
      contactId: entity.contactId,
      expectedCloseDate: entity.expectedCloseDate ? entity.expectedCloseDate.split('T')[0] : '',
    } : {
      pipelineId: this.activePipelineId
    };

    const data: FormDialogData = {
      title: entity ? 'Editar Negócio' : 'Novo Negócio',
      fields: this.fields,
      entity: formEntity
    };

    this.dialog.open(FormDialogComponent, { data, width: '520px' }).afterClosed().subscribe(r => {
      if (!r) return;
      const op = entity ? this.svc.update('deals', entity.id!, r) : this.svc.create('deals', r);
      op.subscribe({
        next: () => {
          this.snackBar.open('Salvo com sucesso!', 'OK', { duration: 3000 });
          this.loadRelations();
        },
        error: () => this.snackBar.open('Erro ao salvar', 'OK', { duration: 3000 })
      });
    });
  }

  onDelete(entity: Deal): void {
    if (!confirm('Deseja excluir este negócio?')) return;
    this.svc.delete('deals', entity.id!).subscribe({
      next: () => {
        this.snackBar.open('Excluído!', 'OK', { duration: 3000 });
        this.loadRelations();
      },
      error: () => this.snackBar.open('Erro ao excluir', 'OK', { duration: 3000 })
    });
  }
}
