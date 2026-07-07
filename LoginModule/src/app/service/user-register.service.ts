import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserRegisterService {
  private http = inject(HttpClient);

  // private BASE_URL = "http://localhost:1010/user/register";
  private BASE_URL = environment.USER_REGISTER_URL;

  userRegister(userData: any): Observable<any> {
    const url = `${this.BASE_URL}`;
    return this.http.post<any>(url, userData);
  }

}
