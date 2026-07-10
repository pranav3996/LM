import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminService } from './admin.service';
import { ApiResponse, UserData } from '../models/api.models';

/**
 * @deprecated Use AdminService.userRegister() directly.
 * Kept for backward compatibility.
 */
@Injectable({ providedIn: 'root' })
export class UserRegisterService {
  private adminService = inject(AdminService);

  userRegister(userData: UserData): Observable<ApiResponse> {
    return this.adminService.userRegister(userData);
  }
}
