import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import Swal from 'sweetalert2';
import { AuthActions } from 'src/app/store/auth/auth.actions';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink],
})
export class HeaderComponent {
  private store = inject(Store);
  private authService = inject(AuthService);

  // Plain booleans for the template — kept in sync with currentUser$ reactively
  isAuthenticated = false;
  isAdmin = false;
  isUser = false;

  constructor() {
    this.authService.currentUser$.pipe(takeUntilDestroyed()).subscribe((user) => {
      this.isAuthenticated = !!user;
      this.isAdmin = user?.role === 'ADMIN';
      this.isUser = user?.role === 'USER';
    });
  }

  confirmSignOut(event: Event): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ffb74d',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, sign me out!',
    }).then((result) => {
      if (result.isConfirmed) {
        event.preventDefault();
        this.store.dispatch(AuthActions.logout());
      }
    });
  }
}
