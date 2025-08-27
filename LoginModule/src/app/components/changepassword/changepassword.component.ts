import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PasswordService } from 'src/app/service/password.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-changepassword',
    templateUrl: './changepassword.component.html',
    styleUrls: ['./changepassword.component.css'],
    standalone: false
})
export class ChangepasswordComponent implements OnInit {
  changePasswordForm: FormGroup;
  errorMessage!: string;
  userEmail!: string;

  constructor(
    private fb: FormBuilder,
    private passwordService: PasswordService,
    private router: Router
  ) {
    this.changePasswordForm = this.fb.group({
      email: [
        { value: '', disabled: true },
        [Validators.required, Validators.email],
      ],
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    // this.userEmail = localStorage.getItem('email') || '';
    // this.changePasswordForm.patchValue({
    //   email: this.userEmail,
    // });
    this.userEmail = sessionStorage.getItem('email') || '';
    this.changePasswordForm.patchValue({
      email: this.userEmail,
    });
  }

  handleSubmit(): void {
    this.errorMessage = '';
    if (this.changePasswordForm.invalid) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    const { oldPassword, newPassword } = this.changePasswordForm.value;
    const email = this.changePasswordForm.get('email')!.value;
  
    this.passwordService
      .changePassword(email, oldPassword, newPassword)
      .subscribe(
        (response) => {
          Swal.fire({
            title: 'Password Changed!',
            text: response.message,
            icon: 'success',
            confirmButtonColor: '#ffb74d',
            confirmButtonText: 'OK',
          }).then(() => {
            this.router.navigate(['/profile']);
            this.changePasswordForm.reset();
          });
        },
        (error) => {
          this.errorMessage = error.error.message;
          console.error('Error:', error);
        }
      );
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }
}
