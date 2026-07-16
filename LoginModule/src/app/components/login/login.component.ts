import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { NgModel, NgForm, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthActions } from 'src/app/store/auth/auth.actions';
import { UserActions } from 'src/app/store/user/user.actions';
import { selectAuthError, selectAuthLoading } from 'src/app/store/auth/auth.selectors';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
})
export class LoginComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private router = inject(Router);

  readonly loading = toSignal(this.store.select(selectAuthLoading), { initialValue: false });
  readonly error = toSignal(this.store.select(selectAuthError), { initialValue: null });

  ngOnInit(): void {
    this.store.dispatch(AuthActions.clearError());
    this.store.dispatch(UserActions.clearError());
  }

  ngOnDestroy(): void {
    this.store.dispatch(AuthActions.clearError());
  }

  handleSubmit(authForm: NgForm): void {
    if (!authForm.valid) return;
    this.store.dispatch(AuthActions.login({ email: authForm.value.email, password: authForm.value.password }));
  }

  switchToSignUp(): void {
    this.store.dispatch(AuthActions.clearError());
    this.router.navigate(['/user-register']);
  }

  handleForgotPassword(): void {
    this.store.dispatch(AuthActions.clearError());
    this.router.navigate(['/forgot-password']);
  }

  getPasswordError(password: NgModel): string {
    if (password.errors?.['required']) return 'Password is required.';
    return '';
  }
}
