import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoginRequest, LoginResponse, CurrentUser } from '../../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);

  private readonly API = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'ams_token';
  private readonly USER_KEY  = 'ams_user';

  private currentUserSubject = new BehaviorSubject<CurrentUser | null>(
    this.getUserFromStorage()
  );
  currentUser$ = this.currentUserSubject.asObservable();

  // ── LOGIN ─────────────────────────────
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API}/login`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem(this.TOKEN_KEY, response.token);
          const user: CurrentUser = {
            id:         0,
            employeeId: response.employeeId,
            fullName:   response.fullName,
            email:      response.email,
            role:       response.role as 'Employee' | 'Reviewer' | 'Admin'
          };
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
          this.currentUserSubject.next(user);
        })
      );
  }

  // ── LOGOUT ────────────────────────────
  // reason: 'manual' | 'session' | 'timeout'
  logout(reason: string = 'manual'): void {
  localStorage.removeItem(this.TOKEN_KEY);
  localStorage.removeItem(this.USER_KEY);
  this.currentUserSubject.next(null);

  const url = reason === 'manual'
    ? '/login'
    : `/login?reason=${reason}`;

  // Force hard redirect — works even inside lazy-loaded routes
  window.location.href = url;
}
  // ── TOKEN ─────────────────────────────
  getToken(): string | null {
  const token = localStorage.getItem(this.TOKEN_KEY);
  if (!token) return null;

  // Just return null if expired — let the guard/interceptor handle redirect
  if (this.isTokenExpired(token)) {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    return null;  // ← NO router.navigate here
  }

  return token;
}

  // ── TOKEN EXPIRY CHECK ────────────────
  isTokenExpired(token?: string): boolean {
    const t = token ?? localStorage.getItem(this.TOKEN_KEY);
    if (!t) return true;
    try {
      const payload = JSON.parse(atob(t.split('.')[1]));
      // exp is in seconds, Date.now() in ms
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  // ── TOKEN EXPIRY TIME ─────────────────
  getTokenExpiryDate(): Date | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return new Date(payload.exp * 1000);
    } catch {
      return null;
    }
  }

  // ── GETTERS ───────────────────────────
  isLoggedIn(): boolean {
    return !!this.getToken(); // getToken() already checks expiry
  }

  getCurrentUser(): CurrentUser | null {
    return this.currentUserSubject.value;
  }

  getRole(): string {
    return this.getCurrentUser()?.role ?? '';
  }

  isAdmin():    boolean { return this.getRole() === 'Admin'; }
  isReviewer(): boolean { return this.getRole() === 'Reviewer'; }
  isEmployee(): boolean { return this.getRole() === 'Employee'; }

  private getUserFromStorage(): CurrentUser | null {
    const data = localStorage.getItem(this.USER_KEY);
    return data ? JSON.parse(data) : null;
  }
}