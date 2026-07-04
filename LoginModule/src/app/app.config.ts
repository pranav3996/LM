import { ApplicationConfig, importProvidersFrom, isDevMode } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';

// interceptors
import { HttpAuthInterceptor } from './interceptors/http-auth.interceptor';

// routing
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

// modules
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgOtpInputModule } from 'ng-otp-input';
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// formly
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { FormlyModule } from '@ngx-formly/core';
import { provideServiceWorker } from '@angular/service-worker';

// NgRx
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { authReducer } from './store/auth/auth.reducer';
import { userReducer } from './store/user/user.reducer';
import { passwordReducer } from './store/password/password.reducer';
import { AuthEffects } from './store/auth/auth.effects';
import { UserEffects } from './store/user/user.effects';
import { PasswordEffects } from './store/password/password.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      BrowserModule,
      FormsModule,
      ReactiveFormsModule,
      FontAwesomeModule,
      NgOtpInputModule,
      MatStepperModule,
      MatInputModule,
      MatFormFieldModule,
      MatButtonModule,
      MatIconModule,
      FormlyBootstrapModule,
      FormlyModule.forRoot({
        validationMessages: [
          { name: 'required', message: 'This field is required' },
        ],
      })
    ),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpAuthInterceptor,
      multi: true,
    },
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    provideAnimations(),
    provideClientHydration(withEventReplay()),
    provideRouter(routes),
    provideStore({
      auth: authReducer,
      user: userReducer,
      password: passwordReducer,
    }),
    provideEffects([AuthEffects, UserEffects, PasswordEffects]),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
