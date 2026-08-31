import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ListPageComponent, ColumnDef } from '../../shared/list-page/list-page.component';
import { FormDialogComponent, FieldDef, FormDialogData } from '../../shared/form-dialog/form-dialog.component';
import { BaseService } from '../../core/services/base.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface LegalProcess {
  id?: string;
  cnjNumber: string;
  court: string;
  distributionDate: string;
  value: number;
  status: string;
  description: string;
}

@Component({
  selector: 'app-legal-processes-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ListPageComponent,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="search-datajud-bar glass-panel">
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Consultar Processo no DataJud (CNJ)</mat-label>
        <input matInput [(ngModel)]="searchCnj" placeholder="0000000-00.0000.0.00.0000" />
        <button mat-icon-button matSuffix (click)="searchDataJud()" [disabled]="searching">
          <mat-icon>search</mat-icon>
        </button>
      </mat-form-field>
      
      <button mat-flat-button color="accent" (click)="searchDataJud()" [disabled]="searching || !searchCnj">
        <mat-icon *ngIf="!searching">cloud_download</mat-icon>
        <mat-spinner *ngIf="searching" diameter="20" class="btn-spinner"></mat-spinner>
        Consultar e Preencher
      </button>
    </div>

    <app-list-page
      title="Processos Judiciais"
      [columns]="columns"
      [data]="items"
      [totalElements]="totalElements"
      [pageSize]="pageSize"
      [loading]="loading"
      emptyMessage="Nenhum processo encontrado."
      emptyIcon="gavel"
      emptyActionLabel="Criar Processo"
      (pageChange)="onPage($event)"
      (sortChange)="onSort($event)"
      (add)="openDialog()"
      (edit)="openDialog($event)"
      (remove)="onDelete($event)"
    ></app-list-page>
  `,
  styles: [`
    .search-datajud-bar {
      margin: 24px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 16px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(10px);
      border: 1px solid var(--hairline);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);

      .search-field {
        flex: 1;
        margin-bottom: -1.25em; /* Fix Material outline field alignment */
      }

      button {
        height: 48px;
        font-weight: 600;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 8px;

        .btn-spinner {
          margin-right: 8px;
        }
      }
    }
  `]
})
export class LegalProcessesListComponent implements OnInit {
  items: LegalProcess[] = [];
  totalElements = 0;
  pageSize = 10;
  page = 0;
  sort = 'createdAt,desc';
  loading = true;

  searchCnj = '';
  searching = false;

  columns: ColumnDef[] = [
    { key: 'cnjNumber', label: 'Nº Processo (CNJ)' },
    { key: 'court', label: 'Tribunal' },
    { key: 'distributionDate', label: 'Distribuição' },
    { key: 'value', label: 'Valor da Causa' },
    { key: 'status', label: 'Status' },
  ];

  fields: FieldDef[] = [
    { key: 'cnjNumber', label: 'Número CNJ', type: 'text', required: true },
    { key: 'court', label: 'Tribunal / Vara', type: 'text' },
    { key: 'distributionDate', label: 'Data de Distribuição', type: 'date' },
    { key: 'value', label: 'Valor da Causa (R$)', type: 'number' },
    { key: 'status', label: 'Status do Processo', type: 'text' },
    { key: 'description', label: 'Observações / Descrição', type: 'textarea' },
  ];

  constructor(
    private svc: BaseService<LegalProcess>,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.svc.getPage('legal-processes', this.page, this.pageSize, this.sort).subscribe({
      next: (p) => {
        this.items = p.content;
        this.totalElements = p.totalElements;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  onPage(e: any): void {
    this.page = e.pageIndex;
    this.pageSize = e.pageSize;
    this.load();
  }

  onSort(e: any): void {
    this.sort = e.active && e.direction ? `${e.active},${e.direction}` : 'createdAt,desc';
    this.load();
  }

  searchDataJud(): void {
    if (!this.searchCnj) return;
    this.searching = true;
    this.http.get<LegalProcess>(`${environment.apiUrl}/legal-processes/search`, {
      params: { cnjNumber: this.searchCnj }
    }).subscribe({
      next: (data) => {
        this.searching = false;
        this.snackBar.open('Processo encontrado no DataJud!', 'OK', { duration: 3000 });
        this.openDialog(data);
      },
      error: (err) => {
        this.searching = false;
        const msg = err.error?.message || 'Erro ao consultar número CNJ no DataJud';
        this.snackBar.open(msg, 'OK', { duration: 4000 });
      }
    });
  }

  openDialog(entity?: LegalProcess): void {
    const formEntity = entity ? {
      cnjNumber: entity.cnjNumber,
      court: entity.court,
      distributionDate: entity.distributionDate,
      value: entity.value,
      status: entity.status,
      description: entity.description,
    } : undefined;

    const data: FormDialogData = {
      title: entity?.id ? 'Editar Processo' : 'Novo Processo Judicial',
      fields: this.fields,
      entity: formEntity,
    };

    this.dialog.open(FormDialogComponent, { data, width: '520px' })
      .afterClosed()
      .subscribe(result => {
        if (!result) return;
        const op = entity?.id
          ? this.svc.update('legal-processes', entity.id, result)
          : this.svc.create('legal-processes', result);
        op.subscribe({
          next: () => {
            this.snackBar.open('Salvo com sucesso!', 'OK', { duration: 3000 });
            this.load();
          },
          error: (err) => {
            const msg = err.error?.message || 'Erro ao salvar';
            this.snackBar.open(msg, 'OK', { duration: 3000 });
          },
        });
      });
  }

  onDelete(entity: LegalProcess): void {
    if (!confirm('Deseja realmente excluir este processo judicial?')) return;
    this.svc.delete('legal-processes', entity.id!).subscribe({
      next: () => {
        this.snackBar.open('Excluído!', 'OK', { duration: 3000 });
        this.load();
      },
      error: () => this.snackBar.open('Erro ao excluir', 'OK', { duration: 3000 }),
    });
  }
}
