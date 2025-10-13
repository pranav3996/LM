// AdminContext.jsx
import { createContext, useReducer, useContext, useCallback } from 'react';
import { useAuthInterceptor } from '../Interceptor/AuthInterceptorContext';

// =====================
// CONFIG
// =====================
const BASE_URL = import.meta.env.VITE_ADMIN_URL || 'http://localhost:1010/admin';
const REQUEST_TIMEOUT = 30000;

// =====================
// ACTION TYPES
// =====================
const ACTIONS = {
  FETCH_USERS_REQUEST: 'FETCH_USERS_REQUEST',
  FETCH_USERS_SUCCESS: 'FETCH_USERS_SUCCESS',
  FETCH_USERS_ERROR: 'FETCH_USERS_ERROR',

  FETCH_USER_REQUEST: 'FETCH_USER_REQUEST',
  FETCH_USER_SUCCESS: 'FETCH_USER_SUCCESS',
  FETCH_USER_ERROR: 'FETCH_USER_ERROR',

  UPDATE_USER_REQUEST: 'UPDATE_USER_REQUEST',
  UPDATE_USER_SUCCESS: 'UPDATE_USER_SUCCESS',
  UPDATE_USER_ERROR: 'UPDATE_USER_ERROR',

  DELETE_USER_REQUEST: 'DELETE_USER_REQUEST',
  DELETE_USER_SUCCESS: 'DELETE_USER_SUCCESS',
  DELETE_USER_ERROR: 'DELETE_USER_ERROR',

  REGISTER_REQUEST: 'REGISTER_REQUEST',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_ERROR: 'REGISTER_ERROR',

  UPLOAD_START: 'UPLOAD_START',
  UPLOAD_PROGRESS: 'UPLOAD_PROGRESS',
  UPLOAD_SUCCESS: 'UPLOAD_SUCCESS',
  UPLOAD_ERROR: 'UPLOAD_ERROR',
  RESET_UPLOAD: 'RESET_UPLOAD',

  CLEAR_ERROR: 'CLEAR_ERROR',
  RESET_STATE: 'RESET_STATE',
};

// =====================
// INITIAL STATE
// =====================
const initialState = {
  users: [],
  currentUser: null,
  loading: false,
  registering: false,
  updating: false,
  deleting: false,
  error: null,
  upload: {
    status: 'idle',
    progress: 0,
    message: null,
    errorCode: null,
    data: null,
  },
};

// =====================
// REDUCER
// =====================
function adminReducer(state, action) {
  switch (action.type) {
    case ACTIONS.FETCH_USERS_REQUEST:
    case ACTIONS.FETCH_USER_REQUEST:
    case ACTIONS.UPDATE_USER_REQUEST:
    case ACTIONS.DELETE_USER_REQUEST:
      return { ...state, loading: true, error: null };

    case ACTIONS.FETCH_USERS_SUCCESS:
      return { ...state, users: action.payload, loading: false };
    case ACTIONS.FETCH_USER_SUCCESS:
    case ACTIONS.UPDATE_USER_SUCCESS:
      return { ...state, currentUser: action.payload, loading: false };
    case ACTIONS.DELETE_USER_SUCCESS:
      return {
        ...state,
        users: state.users.filter((u) => u.id !== action.payload),
        loading: false,
      };

    case ACTIONS.FETCH_USERS_ERROR:
    case ACTIONS.FETCH_USER_ERROR:
    case ACTIONS.UPDATE_USER_ERROR:
    case ACTIONS.DELETE_USER_ERROR:
      return { ...state, loading: false, error: action.payload };

    case ACTIONS.REGISTER_REQUEST:
      return { ...state, registering: true, error: null };
    case ACTIONS.REGISTER_SUCCESS:
      return { ...state, registering: false };
    case ACTIONS.REGISTER_ERROR:
      return { ...state, registering: false, error: action.payload };

    case ACTIONS.UPLOAD_START:
      return {
        ...state,
        upload: { status: 'progress', progress: 0, message: null, errorCode: null, data: null },
      };
    case ACTIONS.UPLOAD_PROGRESS:
      return { ...state, upload: { ...state.upload, progress: action.payload } };
    case ACTIONS.UPLOAD_SUCCESS:
      return {
        ...state,
        upload: {
          status: 'success',
          progress: 100,
          message: action.payload.message,
          data: action.payload.data,
        },
      };
    case ACTIONS.UPLOAD_ERROR:
      return {
        ...state,
        upload: {
          status: 'error',
          progress: 0,
          message: action.payload.message,
          errorCode: action.payload.errorCode,
        },
      };
    case ACTIONS.RESET_UPLOAD:
      return { ...state, upload: initialState.upload };

    case ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    case ACTIONS.RESET_STATE:
      return initialState;

    default:
      return state;
  }
}

// =====================
// ERROR HANDLER
// =====================
const handleError = (error, defaultMsg = 'Something went wrong') => {
  if (error?.response) {
    return {
      message: error.response?.data?.message || error.message || defaultMsg,
      statusCode: error.response?.status,
      code: error.code,
    };
  }
  return { message: defaultMsg, statusCode: null };
};

// =====================
// CONTEXT
// =====================
const AdminContext = createContext(null);

// =====================
// PROVIDER
// =====================
export const AdminProvider = ({ children }) => {
  const [state, dispatch] = useReducer(adminReducer, initialState);
  const { axiosInstance } = useAuthInterceptor(); // Use centralized Axios with interceptors

  // =====================
  // API METHODS
  // =====================
  const adminRegister = useCallback(
    async (userData) => {
      dispatch({ type: ACTIONS.REGISTER_REQUEST });
      try {
        await axiosInstance.post('/register', userData);
        dispatch({ type: ACTIONS.REGISTER_SUCCESS });
        return { success: true };
      } catch (error) {
        const err = handleError(error, 'Registration failed');
        dispatch({ type: ACTIONS.REGISTER_ERROR, payload: err.message });
        return { success: false, error: err };
      }
    },
    [axiosInstance]
  );

  const getAllUsers = useCallback(async () => {
    dispatch({ type: ACTIONS.FETCH_USERS_REQUEST });
    try {
      const res = await axiosInstance.get('/get-all-users');
      dispatch({ type: ACTIONS.FETCH_USERS_SUCCESS, payload: res.data });
      return { success: true, data: res.data };
    } catch (error) {
      const err = handleError(error, 'Failed to fetch users');
      dispatch({ type: ACTIONS.FETCH_USERS_ERROR, payload: err.message });
      return { success: false, error: err };
    }
  }, [axiosInstance]);

  const getUserById = useCallback(
    async (id) => {
      dispatch({ type: ACTIONS.FETCH_USER_REQUEST });
      try {
        const res = await axiosInstance.get(`/get-users/${id}`);
        dispatch({ type: ACTIONS.FETCH_USER_SUCCESS, payload: res.data });
        return { success: true, data: res.data };
      } catch (error) {
        const err = handleError(error, 'Failed to fetch user');
        dispatch({ type: ACTIONS.FETCH_USER_ERROR, payload: err.message });
        return { success: false, error: err };
      }
    },
    [axiosInstance]
  );

  const updateUser = useCallback(
    async (id, data) => {
      dispatch({ type: ACTIONS.UPDATE_USER_REQUEST });
      try {
        const res = await axiosInstance.put(`/update/${id}`, data);
        dispatch({ type: ACTIONS.UPDATE_USER_SUCCESS, payload: res.data });
        return { success: true, data: res.data };
      } catch (error) {
        const err = handleError(error, 'Failed to update user');
        dispatch({ type: ACTIONS.UPDATE_USER_ERROR, payload: err.message });
        return { success: false, error: err };
      }
    },
    [axiosInstance]
  );

  const deleteUser = useCallback(
    async (id) => {
      dispatch({ type: ACTIONS.DELETE_USER_REQUEST });
      try {
        await axiosInstance.delete(`/delete/${id}`);
        dispatch({ type: ACTIONS.DELETE_USER_SUCCESS, payload: id });
        return { success: true };
      } catch (error) {
        const err = handleError(error, 'Failed to delete user');
        dispatch({ type: ACTIONS.DELETE_USER_ERROR, payload: err.message });
        return { success: false, error: err };
      }
    },
    [axiosInstance]
  );

  const uploadFile = useCallback(
    async (file) => {
      dispatch({ type: ACTIONS.UPLOAD_START });
      const formData = new FormData();
      formData.append('file', file, file.name);

      try {
        const res = await axiosInstance.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => {
            if (e.total) {
              const progress = Math.round((e.loaded / e.total) * 100);
              dispatch({ type: ACTIONS.UPLOAD_PROGRESS, payload: progress });
            }
          },
        });

        dispatch({
          type: ACTIONS.UPLOAD_SUCCESS,
          payload: { message: res.data.message || 'Upload successful', data: res.data },
        });

        return { success: true, data: res.data };
      } catch (error) {
        const err = handleError(error, 'Upload failed');
        dispatch({
          type: ACTIONS.UPLOAD_ERROR,
          payload: { message: err.message, errorCode: err.statusCode },
        });
        return { success: false, error: err };
      }
    },
    [axiosInstance]
  );

  const clearError = useCallback(() => dispatch({ type: ACTIONS.CLEAR_ERROR }), []);
  const resetUpload = useCallback(() => dispatch({ type: ACTIONS.RESET_UPLOAD }), []);
  const resetState = useCallback(() => dispatch({ type: ACTIONS.RESET_STATE }), []);

  // =====================
  // PROVIDER VALUE
  // =====================
  return (
    <AdminContext.Provider
      value={{
        ...state,
        adminRegister,
        getAllUsers,
        getUserById,
        updateUser,
        deleteUser,
        uploadFile,
        clearError,
        resetUpload,
        resetState,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

// =====================
// CUSTOM HOOK
// =====================
export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within AdminProvider');
  return context;
};

export default AdminContext;
