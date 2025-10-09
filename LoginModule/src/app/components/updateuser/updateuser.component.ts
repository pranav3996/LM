import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from 'src/app/service/admin.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-updateuser',
  templateUrl: './updateuser.component.html',
  styleUrls: ['./updateuser.component.css'],
  imports: [FormsModule]
})
export class UpdateuserComponent implements OnInit {
  userId: any;
  userData: any = {};
  errorMessage: string = '';
  roles: string[] = ['ADMIN', 'USER'];
  originalEnabled: boolean = false;

  constructor(
    private readonly adminService: AdminService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.getUserById();
  }

  getUserById(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    if (!this.userId) {
      this.showError("User ID is required");
      return;
    }

    this.adminService.getUsersById(this.userId).subscribe(
      userDataResponse => {
        if (userDataResponse && userDataResponse.users) {
          const { firstName, lastName, email, enabled, role, city } = userDataResponse.users;
          this.userData = { firstName, lastName, email, enabled, role, city };
          this.originalEnabled = enabled;
        } else {
          this.showError("User data not found");
        }
      },
      error => {
        this.showError(error.message);
      }
    );
  }

  updateUser(): void {
    const confirmUpdate = confirm("Are you sure you want to update this user?");
    if (!confirmUpdate) return;


    this.adminService.updateUser(this.userId, this.userData).subscribe(
      res => {
        console.log("update ", res)
        if (res.statusCode === 200) {
          this.router.navigate(['/users']);
        } else {
          this.showError(res.message);
        }
      },
      error => {
        this.showError(error.message);
      }
    );
  }

  showError(mess: string): void {
    this.errorMessage = mess;
    setTimeout(() => {
      this.errorMessage = '';
    }, 3000);
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }
}

