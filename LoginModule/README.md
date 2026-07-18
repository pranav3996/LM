# LoginModule — Angular SSR + Spring Boot Enterprise Reference

## Project Overview

A production-ready, full-stack user management portal built with **Angular 22 (SSR)** and **Spring Boot**. It provides JWT-based authentication, role-based access control (ADMIN / USER), user CRUD, password reset via OTP and email token, CSV/Excel export, and bulk file upload.

| Layer | Technology |
|---|---|
| Frontend | Angular 22, standalone components, NgRx 21, Angular Material 22 |
| SSR Runtime | `@angular/ssr` + Express 5 (Node.js) |
| Backend | Spring Boot (Java), Spring Security, JWT |
| State | NgRx Store + Effects + Signals (`toSignal`) |
| Styling | Bootstrap 5, Angular Material (indigo-pink), Font Awesome 6 |
| PWA | Angular Service Worker (`ngsw-worker.js`) |

---

## Architecture

```
Browser
  │
  ▼
Nginx (port 443 / 80)
  ├── /api/**  ──────────────────────► Spring Boot :1010
  └── /**  ──────────────────────────► Node SSR Server :4000
                                            │
                                            ├── Static files (dist/browser)
                                            ├── Prerendered HTML (login, register…)
                                            └── Server-rendered HTML (profile, users…)
                                                    │
                                                    └── HTTP (server-side) ──► Spring Boot :1010
```

### Key architectural decisions

- **Relative API URLs in production** (`/api/*`): The browser sends requests to Nginx which proxies to Spring Boot. The SSR Node server calls Spring Boot directly via `ssrApiUrl` (absolute). This eliminates CORS entirely.
- **Feature-level NgRx stores**: `user` and `password` stores are registered with `provideState()` on their routes — they are only instantiated when the route is activated, not at app startup.
- **Global NgRx store**: Only `auth` state lives in the root store because it is needed across all routes.
- **Signals + NgRx**: Services expose `signal()`-backed state via `toObservable()`. Components consume them with `toSignal()` for zero-subscription template code.

---

## SSR Request Flow

```
1. Browser requests GET /profile
2. Nginx forwards to Node SSR :4000
3. AngularNodeAppEngine renders ProfileComponent server-side
   a. Angular router activates the route
   b. usersGuard checks StorageService (SSR-safe memory fallback)
   c. UserActions.loadProfile dispatches → UserEffects calls CommonService
   d. CommonService.getYourProfile() makes HTTP GET to Spring Boot :1010
   e. Spring Boot validates JWT, returns profile JSON
   f. HTTP Transfer Cache serialises the response into the HTML
4. Node writes the fully-rendered HTML to the browser response
5. Browser receives HTML with content already present (no flash)
6. Angular hydrates — withEventReplay() replays any clicks that fired early
7. withHttpTransferCache() replays the cached HTTP response — no second API call
```

---

## Angular ↔ Spring Boot Communication

### Development (no Nginx)

```
Angular dev server :4200  ──HTTP──►  Spring Boot :1010  (absolute URLs)
```

### Production (with Nginx)

```
Browser  ──/api/**──►  Nginx  ──proxy──►  Spring Boot :1010
Browser  ──/**──────►  Nginx  ──proxy──►  Node SSR :4000
Node SSR ──HTTP──────────────────────────► Spring Boot :1010  (ssrApiUrl)
```

### API base URLs (from `environment.ts` / `environment.prod.ts`)

| Key | Dev | Prod |
|---|---|---|
| `AUTH_URL` | `http://localhost:1010/auth` | `/api/auth` |
| `ADMIN_URL` | `http://localhost:1010/admin` | `/api/admin` |
| `PROFILE_URL` | `http://localhost:1010/adminuser/get-profile` | `/api/adminuser/get-profile` |
| `PASSWORD_URL` | `http://localhost:1010/reset` | `/api/reset` |
| `USER_REGISTER_URL` | `http://localhost:1010/user/register` | `/api/user/register` |

---

## Folder Structure

```
LoginModule/
├── src/
│   ├── app/
│   │   ├── components/          # Feature components (lazy-loaded per route)
│   │   │   ├── login/
│   │   │   ├── profile/
│   │   │   ├── userlist/
│   │   │   ├── updateuser/
│   │   │   ├── admin-register/
│   │   │   ├── user-register/
│   │   │   ├── changepassword/
│   │   │   ├── passwordreset/
│   │   │   ├── passwordresetconfirm/
│   │   │   ├── multi-step-form/
│   │   │   ├── header/
│   │   │   ├── error/
│   │   │   └── access-denied/
│   │   ├── guard/
│   │   │   ├── user.guard.ts          # usersGuard, adminGuard (UrlTree returns)
│   │   │   └── unsaved-changes.guard.ts
│   │   ├── interceptors/
│   │   │   ├── http-auth.interceptor.ts   # JWT attach + token refresh
│   │   │   └── http-error.interceptor.ts  # Global error → route navigation
│   │   ├── models/
│   │   │   └── api.models.ts          # All request/response interfaces
│   │   ├── service/
│   │   │   ├── auth.service.ts        # Login, refresh, logout, signal state
│   │   │   ├── storage.service.ts     # SSR-safe sessionStorage wrapper
│   │   │   ├── admin.service.ts       # User CRUD, file upload, signal state
│   │   │   ├── common.service.ts      # Profile fetch, signal state
│   │   │   ├── password.service.ts    # OTP, reset, change password
│   │   │   └── user-register.service.ts  # @deprecated — delegates to AdminService
│   │   ├── store/
│   │   │   ├── auth/                  # Root store — login, logout, refresh
│   │   │   ├── user/                  # Feature store — CRUD, profile, upload
│   │   │   ├── password/              # Feature store — OTP, reset, change
│   │   │   └── app.state.ts
│   │   ├── validators/
│   │   │   ├── email-unique.validator.ts   # Async — debounced API check
│   │   │   └── password-match.validator.ts # Sync cross-field validator
│   │   ├── app.component.ts
│   │   ├── app.config.ts              # Root providers (HTTP, NgRx, hydration)
│   │   ├── app.config.server.ts       # SSR-specific providers
│   │   ├── app.routes.ts              # Lazy-loaded route definitions
│   │   └── app.routes.server.ts       # SSR render modes per route
│   ├── environments/
│   │   ├── environment.ts             # Dev — absolute URLs to :1010
│   │   └── environment.prod.ts        # Prod — relative /api/* URLs
│   ├── index.html                     # Shell with SEO meta, preconnect hints
│   ├── main.ts                        # Browser bootstrap
│   ├── main.server.ts                 # SSR bootstrap
│   ├── server.ts                      # Express server with security headers
│   └── styles.css
├── public/
│   ├── icons/                         # PWA icons
│   └── manifest.webmanifest
├── angular.json
├── ngsw-config.json                   # Service Worker cache config
├── package.json
└── tsconfig.json
```

---

## Installation

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | ≥ 22 LTS |
| npm | ≥ 10 |
| Angular CLI | 22.x (`npm i -g @angular/cli@22`) |
| Java | 17+ |
| Maven / Gradle | (Spring Boot backend) |

### Angular frontend

```bash
cd LoginModule
npm install
```

### Spring Boot backend

```bash
# From the Spring Boot project root
./mvnw clean install
# or
./gradlew build
```

---

## Development Setup

### 1. Start Spring Boot

```bash
./mvnw spring-boot:run
# Listens on http://localhost:1010
```

### 2. Start Angular dev server (no SSR)

```bash
ng serve
# http://localhost:4200
# Uses environment.ts — calls Spring Boot directly on :1010
# SSR is disabled in development configuration (outputMode: static, ssr: false)
```

### 3. Start Angular with SSR in development

```bash
ng build --configuration development
node dist/login-module/server/server.mjs
# http://localhost:4000
```

---

## Production Setup

### Build Angular for production

```bash
ng build --configuration production
# Output: dist/login-module/
#   browser/   — static assets + prerendered HTML
#   server/    — Node SSR bundle (server.mjs)
```

### Run the SSR Node server

```bash
NODE_ENV=production PORT=4000 node dist/login-module/server/server.mjs
```

Or use the npm script:

```bash
npm run serve:ssr
```

### Run Spring Boot in production

```bash
java -jar target/your-app.jar --server.port=1010
```

---

## Running Angular, Spring Boot, and SSR Together

### Development (3 terminals)

```bash
# Terminal 1 — Spring Boot
./mvnw spring-boot:run

# Terminal 2 — Angular dev server (no SSR)
ng serve

# Terminal 3 (optional) — Angular with SSR
ng build && node dist/login-module/server/server.mjs
```

### Production (2 processes + Nginx)

```bash
# Process 1 — Spring Boot
java -jar app.jar

# Process 2 — Angular SSR Node server
NODE_ENV=production node dist/login-module/server/server.mjs

# Nginx handles routing between them (see Nginx section below)
```

---

## Environment Configuration

### `src/environments/environment.ts` (development)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:1010',
  ssrApiUrl: 'http://localhost:1010',
  AUTH_URL: 'http://localhost:1010/auth',
  ADMIN_URL: 'http://localhost:1010/admin',
  // ...
};
```

### `src/environments/environment.prod.ts` (production)

```typescript
export const environment = {
  production: true,
  apiUrl: '/api',                        // Nginx proxies to Spring Boot
  ssrApiUrl: 'http://localhost:1010',    // SSR Node → Spring Boot direct
  AUTH_URL: '/api/auth',
  ADMIN_URL: '/api/admin',
  // ...
};
```

### Node SSR environment variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `4000` | Port the SSR Node server listens on |
| `NODE_ENV` | — | Set to `production` to enable HSTS header |

---

## Nginx Reverse Proxy Setup

```nginx
# /etc/nginx/sites-available/loginmodule

upstream spring_boot {
    server 127.0.0.1:1010;
    keepalive 32;
}

upstream angular_ssr {
    server 127.0.0.1:4000;
    keepalive 32;
}

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;

    # Spring Boot API — strip /api prefix before forwarding
    location /api/ {
        proxy_pass         http://spring_boot/;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 30s;
    }

    # Angular SSR — all other requests
    location / {
        proxy_pass         http://angular_ssr;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade           $http_upgrade;
        proxy_set_header   Connection        'upgrade';
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

> **Important**: The Nginx `/api/` location strips the `/api` prefix with `proxy_pass http://spring_boot/;` (trailing slash). Spring Boot receives `/auth/login`, not `/api/auth/login`. Ensure your Spring Boot controllers are mapped without the `/api` prefix.

---

## Authentication Flow

```
1. User submits login form
   └── LoginComponent dispatches AuthActions.login({ email, password })

2. AuthEffects.login$ calls AuthService.login()
   └── POST /api/auth/login → Spring Boot
   └── Spring Boot validates credentials, returns JWT + refresh token

3. AuthEffects.loginSuccess$ (tap side-effect):
   ├── StorageService.setItem('accessToken', ...)   — sessionStorage
   ├── StorageService.setItem('refreshToken', ...)
   ├── StorageService.setItem('role', ...)
   ├── StorageService.setItem('email', ...)
   ├── AuthService.setLogoutTimer(expirationAccessTokenTime)  — auto-refresh
   ├── AuthService.updateInactivityTime(expirationRefreshTokenTime)  — auto-logout
   └── Router.navigate(['/profile'])

4. Subsequent requests
   └── HttpAuthInterceptor attaches Bearer token to every request

5. Token expiry (403 response)
   ├── HttpAuthInterceptor.handle403Error() calls AuthService.refreshToken()
   ├── POST /api/auth/refresh → Spring Boot
   ├── New accessToken stored in sessionStorage
   └── Original request retried with new token

6. Logout
   └── AuthActions.logout → AuthEffects.logout$ → AuthService.logOut()
       ├── Clears NgRx auth state
       ├── StorageService.clear()
       └── Router.navigate(['/login'])
```

### Token storage

Tokens are stored in **sessionStorage** (not localStorage) via `StorageService`. This means:
- Tokens are cleared when the browser tab is closed
- Tokens are not accessible from other tabs
- SSR falls back to an in-memory map (no sessionStorage on the server)

### Route protection

| Guard | Condition | Redirect |
|---|---|---|
| `usersGuard` | `isAuthenticated()` (accessToken in sessionStorage) | `/login` |
| `adminGuard` | `isAdmin()` (role === 'ADMIN') | `/access-denied` (if authenticated) or `/login` |

---

## Deployment Guide

### 1. Build

```bash
cd LoginModule
ng build --configuration production
```

### 2. Copy artifacts to server

```bash
# Copy Angular build output
scp -r dist/login-module user@server:/var/www/loginmodule/

# Copy Spring Boot JAR
scp target/app.jar user@server:/opt/loginmodule/
```

### 3. Create systemd service for Node SSR

```ini
# /etc/systemd/system/loginmodule-ssr.service
[Unit]
Description=LoginModule Angular SSR
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/loginmodule/server
ExecStart=/usr/bin/node /var/www/loginmodule/server/server.mjs
Restart=on-failure
Environment=NODE_ENV=production
Environment=PORT=4000

[Install]
WantedBy=multi-user.target
```

```bash
systemctl enable loginmodule-ssr
systemctl start loginmodule-ssr
```

### 4. Create systemd service for Spring Boot

```ini
# /etc/systemd/system/loginmodule-api.service
[Unit]
Description=LoginModule Spring Boot API
After=network.target

[Service]
Type=simple
User=www-data
ExecStart=/usr/bin/java -jar /opt/loginmodule/app.jar
Restart=on-failure
Environment=SPRING_PROFILES_ACTIVE=prod

[Install]
WantedBy=multi-user.target
```

### 5. Enable Nginx site

```bash
ln -s /etc/nginx/sites-available/loginmodule /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

---

## Performance Optimizations

### Implemented in this project

| Optimization | Where | Benefit |
|---|---|---|
| **Lazy loading** | `app.routes.ts` — all routes use `loadComponent()` | Initial bundle split into per-route chunks |
| **HTTP Transfer Cache** | `app.config.ts` — `withHttpTransferCache()` | Server HTTP responses reused on hydration — zero double-fetch |
| **Event Replay** | `app.config.ts` — `withEventReplay()` | User interactions before hydration are not lost |
| **OnPush everywhere** | All components | Angular only checks components when inputs change or signals emit |
| **Signals** | All services + components | Fine-grained reactivity, no unnecessary re-renders |
| **Prerender** | `app.routes.server.ts` — login, register, error pages | Static HTML served instantly, no Node processing |
| **Feature stores** | `app.routes.ts` — `provideState()` per route | NgRx reducers only loaded when route is activated |
| **`@defer` blocks** | `userlist.component.html` | User table rendered on idle — unblocks initial paint |
| **`provideAnimationsAsync()`** | `app.config.ts` | Animation module loaded asynchronously |
| **Static asset caching** | `server.ts` — `maxAge: '1y'` | Browser caches JS/CSS for 1 year (content-hashed filenames) |
| **Service Worker** | `ngsw-config.json` | Offline support + asset caching for repeat visits |
| **`withViewTransitions()`** | `app.config.ts` | Native browser page transition animations |

### Recommended additions

- **`@ngrx/signals` SignalStore** — replace `AdminService` signal state with a proper SignalStore for better devtools integration
- **`@angular/core` `resource()` API** — Angular 22 introduces `resource()` for declarative async data loading with built-in loading/error states
- **HTTP response caching** — add `Cache-Control` headers on Spring Boot for read-only endpoints (`/admin/get-all-users`)
- **Virtual scrolling** — use `@angular/cdk/scrolling` `CdkVirtualScrollViewport` in `userlist.component.html` for large user lists

---

## Security Best Practices

### Implemented

| Practice | Where |
|---|---|
| JWT Bearer token auth | `HttpAuthInterceptor` — attaches to every API request |
| Automatic token refresh | `HttpAuthInterceptor.handle403Error()` — transparent to the user |
| SSR-safe storage | `StorageService` — `typeof window` guard, memory fallback on server |
| Security headers | `server.ts` — `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy`, `HSTS` (production) |
| UrlTree guards | `user.guard.ts` — returns `UrlTree` instead of `navigate()+false` |
| Role-based access | `adminGuard` / `usersGuard` on all protected routes |
| `noindex` meta | `index.html` — prevents search engines indexing the auth portal |
| `crossOrigin: anonymous` | `angular.json` — prevents credential leakage in error reports |
| Unsaved changes guard | `unsaved-changes.guard.ts` — prevents accidental data loss |

### Spring Boot recommendations

Add these to your Spring Security configuration:

```java
http
  .headers(headers -> headers
    .contentSecurityPolicy(csp -> csp
      .policyDirectives("default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com"))
    .frameOptions(frame -> frame.deny())
    .httpStrictTransportSecurity(hsts -> hsts
      .maxAgeInSeconds(31536000)
      .includeSubDomains(true))
  )
  .cors(cors -> cors.configurationSource(corsConfigurationSource()))
```

```java
@Bean
CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("https://yourdomain.com"));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
    config.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
}
```

---

## Troubleshooting

### `window is not defined` / `sessionStorage is not defined`

**Cause**: Code accessing browser APIs runs on the server during SSR.
**Fix**: Use `StorageService` (already SSR-safe) or guard with `isPlatformBrowser(platformId)`.

```typescript
import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const platformId = inject(PLATFORM_ID);
if (isPlatformBrowser(platformId)) {
  // browser-only code here
}
```

### Hydration mismatch errors in the console

**Cause**: Server-rendered HTML differs from what the client would render.
**Common causes**:
- Using `Date.now()` or `Math.random()` in templates
- Accessing `window.location` directly instead of Angular's `Router`
- Conditional rendering based on `localStorage`/`sessionStorage` without SSR guard

**Fix**: Ensure all conditional logic uses `StorageService` or `isPlatformBrowser`.

### Double HTTP requests (API called twice)

**Cause**: `withHttpTransferCache()` not configured, or the request is not cacheable (POST, has `Authorization` header by default excluded).
**Fix**: `withHttpTransferCache()` is already configured in `app.config.ts`. For authenticated GET requests, configure the transfer cache to include them:

```typescript
provideClientHydration(
  withHttpTransferCache({
    includeRequestsWithAuthHeaders: true,
  }),
  withEventReplay(),
)
```

### 403 on every request after login

**Cause**: `accessToken` not being stored or the interceptor not reading it.
**Check**: Open DevTools → Application → Session Storage → verify `accessToken` key exists.

### `ng serve` works but `node server.mjs` crashes

**Cause**: Missing build output. Run `ng build --configuration production` first.

### Bootstrap dropdown not working

**Cause**: Bootstrap JS was moved to `defer` in `index.html`. This is correct — it loads after the DOM is ready. If dropdowns still fail, ensure you are not calling Bootstrap JS APIs before `DOMContentLoaded`.

### Service Worker not updating

```bash
# Force unregister in browser console
navigator.serviceWorker.getRegistrations().then(r => r.forEach(reg => reg.unregister()))
```

Then hard-refresh (`Ctrl+Shift+R`).

---

## Enterprise Best Practices

### State management

- **Root store** (`auth`): Only truly global, cross-cutting state. Currently correct.
- **Feature stores** (`user`, `password`): Registered per-route with `provideState()`. Destroyed when the route is deactivated. Currently correct.
- **Service signals**: `AdminService`, `CommonService`, `PasswordService` use `signal()` for local UI state (loading, error, data). This is the correct pattern for service-level state that doesn't need time-travel debugging.
- **Avoid**: Putting UI state (loading spinners, form errors) in NgRx. Keep it in component signals or service signals.

### Component design

- All components use `ChangeDetectionStrategy.OnPush` — correct.
- All components use `inject()` instead of constructor injection — correct.
- Template expressions use signals (`loading()`, `error()`) — correct.
- `@defer` used in `userlist.component.html` for the table — correct.

### HTTP layer

- `withFetch()` is required for SSR HTTP Transfer Cache — configured correctly.
- Both interceptors are registered — `HttpAuthInterceptor` (token) and `HttpErrorInterceptor` (error routing).
- Interceptors are SSR-safe with `isPlatformBrowser` guards.

### Naming conventions

Follow the Angular style guide:
- Files: `kebab-case.type.ts` (e.g., `auth.service.ts`, `user.guard.ts`)
- Classes: `PascalCase` (e.g., `AuthService`, `UserlistComponent`)
- Selectors: `app-` prefix (e.g., `app-header`, `app-login`)

### Code quality

- `strict: true` in `tsconfig.json` — enforces null safety and type correctness.
- `noImplicitReturns`, `noFallthroughCasesInSwitch` — prevents common bugs.
- `strictTemplates: true` in `angularCompilerOptions` — catches template type errors at build time.

### Monitoring (recommended additions)

```typescript
// Add to app.config.ts for production error tracking
import { ErrorHandler } from '@angular/core';

class GlobalErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    // Send to your monitoring service (e.g., Sentry, Datadog)
    console.error('Unhandled error:', error);
  }
}

// In providers:
{ provide: ErrorHandler, useClass: GlobalErrorHandler }
```
