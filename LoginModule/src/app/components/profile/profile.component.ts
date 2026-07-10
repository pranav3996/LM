import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';
import { UserActions } from 'src/app/store/user/user.actions';
import { CommonService } from 'src/app/service/common.service';

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
  private commonService = inject(CommonService);

  // profile$ emits ProfileResponse — template accesses profileInfo?.users?.firstName etc.
  profile$ = this.commonService.profile$;
  error$ = this.commonService.error$;
  loading$ = this.commonService.loading$;

  ngOnInit(): void {
    this.store.dispatch(UserActions.loadProfile());
  }

  updateProfile(id: string): void {
    this.router.navigate(['/update', id]);
  }
}
