import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../service/auth.service';
import { StorageService } from '../service/storage.service';

@Injectable()
export class HttpAuthInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);
  private storage = inject(StorageService);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const accessToken = this.storage.getItem('accessToken');

    if (!accessToken) {
      return next.handle(req);
    }

    return next.handle(this.addTokenHeader(req, accessToken)).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 403) {
          return this.handle403Error(req, next);
        }
        return throwError(() => error);
      })
    );
  }

  private handle403Error(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.authService.refreshTokenInProgress) {
      this.authService.refreshTokenInProgress = true;
      this.authService.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((response) => {
          this.authService.refreshTokenInProgress = false;
          this.authService.refreshTokenSubject.next(response.accessToken);
          if (response?.accessToken) {
            this.storage.setItem('accessToken', response.accessToken);
            this.authService.setLogoutTimer(response.expirationAccessTokenTime);
          }
          return next.handle(this.addTokenHeader(request, response.accessToken));
        }),
        catchError((err) => {
          this.authService.refreshTokenInProgress = false;
          this.authService.logOut();
          return throwError(() => err);
        })
      );
    }

    return this.authService.refreshTokenSubject.pipe(
      switchMap((token) => {
        if (token) {
          return next.handle(this.addTokenHeader(request, token));
        }
        return throwError(() => new Error('Refresh token failed'));
      })
    );
  }

  private addTokenHeader(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return request.clone({ headers: request.headers.set('Authorization', `Bearer ${token}`) });
  }
}
