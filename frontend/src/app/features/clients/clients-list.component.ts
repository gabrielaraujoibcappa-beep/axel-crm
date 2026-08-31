import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { ListPageComponent, ColumnDef, KpiDef } from '../../shared/list-page/list-page.component';
import { FormDialogComponent, FieldDef, FormDialogData } from '../../shared/form-dialog/form-dialog.component';
import { BaseService } from '../../core/services/base.service';
import { Client, Page } from '../../core/models/models';

@Component({
  selector: 'app-clients-list',
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
        <h1 class="text-2xl font-bold text-[#00072d] m-0">Clientes</h1>
        <div class="flex items-center gap-4">
          <mat-button-toggle-group [(ngModel)]="viewMode" aria-label="Modo de visualização">
            <mat-button-toggle value="kanban"><mat-icon>view_kanban</mat-icon></mat-button-toggle>
            <mat-button-toggle value="list"><mat-icon>view_list</mat-icon></mat-button-toggle>
          </mat-button-toggle-group>
          <button mat-flat-button color="primary" (click)="openDialog()">
            <mat-icon>add</mat-icon> Novo Cliente
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
                {{(groupedClients[stage.value] || []).length}}
              </span>
            </div>
            
            <div
              cdkDropList
              [cdkDropListData]="groupedClients[stage.value]"
              (cdkDropListDropped)="drop($event, stage.value)"
              class="kanban-list"
            >
              <mat-card *ngFor="let client of groupedClients[stage.value]" cdkDrag class="kanban-card">
                <mat-card-content class="p-4">
                  <div class="flex justify-between items-start mb-3">
                    <h4 class="card-title" (click)="onView(client)">{{client.name}}</h4>
                    <button mat-icon-button (click)="openDialog(client)" class="scale-75 -mt-2 -mr-2 text-slate-400 hover:text-blue-600">
                      <mat-icon>edit</mat-icon>
                    </button>
                  </div>
                  
                  <div class="space-y-1.5 mb-3">
                    <div *ngIf="client.companyName" class="meta-item">
                      <mat-icon>business</mat-icon>
                      <span class="truncate font-medium">{{client.companyName}}</span>
                    </div>
                    <div *ngIf="client.email" class="meta-item">
                      <mat-icon>email</mat-icon>
                      <span class="truncate">{{client.email}}</span>
                    </div>
                  </div>
                  
                  <div class="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <span class="text-xs text-slate-400">Status</span>
                    <mat-chip [color]="client.active ? 'primary' : 'warn'" selected class="scale-90 origin-right">
                      {{client.active ? 'Ativo' : 'Inativo'}}
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
          [columns]="columns"
          [data]="items"
          [totalElements]="totalElements"
          [pageSize]="pageSize"
          [loading]="loading"
          [kpis]="kpis"
          emptyMessage="Nenhum cliente encontrado."
          emptyIcon="people"
          emptyActionLabel="Criar Cliente"
          (pageChange)="onPage($event)"
          (sortChange)="onSort($event)"
          (edit)="openDialog($event)"
          (remove)="onDelete($event)"
          (view)="onView($event)"
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
export class ClientsListComponent implements OnInit {
  items: Client[] = [];
  totalElements = 0;
  pageSize = 10;
  page = 0;
  sort = 'id,asc';
  loading = true;

  viewMode: 'list' | 'kanban' = 'kanban';

  get kpis(): KpiDef[] {
    const ativos = this.items.filter(c => c.active).length;
    const inativos = this.items.filter(c => !c.active).length;
    return [
      { label: 'Total de Clientes', value: this.totalElements, icon: 'people', color: 'var(--primary)' },
      { label: 'Ativos', value: ativos, icon: 'check_circle', color: '#22c55e' },
      { label: 'Inativos', value: inativos, icon: 'cancel', color: '#ef4444' },
    ];
  }

  stages = [
    { value: 'NEW', label: 'Novo' },
    { value: 'CONTACTED', label: 'Em Contato' },
    { value: 'QUALIFIED', label: 'Qualificado' },
    { value: 'WAITING_RESPONSE', label: 'Aguardando Resposta' },
    { value: 'CLOSED_WON', label: 'Fechado Ganho' },
    { value: 'CLOSED_LOST', label: 'Perdido' },
    { value: 'DISCARDED', label: 'Descartado' }
  ];

  groupedClients: Record<string, Client[]> = {
    'NEW': [],
    'CONTACTED': [],
    'QUALIFIED': [],
    'WAITING_RESPONSE': [],
    'CLOSED_WON': [],
    'CLOSED_LOST': [],
    'DISCARDED': []
  };

  serviceTypes = [
    { value: 'Consultoria', label: 'Consultoria' },
    { value: 'Desenvolvimento', label: 'Desenvolvimento' },
    { value: 'Design', label: 'Design' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Jurídico', label: 'Jurídico' },
    { value: 'Outros', label: 'Outros' }
  ];

  columns: ColumnDef[] = [
    { key: 'name', label: 'Nome' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Telefone' },
    { key: 'companyName', label: 'Empresa' },
    { key: 'serviceType', label: 'Tipo de Serviço' },
    { key: 'industry', label: 'Setor' },
    { key: 'status', label: 'Status' }
  ];

  fields: FieldDef[] = [
    { key: 'name', label: 'Nome', type: 'text', required: true },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'phone', label: 'Telefone', type: 'text' },
    { key: 'companyName', label: 'Empresa', type: 'text' },
    { key: 'taxId', label: 'CPF/CNPJ', type: 'text' },
    { key: 'website', label: 'Website', type: 'text' },
    { key: 'industry', label: 'Setor', type: 'text' },
    { key: 'serviceType', label: 'Tipo de Serviço', type: 'select', options: this.serviceTypes },
    { key: 'address', label: 'Endereço', type: 'text' },
    { key: 'city', label: 'Cidade', type: 'text' },
    { key: 'state', label: 'Estado', type: 'text' },
    { key: 'zipCode', label: 'CEP', type: 'text' },
    { key: 'country', label: 'País', type: 'text' },
    { key: 'status', label: 'Status do Cliente', type: 'select', required: true, options: this.stages },
    { key: 'notes', label: 'Notas', type: 'textarea' },
  ];

  constructor(
    private svc: BaseService<Client>,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
  ) {}


  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.svc.getPage('clients', this.page, this.pageSize, this.sort).subscribe({
      next: (p: Page<Client>) => {
        this.items = p.content;
        this.totalElements = p.totalElements;
        this.groupClients();
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  groupClients(): void {
    this.groupedClients = {
      'NEW': [],
      'CONTACTED': [],
      'QUALIFIED': [],
      'WAITING_RESPONSE': [],
      'CLOSED_WON': [],
      'CLOSED_LOST': [],
      'DISCARDED': []
    };
    
    for (const c of this.items) {
      const stage = c.status || 'NEW';
      if (this.groupedClients[stage]) {
        this.groupedClients[stage].push(c);
      } else {
        this.groupedClients['NEW'].push(c);
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
          event.currentIndex,
        );
        
        const movedClient = event.container.data[event.currentIndex];
        movedClient.status = newStage;
        
        this.svc.update('clients', movedClient.id!, { status: newStage }).subscribe({
          error: () => {
            this.snackBar.open('Erro ao mudar de status', 'OK', { duration: 3000 });
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

  openDialog(entity?: Client): void {
    const data: FormDialogData = {
      title: entity ? 'Editar Cliente' : 'Novo Cliente',
      fields: this.fields,
      entity,
    };
    this.dialog.open(FormDialogComponent, { data, width: '520px' })
      .afterClosed()
      .subscribe(result => {
        if (!result) return;
        const op = entity
          ? this.svc.update('clients', entity.id!, result)
          : this.svc.create('clients', result);
        op.subscribe({
          next: () => {
            this.snackBar.open('Salvo com sucesso!', 'OK', { duration: 3000 });
            this.load();
          },
          error: () => this.snackBar.open('Erro ao salvar', 'OK', { duration: 3000 }),
        });
      });
  }

  onDelete(entity: Client): void {
    if (!confirm('Deseja excluir este cliente?')) return;
    this.svc.delete('clients', entity.id!).subscribe({
      next: () => {
        this.snackBar.open('Excluído!', 'OK', { duration: 3000 });
        this.load();
      },
      error: () => this.snackBar.open('Erro ao excluir', 'OK', { duration: 3000 }),
    });
  }

  onView(entity: Client): void {
    this.router.navigate(['/clients', entity.id]);
  }
}

