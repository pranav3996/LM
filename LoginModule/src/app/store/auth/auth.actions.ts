import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    'Login': props<{ email: string; password: string }>(),
    'Login Success': props<{ accessToken: string; refreshToken: string; role: string; email: string; expirationAccessTokenTime: string; expirationRefreshTokenTime: string }>(),
    'Login Failure': props<{ error: string }>(),
    'Logout': emptyProps(),
    'Refresh Token': emptyProps(),
    'Refresh Token Success': props<{ accessToken: string; refreshToken: string; expirationAccessTokenTime: string; expirationRefreshTokenTime: string }>(),
    'Refresh Token Failure': props<{ error: string }>(),
  },
});
