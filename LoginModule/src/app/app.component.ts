import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './service/auth.service';

import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [HeaderComponent, RouterOutlet]
})
export class AppComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  title = 'LoginModule';

  private routesWithoutHeader: string[] = [
    '/login',
    '/',
    '/user-register',
    '/forgot-password',
    '/reset-password',
  ];
  isLoginPage(): boolean {
    const urlWithoutQueryParams = this.router.url.split('?')[0];
    return this.routesWithoutHeader.includes(urlWithoutQueryParams);
  }


}
