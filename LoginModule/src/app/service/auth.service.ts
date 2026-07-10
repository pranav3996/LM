import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import moment from 'moment';
import { StorageService } from './storage.service';
import { AuthResponse, LoginRequest, RefreshTokenRequest } from '../models/api.models';

export interface AuthUser {
  email: string;
  role: string;
  accessToken: string;
  refreshToken: string;
  expirationAccessTokenTime: string;
  expirationRefreshTokenTime: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private storage = inject(StorageService);

  private LOGIN_URL = `${environment.AUTH_URL}/login`;
  private REFRESH_URL = `${environment.AUTH_URL}/refresh`;
  private activityTimeout: ReturnType<typeof setTimeout> | null = null;

  // ── State ──────────────────────────────────────────────────────────────────
  private _currentUser$ = new BehaviorSubject<AuthUser | null>(this.rehydrate());

  // ── Public read-only observables ───────────────────────────────────────────
  readonly currentUser$: Observable<AuthUser | null> = this._currentUser$.asObservable();
  readonly isAuthenticated$: Observable<boolean> = new BehaviorSubject<boolean>(false); // derived below

  // Used by the interceptor for token-refresh coordination
  refreshTokenInProgress = false;
  refreshTokenSubject = new BehaviorSubject<string | null>(null);

  // ── Snapshot helpers ───────────────────────────────────────────────────────
  getCurrentUser(): AuthUser | null { return this._currentUser$.getValue(); }
  isAuthenticated(): boolean { return !!this.storage.getItem('accessToken'); }
  isAdmin(): boolean { return this.storage.getItem('role') === 'ADMIN'; }
  isUser(): boolean { return this.storage.getItem('role') === 'USER'; }

  // ── API ────────────────────────────────────────────────────────────────────
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.LOGIN_URL, { email, password } satisfies LoginRequest).pipe(
      tap((res) => {
        if (res?.accessToken) {
          this._currentUser$.next({
            email: res.email,
            role: res.role,
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
            expirationAccessTokenTime: res.expirationAccessTokenTime,
            expirationRefreshTokenTime: res.expirationRefreshTokenTime,
          });
        }
      })
    );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.storage.getItem('refreshToken');
    if (!refreshToken) {
      this.logOut();
      return throwError(() => new Error('No refresh token found.'));
    }

    return this.http.post<AuthResponse>(this.REFRESH_URL, { refreshToken } satisfies RefreshTokenRequest).pipe(
      tap((res) => {
        if (res?.accessToken) {
          this.storage.setItem('accessToken', res.accessToken);
          this.storage.setItem('expirationAccessTokenTime', res.expirationAccessTokenTime);
          this.storage.setItem('refreshToken', res.refreshToken);
          this.storage.setItem('expirationRefreshTokenTime', res.expirationRefreshTokenTime);
          const current = this._currentUser$.getValue();
          if (current) {
            this._currentUser$.next({
              ...current,
              accessToken: res.accessToken,
              refreshToken: res.refreshToken,
              expirationAccessTokenTime: res.expirationAccessTokenTime,
              expirationRefreshTokenTime: res.expirationRefreshTokenTime,
            });
          }
        } else {
          this.logOut();
        }
      }),
      catchError((err) => {
        this.logOut();
        return throwError(() => err);
      })
    );
  }

  logOut(): void {
    this._currentUser$.next(null);
    this.storage.clear();
    this.router.navigate(['/login']);
  }

  setLogoutTimer(expirationAccessTokenTime: string): void {
    const duration =
      moment(expirationAccessTokenTime, 'ddd MMM DD HH:mm:ss zz YYYY').toDate().getTime() - Date.now();
    setTimeout(() => this.refreshToken().subscribe(), duration);
  }

  updateInactivityTime(expirationRefreshTokenTime: string): void {
    const inactivityTime =
      moment(expirationRefreshTokenTime, 'ddd MMM DD HH:mm:ss zz YYYY').toDate().getTime() - Date.now();
    if (inactivityTime > 0) {
      this.resetActivityTimeout(inactivityTime);
    } else {
      this.logOut();
    }
  }

  // ── Private ────────────────────────────────────────────────────────────────
  private rehydrate(): AuthUser | null {
    // Restore auth state from session storage on page refresh (SSR-safe)
    if (typeof window === 'undefined' || !window.sessionStorage) return null;
    const accessToken = sessionStorage.getItem('accessToken');
    const refreshToken = sessionStorage.getItem('refreshToken');
    const email = sessionStorage.getItem('email');
    const role = sessionStorage.getItem('role');
    const expirationAccessTokenTime = sessionStorage.getItem('expirationAccessTokenTime');
    const expirationRefreshTokenTime = sessionStorage.getItem('expirationRefreshTokenTime');
    if (!accessToken || !email || !role) return null;
    return {
      email,
      role,
      accessToken,
      refreshToken: refreshToken ?? '',
      expirationAccessTokenTime: expirationAccessTokenTime ?? '',
      expirationRefreshTokenTime: expirationRefreshTokenTime ?? '',
    };
  }

  private resetActivityTimeout(inactivityTime: number): void {
    if (this.activityTimeout) clearTimeout(this.activityTimeout);
    this.activityTimeout = setTimeout(() => this.logOut(), inactivityTime);
  }
}
