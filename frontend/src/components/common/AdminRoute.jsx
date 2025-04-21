// src/components/common/AdminRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loader from './Loader';

const AdminRoute = () => {
  const location = useLocation();
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';
  
  if (loading) {
    return <Loader />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} state={{ from: location }} replace />;
  }
  
  if (!isAdmin) {
    // If user is not an admin, redirect to home
    return <Navigate to="/" replace />;
  }
  
  // If user is authenticated and has admin role, render the child routes
  return <Outlet />;
};

export default AdminRoute;
