import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';

// Redux actions
import { 
  refreshToken, 
  logout, 
  checkAdminPermissions,
  updateLastActivity 
} from '../../redux/slices/authSlice';

// Components
import LoadingSpinner from './LoadingSpinner';
import ErrorBoundary from './ErrorBoundary';
import AccessDeniedPage from '../pages/AccessDeniedPage';
import SecurityBadge from './SecurityBadge';

// Hooks
import useWebSocket from '../../hooks/useWebSocket';
import usePermissions from '../../hooks/usePermissions';
import useSecurityMonitor from '../../hooks/useSecurityMonitor';
import useSessionTimeout from '../../hooks/useSessionTimeout';

// Utils
import { trackEvent } from '../../utils/analytics';
import { validateAdminSession, checkSecurityClearance } from '../../utils/auth';

// Constants
const ADMIN_ROLES = ['admin', 'super_admin', 'system_admin'];
const REQUIRED_PERMISSIONS = ['admin.access', 'dashboard.admin'];
const SESSION_CHECK_INTERVAL = 60000; // 1 minute
const SECURITY_LEVEL = 'high';

const AdminRoute = ({ 
  requiredRole = 'admin',
  requiredPermissions = [],
  securityLevel = SECURITY_LEVEL,
  allowMaintenance = false,
  fallbackPath = '/access-denied'
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const { 
    user, 
    isAuthenticated, 
    loading, 
    sessionExpiry,
    lastAdminCheck,
    adminPermissions 
  } = useSelector((state) => state.auth);

  // Hooks
  const { hasPermission, hasRole, userRole } = usePermissions();
  const { isConnected, connectionQuality } = useWebSocket('/admin');
  const { securityScore, threats, isSecure } = useSecurityMonitor();
  const { timeUntilExpiry, isExpired } = useSessionTimeout(sessionExpiry);

  // Local state
  const [authState, setAuthState] = useState('checking');
  const [accessDeniedReason, setAccessDeniedReason] = useState('');
  const [securityWarnings, setSecurityWarnings] = useState([]);
  const [sessionValid, setSessionValid] = useState(true);
  const [adminVerified, setAdminVerified] = useState(false);
  const [lastSecurityCheck, setLastSecurityCheck] = useState(Date.now());

  // Enhanced admin role validation
  const isValidAdmin = useMemo(() => {
    if (!user || !isAuthenticated) return false;
    
    // Check if user has required admin role
    const hasAdminRole = ADMIN_ROLES.includes(user.role) || hasRole(requiredRole);
    
    // Check specific admin permissions
    const hasAdminPermissions = REQUIRED_PERMISSIONS.every(permission => 
      hasPermission(permission)
    );
    
    // Check additional required permissions
    const hasRequiredPermissions = requiredPermissions.length === 0 || 
      requiredPermissions.every(permission => hasPermission(permission));
    
    return hasAdminRole && hasAdminPermissions && hasRequiredPermissions;
  }, [user, isAuthenticated, hasRole, hasPermission, requiredRole, requiredPermissions]);

  // Enhanced security validation
  const securityValidation = useMemo(() => {
    if (!user) return { valid: false, reason: 'No user data' };
    
    // Check security clearance
    if (!checkSecurityClearance(user, securityLevel)) {
      return { 
        valid: false, 
        reason: `Requires ${securityLevel} security clearance` 
      };
    }
    
    // Check security score
    if (securityScore < 70) {
      return { 
        valid: false, 
        reason: `Security score too low: ${securityScore}/100` 
      };
    }
    
    // Check for active threats
    if (threats.length > 0) {
      return { 
        valid: false, 
        reason: `Active security threats detected: ${threats.length}` 
      };
    }
    
    // Check session validity
    if (!validateAdminSession(user, lastAdminCheck)) {
      return { 
        valid: false, 
        reason: 'Admin session expired or invalid' 
      };
    }
    
    return { valid: true, reason: null };
  }, [user, securityLevel, securityScore, threats, lastAdminCheck]);

  // Enhanced authentication check
  const performAdminCheck = useCallback(async () => {
    try {
      setAuthState('checking');
      
      // Basic authentication check
      if (!isAuthenticated) {
        setAuthState('unauthenticated');
        return;
      }
      
      // Session expiry check
      if (isExpired) {
        setAuthState('session_expired');
        return;
      }
      
      // Admin role validation
      if (!isValidAdmin) {
        setAccessDeniedReason('Administrator privileges required to access this area');
        setAuthState('access_denied');
        return;
      }
      
      // Security validation
      const securityCheck = securityValidation;
      if (!securityCheck.valid) {
        setAccessDeniedReason(securityCheck.reason);
        setAuthState('security_denied');
        return;
      }
      
      // Enhanced admin permission check
      const adminCheck = await dispatch(checkAdminPermissions()).unwrap();
      if (!adminCheck.valid) {
        setAccessDeniedReason('Admin permissions have been revoked');
        setAuthState('permissions_revoked');
        return;
      }
      
      setAdminVerified(true);
      setAuthState('authenticated');
      
      // Track successful admin access
      trackEvent('admin_route_accessed', {
        route: location.pathname,
        user_id: user._id,
        user_role: userRole,
        security_score: securityScore,
        session_time_left: timeUntilExpiry,
        connection_quality: connectionQuality
      });
      
    } catch (error) {
      console.error('Admin authentication check failed:', error);
      setAuthState('error');
      
      trackEvent('admin_auth_failed', {
        route: location.pathname,
        error: error.message,
        user_id: user?._id
      });
    }
  }, [
    isAuthenticated,
    isExpired,
    isValidAdmin,
    securityValidation,
    dispatch,
    location.pathname,
    user,
    userRole,
    securityScore,
    timeUntilExpiry,
    connectionQuality
  ]);

  // Periodic security monitoring
  const performSecurityCheck = useCallback(async () => {
    try {
      // Check for security threats
      if (threats.length > 0) {
        setSecurityWarnings(prev => [...prev, ...threats]);
        
        // If critical threats, force logout
        const criticalThreats = threats.filter(t => t.severity === 'critical');
        if (criticalThreats.length > 0) {
          toast.error('🚨 Critical security threat detected. Logging out for safety.');
          await dispatch(logout()).unwrap();
          return;
        }
      }
      
      // Update last security check
      setLastSecurityCheck(Date.now());
      
      // Update user activity
      dispatch(updateLastActivity());
      
    } catch (error) {
      console.error('Security check failed:', error);
    }
  }, [threats, dispatch]);

  // Enhanced session refresh
  const refreshAdminSession = useCallback(async () => {
    try {
      await dispatch(refreshToken()).unwrap();
      toast.success('🔄 Admin session refreshed');
      
      trackEvent('admin_session_refreshed', {
        user_id: user?._id,
        route: location.pathname
      });
      
    } catch (error) {
      toast.error('Failed to refresh admin session');
      setAuthState('session_expired');
    }
  }, [dispatch, user, location.pathname]);

  // Initialize admin authentication
  useEffect(() => {
    performAdminCheck();
    
    // Set up periodic checks
    const authCheckInterval = setInterval(performAdminCheck, SESSION_CHECK_INTERVAL);
    const securityCheckInterval = setInterval(performSecurityCheck, 30000);
    
    return () => {
      clearInterval(authCheckInterval);
      clearInterval(securityCheckInterval);
    };
  }, [performAdminCheck, performSecurityCheck]);

  // Handle route changes
  useEffect(() => {
    if (authState === 'authenticated') {
      trackEvent('admin_page_view', {
        page: location.pathname,
        user_id: user?._id,
        timestamp: new Date().toISOString()
      });
    }
  }, [location.pathname, authState, user]);

  // Enhanced loading state
  if (authState === 'checking' || loading) {
    return (
      <ErrorBoundary>
        <Helmet>
          <title>Verifying Admin Access - ShoeMarkNet</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
          
          {/* Enhanced Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
            
            {/* Floating Security Elements */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full animate-float"
                style={{
                  width: `${6 + Math.random() * 12}px`,
                  height: `${6 + Math.random() * 12}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  background: `hsl(${200 + Math.random() * 100}, 70%, 80%)`,
                  animationDelay: `${Math.random() * 6}s`,
                  animationDuration: `${4 + Math.random() * 4}s`
                }}
              />
            ))}
          </div>

          <div className="flex justify-center items-center min-h-screen relative z-10">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12 text-center shadow-2xl max-w-lg">
              
              {/* Enhanced Loading Animation */}
              <div className="relative mb-8">
                <LoadingSpinner size="large" color="white" />
                <div className="absolute inset-0 w-24 h-24 border-4 border-transparent border-b-yellow-300 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              </div>
              
              {/* Loading Content */}
              <div className="mb-8">
                <h3 className="text-3xl font-bold text-white mb-4">
                  <i className="fas fa-shield-alt mr-3 text-yellow-400 animate-pulse"></i>
                  Verifying Admin Access
                </h3>
                <p className="text-blue-100 text-lg mb-2">
                  <i className="fas fa-user-shield mr-2"></i>
                  Checking administrator privileges...
                </p>
                <p className="text-blue-200 text-sm">
                  <i className="fas fa-lock mr-2"></i>
                  Validating security clearance and permissions
                </p>
              </div>

              {/* Enhanced Security Indicators */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                {[
                  { icon: 'fa-user-shield', label: 'Admin Check', color: 'bg-blue-500' },
                  { icon: 'fa-key', label: 'Permissions', color: 'bg-purple-500' },
                  { icon: 'fa-shield-alt', label: 'Security', color: 'bg-green-500' },
                  { icon: 'fa-wifi', label: 'Connected', color: isConnected ? 'bg-green-500' : 'bg-red-500' }
                ].map((item, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4">
                    <div className={`w-10 h-10 ${item.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                      <i className={`fas ${item.icon} text-white text-sm`}></i>
                    </div>
                    <p className="text-xs text-blue-100 font-medium">{item.label}</p>
                  </div>
                ))}
              </div>

              {/* Enhanced Progress Indicators */}
              <div className="space-y-4">
                <div className="w-full bg-white/20 rounded-full h-3">
                  <div className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 h-3 rounded-full animate-loading-bar"></div>
                </div>
                
                <div className="flex justify-between items-center text-xs text-blue-200">
                  <span>
                    <i className="fas fa-shield-alt mr-1"></i>
                    Security Score: {securityScore}/100
                  </span>
                  <span>
                    <i className="fas fa-clock mr-1"></i>
                    Session: {Math.ceil(timeUntilExpiry / 60000)}m
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Custom Animations */}
          <style jsx>{`
            @keyframes float {
              0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
              25% { transform: translateY(-20px) rotate(3deg) scale(1.1); }
              50% { transform: translateY(-10px) rotate(-2deg) scale(0.95); }
              75% { transform: translateY(-15px) rotate(1deg) scale(1.05); }
            }
            
            @keyframes loading-bar {
              0% { transform: translateX(-100%); }
              50% { transform: translateX(0%); }
              100% { transform: translateX(100%); }
            }
            
            .animate-float {
              animation: float 8s ease-in-out infinite;
            }
            
            .animate-loading-bar {
              animation: loading-bar 2.5s ease-in-out infinite;
            }
          `}</style>
        </div>
      </ErrorBoundary>
    );
  }

  // Handle different authentication states
  if (authState === 'unauthenticated') {
    return (
      <Navigate 
        to={`/login?admin=true&redirect=${encodeURIComponent(location.pathname)}`} 
        state={{ from: location, requiresAdmin: true }} 
        replace 
      />
    );
  }

  if (authState === 'session_expired') {
    return (
      <Navigate 
        to={`/login?expired=true&admin=true&redirect=${encodeURIComponent(location.pathname)}`} 
        state={{ from: location, reason: 'session_expired', requiresAdmin: true }} 
        replace 
      />
    );
  }

  if (authState === 'access_denied' || authState === 'security_denied' || authState === 'permissions_revoked') {
    return (
      <ErrorBoundary>
        <Helmet>
          <title>Admin Access Denied - ShoeMarkNet</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        
        <div className="min-h-screen bg-gradient-to-br from-red-600 via-pink-600 to-rose-600 relative overflow-hidden flex items-center justify-center p-4">
          
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-300/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>
          
          <div className="relative z-10 max-w-2xl">
            <AccessDeniedPage
              title="Administrator Access Required"
              reason={accessDeniedReason}
              userRole={userRole}
              requiredRole={requiredRole}
              requiredPermissions={requiredPermissions}
              securityLevel={securityLevel}
              currentSecurityScore={securityScore}
              onGoBack={() => navigate(-1)}
              onGoHome={() => navigate('/')}
              onRequestAccess={() => navigate('/request-admin-access')}
              showRequestAccess={authState === 'access_denied'}
              showSecurityUpgrade={authState === 'security_denied'}
              showContactAdmin={authState === 'permissions_revoked'}
            />
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  if (authState === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 via-pink-600 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12 text-center shadow-2xl max-w-md">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <i className="fas fa-exclamation-triangle text-white text-2xl"></i>
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Admin Authentication Error</h3>
          <p className="text-red-100 mb-6">
            Unable to verify your admin privileges. Please try again or contact support.
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-white/20 backdrop-blur-lg border border-white/30 text-white font-bold py-3 px-6 rounded-2xl hover:bg-white/30 transition-all duration-200"
            >
              <i className="fas fa-redo mr-2"></i>
              Retry
            </button>
            <button
              onClick={() => navigate('/support')}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-200"
            >
              <i className="fas fa-headset mr-2"></i>
              Support
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Successful admin authentication - render protected admin content
  return (
    <ErrorBoundary>
      <Helmet>
        <title>Admin Panel - ShoeMarkNet</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Security Warnings */}
      {securityWarnings.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {securityWarnings.slice(0, 3).map((warning, index) => (
            <div
              key={index}
              className="bg-yellow-500/20 backdrop-blur-lg border border-yellow-300/50 text-yellow-800 dark:text-yellow-200 px-6 py-3 rounded-2xl shadow-lg animate-slide-in-right max-w-sm"
            >
              <div className="flex items-start">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <i className="fas fa-exclamation-triangle text-white text-sm"></i>
                </div>
                <div>
                  <p className="font-semibold text-sm">{warning.title}</p>
                  <p className="text-xs mt-1">{warning.description}</p>
                </div>
                <button
                  onClick={() => setSecurityWarnings(prev => prev.filter((_, i) => i !== index))}
                  className="ml-2 text-yellow-600 hover:text-yellow-800"
                >
                  <i className="fas fa-times text-xs"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admin Success Notification */}
      <div className="fixed top-4 right-4 z-40">
        <div className="bg-blue-500/20 backdrop-blur-lg border border-blue-300/50 text-blue-800 dark:text-blue-200 px-6 py-3 rounded-2xl shadow-lg animate-slide-in-right">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3">
              <i className="fas fa-shield-alt text-white text-sm"></i>
            </div>
            <div>
              <p className="font-semibold text-sm">Admin Access Granted</p>
              <p className="text-xs">Welcome, Administrator {user?.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Security Badge */}
      <SecurityBadge
        securityLevel={securityLevel}
        securityScore={securityScore}
        isConnected={isConnected}
        connectionQuality={connectionQuality}
        adminVerified={adminVerified}
        sessionTimeLeft={timeUntilExpiry}
        onRefreshSession={refreshAdminSession}
      />

      {/* Admin Status Indicator */}
      <div className="fixed bottom-4 left-4 z-40">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl px-4 py-2 shadow-lg">
          <div className="flex items-center space-x-3 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-900 dark:text-white font-medium">
                <i className="fas fa-user-shield mr-1 text-blue-500"></i>
                Admin Session Active
              </span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Score: {securityScore}/100
            </div>
          </div>
        </div>
      </div>

      {/* Main Admin Content */}
      <div className="relative">
        <Outlet />
      </div>

      {/* Enhanced Custom Styles */}
      <style jsx>{`
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.5s ease-out;
        }
      `}</style>
    </ErrorBoundary>
  );
};

export default AdminRoute;
