import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import moment from 'moment';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private storage = inject(StorageService);

  private LOGIN_URL = environment.AUTH_URL + '/login';
  private REFRESH_URL = environment.AUTH_URL + '/refresh';
  private activityTimeout: any;

  refreshTokenInProgress = false;
  refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(this.LOGIN_URL, { email, password });
  }

  logOut(): void {
    this.storage.clear();
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const accessToken = this.storage.getItem('accessToken');
    return !!accessToken;
  }

  isAdmin(): boolean {
    const role = this.storage.getItem('role');
    return role === 'ADMIN';
  }

  isUser(): boolean {
    const role = this.storage.getItem('role');
    return role === 'USER';
  }

  setLogoutTimer(expirationAccessTokenTime: string): void {
    const expirationDate = moment(
      expirationAccessTokenTime,
      'ddd MMM DD HH:mm:ss zz YYYY'
    ).toDate();
    const currentTime = new Date().getTime();
    const timeoutDuration = expirationDate.getTime() - currentTime;

    setTimeout(() => {
      this.refreshToken().subscribe();
    }, timeoutDuration);
  }

  refreshToken(): Observable<any> {
    const refreshToken = this.storage.getItem('refreshToken');
    if (!refreshToken) {
      this.logOut();
      return throwError(() => new Error('No refresh token found.'));
    }

    return this.http.post<any>(this.REFRESH_URL, { refreshToken }).pipe(
      tap((response) => {
        if (response?.accessToken) {
          this.storage.setItem('accessToken', response.accessToken);
          this.storage.setItem(
            'expirationAccessTokenTime',
            response.expirationAccessTokenTime
          );
          this.storage.setItem('refreshToken', response.refreshToken);
          this.storage.setItem(
            'expirationRefreshTokenTime',
            response.expirationRefreshTokenTime
          );
        } else {
          this.logOut();
        }
      }),
      catchError((error) => {
        this.logOut();
        return throwError(() => error);
      })
    );
  }

  public updateInactivityTime(expirationRefreshTokenTime: string): void {
    const expirationTime = moment(
      expirationRefreshTokenTime,
      'ddd MMM DD HH:mm:ss zz YYYY'
    ).toDate().getTime();
    const currentTime = new Date().getTime();
    const inactivityTime = expirationTime - currentTime;

    if (inactivityTime > 0) {
      this.resetActivityTimeout(inactivityTime);
    } else {
      this.logOut();
    }
  }

  private resetActivityTimeout(inactivityTime: number): void {
    if (this.activityTimeout) {
      clearTimeout(this.activityTimeout);
    }
    this.activityTimeout = setTimeout(() => {
      this.logOut();
    }, inactivityTime);
  }

  private startInactivityListener(): void {
    if (typeof window === 'undefined') return;

    ['mousemove', 'keydown', 'click'].forEach((event) => {
      window.addEventListener(event, () =>
        this.resetActivityTimeoutFromStorage()
      );
    });
  }

  private resetActivityTimeoutFromStorage(): void {
    const expirationRefreshTokenTime = this.storage.getItem(
      'expirationRefreshTokenTime'
    );
    if (expirationRefreshTokenTime) {
      const expirationTime = moment(
        expirationRefreshTokenTime,
        'ddd MMM DD HH:mm:ss zz YYYY'
      ).toDate().getTime();
      const currentTime = new Date().getTime();
      const inactivityTime = expirationTime - currentTime;

      if (inactivityTime > 0) {
        this.resetActivityTimeout(inactivityTime);
      } else {
        this.logOut();
      }
    }
  }
}
