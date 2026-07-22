import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectAuthLoading = createSelector(selectAuthState, (s) => s.loading);
export const selectAuthError = createSelector(selectAuthState, (s) => s.error);
export const selectAuthRole = createSelector(selectAuthState, (s) => s.role);
export const selectAuthEmail = createSelector(selectAuthState, (s) => s.email);
export const selectSessionChecked = createSelector(selectAuthState, (s) => s.sessionChecked);
