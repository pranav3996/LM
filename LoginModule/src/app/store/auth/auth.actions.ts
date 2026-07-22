import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    'Login':                  props<{ email: string; password: string }>(),
    'Login Success':          props<{ role: string; email: string }>(),
    'Login Failure':          props<{ error: string }>(),
    'Logout':                 emptyProps(),
    'Logout Success':         emptyProps(),
    'Logout Failure':         emptyProps(),
    'Init Session':           emptyProps(),
    'Init Session Success':   props<{ role: string; email: string }>(),
    'Init Session Failure':   emptyProps(),
    'Refresh Token':          emptyProps(),
    'Refresh Token Success':  props<{ role: string; email: string }>(),
    'Refresh Token Failure':  props<{ error: string }>(),
    'Clear Error':            emptyProps(),
  },
});
