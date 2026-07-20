import {
  Component, OnInit, OnDestroy, ChangeDetectionStrategy,
  inject, signal, computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthActions } from 'src/app/store/auth/auth.actions';
import { UserActions } from 'src/app/store/user/user.actions';
import { selectAuthError, selectAuthLoading } from 'src/app/store/auth/auth.selectors';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN = 6;
const PASSWORD_MAX = 64;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class LoginComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private router = inject(Router);
  readonly loading = toSignal(this.store.select(selectAuthLoading), { initialValue: false });
  readonly error = toSignal(this.store.select(selectAuthError), { initialValue: null });

  // ── Field values ────────────────────────────────────────────────────────
  readonly email = signal('');
  readonly password = signal('');
  // ── Touched state (show errors only after interaction) ───────────────────
  readonly emailTouched = signal(false);
  readonly passwordTouched = signal(false);

  // ── UI state ─────────────────────────────────────────────────────────────
  readonly showPassword = signal(false);

  // ── Validation ───────────────────────────────────────────────────────────
  readonly emailErrors = computed(() => {
    const v = this.email().trim();
    if (!v) return 'Email is required.';
    if (!EMAIL_RE.test(v)) return 'Enter a valid email address.';
    return null;
  });

  readonly passwordErrors = computed(() => {
    const v = this.password();
    if (!v) return 'Password is required.';
    if (v.length < PASSWORD_MIN) return `Password must be at least ${PASSWORD_MIN} characters.`;
    if (v.length > PASSWORD_MAX) return `Password must be at most ${PASSWORD_MAX} characters.`;
    return null;
  });

  readonly formValid = computed(() => !this.emailErrors() && !this.passwordErrors());

  // ── Lifecycle ────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.store.dispatch(AuthActions.clearError());
    this.store.dispatch(UserActions.clearError());
  }

  ngOnDestroy(): void {
    this.store.dispatch(AuthActions.clearError());
  }

  // ── Handlers ─────────────────────────────────────────────────────────────
  handleSubmit(event: Event): void {
    event.preventDefault();
    this.emailTouched.set(true);
    this.passwordTouched.set(true);
    if (!this.formValid()) return;
    this.store.dispatch(AuthActions.login({ email: this.email().trim(), password: this.password() }));
  }

  switchToSignUp(): void {
    this.store.dispatch(AuthActions.clearError());
    this.router.navigate(['/user-register']);
  }

  handleForgotPassword(): void {
    this.store.dispatch(AuthActions.clearError());
    this.router.navigate(['/forgot-password']);
  }
}
