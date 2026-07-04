import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { AdminService } from 'src/app/service/admin.service';
import { CommonService } from 'src/app/service/common.service';
import { UserRegisterService } from 'src/app/service/user-register.service';
import Swal from 'sweetalert2';
import { UserActions } from './user.actions';

@Injectable()
export class UserEffects {
  private actions$ = inject(Actions);
  private adminService = inject(AdminService);
  private commonService = inject(CommonService);
  private userRegisterService = inject(UserRegisterService);
  private router = inject(Router);

  loadProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadProfile),
      switchMap(() =>
        this.commonService.getYourProfile().pipe(
          map((profile: any) => UserActions.loadProfileSuccess({ profile })),
          catchError((error: any) => of(UserActions.loadProfileFailure({ error: error.message || 'Failed to load profile' })))
        )
      )
    )
  );

  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadUsers),
      switchMap(() =>
        this.adminService.getAllUsers().pipe(
          map((response: any) => {
            if (response?.statusCode === 200 && response.usersList) {
              return UserActions.loadUsersSuccess({ users: response.usersList });
            }
            return UserActions.loadUsersFailure({ error: 'No users found.' });
          }),
          catchError((error: any) => of(UserActions.loadUsersFailure({ error: error.message })))
        )
      )
    )
  );

  loadUserById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadUserById),
      switchMap(({ userId }: { userId: string }) =>
        this.adminService.getUsersById(userId).pipe(
          map((response: any) => {
            if (response?.users) {
              return UserActions.loadUserByIdSuccess({ user: response.users });
            }
            return UserActions.loadUserByIdFailure({ error: response.message || 'User not found' });
          }),
          catchError((error: any) => of(UserActions.loadUserByIdFailure({ error: error.error?.message || error.message })))
        )
      )
    )
  );

  updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateUser),
      switchMap(({ userId, userData }: { userId: string; userData: any }) =>
        this.adminService.updateUser(userId, userData).pipe(
          map((res: any) => {
            if (res.statusCode === 200) return UserActions.updateUserSuccess();
            return UserActions.updateUserFailure({ error: res.message });
          }),
          catchError((error: any) => of(UserActions.updateUserFailure({ error: error.message })))
        )
      )
    )
  );

  updateUserSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateUserSuccess),
      tap(() => this.router.navigate(['/users']))
    ),
    { dispatch: false }
  );

  deleteUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.deleteUser),
      switchMap(({ userId }: { userId: string }) =>
        this.adminService.deleteUser(userId).pipe(
          map(() => UserActions.deleteUserSuccess({ userId })),
          catchError((error: any) => of(UserActions.deleteUserFailure({ error: error.message })))
        )
      )
    )
  );

  adminRegister$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.adminRegister),
      switchMap(({ userData }: { userData: any }) =>
        this.adminService.adminRegister(userData).pipe(
          map((response: any) => UserActions.adminRegisterSuccess({ message: response.message })),
          catchError((error: any) => of(UserActions.adminRegisterFailure({ error: error.message || 'An error occurred' })))
        )
      )
    )
  );

  adminRegisterSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.adminRegisterSuccess),
      tap(({ message }: { message: string }) => {
        Swal.fire({ title: 'Success!', text: message, icon: 'success', confirmButtonColor: '#ffb74d', confirmButtonText: 'OK' })
          .then(() => this.router.navigate(['/users']));
      })
    ),
    { dispatch: false }
  );

  userRegister$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.userRegister),
      switchMap(({ userData }: { userData: any }) =>
        this.userRegisterService.userRegister(userData).pipe(
          map((response: any) => UserActions.userRegisterSuccess({ message: response.message })),
          catchError((error: any) => of(UserActions.userRegisterFailure({ error: error.message || 'An error occurred' })))
        )
      )
    )
  );

  userRegisterSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.userRegisterSuccess),
      tap(({ message }: { message: string }) => {
        Swal.fire({ title: 'Success!', text: message, icon: 'success', confirmButtonColor: '#ffb74d', confirmButtonText: 'OK' })
          .then(() => this.router.navigate(['/login']));
      })
    ),
    { dispatch: false }
  );

  uploadFile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.uploadFile),
      switchMap(({ file }: { file: File }) =>
        this.adminService.uploadFile(file).pipe(
          map((response: any) => {
            if (response?.status === 'progress') {
              return UserActions.uploadFileProgress({ progress: response.message });
            } else if (response?.status === 'success') {
              Swal.fire('Success', response.message, 'success');
              return UserActions.uploadFileSuccess({ message: response.message });
            }
            return UserActions.uploadFileFailure({ error: response?.message || 'Upload failed' });
          }),
          catchError((error: any) => {
            Swal.fire({ icon: 'error', title: 'Upload Error', text: error.message });
            return of(UserActions.uploadFileFailure({ error: error.message }));
          })
        )
      )
    )
  );

  uploadFileSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.uploadFileSuccess),
      map(() => UserActions.loadUsers())
    )
  );
}
