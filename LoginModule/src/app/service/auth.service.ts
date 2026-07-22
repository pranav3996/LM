import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthResponse, LoginRequest } from '../models/api.models';

export interface AuthUser {
  email: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly LOGIN_URL   = `${environment.AUTH_URL}/login`;
  private readonly REFRESH_URL = `${environment.AUTH_URL}/refresh`;
  private readonly LOGOUT_URL  = `${environment.AUTH_URL}/logout`;

  // ── In-memory token — never written to any browser storage ────────────────
  private readonly _accessToken  = signal<string | null>(null);
  private readonly _currentUser  = signal<AuthUser | null>(null);

  // ── Public read-only surface ───────────────────────────────────────────────
  readonly accessToken      = this._accessToken.asReadonly();
  readonly currentUser      = this._currentUser.asReadonly();
  readonly isAuthenticated  = computed(() => !!this._accessToken());
  readonly isAdmin          = computed(() => this._currentUser()?.role === 'ADMIN');
  readonly isUser           = computed(() => this._currentUser()?.role === 'USER');

  // ── Concurrent-refresh coordination (used by the interceptor) ─────────────
  /** True while a token refresh HTTP call is in-flight. */
  refreshInProgress = false;
  /**
   * Emits null when a refresh starts, then the new token when it succeeds,
   * or errors when the refresh fails (so queued requests unblock and error out).
   * Re-created by resetRefreshSubject() after an error so future logins work.
   */
  refreshSubject = new BehaviorSubject<string | null>(null);

  // ── Auth API ───────────────────────────────────────────────────────────────

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(this.LOGIN_URL, { email, password } satisfies LoginRequest, {
        withCredentials: true, // backend sets the HttpOnly refresh-token cookie
      })
      .pipe(tap((res) => this.applySession(res)));
  }

  /**
   * Silently restores a session on app startup by exchanging the HttpOnly
   * refresh-token cookie for a new access token.
   * Only runs in the browser — the SSR server has no cookie to send.
   */
  initSession(): Observable<AuthResponse> {
    if (!isPlatformBrowser(this.platformId)) {
      return throwError(() => new Error('SSR: skipping session init'));
    }
    return this.callRefresh().pipe(
      catchError((err) => {
        // No valid cookie or expired — stay unauthenticated, do NOT redirect
        this.clearSession();
        return throwError(() => err);
      }),
    );
  }

  /**
   * Exchanges the HttpOnly cookie for a fresh access token.
   * Called by the interceptor on 401. On failure, clears state (no redirect —
   * the interceptor / effect handles navigation).
   */
  refreshToken(): Observable<AuthResponse> {
    return this.callRefresh().pipe(
      catchError((err) => {
        this.clearSession();
        return throwError(() => err);
      }),
    );
  }

  /**
   * Calls POST /auth/logout with withCredentials so the server can clear the
   * HttpOnly cookie, then wipes the in-memory access token.
   * Returns an Observable so the NgRx effect can sequence navigation after it.
   */
  logout(): Observable<void> {
    return this.http
      .post<void>(this.LOGOUT_URL, {}, { withCredentials: true })
      .pipe(
        // Clear memory regardless of whether the server call succeeds
        tap({ next: () => this.clearSession(), error: () => this.clearSession() }),
      );
  }

  getAccessToken(): string | null {
    return this._accessToken();
  }

  /**
   * Imperatively clears in-memory auth state without an HTTP call.
   * Used by the interceptor when a token refresh fails mid-flight.
   */
  clearAuth(): void {
    this.clearSession();
  }

  /**
   * Re-initialises refreshSubject after it has been errored out.
   * A BehaviorSubject that has errored cannot emit again, so the interceptor
   * calls this after a failed refresh to restore the subject for future logins.
   */
  resetRefreshSubject(): void {
    this.refreshSubject = new BehaviorSubject<string | null>(null);
  }

  // ── Private ────────────────────────────────────────────────────────────────

  private callRefresh(): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(this.REFRESH_URL, {}, { withCredentials: true })
      .pipe(tap((res) => this.applySession(res)));
  }

  private applySession(res: AuthResponse): void {
    this._accessToken.set(res.accessToken);
    this._currentUser.set({ email: res.email, role: res.role });
  }

  private clearSession(): void {
    this._accessToken.set(null);
    this._currentUser.set(null);
  }
}
