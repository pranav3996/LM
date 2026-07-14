import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { UserActions } from 'src/app/store/user/user.actions';
import { AuthActions } from 'src/app/store/auth/auth.actions';
import { selectUserError, selectUserLoading } from 'src/app/store/user/user.selectors';
import { AdminService } from 'src/app/service/admin.service';
import { HasUnsavedChanges } from 'src/app/guard/unsaved-changes.guard';
import { passwordMatchValidator } from 'src/app/validators/password-match.validator';
import { emailUniqueValidator } from 'src/app/validators/email-unique.validator';

@Component({
  selector: 'app-user-register',
  templateUrl: './user-register.component.html',
  styleUrls: ['./user-register.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, AsyncPipe],
})
export class UserRegisterComponent implements OnInit, OnDestroy, HasUnsavedChanges {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private router = inject(Router);
  private adminService = inject(AdminService);

  error$ = this.store.select(selectUserError);
  loading$ = this.store.select(selectUserLoading);

  form = this.fb.nonNullable.group(
    {
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: [
        '',
        [Validators.required, Validators.email],
        [emailUniqueValidator(this.adminService)],
      ],
      city: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator('password', 'confirmPassword') }
  );

  private submitted = false;

  constructor() {
    // Reset submitted if the server returns an error so the guard
    // resumes protecting the dirty form while the user corrects and retries.
    this.store.select(selectUserError)
      .pipe(filter(Boolean), takeUntilDestroyed())
      .subscribe(() => (this.submitted = false));
  }

  hasUnsavedChanges(): boolean {
    return !this.submitted && this.form.dirty;
  }

  ngOnInit(): void {
    this.store.dispatch(UserActions.clearError());
    this.store.dispatch(AuthActions.clearError());
  }

  ngOnDestroy(): void {
    this.store.dispatch(UserActions.clearError());
  }

  // Convenience getters for cleaner template access
  get firstName(): AbstractControl { return this.form.controls.firstName; }
  get lastName(): AbstractControl { return this.form.controls.lastName; }
  get email(): AbstractControl { return this.form.controls.email; }
  get city(): AbstractControl { return this.form.controls.city; }
  get password(): AbstractControl { return this.form.controls.password; }
  get confirmPassword(): AbstractControl { return this.form.controls.confirmPassword; }

  handleSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitted = true;
    const { confirmPassword, ...payload } = this.form.getRawValue();
    this.store.dispatch(UserActions.userRegister({ userData: { ...payload, role: 'USER' } }));
  }

  switchToLogin(): void {
    this.store.dispatch(UserActions.clearError());
    this.router.navigate(['/login']);
  }
}
