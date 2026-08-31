import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';
import { CrmSearchResult, WhatsappService } from './whatsapp.service';

export interface WhatsappLinkDialogData {
  phone: string;
  contactName?: string;
}

@Component({
  selector: 'app-whatsapp-link-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './whatsapp-link-dialog.component.html',
  styleUrl: './whatsapp-link-dialog.component.scss',
})
export class WhatsappLinkDialogComponent implements OnInit, OnDestroy {
  query = '';
  results: CrmSearchResult[] = [];
  loading = true;
  errorMessage = '';

  private search$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private wa: WhatsappService,
    private dialogRef: MatDialogRef<WhatsappLinkDialogComponent, CrmSearchResult | null>,
    @Inject(MAT_DIALOG_DATA) public data: WhatsappLinkDialogData,
  ) {}

  ngOnInit(): void {
    this.search$
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((q) => this.wa.searchCrmRecords(q)),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (rows) => {
          this.results = rows;
          this.loading = false;
        },
        error: () => {
          this.errorMessage = 'Não foi possível carregar leads e clientes.';
          this.loading = false;
        },
      });
    this.search$.next('');
  }

  onQueryChange(value: string): void {
    this.loading = true;
    this.errorMessage = '';
    this.search$.next(value);
  }

  pick(result: CrmSearchResult): void {
    this.dialogRef.close(result);
  }

  close(): void {
    this.dialogRef.close(null);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  typeLabel(type: CrmSearchResult['type']): string {
    return type === 'LEAD' ? 'Lead' : type === 'CLIENT' ? 'Cliente' : type;
  }

  trackResult(_: number, r: CrmSearchResult): string {
    return `${r.type}:${r.id}`;
  }
}
