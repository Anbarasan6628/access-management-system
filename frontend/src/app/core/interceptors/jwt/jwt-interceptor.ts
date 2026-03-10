import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { timeout, catchError } from 'rxjs/operators';
import { throwError, TimeoutError } from 'rxjs';

const API_TIMEOUT_MS = 30000; // 30 seconds — change as needed

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  // ── Skip login request — avoid intercept loop ──
  if (req.url.includes('/api/auth/login')) {
    return next(req);
  }

  const token = auth.getToken();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(

    // ── Timeout ────────────────────────────
    timeout(API_TIMEOUT_MS),

    // ── Error Handling ─────────────────────
    catchError((error) => {

      // Timeout → logout with reason
      if (error instanceof TimeoutError) {
        console.warn('⏱ Request timed out after', API_TIMEOUT_MS, 'ms');
        auth.logout('timeout');
        return throwError(() => new Error('Request timed out'));
      }

      // 401 Unauthorized → session expired
      if (error instanceof HttpErrorResponse && error.status === 401) {
        auth.logout('session');
        return throwError(() => error);
      }

      // 403 Forbidden → redirect to dashboard (no logout)
      if (error instanceof HttpErrorResponse && error.status === 403) {
        router.navigate(['/dashboard']);
        return throwError(() => error);
      }

      // All other errors — pass through
      return throwError(() => error);
    })
  );
};