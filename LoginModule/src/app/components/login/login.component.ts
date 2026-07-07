import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { NgModel, NgForm, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';
import { AuthActions } from 'src/app/store/auth/auth.actions';
import { selectAuthError, selectAuthLoading } from 'src/app/store/auth/auth.selectors';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule, AsyncPipe],
})
export class LoginComponent {
  private store = inject(Store);
  private router = inject(Router);

  loading$ = this.store.select(selectAuthLoading);
  error$ = this.store.select(selectAuthError);

  handleSubmit(authForm: NgForm): void {
    if (!authForm.valid) return;
    this.store.dispatch(AuthActions.login({ email: authForm.value.email, password: authForm.value.password }));
  }

  switchToSignUp(): void {
    this.router.navigate(['/user-register']);
  }

  handleForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }

  getPasswordError(password: NgModel): string {
    if (password.errors?.['required']) return 'Password is required.';
    return '';
  }
}
