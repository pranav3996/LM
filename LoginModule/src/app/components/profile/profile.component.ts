import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';
import { UserActions } from 'src/app/store/user/user.actions';
import { selectProfile, selectUserError } from 'src/app/store/user/user.selectors';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [AsyncPipe],
})
export class ProfileComponent implements OnInit {
  private store = inject(Store);
  private router = inject(Router);

  profile$ = this.store.select(selectProfile);
  error$ = this.store.select(selectUserError);

  ngOnInit(): void {
    this.store.dispatch(UserActions.loadProfile());
  }

  updateProfile(id: string): void {
    this.router.navigate(['/update', id]);
  }
}
