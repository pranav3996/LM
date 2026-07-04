import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { NgOtpInputModule } from 'ng-otp-input';
import { PasswordresetconfirmComponent } from '../passwordresetconfirm/passwordresetconfirm.component';
import { PasswordActions } from 'src/app/store/password/password.actions';
import { selectOtpRequested, selectOtpVerified, selectPasswordError, selectPasswordLoading } from 'src/app/store/password/password.selectors';

@Component({
  selector: 'app-passwordreset',
  templateUrl: './passwordreset.component.html',
  styleUrls: ['./passwordreset.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule, ReactiveFormsModule, NgOtpInputModule, PasswordresetconfirmComponent, AsyncPipe],
})
export class PasswordresetComponent implements OnInit, OnDestroy {
  resendDisabled = false;
  countdown = 60;
  otpRequested = false;
  otpVerified = false;
  private timer: any;
  private subs = new Subscription();
  otpForm!: FormGroup;

  loading$ = this.store.select(selectPasswordLoading);
  error$ = this.store.select(selectPasswordError);

  constructor(private fb: FormBuilder, private store: Store, private router: Router) {}

  ngOnInit(): void {
    this.otpForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      otp: ['', [Validators.required, Validators.minLength(6)]],
    });
    this.subs.add(this.store.select(selectOtpRequested).subscribe((v) => (this.otpRequested = v)));
    this.subs.add(this.store.select(selectOtpVerified).subscribe((v) => (this.otpVerified = v)));
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
    this.subs.unsubscribe();
    this.store.dispatch(PasswordActions.clearOTPState());
  }

  get email(): FormControl { return this.otpForm.get('email') as FormControl; }
  get otpControl(): FormControl { return this.otpForm.get('otp') as FormControl; }

  startTimer(): void {
    clearInterval(this.timer);
    this.countdown = 60;
    this.timer = setInterval(() => {
      if (this.countdown > 0) { this.countdown--; }
      else { clearInterval(this.timer); this.resendDisabled = false; }
    }, 1000);
  }

  sendOTP(): void {
    if (this.resendDisabled || this.email.invalid) return;
    this.resendDisabled = true;
    this.store.dispatch(PasswordActions.sendOTP({ email: this.email.value }));
    this.startTimer();
  }

  verifyOTP(): void {
    if (this.otpForm.invalid) return;
    this.store.dispatch(PasswordActions.verifyOTP({ email: this.email.value, otp: this.otpControl.value }));
  }

  resendOTP(): void {
    if (this.resendDisabled || this.email.invalid) return;
    this.resendDisabled = true;
    this.store.dispatch(PasswordActions.resendOTP({ email: this.email.value }));
    this.startTimer();
  }

  onOtpChange(otp: string): void { this.otpControl.setValue(otp); }

  navigateToLogin(): void { this.router.navigate(['/login']); }
}
