import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserState } from './user.reducer';

export const selectUserState = createFeatureSelector<UserState>('user');

export const selectProfile = createSelector(selectUserState, (s: UserState) => s.profile);
export const selectUsers = createSelector(selectUserState, (s: UserState) => s.users);
export const selectSelectedUser = createSelector(selectUserState, (s: UserState) => s.selectedUser);
export const selectUserLoading = createSelector(selectUserState, (s: UserState) => s.loading);
export const selectUserError = createSelector(selectUserState, (s: UserState) => s.error);
export const selectUploadProgress = createSelector(selectUserState, (s: UserState) => s.uploadProgress);
