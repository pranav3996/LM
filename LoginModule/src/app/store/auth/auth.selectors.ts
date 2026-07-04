import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectAuthLoading = createSelector(selectAuthState, (s: AuthState) => s.loading);
export const selectAuthError = createSelector(selectAuthState, (s: AuthState) => s.error);
export const selectAuthRole = createSelector(selectAuthState, (s: AuthState) => s.role);
export const selectAuthEmail = createSelector(selectAuthState, (s: AuthState) => s.email);
export const selectAccessToken = createSelector(selectAuthState, (s: AuthState) => s.accessToken);
export const selectIsAuthenticated = createSelector(selectAuthState, (s: AuthState) => !!s.accessToken);
