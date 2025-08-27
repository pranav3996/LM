import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from 'src/app/service/admin.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-admin-register',
    templateUrl: './admin-register.component.html',
    styleUrls: ['./admin-register.component.css'],
    standalone: false
})
export class AdminRegisterComponent {

  errorMessage: string = '';
  role: string[] = ['ADMIN', 'USER'];
  constructor(
    private readonly adminService: AdminService,
    private router: Router
  ) {}

  handleSubmit(authForm: NgForm): void {
    if (!authForm.valid) {
      this.showError('All fields are required');
      return;
    }

    this.adminService.adminRegister(authForm.value).subscribe(
      response => {
        this.showSuccess(response.message);
        setTimeout(() => {
          this.router.navigate(['/users']);
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
      this.router.navigate(['/users']);
    });
  }

  navigateToUsers(): void {
    this.router.navigate(['/users']);
  }

}

