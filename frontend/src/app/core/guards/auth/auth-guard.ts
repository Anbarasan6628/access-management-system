import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  const token = localStorage.getItem('ams_token');

  // No token → go to login
  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  // Token expired → go to login with session reason
  if (auth.isTokenExpired(token)) {
    localStorage.removeItem('ams_token');
    localStorage.removeItem('ams_user');
    router.navigate(['/login'], { queryParams: { reason: 'session' } });
    return false;
  }

  return true;
};