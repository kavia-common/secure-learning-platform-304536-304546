import React from 'react';
import { Navigate } from 'react-router-dom';

// PUBLIC_INTERFACE
/**
 * Protected route wrapper that requires authentication
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {object} props.user - Current user object
 * @param {boolean} props.requireAdmin - Whether route requires admin role
 */
const ProtectedRoute = ({ children, user, requireAdmin = false }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !user.roles?.includes('admin')) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
