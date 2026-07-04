import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';
import { UserActions } from 'src/app/store/user/user.actions';
import { selectUserError, selectUserLoading } from 'src/app/store/user/user.selectors';

@Component({
  selector: 'app-user-register',
  templateUrl: './user-register.component.html',
  styleUrls: ['./user-register.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule, AsyncPipe],
})
export class UserRegisterComponent {
  error$ = this.store.select(selectUserError);
  loading$ = this.store.select(selectUserLoading);

  constructor(private store: Store, private router: Router) {}

  handleSubmit(authForm: NgForm): void {
    if (!authForm.valid) return;
    this.store.dispatch(UserActions.userRegister({ userData: { ...authForm.value, role: 'USER' } }));
  }

  switchToSignUp(): void {
    this.router.navigate(['/login']);
  }
}
