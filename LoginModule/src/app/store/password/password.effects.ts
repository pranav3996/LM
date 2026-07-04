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
      switchMap(({ email }: { email: string }) =>
        this.passwordService.sendOTP(email).pipe(
          timeout(10000),
          map((response: any) => {
            Swal.fire({ icon: 'success', title: 'OTP Sent', text: response.message, confirmButtonColor: '#ffb74d' });
            return PasswordActions.sendOTPSuccess({ message: response.message });
          }),
          catchError((error: any) => of(PasswordActions.sendOTPFailure({ error: error.error?.message || 'Internal Server Error' })))
        )
      )
    )
  );

  resendOTP$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PasswordActions.resendOTP),
      switchMap(({ email }: { email: string }) =>
        this.passwordService.resendOTP(email).pipe(
          timeout(10000),
          map((response: any) => {
            Swal.fire({ icon: 'success', title: 'OTP Re-sent', text: response.message, confirmButtonColor: '#ffb74d' });
            return PasswordActions.resendOTPSuccess({ message: response.message });
          }),
          catchError((error: any) => of(PasswordActions.resendOTPFailure({ error: error.error?.message || 'Internal Server Error' })))
        )
      )
    )
  );

  verifyOTP$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PasswordActions.verifyOTP),
      switchMap(({ email, otp }: { email: string; otp: string }) =>
        this.passwordService.verifyOTP(email, otp).pipe(
          map(() => PasswordActions.verifyOTPSuccess()),
          catchError((error: any) => of(PasswordActions.verifyOTPFailure({ error: error.error?.message || 'OTP verification failed' })))
        )
      )
    )
  );

  resetPasswordOTP$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PasswordActions.resetPasswordOTP),
      switchMap(({ email, otp, newPassword }: { email: string; otp: string; newPassword: string }) =>
        this.passwordService.resetPasswordOtp(email, otp, newPassword).pipe(
          map((response: any) => {
            Swal.fire({ title: 'Password Reset Successful!', text: response.message, icon: 'success', confirmButtonColor: '#ffb74d', confirmButtonText: 'OK' })
              .then(() => this.router.navigate(['/login']));
            return PasswordActions.resetPasswordOTPSuccess();
          }),
          catchError((error: any) => {
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
      switchMap(({ accessToken, newPassword }: { accessToken: string; newPassword: string }) =>
        this.passwordService.resetPassword(accessToken, newPassword).pipe(
          map(() => {
            Swal.fire({ title: 'Password Reset Successful!', text: 'Your password has been reset successfully.', icon: 'success', confirmButtonColor: '#ffb74d', confirmButtonText: 'OK' })
              .then(() => this.router.navigate(['/login']));
            return PasswordActions.resetPasswordTokenSuccess();
          }),
          catchError((error: any) => of(PasswordActions.resetPasswordTokenFailure({ error: error.message || 'Failed to reset password.' })))
        )
      )
    )
  );

  changePassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PasswordActions.changePassword),
      switchMap(({ email, oldPassword, newPassword }: { email: string; oldPassword: string; newPassword: string }) =>
        this.passwordService.changePassword(email, oldPassword, newPassword).pipe(
          map((response: any) => PasswordActions.changePasswordSuccess({ message: response.message })),
          catchError((error: any) => of(PasswordActions.changePasswordFailure({ error: error.error?.message || error.message })))
        )
      )
    )
  );

  changePasswordSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PasswordActions.changePasswordSuccess),
      tap(({ message }: { message: string }) => {
        Swal.fire({ title: 'Password Changed!', text: message, icon: 'success', confirmButtonColor: '#ffb74d', confirmButtonText: 'OK' })
          .then(() => this.router.navigate(['/profile']));
      })
    ),
    { dispatch: false }
  );
}
