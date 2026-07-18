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

  // ── Server: auth-protected or dynamic — rendered per-request ────────────
  // These require a valid session or dynamic data so they cannot be prerendered.
  { path: 'profile', renderMode: RenderMode.Server },
  { path: 'users', renderMode: RenderMode.Server },
  { path: 'adminRegister', renderMode: RenderMode.Server },
  { path: 'update/:id', renderMode: RenderMode.Server },
  { path: 'change-password', renderMode: RenderMode.Server },
  { path: 'multistepform', renderMode: RenderMode.Server },

  // ── Fallback ─────────────────────────────────────────────────────────────
  { path: '', renderMode: RenderMode.Server },
  { path: '**', renderMode: RenderMode.Server },
];
