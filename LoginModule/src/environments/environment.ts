// Development environment — calls Spring Boot directly on :1010.
export const environment = {
  production: false,
  apiUrl: 'http://localhost:1010',
  ssrApiUrl: 'http://localhost:1010',
  AUTH_URL: 'http://localhost:1010/auth',
  ADMIN_URL: 'http://localhost:1010/admin',
  PROFILE_URL: 'http://localhost:1010/adminuser/get-profile',
  PASSWORD_URL: 'http://localhost:1010/reset',
  USER_REGISTER_URL: 'http://localhost:1010/user/register',
};
