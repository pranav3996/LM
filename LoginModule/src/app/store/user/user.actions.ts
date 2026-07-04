import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const UserActions = createActionGroup({
  source: 'User',
  events: {
    // Profile
    'Load Profile': emptyProps(),
    'Load Profile Success': props<{ profile: any }>(),
    'Load Profile Failure': props<{ error: string }>(),

    // User list
    'Load Users': emptyProps(),
    'Load Users Success': props<{ users: any[] }>(),
    'Load Users Failure': props<{ error: string }>(),

    // Single user
    'Load User By Id': props<{ userId: string }>(),
    'Load User By Id Success': props<{ user: any }>(),
    'Load User By Id Failure': props<{ error: string }>(),

    // Update user
    'Update User': props<{ userId: string; userData: any }>(),
    'Update User Success': emptyProps(),
    'Update User Failure': props<{ error: string }>(),

    // Delete user
    'Delete User': props<{ userId: string }>(),
    'Delete User Success': props<{ userId: string }>(),
    'Delete User Failure': props<{ error: string }>(),

    // Admin register
    'Admin Register': props<{ userData: any }>(),
    'Admin Register Success': props<{ message: string }>(),
    'Admin Register Failure': props<{ error: string }>(),

    // User register
    'User Register': props<{ userData: any }>(),
    'User Register Success': props<{ message: string }>(),
    'User Register Failure': props<{ error: string }>(),

    // Upload file
    'Upload File': props<{ file: File }>(),
    'Upload File Progress': props<{ progress: number }>(),
    'Upload File Success': props<{ message: string }>(),
    'Upload File Failure': props<{ error: string }>(),

    // Clear selected user
    'Clear Selected User': emptyProps(),
    // Clear error
    'Clear Error': emptyProps(),
  },
});
