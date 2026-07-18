import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

import { userReducer } from './store/user/user.reducer';
import { UserEffects } from './store/user/user.effects';
import { passwordReducer } from './store/password/password.reducer';
import { PasswordEffects } from './store/password/password.effects';

import { adminGuard, usersGuard } from './guard/user.guard';
import { unsavedChangesGuard } from './guard/unsaved-changes.guard';

// Shared feature store providers — registered per-route so they are only
// instantiated when the route is actually activated (lazy feature stores).
const userFeature = [provideState('user', userReducer), provideEffects([UserEffects])];
const passwordFeature = [provideState('password', passwordReducer), provideEffects([PasswordEffects])];

export const routes: Routes = [
  // ── Public routes ────────────────────────────────────────────────────────
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'user-register',
    loadComponent: () => import('./components/user-register/user-register.component').then(m => m.UserRegisterComponent),
    canDeactivate: [unsavedChangesGuard],
    providers: [...userFeature],
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./components/passwordreset/passwordreset.component').then(m => m.PasswordresetComponent),
    providers: [...passwordFeature],
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./components/passwordresetconfirm/passwordresetconfirm.component').then(m => m.PasswordresetconfirmComponent),
    providers: [...passwordFeature],
  },

  // ── Authenticated routes ─────────────────────────────────────────────────
  {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [usersGuard],
    providers: [...userFeature],
  },
  {
    path: 'change-password',
    loadComponent: () => import('./components/changepassword/changepassword.component').then(m => m.ChangepasswordComponent),
    canDeactivate: [unsavedChangesGuard],
    providers: [...passwordFeature],
  },
  {
    path: 'multistepform',
    loadComponent: () => import('./components/multi-step-form/multi-step-form.component').then(m => m.MultiStepFormComponent),
    canDeactivate: [unsavedChangesGuard],
  },

  // ── Admin-only routes ────────────────────────────────────────────────────
  {
    path: 'adminRegister',
    loadComponent: () => import('./components/admin-register/admin-register.component').then(m => m.AdminRegisterComponent),
    canActivate: [adminGuard],
    canDeactivate: [unsavedChangesGuard],
    providers: [...userFeature],
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./components/updateuser/updateuser.component').then(m => m.UpdateuserComponent),
    canActivate: [adminGuard],
    canDeactivate: [unsavedChangesGuard],
    providers: [...userFeature],
  },
  {
    path: 'users',
    loadComponent: () => import('./components/userlist/userlist.component').then(m => m.UserlistComponent),
    canActivate: [adminGuard],
    providers: [...userFeature],
  },

  // ── Utility routes ───────────────────────────────────────────────────────
  {
    path: 'error',
    loadComponent: () => import('./components/error/error.component').then(m => m.ErrorComponent),
  },
  {
    path: 'access-denied',
    loadComponent: () => import('./components/access-denied/access-denied.component').then(m => m.AccessDeniedComponent),
  },

  // ── Redirects & fallback ─────────────────────────────────────────────────
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: '**',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent),
  },
];
