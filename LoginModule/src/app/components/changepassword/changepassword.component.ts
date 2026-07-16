import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { StorageService } from 'src/app/service/storage.service';
import { PasswordActions } from 'src/app/store/password/password.actions';
import { selectPasswordError, selectPasswordLoading } from 'src/app/store/password/password.selectors';
import { HasUnsavedChanges } from 'src/app/guard/unsaved-changes.guard';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-changepassword',
  templateUrl: './changepassword.component.html',
  styleUrls: ['./changepassword.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ReactiveFormsModule],
})
export class ChangepasswordComponent implements OnInit, HasUnsavedChanges {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private storage = inject(StorageService);
  private router = inject(Router);

  changePasswordForm: FormGroup;
  readonly error = toSignal(this.store.select(selectPasswordError), { initialValue: null });
  readonly loading = toSignal(this.store.select(selectPasswordLoading), { initialValue: false });

  constructor() {
    this.changePasswordForm = this.fb.group({
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  hasUnsavedChanges(): boolean {
    return this.changePasswordForm.dirty;
  }

  ngOnInit(): void {
    this.changePasswordForm.patchValue({ email: this.storage.getItem('email') || '' });
  }

  handleSubmit(): void {
    if (this.changePasswordForm.invalid) return;
    const { oldPassword, newPassword } = this.changePasswordForm.value;
    const email = this.changePasswordForm.get('email')!.value;
    this.store.dispatch(PasswordActions.changePassword({ email, oldPassword, newPassword }));
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }
}
