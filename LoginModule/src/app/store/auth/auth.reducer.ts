import { createReducer, on } from '@ngrx/store';
import { AuthActions } from './auth.actions';

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  role: string | null;
  email: string | null;
  loading: boolean;
  error: string | null;
}

export const initialAuthState: AuthState = {
  accessToken: null,
  refreshToken: null,
  role: null,
  email: null,
  loading: false,
  error: null,
};

export const authReducer = createReducer<AuthState>(
  initialAuthState,
  on(AuthActions.login, (state): AuthState => ({ ...state, loading: true, error: null })),
  on(AuthActions.loginSuccess, (state, { accessToken, refreshToken, role, email }): AuthState => ({
    ...state, loading: false, accessToken, refreshToken, role, email, error: null,
  })),
  on(AuthActions.loginFailure, (state, { error }): AuthState => ({ ...state, loading: false, error })),
  on(AuthActions.logout, (): AuthState => ({ ...initialAuthState })),
  on(AuthActions.refreshTokenSuccess, (state, { accessToken, refreshToken }): AuthState => ({
    ...state, accessToken, refreshToken,
  })),
  on(AuthActions.refreshTokenFailure, (): AuthState => ({ ...initialAuthState })),
  on(AuthActions.clearError, (state): AuthState => ({ ...state, error: null })),
);
