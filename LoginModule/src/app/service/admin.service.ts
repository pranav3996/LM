import { HttpClient, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  // private BASE_URL = "http://localhost:1010/admin";
  private BASE_URL = environment.ADMIN_URL;
  constructor(private http: HttpClient) { }

  adminRegister(userData: any): Observable<any> {
    const url = `${this.BASE_URL}/register`;
    return this.http.post<any>(url, userData);
  }

  getAllUsers(): Observable<any> {
    const url = `${this.BASE_URL}/get-all-users`;
    return this.http.get<any>(url);
  }

  getUsersById(userId: string): Observable<any> {
    const url = `${this.BASE_URL}/get-users/${userId}`;
    return this.http.get<any>(url);
  }

  deleteUser(userId: string): Observable<any> {
    const url = `${this.BASE_URL}/delete/${userId}`;
    return this.http.delete<any>(url);
  }

  updateUser(userId: string, userData: any): Observable<any> {
    const url = `${this.BASE_URL}/update/${userId}`;
    return this.http.put<any>(url, userData);
  }

  uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);
  
    return this.http.post(`${this.BASE_URL}/upload`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map(event => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            if (event.total) {
              const progress = Math.round((event.loaded / event.total) * 100);
              return { status: 'progress', message: progress };
            } else {
              return { status: 'progress', message: 100 }; // Default to 100% if no total
            }
          case HttpEventType.Response:
            const body = event.body as any; // Cast event.body to any type
            if (body && body.status === 'success') {
              return { status: 'success', message:  body.message , body: body };
            } else if (body && body.status === 'error') {
              const errorMessage = body.message || 'File upload failed.';
              const errorCode = body.statusCode || 'UNKNOWN';
              return { status: 'error', message: errorMessage, errorCode: errorCode, body: body };
            } else {
              return { status: 'error', message: 'Unexpected response format.', body: body };
            }
  
          default:
            return ;
        }
      }),
      catchError((error: HttpErrorResponse) => {
        const errorDetails = {
          statusCode: error.status,
          timestamp: new Date().toISOString(),
          message: error.error?.message || 'An error occurred',
          description: error.message || 'No additional error details provided'
        };
  
        console.error('Error occurred while uploading file:', errorDetails);
  
        return of({
          status: 'error',
          message: errorDetails.message,
          errorCode: error.status,
          details: errorDetails
        });
      })
    );
  }
  
}
