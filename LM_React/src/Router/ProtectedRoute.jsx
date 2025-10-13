// ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';


// User Guard
export const UserGuard = ({ children }) => {
  const { accessToken } = useAuth();

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Admin Guard
export const AdminGuard = ({ children }) => {
  const { accessToken, axiosInstance } = useAuth();
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUserRole = async () => {
      if (!accessToken) {
        setLoading(false);
        return;
      }
      try {
        // Example API call to fetch current user role
        const res = await axiosInstance.get('/auth/me'); // assuming /me returns user info
        setIsAdmin(res.data.role === 'ADMIN');
      } catch (err) {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    fetchUserRole();
  }, [accessToken, axiosInstance]);

  if (loading) return <p>Loading...</p>;

  if (!accessToken || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
