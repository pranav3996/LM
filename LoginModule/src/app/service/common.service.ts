import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  // private BASE_URL = "http://localhost:1010/adminuser/get-profile";
  private PROFILE_URL = environment.PROFILE_URL;
  constructor(private http: HttpClient) { }

  getYourProfile(): Observable<any> {
    const url = `${this.PROFILE_URL}`;
    return this.http.get<any>(url);
  }
}
