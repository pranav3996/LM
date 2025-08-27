import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './components/login/login.component';
import { ProfileComponent } from './components/profile/profile.component';
import { UserRegisterComponent } from './components/user-register/user-register.component';
import { HeaderComponent } from './components/header/header.component';
import { UserlistComponent } from './components/userlist/userlist.component';
import { UpdateuserComponent } from './components/updateuser/updateuser.component';
import { AdminRegisterComponent } from './components/admin-register/admin-register.component';
import { PasswordresetComponent } from './components/passwordreset/passwordreset.component';
import { PasswordresetconfirmComponent } from './components/passwordresetconfirm/passwordresetconfirm.component';
import { ChangepasswordComponent } from './components/changepassword/changepassword.component';
import { AccessDeniedComponent } from './components/access-denied/access-denied.component';
import { ErrorComponent } from './components/error/error.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import {
  faBan,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { HttpErrorInterceptor } from './interceptors/http-error.interceptor';
import { HttpAuthInterceptor } from './interceptors/http-auth.interceptor';
import { NgOtpInputModule } from 'ng-otp-input';
import { ServiceWorkerModule } from '@angular/service-worker';
import { MultiStepFormComponent } from './components/multi-step-form/multi-step-form.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { MatIconModule } from '@angular/material/icon';
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ProfileComponent,
    UserRegisterComponent,
    HeaderComponent,
    UserlistComponent,
    UpdateuserComponent,
    AdminRegisterComponent,
    PasswordresetComponent,
    PasswordresetconfirmComponent,
    ChangepasswordComponent,
    AccessDeniedComponent,
    ErrorComponent,
    MultiStepFormComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    NgOtpInputModule,
    BrowserAnimationsModule,
    MatStepperModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    FormlyBootstrapModule,
    FormlyModule.forRoot({
      validationMessages: [
        { name: 'required', message: 'This field is required' },
      ],
    }),
    MatIconModule
  ],
  providers: [
    //   {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: HttpErrorInterceptor,
    //   multi: true
    // }
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpAuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(faBan, faExclamationTriangle);
  }
}
