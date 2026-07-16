import { Component, OnInit, ChangeDetectionStrategy, inject, input, signal } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { PasswordActions } from 'src/app/store/password/password.actions';
import { selectPasswordError } from 'src/app/store/password/password.selectors';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-passwordresetconfirm',
  templateUrl: './passwordresetconfirm.component.html',
  styleUrls: ['./passwordresetconfirm.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
})
export class PasswordresetconfirmComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(Store);

  readonly email = input<string>('');
  readonly otp = input<string>('');

  accessToken = signal('');
  error = toSignal(this.store.select(selectPasswordError), { initialValue: null });

  ngOnInit(): void {
    this.accessToken.set(this.route.snapshot.queryParams['accessToken']);
  }

  resetPassword(resetPasswordForm: NgForm): void {
    this.store.dispatch(PasswordActions.resetPasswordToken({ accessToken: this.accessToken(), newPassword: resetPasswordForm.value.newPassword }));
  }

  resetPasswordOTP(resetPasswordForm: NgForm): void {
    this.store.dispatch(PasswordActions.resetPasswordOTP({ email: this.email(), otp: this.otp(), newPassword: resetPasswordForm.value.newPassword }));
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
