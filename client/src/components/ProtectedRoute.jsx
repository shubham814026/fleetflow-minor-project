import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    if (location.pathname.startsWith('/driver')) {
      return <Navigate to="/driver/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles?.length && user?.role && !allowedRoles.includes(user.role)) {
    if (user.role === 'Driver') {
      return <Navigate to="/driver/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
