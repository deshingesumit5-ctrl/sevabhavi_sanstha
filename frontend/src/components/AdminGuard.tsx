import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps all /admin/* routes.
 * Unauthenticated visitors are redirected to /login.
 */
const AdminGuard: React.FC = () => {
  const { isAdmin } = useAuth();
  return isAdmin ? <Outlet /> : <Navigate to="/login" replace />;
};

export default AdminGuard;
