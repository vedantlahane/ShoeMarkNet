import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';

// Redux actions
import { logout, requestAccess, updateLastActivity } from '../redux/slices/authSlice';

// Components
import ErrorBoundary from '../components/common/ErrorBoundary';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Hooks
import useLocalStorage from '../hooks/useLocalStorage';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';
import useWebSocket from '../hooks/useWebSocket';

// Utils
import { trackEvent } from '../utils/analytics';
import { formatDate } from '../utils/helpers';

// Constants
const ACCESS_DENIAL_REASONS = {
  INSUFFICIENT_ROLE: 'insufficient_role',
  MISSING_PERMISSIONS: 'missing_permissions',
  SECURITY_CLEARANCE: 'security_clearance',
  ACCOUNT_SUSPENDED: 'account_suspended',
  SESSION_EXPIRED: 'session_expired',
  IP_RESTRICTED: 'ip_restricted',
  TIME_RESTRICTED: 'time_restricted',
  MAINTENANCE_MODE: 'maintenance_mode',
  RATE_LIMITED: 'rate_limited',
  UNKNOWN: 'unknown'
};

const REASON_CONFIGS = {
  [ACCESS_DENIAL_REASONS.INSUFFICIENT_ROLE]: {
    title: 'Insufficient Role Privileges',
    icon: 'fas fa-user-slash',
    color: 'from-red-500 to-pink-500',
    description: 'Your current role does not have the required privileges to access this resource.',
    showRequestAccess: true,
    showUpgrade: true
  },
  [ACCESS_DENIAL_REASONS.MISSING_PERMISSIONS]: {
    title: 'Missing Required Permissions',
    icon: 'fas fa-key',
    color: 'from-orange-500 to-red-500',
    description: 'You don\'t have the specific permissions required to access this page.',
    showRequestAccess: true,
    showContactAdmin: true
  },
  [ACCESS_DENIAL_REASONS.SECURITY_CLEARANCE]: {
    title: 'Insufficient Security Clearance',
    icon: 'fas fa-shield-alt',
    color: 'from-purple-500 to-indigo-500',
    description: 'This resource requires a higher security clearance level.',
    showSecurityUpgrade: true,
    showContactAdmin: true
  },
  [ACCESS_DENIAL_REASONS.ACCOUNT_SUSPENDED]: {
    title: 'Account Access Suspended',
    icon: 'fas fa-ban',
    color: 'from-red-600 to-red-800',
    description: 'Your account access has been temporarily suspended.',
    showContactSupport: true,
    showAppealProcess: true
  },
  [ACCESS_DENIAL_REASONS.SESSION_EXPIRED]: {
    title: 'Session Expired',
    icon: 'fas fa-clock',
    color: 'from-yellow-500 to-orange-500',
    description: 'Your session has expired for security reasons.',
    showLogin: true,
    showRefresh: true
  },
  [ACCESS_DENIAL_REASONS.IP_RESTRICTED]: {
    title: 'IP Address Restricted',
    icon: 'fas fa-globe',
    color: 'from-blue-500 to-cyan-500',
    description: 'Access from your current location is not permitted.',
    showContactAdmin: true,
    showVPNInfo: true
  },
  [ACCESS_DENIAL_REASONS.MAINTENANCE_MODE]: {
    title: 'System Under Maintenance',
    icon: 'fas fa-tools',
    color: 'from-gray-500 to-gray-700',
    description: 'The system is currently under maintenance. Please try again later.',
    showMaintenanceInfo: true,
    showStatusPage: true
  },
  [ACCESS_DENIAL_REASONS.UNKNOWN]: {
    title: 'Access Denied',
    icon: 'fas fa-exclamation-triangle',
    color: 'from-gray-600 to-gray-800',
    description: 'You don\'t have permission to access this resource.',
    showContactSupport: true,
    showGoBack: true
  }
};

const AccessDeniedPage = ({
  reason = ACCESS_DENIAL_REASONS.UNKNOWN,
  title = null,
  message = null,
  userRole = null,
  requiredRole = null,
  requiredPermissions = [],
  securityLevel = null,
  currentSecurityScore = null,
  onGoBack = null,
  onGoHome = null,
  onRequestAccess = null,
  showRequestAccess = false,
  showSecurityUpgrade = false,
  showContactAdmin = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Redux state
  const { user, isAuthenticated } = useSelector(state => state.auth);

  // Hooks
  const { isConnected } = useWebSocket('/access-denied');

  // Local state
  const [animateContent, setAnimateContent] = useState(false);
  const [accessRequestSent, setAccessRequestSent] = useLocalStorage('accessRequestSent', false);
  const [showDetails, setShowDetails] = useState(false);
  const [requestingAccess, setRequestingAccess] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    email: '',
    message: ''
  });
  const [showContactForm, setShowContactForm] = useState(false);

  // Get reason configuration
  const reasonConfig = useMemo(() => 
    REASON_CONFIGS[reason] || REASON_CONFIGS[ACCESS_DENIAL_REASONS.UNKNOWN],
    [reason]
  );

  // Enhanced keyboard shortcuts
  useKeyboardShortcuts({
    'escape': () => handleGoBack(),
    'ctrl+h': () => handleGoHome(),
    'ctrl+r': () => handleRequestAccess(),
    'ctrl+s': () => setShowDetails(!showDetails),
    'ctrl+c': () => setShowContactForm(!showContactForm),
    'f5': () => window.location.reload()
  });

  // Initialize component
  useEffect(() => {
    setTimeout(() => setAnimateContent(true), 100);
    
    // Track access denied event
    trackEvent('access_denied_page_viewed', {
      reason,
      page_path: location.pathname,
      user_role: userRole,
      required_role: requiredRole,
      required_permissions: requiredPermissions,
      security_level: securityLevel,
      is_authenticated: isAuthenticated,
      user_id: user?._id,
      timestamp: new Date().toISOString()
    });

    // Update last activity
    dispatch(updateLastActivity());
  }, [
    reason,
    location.pathname,
    userRole,
    requiredRole,
    requiredPermissions,
    securityLevel,
    isAuthenticated,
    user,
    dispatch
  ]);

  // Enhanced navigation handlers
  const handleGoBack = useCallback(() => {
    if (onGoBack) {
      onGoBack();
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
    
    trackEvent('access_denied_go_back', {
      reason,
      user_id: user?._id
    });
  }, [onGoBack, navigate, reason, user]);

  const handleGoHome = useCallback(() => {
    if (onGoHome) {
      onGoHome();
    } else {
      navigate('/');
    }
    
    trackEvent('access_denied_go_home', {
      reason,
      user_id: user?._id
    });
  }, [onGoHome, navigate, reason, user]);

  // Enhanced access request handler
  const handleRequestAccess = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to request access');
      navigate('/login', { 
        state: { from: location, requestAccess: true } 
      });
      return;
    }

    setRequestingAccess(true);

    try {
      if (onRequestAccess) {
        await onRequestAccess();
      } else {
        const requestData = {
          reason,
          requestedResource: location.pathname,
          userRole,
          requiredRole,
          requiredPermissions,
          securityLevel,
          currentSecurityScore,
          message: contactInfo.message,
          timestamp: new Date().toISOString()
        };

        await dispatch(requestAccess(requestData)).unwrap();
      }

      setAccessRequestSent(true);
      toast.success('🚀 Access request submitted successfully!');
      
      trackEvent('access_request_submitted', {
        reason,
        requested_resource: location.pathname,
        user_id: user?._id
      });

    } catch (error) {
      toast.error('Failed to submit access request. Please try again.');
    } finally {
      setRequestingAccess(false);
    }
  }, [
    isAuthenticated,
    navigate,
    location,
    onRequestAccess,
    reason,
    userRole,
    requiredRole,
    requiredPermissions,
    securityLevel,
    currentSecurityScore,
    contactInfo.message,
    dispatch,
    user,
    setAccessRequestSent
  ]);

  // Handle contact form submission
  const handleContactSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!contactInfo.email || !contactInfo.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Submit contact form (implement your own logic)
      toast.success('📧 Your message has been sent to support!');
      setShowContactForm(false);
      setContactInfo({ email: '', message: '' });
      
      trackEvent('access_denied_contact_sent', {
        reason,
        user_id: user?._id
      });
      
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    }
  }, [contactInfo, reason, user]);

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      await dispatch(logout()).unwrap();
      toast.success('👋 Logged out successfully');
      navigate('/login');
      
      trackEvent('access_denied_logout', {
        reason,
        user_id: user?._id
      });
    } catch (error) {
      toast.error('Failed to logout');
    }
  }, [dispatch, navigate, reason, user]);

  return (
    <ErrorBoundary>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>Access Denied - ShoeMarkNet</title>
        <meta name="description" content="You don't have permission to access this resource. Contact support if you believe this is an error." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50 to-pink-50 dark:from-gray-900 dark:via-red-900/20 dark:to-pink-900/20 flex items-center justify-center p-4 relative overflow-hidden">
        
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-300/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className={`relative z-10 max-w-4xl w-full ${animateContent ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 md:p-12 shadow-2xl">
            
            {/* Main Content */}
            <div className="text-center mb-8">
              
              {/* Icon */}
              <div className={`w-24 h-24 bg-gradient-to-r ${reasonConfig.color} rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-glow`}>
                <i className={`${reasonConfig.icon} text-4xl text-white`}></i>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                {title || reasonConfig.title}
              </h1>

              {/* Description */}
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
                {message || reasonConfig.description}
              </p>

              {/* Status Indicator */}
              <div className="inline-flex items-center space-x-2 bg-red-500/20 backdrop-blur-lg border border-red-300/50 text-red-800 dark:text-red-200 px-6 py-3 rounded-2xl">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-semibold">Access Restricted</span>
              </div>
            </div>

            {/* User Information */}
            {isAuthenticated && (
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 dark:border-gray-700/10 rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <i className="fas fa-user-circle mr-3 text-blue-500"></i>
                  Current User Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">User:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">{user?.name || 'Unknown'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Role:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">{userRole || user?.role || 'N/A'}</span>
                  </div>
                  {requiredRole && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Required Role:</span>
                      <span className="ml-2 font-medium text-red-600">{requiredRole}</span>
                    </div>
                  )}
                  {securityLevel && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Security Level:</span>
                      <span className="ml-2 font-medium text-red-600">{securityLevel.toUpperCase()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Required Permissions */}
            {requiredPermissions && requiredPermissions.length > 0 && (
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 dark:border-gray-700/10 rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <i className="fas fa-key mr-3 text-yellow-500"></i>
                  Required Permissions
                </h3>
                <div className="flex flex-wrap gap-2">
                  {requiredPermissions.map((permission, index) => (
                    <span
                      key={index}
                      className="bg-yellow-500/20 backdrop-blur-lg border border-yellow-300/50 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-xl text-sm font-medium"
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              
              {/* Go Back Button */}
              <button
                onClick={handleGoBack}
                className="bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-2xl hover:bg-white/20 transition-all duration-200 flex items-center"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Go Back
              </button>

              {/* Home Button */}
              <button
                onClick={handleGoHome}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 flex items-center"
              >
                <i className="fas fa-home mr-2"></i>
                Go Home
              </button>

              {/* Request Access Button */}
              {(showRequestAccess || reasonConfig.showRequestAccess) && isAuthenticated && !accessRequestSent && (
                <button
                  onClick={handleRequestAccess}
                  disabled={requestingAccess}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 flex items-center"
                >
                  {requestingAccess ? (
                    <>
                      <LoadingSpinner size="small" color="white" />
                      <span className="ml-2">Requesting...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-hand-paper mr-2"></i>
                      Request Access
                    </>
                  )}
                </button>
              )}

              {/* Login Button */}
              {reasonConfig.showLogin && !isAuthenticated && (
                <button
                  onClick={() => navigate('/login', { state: { from: location } })}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 flex items-center"
                >
                  <i className="fas fa-sign-in-alt mr-2"></i>
                  Login
                </button>
              )}

              {/* Logout Button */}
              {reason === ACCESS_DENIAL_REASONS.SESSION_EXPIRED && isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 flex items-center"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  Logout
                </button>
              )}
            </div>

            {/* Access Request Status */}
            {accessRequestSent && (
              <div className="bg-green-500/20 backdrop-blur-lg border border-green-300/50 text-green-800 dark:text-green-200 px-6 py-4 rounded-2xl mb-8 text-center">
                <div className="flex items-center justify-center mb-2">
                  <i className="fas fa-check-circle text-green-500 text-xl mr-2"></i>
                  <span className="font-semibold">Access Request Submitted</span>
                </div>
                <p className="text-sm">
                  Your request has been sent to the administrators. You'll be notified once it's reviewed.
                </p>
              </div>
            )}

            {/* Additional Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              
              {/* Contact Support */}
              {(showContactAdmin || reasonConfig.showContactAdmin || reasonConfig.showContactSupport) && (
                <button
                  onClick={() => setShowContactForm(!showContactForm)}
                  className="bg-white/5 backdrop-blur-lg border border-white/10 dark:border-gray-700/10 hover:bg-white/10 text-gray-900 dark:text-white p-6 rounded-2xl transition-all duration-200 group"
                >
                  <i className="fas fa-envelope text-3xl text-blue-500 mb-4 group-hover:scale-110 transition-transform duration-200"></i>
                  <h3 className="font-semibold mb-2">Contact Support</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get help from our support team
                  </p>
                </button>
              )}

              {/* Help Center */}
              <button
                onClick={() => navigate('/help')}
                className="bg-white/5 backdrop-blur-lg border border-white/10 dark:border-gray-700/10 hover:bg-white/10 text-gray-900 dark:text-white p-6 rounded-2xl transition-all duration-200 group"
              >
                <i className="fas fa-question-circle text-3xl text-purple-500 mb-4 group-hover:scale-110 transition-transform duration-200"></i>
                <h3 className="font-semibold mb-2">Help Center</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Find answers to common questions
                </p>
              </button>

              {/* Status Page */}
              {reasonConfig.showStatusPage && (
                <button
                  onClick={() => window.open('/status', '_blank')}
                  className="bg-white/5 backdrop-blur-lg border border-white/10 dark:border-gray-700/10 hover:bg-white/10 text-gray-900 dark:text-white p-6 rounded-2xl transition-all duration-200 group"
                >
                  <i className="fas fa-heartbeat text-3xl text-green-500 mb-4 group-hover:scale-110 transition-transform duration-200"></i>
                  <h3 className="font-semibold mb-2">System Status</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Check current system status
                  </p>
                </button>
              )}
            </div>

            {/* Contact Form Modal */}
            {showContactForm && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 max-w-md w-full shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Contact Support
                    </h3>
                    <button
                      onClick={() => setShowContactForm(false)}
                      className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <i className="fas fa-times text-xl"></i>
                    </button>
                  </div>

                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={contactInfo.email}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="your@email.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Message
                      </label>
                      <textarea
                        value={contactInfo.message}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, message: e.target.value }))}
                        rows={4}
                        className="w-full px-4 py-3 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Please describe the issue or request access details..."
                        required
                      />
                    </div>

                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() => setShowContactForm(false)}
                        className="flex-1 bg-white/10 backdrop-blur-lg border border-white/20 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-2xl hover:bg-white/20 transition-all duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200"
                      >
                        Send Message
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8 space-y-2">
              <p>
                <i className="fas fa-clock mr-2"></i>
                {formatDate(new Date())}
              </p>
              <p>
                <i className="fas fa-shield-alt mr-2"></i>
                Your security is our priority
              </p>
              {isConnected && (
                <p>
                  <i className="fas fa-wifi mr-2 text-green-500"></i>
                  Connection secure
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Custom Styles */}
      </div>
    </ErrorBoundary>
  );
};

export default AccessDeniedPage;
