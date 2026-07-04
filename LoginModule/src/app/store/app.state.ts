import { AuthState } from './auth/auth.reducer';
import { UserState } from './user/user.reducer';
import { PasswordState } from './password/password.reducer';

export interface AppState {
  auth: AuthState;
  user: UserState;
  password: PasswordState;
}
