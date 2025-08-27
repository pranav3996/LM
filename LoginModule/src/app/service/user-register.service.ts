import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserRegisterService {

  // private BASE_URL = "http://localhost:1010/user/register";
  private BASE_URL = environment.USER_REGISTER_URL;
  constructor(private http: HttpClient) { }
  userRegister(userData: any): Observable<any> {
    const url = `${this.BASE_URL}`;
    return this.http.post<any>(url, userData);
  }

}
