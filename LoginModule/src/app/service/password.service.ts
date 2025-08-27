import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PasswordService {

  // private BASE_URL = "http://localhost:1010";
  private BASE_URL = environment.PASSWORD_URL;
  constructor(private http: HttpClient) { }

  sendPasswordResetRequest(email: string): Observable<any> {
    const url = `${this.BASE_URL}/password-reset-request`;
    return this.http.post<any>(url, { email });
  }

  resetPassword(accessToken: string, newPassword: string): Observable<any> {
    const url = `${this.BASE_URL}/reset-password?token=${accessToken}`;
    return this.http.post<any>(url, { newPassword });
  }

  changePassword(email: string, oldPassword: string, newPassword: string): Observable<any> {
    const url = `${this.BASE_URL}/change-password`;
    const body = { email, oldPassword, newPassword };
    return this.http.post<any>(url, body).pipe(
      catchError(error => {
        let errorMessage = error.message || 'An error occurred';
        if (error.error && error.error.message) {
          errorMessage = error.error.message; 
        }
        return throwError(errorMessage);
      })
    );
  }


  sendOTP(email: string): Observable<any> {
    return this.http.post<any>(`${this.BASE_URL}/password-reset-otp-request`, { email });
  }

  verifyOTP(email: string, otp: string): Observable<any> {
    return this.http.post<any>(`${this.BASE_URL}/verify-otp?email=${email}&otp=${otp}`, {});
  }

  resendOTP(email: string): Observable<any> {
    return this.http.post<any>(`${this.BASE_URL}/regenerate-otp?email=${email}`, {});
  }
  resetPasswordOtp(email: string, otp: string, newPassword: string): Observable<any> {
    const url = `${this.BASE_URL}/reset-password-otp?email=${email}&otp=${otp}`;
    // let params = new HttpParams().set('email', email).set('otp', otp);
    // const body = { newPassword: newPassword };

    // return this.http.post<any>(url, body, { params: params });
    return this.http.post<any>(url, { newPassword });
  }
}
