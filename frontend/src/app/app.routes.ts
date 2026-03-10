import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth/auth-guard';
import { roleGuard } from './core/guards/role/role-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Public
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login')
        .then(m => m.LoginComponent)  // ← Fix: Login not LoginComponent
  },

  // Protected
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/main-layout/main-layout')
        .then(m => m.MainLayout),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard')
            .then(m => m.Dashboard)
      },
      {
        path: 'requests',
        loadComponent: () =>
          import('./pages/requests/request-list/request-list')
            .then(m => m.RequestList)
      },
      {
        path: 'requests/create',
        canActivate: [roleGuard],
        data: { roles: ['Employee', 'Reviewer', 'Admin'] },
        loadComponent: () =>
          import('./pages/requests/request-create/request-create')
            .then(m => m.RequestCreate)
      },
      {
        path: 'requests/:id',
        loadComponent: () =>
          import('./pages/requests/request-detail/request-detail')
            .then(m => m.RequestDetail)
      },
      {
        path: 'requests/:id/edit',
        canActivate: [roleGuard],
        data: { roles: ['Employee', 'Reviewer', 'Admin'] },
        loadComponent: () =>
            import('./pages/requests/request-edit/request-edit')
            .then(m => m.RequestEdit)
        },
      {
        path: 'review',
        canActivate: [roleGuard],
        data: { roles: ['Reviewer', 'Admin'] },
        loadComponent: () =>
          import('./pages/review/review-list/review-list')
            .then(m => m.ReviewList)
      },
      {
        path: 'all-requests',
        canActivate: [roleGuard],
        data: { roles: ['Admin'] },
        loadComponent: () =>
          import('./pages/requests/request-list/request-list')
            .then(m => m.RequestList)
      },
      {
        path: 'users',
        canActivate: [roleGuard],
        data: { roles: ['Admin'] },
        loadComponent: () =>
          import('./pages/users/user-list/user-list')
            .then(m => m.UserList)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];