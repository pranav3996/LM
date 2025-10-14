import { createContext, useReducer, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';

// =====================
// ACTION TYPES
// =====================
const ACTIONS = {
  REGISTER_REQUEST: 'REGISTER_REQUEST',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_ERROR: 'REGISTER_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// =====================
// INITIAL STATE
// =====================
const initialState = {
  loading: false,
  error: null,
  success: false,
};

// =====================
// REDUCER
// =====================
function registerReducer(state, action) {
  switch (action.type) {
    case ACTIONS.REGISTER_REQUEST:
      return { ...state, loading: true, error: null, success: false };
    case ACTIONS.REGISTER_SUCCESS:
      return { ...state, loading: false, error: null, success: true };
    case ACTIONS.REGISTER_ERROR:
      return { ...state, loading: false, error: action.payload, success: false };
    case ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
}

// =====================
// CONTEXT
// =====================
const UserRegisterContext = createContext(null);

// =====================
// PROVIDER
// =====================
export const UserRegisterProvider = ({ children }) => {
  const [state, dispatch] = useReducer(registerReducer, initialState);
  const { axiosInstance } = useAuth();

  // =====================
  // REGISTER USER
  // =====================
  const userRegister = useCallback(
    async (userData) => {
      dispatch({ type: ACTIONS.REGISTER_REQUEST });
      try {
        // Use the centralized axios instance with the correct path
        const response = await axiosInstance.post('/user/register', userData);
        dispatch({ type: ACTIONS.REGISTER_SUCCESS });
        return { success: true, data: response.data };
      } catch (error) {
        const message = error.response?.data?.message || error.message || 'Registration failed';
        dispatch({ type: ACTIONS.REGISTER_ERROR, payload: message });
        return { success: false, error: message };
      }
    },
    [axiosInstance]
  );

  const clearError = useCallback(() => dispatch({ type: ACTIONS.CLEAR_ERROR }), []);

  return (
    <UserRegisterContext.Provider value={{ ...state, userRegister, clearError }}>
      {children}
    </UserRegisterContext.Provider>
  );
};

// =====================
// CUSTOM HOOK
// =====================
export const useUserRegister = () => {
  const context = useContext(UserRegisterContext);
  if (!context) throw new Error('useUserRegister must be used within UserRegisterProvider');
  return context;
};

export default UserRegisterContext;
