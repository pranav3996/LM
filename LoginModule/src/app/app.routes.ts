import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

// components
import { LoginComponent } from './components/login/login.component';
import { ProfileComponent } from './components/profile/profile.component';
import { UserRegisterComponent } from './components/user-register/user-register.component';
import { UserlistComponent } from './components/userlist/userlist.component';
import { UpdateuserComponent } from './components/updateuser/updateuser.component';
import { AdminRegisterComponent } from './components/admin-register/admin-register.component';
import { PasswordresetComponent } from './components/passwordreset/passwordreset.component';
import { PasswordresetconfirmComponent } from './components/passwordresetconfirm/passwordresetconfirm.component';
import { ChangepasswordComponent } from './components/changepassword/changepassword.component';
import { ErrorComponent } from './components/error/error.component';
import { AccessDeniedComponent } from './components/access-denied/access-denied.component';
import { MultiStepFormComponent } from './components/multi-step-form/multi-step-form.component';

// feature store — user
import { userReducer } from './store/user/user.reducer';
import { UserEffects } from './store/user/user.effects';

// feature store — password
import { passwordReducer } from './store/password/password.reducer';
import { PasswordEffects } from './store/password/password.effects';

// guards
import { adminGuard, usersGuard } from './guard/user.guard';
import { unsavedChangesGuard } from './guard/unsaved-changes.guard';

// Shared feature providers
const userFeature = [provideState('user', userReducer), provideEffects([UserEffects])];
const passwordFeature = [provideState('password', passwordReducer), provideEffects([PasswordEffects])];

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'user-register',
    component: UserRegisterComponent,
    canDeactivate: [unsavedChangesGuard],
    providers: [...userFeature],
  },
  {
    path: 'adminRegister',
    component: AdminRegisterComponent,
    canActivate: [adminGuard],
    canDeactivate: [unsavedChangesGuard],
    providers: [...userFeature],
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [usersGuard],
    providers: [...userFeature],
  },
  {
    path: 'update/:id',
    component: UpdateuserComponent,
    canActivate: [adminGuard],
    canDeactivate: [unsavedChangesGuard],
    providers: [...userFeature],
  },
  {
    path: 'users',
    component: UserlistComponent,
    canActivate: [adminGuard],
    providers: [...userFeature],
  },
  {
    path: 'forgot-password',
    component: PasswordresetComponent,
    providers: [...passwordFeature],
  },
  {
    path: 'reset-password',
    component: PasswordresetconfirmComponent,
    providers: [...passwordFeature],
  },
  {
    path: 'change-password',
    component: ChangepasswordComponent,
    canDeactivate: [unsavedChangesGuard],
    providers: [...passwordFeature],
  },
  { path: 'error', component: ErrorComponent },
  { path: 'access-denied', component: AccessDeniedComponent },
  { path: 'multistepform', component: MultiStepFormComponent, canDeactivate: [unsavedChangesGuard] },

  // redirects & fallback
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', component: LoginComponent },
];
