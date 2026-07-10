import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ChangePasswordRequest, PasswordResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class PasswordService {
  private http = inject(HttpClient);
  private BASE_URL = environment.PASSWORD_URL;

  // ── State ──────────────────────────────────────────────────────────────────
  private _loading$ = new BehaviorSubject<boolean>(false);
  private _error$ = new BehaviorSubject<string | null>(null);
  private _otpRequested$ = new BehaviorSubject<boolean>(false);
  private _otpVerified$ = new BehaviorSubject<boolean>(false);

  // ── Public read-only observables ───────────────────────────────────────────
  readonly loading$: Observable<boolean> = this._loading$.asObservable();
  readonly error$: Observable<string | null> = this._error$.asObservable();
  readonly otpRequested$: Observable<boolean> = this._otpRequested$.asObservable();
  readonly otpVerified$: Observable<boolean> = this._otpVerified$.asObservable();

  // ── Snapshot helpers ───────────────────────────────────────────────────────
  isOtpRequested(): boolean { return this._otpRequested$.getValue(); }
  isOtpVerified(): boolean { return this._otpVerified$.getValue(); }
  clearError(): void { this._error$.next(null); }
  clearOtpState(): void {
    this._otpRequested$.next(false);
    this._otpVerified$.next(false);
    this._error$.next(null);
  }

  // ── API ────────────────────────────────────────────────────────────────────
  sendPasswordResetRequest(email: string): Observable<PasswordResponse> {
    return this.http.post<PasswordResponse>(`${this.BASE_URL}/password-reset-request`, { email });
  }

  resetPassword(accessToken: string, newPassword: string): Observable<PasswordResponse> {
    this._loading$.next(true);
    this._error$.next(null);
    return this.http.post<PasswordResponse>(`${this.BASE_URL}/reset-password?token=${accessToken}`, { newPassword }).pipe(
      tap(() => this._loading$.next(false)),
      catchError((err: HttpErrorResponse) => {
        this._loading$.next(false);
        this._error$.next(err.message);
        throw err;
      })
    );
  }

  changePassword(email: string, oldPassword: string, newPassword: string): Observable<PasswordResponse> {
    this._loading$.next(true);
    this._error$.next(null);
    return this.http.post<PasswordResponse>(`${this.BASE_URL}/change-password`, {
      email, oldPassword, newPassword,
    } satisfies ChangePasswordRequest).pipe(
      tap(() => this._loading$.next(false)),
      catchError((err: HttpErrorResponse) => {
        this._loading$.next(false);
        const message = err.error?.message || err.message || 'An error occurred';
        this._error$.next(message);
        throw new Error(message);
      })
    );
  }

  sendOTP(email: string): Observable<PasswordResponse> {
    this._loading$.next(true);
    this._error$.next(null);
    return this.http.post<PasswordResponse>(`${this.BASE_URL}/password-reset-otp-request`, { email }).pipe(
      tap(() => {
        this._loading$.next(false);
        this._otpRequested$.next(true);
      }),
      catchError((err: HttpErrorResponse) => {
        this._loading$.next(false);
        this._error$.next(err.error?.message || 'Internal Server Error');
        throw err;
      })
    );
  }

  verifyOTP(email: string, otp: string): Observable<PasswordResponse> {
    this._loading$.next(true);
    this._error$.next(null);
    return this.http.post<PasswordResponse>(`${this.BASE_URL}/verify-otp?email=${email}&otp=${otp}`, {}).pipe(
      tap(() => {
        this._loading$.next(false);
        this._otpVerified$.next(true);
      }),
      catchError((err: HttpErrorResponse) => {
        this._loading$.next(false);
        this._error$.next(err.error?.message || 'OTP verification failed');
        throw err;
      })
    );
  }

  resendOTP(email: string): Observable<PasswordResponse> {
    this._loading$.next(true);
    this._error$.next(null);
    return this.http.post<PasswordResponse>(`${this.BASE_URL}/regenerate-otp?email=${email}`, {}).pipe(
      tap(() => this._loading$.next(false)),
      catchError((err: HttpErrorResponse) => {
        this._loading$.next(false);
        this._error$.next(err.error?.message || 'Internal Server Error');
        throw err;
      })
    );
  }

  resetPasswordOtp(email: string, otp: string, newPassword: string): Observable<PasswordResponse> {
    this._loading$.next(true);
    this._error$.next(null);
    return this.http.post<PasswordResponse>(
      `${this.BASE_URL}/reset-password-otp?email=${email}&otp=${otp}`,
      { newPassword }
    ).pipe(
      tap(() => this._loading$.next(false)),
      catchError((err: HttpErrorResponse) => {
        this._loading$.next(false);
        this._error$.next(err.error?.message || 'Failed to reset password.');
        throw err;
      })
    );
  }
}
