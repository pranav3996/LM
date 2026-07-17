import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ChangePasswordRequest, PasswordResponse } from '../models/api.models';
import { toObservable } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class PasswordService {
  private http = inject(HttpClient);
  private BASE_URL = environment.PASSWORD_URL;

  // ── State ──────────────────────────────────────────────────────────────────
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  private _otpRequested = signal<boolean>(false);
  private _otpVerified = signal<boolean>(false);

  // ── Public read-only observables ───────────────────────────────────────────
  readonly loading$: Observable<boolean> = toObservable(this._loading);
  readonly error$: Observable<string | null> = toObservable(this._error);
  readonly otpRequested$: Observable<boolean> = toObservable(this._otpRequested);
  readonly otpVerified$: Observable<boolean> = toObservable(this._otpVerified);

  // ── Snapshot helpers ───────────────────────────────────────────────────────
  isOtpRequested(): boolean { return this._otpRequested(); }
  isOtpVerified(): boolean { return this._otpVerified(); }
  clearError(): void { this._error.set(null); }
  clearOtpState(): void {
    this._otpRequested.set(false);
    this._otpVerified.set(false);
    this._error.set(null);
  }

  // ── API ────────────────────────────────────────────────────────────────────
  sendPasswordResetRequest(email: string): Observable<PasswordResponse> {
    return this.http.post<PasswordResponse>(`${this.BASE_URL}/password-reset-request`, { email });
  }

  resetPassword(accessToken: string, newPassword: string): Observable<PasswordResponse> {
    this._loading.set(true);
    this._error.set(null);
    return this.http.post<PasswordResponse>(`${this.BASE_URL}/reset-password?token=${accessToken}`, { newPassword }).pipe(
      tap(() => this._loading.set(false)),
      catchError((err: HttpErrorResponse) => {
        this._loading.set(false);
        this._error.set(err.message);
        throw err;
      })
    );
  }

  changePassword(email: string, oldPassword: string, newPassword: string): Observable<PasswordResponse> {
    this._loading.set(true);
    this._error.set(null);
    return this.http.post<PasswordResponse>(`${this.BASE_URL}/change-password`, {
      email, oldPassword, newPassword,
    } satisfies ChangePasswordRequest).pipe(
      tap(() => this._loading.set(false)),
      catchError((err: HttpErrorResponse) => {
        this._loading.set(false);
        const message = err.error?.message || err.message || 'An error occurred';
        this._error.set(message);
        throw new Error(message);
      })
    );
  }

  sendOTP(email: string): Observable<PasswordResponse> {
    this._loading.set(true);
    this._error.set(null);
    return this.http.post<PasswordResponse>(`${this.BASE_URL}/password-reset-otp-request`, { email }).pipe(
      tap(() => {
        this._loading.set(false);
        this._otpRequested.set(true);
      }),
      catchError((err: HttpErrorResponse) => {
        this._loading.set(false);
        this._error.set(err.error?.message || 'Internal Server Error');
        throw err;
      })
    );
  }

  verifyOTP(email: string, otp: string): Observable<PasswordResponse> {
    this._loading.set(true);
    this._error.set(null);
    return this.http.post<PasswordResponse>(`${this.BASE_URL}/verify-otp?email=${email}&otp=${otp}`, {}).pipe(
      tap(() => {
        this._loading.set(false);
        this._otpVerified.set(true);
      }),
      catchError((err: HttpErrorResponse) => {
        this._loading.set(false);
        this._error.set(err.error?.message || 'OTP verification failed');
        throw err;
      })
    );
  }

  resendOTP(email: string): Observable<PasswordResponse> {
    this._loading.set(true);
    this._error.set(null);
    return this.http.post<PasswordResponse>(`${this.BASE_URL}/regenerate-otp?email=${email}`, {}).pipe(
      tap(() => this._loading.set(false)),
      catchError((err: HttpErrorResponse) => {
        this._loading.set(false);
        this._error.set(err.error?.message || 'Internal Server Error');
        throw err;
      })
    );
  }

  resetPasswordOtp(email: string, otp: string, newPassword: string): Observable<PasswordResponse> {
    this._loading.set(true);
    this._error.set(null);
    return this.http.post<PasswordResponse>(
      `${this.BASE_URL}/reset-password-otp?email=${email}&otp=${otp}`,
      { newPassword }
    ).pipe(
      tap(() => this._loading.set(false)),
      catchError((err: HttpErrorResponse) => {
        this._loading.set(false);
        this._error.set(err.error?.message || 'Failed to reset password.');
        throw err;
      })
    );
  }
}
