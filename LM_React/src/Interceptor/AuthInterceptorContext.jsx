import { createContext, useContext, useReducer, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';

// =====================
// ACTION TYPES
// =====================
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_ACCESS_TOKEN: 'SET_ACCESS_TOKEN',
  LOGOUT: 'LOGOUT',
};

// =====================
// INITIAL STATE
// =====================
const initialState = {
  loading: false,
  error: null,
  accessToken: sessionStorage.getItem('accessToken') || null,
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
    case ACTIONS.SET_ACCESS_TOKEN:
      return { ...state, accessToken: action.payload };
    case ACTIONS.LOGOUT:
      return { ...initialState, accessToken: null };
    default:
      return state;
  }
}

// =====================
// CONTEXT
// =====================
const AuthInterceptorContext = createContext(null);

// =====================
// PROVIDER
// =====================
export const AuthInterceptorProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const axiosInstanceRef = useRef(null);
  const refreshTokenInProgressRef = useRef(false);
  const subscribersRef = useRef([]);

  // Initialize axios instance
  useEffect(() => {
    const instance = axios.create({
      baseURL: import.meta.env.VITE_BASE_URL || 'http://localhost:1010',
      timeout: 30000,
    });

    // Request interceptor to add token
    instance.interceptors.request.use(
      (config) => {
        if (state.accessToken) {
          config.headers['Authorization'] = `Bearer ${state.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle 403 and refresh token
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
  }, [state.accessToken]);

  // =====================
  // REFRESH TOKEN HANDLER
  // =====================
  const handleRefreshToken = useCallback(async (originalRequest) => {
    if (!refreshTokenInProgressRef.current) {
      refreshTokenInProgressRef.current = true;
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_AUTH_URL || 'http://localhost:1010/auth'}/refresh-token`,
          {}
        );

        const newToken = response.data.accessToken;
        sessionStorage.setItem('accessToken', newToken);
        dispatch({ type: ACTIONS.SET_ACCESS_TOKEN, payload: newToken });

        refreshTokenInProgressRef.current = false;
        // Retry all subscribers
        subscribersRef.current.forEach((callback) => callback(newToken));
        subscribersRef.current = [];

        // Retry the original request
        return axiosInstanceRef.current(originalRequest);
      } catch (err) {
        refreshTokenInProgressRef.current = false;
        subscribersRef.current = [];
        dispatch({ type: ACTIONS.LOGOUT });
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
  }, []);

  const logOut = useCallback(() => {
    sessionStorage.removeItem('accessToken');
    dispatch({ type: ACTIONS.LOGOUT });
  }, []);

  const clearError = useCallback(() => dispatch({ type: ACTIONS.CLEAR_ERROR }), []);

  return (
    <AuthInterceptorContext.Provider
      value={{
        ...state,
        axiosInstance: axiosInstanceRef.current,
        logOut,
        clearError,
      }}
    >
      {children}
    </AuthInterceptorContext.Provider>
  );
};

// =====================
// CUSTOM HOOK
// =====================
export const useAuthInterceptor = () => {
  const context = useContext(AuthInterceptorContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthInterceptorContext;
