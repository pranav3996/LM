import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { PasswordService } from 'src/app/service/password.service';
import Swal from 'sweetalert2';
import { PasswordActions } from './password.actions';

@Injectable()
export class PasswordEffects {
  private actions$ = inject(Actions);
  private passwordService = inject(PasswordService);
  private router = inject(Router);

  sendOTP$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PasswordActions.sendOTP),
      switchMap(({ email }) =>
        this.passwordService.sendOTP(email).pipe(
          timeout(10000),
          map((response) => {
            Swal.fire({ icon: 'success', title: 'OTP Sent', text: response.message, confirmButtonColor: '#ffb74d' });
            return PasswordActions.sendOTPSuccess({ message: response.message });
          }),
          catchError((error) => of(PasswordActions.sendOTPFailure({ error: error.error?.message || 'Internal Server Error' })))
        )
      )
    )
  );

  resendOTP$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PasswordActions.resendOTP),
      switchMap(({ email }) =>
        this.passwordService.resendOTP(email).pipe(
          timeout(10000),
          map((response) => {
            Swal.fire({ icon: 'success', title: 'OTP Re-sent', text: response.message, confirmButtonColor: '#ffb74d' });
            return PasswordActions.resendOTPSuccess({ message: response.message });
          }),
          catchError((error) => of(PasswordActions.resendOTPFailure({ error: error.error?.message || 'Internal Server Error' })))
        )
      )
    )
  );

  verifyOTP$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PasswordActions.verifyOTP),
      switchMap(({ email, otp }) =>
        this.passwordService.verifyOTP(email, otp).pipe(
          map(() => PasswordActions.verifyOTPSuccess()),
          catchError((error) => of(PasswordActions.verifyOTPFailure({ error: error.error?.message || 'OTP verification failed' })))
        )
      )
    )
  );

  resetPasswordOTP$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PasswordActions.resetPasswordOTP),
      switchMap(({ email, otp, newPassword }) =>
        this.passwordService.resetPasswordOtp(email, otp, newPassword).pipe(
          map((response) => {
            Swal.fire({ title: 'Password Reset Successful!', text: response.message, icon: 'success', confirmButtonColor: '#ffb74d', confirmButtonText: 'OK' })
              .then(() => this.router.navigate(['/login']));
            return PasswordActions.resetPasswordOTPSuccess();
          }),
          catchError((error) => {
            const msg = error.error?.message || 'Failed to reset password.';
            Swal.fire({ title: 'Error!', text: msg, icon: 'error', confirmButtonColor: '#d33', confirmButtonText: 'OK' });
            return of(PasswordActions.resetPasswordOTPFailure({ error: msg }));
          })
        )
      )
    )
  );

  resetPasswordToken$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PasswordActions.resetPasswordToken),
      switchMap(({ accessToken, newPassword }) =>
        this.passwordService.resetPassword(accessToken, newPassword).pipe(
          map(() => {
            Swal.fire({ title: 'Password Reset Successful!', text: 'Your password has been reset successfully.', icon: 'success', confirmButtonColor: '#ffb74d', confirmButtonText: 'OK' })
              .then(() => this.router.navigate(['/login']));
            return PasswordActions.resetPasswordTokenSuccess();
          }),
          catchError((error) => of(PasswordActions.resetPasswordTokenFailure({ error: error.message || 'Failed to reset password.' })))
        )
      )
    )
  );

  changePassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PasswordActions.changePassword),
      switchMap(({ email, oldPassword, newPassword }) =>
        this.passwordService.changePassword(email, oldPassword, newPassword).pipe(
          map((response) => PasswordActions.changePasswordSuccess({ message: response.message })),
          catchError((error) => of(PasswordActions.changePasswordFailure({ error: error.error?.message || error.message })))
        )
      )
    )
  );

  changePasswordSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PasswordActions.changePasswordSuccess),
      tap(({ message }) => {
        Swal.fire({ title: 'Password Changed!', text: message, icon: 'success', confirmButtonColor: '#ffb74d', confirmButtonText: 'OK' })
          .then(() => this.router.navigate(['/profile']));
      })
    ),
    { dispatch: false }
  );
}
