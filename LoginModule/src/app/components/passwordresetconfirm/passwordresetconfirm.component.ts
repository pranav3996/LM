import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PasswordService } from 'src/app/service/password.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-passwordresetconfirm',
    templateUrl: './passwordresetconfirm.component.html',
    styleUrls: ['./passwordresetconfirm.component.css'],
    standalone: false
})

export class PasswordresetconfirmComponent implements OnInit {
  // Parent child relation @Input() 
  @Input() email: string = '';
  @Input() otp: string = '';
  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly passwordService: PasswordService
  ) { }

  accessToken: string = '';
  newPassword: string = '';
  errorMessage: string = '';
  // for navigation using queryParams
  // email: string = '';
  // otp: string = '';

  ngOnInit(): void {
    this.accessToken = this.route.snapshot.queryParams['accessToken'];
    // Getting a data from navigation and using queryParams
    // this.email = this.route.snapshot.queryParams['email'];
    // this.otp = this.route.snapshot.queryParams['otp'];
  }

  resetPassword(resetPasswordForm:NgForm) {
    this.passwordService.resetPassword(this.accessToken, resetPasswordForm.value.newPassword)
      .subscribe(
        () => {
          Swal.fire({
            title: 'Password Reset Successful!',
            text: 'Your password has been reset successfully.',
            icon: 'success',
            confirmButtonColor: '#ffb74d',
            confirmButtonText: 'OK'
            
          }).then(() => {
            this.router.navigate(['/login']);
          });
        },
        error => {
          this.errorMessage = error.message || 'Failed to reset password.';
          console.error('Error:', error);
        }
      );
  }

  resetPasswordOTP(resetPasswordForm: NgForm) {
    const newPassword = resetPasswordForm.value.newPassword;
    this.passwordService.resetPasswordOtp(this.email, this.otp, newPassword).subscribe(
      (response) => {
        Swal.fire({
          title: 'Password Reset Successful!',
          text: response.message,
          icon: 'success',
          confirmButtonColor: '#ffb74d',
          confirmButtonText: 'OK'
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },
      (error) => {
        console.error('Error resetting password:', error);
        this.errorMessage = error.error.message || 'Failed to reset password.';
        Swal.fire({
          title: 'Error!',
          text: this.errorMessage,
          icon: 'error',
          confirmButtonColor: '#d33',
          confirmButtonText: 'OK'
        });
      }
    );
  }
  
  navigateToLogin(){
    this.router.navigate(['/login']);
  }

}