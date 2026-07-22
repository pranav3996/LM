import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // ── Prerender: public, static, no auth required ──────────────────────────
  // These are built to static HTML at build time — fastest possible TTFB.
  { path: 'login', renderMode: RenderMode.Prerender },
  { path: 'user-register', renderMode: RenderMode.Prerender },
  { path: 'forgot-password', renderMode: RenderMode.Prerender },
  { path: 'reset-password', renderMode: RenderMode.Prerender },
  { path: 'error', renderMode: RenderMode.Prerender },
  { path: 'access-denied', renderMode: RenderMode.Prerender },

  // ── Client: auth-protected routes — token lives in-memory in the browser,
  // the SSR server has no token so it must not attempt authenticated API calls.
  // RenderMode.Client sends a shell HTML; the browser fetches data after hydration.
  { path: 'profile', renderMode: RenderMode.Client },
  { path: 'users', renderMode: RenderMode.Client },
  { path: 'adminRegister', renderMode: RenderMode.Client },
  { path: 'update/:id', renderMode: RenderMode.Client },
  { path: 'change-password', renderMode: RenderMode.Client },
  { path: 'multistepform', renderMode: RenderMode.Client },

  // ── Fallback ─────────────────────────────────────────────────────────────
  { path: '', renderMode: RenderMode.Server },
  { path: '**', renderMode: RenderMode.Server },
];
