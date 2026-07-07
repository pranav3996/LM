import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';
import { UserActions } from 'src/app/store/user/user.actions';
import { selectUserError, selectUserLoading } from 'src/app/store/user/user.selectors';

@Component({
  selector: 'app-admin-register',
  templateUrl: './admin-register.component.html',
  styleUrls: ['./admin-register.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule, AsyncPipe],
})
export class AdminRegisterComponent {
  private store = inject(Store);
  private router = inject(Router);

  role: string[] = ['ADMIN', 'USER'];
  error$ = this.store.select(selectUserError);
  loading$ = this.store.select(selectUserLoading);

  handleSubmit(authForm: NgForm): void {
    if (!authForm.valid) return;
    this.store.dispatch(UserActions.adminRegister({ userData: authForm.value }));
  }

  navigateToUsers(): void {
    this.router.navigate(['/users']);
  }
}
