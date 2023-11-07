import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'payment',
    loadComponent: () =>
      import('./payment').then((m) => m.PaymentPageComponent),
  },
  {
    path: 'balance',
    loadComponent: () =>
      import('./balance').then((m) => m.BalancePageComponent),
  },
  {
    path: '**',
    redirectTo: 'balance',
  },
];
