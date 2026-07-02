import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import moment from 'moment';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private LOGIN_URL = environment.AUTH_URL + '/login';
  private REFRESH_URL = environment.AUTH_URL + '/refresh';
  private activityTimeout: any;

  refreshTokenInProgress = false;
  refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient, private router: Router) {

  }

  login(email: string, password: string): Observable<any> {
    const url = `${this.LOGIN_URL}`;
    return this.http.post<any>(url, { email, password });
  }

  logOut(): void {
    //localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    // const accessToken = localStorage.getItem('accessToken');
    const accessToken = sessionStorage.getItem('accessToken');
    return !!accessToken;
  }

  isAdmin(): boolean {
    // const role = localStorage.getItem('role');
    const role = sessionStorage.getItem('role');
    return role === 'ADMIN';
  }

  isUser(): boolean {
    //const role = localStorage.getItem('role');
    const role = sessionStorage.getItem('role');
    return role === 'USER';
  }

  setLogoutTimer(expirationAccessTokenTime: string): void {
    const expirationDate = moment(
      expirationAccessTokenTime,
      'ddd MMM DD HH:mm:ss zz YYYY'
    ).toDate();
    const currentTime = new Date().getTime();
    const timeoutDuration = expirationDate.getTime() - currentTime;
    console.log(`timeoutDuration ${timeoutDuration} ms`);
    console.log(
      `Setting logout timer to refresh token in ${timeoutDuration} ms`
    );

    setTimeout(() => {
      this.refreshToken();
    }, timeoutDuration);
  }

  refreshToken(): Observable<any> {
    //const refreshToken = localStorage.getItem('refreshToken');
    const refreshToken = sessionStorage.getItem('refreshToken');
    if (!refreshToken) {
      console.error('No refresh token found in local storage.');
      this.logOut();
      return throwError('No refresh token found.');
    }

    console.log('Refreshing token using:', refreshToken);

    return this.http.post<any>(this.REFRESH_URL, { refreshToken }).pipe(
      tap((response) => {
        console.log('Refresh Token Response:', response);
        if (response && response.accessToken) {
          // localStorage.setItem('accessToken', response.accessToken);
          // localStorage.setItem('expirationAccessTokenTime',response.expirationAccessTokenTime);
          // localStorage.setItem('refreshToken', response.refreshToken);
          // localStorage.setItem('expirationRefreshTokenTime', response.expirationRefreshTokenTime);
          sessionStorage.setItem('accessToken', response.accessToken);
          sessionStorage.setItem(
            'expirationAccessTokenTime',
            response.expirationAccessTokenTime
          );
          sessionStorage.setItem('refreshToken', response.refreshToken);
          sessionStorage.setItem(
            'expirationRefreshTokenTime',
            response.expirationRefreshTokenTime
          );
          console.log(
            'New access token expiration time:',
            response.expirationAccessTokenTime
          );
        } else {
          this.logOut();
          console.error(
            'Invalid response received from refresh token request:',
            response
          );
        }
      }),
      catchError((error) => {
        this.logOut();
        console.error('Refresh Token Error:', error);

        return throwError(error);
      })
    );
  }

  public updateInactivityTime(expirationRefreshTokenTime: string): void {
    const expirationTime = moment(
      expirationRefreshTokenTime,
      'ddd MMM DD HH:mm:ss zz YYYY'
    )
      .toDate()
      .getTime();
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
    ['mousemove', 'keydown', 'click'].forEach((event) => {
      window.addEventListener(event, () =>
        this.resetActivityTimeoutFromStorage()
      );
    });
  }

  private resetActivityTimeoutFromStorage(): void {
    //  const expirationRefreshTokenTime = localStorage.getItem('expirationRefreshTokenTime');
    const expirationRefreshTokenTime = sessionStorage.getItem(
      'expirationRefreshTokenTime'
    );
    if (expirationRefreshTokenTime) {
      const expirationTime = moment(
        expirationRefreshTokenTime,
        'ddd MMM DD HH:mm:ss zz YYYY'
      )
        .toDate()
        .getTime();
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
