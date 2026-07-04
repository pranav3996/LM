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

export const userReducer = createReducer(
  initialUserState,
  // Loading states
  on(UserActions.loadProfile, UserActions.loadUsers, UserActions.loadUserById,
    UserActions.updateUser, UserActions.deleteUser, UserActions.adminRegister,
    UserActions.userRegister, UserActions.uploadFile,
    (state) => ({ ...state, loading: true, error: null })
  ),

  // Profile
  on(UserActions.loadProfileSuccess, (state, { profile }) => ({ ...state, loading: false, profile })),
  on(UserActions.loadProfileFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // Users list
  on(UserActions.loadUsersSuccess, (state, { users }) => ({ ...state, loading: false, users })),
  on(UserActions.loadUsersFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // Single user (also updates users list for search results in userlist)
  on(UserActions.loadUserByIdSuccess, (state, { user }) => ({
    ...state, loading: false, selectedUser: user,
    users: Array.isArray(user) ? user : [user],
  })),
  on(UserActions.loadUserByIdFailure, (state, { error }) => ({ ...state, loading: false, users: [], error })),

  // Update / Delete / Register success
  on(UserActions.updateUserSuccess, UserActions.adminRegisterSuccess, UserActions.userRegisterSuccess,
    (state) => ({ ...state, loading: false, error: null })
  ),
  on(UserActions.deleteUserSuccess, (state, { userId }) => ({
    ...state, loading: false, users: state.users.filter((u) => u.id !== userId),
  })),

  // Failures
  on(UserActions.updateUserFailure, UserActions.deleteUserFailure,
    UserActions.adminRegisterFailure, UserActions.userRegisterFailure, UserActions.uploadFileFailure,
    (state, { error }) => ({ ...state, loading: false, error })
  ),

  // Upload progress
  on(UserActions.uploadFileProgress, (state, { progress }) => ({ ...state, uploadProgress: progress })),
  on(UserActions.uploadFileSuccess, (state) => ({ ...state, loading: false, uploadProgress: null })),

  // Misc
  on(UserActions.clearSelectedUser, (state) => ({ ...state, selectedUser: null })),
  on(UserActions.clearError, (state) => ({ ...state, error: null })),
);
