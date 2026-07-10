import { AuthState } from './auth/auth.reducer';

// Global state — only cross-cutting concerns belong here.
// Feature states (user, password) are registered via provideState() on their routes.
export interface AppState {
  auth: AuthState;
}
