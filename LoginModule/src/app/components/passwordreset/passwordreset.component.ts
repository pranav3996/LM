import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { NgOtpInputModule } from 'ng-otp-input';
import { PasswordresetconfirmComponent } from '../passwordresetconfirm/passwordresetconfirm.component';
import { PasswordActions } from 'src/app/store/password/password.actions';
import { selectOtpRequested, selectOtpVerified, selectPasswordError, selectPasswordLoading } from 'src/app/store/password/password.selectors';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-passwordreset',
  templateUrl: './passwordreset.component.html',
  styleUrls: ['./passwordreset.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ReactiveFormsModule, NgOtpInputModule, PasswordresetconfirmComponent],
})
export class PasswordresetComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private router = inject(Router);

  resendDisabled = signal(false);
  countdown = signal(60);

  private timer: any;

  readonly otpRequested = toSignal(this.store.select(selectOtpRequested), { initialValue: false });
  readonly otpVerified = toSignal(this.store.select(selectOtpVerified), { initialValue: false });

  otpForm!: FormGroup;

  loading = toSignal(this.store.select(selectPasswordLoading), { initialValue: false });
  error = toSignal(this.store.select(selectPasswordError), { initialValue: null });

  ngOnInit(): void {
    this.otpForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      otp: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
    this.store.dispatch(PasswordActions.clearOTPState());
  }

  get email(): FormControl { return this.otpForm.get('email') as FormControl; }
  get otpControl(): FormControl { return this.otpForm.get('otp') as FormControl; }

  startTimer(): void {
    clearInterval(this.timer);
    this.countdown.set(60);
    this.timer = setInterval(() => {
      if (this.countdown() > 0) { this.countdown.update((value) => value - 1); }
      else { clearInterval(this.timer); this.resendDisabled.set(false); }
    }, 1000);
  }

  sendOTP(): void {
    if (this.resendDisabled() || this.email.invalid) return;
    this.resendDisabled.set(true);
    this.store.dispatch(PasswordActions.sendOTP({ email: this.email.value }));
    this.startTimer();
  }

  verifyOTP(): void {
    if (this.otpForm.invalid) return;
    this.store.dispatch(PasswordActions.verifyOTP({ email: this.email.value, otp: this.otpControl.value }));
  }

  resendOTP(): void {
    if (this.resendDisabled() || this.email.invalid) return;
    this.resendDisabled.set(true);
    this.store.dispatch(PasswordActions.resendOTP({ email: this.email.value }));
    this.startTimer();
  }

  onOtpChange(otp: string): void { this.otpControl.setValue(otp); }

  navigateToLogin(): void { this.router.navigate(['/login']); }
}
