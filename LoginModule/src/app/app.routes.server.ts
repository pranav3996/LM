import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'update/:id',
    renderMode: RenderMode.Server // no prerender since it's dynamic
    // OR with getPrerenderParams if you want static HTML for certain IDs
  },
  {
    path: '**',
    renderMode: RenderMode.Server // fallback
  }
];
