import { Component, ChangeDetectionStrategy, inject, ViewChild } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';
import { UserActions } from 'src/app/store/user/user.actions';
import { selectUserError, selectUserLoading } from 'src/app/store/user/user.selectors';
import { HasUnsavedChanges } from 'src/app/guard/unsaved-changes.guard';

@Component({
  selector: 'app-admin-register',
  templateUrl: './admin-register.component.html',
  styleUrls: ['./admin-register.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule, AsyncPipe],
})
export class AdminRegisterComponent implements HasUnsavedChanges {
  private store = inject(Store);
  private router = inject(Router);

  @ViewChild('authForm') authForm!: NgForm;

  role: string[] = ['ADMIN', 'USER'];
  error$ = this.store.select(selectUserError);
  loading$ = this.store.select(selectUserLoading);

  hasUnsavedChanges(): boolean {
    return !!this.authForm?.dirty;
  }

  handleSubmit(authForm: NgForm): void {
    if (!authForm.valid) return;
    this.store.dispatch(UserActions.adminRegister({ userData: authForm.value }));
  }

  navigateToUsers(): void {
    this.router.navigate(['/users']);
  }
}
