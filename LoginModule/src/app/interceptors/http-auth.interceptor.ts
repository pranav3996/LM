import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../service/auth.service';
import { StorageService } from '../service/storage.service';

export const httpAuthInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<any> => {
  const platformId = inject(PLATFORM_ID);
  const authService = inject(AuthService);
  const storage = inject(StorageService);

  // SSR: no tokens available server-side — pass through unchanged
  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  const accessToken = storage.getItem('accessToken');

  if (!accessToken) {
    return next(req);
  }

  return next(addTokenHeader(req, accessToken)).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 403) {
        return handle403Error(req, next, authService, storage);
      }
      return throwError(() => error);
    }),
  );
};

function handle403Error(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  storage: StorageService,
): Observable<any> {
  if (!authService.refreshTokenInProgress) {
    authService.refreshTokenInProgress = true;
    authService.refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((response) => {
        authService.refreshTokenInProgress = false;
        authService.refreshTokenSubject.next(response.accessToken);
        if (response?.accessToken) {
          storage.setItem('accessToken', response.accessToken);
          authService.setLogoutTimer(response.expirationAccessTokenTime);
        }
        return next(addTokenHeader(request, response.accessToken));
      }),
      catchError((err) => {
        authService.refreshTokenInProgress = false;
        authService.logOut();
        return throwError(() => err);
      }),
    );
  }

  // Another request is already refreshing — wait for the new token
  return authService.refreshTokenSubject.pipe(
    filter((token): token is string => token !== null),
    take(1),
    switchMap((token) => next(addTokenHeader(request, token))),
  );
}

function addTokenHeader(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return request.clone({ headers: request.headers.set('Authorization', `Bearer ${token}`) });
}
