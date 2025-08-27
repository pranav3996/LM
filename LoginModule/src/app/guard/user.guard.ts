import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';

export const usersGuard: CanActivateFn = (route, state) => {
  if (inject(AuthService).isAuthenticated()) {
    return true;
  }else{
    inject(Router).navigate(['/login'])
    return false
  }
};

export const adminGuard: CanActivateFn = (route, state) => {
  if (inject(AuthService).isAdmin()) {
    return true;
  }else{
    inject(Router).navigate(['/login'])
    return false
  }
};
