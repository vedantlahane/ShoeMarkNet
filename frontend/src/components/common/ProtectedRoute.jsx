// src/components/common/ProtectedRoute.jsx
import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = () => {
  const location = useLocation();
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [sessionCountdown, setSessionCountdown] = useState(null);
  
  // Session timeout warning (example: 5 minutes before expiry)
  useEffect(() => {
    if (isAuthenticated && user?.tokenExpiry) {
      const checkSession = () => {
        const now = new Date().getTime();
        const expiry = new Date(user.tokenExpiry).getTime();
        const timeLeft = expiry - now;
        
        // Show warning 5 minutes (300000ms) before expiry
        if (timeLeft <= 300000 && timeLeft > 0) {
          setShowSessionWarning(true);
          setSessionCountdown(Math.ceil(timeLeft / 1000 / 60)); // minutes
        } else {
          setShowSessionWarning(false);
          setSessionCountdown(null);
        }
      };

      const interval = setInterval(checkSession, 60000); // Check every minute
      checkSession(); // Initial check

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user?.tokenExpiry]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
          
          {/* Floating Particles */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 6}s`,
                animationDuration: `${4 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>

        <div className="flex justify-center items-center min-h-screen relative z-10">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12 text-center shadow-2xl max-w-md">
            
            {/* Enhanced Loading Animation */}
            <div className="relative mb-8">
              <div className="w-20 h-20 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-b-blue-300 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            
            {/* Loading Content */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-3">
                <i className="fas fa-shield-alt mr-2 text-yellow-400 animate-pulse"></i>
                Verifying Access
              </h3>
              <p className="text-blue-100 text-lg mb-4">
                <i className="fas fa-user-check mr-2"></i>
                Checking your authentication status...
              </p>
            </div>

            {/* Security Indicators */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <i className="fas fa-lock text-white text-sm"></i>
                </div>
                <p className="text-xs text-blue-100">Secure</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <i className="fas fa-key text-white text-sm"></i>
                </div>
                <p className="text-xs text-blue-100">Encrypted</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-3">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <i className="fas fa-user-shield text-white text-sm"></i>
                </div>
                <p className="text-xs text-blue-100">Protected</p>
              </div>
            </div>

            {/* Loading Progress Bar */}
            <div className="mt-6">
              <div className="w-full bg-white/20 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
              <p className="text-xs text-blue-200 mt-2">
                <i className="fas fa-clock mr-1"></i>
                This may take a few seconds...
              </p>
            </div>
          </div>
        </div>

        {/* Custom Styles */}
        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-10px) rotate(1deg); }
            66% { transform: translateY(-5px) rotate(-1deg); }
          }
          
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} state={{ from: location }} replace />;
  }

  return (
    <>
      {/* Session Warning Modal */}
      {showSessionWarning && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-fade-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <i className="fas fa-exclamation-triangle text-white text-2xl"></i>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Session Expiring Soon
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your session will expire in <span className="font-bold text-red-600">{sessionCountdown} minutes</span>. 
                Would you like to extend your session?
              </p>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    // Extend session logic would go here
                    setShowSessionWarning(false);
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-200"
                >
                  <i className="fas fa-clock mr-2"></i>
                  Extend Session
                </button>
                
                <button
                  onClick={() => {
                    // Logout logic would go here
                    setShowSessionWarning(false);
                  }}
                  className="flex-1 bg-white/10 backdrop-blur-lg border border-white/20 text-gray-900 dark:text-white font-bold py-3 px-6 rounded-2xl hover:bg-white/20 transition-all duration-200"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  Logout
                </button>
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                <i className="fas fa-info-circle mr-1"></i>
                For your security, sessions automatically expire after periods of inactivity
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success Access Notification */}
      <div className="fixed top-4 right-4 z-40">
        <div className="bg-green-500/20 backdrop-blur-lg border border-green-300/50 text-green-800 dark:text-green-200 px-6 py-3 rounded-2xl shadow-lg animate-slide-in-right">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
              <i className="fas fa-check text-white text-sm"></i>
            </div>
            <div>
              <p className="font-semibold text-sm">Access Granted</p>
              <p className="text-xs">Welcome back, {user?.name || 'User'}!</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Status Indicator */}
      <div className="fixed bottom-4 left-4 z-40">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl px-4 py-2 shadow-lg">
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-gray-900 dark:text-white font-medium">
              <i className="fas fa-shield-alt mr-1 text-blue-500"></i>
              Secure Session Active
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced Security Badge */}
      <div className="fixed top-4 left-4 z-40">
        <div className="bg-blue-500/20 backdrop-blur-lg border border-blue-300/50 rounded-2xl px-4 py-2 shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <i className="fas fa-lock text-white text-xs"></i>
            </div>
            <div className="text-xs text-blue-800 dark:text-blue-200">
              <p className="font-semibold">Protected Route</p>
              <p>SSL Encrypted</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative">
        <Outlet />
      </div>

      {/* Additional Custom Styles */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.5s ease-out;
        }
      `}</style>
    </>
  );
};

export default ProtectedRoute;
