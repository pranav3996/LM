import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

// =====================
// USER GUARD
// =====================
export const UserGuard = ({ children }) => {
  const { accessToken } = useAuth();
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// =====================
// ADMIN GUARD (Fixed - Uses user.role from context)
// =====================
export const AdminGuard = ({ children }) => {
  const { accessToken, user } = useAuth();

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  return children;
};