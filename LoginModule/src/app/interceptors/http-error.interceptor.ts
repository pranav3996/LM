import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status !== 200) {
     
          if (error.status === 401) {
        
            console.log("Unauthorized:", error.message)
            // this.router.navigate(['/login']);
          } else if (error.status === 403) {
     
            console.log("Access denied forbidden:", error.message)
            // this.router.navigate(['/access-denied']);
          } 
          else if (error.status === 400) {
         
            console.error('Bad Request :', error.message);
         
            // this.router.navigate(['/bad-request']);
          }
          
          else {
       
            console.log("Redirect to a generic error page or show a message")
            // this.router.navigate(['/error']);
          }
        }
        return throwError(() => new Error(error.message));
      })
    );
  }
}
