import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'public/proposals/:token',
    loadComponent: () =>
      import('./features/proposals/public-proposal/public-proposal.component').then(m => m.PublicProposalComponent),
  },
  {
    path: 'portal',
    loadChildren: () =>
      import('./features/portal/portal.routes').then(m => m.PORTAL_ROUTES),
  },
  {
    path: '',
    loadComponent: () =>
      import('./shell/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component').then(m => m.ProfileComponent),
      },
      {
        path: 'products',
        loadChildren: () =>
          import('./features/products/products.routes').then(m => m.PRODUCTS_ROUTES),
      },
      {
        path: 'calendar',
        loadChildren: () =>
          import('./features/calendar/calendar.routes').then(m => m.CALENDAR_ROUTES),
      },
      {
        path: 'clients',
        loadChildren: () =>
          import('./features/clients/clients.routes').then(m => m.CLIENTS_ROUTES),
      },
      {
        path: 'partners',
        loadChildren: () =>
          import('./features/partners/partners.routes').then(m => m.PARTNERS_ROUTES),
      },
      {
        path: 'prospects',
        loadChildren: () =>
          import('./features/prospects/prospects.routes').then(m => m.PROSPECTS_ROUTES),
      },
      {
        path: 'leads',
        loadChildren: () =>
          import('./features/leads/leads.routes').then(m => m.LEADS_ROUTES),
      },
      {
        path: 'contacts',
        loadChildren: () =>
          import('./features/contacts/contacts.routes').then(m => m.CONTACTS_ROUTES),
      },
      {
        path: 'deals',
        loadChildren: () =>
          import('./features/deals/deals.routes').then(m => m.DEALS_ROUTES),
      },
      {
        path: 'whatsapp',
        loadChildren: () =>
          import('./features/whatsapp/whatsapp.routes').then(m => m.WHATSAPP_ROUTES),
      },
      {
        path: 'pipelines',
        loadChildren: () =>
          import('./features/pipelines/pipelines.routes').then(m => m.PIPELINES_ROUTES),
      },
      {
        path: 'projects',
        loadChildren: () =>
          import('./features/projects/projects.routes').then(m => m.PROJECTS_ROUTES),
      },
      {
        path: 'tasks',
        loadChildren: () =>
          import('./features/tasks/tasks.routes').then(m => m.TASKS_ROUTES),
      },
      {
        path: 'proposals',
        loadChildren: () =>
          import('./features/proposals/proposals.routes').then(m => m.PROPOSALS_ROUTES),
      },
      {
        path: 'contracts',
        loadChildren: () =>
          import('./features/contracts/contracts.routes').then(m => m.CONTRACTS_ROUTES),
      },
      {
        path: 'campaigns',
        loadChildren: () =>
          import('./features/campaigns/campaigns.routes').then(m => m.CAMPAIGNS_ROUTES),
      },
      {
        path: 'tickets',
        loadChildren: () =>
          import('./features/tickets/tickets.routes').then(m => m.TICKETS_ROUTES),
      },
      {
        path: 'invoices',
        loadChildren: () =>
          import('./features/invoices/invoices.routes').then(m => m.INVOICES_ROUTES),
      },
      {
        path: 'transactions',
        loadChildren: () =>
          import('./features/transactions/transactions.routes').then(m => m.TRANSACTIONS_ROUTES),
      },
      {
        path: 'bank-accounts',
        loadChildren: () =>
          import('./features/bank-accounts/bank-accounts.routes').then(m => m.BANK_ACCOUNTS_ROUTES),
      },
      {
        path: 'time-entries',
        loadChildren: () =>
          import('./features/time-entries/time-entries.routes').then(m => m.TIME_ENTRIES_ROUTES),
      },
      {
        path: 'commissions',
        loadChildren: () =>
          import('./features/commissions/commissions.routes').then(m => m.COMMISSIONS_ROUTES),
      },
      {
        path: 'users',
        canActivate: [adminGuard],
        loadChildren: () =>
          import('./features/users/users.routes').then(m => m.USERS_ROUTES),
      },
      {
        path: 'chart-of-accounts',
        loadChildren: () =>
          import('./features/chart-of-accounts/chart-of-accounts.routes').then(m => m.CHART_OF_ACCOUNTS_ROUTES),
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('./features/reports/reports.routes').then(m => m.REPORTS_ROUTES),
      },
      {
        path: 'legal-processes',
        loadChildren: () =>
          import('./features/legal-processes/legal-processes.routes').then(m => m.LEGAL_PROCESSES_ROUTES),
      },
      {
        path: 'documents',
        loadChildren: () =>
          import('./features/documents/documents.routes').then(m => m.DOCUMENTS_ROUTES),
      },
      {
        path: 'integrations',
        canActivate: [adminGuard],
        loadChildren: () =>
          import('./features/integrations/integrations.routes').then(m => m.INTEGRATIONS_ROUTES),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
