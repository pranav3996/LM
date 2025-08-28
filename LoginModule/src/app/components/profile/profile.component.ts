import { Component, Inject, Injector, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/service/common.service';


@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css'],
    imports: []
})
export class ProfileComponent implements OnInit {
  profileInfo: any;
  errorMessage: string = '';
 
  private commonService!: CommonService;
  private router!: Router;

  constructor(private injector: Injector) {}
  ngOnInit(): void {
    this.commonService = this.injector.get(CommonService);
    this.router = this.injector.get(Router);
    
    this.commonService.getYourProfile().subscribe(
      response => {
        this.profileInfo = response;
      },
      error => {
        this.showError(error.message || 'An error occurred');
      }
    );
  }

  updateProfile(id: string): void {
    this.router.navigate(['/update', id]);
  }

  showError(mess: string): void {
    this.errorMessage = mess;
    setTimeout(() => {
      this.errorMessage = '';
    }, 3000);
  }
}
