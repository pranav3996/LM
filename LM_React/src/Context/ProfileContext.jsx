import React, { createContext, useReducer, useContext, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';

// =====================
// ENVIRONMENT VARIABLES
// =====================
const PROFILE_URL =
  import.meta.env.VITE_PROFILE_URL || 'http://localhost:1010/adminuser/get-profile';
const REQUEST_TIMEOUT = 30000;

// =====================
// ACTION TYPES
// =====================
const ACTIONS = {
  FETCH_PROFILE_REQUEST: 'FETCH_PROFILE_REQUEST',
  FETCH_PROFILE_SUCCESS: 'FETCH_PROFILE_SUCCESS',
  FETCH_PROFILE_ERROR: 'FETCH_PROFILE_ERROR',
  CLEAR_PROFILE: 'CLEAR_PROFILE',
};

// =====================
// INITIAL STATE
// =====================
const initialState = {
  profile: null,
  loading: false,
  error: null,
};

// =====================
// REDUCER
// =====================
function profileReducer(state, action) {
  switch (action.type) {
    case ACTIONS.FETCH_PROFILE_REQUEST:
      return { ...state, loading: true, error: null };
    case ACTIONS.FETCH_PROFILE_SUCCESS:
      return { ...state, loading: false, profile: action.payload, error: null };
    case ACTIONS.FETCH_PROFILE_ERROR:
      return { ...state, loading: false, error: action.payload };
    case ACTIONS.CLEAR_PROFILE:
      return initialState;
    default:
      return state;
  }
}

// =====================
// ERROR HANDLER
// =====================
const handleError = (error, defaultMsg = 'Failed to fetch profile') => {
  if (error?.response) {
    return {
      message: error.response?.data?.message || defaultMsg,
      statusCode: error.response?.status,
      code: error.code,
      error,
    };
  }
  return { message: error?.message || defaultMsg, error };
};

// =====================
// CONTEXT
// =====================
const ProfileContext = createContext(null);

// =====================
// PROVIDER
// =====================
export const ProfileProvider = ({ children }) => {
  const [state, dispatch] = useReducer(profileReducer, initialState);
  const { axiosInstance, accessToken } = useAuth(); // Use from AuthContext

  // =====================
  // FETCH PROFILE
  // =====================
  const fetchProfile = useCallback(async () => {
    if (!accessToken) return { success: false, error: 'No access token' };
    dispatch({ type: ACTIONS.FETCH_PROFILE_REQUEST });
    console.log('Token in header:', axiosInstance.defaults.headers.common['Authorization']);

    try {
      // const response = await axiosInstance.get(PROFILE_URL, { timeout: REQUEST_TIMEOUT });
      const response = await axiosInstance.get(PROFILE_URL, {
        timeout: REQUEST_TIMEOUT,
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      dispatch({ type: ACTIONS.FETCH_PROFILE_SUCCESS, payload: response.data });
      return { success: true, data: response.data };
    } catch (error) {
      const err = handleError(error);
      dispatch({ type: ACTIONS.FETCH_PROFILE_ERROR, payload: err });
      return { success: false, error: err };
    }
  }, [axiosInstance, accessToken]);

  const clearProfile = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_PROFILE });
  }, []);

  // =====================
  // AUTO-FETCH ON LOGIN
  // =====================
  useEffect(() => {
    if (accessToken) {
      fetchProfile();
    } else {
      clearProfile();
    }
  }, [accessToken]); // ✅ only depends on token


  return (
    <ProfileContext.Provider value={{ ...state, fetchProfile, clearProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

// =====================
// CUSTOM HOOK
// =====================
export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within a ProfileProvider');
  return context;
};

export default ProfileContext;
