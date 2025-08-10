import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';

// Redux actions
import { 
  refreshToken, 
  logout, 
  updateLastActivity,
  checkSessionValidity
} from '../../redux/slices/authSlice';

// Components
import LoadingSpinner from './LoadingSpinner';
import ErrorBoundary from './ErrorBoundary';
import SessionWarningModal from './SessionWarningModal';
import SecurityIndicators from './SecurityIndicators';
import AccessDeniedPage from '../pages/AccessDeniedPage';

// Hooks
import useWebSocket from '../../hooks/useWebSocket';
import useLocalStorage from '../../hooks/useLocalStorage';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';
import usePermissions from '../../hooks/usePermissions';
import useSessionTimeout from '../../hooks/useSessionTimeout';
import useSecurityMonitor from '../../hooks/useSecurityMonitor';

// Utils
import { trackEvent } from '../../utils/analytics';
import { encryptSessionData, decryptSessionData } from '../../utils/encryption';
import { validatePermissions, checkRoleAccess } from '../../utils/auth';

// Constants
const SESSION_WARNING_TIME = 5 * 60 * 1000; // 5 minutes
const SESSION_CHECK_INTERVAL = 60 * 1000; // 1 minute
const ACTIVITY_TRACKING_INTERVAL = 30 * 1000; // 30 seconds
const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

const ROUTE_PERMISSIONS = {
  '/admin': ['admin'],
  '/admin/*': ['admin'],
  '/orders': ['user', 'admin'],
  '/profile': ['user', 'admin'],
  '/dashboard': ['user', 'admin'],
  '/moderator': ['moderator', 'admin'],
  '/editor': ['editor', 'admin']
};

const SECURITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

const ProtectedRoute = ({ 
  requiredRoles = [], 
  requiredPermissions = [], 
  securityLevel = SECURITY_LEVELS.MEDIUM,
  fallbackPath = '/login',
  allowGuests = false,
  maintenanceMode = false
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const { 
    isAuthenticated, 
    loading, 
    user, 
    sessionExpiry,
    lastActivity,
    failedAttempts,
    isLocked 
  } = useSelector((state) => state.auth);

  // Hooks
  const { hasPermission, hasRole, userRole } = usePermissions();
  const { isConnected, connectionQuality } = useWebSocket('/auth');
  const { 
    timeUntilExpiry, 
    showWarning, 
    extendSession, 
    isExpired 
  } = useSessionTimeout(sessionExpiry, SESSION_WARNING_TIME);
  const { 
    securityScore, 
    threats, 
    recommendations 
  } = useSecurityMonitor();

  // Local state
  const [authState, setAuthState] = useState('checking');
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [sessionCountdown, setSessionCountdown] = useState(null);
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const [accessDeniedReason, setAccessDeniedReason] = useState('');
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [lastActivityTime, setLastActivityTime] = useLocalStorage('lastActivity', Date.now());
  const [deviceFingerprint, setDeviceFingerprint] = useState(null);
  const [suspiciousActivity, setSuspiciousActivity] = useState(false);
  const [authAttempts, setAuthAttempts] = useState(0);
  const [lockoutEndTime, setLockoutEndTime] = useLocalStorage('lockoutEndTime', null);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  // Refs
  const activityTimerRef = useRef(null);
  const sessionCheckTimerRef = useRef(null);
  const securityMonitorRef = useRef(null);
  const heartbeatRef = useRef(null);

  // Keyboard shortcuts for security actions
  useKeyboardShortcuts({
    'ctrl+shift+l': handleQuickLogout,
    'ctrl+shift+r': handleRefreshSession,
    'ctrl+shift+s': handleSecurityPanel,
    'escape': () => {
      setShowSessionWarning(false);
      setShowAccessDenied(false);
    }
  });

  // Enhanced authentication check
  const checkAuthentication = useCallback(async () => {
    try {
      setAuthState('checking');

      // Check if user is locked out
      if (lockoutEndTime && Date.now() < lockoutEndTime) {
        setAuthState('locked');
        return;
      }

      // Check if maintenance mode is active
      if (maintenanceMode && userRole !== 'admin') {
        setAuthState('maintenance');
        return;
      }

      // Basic authentication check
      if (!isAuthenticated && !allowGuests) {
        setAuthState('unauthenticated');
        return;
      }

      // Role-based access control
      if (requiredRoles.length > 0 && !requiredRoles.some(role => hasRole(role))) {
        setAccessDeniedReason(`This page requires one of the following roles: ${requiredRoles.join(', ')}`);
        setShowAccessDenied(true);
        setAuthState('access_denied');
        return;
      }

      // Permission-based access control
      if (requiredPermissions.length > 0 && !requiredPermissions.some(permission => hasPermission(permission))) {
        setAccessDeniedReason(`You don't have the required permissions to access this page.`);
        setShowAccessDenied(true);
        setAuthState('access_denied');
        return;
      }

      // Route-specific permission check
      const routePermissions = getRoutePermissions(location.pathname);
      if (routePermissions && !routePermissions.some(role => hasRole(role))) {
        setAccessDeniedReason(`Access to this section is restricted.`);
        setShowAccessDenied(true);
        setAuthState('access_denied');
        return;
      }

      // Security level validation
      if (!validateSecurityLevel(securityLevel, user)) {
        setAccessDeniedReason(`This page requires ${securityLevel} security clearance.`);
        setShowAccessDenied(true);
        setAuthState('access_denied');
        return;
      }

      // Session validity check
      const sessionValid = await dispatch(checkSessionValidity()).unwrap();
      if (!sessionValid) {
        setAuthState('session_expired');
        return;
      }

      // Success
      setAuthState('authenticated');
      
      trackEvent('protected_route_accessed', {
        route: location.pathname,
        user_id: user?._id,
        user_role: userRole,
        security_level: securityLevel,
        security_score: securityScore,
        connection_quality: connectionQuality
      });

    } catch (error) {
      console.error('Authentication check failed:', error);
      setAuthState('error');
      
      trackEvent('auth_check_failed', {
        route: location.pathname,
        error: error.message,
        user_id: user?._id
      });
    }
  }, [
    isAuthenticated, 
    allowGuests, 
    requiredRoles, 
    requiredPermissions, 
    securityLevel,
    hasRole, 
    hasPermission, 
    userRole,
    location.pathname,
    user,
    securityScore,
    connectionQuality,
    lockoutEndTime,
    maintenanceMode,
    dispatch
  ]);

  // Enhanced session management
  const handleSessionWarning = useCallback(() => {
    if (timeUntilExpiry <= SESSION_WARNING_TIME && timeUntilExpiry > 0) {
      setShowSessionWarning(true);
      setSessionCountdown(Math.ceil(timeUntilExpiry / 60000)); // minutes
      
      // Play notification sound if available
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Session Expiring Soon', {
          body: `Your session will expire in ${Math.ceil(timeUntilExpiry / 60000)} minutes`,
          icon: '/icons/warning.png',
          badge: '/icons/badge.png'
        });
      }
      
      trackEvent('session_warning_shown', {
        time_until_expiry: timeUntilExpiry,
        user_id: user?._id
      });
    } else {
      setShowSessionWarning(false);
      setSessionCountdown(null);
    }
  }, [timeUntilExpiry, user]);

  // Enhanced session extension
  const handleExtendSession = useCallback(async () => {
    try {
      await dispatch(refreshToken()).unwrap();
      await extendSession();
      setShowSessionWarning(false);
      
      toast.success('✅ Session extended successfully!');
      
      trackEvent('session_extended', {
        user_id: user?._id,
        extension_method: 'manual'
      });
      
    } catch (error) {
      toast.error('Failed to extend session. Please login again.');
      handleLogout();
    }
  }, [dispatch, extendSession, user]);

  // Enhanced logout handler
  const handleLogout = useCallback(async (reason = 'manual') => {
    try {
      await dispatch(logout()).unwrap();
      
      // Clear sensitive data
      localStorage.removeItem('sessionData');
      sessionStorage.clear();
      
      trackEvent('user_logged_out', {
        user_id: user?._id,
        reason,
        route: location.pathname
      });
      
      toast.info('👋 You have been logged out');
      
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [dispatch, user, location.pathname]);

  const handleQuickLogout = useCallback(() => {
    if (window.confirm('Are you sure you want to logout?')) {
      handleLogout('keyboard_shortcut');
    }
  }, [handleLogout]);

  const handleRefreshSession = useCallback(async () => {
    try {
      await dispatch(refreshToken()).unwrap();
      toast.success('🔄 Session refreshed');
    } catch (error) {
      toast.error('Failed to refresh session');
    }
  }, [dispatch]);

  const handleSecurityPanel = useCallback(() => {
    // Open security settings or panel
    navigate('/security-settings');
  }, [navigate]);

  // Device fingerprinting and security monitoring
  const initializeSecurityMonitoring = useCallback(async () => {
    try {
      // Generate device fingerprint
      const fingerprint = await generateDeviceFingerprint();
      setDeviceFingerprint(fingerprint);
      
      // Check for suspicious patterns
      const suspicious = await detectSuspiciousActivity();
      setSuspiciousActivity(suspicious);
      
      // Initialize security monitoring
      securityMonitorRef.current = setInterval(() => {
        monitorSecurityMetrics();
      }, 30000);
      
    } catch (error) {
      console.error('Security monitoring initialization failed:', error);
    }
  }, []);

  // Utility functions
  const getRoutePermissions = useCallback((path) => {
    for (const [routePattern, permissions] of Object.entries(ROUTE_PERMISSIONS)) {
      if (routePattern.endsWith('*')) {
        const baseRoute = routePattern.slice(0, -1);
        if (path.startsWith(baseRoute)) {
          return permissions;
        }
      } else if (path === routePattern) {
        return permissions;
      }
    }
    return null;
  }, []);

  const validateSecurityLevel = useCallback((level, userData) => {
    if (!userData) return false;
    
    switch (level) {
      case SECURITY_LEVELS.CRITICAL:
        return userData.securityClearance === 'critical' && userData.twoFactorEnabled;
      case SECURITY_LEVELS.HIGH:
        return userData.securityClearance === 'high' || userData.securityClearance === 'critical';
      case SECURITY_LEVELS.MEDIUM:
        return userData.isVerified && userData.securityClearance !== 'low';
      case SECURITY_LEVELS.LOW:
        return true;
      default:
        return false;
    }
  }, []);

  const generateDeviceFingerprint = useCallback(async () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
    
    return {
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      userAgent: navigator.userAgent.slice(0, 100),
      canvas: canvas.toDataURL().slice(0, 100),
      timestamp: Date.now()
    };
  }, []);

  const detectSuspiciousActivity = useCallback(async () => {
    // Implement suspicious activity detection logic
    const indicators = [
      failedAttempts > 2,
      authAttempts > 5,
      // Add more indicators as needed
    ];
    
    return indicators.some(indicator => indicator);
  }, [failedAttempts, authAttempts]);

  const monitorSecurityMetrics = useCallback(() => {
    // Update last activity
    dispatch(updateLastActivity());
    setLastActivityTime(Date.now());
    
    // Check for security threats
    if (threats.length > 0) {
      setSecurityAlerts(prev => [...prev, ...threats]);
    }
  }, [dispatch, threats, setLastActivityTime]);

  // Initialize component
  useEffect(() => {
    checkAuthentication();
    initializeSecurityMonitoring();
    
    // Set up activity tracking
    activityTimerRef.current = setInterval(() => {
      dispatch(updateLastActivity());
    }, ACTIVITY_TRACKING_INTERVAL);
    
    // Set up session checking
    sessionCheckTimerRef.current = setInterval(checkAuthentication, SESSION_CHECK_INTERVAL);
    
    // Set up heartbeat for connected sessions
    if (isConnected) {
      heartbeatRef.current = setInterval(() => {
        // Send heartbeat to server
      }, 30000);
    }
    
    return () => {
      if (activityTimerRef.current) clearInterval(activityTimerRef.current);
      if (sessionCheckTimerRef.current) clearInterval(sessionCheckTimerRef.current);
      if (securityMonitorRef.current) clearInterval(securityMonitorRef.current);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [checkAuthentication, initializeSecurityMonitoring, dispatch, isConnected]);

  // Handle session warnings
  useEffect(() => {
    handleSessionWarning();
  }, [handleSessionWarning]);

  // Handle session expiry
  useEffect(() => {
    if (isExpired) {
      handleLogout('session_expired');
    }
  }, [isExpired, handleLogout]);

  // Enhanced loading state
  if (authState === 'checking' || loading) {
    return (
      <ErrorBoundary>
        <Helmet>
          <title>Verifying Access - ShoeMarkNet</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
          
          {/* Enhanced Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
            
            {/* Enhanced Floating Particles */}
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full animate-float"
                style={{
                  width: `${4 + Math.random() * 8}px`,
                  height: `${4 + Math.random() * 8}px`,
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
                <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-b-blue-300 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              </div>
              
              {/* Loading Content */}
              <div className="mb-8">
                <h3 className="text-3xl font-bold text-white mb-4">
                  <i className="fas fa-shield-alt mr-3 text-yellow-400 animate-pulse"></i>
                  Verifying Access
                </h3>
                <p className="text-blue-100 text-lg mb-2">
                  <i className="fas fa-user-check mr-2"></i>
                  Authenticating your credentials...
                </p>
                <p className="text-blue-200 text-sm">
                  <i className="fas fa-lock mr-2"></i>
                  Ensuring secure access to protected content
                </p>
              </div>

              {/* Enhanced Security Indicators */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                {[
                  { icon: 'fa-lock', label: 'Secure', color: 'bg-green-500' },
                  { icon: 'fa-key', label: 'Encrypted', color: 'bg-blue-500' },
                  { icon: 'fa-user-shield', label: 'Protected', color: 'bg-purple-500' },
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
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 h-2 rounded-full animate-loading-bar"></div>
                </div>
                
                <div className="flex justify-between items-center text-xs text-blue-200">
                  <span>
                    <i className="fas fa-clock mr-1"></i>
                    Verifying credentials...
                  </span>
                  <span>
                    <i className="fas fa-shield-alt mr-1"></i>
                    Security Score: {securityScore}/100
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Custom Enhanced Animations */}
          <style jsx>{`
            @keyframes float {
              0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
              25% { transform: translateY(-15px) rotate(2deg) scale(1.1); }
              50% { transform: translateY(-8px) rotate(-1deg) scale(0.95); }
              75% { transform: translateY(-12px) rotate(1deg) scale(1.05); }
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
              animation: loading-bar 2s ease-in-out infinite;
            }
          `}</style>
        </div>
      </ErrorBoundary>
    );
  }

  // Handle different authentication states
  if (authState === 'locked') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 via-pink-600 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12 text-center shadow-2xl max-w-md">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <i className="fas fa-lock text-white text-2xl"></i>
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Account Temporarily Locked</h3>
          <p className="text-red-100 mb-6">
            Too many failed authentication attempts. Please try again later.
          </p>
          <p className="text-sm text-red-200">
            Lockout expires: {new Date(lockoutEndTime).toLocaleString()}
          </p>
        </div>
      </div>
    );
  }

  if (authState === 'maintenance') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-600 via-yellow-600 to-red-600 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12 text-center shadow-2xl max-w-md">
          <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <i className="fas fa-tools text-white text-2xl"></i>
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Maintenance Mode</h3>
          <p className="text-orange-100 mb-6">
            The system is currently under maintenance. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  if (authState === 'session_expired') {
    return (
      <Navigate 
        to={`${fallbackPath}?expired=true&redirect=${encodeURIComponent(location.pathname)}`} 
        state={{ from: location, reason: 'session_expired' }} 
        replace 
      />
    );
  }

  if (authState === 'unauthenticated') {
    return (
      <Navigate 
        to={`${fallbackPath}?redirect=${encodeURIComponent(location.pathname)}`} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  if (authState === 'access_denied' || showAccessDenied) {
    return (
      <AccessDeniedPage 
        reason={accessDeniedReason}
        requiredRoles={requiredRoles}
        requiredPermissions={requiredPermissions}
        userRole={userRole}
        onGoBack={() => navigate(-1)}
        onGoHome={() => navigate('/')}
      />
    );
  }

  if (authState === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 via-pink-600 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12 text-center shadow-2xl max-w-md">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-exclamation-triangle text-white text-2xl"></i>
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Authentication Error</h3>
          <p className="text-red-100 mb-6">
            Unable to verify your access permissions. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-white/20 backdrop-blur-lg border border-white/30 text-white font-bold py-3 px-6 rounded-2xl hover:bg-white/30 transition-all duration-200"
          >
            <i className="fas fa-redo mr-2"></i>
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Successful authentication - render protected content
  return (
    <ErrorBoundary>
      <Helmet>
        <title>Secure Access - ShoeMarkNet</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Session Warning Modal */}
      {showSessionWarning && (
        <SessionWarningModal
          isOpen={showSessionWarning}
          countdown={sessionCountdown}
          onExtend={handleExtendSession}
          onLogout={() => handleLogout('session_warning')}
          onClose={() => setShowSessionWarning(false)}
        />
      )}

      {/* Security Indicators */}
      <SecurityIndicators
        user={user}
        securityScore={securityScore}
        isConnected={isConnected}
        connectionQuality={connectionQuality}
        threats={threats}
        deviceFingerprint={deviceFingerprint}
        suspiciousActivity={suspiciousActivity}
      />

      {/* Security Alerts */}
      {securityAlerts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {securityAlerts.slice(0, 3).map((alert, index) => (
            <div
              key={index}
              className="bg-red-500/20 backdrop-blur-lg border border-red-300/50 text-red-800 dark:text-red-200 px-6 py-3 rounded-2xl shadow-lg animate-slide-in-right max-w-sm"
            >
              <div className="flex items-start">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <i className="fas fa-exclamation-triangle text-white text-sm"></i>
                </div>
                <div>
                  <p className="font-semibold text-sm">{alert.title}</p>
                  <p className="text-xs mt-1">{alert.description}</p>
                </div>
                <button
                  onClick={() => setSecurityAlerts(prev => prev.filter((_, i) => i !== index))}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  <i className="fas fa-times text-xs"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Success Notification */}
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

      {/* Enhanced Status Indicators */}
      <div className="fixed bottom-4 left-4 z-40">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl px-4 py-2 shadow-lg">
          <div className="flex items-center space-x-3 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-900 dark:text-white font-medium">
                <i className="fas fa-shield-alt mr-1 text-blue-500"></i>
                Secure Session
              </span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {Math.ceil(timeUntilExpiry / 60000)}m left
            </div>
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
              <p className="font-semibold">
                {securityLevel.toUpperCase()} Security
              </p>
              <p>Score: {securityScore}/100</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Protected Content */}
      <div className="relative">
        <Outlet />
      </div>

      {/* Enhanced Custom Styles */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.5s ease-out;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
    </ErrorBoundary>
  );
};

export default ProtectedRoute;
