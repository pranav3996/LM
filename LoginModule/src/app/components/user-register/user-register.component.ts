import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { UserRegisterService } from 'src/app/service/user-register.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-register',
  templateUrl: './user-register.component.html',
  styleUrls: ['./user-register.component.css']
})

export class UserRegisterComponent {
  email: string = '';
  password: string = '';
  firstName: string = '';
  lastName: string = '';
  city: string = '';
  errorMessage: string = '';
  public isLogin = false;

  constructor(
    private readonly userRegisterService: UserRegisterService,
    private router: Router
  ) {}

  handleSubmit(authForm: NgForm): void {
    if (!authForm.valid) {
      this.showError('All fields are required');
      return;
    }

    const userData = {
      ...authForm.value,
      role: 'USER' 
    };

    this.userRegisterService.userRegister(userData).subscribe(
      response => {
        // this.showSuccess('Success! Please check your email to complete your registration.');
        this.showSuccess(response.message)
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error => {
        this.showError(error.message || 'An error occurred');
      }
    );
  }

  showError(mess: string): void {
    this.errorMessage = mess;
    setTimeout(() => {
      this.errorMessage = '';
    }, 3000);
  }

  showSuccess(message: string): void {
    Swal.fire({
      title: 'Success!',
      text: message,
      icon: 'success',
      confirmButtonColor: '#ffb74d',
      confirmButtonText: 'OK'
    }).then(() => {
      this.router.navigate(['/login']);
    });
  }

  switchToSignUp(): void {
    this.router.navigate(['/login']);
  }
  
}