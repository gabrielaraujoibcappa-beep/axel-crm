import { Component, OnInit, OnDestroy, ElementRef, ViewChild, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface KpiCard {
  label: string;
  icon: string;
  count: string | number;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatButtonModule,
    FormsModule,
    MatButtonToggleModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  loading = true;
  chartError = false;
  period: 'month' | 'quarter' | 'year' = 'month';
  cards: KpiCard[] = [];
  upcomingTasks: any[] = [];
  commissions: any[] = [];

  @ViewChild('trendChart') trendChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('funnelChart') funnelChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('dealsChart') dealsChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('proposalsChart') proposalsChartRef!: ElementRef<HTMLCanvasElement>;

  trendChartInstance?: Chart;
  funnelChartInstance?: Chart;
  dealsChartInstance?: Chart;
  proposalsChartInstance?: Chart;

  private destroyRef = inject(DestroyRef);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  setPeriod(p: 'month' | 'quarter' | 'year'): void {
    this.period = p;
    this.initFinancialTrendChart();
  }

  private getPeriodRange(): { start: string; end: string } {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    if (this.period === 'month') {
      const start = new Date(y, m, 1);
      const end = new Date(y, m + 1, 0);
      return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
    }
    if (this.period === 'quarter') {
      const q = Math.floor(m / 3) * 3;
      const start = new Date(y, q, 1);
      const end = new Date(y, q + 3, 0);
      return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
    }
    return { start: `${y}-01-01`, end: `${y}-12-31` };
  }

  loadDashboardData(): void {
    const api = environment.apiUrl;

    forkJoin({
      summary: this.http.get<any>(`${api}/dashboard/summary`).pipe(catchError(() => of({}))),
      tasks: this.http.get<any>(`${api}/tasks?size=5&sort=dueDate,asc`).pipe(catchError(() => of({ content: [] }))),
      commissions: this.http.get<any>(`${api}/commissions?size=5`).pipe(catchError(() => of({ content: [] }))),
    }).subscribe({
      next: ({ summary, tasks, commissions }) => {
        this.cards = [
          { label: 'Clientes Ativos', icon: 'people', count: summary?.totalClients ?? 0, color: '#3b82f6' },
          { label: 'Total de Leads', icon: 'leaderboard', count: summary?.totalLeads ?? 0, color: '#14b8a6' },
          { label: 'Negócios Fechados', icon: 'handshake', count: summary?.wonDeals ?? 0, color: '#10b981' },
          { label: 'Valor em Pipeline', icon: 'payments', count: this.formatCurrency(summary?.pipelineValue ?? 0), color: '#f59e0b' },
          { label: 'Receita Mensal', icon: 'trending_up', count: this.formatCurrency(summary?.monthlyRevenue ?? 0), color: '#06b6d4' },
          { label: 'Despesas Mensais', icon: 'trending_down', count: this.formatCurrency(summary?.monthlyExpenses ?? 0), color: '#ef4444' }
        ];
        this.upcomingTasks = tasks.content || [];
        this.commissions = commissions.content || [];
        this.loading = false;

        setTimeout(() => {
          this.initFinancialTrendChart();
          this.initLeadsFunnelChart();
          this.initDealsPieChart();
          this.initProposalsChart();
        }, 100);
      },
      error: () => {
        this.cards = [
          { label: 'Clientes Ativos', icon: 'people', count: 0, color: '#3b82f6' },
          { label: 'Total de Leads', icon: 'leaderboard', count: 0, color: '#14b8a6' },
          { label: 'Negócios Fechados', icon: 'handshake', count: 0, color: '#10b981' },
          { label: 'Valor em Pipeline', icon: 'payments', count: 'R$ 0,00', color: '#f59e0b' }
        ];
        this.loading = false;
        this.chartError = true;
      }
    });
  }

  initFinancialTrendChart(): void {
    if (!this.trendChartRef) return;

    const api = environment.apiUrl;
    const { start, end } = this.getPeriodRange();

    this.http.get<any>(`${api}/dashboard/financial-trend?start=${start}&end=${end}`).pipe(catchError(() => of({ entries: [] }))).subscribe({
      next: (trend: any) => {
        const entries = trend.entries || [];
        const labels = entries.length ? entries.map((e: any) => e.period) : ['Sem dados'];
        const revenues = entries.length ? entries.map((e: any) => e.revenue) as number[] : [0];
        const expenses = entries.length ? entries.map((e: any) => e.expenses) as number[] : [0];

        if (this.trendChartInstance) this.trendChartInstance.destroy();

        const canvas = this.trendChartRef.nativeElement;
        const ctx = canvas.getContext('2d')!;

        const revGradient = ctx.createLinearGradient(0, 0, 0, 300);
        revGradient.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
        revGradient.addColorStop(1, 'rgba(16, 185, 129, 0.00)');

        const expGradient = ctx.createLinearGradient(0, 0, 0, 300);
        expGradient.addColorStop(0, 'rgba(239, 68, 68, 0.35)');
        expGradient.addColorStop(1, 'rgba(239, 68, 68, 0.00)');

        this.trendChartInstance = new Chart(canvas, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Receitas',
                data: revenues,
                borderColor: '#10b981',
                backgroundColor: revGradient,
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointBackgroundColor: '#10b981',
                pointHoverRadius: 6
              },
              {
                label: 'Despesas',
                data: expenses,
                borderColor: '#ef4444',
                backgroundColor: expGradient,
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointBackgroundColor: '#ef4444',
                pointHoverRadius: 6
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  color: this.chartInk(),
                  font: { family: 'Outfit', weight: '600' as any },
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: { color: this.chartGrid() },
                ticks: { color: this.chartMuted() },
              },
              x: {
                grid: { display: false },
                ticks: { color: this.chartMuted() },
              },
            },
          }
        });
      },
      error: () => { this.chartError = true; }
    });
  }

  initLeadsFunnelChart(): void {
    if (!this.funnelChartRef) return;

    const api = environment.apiUrl;
    this.http.get<any>(`${api}/dashboard/leads`).pipe(catchError(() => of({ byStage: {} }))).subscribe({
      next: (leads: any) => {
        const byStage = leads.byStage || {};
        const labels = Object.keys(byStage);
        const data = Object.values(byStage) as number[];

        if (this.funnelChartInstance) this.funnelChartInstance.destroy();

        const canvas = this.funnelChartRef.nativeElement;
        const ctx = canvas.getContext('2d')!;
        const barGradient = ctx.createLinearGradient(0, 0, 450, 0);
        barGradient.addColorStop(0, '#3b82f6');
        barGradient.addColorStop(1, '#14b8a6');

        this.funnelChartInstance = new Chart(canvas, {
          type: 'bar',
          data: {
            labels: labels.map(l => this.translateLeadStage(l)),
            datasets: [{
              label: 'Quantidade de Leads',
              data: data,
              backgroundColor: barGradient,
              borderRadius: 8,
              barThickness: 16
            }]
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            },
            scales: {
              x: {
                grid: { color: this.chartGrid() },
                ticks: { color: this.chartMuted() },
              },
              y: {
                grid: { display: false },
                ticks: { color: this.chartMuted() },
              },
            },
          }
        });
      },
      error: () => { this.chartError = true; }
    });
  }

  initDealsPieChart(): void {
    if (!this.dealsChartRef) return;

    const api = environment.apiUrl;
    // The API exposes deals under /deals; /dashboard/deals does not exist.
    this.http.get<any>(`${api}/deals?page=0&size=1000&sort=createdAt,desc`).pipe(
      map((res: any) => {
        const byStatus: Record<string, number> = {};
        for (const deal of (res?.content || [])) {
          const stage = deal.stageName || 'Sem etapa';
          byStatus[stage] = (byStatus[stage] || 0) + 1;
        }
        return { byStatus };
      }),
      catchError(() => of({ byStatus: {} }))
    ).subscribe({
      next: (res: any) => {
        const byStatus = res.byStatus || {};
        const labels = Object.keys(byStatus);
        const data = Object.values(byStatus) as number[];

        if (this.dealsChartInstance) this.dealsChartInstance.destroy();

        const colors = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#14b8a6', '#06b6d4'];

        this.dealsChartInstance = new Chart(this.dealsChartRef.nativeElement, {
          type: 'doughnut',
          data: {
            labels: labels.map(l => this.translateDealStatus(l)),
            datasets: [{
              data: data,
              backgroundColor: colors.slice(0, labels.length),
              borderWidth: 0,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right',
                labels: {
                  color: this.chartInk(),
                  font: { family: 'IBM Plex Sans', size: 11 },
                },
              },
            },
            cutout: '65%',
          }
        });
      },
      error: () => { this.chartError = true; }
    });
  }

  initProposalsChart(): void {
    if (!this.proposalsChartRef) return;

    const api = environment.apiUrl;
    this.http.get<any>(`${api}/dashboard/proposals`).pipe(catchError(() => of({ byStatus: {} }))).subscribe({
      next: (res: any) => {
        const byStatus = res.byStatus || {};
        const labels = Object.keys(byStatus);
        const data = Object.values(byStatus) as number[];

        if (this.proposalsChartInstance) this.proposalsChartInstance.destroy();

        const colors = ['#6b7280', '#3b82f6', '#14b8a6', '#f59e0b', '#10b981', '#ef4444', '#06b6d4'];

        this.proposalsChartInstance = new Chart(this.proposalsChartRef.nativeElement, {
          type: 'doughnut',
          data: {
            labels: labels.map(l => this.translateProposalStatus(l)),
            datasets: [{
              data: data,
              backgroundColor: colors.slice(0, labels.length),
              borderWidth: 0,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right',
                labels: {
                  color: this.chartInk(),
                  font: { family: 'IBM Plex Sans', size: 11 },
                },
              },
            },
            cutout: '65%',
          }
        });
      },
      error: () => { this.chartError = true; }
    });
  }

  /** Chart label color from current theme CSS vars (dark cream / light ink). */
  private chartInk(): string {
    return getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || '#ffe7d0';
  }

  private chartMuted(): string {
    return getComputedStyle(document.documentElement).getPropertyValue('--muted').trim() || '#9e8f80';
  }

  private chartGrid(): string {
    return getComputedStyle(document.documentElement).getPropertyValue('--hairline').trim() || 'rgba(255, 231, 208, 0.1)';
  }

  retryCharts(): void {
    this.chartError = false;
    setTimeout(() => {
      this.initFinancialTrendChart();
      this.initLeadsFunnelChart();
      this.initDealsPieChart();
      this.initProposalsChart();
    }, 100);
  }

  ngOnDestroy(): void {
    this.trendChartInstance?.destroy();
    this.funnelChartInstance?.destroy();
    this.dealsChartInstance?.destroy();
    this.proposalsChartInstance?.destroy();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  translateLeadStage(stage: string): string {
    const t: Record<string, string> = {
      'NEW': 'Novo', 'CONTACTED': 'Contato Realizado', 'QUALIFIED': 'Qualificado',
      'PROPOSAL_SENT': 'Proposta Enviada', 'NEGOTIATING': 'Negociação',
      'CONVERTED': 'Convertido', 'LOST': 'Perdido'
    };
    return t[stage] || stage;
  }

  translateDealStatus(status: string): string {
    const t: Record<string, string> = {
      'WON': 'Ganhos', 'LOST': 'Perdidos', 'NEGOTIATING': 'Negociando',
      'PROPOSAL': 'Proposta', 'QUALIFIED': 'Qualificado', 'NEW': 'Novo'
    };
    return t[status] || status;
  }

  translateProposalStatus(status: string): string {
    const t: Record<string, string> = {
      'DRAFT': 'Rascunho', 'SENT': 'Enviadas', 'VIEWED': 'Visualizadas',
      'NEGOTIATING': 'Negociando', 'ACCEPTED': 'Aceitas', 'REJECTED': 'Rejeitadas', 'EXPIRED': 'Expiradas'
    };
    return t[status] || status;
  }
}
