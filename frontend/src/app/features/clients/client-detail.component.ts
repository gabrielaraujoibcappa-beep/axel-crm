import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { FormDialogComponent, FieldDef, FormDialogData } from '../../shared/form-dialog/form-dialog.component';
import { TimelineComponent } from '../../shared/timeline/timeline.component';

import { ClientDetailService } from '../../core/services/client-detail.service';
import { Client, ClientAttachment, Deal, Task, Proposal, Project } from '../../core/models/models';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTooltipModule,
    FormDialogComponent,
    TimelineComponent
  ],
  templateUrl: './client-detail.component.html',
  styleUrls: ['./client-detail.component.scss']
})
export class ClientDetailComponent implements OnInit {
  clientId = '';
  client: Client | null = null;
  loading = true;
  saving = false;
  editMode = false;

  // Forms
  clientForm!: FormGroup;

  // Attachments
  attachments: ClientAttachment[] = [];
  selectedFile: File | null = null;
  uploadingFile = false;

  // Related data
  deals: Deal[] = [];
  tasks: Task[] = [];
  proposals: Proposal[] = [];
  projects: Project[] = [];

  // Table columns
  dealColumns: string[] = ['title', 'value', 'stageName', 'createdAt'];
  taskColumns: string[] = ['title', 'status', 'priority', 'dueDate'];
  proposalColumns: string[] = ['title', 'totalAmount', 'status', 'validUntil'];
  projectColumns: string[] = ['title', 'budget', 'status', 'endDate'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private service: ClientDetailService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.clientId = params['id'];
      if (this.clientId) {
        this.loadAll();
      }
    });
  }

  private initForms(): void {
    this.clientForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.email]],
      phone: [''],
      companyName: [''],
      taxId: [''],
      website: [''],
      industry: [''],
      address: [''],
      city: [''],
      state: [''],
      zipCode: [''],
      country: [''],
      notes: [''],
      active: [true]
    });
    this.clientForm.disable();
  }

  loadAll(): void {
    this.loading = true;
    this.service.getById('clients', this.clientId).subscribe({
      next: (data) => {
        this.client = data;
        this.clientForm.patchValue(data);
        this.clientForm.disable();
        this.loadAttachments();
        this.loadRelatedData();
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Erro ao carregar dados do cliente.', 'OK', { duration: 3000 });
        this.loading = false;
        this.router.navigate(['/clients']);
      }
    });
  }

  loadAttachments(): void {
    this.service.getAttachments(this.clientId).subscribe({
      next: (data) => this.attachments = data,
      error: () => this.snackBar.open('Erro ao carregar anexos.', 'OK', { duration: 3000 })
    });
  }

  loadRelatedData(): void {
    this.service.getDeals().subscribe({
      next: (res) => {
        this.deals = res.content.filter(d => d.clientId === this.clientId);
      }
    });
    this.service.getTasks().subscribe({
      next: (res) => {
        this.tasks = res.content.filter(t => t.clientId === this.clientId);
      }
    });
    this.service.getProposals().subscribe({
      next: (res) => {
        this.proposals = res.content.filter(p => p.clientId === this.clientId);
      }
    });
    this.service.getProjects().subscribe({
      next: (res) => {
        this.projects = res.content.filter(p => p.clientId === this.clientId);
      }
    });

    // Load pipelines to populate Deal creation dropdowns
    this.service.getPipelines().subscribe({
      next: (res) => {
        const pipelines = res.content;
        this.dealFields[3].options = pipelines.map((p: any) => ({ value: p.id, label: p.name }));
        
        if (pipelines.length > 0) {
          const firstPipelineId = pipelines[0].id;
          this.service.getPipelineStages(firstPipelineId).subscribe({
            next: (stages: any[]) => {
              this.dealFields[4].options = stages.map((s: any) => ({ value: s.id, label: s.name }));
            }
          });
        }
      }
    });

    // Load users to populate Task creation dropdowns
    this.service.getUsers().subscribe({
      next: (res) => {
        this.taskFields[4].options = res.content.map((u: any) => ({ value: u.id, label: u.fullName || u.name }));
      }
    });
  }

  toggleEditMode(): void {
    if (this.editMode) {
      this.clientForm.patchValue(this.client!); // Reset changes
      this.clientForm.disable();
    } else {
      this.clientForm.enable();
    }
    this.editMode = !this.editMode;
  }

  saveClientDetails(): void {
    if (this.clientForm.invalid) return;
    this.saving = true;
    const body = this.clientForm.value;
    this.service.update('clients', this.clientId, body).subscribe({
      next: (updated) => {
        this.client = updated;
        this.clientForm.patchValue(updated);
        this.clientForm.disable();
        this.editMode = false;
        this.saving = false;
        this.snackBar.open('Cliente atualizado com sucesso!', 'OK', { duration: 3000 });
      },
      error: () => {
        this.saving = false;
        this.snackBar.open('Erro ao atualizar dados.', 'OK', { duration: 3000 });
      }
    });
  }

  onFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      this.uploadFile();
    }
  }

  uploadFile(): void {
    if (!this.selectedFile) return;
    this.uploadingFile = true;
    this.service.uploadAttachment(this.clientId, this.selectedFile).subscribe({
      next: () => {
        this.snackBar.open('Arquivo enviado com sucesso!', 'OK', { duration: 3000 });
        this.selectedFile = null;
        this.uploadingFile = false;
        this.loadAttachments();
        
      },
      error: () => {
        this.uploadingFile = false;
        this.snackBar.open('Erro ao enviar arquivo.', 'OK', { duration: 3000 });
      }
    });
  }

  downloadAttachment(att: ClientAttachment): void {
    this.service.downloadAttachment(this.clientId, att.id!).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = att.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: () => this.snackBar.open('Erro ao baixar arquivo.', 'OK', { duration: 3000 })
    });
  }

  deleteAttachment(attId: string): void {
    if (!confirm('Deseja remover este anexo?')) return;
    this.service.deleteAttachment(this.clientId, attId).subscribe({
      next: () => {
        this.snackBar.open('Anexo removido.', 'OK', { duration: 3000 });
        this.loadAttachments();
        
      },
      error: () => this.snackBar.open('Erro ao remover anexo.', 'OK', { duration: 3000 })
    });
  }

  // Helpers
  formatBytes(bytes: number | undefined): string {
    if (bytes === undefined || bytes === null) return '0 B';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const dm = 2;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  formatCurrency(value: number | undefined): string {
    if (value === undefined || value === null) return 'R$ 0,00';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getTotalDealsValue(): number {
    return this.deals.reduce((sum, d) => sum + (d.value || 0), 0);
  }

  getOpenTasksCount(): number {
    return this.tasks.filter(t => t.status !== 'COMPLETED').length;
  }

  dealFields: FieldDef[] = [
    { key: 'title', label: 'Título', type: 'text', required: true },
    { key: 'description', label: 'Descrição', type: 'textarea' },
    { key: 'value', label: 'Valor', type: 'number' },
    { key: 'pipelineId', label: 'Pipeline', type: 'select', required: true, options: [] },
    { key: 'stageId', label: 'Estágio', type: 'select', required: true, options: [] },
    { key: 'expectedCloseDate', label: 'Previsão Fechamento', type: 'date' }
  ];

  taskFields: FieldDef[] = [
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
    { key: 'assignedToUserId', label: 'Responsável', type: 'select', required: true, options: [] }
  ];

  openCreateDealDialog(): void {
    const data: FormDialogData = {
      title: 'Novo Negócio',
      fields: this.dealFields,
      entity: {}
    };
    
    this.dialog.open(FormDialogComponent, { data, width: '520px' })
      .afterClosed()
      .subscribe(result => {
        if (!result) return;
        const payload = { ...result, clientId: this.clientId };
        this.service.createDeal(payload).subscribe({
          next: () => {
            this.snackBar.open('Negócio criado com sucesso!', 'OK', { duration: 3000 });
            this.loadRelatedData();
            
          },
          error: () => this.snackBar.open('Erro ao criar negócio.', 'OK', { duration: 3000 })
        });
      });
  }

  openCreateTaskDialog(): void {
    const data: FormDialogData = {
      title: 'Nova Tarefa',
      fields: this.taskFields,
      entity: { status: 'PENDING' }
    };

    this.dialog.open(FormDialogComponent, { data, width: '520px' })
      .afterClosed()
      .subscribe(result => {
        if (!result) return;
        const payload = { ...result, clientId: this.clientId };
        this.service.createTask(payload).subscribe({
          next: () => {
            this.snackBar.open('Tarefa criada com sucesso!', 'OK', { duration: 3000 });
            this.loadRelatedData();
            
          },
          error: () => this.snackBar.open('Erro ao criar tarefa.', 'OK', { duration: 3000 })
        });
      });
  }

  proposalFields: FieldDef[] = [
    { key: 'title', label: 'Título', type: 'text', required: true },
    { key: 'description', label: 'Descrição', type: 'textarea' },
    { key: 'totalAmount', label: 'Valor Total', type: 'number' },
    { key: 'validUntil', label: 'Validade', type: 'date' },
    { key: 'status', label: 'Status', type: 'select', required: true, options: [
      { value: 'DRAFT', label: 'Rascunho' },
      { value: 'SENT', label: 'Enviada' },
      { value: 'ACCEPTED', label: 'Aceita' },
      { value: 'REJECTED', label: 'Rejeitada' }
    ]}
  ];

  projectFields: FieldDef[] = [
    { key: 'name', label: 'Nome do Projeto', type: 'text', required: true },
    { key: 'description', label: 'Descrição', type: 'textarea' },
    { key: 'budget', label: 'Orçamento', type: 'number' },
    { key: 'startDate', label: 'Data Início', type: 'date' },
    { key: 'endDate', label: 'Data Fim', type: 'date' },
    { key: 'status', label: 'Status', type: 'select', required: true, options: [
      { value: 'PLANEJAMENTO', label: 'Planejamento' },
      { value: 'EM_ANDAMENTO', label: 'Em Andamento' },
      { value: 'CONCLUIDO', label: 'Concluído' },
      { value: 'CANCELADO', label: 'Cancelado' }
    ]}
  ];

  openCreateProposalDialog(): void {
    const data: FormDialogData = {
      title: 'Nova Proposta',
      fields: this.proposalFields,
      entity: { status: 'DRAFT' }
    };

    this.dialog.open(FormDialogComponent, { data, width: '520px' })
      .afterClosed()
      .subscribe(result => {
        if (!result) return;
        const payload = { ...result, clientId: this.clientId };
        this.service.createProposal(payload).subscribe({
          next: () => {
            this.snackBar.open('Proposta criada com sucesso!', 'OK', { duration: 3000 });
            this.loadRelatedData();
            
          },
          error: () => this.snackBar.open('Erro ao criar proposta.', 'OK', { duration: 3000 })
        });
      });
  }

  openCreateProjectDialog(): void {
    const data: FormDialogData = {
      title: 'Novo Projeto',
      fields: this.projectFields,
      entity: { status: 'PLANEJAMENTO' }
    };

    this.dialog.open(FormDialogComponent, { data, width: '520px' })
      .afterClosed()
      .subscribe(result => {
        if (!result) return;
        const payload = { ...result, clientId: this.clientId };
        this.service.createProject(payload).subscribe({
          next: () => {
            this.snackBar.open('Projeto criado com sucesso!', 'OK', { duration: 3000 });
            this.loadRelatedData();
            
          },
          error: () => this.snackBar.open('Erro ao criar projeto.', 'OK', { duration: 3000 })
        });
      });
  }
}
