import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { AuthService } from 'src/app/service/auth.service';
import { StorageService } from 'src/app/service/storage.service';
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
          map((response: any) => {
            if (response.statusCode === 200) {
              return AuthActions.loginSuccess({
                accessToken: response.accessToken,
                refreshToken: response.refreshToken,
                role: response.role,
                email: response.email,
                expirationAccessTokenTime: response.expirationAccessTokenTime,
                expirationRefreshTokenTime: response.expirationRefreshTokenTime,
              });
            }
            return AuthActions.loginFailure({ error: response.message || 'Login failed' });
          }),
          catchError((error: any) => of(AuthActions.loginFailure({ error: error.message || 'An error occurred' })))
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
      tap(() => {
        this.storage.clear();
        this.router.navigate(['/login']);
      })
    ),
    { dispatch: false }
  );

  refreshToken$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshToken),
      switchMap(() =>
        this.authService.refreshToken().pipe(
          map((response: any) =>
            AuthActions.refreshTokenSuccess({
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
              expirationAccessTokenTime: response.expirationAccessTokenTime,
              expirationRefreshTokenTime: response.expirationRefreshTokenTime,
            })
          ),
          catchError((error: any) => of(AuthActions.refreshTokenFailure({ error: error.message })))
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
