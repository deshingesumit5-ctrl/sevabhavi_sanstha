import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps all /admin/* routes (except /admin/login).
 * Unauthenticated visitors are redirected to /admin/login.
 */
const AdminGuard: React.FC = () => {
  const { isAdmin } = useAuth();
  return isAdmin ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default AdminGuard;
