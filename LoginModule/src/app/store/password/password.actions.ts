import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const PasswordActions = createActionGroup({
  source: 'Password',
  events: {
    'Send OTP': props<{ email: string }>(),
    'Send OTP Success': props<{ message: string }>(),
    'Send OTP Failure': props<{ error: string }>(),

    'Resend OTP': props<{ email: string }>(),
    'Resend OTP Success': props<{ message: string }>(),
    'Resend OTP Failure': props<{ error: string }>(),

    'Verify OTP': props<{ email: string; otp: string }>(),
    'Verify OTP Success': emptyProps(),
    'Verify OTP Failure': props<{ error: string }>(),

    'Reset Password OTP': props<{ email: string; otp: string; newPassword: string }>(),
    'Reset Password OTP Success': emptyProps(),
    'Reset Password OTP Failure': props<{ error: string }>(),

    'Reset Password Token': props<{ accessToken: string; newPassword: string }>(),
    'Reset Password Token Success': emptyProps(),
    'Reset Password Token Failure': props<{ error: string }>(),

    'Change Password': props<{ email: string; oldPassword: string; newPassword: string }>(),
    'Change Password Success': props<{ message: string }>(),
    'Change Password Failure': props<{ error: string }>(),

    'Clear Error': emptyProps(),
    'Clear OTP State': emptyProps(),
  },
});
