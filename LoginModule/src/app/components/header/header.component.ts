import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
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

  readonly currentUser = toSignal(this.authService.currentUser$, {
    initialValue: null,
  });

  readonly isAuthenticated = computed(() => !!this.currentUser());

  readonly isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');

  readonly isUser = computed(() => this.currentUser()?.role === 'USER');

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
