import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';
import Swal from 'sweetalert2';
import { AuthActions } from 'src/app/store/auth/auth.actions';
import { selectAuthRole, selectIsAuthenticated } from 'src/app/store/auth/auth.selectors';
import { StorageService } from 'src/app/service/storage.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink],
})
export class HeaderComponent implements OnInit {
  private store = inject(Store);
  private storage = inject(StorageService);

  isAuthenticated = false;
  isAdmin = false;
  isUser = false;

  ngOnInit(): void {
    // Bootstrap from session storage for SSR/page-refresh compatibility
    const token = this.storage.getItem('accessToken');
    const role = this.storage.getItem('role');
    this.isAuthenticated = !!token;
    this.isAdmin = role === 'ADMIN';
    this.isUser = role === 'USER';
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
        this.isAuthenticated = false;
        this.isAdmin = false;
        this.isUser = false;
      }
    });
  }
}
