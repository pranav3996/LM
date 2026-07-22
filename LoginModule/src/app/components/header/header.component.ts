import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import Swal from 'sweetalert2';
import { AuthActions } from 'src/app/store/auth/auth.actions';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
})
export class HeaderComponent {
  private store = inject(Store);
  private authService = inject(AuthService);

  readonly currentUser = this.authService.currentUser;

  readonly isAuthenticated = this.authService.isAuthenticated;

  readonly isAdmin = this.authService.isAdmin;

  readonly isUser = this.authService.isUser;

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
