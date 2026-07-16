import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';
import { UserActions } from 'src/app/store/user/user.actions';
import { CommonService } from 'src/app/service/common.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe],
})
export class ProfileComponent implements OnInit {
  private store = inject(Store);
  private router = inject(Router);
  private commonService = inject(CommonService);

  // profile$ emits ProfileResponse — template accesses profileInfo?.users?.firstName etc.
  profile$ = this.commonService.profile$;
  readonly error = toSignal(this.commonService.error$, { initialValue: null });
  readonly loading = toSignal(this.commonService.loading$, { initialValue: false });

  ngOnInit(): void {
    this.store.dispatch(UserActions.loadProfile());
  }

  updateProfile(id: string): void {
    this.router.navigate(['/update', id]);
  }
}
