import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';
import { AuthActions } from 'src/app/store/auth/auth.actions';
import { UserActions } from 'src/app/store/user/user.actions';
import { selectUserError, selectUserLoading } from 'src/app/store/user/user.selectors';

@Component({
  selector: 'app-user-register',
  templateUrl: './user-register.component.html',
  styleUrls: ['./user-register.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule, AsyncPipe],
})
export class UserRegisterComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private router = inject(Router);

  error$ = this.store.select(selectUserError);
  loading$ = this.store.select(selectUserLoading);

  ngOnInit(): void {
    this.store.dispatch(UserActions.clearError());
    this.store.dispatch(AuthActions.clearError());
  }

  ngOnDestroy(): void {
    this.store.dispatch(UserActions.clearError());
  }

  handleSubmit(authForm: NgForm): void {
    if (!authForm.valid) return;
    this.store.dispatch(UserActions.userRegister({ userData: { ...authForm.value, role: 'USER' } }));
  }

  switchToSignUp(): void {
    this.store.dispatch(UserActions.clearError());
    this.router.navigate(['/login']);
  }
}
