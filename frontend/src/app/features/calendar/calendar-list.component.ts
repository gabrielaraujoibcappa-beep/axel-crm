import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { FormDialogComponent, FieldDef, FormDialogData } from '../../shared/form-dialog/form-dialog.component';
import { BaseService } from '../../core/services/base.service';
import { CalendarEvent } from '../../core/models/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-calendar-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, FormsModule],
  template: `
    <div class="calendar-wrapper flex flex-col h-full bg-slate-50/40">
      <!-- HEADER AND CONTROLS -->
      <div class="flex flex-wrap items-center justify-between p-6 bg-white border-b border-gray-100 gap-4">
        <div class="flex items-center gap-3">
          <div class="calendar-icon-bg">
            <mat-icon class="text-blue-600">calendar_month</mat-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-[#00072d] m-0">Calendário</h1>
            <p class="text-xs text-slate-400 m-0">Gerencie reuniões, prazos e compromissos</p>
          </div>
        </div>

        <div class="flex items-center gap-3 flex-wrap">
          <!-- SEARCH FIELD -->
          <div class="search-box">
            <mat-icon class="search-icon">search</mat-icon>
            <input
              type="text"
              placeholder="Buscar evento..."
              [(ngModel)]="searchQuery"
              (input)="filterEvents()"
            />
          </div>

          <!-- NAVIGATION CONTROLS -->
          <div class="navigation-group">
            <button mat-icon-button (click)="prevMonth()" class="nav-btn">
              <mat-icon>chevron_left</mat-icon>
            </button>
            <h2 class="month-title">{{ monthNames[currentMonth] }} {{ currentYear }}</h2>
            <button mat-icon-button (click)="nextMonth()" class="nav-btn">
              <mat-icon>chevron_right</mat-icon>
            </button>
          </div>

          <button mat-stroked-button (click)="goToToday()" class="today-btn">
            Hoje
          </button>

          <button mat-stroked-button (click)="syncGoogleCalendar()" class="today-btn">
            <mat-icon>sync</mat-icon> Sincronizar Google
          </button>

          <button mat-flat-button color="primary" (click)="openDialog()" class="new-event-btn">
            <mat-icon>add</mat-icon> Novo Evento
          </button>
        </div>
      </div>

      <!-- MAIN CALENDAR & DETAIL LAYOUT -->
      <div class="flex-1 flex overflow-hidden p-6 gap-6">
        
        <!-- CALENDAR MONTH GRID -->
        <div class="flex-1 flex flex-col bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div class="calendar-weekdays">
            <div *ngFor="let d of weekDays">{{ d }}</div>
          </div>
          <div class="calendar-grid">
            <div *ngFor="let day of days" class="calendar-day"
              [class.other-month]="day.other"
              [class.today]="day.today"
              [class.selected-day]="selectedDay === day"
              (click)="selectDay(day)">
              
              <div class="day-header">
                <span class="day-number">{{ day.num }}</span>
              </div>

              <div class="day-events">
                <div *ngFor="let ev of day.filteredEvents" class="day-event"
                  [ngClass]="getEventColorClass(ev)"
                  [title]="ev.title"
                  (click)="$event.stopPropagation(); openDialog(ev)">
                  <span class="event-line"></span>
                  <span class="event-time font-mono">{{ ev.startTime | slice:11:16 }}</span>
                  <span class="event-title truncate">{{ ev.title }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SIDEBAR DETAILS PANEL -->
        <div class="w-80 flex flex-col bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5 overflow-hidden">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 class="font-bold text-slate-800 text-sm m-0">Compromissos do Dia</h3>
            <span class="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {{ selectedDateStr }}
            </span>
          </div>

          <div class="flex-1 overflow-y-auto space-y-3 pr-1" style="max-height: calc(100vh - 280px);">
            <div *ngIf="selectedDayEvents.length === 0" class="no-events-state">
              <mat-icon>event_available</mat-icon>
              <p>Nenhum compromisso marcado para este dia.</p>
            </div>

            <div *ngFor="let ev of selectedDayEvents" class="side-event-card"
              [ngClass]="getEventColorClass(ev)"
              (click)="openDialog(ev)">
              <div class="side-event-bar"></div>
              <div class="p-3.5 flex-1">
                <div class="flex justify-between items-start mb-1">
                  <h4 class="font-semibold text-slate-800 text-sm leading-snug truncate pr-2">{{ ev.title }}</h4>
                  <span class="text-xs font-mono text-slate-500 whitespace-nowrap">
                    {{ ev.startTime | slice:11:16 }}
                  </span>
                </div>
                <p *ngIf="ev.description" class="text-xs text-slate-400 line-clamp-2 mb-2">{{ ev.description }}</p>
                <div class="flex items-center gap-1.5 text-xs text-slate-400">
                  <mat-icon style="font-size: 14px; width: 14px; height: 14px; color: var(--muted);">place</mat-icon>
                  <span class="truncate">{{ ev.location || 'Sem local' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .calendar-icon-bg {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: rgba(59, 130, 246, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      
      mat-icon {
        font-size: 22px;
        width: 22px;
        height: 22px;
      }
    }

    .search-box {
      position: relative;
      display: flex;
      align-items: center;
      
      .search-icon {
        position: absolute;
        left: 14px;
        color: var(--muted);
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
      
      input {
        background: var(--bg-elevated);
        border: 1px solid var(--hairline);
        border-radius: 9999px;
        padding: 8px 16px 8px 40px;
        font-size: 13.5px;
        color: var(--ink);
        width: 210px;
        transition: border-color 0.2s ease, box-shadow 0.2s ease, width 0.2s ease;
        outline: none;
        
        &:focus {
          background: var(--card-bg);
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary-light);
          width: 250px;
        }
      }
    }

    .navigation-group {
      display: flex;
      align-items: center;
      background: var(--bg-elevated);
      border: 1px solid var(--hairline);
      border-radius: 9999px;
      padding: 2px 6px;
      
      .nav-btn {
        width: 32px;
        height: 32px;
        line-height: 32px;
        color: var(--body);
        
        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }
      
      .month-title {
        font-family: 'Outfit', sans-serif;
        font-size: 14.5px;
        font-weight: 700;
        color: var(--ink);
        margin: 0;
        min-width: 140px;
        text-align: center;
      }
    }

    .today-btn {
      border-radius: 9999px !important;
      font-weight: 600 !important;
      font-size: 13.5px !important;
      color: var(--body) !important;
      border-color: var(--hairline-strong) !important;
      height: 38px !important;
    }

    .new-event-btn {
      border-radius: 9999px !important;
      font-weight: 600 !important;
      height: 38px !important;
    }

    .calendar-weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      background: var(--bg-elevated);
      border-bottom: 1px solid var(--hairline);
      
      div {
        padding: 12px 10px;
        text-align: center;
        font-weight: 700;
        font-size: 12.5px;
        color: var(--muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }

    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      grid-template-rows: repeat(6, 1fr);
      flex: 1;
      background: var(--hairline);
      gap: 1px;
    }

    .calendar-day {
      background: var(--card-bg);
      padding: 8px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      transition: background-color 0.15s ease;
      min-height: 80px;
      position: relative;
      
      &:hover {
        background: var(--bg-elevated);
      }
      
      &.other-month {
        background: var(--bg-dark);
        .day-number {
          color: var(--muted);
          opacity: 0.55;
        }
      }
      
      &.selected-day {
        background: var(--primary-light);
        box-shadow: inset 0 0 0 2px var(--primary);
      }
      
      &.today {
        .day-number {
          background: var(--primary);
          color: #ffffff;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }

    .day-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }

    .day-number {
      font-size: 13px;
      font-weight: 700;
      color: var(--ink);
    }

    .day-events {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 3px;
      
      &::-webkit-scrollbar {
        width: 3px;
      }
      &::-webkit-scrollbar-thumb {
        background: var(--bg-elevated);
        border-radius: 2px;
      }
    }

    .day-event {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      font-weight: 600;
      padding: 3px 6px;
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: transform 0.15s ease;
      
      &:hover {
        transform: scale(1.02);
      }

      .event-line {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
      }

      .event-time {
        font-size: 9.5px;
        opacity: 0.7;
      }
    }

    // COLOR SCHEMES FOR EVENTS (readable on dark + light via tokens)
    .ev-green {
      background: rgba(16, 185, 129, 0.16) !important;
      color: var(--success) !important;
      .event-line, .side-event-bar { background: #10b981; }
    }
    .ev-teal {
      background: rgba(20, 184, 166, 0.16) !important;
      color: #14b8a6 !important;
      .event-line, .side-event-bar { background: #14b8a6; }
    }
    .ev-red {
      background: rgba(239, 68, 68, 0.16) !important;
      color: var(--danger) !important;
      .event-line, .side-event-bar { background: #ef4444; }
    }
    .ev-blue {
      background: rgba(59, 130, 246, 0.16) !important;
      color: var(--info) !important;
      .event-line, .side-event-bar { background: #3b82f6; }
    }

    .no-events-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
      color: var(--muted);
      
      mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        margin-bottom: 8px;
      }
      
      p {
        font-size: 12.5px;
        margin: 0;
      }
    }

    .side-event-card {
      display: flex;
      border: 1px solid var(--hairline);
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      transition: border-color 0.2s ease, background-color 0.2s ease;
      background: var(--card-bg);
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 15px rgba(0, 0, 0, 0.04);
        border-color: var(--muted);
      }

      .side-event-bar {
        width: 4px;
        flex-shrink: 0;
      }
    }
  `]
})
export class CalendarListComponent implements OnInit {
  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();
  events: CalendarEvent[] = [];
  filteredEventsList: CalendarEvent[] = [];

  weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  days: DayCell[] = [];
  selectedDay: DayCell | null = null;
  selectedDayEvents: CalendarEvent[] = [];
  selectedDateStr = '';
  searchQuery = '';

  fields: FieldDef[] = [
    { key: 'title', label: 'Título', type: 'text', required: true },
    { key: 'description', label: 'Descrição', type: 'textarea' },
    { key: 'startTime', label: 'Início', type: 'datetime-local', required: true },
    { key: 'endTime', label: 'Término', type: 'datetime-local', required: true },
    { key: 'allDay', label: 'Dia Inteiro', type: 'checkbox' },
    { key: 'location', label: 'Local', type: 'text' },
  ];

  constructor(
    private svc: BaseService<CalendarEvent>,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.svc.getPage('calendar-events', 0, 500, 'startTime,asc').subscribe({
      next: (page) => {
        this.events = page.content;
        this.filterEvents();
        this.syncGoogleCalendar(false);
      },
      error: () => {
        this.filterEvents();
      }
    });
  }

  syncGoogleCalendar(showMessage = true): void {
    this.http.get<any>(`${environment.apiUrl}/integrations/google/status`).subscribe({
      next: (status) => {
        if (!status.connected) {
          if (showMessage) this.snackBar.open('Conecte sua conta Google em Configurações → Integrações.', 'OK', { duration: 4000 });
          return;
        }
        this.http.get<any>(`${environment.apiUrl}/integrations/google/calendar`).subscribe({
          next: (response) => {
            const googleEvents = (response.items || []).map((event: any) => this.mapGoogleEvent(event));
            const localEvents = this.events.filter((event: any) => event.source !== 'GOOGLE');
            this.events = [...localEvents, ...googleEvents];
            this.filterEvents();
            if (showMessage) this.snackBar.open(`${googleEvents.length} evento(s) do Google sincronizado(s).`, 'OK', { duration: 3000 });
          },
          error: () => this.snackBar.open('Não foi possível carregar os eventos do Google Calendar.', 'OK', { duration: 4000 })
        });
      },
      error: () => {
        if (showMessage) this.snackBar.open('Conecte sua conta Google em Configurações → Integrações.', 'OK', { duration: 4000 });
      }
    });
  }

  private mapGoogleEvent(event: any): CalendarEvent & { source: string } {
    const start = event.start?.dateTime || `${event.start?.date}T00:00:00`;
    const end = event.end?.dateTime || `${event.end?.date}T00:00:00`;
    return {
      id: `google-${event.id}`,
      title: event.summary || '(Sem título)',
      description: event.description || '',
      startTime: start,
      endTime: end,
      allDay: !event.start?.dateTime,
      location: event.location || '',
      source: 'GOOGLE',
    } as CalendarEvent & { source: string };
  }

  filterEvents(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredEventsList = [...this.events];
    } else {
      this.filteredEventsList = this.events.filter(ev => 
        (ev.title && ev.title.toLowerCase().includes(query)) ||
        (ev.description && ev.description.toLowerCase().includes(query)) ||
        (ev.location && ev.location.toLowerCase().includes(query))
      );
    }
    this.buildGrid();
  }

  prevMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.buildGrid();
  }

  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.buildGrid();
  }

  goToToday(): void {
    const today = new Date();
    this.currentMonth = today.getMonth();
    this.currentYear = today.getFullYear();
    this.buildGrid();
    
    // Select today cell
    const todayCell = this.days.find(d => d.today && !d.other);
    if (todayCell) {
      this.selectDay(todayCell);
    }
  }

  selectDay(day: DayCell): void {
    this.selectedDay = day;
    if (day.other) {
      this.currentMonth = day.month;
      this.currentYear = day.year;
      this.buildGrid();
      // Re-find the cell in the new month
      const activeCell = this.days.find(d => d.num === day.num && !d.other);
      if (activeCell) this.selectedDay = activeCell;
    }
    
    this.selectedDayEvents = this.selectedDay ? this.selectedDay.events : [];
    this.selectedDateStr = `${String(day.num).padStart(2, '0')}/${String(day.month + 1).padStart(2, '0')}/${day.year}`;
  }

  buildGrid(): void {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const startPad = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const prevMonthDays = new Date(this.currentYear, this.currentMonth, 0).getDate();

    const cells: DayCell[] = [];

    // Prev month padding
    for (let i = startPad - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const m = this.currentMonth - 1 < 0 ? 11 : this.currentMonth - 1;
      const y = this.currentMonth - 1 < 0 ? this.currentYear - 1 : this.currentYear;
      const dateStr = this.padDate(y, m, d);
      const dayEvents = this.filteredEventsList.filter(e => e.startTime?.startsWith(dateStr));
      cells.push({ num: d, other: true, month: m, year: y, events: dayEvents, filteredEvents: dayEvents, today: false });
    }

    // Current month days
    const now = new Date();
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = d === now.getDate() && this.currentMonth === now.getMonth() && this.currentYear === now.getFullYear();
      const dateStr = this.padDate(this.currentYear, this.currentMonth, d);
      const dayEvents = this.filteredEventsList.filter(e => e.startTime?.startsWith(dateStr));
      cells.push({ num: d, other: false, month: this.currentMonth, year: this.currentYear, events: dayEvents, filteredEvents: dayEvents, today: isToday });
    }

    // Next month padding
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const m = this.currentMonth + 1 > 11 ? 0 : this.currentMonth + 1;
      const y = this.currentMonth + 1 > 11 ? this.currentYear + 1 : this.currentYear;
      const dateStr = this.padDate(y, m, d);
      const dayEvents = this.filteredEventsList.filter(e => e.startTime?.startsWith(dateStr));
      cells.push({ num: d, other: true, month: m, year: y, events: dayEvents, filteredEvents: dayEvents, today: false });
    }

    this.days = cells;

    // Reset or keep selection
    const activeSelection = this.selectedDay 
      ? cells.find(c => c.num === this.selectedDay!.num && c.month === this.selectedDay!.month && c.year === this.selectedDay!.year)
      : cells.find(c => c.today && !c.other);

    if (activeSelection) {
      this.selectDay(activeSelection);
    } else if (cells.length > 0) {
      this.selectDay(cells[0]);
    }
  }

  private padDate(year: number, month: number, day: number): string {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  getEventColorClass(ev: CalendarEvent): string {
    const t = (ev.title || '').toLowerCase();
    if (t.includes('reunião') || t.includes('meeting') || t.includes('conversa')) {
      return 'ev-green';
    }
    if (t.includes('audiência') || t.includes('julgamento') || t.includes('processo') || t.includes('tribunal')) {
      return 'ev-teal';
    }
    if (t.includes('urgente') || t.includes('prazo') || t.includes('limite') || t.includes('entrega')) {
      return 'ev-red';
    }
    return 'ev-blue';
  }

  openDialog(entity?: any): void {
    if (entity?.source === 'GOOGLE') {
      this.snackBar.open('Este evento é gerenciado pelo Google Calendar.', 'OK', { duration: 3000 });
      return;
    }
    const data: FormDialogData = {
      title: entity ? 'Editar Evento' : 'Novo Evento',
      fields: this.fields,
      entity: entity ? {
        title: entity.title,
        description: entity.description,
        startTime: entity.startTime,
        endTime: entity.endTime,
        allDay: entity.allDay,
        location: entity.location,
      } : undefined,
    };

    this.dialog.open(FormDialogComponent, { data, width: '500px' })
      .afterClosed()
      .subscribe(result => {
        if (!result) return;
        const op = entity
          ? this.svc.update('calendar-events', entity.id!, result)
          : this.svc.create('calendar-events', result);
        op.subscribe({
          next: () => {
            this.snackBar.open('Salvo com sucesso!', 'OK', { duration: 3000 });
            this.loadEvents();
          },
          error: () => this.snackBar.open('Erro ao salvar', 'OK', { duration: 3000 }),
        });
      });
  }
}

interface DayCell {
  num: number;
  other: boolean;
  month: number;
  year: number;
  events: CalendarEvent[];
  filteredEvents: CalendarEvent[];
  today: boolean;
}
