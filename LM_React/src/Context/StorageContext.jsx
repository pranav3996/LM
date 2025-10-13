// StorageContext.jsx
import React, { createContext, useReducer, useContext, useCallback } from 'react';

// =====================
// ACTION TYPES
// =====================
const ACTIONS = {
  SET_ITEM: 'SET_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  CLEAR: 'CLEAR',
};

// =====================
// INITIAL STATE
// =====================
const initialState = { memoryStorage: {} };

// =====================
// REDUCER
// =====================
function storageReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_ITEM:
      return { 
        ...state, 
        memoryStorage: { ...state.memoryStorage, [action.key]: action.value } 
      };
    case ACTIONS.REMOVE_ITEM:
      const { [action.key]: _, ...rest } = state.memoryStorage;
      return { ...state, memoryStorage: rest };
    case ACTIONS.CLEAR:
      return { ...state, memoryStorage: {} };
    default:
      return state;
  }
}

// =====================
// CONTEXT
// =====================
const StorageContext = createContext(null);

// =====================
// PROVIDER
// =====================
export const StorageProvider = ({ children }) => {
  const [state, dispatch] = useReducer(storageReducer, initialState);

  // Detect if running in browser
  const isBrowser = useCallback(() => typeof window !== 'undefined' && !!window.sessionStorage, []);

  // =====================
  // STORAGE METHODS
  // =====================
  const getItem = useCallback((key) => {
    if (isBrowser()) {
      return sessionStorage.getItem(key);
    }
    return state.memoryStorage[key] ?? null;
  }, [state.memoryStorage, isBrowser]);

  const setItem = useCallback((key, value) => {
    if (isBrowser()) {
      sessionStorage.setItem(key, value);
    } else {
      dispatch({ type: ACTIONS.SET_ITEM, key, value });
    }
  }, [isBrowser]);

  const removeItem = useCallback((key) => {
    if (isBrowser()) {
      sessionStorage.removeItem(key);
    } else {
      dispatch({ type: ACTIONS.REMOVE_ITEM, key });
    }
  }, [isBrowser]);

  const clear = useCallback(() => {
    if (isBrowser()) {
      sessionStorage.clear();
    } else {
      dispatch({ type: ACTIONS.CLEAR });
    }
  }, [isBrowser]);

  return (
    <StorageContext.Provider value={{ getItem, setItem, removeItem, clear }}>
      {children}
    </StorageContext.Provider>
  );
};

// =====================
// CUSTOM HOOK
// =====================
export const useStorage = () => {
  const context = useContext(StorageContext);
  if (!context) throw new Error('useStorage must be used within StorageProvider');
  return context;
};

export default StorageContext;
