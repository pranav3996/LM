import { Component, OnInit, ChangeDetectionStrategy, inject, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserActions } from 'src/app/store/user/user.actions';
import { AdminService } from 'src/app/service/admin.service';
import { UserData } from 'src/app/models/api.models';
import { HasUnsavedChanges } from 'src/app/guard/unsaved-changes.guard';

@Component({
  selector: 'app-updateuser',
  templateUrl: './updateuser.component.html',
  styleUrls: ['./updateuser.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule, AsyncPipe],
})
export class UpdateuserComponent implements OnInit, HasUnsavedChanges {
  private store = inject(Store);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private adminService = inject(AdminService);

  userId!: string;
  userData: Partial<UserData> = {};
  roles: string[] = ['ADMIN', 'USER'];

  @ViewChild('updateForm') updateForm!: NgForm;

  // Bind directly to service observables
  selectedUser$ = this.adminService.selectedUser$;
  error$ = this.adminService.error$;
  loading$ = this.adminService.loading$;

  hasUnsavedChanges(): boolean {
    return !!this.updateForm?.dirty;
  }

  constructor() {
    this.adminService.selectedUser$.pipe(takeUntilDestroyed()).subscribe((user) => {
      if (user) {
        const { firstName, lastName, email, enabled, role, city } = user;
        this.userData = { firstName, lastName, email, enabled, role, city };
      }
    });
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') || '';
    if (this.userId) {
      this.store.dispatch(UserActions.loadUserById({ userId: this.userId }));
    }
  }

  updateUser(): void {
    if (confirm('Are you sure you want to update this user?')) {
      this.store.dispatch(UserActions.updateUser({ userId: this.userId, userData: this.userData }));
    }
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }
}
