import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router      = inject(Router);

  const expectedRoles = route.data['roles'] as string[];
  const userRole      = authService.getRole();

  if (expectedRoles.includes(userRole)) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};