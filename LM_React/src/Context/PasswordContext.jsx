import { createContext, useReducer, useContext, useCallback } from 'react';
import axios from 'axios';

const ACTIONS = {
  REQUEST_START: 'REQUEST_START',
  REQUEST_SUCCESS: 'REQUEST_SUCCESS',
  REQUEST_ERROR: 'REQUEST_ERROR',
  RESET_STATE: 'RESET_STATE',
};

const initialState = {
  loading: false,
  error: null,
  success: null,
  data: null,
};

function passwordReducer(state, action) {
  switch (action.type) {
    case ACTIONS.REQUEST_START:
      return { ...state, loading: true, error: null, success: null };
    case ACTIONS.REQUEST_SUCCESS:
      return {
        ...state,
        loading: false,
        success: action.payload?.message || true,
        data: action.payload?.data || action.payload,
      };
    case ACTIONS.REQUEST_ERROR:
      return { ...state, loading: false, error: action.payload, success: null };
    case ACTIONS.RESET_STATE:
      return initialState;
    default:
      return state;
  }
}

const handleError = (error, defaultMsg = 'Something went wrong') => {
  if (error?.response) {
    return {
      message: error.response?.data?.message || defaultMsg,
      statusCode: error.response?.status,
      originalError: error,
    };
  }
  return { message: error?.message || defaultMsg, statusCode: null, originalError: error };
};

const PasswordContext = createContext(null);

export const PasswordProvider = ({ children }) => {
  const [state, dispatch] = useReducer(passwordReducer, initialState);

  // Create axios instance for public endpoints (no auth required)
  const publicAxios = axios.create({
    baseURL: import.meta.env.VITE_PASSWORD_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const apiCall = useCallback(
    async (method, url, data = {}, requiresAuth = false) => {
      dispatch({ type: ACTIONS.REQUEST_START });
      try {
        const config = {};

        // Only add authorization header if required
        if (requiresAuth) {
          const token = sessionStorage.getItem('accessToken');
          if (token) {
            config.headers = { Authorization: `Bearer ${token}` };
          }
        }

        const axiosInstance = requiresAuth ? publicAxios : publicAxios;
        const res = await axiosInstance[method](url, data, config);

        dispatch({ type: ACTIONS.REQUEST_SUCCESS, payload: res.data });
        return { success: true, data: res.data };
      } catch (err) {
        console.error(`Error in ${method.toUpperCase()} ${url}:`, err);
        const error = handleError(err);
        dispatch({ type: ACTIONS.REQUEST_ERROR, payload: error.message });
        return { success: false, error };
      }
    },
    []
  );

  const sendPasswordResetRequest = useCallback(
    (email) => apiCall('post', '/password-reset-request', { email }, false),
    [apiCall]
  );

  const resetPassword = useCallback(
    (token, newPassword) => apiCall('post', `/reset-password?token=${token}`, { newPassword }, false),
    [apiCall]
  );

  const changePassword = useCallback(
    (email, oldPassword, newPassword) =>
      apiCall('post', '/change-password', { email, oldPassword, newPassword }, true),
    [apiCall]
  );

  // ✅ No Authorization header for public endpoint
  const sendOTP = useCallback(
    (email) => apiCall('post', '/password-reset-otp-request', { email }, false),
    [apiCall]
  );

  const verifyOTP = useCallback(
    (email, otp) => apiCall('post', `/verify-otp?email=${email}&otp=${otp}`, {}, false),
    [apiCall]
  );

  const resendOTP = useCallback(
    (email) => apiCall('post', `/regenerate-otp?email=${email}`, {}, false),
    [apiCall]
  );

  const resetPasswordOtp = useCallback(
    (email, otp, newPassword) =>
      apiCall('post', `/reset-password-otp?email=${email}&otp=${otp}`, { newPassword }, false),
    [apiCall]
  );

  const resetState = useCallback(() => dispatch({ type: ACTIONS.RESET_STATE }), []);

  return (
    <PasswordContext.Provider
      value={{
        ...state,
        sendPasswordResetRequest,
        resetPassword,
        changePassword,
        sendOTP,
        verifyOTP,
        resendOTP,
        resetPasswordOtp,
        resetState,
      }}
    >
      {children}
    </PasswordContext.Provider>
  );
};

export const usePassword = () => {
  const context = useContext(PasswordContext);
  if (!context) throw new Error('usePassword must be used within PasswordProvider');
  return context;
};

export default PasswordContext;