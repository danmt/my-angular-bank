import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'pay',
    loadComponent: () =>
      import('./pay-page.component').then((m) => m.PayPageComponent),
  },
  {
    path: 'balance',
    loadComponent: () =>
      import('./balance-page.component').then((m) => m.BalancePageComponent),
  },
  {
    path: '**',
    redirectTo: 'balance',
  },
];
