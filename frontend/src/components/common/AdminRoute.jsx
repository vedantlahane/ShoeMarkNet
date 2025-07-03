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
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="flex justify-center items-center min-h-screen relative z-10">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12 text-center shadow-2xl">
            <div className="w-20 h-20 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-2xl font-bold text-white mb-2">
              <i className="fas fa-shield-alt mr-2 text-yellow-400"></i>
              Verifying Admin Access
            </h3>
            <p className="text-blue-100">
              <i className="fas fa-lock mr-2"></i>
              Checking your permissions...
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} state={{ from: location }} replace />;
  }
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 via-pink-600 to-rose-600 relative overflow-hidden">
        <div className="flex justify-center items-center min-h-screen relative z-10">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12 text-center shadow-2xl max-w-md">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-user-slash text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Access Denied</h3>
            <p className="text-red-100 mb-6">
              You don't have administrator privileges to access this area.
            </p>
            <button 
              onClick={() => window.history.back()}
              className="bg-white text-red-600 hover:bg-red-50 font-bold py-3 px-6 rounded-2xl transition-all duration-200"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return <Outlet />;
};

export default AdminRoute;
