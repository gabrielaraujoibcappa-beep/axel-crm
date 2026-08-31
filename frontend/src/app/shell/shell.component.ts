import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { HttpClient } from '@angular/common/http';
import { Subject, interval, switchMap, takeUntil, filter } from 'rxjs';
import { AuthService } from '../core/services/auth.service';
import { environment } from '../../environments/environment';
import { GlobalTimerComponent } from './timer.component';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    GlobalTimerComponent,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent implements OnInit, OnDestroy {
  isMobile = false;
  sidenavOpened = true;
  isDarkTheme = true;
  private readonly themeKey = 'axel-crm-theme';
  private destroy$ = new Subject<void>();

  private applyTheme(dark: boolean): void {
    this.isDarkTheme = dark;
    if (dark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem(this.themeKey, 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem(this.themeKey, 'light');
    }
  }

  toggleTheme(): void {
    this.applyTheme(!this.isDarkTheme);
  }

  userName = '';
  userRole = '';

  isAdmin(): boolean {
    return this.userRole === 'ADMIN' || this.userRole === 'SUPER_ADMIN';
  }
  notifications: any[] = [];
  unreadCount = 0;
  private pollingSub?: any;
  private pollingFailCount = 0;

  breadcrumbs: { label: string; route: string }[] = [];

  private   routeLabels: Record<string, string> = {
    'dashboard': 'Dashboard',
    'products': 'Produtos',
    'calendar': 'Agenda',
    'clients': 'Clientes',
    'partners': 'Parceiros',
    'prospects': 'Prospecção',
    'leads': 'Leads',
    'contacts': 'Contatos',
    'deals': 'Negócios',
    'whatsapp': 'WhatsApp',
    'pipelines': 'Pipelines',
    'projects': 'Projetos',
    'tasks': 'Tarefas',
    'proposals': 'Propostas',
    'campaigns': 'Campanhas',
    'contracts': 'Contratos',
    'tickets': 'Tickets',
    'invoices': 'Faturamento',
    'transactions': 'Transações',
    'bank-accounts': 'Contas Bancárias',
    'time-entries': 'Horas',
    'commissions': 'Comissões',
    'users': 'Usuários',
    'chart-of-accounts': 'Plano de Contas',
    'reports': 'Relatórios',
    'legal-processes': 'Processos',
    'documents': 'Documentos',
    'integrations': 'Integrações',
  };

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
  ];

  navSections = [
    {
      label: 'CRM',
      items: [
        { label: 'Prospecção', icon: 'person_search', route: '/prospects' },
        { label: 'Agenda', icon: 'calendar_month', route: '/calendar' },
        { label: 'Parceiros / Indicadores', icon: 'handshake', route: '/partners' },
        { label: 'Clientes', icon: 'people', route: '/clients' },
        { label: 'Contatos', icon: 'contacts', route: '/contacts' },
        { label: 'Leads', icon: 'leaderboard', route: '/leads' },
        { label: 'Negócios', icon: 'handshake', route: '/deals' },
        { label: 'WhatsApp', icon: 'chat', route: '/whatsapp' },
        { label: 'Pipelines', icon: 'linear_scale', route: '/pipelines' },
      ]
    },
    {
      label: 'Operações',
      items: [
        { label: 'Projetos', icon: 'folder', route: '/projects' },
        { label: 'Produtos', icon: 'inventory_2', route: '/products' },
        { label: 'Contratos', icon: 'description', route: '/contracts' },
        { label: 'Processos', icon: 'gavel', route: '/legal-processes' },
        { label: 'Tarefas', icon: 'task_alt', route: '/tasks' },
        { label: 'Propostas', icon: 'description', route: '/proposals' },
        { label: 'Campanhas', icon: 'campaign', route: '/campaigns' },
        { label: 'Tickets', icon: 'support_agent', route: '/tickets' },
        { label: 'Documentos', icon: 'folder_open', route: '/documents' },
      ]
    },
    {
      label: 'Financeiro',
      items: [
        { label: 'Faturamento', icon: 'receipt', route: '/invoices' },
        { label: 'Transações', icon: 'payments', route: '/transactions' },
        { label: 'Plano de Contas', icon: 'account_tree', route: '/chart-of-accounts' },
        { label: 'Relatórios', icon: 'analytics', route: '/reports' },
        { label: 'Contas Bancárias', icon: 'account_balance', route: '/bank-accounts' },
        { label: 'Horas', icon: 'schedule', route: '/time-entries' },
        { label: 'Comissões', icon: 'monetization_on', route: '/commissions' },
      ]
    },
    {
      label: 'Admin',
      items: [
        { label: 'Usuários', icon: 'manage_accounts', route: '/users' },
        { label: 'Integrações', icon: 'settings_ethernet', route: '/integrations' },
      ]
    },
  ];

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.isMobile = result.matches;
        this.sidenavOpened = !this.isMobile;
      });

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => this.updateBreadcrumbs());
  }

  private updateBreadcrumbs(): void {
    const segments = this.router.url.split('/').filter(s => s);
    this.breadcrumbs = segments.map((segment, i) => ({
      label: this.routeLabels[segment] || segment,
      route: '/' + segments.slice(0, i + 1).join('/')
    }));
  }

  isTourActive = false;
  tourCurrentIndex = 0;
  tourPopoverTop = '0px';
  tourPopoverLeft = '0px';
  activeTourStep: any = {};

  tourSteps = [
    {
      selector: '.sidenav-header',
      title: 'Bem-vindo ao Axel CRM! 🚀',
      description: 'Este é o seu novo painel de controle comercial e operacional. Vamos te apresentar as principais áreas do sistema.',
      placement: 'right'
    },
    {
      selector: 'mat-nav-list',
      title: 'Menu de Módulos 🧭',
      description: 'Aqui você acessa todos os recursos do sistema: Leads, Negócios, Propostas, Projetos, Financeiro, Comissões e Conformidade LGPD.',
      placement: 'right'
    },
    {
      selector: '.sidenav-toggle-btn',
      title: 'Recolher Menu 🍔',
      description: 'Clique aqui a qualquer momento para recolher a barra lateral e expandir sua área de trabalho.',
      placement: 'bottom'
    },
    {
      selector: '.notification-toggle-btn',
      title: 'Central de Notificações 🔔',
      description: 'Acompanhe alertas importantes, como novos leads recebidos, propostas aprovadas ou movimentações financeiras.',
      placement: 'bottom'
    },
    {
      selector: '.theme-toggle-btn',
      title: 'Modo Escuro / Claro 🌓',
      description: 'Alterne entre o tema escuro e claro de forma simples para melhor conforto visual.',
      placement: 'bottom'
    },
    {
      selector: '.user-toggle-btn',
      title: 'Menu do Usuário 👤',
      description: 'Acesse suas configurações de perfil, conta e saia do sistema com segurança.',
      placement: 'bottom'
    }
  ];

  ngOnInit(): void {
    const saved = localStorage.getItem(this.themeKey);
    this.applyTheme(saved !== 'light'); // default dark

    this.authService.user$.pipe(takeUntil(this.destroy$)).subscribe(u => {
      this.userName = u ? u.name : '';
      this.userRole = u ? u.role : '';
      if (u) {
        this.startNotificationPolling();
        if (!localStorage.getItem('systemOnboardingTourCompleted')) {
          setTimeout(() => this.startTour(), 1500);
        }
      } else {
        this.stopNotificationPolling();
      }
    });
  }

  startNotificationPolling(): void {
    this.loadNotifications();
    this.pollingSub = interval(15000)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => {
          const api = environment.apiUrl;
          return this.http.get<any>(`${api}/notifications?size=10&sort=createdAt,desc`);
        })
      )
      .subscribe({
        next: (res: any) => {
          this.pollingFailCount = 0;
          this.notifications = res.content || [];
          this.unreadCount = this.notifications.filter(n => !n.read).length;
        }
      });
  }

  stopNotificationPolling(): void {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
      this.pollingSub = null;
    }
  }

  loadNotifications(): void {
    const api = environment.apiUrl;
    this.http.get<any>(`${api}/notifications?size=10&sort=createdAt,desc`).subscribe({
      next: (res: any) => {
        this.pollingFailCount = 0;
        this.notifications = res.content || [];
        this.unreadCount = this.notifications.filter(n => !n.read).length;
      },
      error: () => {
        this.pollingFailCount++;
        if (this.pollingFailCount >= 5) {
          this.stopNotificationPolling();
        }
      }
    });
  }

  markAsRead(notification: any): void {
    if (notification.read) return;
    const api = environment.apiUrl;
    this.http.put<any>(`${api}/notifications/${notification.id}/read`, {}).subscribe({
      next: () => {
        notification.read = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      }
    });
  }

  markAllAsRead(): void {
    const api = environment.apiUrl;
    this.http.put<any>(`${api}/notifications/read-all`, {}).subscribe({
      next: () => {
        this.notifications.forEach(n => n.read = true);
        this.unreadCount = 0;
      }
    });
  }

  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }

  logout(): void {
    this.stopNotificationPolling();
    this.authService.logout();
  }

  startTour(): void {
    this.isTourActive = true;
    this.tourCurrentIndex = 0;
    this.showTourStep(0);
  }

  showTourStep(index: number): void {
    // Clear previous highlight
    document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));

    this.tourCurrentIndex = index;
    this.activeTourStep = this.tourSteps[index];

    setTimeout(() => {
      const targetEl = document.querySelector(this.activeTourStep.selector);
      if (!targetEl) {
        console.warn(`Element ${this.activeTourStep.selector} not found for tour step`);
        this.nextTourStep();
        return;
      }

      // Add highlight class
      targetEl.classList.add('tour-highlight');
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Calculate position
      const rect = targetEl.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      let top = 0;
      let left = 0;

      // Estimated popover size: 320px width, 180px height
      const popoverWidth = 320;
      const popoverHeight = 180;

      if (this.activeTourStep.placement === 'bottom') {
        top = rect.bottom + scrollY + 12;
        left = rect.left + scrollX + (rect.width / 2) - (popoverWidth / 2);
      } else if (this.activeTourStep.placement === 'top') {
        top = rect.top + scrollY - popoverHeight - 12;
        left = rect.left + scrollX + (rect.width / 2) - (popoverWidth / 2);
      } else if (this.activeTourStep.placement === 'right') {
        top = rect.top + scrollY + (rect.height / 2) - (popoverHeight / 2);
        left = rect.right + scrollX + 12;
      } else if (this.activeTourStep.placement === 'left') {
        top = rect.top + scrollY + (rect.height / 2) - (popoverHeight / 2);
        left = rect.left + scrollX - popoverWidth - 12;
      }

      // Boundary checks
      if (left < 10) left = 10;
      if (left + popoverWidth > window.innerWidth) left = window.innerWidth - popoverWidth - 10;

      this.tourPopoverTop = `${top}px`;
      this.tourPopoverLeft = `${left}px`;
    }, 150);
  }

  nextTourStep(): void {
    if (this.tourCurrentIndex === this.tourSteps.length - 1) {
      this.endTour();
    } else {
      this.showTourStep(this.tourCurrentIndex + 1);
    }
  }

  prevTourStep(): void {
    if (this.tourCurrentIndex > 0) {
      this.showTourStep(this.tourCurrentIndex - 1);
    }
  }

  endTour(): void {
    this.isTourActive = false;
    document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));
    localStorage.setItem('systemOnboardingTourCompleted', 'true');
  }

  getArrowClass(): Record<string, boolean> {
    const placement = this.activeTourStep?.placement;
    return {
      'tour-arrow-top': placement === 'bottom',
      'tour-arrow-bottom': placement === 'top',
      'tour-arrow-left': placement === 'right',
      'tour-arrow-right': placement === 'left'
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopNotificationPolling();
  }
}
