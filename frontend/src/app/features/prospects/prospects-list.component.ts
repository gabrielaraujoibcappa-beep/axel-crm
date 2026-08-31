import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';

import { ListPageComponent, ColumnDef } from '../../shared/list-page/list-page.component';
import { FormDialogComponent, FieldDef, FormDialogData } from '../../shared/form-dialog/form-dialog.component';
import { BaseService } from '../../core/services/base.service';
import { Prospect, Page } from '../../core/models/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-prospects-list',
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
        <h1 class="text-2xl font-bold text-[#00072d] m-0">Prospecção</h1>
        <div class="flex items-center gap-4">
          <mat-button-toggle-group [(ngModel)]="viewMode" aria-label="Modo de visualização">
            <mat-button-toggle value="kanban"><mat-icon>view_kanban</mat-icon></mat-button-toggle>
            <mat-button-toggle value="list"><mat-icon>view_list</mat-icon></mat-button-toggle>
          </mat-button-toggle-group>
          <button mat-flat-button color="primary" (click)="openDialog()">
            <mat-icon>add</mat-icon> Novo Prospect
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
                {{(groupedProspects[stage.value] || []).length}}
              </span>
            </div>
            
            <div
              cdkDropList
              [cdkDropListData]="groupedProspects[stage.value]"
              (cdkDropListDropped)="drop($event, stage.value)"
              class="kanban-list"
            >
              <mat-card *ngFor="let prospect of groupedProspects[stage.value]" cdkDrag class="kanban-card">
                <mat-card-content class="p-4">
                  <div class="flex justify-between items-start mb-3">
                    <h4 class="card-title">{{prospect.name}}</h4>
                    <button mat-icon-button (click)="openDialog(prospect)" class="scale-75 -mt-2 -mr-2 text-slate-400 hover:text-blue-600">
                      <mat-icon>edit</mat-icon>
                    </button>
                  </div>
                  
                  <div class="space-y-1.5 mb-3">
                    <div *ngIf="prospect.company" class="meta-item">
                      <mat-icon>business</mat-icon>
                      <span class="truncate font-medium">{{prospect.company}}</span>
                    </div>
                    <div *ngIf="prospect.email" class="meta-item">
                      <mat-icon>email</mat-icon>
                      <span class="truncate">{{prospect.email}}</span>
                    </div>
                    <div *ngIf="prospect.phone" class="meta-item">
                      <mat-icon>phone</mat-icon>
                      <span>{{prospect.phone}}</span>
                    </div>
                  </div>

                  <div class="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <span class="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-medium">{{prospect.source}}</span>
                    <button *ngIf="!prospect.convertedLeadId" mat-stroked-button color="primary" class="scale-90 origin-right" (click)="promoteToLead(prospect)">
                      Promover
                    </button>
                    <mat-chip *ngIf="prospect.convertedLeadId" color="accent" selected class="scale-90 origin-right">Convertido</mat-chip>
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
          [columns]="columns"
          [data]="items"
          [totalElements]="totalElements"
          [pageSize]="pageSize"
          [loading]="loading"
          emptyMessage="Nenhum prospect encontrado."
          emptyIcon="person_search"
          emptyActionLabel="Criar Prospect"
          (pageChange)="onPage($event)"
          (sortChange)="onSort($event)"
          (edit)="openDialog($event)"
          (remove)="onDelete($event)"
        >
        </app-list-page>
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
export class ProspectsListComponent implements OnInit {
  items: Prospect[] = [];
  totalElements = 0;
  pageSize = 100; // Load more for Kanban
  page = 0;
  sort = 'createdAt,desc';
  loading = true;

  viewMode: 'list' | 'kanban' = 'kanban';

  stages = [
    { value: 'PROSPECTING', label: 'Prospecção' },
    { value: 'CONTACTED', label: 'Contato Realizado' },
    { value: 'WAITING_REPLY', label: 'Aguardando Resposta' }
  ];

  groupedProspects: Record<string, Prospect[]> = {
    'PROSPECTING': [],
    'CONTACTED': [],
    'WAITING_REPLY': []
  };

  columns: ColumnDef[] = [
    { key: 'name', label: 'Nome' },
    { key: 'company', label: 'Empresa' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Telefone' },
    { key: 'stage', label: 'Fase' },
    { key: 'source', label: 'Origem' }
  ];

  fields: FieldDef[] = [
    { key: 'name', label: 'Nome', type: 'text', required: true },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'phone', label: 'Telefone', type: 'text' },
    { key: 'company', label: 'Empresa', type: 'text' },
    { key: 'source', label: 'Origem', type: 'select', required: true, options: [
      { value: 'WEBSITE', label: 'Site' },
      { value: 'SOCIAL_MEDIA', label: 'Redes Sociais' },
      { value: 'REFERRAL', label: 'Indicação' },
      { value: 'EMAIL', label: 'Email' },
      { value: 'PHONE', label: 'Telefone' },
      { value: 'EVENT', label: 'Evento' },
      { value: 'ADVERTISEMENT', label: 'Anúncio' },
      { value: 'PARTNER', label: 'Parceiro' },
      { value: 'OTHER', label: 'Outro' }
    ]},
    { key: 'stage', label: 'Fase', type: 'select', required: true, options: this.stages },
    { key: 'notes', label: 'Anotações', type: 'textarea' }
  ];

  constructor(
    private svc: BaseService<Prospect>,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.svc.getPage('prospects', this.page, this.pageSize, this.sort).subscribe({
      next: (p: Page<Prospect>) => {
        this.items = p.content;
        this.totalElements = p.totalElements;
        this.groupProspects();
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  groupProspects(): void {
    this.groupedProspects = {
      'PROSPECTING': [],
      'CONTACTED': [],
      'WAITING_REPLY': []
    };
    
    for (const p of this.items) {
      if (!p.convertedLeadId) { // Only show unconverted in Kanban
        if (this.groupedProspects[p.stage]) {
          this.groupedProspects[p.stage].push(p);
        } else {
          this.groupedProspects['PROSPECTING'].push(p); // fallback
        }
      }
    }
  }

  drop(event: CdkDragDrop<Prospect[]>, newStage: string) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      
      const movedProspect = event.container.data[event.currentIndex];
      movedProspect.stage = newStage;
      
      this.svc.update('prospects', movedProspect.id!, { stage: newStage }).subscribe({
        error: () => {
          this.snackBar.open('Erro ao mudar de fase', 'OK', { duration: 3000 });
          this.load(); // reload on error to revert
        }
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

  openDialog(entity?: any): void {
    const data: FormDialogData = {
      title: entity ? 'Editar Prospect' : 'Novo Prospect',
      fields: this.fields,
      entity: entity,
    };

    this.dialog.open(FormDialogComponent, { data, width: '520px' })
      .afterClosed()
      .subscribe(result => {
        if (!result) return;
        const op = entity
          ? this.svc.update('prospects', entity.id!, result)
          : this.svc.create('prospects', result);
        op.subscribe({
          next: () => {
            this.snackBar.open('Salvo com sucesso!', 'OK', { duration: 3000 });
            this.load();
          },
          error: () => this.snackBar.open('Erro ao salvar', 'OK', { duration: 3000 }),
        });
      });
  }

  onDelete(entity: Prospect): void {
    if (!confirm('Deseja excluir este prospect?')) return;
    this.svc.delete('prospects', entity.id!).subscribe({
      next: () => {
        this.snackBar.open('Excluído!', 'OK', { duration: 3000 });
        this.load();
      },
      error: () => this.snackBar.open('Erro ao excluir', 'OK', { duration: 3000 }),
    });
  }

  promoteToLead(prospect: Prospect): void {
    if (!confirm(`Deseja promover ${prospect.name} a Lead?`)) return;
    
    fetch(`${environment.apiUrl}/prospects/${prospect.id}/promote`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('crm_token')}`
      }
    }).then(res => {
      if (res.ok) {
        this.snackBar.open('Promovido para Lead com sucesso!', 'OK', { duration: 3000 });
        this.load();
      } else {
        throw new Error('Falha');
      }
    }).catch(() => {
      this.snackBar.open('Erro ao promover prospect', 'OK', { duration: 3000 });
    });
  }
}
