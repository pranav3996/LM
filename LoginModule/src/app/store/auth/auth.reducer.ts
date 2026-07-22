import { createReducer, on } from '@ngrx/store';
import { AuthActions } from './auth.actions';

export interface AuthState {
  role: string | null;
  email: string | null;
  loading: boolean;
  error: string | null;
  sessionChecked: boolean;
}

export const initialAuthState: AuthState = {
  role: null,
  email: null,
  loading: false,
  error: null,
  sessionChecked: false,
};

export const authReducer = createReducer<AuthState>(
  initialAuthState,
  on(AuthActions.login, (state): AuthState => ({ ...state, loading: true, error: null })),
  on(AuthActions.loginSuccess, (state, { role, email }): AuthState => ({
    ...state, loading: false, role, email, error: null,
  })),
  on(AuthActions.loginFailure, (state, { error }): AuthState => ({ ...state, loading: false, error })),
  on(AuthActions.logout, (state): AuthState => ({ ...state, loading: true })),
  on(AuthActions.logoutSuccess, (): AuthState => ({ ...initialAuthState, sessionChecked: true })),
  on(AuthActions.logoutFailure, (): AuthState => ({ ...initialAuthState, sessionChecked: true })),
  on(AuthActions.initSession, (state): AuthState => ({ ...state, loading: true })),
  on(AuthActions.initSessionSuccess, (state, { role, email }): AuthState => ({
    ...state, loading: false, role, email, sessionChecked: true,
  })),
  on(AuthActions.initSessionFailure, (state): AuthState => ({
    ...initialAuthState, sessionChecked: true,
  })),
  on(AuthActions.refreshTokenSuccess, (state, { role, email }): AuthState => ({
    ...state, role, email,
  })),
  on(AuthActions.refreshTokenFailure, (): AuthState => ({ ...initialAuthState, sessionChecked: true })),
  on(AuthActions.clearError, (state): AuthState => ({ ...state, error: null })),
);
