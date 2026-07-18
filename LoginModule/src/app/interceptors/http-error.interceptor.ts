import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const httpErrorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<any> => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (isBrowser) {
        switch (error.status) {
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

// Legacy class-based export kept for backward compatibility during migration.
// Remove once all usages are updated to the functional interceptor.
import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler } from '@angular/common/http';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        switch (error.status) {
          case 401: this.router.navigate(['/login']); break;
          case 403: this.router.navigate(['/access-denied']); break;
          case 0:
          case 500:
          case 502:
          case 503: this.router.navigate(['/error']); break;
        }
        return throwError(() => error);
      }),
    );
  }
}
