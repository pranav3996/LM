import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeaderComponent, RouterOutlet],
})
export class AppComponent {
  private router = inject(Router);

  title = 'LoginModule';

  private readonly routesWithoutHeader = new Set([
    '/login',
    '/',
    '/user-register',
    '/forgot-password',
    '/reset-password',
  ]);

  // Derive current URL from NavigationEnd events — works correctly in SSR
  // because it reacts to actual navigation rather than reading router.url
  // which is always '/' on the server.
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects.split('?')[0]),
    ),
    { initialValue: this.router.url.split('?')[0] },
  );

  readonly isLoginPage = computed(() =>
    this.routesWithoutHeader.has(this.currentUrl()),
  );
}
