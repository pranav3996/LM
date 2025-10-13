import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(sessionStorage.getItem('accessToken'));
  const [refreshToken, setRefreshToken] = useState(sessionStorage.getItem('refreshToken'));
  const [user, setUser] = useState(() => {
    const email = sessionStorage.getItem('email');
    const role = sessionStorage.getItem('role');
    return email && role ? { email, role } : null;
  });
  const [logoutTimer, setLogoutTimer] = useState(null);

  const axiosRef = useRef(axios.create({ baseURL: import.meta.env.VITE_BASE_URL || 'http://localhost:1010' }));

  // Attach Authorization header
  // useEffect(() => {
  //   axiosRef.current.interceptors.request.use((config) => {
  //     if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  //     return config;
  //   });
  // }, [accessToken]);
  useEffect(() => {
    if (accessToken) {
      axiosRef.current.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      axiosRef.current.interceptors.request.use((config) => {
        config.headers.Authorization = `Bearer ${accessToken}`;
        return config;
      });
    } else {
      delete axiosRef.current.defaults.headers.common['Authorization'];
    }
  }, [accessToken]);


  // Login function
  const login = useCallback(async (email, password) => {
    try {
      const res = await axiosRef.current.post('/auth/login', { email, password });
      const data = res.data;

      if (!data.accessToken) return { success: false, error: 'No token received' };

      // ✅ Store everything in sessionStorage
      sessionStorage.setItem('accessToken', data.accessToken);
      sessionStorage.setItem('refreshToken', data.refreshToken);
      sessionStorage.setItem('role', data.role);
      sessionStorage.setItem('email', data.email);
      sessionStorage.setItem('expirationAccessTokenTime', new Date(data.expirationAccessTokenTime).getTime());
      sessionStorage.setItem('expirationRefreshTokenTime', new Date(data.expirationRefreshTokenTime).getTime());

      // ✅ Update state
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      setUser({ email: data.email, role: data.role });

      // ✅ Auto logout based on expiration
      const expiryTime = new Date(data.expirationAccessTokenTime).getTime() - Date.now();
      if (expiryTime > 0) setAutoLogout(expiryTime);

      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message || 'Login failed' };
    }
  }, []);

  // Logout function
  const logOut = useCallback(() => {
    sessionStorage.clear();
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    if (logoutTimer) clearTimeout(logoutTimer);
  }, [logoutTimer]);

  // Auto logout timer
  const setAutoLogout = useCallback(
    (ms) => {
      if (logoutTimer) clearTimeout(logoutTimer);
      const timer = setTimeout(() => logOut(), ms);
      setLogoutTimer(timer);
    },
    [logoutTimer, logOut]
  );

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        refreshToken,
        user,
        axiosInstance: axiosRef.current,
        login,
        logOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};

export default AuthContext;
