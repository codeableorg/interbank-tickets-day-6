import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'tickets',
    loadComponent: () => import('./feature/ticket-list/ticket-list.component'),
  },
  {
    path: 'tickets/:id',
    loadComponent: () =>
      import('./feature/ticket-detail/ticket-detail.component'),
  },
  {
    path: '',
    redirectTo: 'tickets',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'tickets',
  },
];
