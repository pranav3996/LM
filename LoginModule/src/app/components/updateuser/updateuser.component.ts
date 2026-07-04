import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserActions } from 'src/app/store/user/user.actions';
import { selectSelectedUser, selectUserError, selectUserLoading } from 'src/app/store/user/user.selectors';

@Component({
  selector: 'app-updateuser',
  templateUrl: './updateuser.component.html',
  styleUrls: ['./updateuser.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule, AsyncPipe],
})
export class UpdateuserComponent implements OnInit {
  userId!: string;
  userData: any = {};
  roles: string[] = ['ADMIN', 'USER'];

  selectedUser$ = this.store.select(selectSelectedUser);
  error$ = this.store.select(selectUserError);
  loading$ = this.store.select(selectUserLoading);

  constructor(private store: Store, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') || '';
    if (this.userId) {
      this.store.dispatch(UserActions.loadUserById({ userId: this.userId }));
      this.selectedUser$.subscribe((user) => {
        if (user) {
          const { firstName, lastName, email, enabled, role, city } = user;
          this.userData = { firstName, lastName, email, enabled, role, city };
        }
      });
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
