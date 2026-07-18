// Production environment — API calls go through the Nginx reverse proxy.
// The SSR Node server uses ssrApiUrl for server-side HTTP calls (absolute URL
// required because there is no browser origin on the server).
// The browser uses apiUrl (relative) which Nginx proxies to Spring Boot.
export const environment = {
  production: true,
  // Relative URL — used by the browser; Nginx proxies /api/** → Spring Boot :1010
  apiUrl: '/api',
  // Absolute URL — used by the SSR Node server to call Spring Boot directly
  ssrApiUrl: 'http://localhost:1010',
  AUTH_URL: '/api/auth',
  ADMIN_URL: '/api/admin',
  PROFILE_URL: '/api/adminuser/get-profile',
  PASSWORD_URL: '/api/reset',
  USER_REGISTER_URL: '/api/user/register',
};
