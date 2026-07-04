import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';
import { StorageService } from 'src/app/service/storage.service';
import { PasswordActions } from 'src/app/store/password/password.actions';
import { selectPasswordError, selectPasswordLoading } from 'src/app/store/password/password.selectors';

@Component({
  selector: 'app-changepassword',
  templateUrl: './changepassword.component.html',
  styleUrls: ['./changepassword.component.css'],
  imports: [FormsModule, ReactiveFormsModule, AsyncPipe],
})
export class ChangepasswordComponent implements OnInit {
  changePasswordForm: FormGroup;
  error$ = this.store.select(selectPasswordError);
  loading$ = this.store.select(selectPasswordLoading);

  constructor(private fb: FormBuilder, private store: Store, private storage: StorageService, private router: Router) {
    this.changePasswordForm = this.fb.group({
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
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
