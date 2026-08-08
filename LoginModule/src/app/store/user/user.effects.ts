import { inject, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { AdminService } from 'src/app/service/admin.service';
import { CommonService } from 'src/app/service/common.service';
import { ApiResponse, ProfileResponse, UploadEvent, UserRecord, UserResponse } from 'src/app/models/api.models';
import Swal from 'sweetalert2';
import { UserActions } from './user.actions';

@Injectable()
export class UserEffects {
  private actions$ = inject(Actions);
  private adminService = inject(AdminService);
  private commonService = inject(CommonService);
  private router = inject(Router);

  loadProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadProfile),
      switchMap(() =>
        this.commonService.getYourProfile().pipe(
          map((profile: ProfileResponse) => UserActions.loadProfileSuccess({ profile })),
          catchError((err: HttpErrorResponse) =>
            of(UserActions.loadProfileFailure({ error: err.error?.message || 'Failed to load profile' }))
          )
        )
      )
    )
  );

  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadUsers),
      switchMap(() =>
        this.adminService.getAllUsers().pipe(
          map((res: UserResponse) =>
            res?.statusCode === 200 && res.usersList
              ? UserActions.loadUsersSuccess({ users: res.usersList })
              : UserActions.loadUsersFailure({ error: 'No users found.' })
          ),
          catchError((err: HttpErrorResponse) => of(UserActions.loadUsersFailure({ error: err.error?.message || err.message })))
        )
      )
    )
  );

  loadUserById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadUserById),
      switchMap(({ userId }: { userId: string }) =>
        this.adminService.getUsersById(userId).pipe(
          map((res: UserResponse) => {
            const user = res?.users ?? (res as any)?.usersList;
            if (user) return UserActions.loadUserByIdSuccess({ user });
            return UserActions.loadUserByIdFailure({ error: res?.message || 'User not found' });
          }),
          catchError((err: any) =>
            of(UserActions.loadUserByIdFailure({ error: err.error?.message || err.message }))
          )
        )
      )
    )
  );

  updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateUser),
      switchMap(({ userId, userData }: { userId: string; userData: any }) =>
        this.adminService.updateUser(userId, userData).pipe(
          map((res: ApiResponse) =>
            res.statusCode === 200
              ? UserActions.updateUserSuccess()
              : UserActions.updateUserFailure({ error: res.message })
          ),
          catchError((err: HttpErrorResponse) => of(UserActions.updateUserFailure({ error: err.error?.message || err.message })))
        )
      )
    )
  );

  updateUserSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateUserSuccess),
      tap(() => Swal.fire({ title: 'Success!', text: 'User updated successfully.', icon: 'success', confirmButtonColor: '#ffb74d', timer: 1500, showConfirmButton: false }))
    ),
    { dispatch: false }
  );

  deleteUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.deleteUser),
      switchMap(({ userId }: { userId: string }) =>
        this.adminService.deleteUser(userId).pipe(
          map(() => UserActions.deleteUserSuccess({ userId })),
          catchError((err: HttpErrorResponse) => of(UserActions.deleteUserFailure({ error: err.error?.message || err.message })))
        )
      )
    )
  );

  adminRegister$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.adminRegister),
      switchMap(({ userData }: { userData: any }) =>
        this.adminService.adminRegister(userData).pipe(
          map((res: ApiResponse) => UserActions.adminRegisterSuccess({ message: res.message })),
          catchError((err: HttpErrorResponse) =>
            of(UserActions.adminRegisterFailure({ error: err.error?.message || 'An error occurred' }))
          )
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
        this.adminService.userRegister(userData).pipe(
          map((res: ApiResponse) => UserActions.userRegisterSuccess({ message: res.message })),
          catchError((err: HttpErrorResponse) =>
            of(UserActions.userRegisterFailure({ error: err.error?.message || 'An error occurred' }))
          )
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
          map((res: UploadEvent) => {
            if (res?.status === 'progress') return UserActions.uploadFileProgress({ progress: res.message });
            if (res?.status === 'success') {
              Swal.fire('Success', res.message, 'success');
              return UserActions.uploadFileSuccess({ message: res.message });
            }
            return UserActions.uploadFileFailure({ error: res?.message || 'Upload failed' });
          }),
          catchError((err: HttpErrorResponse) => {
            const msg = err.error?.message || err.message;
            Swal.fire({ icon: 'error', title: 'Upload Error', text: msg });
            return of(UserActions.uploadFileFailure({ error: msg }));
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
