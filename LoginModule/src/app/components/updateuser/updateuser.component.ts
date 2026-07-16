import { Component, OnInit, ChangeDetectionStrategy, inject, ViewChild, signal, effect, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { FormsModule, NgForm } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserActions } from 'src/app/store/user/user.actions';
import { AdminService } from 'src/app/service/admin.service';
import { UserData } from 'src/app/models/api.models';
import { HasUnsavedChanges } from 'src/app/guard/unsaved-changes.guard';

@Component({
  selector: 'app-updateuser',
  templateUrl: './updateuser.component.html',
  styleUrls: ['./updateuser.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
})
export class UpdateuserComponent implements OnInit, HasUnsavedChanges {
  private store = inject(Store);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private adminService = inject(AdminService);

  userId!: string;
  readonly userData = signal<Partial<UserData>>({});
  roles: string[] = ['ADMIN', 'USER'];

  readonly updateForm = viewChild.required<NgForm>('updateForm');

  // Bind directly to service observables converted into signals for template usage
  selectedUser = toSignal(this.adminService.selectedUser$, { initialValue: null });
  error = toSignal(this.adminService.error$, { initialValue: null });
  loading = toSignal(this.adminService.loading$, { initialValue: false });

  constructor() {
    effect(() => {
      const user = this.selectedUser();
      if (user) {
        const { firstName, lastName, email, role, city, enabled } = user;
        this.userData.set({ firstName, lastName, email, role, city, enabled });
      }
    })
  }

  hasUnsavedChanges(): boolean {
    return !!this.updateForm()?.dirty;
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
