import { Component, OnInit, ChangeDetectionStrategy, inject, input } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';
import { PasswordActions } from 'src/app/store/password/password.actions';
import { selectPasswordError } from 'src/app/store/password/password.selectors';

@Component({
  selector: 'app-passwordresetconfirm',
  templateUrl: './passwordresetconfirm.component.html',
  styleUrls: ['./passwordresetconfirm.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule, AsyncPipe],
})
export class PasswordresetconfirmComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(Store);

  readonly email = input<string>('');
  readonly otp = input<string>('');

  accessToken: string = '';
  error$ = this.store.select(selectPasswordError);

  ngOnInit(): void {
    this.accessToken = this.route.snapshot.queryParams['accessToken'];
  }

  resetPassword(resetPasswordForm: NgForm): void {
    this.store.dispatch(PasswordActions.resetPasswordToken({ accessToken: this.accessToken, newPassword: resetPasswordForm.value.newPassword }));
  }

  resetPasswordOTP(resetPasswordForm: NgForm): void {
    this.store.dispatch(PasswordActions.resetPasswordOTP({ email: this.email(), otp: this.otp(), newPassword: resetPasswordForm.value.newPassword }));
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
