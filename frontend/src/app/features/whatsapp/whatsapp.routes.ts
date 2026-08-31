import { Routes } from '@angular/router';

export const WHATSAPP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./whatsapp-inbox.component').then((m) => m.WhatsappInboxComponent),
  },
];
