import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import AppRoutes from './Router/Routes';
import { StorageProvider } from './Context/StorageContext';
import { AuthProvider } from './Context/AuthContext';
import { AdminProvider } from './Context/AdminContext';
import { UserRegisterProvider } from './Context/UserRegisterContext';
import { ProfileProvider } from './Context/ProfileContext';
import { PasswordProvider } from './Context/PasswordContext';
import Header from './Components/header/Header';

// =====================
// ROUTES WITHOUT HEADER
// =====================
const ROUTES_WITHOUT_HEADER = [
  '/login',
  '/',
  '/user-register',
  '/forgot-password',
  '/reset-password',
  '/admin-register',
];

// =====================
// APP COMPONENT
// =====================
const App = () => {
  const location = useLocation();

  // Check if current route should display header
  const shouldShowHeader = () => {
    const urlWithoutQueryParams = location.pathname.split('?')[0];
    return !ROUTES_WITHOUT_HEADER.includes(urlWithoutQueryParams);
  };

  useEffect(() => {
    // Optional: Add any global initialization logic
    console.log('App initialized');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Conditional Header Rendering */}
      {shouldShowHeader() && <Header />}

      {/* Main Content Area */}
      <main className={shouldShowHeader() ? 'pt-16' : ''}>
        <AppRoutes />
      </main>
    </div>
  );
};

// =====================
// APP WITH ALL PROVIDERS
// =====================
const AppWithProviders = () => {
  return (
    <StorageProvider>
      <AuthProvider>
        <AdminProvider>
          <UserRegisterProvider>
            <ProfileProvider>
              <PasswordProvider>
                <App />
              </PasswordProvider>
            </ProfileProvider>
          </UserRegisterProvider>
        </AdminProvider>
      </AuthProvider>
    </StorageProvider>
  );
};

export default AppWithProviders;