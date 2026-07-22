import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideClientHydration, withEventReplay, withNoIncrementalHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideServiceWorker } from '@angular/service-worker';

import { routes } from './app.routes';
import { httpAuthInterceptor } from './interceptors/http-auth.interceptor';
import { httpErrorInterceptor } from './interceptors/http-error.interceptor';
import { authReducer } from './store/auth/auth.reducer';
import { AuthEffects } from './store/auth/auth.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    // HTTP client — withFetch() is required for SSR HTTP Transfer Cache
    // Interceptor order matters: error interceptor must wrap the auth interceptor.
    // Request flow:  error → auth → HTTP
    // Response flow: HTTP → auth → error
    // This ensures auth's catchError (token refresh) runs first on errors.
    // Only if auth re-throws (refresh failed) does error's catchError see it
    // and navigate to /login — preventing the two interceptors from racing.
    provideHttpClient(withFetch(), withInterceptors([httpErrorInterceptor, httpAuthInterceptor])),

    // Animations — async variant defers loading until needed (better SSR perf)
    provideAnimationsAsync(),

    // Client hydration with HTTP Transfer Cache:
    // withHttpTransferCache() serialises server-side HTTP responses into the
    // HTML so the browser reuses them instead of re-fetching on hydration.
    // withEventReplay() replays user events that fired before hydration completes.
    // HTTP Transfer Cache is enabled by default in provideClientHydration()
    provideClientHydration(
      withEventReplay(),
      withNoIncrementalHydration(),
    ),

    // Router — withComponentInputBinding() maps route params to @Input()
    // withViewTransitions() enables the View Transitions API for page changes
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),

    // Root NgRx store — only global auth state lives here
    provideStore({ auth: authReducer }),
    provideEffects([AuthEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),

    // Service Worker — production only
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
