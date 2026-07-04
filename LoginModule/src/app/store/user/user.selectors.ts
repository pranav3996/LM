import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserState } from './user.reducer';

export const selectUserState = createFeatureSelector<UserState>('user');

export const selectProfile = createSelector(selectUserState, (s) => s.profile);
export const selectUsers = createSelector(selectUserState, (s) => s.users);
export const selectSelectedUser = createSelector(selectUserState, (s) => s.selectedUser);
export const selectUserLoading = createSelector(selectUserState, (s) => s.loading);
export const selectUserError = createSelector(selectUserState, (s) => s.error);
export const selectUploadProgress = createSelector(selectUserState, (s) => s.uploadProgress);
