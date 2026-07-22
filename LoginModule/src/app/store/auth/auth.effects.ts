import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { AuthService } from 'src/app/service/auth.service';
import { AuthResponse } from 'src/app/models/api.models';
import { AuthActions } from './auth.actions';

@Injectable()
export class AuthEffects {
  private readonly actions$   = inject(Actions);
  private readonly authService = inject(AuthService);
  private readonly router      = inject(Router);
  private readonly platformId  = inject(PLATFORM_ID);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ email, password }) =>
        this.authService.login(email, password).pipe(
          map((res: AuthResponse) =>
            res.statusCode === 200
              ? AuthActions.loginSuccess({ role: res.role, email: res.email })
              : AuthActions.loginFailure({ error: res.message || 'Login failed' })
          ),
          catchError((err: HttpErrorResponse) =>
            of(AuthActions.loginFailure({ error: err.error?.message || 'An error occurred' }))
          ),
        )
      ),
    )
  );

  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      tap(() => this.router.navigate(['/profile'])),
    ),
    { dispatch: false },
  );

  /**
   * Calls POST /auth/logout (withCredentials) so the server invalidates the
   * HttpOnly cookie, then navigates to /login regardless of outcome.
   * AuthService.logout() clears the in-memory token in both tap branches.
   */
  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      switchMap(() =>
        this.authService.logout().pipe(
          map(() => AuthActions.logoutSuccess()),
          catchError(() => of(AuthActions.logoutFailure())),
        )
      ),
    )
  );

  logoutComplete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logoutSuccess, AuthActions.logoutFailure),
      tap(() => this.router.navigate(['/login'])),
    ),
    { dispatch: false },
  );

  /**
   * Silently restores a session from the HttpOnly cookie on app startup.
   * Skipped entirely on the server (SSR) — no cookie is available there.
   */
  initSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.initSession),
      switchMap(() => {
        if (!isPlatformBrowser(this.platformId)) {
          return of(AuthActions.initSessionFailure());
        }
        return this.authService.initSession().pipe(
          map((res: AuthResponse) =>
            AuthActions.initSessionSuccess({ role: res.role, email: res.email })
          ),
          catchError(() => of(AuthActions.initSessionFailure())),
        );
      }),
    )
  );

  refreshToken$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshToken),
      switchMap(() =>
        this.authService.refreshToken().pipe(
          map((res: AuthResponse) =>
            AuthActions.refreshTokenSuccess({ role: res.role, email: res.email })
          ),
          catchError((err: HttpErrorResponse) =>
            of(AuthActions.refreshTokenFailure({ error: err.error?.message || err.message }))
          ),
        )
      ),
    )
  );
}
