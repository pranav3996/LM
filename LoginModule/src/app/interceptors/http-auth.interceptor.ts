import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../service/auth.service';

/**
 * URL suffixes for endpoints that must never trigger a token-refresh retry.
 * Suffix matching is used instead of full-URL includes() so the check is
 * robust against environment base-URL changes (dev absolute vs prod relative).
 */
const NO_RETRY_SUFFIXES = ['/auth/refresh', '/auth/logout', '/auth/login'];

function isNoRetryUrl(url: string): boolean {
  // Strip query string before suffix check so /auth/refresh?foo=bar is still matched.
  const path = url.split('?')[0];
  return NO_RETRY_SUFFIXES.some((suffix) => path.endsWith(suffix));
}

export const httpAuthInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<any> => {
  const platformId  = inject(PLATFORM_ID);
  const authService = inject(AuthService);

  // SSR: no in-memory token on the server — pass through unchanged
  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  const token    = authService.getAccessToken();
  const outgoing = token ? withBearer(req, token) : req;

  return next(outgoing).pipe(
    catchError((error: HttpErrorResponse) => {
      // Pass the bare `req` (no Authorization header) to handle401 so the
      // retry is built cleanly with only the fresh token attached.
      if (error.status === 401 && !isNoRetryUrl(req.url)) {
        return handle401(req, next, authService);
      }
      return throwError(() => error);
    }),
  );
};

function handle401(
  original: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
): Observable<any> {
  if (!authService.refreshInProgress) {
    authService.refreshInProgress = true;
    // Reset to null so concurrent requests block on filter() below.
    // Bug 4 fix: without this reset, a stale non-null token from a previous
    // successful refresh would pass the filter immediately with the old token.
    authService.refreshSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((res) => {
        authService.refreshInProgress = false;
        authService.refreshSubject.next(res.accessToken); // unblock queued requests
        return next(withBearer(original, res.accessToken));
      }),
      catchError((err) => {
        authService.refreshInProgress = false;
        authService.clearAuth();
        // Bug 3 fix: emit the error on refreshSubject so every queued request
        // that is waiting in the else-branch below receives it and errors out
        // instead of hanging forever.
        authService.refreshSubject.error(err);
        // Re-initialise the subject so the service is usable again if the user
        // manually navigates back to /login and logs in again.
        authService.resetRefreshSubject();
        return throwError(() => err);
      }),
    );
  }

  // A refresh is already in-flight — queue this request until the new token arrives
  return authService.refreshSubject.pipe(
    filter((token): token is string => token !== null),
    take(1),
    switchMap((token) => next(withBearer(original, token))),
  );
}

function withBearer(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) });
}
