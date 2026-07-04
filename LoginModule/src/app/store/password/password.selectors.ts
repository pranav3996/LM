import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PasswordState } from './password.reducer';

export const selectPasswordState = createFeatureSelector<PasswordState>('password');

export const selectOtpRequested = createSelector(selectPasswordState, (s: PasswordState) => s.otpRequested);
export const selectOtpVerified = createSelector(selectPasswordState, (s: PasswordState) => s.otpVerified);
export const selectPasswordLoading = createSelector(selectPasswordState, (s: PasswordState) => s.loading);
export const selectPasswordError = createSelector(selectPasswordState, (s: PasswordState) => s.error);
