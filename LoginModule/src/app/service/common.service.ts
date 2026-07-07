import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  private http = inject(HttpClient);


  // private BASE_URL = "http://localhost:1010/adminuser/get-profile";
  private PROFILE_URL = environment.PROFILE_URL;

  getYourProfile(): Observable<any> {
    const url = `${this.PROFILE_URL}`;
    return this.http.get<any>(url);
  }
}
