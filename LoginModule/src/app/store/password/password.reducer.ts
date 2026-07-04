import { createReducer, on } from '@ngrx/store';
import { PasswordActions } from './password.actions';

export interface PasswordState {
  otpRequested: boolean;
  otpVerified: boolean;
  loading: boolean;
  error: string | null;
}

export const initialPasswordState: PasswordState = {
  otpRequested: false,
  otpVerified: false,
  loading: false,
  error: null,
};

export const passwordReducer = createReducer<PasswordState>(
  initialPasswordState,
  on(PasswordActions.sendOTP, PasswordActions.resendOTP, PasswordActions.verifyOTP,
    PasswordActions.resetPasswordOTP, PasswordActions.resetPasswordToken,
    PasswordActions.changePassword,
    (state): PasswordState => ({ ...state, loading: true, error: null })
  ),
  on(PasswordActions.sendOTPSuccess, (state): PasswordState => ({ ...state, loading: false, otpRequested: true })),
  on(PasswordActions.resendOTPSuccess, (state): PasswordState => ({ ...state, loading: false })),
  on(PasswordActions.verifyOTPSuccess, (state): PasswordState => ({ ...state, loading: false, otpVerified: true })),
  on(PasswordActions.sendOTPFailure, PasswordActions.resendOTPFailure, PasswordActions.verifyOTPFailure,
    PasswordActions.resetPasswordOTPFailure, PasswordActions.resetPasswordTokenFailure,
    PasswordActions.changePasswordFailure,
    (state, { error }): PasswordState => ({ ...state, loading: false, error })
  ),
  on(PasswordActions.resetPasswordOTPSuccess, PasswordActions.resetPasswordTokenSuccess,
    PasswordActions.changePasswordSuccess,
    (state): PasswordState => ({ ...state, loading: false, error: null })
  ),
  on(PasswordActions.clearError, (state): PasswordState => ({ ...state, error: null })),
  on(PasswordActions.clearOTPState, (): PasswordState => ({ ...initialPasswordState })),
);
