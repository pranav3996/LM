import { Component, ChangeDetectionStrategy, inject, ViewChild, viewChild } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { UserActions } from 'src/app/store/user/user.actions';
import { selectUserError, selectUserLoading } from 'src/app/store/user/user.selectors';
import { HasUnsavedChanges } from 'src/app/guard/unsaved-changes.guard';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-admin-register',
  templateUrl: './admin-register.component.html',
  styleUrls: ['./admin-register.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
})
export class AdminRegisterComponent implements HasUnsavedChanges {
  private store = inject(Store);
  private router = inject(Router);

  readonly authForm = viewChild.required<NgForm>('authForm');

  role: string[] = ['ADMIN', 'USER'];

  readonly error = toSignal(this.store.select(selectUserError), { initialValue: null });
  readonly loading = toSignal(this.store.select(selectUserLoading), { initialValue: false });

  hasUnsavedChanges(): boolean {
    return !!this.authForm()?.dirty;
  }

  handleSubmit(authForm: NgForm): void {
    if (!authForm.valid) return;
    this.store.dispatch(UserActions.adminRegister({ userData: authForm.value }));
  }

  navigateToUsers(): void {
    this.router.navigate(['/users']);
  }
}
