// Reactive Forms ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, timeout } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { PasswordService } from 'src/app/service/password.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-passwordreset',
  templateUrl: './passwordreset.component.html',
  styleUrls: ['./passwordreset.component.css'],
})
export class PasswordresetComponent implements OnInit {
  errorMessage: string = '';
  otpVerified: boolean = false;
  otpRequested: boolean = false;
  resendDisabled: boolean = false;
  timer: any = 0;
  countdown: number = 60;
  loading: boolean = false; 
  otpForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private passwordService: PasswordService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initializeForm();
  }

  get email(): FormControl {
    return this.otpForm.get('email') as FormControl;
  }

  get otpControl(): FormControl {
    return this.otpForm.get('otp') as FormControl;
  }

  initializeForm() {
    this.otpForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      otp: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  startTimer() {
    this.timer = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown--;
      } else {
        clearInterval(this.timer);
        this.resendDisabled = false;
      }
    }, 1000);
  }

  sendOTP() {
    if (this.resendDisabled || this.email.invalid) {
      return;
    }
    this.loading = true; 
    const email = this.email.value;
    this.resendDisabled = true;
    this.passwordService
      .sendOTP(email)
      .pipe(
        timeout(10000),
        catchError((error) => {
          this.errorMessage = error.error.message || 'Internal Server Error';
          console.error('Error:', error);
          this.loading = false; 
          this.resendDisabled = false;
          return throwError(this.errorMessage);
        })
      )
      .subscribe(
        (response) => {
          this.loading = false; 
          clearInterval(this.timer);
          this.countdown = 60;
          this.otpRequested = true;
          this.resendDisabled = true;
          this.errorMessage = '';
          console.log('OTP sent successfully:', response);
          Swal.fire({
            icon: 'success',
            title: 'OTP Sent',
            text: response.message,
            confirmButtonColor: '#ffb74d',
          });

          this.startTimer();
        },
        (error) => {
          this.loading = false; 
          this.errorMessage =
            error.error.message || 'Please check your internet connection.';
          console.error('Error:', error);
          this.resendDisabled = false;
        }
      );
  }

  verifyOTP() {
    if (this.otpForm.invalid) {
      return;
    }

    const otp = this.otpControl.value;
    const email = this.email.value;
    this.passwordService.verifyOTP(email, otp).subscribe(
      (response) => {
        this.otpVerified = true;
        this.errorMessage = '';
        console.log('OTP verified successfully', response);
        //Pass data through navigation
        // this.router.navigate(['/reset-password'], {
        //   queryParams: { email: email, otp: otp },
        // });
      },
      (error) => {
        console.error('Error verifying OTP:', error);
        this.errorMessage =
          error.error.message || 'Please check your internet connection.';
      }
    );
  }

  resendOTP() {
    if (this.resendDisabled || this.email.invalid) {
      return;
    }
    this.countdown = 60;
    this.startTimer();
    this.resendDisabled = true;
    this.errorMessage = '';

    const email = this.email.value;
    this.passwordService
      .resendOTP(email)
      .pipe(
        timeout(10000),
        catchError((error) => {
          this.errorMessage = error.error.message || 'Internal Server Error';
          console.error('Error:', error);
          return throwError(this.errorMessage);
        })
      )
      .subscribe(
        (response) => {
          Swal.fire({
            icon: 'success',
            title: 'OTP Re-sent',
            text: response.message,
            confirmButtonColor: '#ffb74d',
          });
          console.log('Resent OTP:', response);
        },
        (error) => {
          console.error('Error resending OTP:', error);
          this.errorMessage =
            error.error.message || 'Please check your internet connection.';
          this.resendDisabled = false;
        }
      );
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  onOtpChange(otp: string) {
    this.otpControl.setValue(otp);
  }
}


/* reset using token

import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, throwError, timeout } from 'rxjs';
import { PasswordService } from 'src/app/service/password.service';

@Component({
  selector: 'app-passwordreset',
  templateUrl: './passwordreset.component.html',
  styleUrls: ['./passwordreset.component.css'],
})
export class PasswordresetComponent {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly router: Router
  ) {}

  email: string = '';
  errorMessage: string = '';
  resetToken: string = '';
loading: boolean = false; 
  sendResetRequest(passwordResetForm: NgForm) {
    this.loading = true; 
    this.passwordService
      .sendPasswordResetRequest(passwordResetForm.value.email)
      .pipe(
        timeout(10000),
        catchError((error) => {
  this.loading = false; 
          this.errorMessage = 'Please check your internet connection.';
          console.error('Error:', error); // Log the error
          return throwError(this.errorMessage); // Re-throw the error to propagate it
        })
      )
      .subscribe(
        (response) => {
          this.loading = false; 
          this.resetToken = response.token;
          console.log('response ', response.token); // Store the token from the response
          this.router.navigate(['/reset-password'], {
            queryParams: { token: this.resetToken },
          });
        },
        (error) => {
          this.loading = false; 
          this.errorMessage =
            error.message || 'Please check your internet connection.';
          console.error('Error:', error); // Log the error
        }
      );
  }
  navigateToLogin() {
    this.router.navigate(['/login']);
  }
} 
*/

/* Template Driven Forms TS
import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, timeout } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { PasswordService } from 'src/app/service/password.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-passwordreset',
  templateUrl: './passwordreset.component.html',
  styleUrls: ['./passwordreset.component.css'],
})
export class PasswordresetComponent {

  email: string = '';
  errorMessage: string = '';
  resetToken: string = '';
  otp: string = '';
  otpVerified: boolean = false;
  otpRequested: boolean = false;
  resendDisabled: boolean = false;
  timer: any = 0;
  countdown: number = 60;
 loading: boolean = false; 
  constructor(
    private readonly passwordService: PasswordService,
    private readonly router: Router
  ) {}
  startTimer() {
    this.timer = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown--;
      } else {
        clearInterval(this.timer);
        this.resendDisabled = false;
      }
    }, 1000);
  }

  sendOTP(passwordResetForm: NgForm) {
    if (this.resendDisabled) {
      return;
    }
   this.loading = true; 
    this.email = passwordResetForm.value.email;
    this.resendDisabled = true;
    this.passwordService
      .sendOTP(this.email)
      .pipe(
        timeout(10000),
        catchError((error) => {
          this.errorMessage = error.error.message || 'Internal Server Error';
          console.error('Error:', error);
          this.resendDisabled = false;
             this.loading = false; 
          return throwError(this.errorMessage);
        })
      )
      .subscribe(
        (response) => {
          clearInterval(this.timer);
          this.countdown = 60;
          this.otpRequested = true;
          this.resendDisabled = true;
          this.errorMessage = '';
             this.loading = false; 
          console.log('OTP sent successfully:', response);
          Swal.fire({
            icon: 'success',
            title: 'OTP Sent',
            text: response.message,
            confirmButtonColor: '#ffb74d',
          });

          this.startTimer();
        },
        (error) => {
           this.loading = false; 
          this.errorMessage =
            error.error.message || 'Please check your internet connection.';
          // console.error('Error:', error);
          this.resendDisabled = false;
        }
      );
  }

  verifyOTP() {
    this.passwordService.verifyOTP(this.email, this.otp).subscribe(
      (response) => {
        this.otpVerified = true;
        this.errorMessage = '';
        console.log('OTP verified successfully', response);
        this.router.navigate(['/reset-password'], {
          queryParams: { email: this.email, otp: this.otp },
        });
      },
      (error) => {
        console.error('Error verifying OTP:', error);
        this.errorMessage =
          error.error.message || 'Please check your internet connection.';
      }
    );
  }

  resendOTP() {
    if (this.resendDisabled) {
      return;
    }
    this.countdown = 60;
    this.startTimer();
    this.resendDisabled = true;
    this.errorMessage = '';

    this.passwordService
      .resendOTP(this.email)
      .pipe(
        timeout(10000),
        catchError((error) => {
          this.errorMessage = error.error.message || 'Internal Server Error';
          console.error('Error:', error);
          return throwError(this.errorMessage);
        })
      )
      .subscribe(
        (response) => {
          Swal.fire({
            icon: 'success',
            title: 'OTP Re-sent',
            text: response.message,
            confirmButtonColor: '#ffb74d',
          });
          console.log('Resent OTP:', response);
        },
        (error) => {
          console.error('Error resending OTP:', error);
          this.errorMessage =
            error.error.message || 'Please check your internet connection.';
          this.resendDisabled = false;
        }
      );
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  onOtpChange(otp: string) {
    this.otp = otp;
  }
}*/
