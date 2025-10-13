import { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

// =====================
// ACTION TYPES
// =====================
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_TOKENS: 'SET_TOKENS',
  LOGOUT: 'LOGOUT',
};

// =====================
// INITIAL STATE
// =====================
const initialState = {
  loading: false,
  error: null,
  accessToken: sessionStorage.getItem('accessToken') || null,
  refreshToken: sessionStorage.getItem('refreshToken') || null,
};

// =====================
// REDUCER
// =====================
function authReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };
    case ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    case ACTIONS.SET_TOKENS:
      return {
        ...state,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
      };
    case ACTIONS.LOGOUT:
      return { ...initialState, accessToken: null, refreshToken: null };
    default:
      return state;
  }
}

// =====================
// CONTEXT
// =====================
const AuthContext = createContext(null);

// =====================
// PROVIDER
// =====================
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const axiosInstanceRef = useRef(null);
  const refreshTokenInProgressRef = useRef(false);
  const subscribersRef = useRef([]);
  const inactivityTimeoutRef = useRef(null);

  const BASE_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:1010/auth';

  // =====================
  // LOGOUT
  // =====================
  const logOut = useCallback(() => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    sessionStorage.clear();
    dispatch({ type: ACTIONS.LOGOUT });
  }, []);

  // =====================
  // INACTIVITY TIMEOUT
  // =====================
  const resetInactivityTimeout = useCallback((expirationRefreshTokenTime) => {
    if (!expirationRefreshTokenTime) return;

    // Parse ISO 8601 date string or timestamp
    let expirationTime;
    if (typeof expirationRefreshTokenTime === 'number') {
      expirationTime = expirationRefreshTokenTime;
    } else {
      expirationTime = new Date(expirationRefreshTokenTime).getTime();
    }

    const currentTime = Date.now();
    const inactivityTime = expirationTime - currentTime;

    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }

    if (inactivityTime > 0) {
      inactivityTimeoutRef.current = setTimeout(() => logOut(), inactivityTime);
    } else {
      logOut();
    }
  }, [logOut]);

  // =====================
  // REFRESH TOKEN HANDLER
  // =====================
  const handleRefreshToken = useCallback(async (originalRequest) => {
    const currentRefreshToken = sessionStorage.getItem('refreshToken');
    
    if (!currentRefreshToken) {
      logOut();
      return Promise.reject(new Error('No refresh token available'));
    }

    if (!refreshTokenInProgressRef.current) {
      refreshTokenInProgressRef.current = true;

      try {
        const response = await axios.post(
          `${BASE_URL}/refresh`,
          { refreshToken: currentRefreshToken }
        );

        const {
          accessToken,
          refreshToken,
          expirationAccessTokenTime,
          expirationRefreshTokenTime,
        } = response.data;

        // Update storage first
        sessionStorage.setItem('accessToken', accessToken);
        sessionStorage.setItem('refreshToken', refreshToken);
        sessionStorage.setItem('expirationAccessTokenTime', expirationAccessTokenTime);
        sessionStorage.setItem('expirationRefreshTokenTime', expirationRefreshTokenTime);

        // Then update state
        dispatch({
          type: ACTIONS.SET_TOKENS,
          payload: { accessToken, refreshToken },
        });

        resetInactivityTimeout(expirationRefreshTokenTime);
        refreshTokenInProgressRef.current = false;

        // Retry all queued requests
        subscribersRef.current.forEach((callback) => callback(accessToken));
        subscribersRef.current = [];

        // Retry original request
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return axiosInstanceRef.current(originalRequest);
      } catch (err) {
        refreshTokenInProgressRef.current = false;
        subscribersRef.current = [];
        logOut();
        return Promise.reject(err);
      }
    } else {
      // Queue request while refresh is in progress
      return new Promise((resolve, reject) => {
        subscribersRef.current.push((token) => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          resolve(axiosInstanceRef.current(originalRequest));
        });
      });
    }
  }, [BASE_URL, logOut, resetInactivityTimeout]);

  // =====================
  // Axios setup
  // =====================
  useEffect(() => {
    const instance = axios.create({
      baseURL: BASE_URL,
      timeout: 30000,
    });

    // Attach access token
    instance.interceptors.request.use(
      (config) => {
        const token = sessionStorage.getItem('accessToken');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Handle 403 and refresh token
    instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 403 && !originalRequest._retry) {
          originalRequest._retry = true;
          return handleRefreshToken(originalRequest);
        }
        return Promise.reject(error);
      }
    );

    axiosInstanceRef.current = instance;
  }, [BASE_URL, handleRefreshToken]);

  // =====================
  // LOGIN
  // =====================
  const login = useCallback(async (email, password) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      const res = await axios.post(`${BASE_URL}/login`, { email, password });

      const {
        accessToken,
        refreshToken,
        expirationAccessTokenTime,
        expirationRefreshTokenTime,
      } = res.data;

      // Update storage first
      sessionStorage.setItem('accessToken', accessToken);
      sessionStorage.setItem('refreshToken', refreshToken);
      sessionStorage.setItem('expirationAccessTokenTime', expirationAccessTokenTime);
      sessionStorage.setItem('expirationRefreshTokenTime', expirationRefreshTokenTime);

      // Then update state
      dispatch({
        type: ACTIONS.SET_TOKENS,
        payload: { accessToken, refreshToken },
      });

      resetInactivityTimeout(expirationRefreshTokenTime);

      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      dispatch({ type: ACTIONS.SET_ERROR, payload: msg });
      return { success: false, error: msg };
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  }, [BASE_URL, resetInactivityTimeout]);

  // =====================
  // User activity listeners
  // =====================
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    const handler = () => {
      const expirationRefreshTokenTime = sessionStorage.getItem('expirationRefreshTokenTime');
      if (expirationRefreshTokenTime) {
        resetInactivityTimeout(expirationRefreshTokenTime);
      }
    };

    events.forEach((event) => window.addEventListener(event, handler, { passive: true }));
    
    return () => {
      events.forEach((event) => window.removeEventListener(event, handler));
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, [resetInactivityTimeout]);

  const clearError = useCallback(() => dispatch({ type: ACTIONS.CLEAR_ERROR }), []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logOut,
        clearError,
        axiosInstance: axiosInstanceRef.current,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// =====================
// CUSTOM HOOK
// =====================
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
