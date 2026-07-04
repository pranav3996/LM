import { createReducer, on } from '@ngrx/store';
import { UserActions } from './user.actions';

export interface UserState {
  profile: any | null;
  users: any[];
  selectedUser: any | null;
  loading: boolean;
  uploadProgress: number | null;
  error: string | null;
}

export const initialUserState: UserState = {
  profile: null,
  users: [],
  selectedUser: null,
  loading: false,
  uploadProgress: null,
  error: null,
};

export const userReducer = createReducer<UserState>(
  initialUserState,
  on(UserActions.loadProfile, UserActions.loadUsers, UserActions.loadUserById,
    UserActions.updateUser, UserActions.deleteUser, UserActions.adminRegister,
    UserActions.userRegister, UserActions.uploadFile,
    (state): UserState => ({ ...state, loading: true, error: null })
  ),
  on(UserActions.loadProfileSuccess, (state, { profile }): UserState => ({ ...state, loading: false, profile })),
  on(UserActions.loadProfileFailure, (state, { error }): UserState => ({ ...state, loading: false, error })),
  on(UserActions.loadUsersSuccess, (state, { users }): UserState => ({ ...state, loading: false, users })),
  on(UserActions.loadUsersFailure, (state, { error }): UserState => ({ ...state, loading: false, error })),
  on(UserActions.loadUserByIdSuccess, (state, { user }): UserState => ({
    ...state, loading: false, selectedUser: user,
    users: Array.isArray(user) ? user : [user],
  })),
  on(UserActions.loadUserByIdFailure, (state, { error }): UserState => ({ ...state, loading: false, users: [], error })),
  on(UserActions.updateUserSuccess, UserActions.adminRegisterSuccess, UserActions.userRegisterSuccess,
    (state): UserState => ({ ...state, loading: false, error: null })
  ),
  on(UserActions.deleteUserSuccess, (state, { userId }): UserState => ({
    ...state, loading: false, users: state.users.filter((u: any) => u.id !== userId),
  })),
  on(UserActions.updateUserFailure, UserActions.deleteUserFailure,
    UserActions.adminRegisterFailure, UserActions.userRegisterFailure, UserActions.uploadFileFailure,
    (state, { error }): UserState => ({ ...state, loading: false, error })
  ),
  on(UserActions.uploadFileProgress, (state, { progress }): UserState => ({ ...state, uploadProgress: progress })),
  on(UserActions.uploadFileSuccess, (state): UserState => ({ ...state, loading: false, uploadProgress: null })),
  on(UserActions.clearSelectedUser, (state): UserState => ({ ...state, selectedUser: null })),
  on(UserActions.clearError, (state): UserState => ({ ...state, error: null })),
);
