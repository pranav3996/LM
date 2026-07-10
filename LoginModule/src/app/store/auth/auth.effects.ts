import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { AuthService } from 'src/app/service/auth.service';
import { StorageService } from 'src/app/service/storage.service';
import { AuthResponse } from 'src/app/models/api.models';
import { AuthActions } from './auth.actions';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private storage = inject(StorageService);
  private router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ email, password }: { email: string; password: string }) =>
        this.authService.login(email, password).pipe(
          map((res: AuthResponse) =>
            res.statusCode === 200
              ? AuthActions.loginSuccess({
                  accessToken: res.accessToken,
                  refreshToken: res.refreshToken,
                  role: res.role,
                  email: res.email,
                  expirationAccessTokenTime: res.expirationAccessTokenTime,
                  expirationRefreshTokenTime: res.expirationRefreshTokenTime,
                })
              : AuthActions.loginFailure({ error: res.message || 'Login failed' })
          ),
          catchError((err: Error) =>
            of(AuthActions.loginFailure({ error: err.message || 'An error occurred' }))
          )
        )
      )
    )
  );

  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      tap(({ accessToken, refreshToken, role, email, expirationAccessTokenTime, expirationRefreshTokenTime }) => {
        this.storage.setItem('accessToken', accessToken);
        this.storage.setItem('refreshToken', refreshToken);
        this.storage.setItem('role', role);
        this.storage.setItem('email', email);
        this.storage.setItem('expirationAccessTokenTime', expirationAccessTokenTime);
        this.storage.setItem('expirationRefreshTokenTime', expirationRefreshTokenTime);
        this.authService.setLogoutTimer(expirationAccessTokenTime);
        this.authService.updateInactivityTime(expirationRefreshTokenTime);
        this.router.navigate(['/profile']);
      })
    ),
    { dispatch: false }
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      tap(() => this.authService.logOut())
    ),
    { dispatch: false }
  );

  refreshToken$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshToken),
      switchMap(() =>
        this.authService.refreshToken().pipe(
          map((res: AuthResponse) =>
            AuthActions.refreshTokenSuccess({
              accessToken: res.accessToken,
              refreshToken: res.refreshToken,
              expirationAccessTokenTime: res.expirationAccessTokenTime,
              expirationRefreshTokenTime: res.expirationRefreshTokenTime,
            })
          ),
          catchError((err: Error) =>
            of(AuthActions.refreshTokenFailure({ error: err.message }))
          )
        )
      )
    )
  );

  refreshTokenSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshTokenSuccess),
      tap(({ accessToken, refreshToken, expirationAccessTokenTime }) => {
        this.storage.setItem('accessToken', accessToken);
        this.storage.setItem('refreshToken', refreshToken);
        this.authService.setLogoutTimer(expirationAccessTokenTime);
      })
    ),
    { dispatch: false }
  );
}
