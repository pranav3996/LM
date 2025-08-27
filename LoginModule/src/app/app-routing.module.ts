import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ProfileComponent } from './components/profile/profile.component';
import { UserRegisterComponent } from './components/user-register/user-register.component';
import { UserlistComponent } from './components/userlist/userlist.component';
import { adminGuard, usersGuard } from './guard/user.guard';
import { UpdateuserComponent } from './components/updateuser/updateuser.component';
import { AdminRegisterComponent } from './components/admin-register/admin-register.component';
import { PasswordresetComponent } from './components/passwordreset/passwordreset.component';
import { PasswordresetconfirmComponent } from './components/passwordresetconfirm/passwordresetconfirm.component';
import { ChangepasswordComponent } from './components/changepassword/changepassword.component';
import { ErrorComponent } from './components/error/error.component';
import { AccessDeniedComponent } from './components/access-denied/access-denied.component';
import { MultiStepFormComponent } from './components/multi-step-form/multi-step-form.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'user-register', component: UserRegisterComponent },
  {
    path: 'adminRegister',
    component: AdminRegisterComponent,
    canActivate: [adminGuard],
  },
  { path: 'profile', component: ProfileComponent, canActivate: [usersGuard] },
  {
    path: 'update/:id',
    component: UpdateuserComponent,
    canActivate: [adminGuard],
  },
  { path: 'users', component: UserlistComponent, canActivate: [adminGuard] },
  { path: 'forgot-password', component: PasswordresetComponent },
  { path: 'reset-password', component: PasswordresetconfirmComponent },
  { path: 'change-password', component: ChangepasswordComponent },
  { path: 'error', component: ErrorComponent },
  { path: 'access-denied', component: AccessDeniedComponent },
  { path: 'multistepform', component: MultiStepFormComponent },
  { path: '**', component: LoginComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
