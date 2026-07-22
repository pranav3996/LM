import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * Global HTTP error handler — runs as the OUTER interceptor in the chain.
 *
 * Interceptor registration order in app.config.ts:
 *   withInterceptors([httpErrorInterceptor, httpAuthInterceptor])
 *
 * Response error flow:
 *   Spring Boot → httpAuthInterceptor.catchError (attempts token refresh)
 *              → if refresh succeeds: request retried, no error propagates here
 *              → if refresh fails:    clearAuth() called + 401 re-thrown
 *              → httpErrorInterceptor.catchError sees the re-thrown 401
 *              → navigates to /login
 *
 * This ordering guarantees the error interceptor only navigates AFTER the
 * auth interceptor has exhausted its refresh attempt — no race condition.
 */
export const httpErrorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<any> => {
  const router     = inject(Router);
  const platformId = inject(PLATFORM_ID);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (isPlatformBrowser(platformId)) {
        switch (error.status) {
          // 401: auth interceptor already cleared the session and re-threw.
          case 401:
            router.navigate(['/login']);
            break;
          case 403:
            router.navigate(['/access-denied']);
            break;
          case 0:
          case 500:
          case 502:
          case 503:
            router.navigate(['/error']);
            break;
        }
      }
      return throwError(() => error);
    }),
  );
};
