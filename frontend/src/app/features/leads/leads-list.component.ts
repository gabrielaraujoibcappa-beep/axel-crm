import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
import { Lead, Page } from '../../core/models/models';

@Component({
  selector: 'app-leads-list',
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
      <div class="flex items-center justify-between p-4 bg-white border-b border-gray-100">
        <h1 class="text-2xl font-bold text-[#00072d] m-0">Leads</h1>
        <div class="flex items-center gap-4">
          <mat-button-toggle-group [(ngModel)]="viewMode" aria-label="Modo de visualização">
            <mat-button-toggle value="kanban"><mat-icon>view_kanban</mat-icon></mat-button-toggle>
            <mat-button-toggle value="list"><mat-icon>view_list</mat-icon></mat-button-toggle>
          </mat-button-toggle-group>
          <button mat-flat-button color="primary" (click)="openDialog()">
            <mat-icon>add</mat-icon> Novo Lead
          </button>
        </div>
      </div>

      <!-- KANBAN VIEW -->
      <div *ngIf="viewMode === 'kanban'" class="flex-1 overflow-x-auto p-6 bg-slate-50/50">
        <div cdkDropListGroup class="kanban-board" style="min-width: max-content;">
          
          <div *ngFor="let stage of stages" class="kanban-col">
            <div class="kanban-col-header">
              <h3>{{stage.label}}</h3>
              <span class="count-badge">
                {{(groupedLeads[stage.value] || []).length}}
              </span>
            </div>
            
            <div
              cdkDropList
              [cdkDropListData]="groupedLeads[stage.value]"
              (cdkDropListDropped)="drop($event, stage.value)"
              class="kanban-list"
            >
              <mat-card *ngFor="let lead of groupedLeads[stage.value]" cdkDrag class="kanban-card">
                <mat-card-content class="p-4">
                  <div class="flex justify-between items-start mb-3">
                    <h4 class="card-title" (click)="onView(lead)">{{lead.name}}</h4>
                    <button mat-icon-button (click)="openDialog(lead)" class="scale-75 -mt-2 -mr-2 text-slate-400 hover:text-blue-600">
                      <mat-icon>edit</mat-icon>
                    </button>
                  </div>
                  
                  <div class="space-y-1.5 mb-3">
                    <div *ngIf="lead.companyName" class="meta-item">
                      <mat-icon>business</mat-icon>
                      <span class="truncate font-medium">{{lead.companyName}}</span>
                    </div>
                    <div *ngIf="lead.email" class="meta-item">
                      <mat-icon>email</mat-icon>
                      <span class="truncate">{{lead.email}}</span>
                    </div>
                    <div *ngIf="lead.estimatedValue" class="meta-item font-semibold text-slate-700">
                      <mat-icon class="text-emerald-600">payments</mat-icon>
                      <span>{{formatCurrency(lead.estimatedValue)}}</span>
                    </div>
                  </div>

                  <div class="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <span class="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-medium">{{lead.source}}</span>
                    <mat-chip [color]="lead.convertedAt ? 'accent' : 'primary'" selected class="scale-90 origin-right">
                      {{lead.convertedAt ? 'Convertido' : 'Ativo'}}
                    </mat-chip>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>

        </div>
      </div>

      <!-- LIST VIEW -->
      <div *ngIf="viewMode === 'list'" class="flex-1 overflow-hidden">
        <app-list-page
          title="Leads"
          [columns]="columns"
          [data]="items"
          [totalElements]="totalElements"
          [pageSize]="pageSize"
          [loading]="loading"
          [kpis]="kpis"
          emptyMessage="Nenhum lead encontrado."
          emptyIcon="person_add"
          emptyActionLabel="Criar Lead"
          (pageChange)="onPage($event)"
          (sortChange)="onSort($event)"
          (add)="openDialog()"
          (edit)="openDialog($event)"
          (view)="onView($event)"
          (remove)="onDelete($event)"
        ></app-list-page>
      </div>
    </div>
  `,
  styles: [`
    .kanban-board {
      display: flex;
      gap: 24px;
      height: 100%;
      align-items: start;
    }
    
    .kanban-col {
      width: 320px;
      display: flex;
      flex-direction: column;
      max-height: 100%;
      background: var(--bg-elevated);
      backdrop-filter: blur(8px);
      border-radius: 16px;
      border: 1px solid var(--hairline);
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.2);
      transition: all 0.2s ease;
      
      &:hover {
        border-color: var(--hairline-strong);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
      }
    }
    
    .kanban-col-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--hairline);
      background: var(--card-bg);
      border-top-left-radius: 16px;
      border-top-right-radius: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h3 {
        font-family: 'Outfit', sans-serif;
        font-weight: 600;
        color: var(--ink);
        font-size: 15px;
        margin: 0;
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
    }
    
    .kanban-list {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      min-height: 200px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      
      &::-webkit-scrollbar {
        width: 6px;
      }
      &::-webkit-scrollbar-thumb {
        background: var(--hairline-strong);
        border-radius: 3px;
      }
    }
    
    .kanban-card {
      background: var(--card-bg);
      border-radius: 12px;
      border: 1px solid var(--hairline);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease, border-color 0.2s ease;
      
      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
        border-color: var(--muted);
        
        .card-title {
          color: var(--primary);
        }
      }
      
      &.cdk-drag-placeholder {
        opacity: 0.3;
        border: 2px dashed var(--muted);
        background: var(--primary-light);
      }
    }
    
    .card-title {
      font-family: 'Outfit', sans-serif;
      font-weight: 700;
      color: var(--ink);
      font-size: 14.5px;
      margin: 0;
      cursor: pointer;
      transition: color 0.2s ease;
    }
    
    .meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--muted);
      font-size: 12.5px;
      
      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        color: var(--muted);
      }
    }
  `]
})
export class LeadsListComponent implements OnInit {
  items: Lead[] = [];
  totalElements = 0;
  pageSize = 100; // Load more for Kanban
  page = 0;
  sort = 'id,asc';
  loading = true;

  viewMode: 'list' | 'kanban' = 'kanban';

  get kpis(): KpiDef[] {
    const totalValue = this.items.reduce((s, l) => s + (Number(l.estimatedValue) || 0), 0);
    const converted = this.items.filter(l => l.convertedAt).length;
    const active = this.items.filter(l => !l.convertedAt).length;
    return [
      { label: 'Total de Leads', value: this.totalElements, icon: 'person_add', color: 'var(--primary)' },
      { label: 'Ativos', value: active, icon: 'trending_up', color: '#22c55e' },
      { label: 'Convertidos', value: converted, icon: 'how_to_reg', color: '#3b82f6' },
      { label: 'Valor Est.', value: totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), icon: 'payments', color: '#f59e0b' },
    ];
  }

  stages = [
    { value: 'NEW', label: 'Novo' },
    { value: 'CONTACTED', label: 'Contatado' },
    { value: 'QUALIFIED', label: 'Qualificado' },
    { value: 'PROPOSAL', label: 'Proposta' },
    { value: 'NEGOTIATION', label: 'Negociação' },
    { value: 'CONVERTED', label: 'Convertido' },
    { value: 'LOST', label: 'Perdido' }
  ];

  groupedLeads: Record<string, Lead[]> = {
    'NEW': [],
    'CONTACTED': [],
    'QUALIFIED': [],
    'PROPOSAL': [],
    'NEGOTIATION': [],
    'CONVERTED': [],
    'LOST': []
  };

  partners: any[] = [];

  columns: ColumnDef[] = [
    { key: 'name', label: 'Nome' },
    { key: 'email', label: 'Email' },
    { key: 'companyName', label: 'Empresa' },
    { key: 'stage', label: 'Estágio' },
    { key: 'source', label: 'Origem' }
  ];

  fields: FieldDef[] = [
    { key: 'name', label: 'Nome', type: 'text', required: true },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'phone', label: 'Telefone', type: 'text' },
    { key: 'companyName', label: 'Empresa', type: 'text' },
    { key: 'jobTitle', label: 'Cargo', type: 'text' },
    {
      key: 'source', label: 'Origem', type: 'select', required: true,
      options: [
        { value: 'WEBSITE', label: 'Website' },
        { value: 'SOCIAL_MEDIA', label: 'Redes Sociais' },
        { value: 'REFERRAL', label: 'Indicação' },
        { value: 'EMAIL', label: 'Email' },
        { value: 'PHONE', label: 'Telefone' },
        { value: 'EVENT', label: 'Evento' },
        { value: 'ADVERTISEMENT', label: 'Anúncio' },
        { value: 'PARTNER', label: 'Parceiro' },
        { value: 'OTHER', label: 'Outro' }
      ]
    },
    {
      key: 'stage', label: 'Estágio', type: 'select', required: true,
      options: [
        { value: 'NEW', label: 'Novo' },
        { value: 'CONTACTED', label: 'Contatado' },
        { value: 'QUALIFIED', label: 'Qualificado' },
        { value: 'PROPOSAL', label: 'Proposta' },
        { value: 'NEGOTIATION', label: 'Negociação' },
        { value: 'CONVERTED', label: 'Convertido' },
        { value: 'LOST', label: 'Perdido' }
      ]
    },
    { key: 'estimatedValue', label: 'Valor Estimado', type: 'number' },
    { key: 'partnerId', label: 'Parceiro/Indicador', type: 'select', options: [] },
    { key: 'notes', label: 'Notas', type: 'textarea' }
  ];

  constructor(
    private svc: BaseService<Lead>,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadRelations();
  }
  
  loadRelations(): void {
    this.loading = true;
    this.svc.getPage('partners', 0, 1000, 'name,asc').subscribe({
      next: (pPage: any) => {
        this.partners = pPage.content;
        const pField = this.fields.find(f => f.key === 'partnerId');
        if (pField) pField.options = this.partners.map(p => ({ value: p.id, label: p.name }));
        this.load();
      },
      error: () => this.load()
    });
  }

  load(): void {
    this.loading = true;
    this.svc.getPage('leads', this.page, this.pageSize, this.sort).subscribe({
      next: (p: Page<Lead>) => {
        this.items = p.content;
        this.totalElements = p.totalElements;
        this.groupLeads();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  groupLeads(): void {
    this.groupedLeads = {
      'NEW': [],
      'CONTACTED': [],
      'QUALIFIED': [],
      'PROPOSAL': [],
      'NEGOTIATION': [],
      'CONVERTED': [],
      'LOST': []
    };
    
    for (const lead of this.items) {
      const stage = lead.stage || 'NEW';
      if (this.groupedLeads[stage]) {
        this.groupedLeads[stage].push(lead);
      } else {
        this.groupedLeads['NEW'].push(lead);
      }
    }
  }

  drop(event: any, newStage: string) {
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
          event.currentIndex
        );
        
        const movedLead = event.container.data[event.currentIndex];
        movedLead.stage = newStage;
        
        this.svc.update('leads', movedLead.id!, { stage: newStage }).subscribe({
          error: () => {
            this.snackBar.open('Erro ao atualizar estágio do lead', 'OK', { duration: 3000 });
            this.load();
          }
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
    this.sort = e.active && e.direction ? `${e.active},${e.direction}` : 'id,asc';
    this.load();
  }

  onView(entity: Lead): void {
    this.router.navigate(['/leads', entity.id]);
  }

  openDialog(entity?: Lead): void { 
    const formEntity = entity ? { ...entity } : undefined;
    const data: FormDialogData = { title: entity ? 'Editar Lead' : 'Novo Lead', fields: this.fields, entity: formEntity }; 
    this.dialog.open(FormDialogComponent, { data, width: '520px' })
      .afterClosed()
      .subscribe(r => {
        if (!r) return;
        const op = entity ? this.svc.update('leads', entity.id!, r) : this.svc.create('leads', r);
        op.subscribe({
          next: () => {
            this.snackBar.open('Salvo com sucesso!', 'OK', { duration: 3000 });
            this.load();
          },
          error: () => this.snackBar.open('Erro ao salvar', 'OK', { duration: 3000 })
        });
      }); 
  }

  onDelete(entity: Lead): void {
    if (!confirm('Deseja excluir este lead?')) return;
    this.svc.delete('leads', entity.id!).subscribe({
      next: () => {
        this.snackBar.open('Excluído!', 'OK', { duration: 3000 });
        this.load();
      },
      error: () => this.snackBar.open('Erro ao excluir', 'OK', { duration: 3000 })
    });
  }

  formatCurrency(value: number | null | undefined): string {
    if (value == null) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }
}
