// src/components/common/AdminRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminRoute = () => {
  const location = useLocation();
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} state={{ from: location }} replace />;
  }
  
  if (!isAdmin) {
    // If user is not an admin, redirect to home
    return <Navigate to="/" replace />;
  }
  
  return <Outlet />;
};

export default AdminRoute;
