import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = () => {
  const location = useLocation();
  const { isAuthenticated, isLoading, isInitialized } = useSelector((state) => state.auth);

  // Show loading while checking authentication
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" message="Verifying access..." />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Render protected content
  return <Outlet />;
};

export default ProtectedRoute;
