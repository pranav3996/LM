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

export const authReducer = createReducer(
  initialAuthState,
  on(AuthActions.login, (state) => ({ ...state, loading: true, error: null })),
  on(AuthActions.loginSuccess, (state, { accessToken, refreshToken, role, email }) => ({
    ...state, loading: false, accessToken, refreshToken, role, email, error: null,
  })),
  on(AuthActions.loginFailure, (state, { error }) => ({ ...state, loading: false, error })),
  on(AuthActions.logout, () => ({ ...initialAuthState })),
  on(AuthActions.refreshTokenSuccess, (state, { accessToken, refreshToken }) => ({
    ...state, accessToken, refreshToken,
  })),
  on(AuthActions.refreshTokenFailure, () => ({ ...initialAuthState })),
);
