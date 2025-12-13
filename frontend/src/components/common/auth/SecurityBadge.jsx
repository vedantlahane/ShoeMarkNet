import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

// Hooks
import useLocalStorage from '../../../hooks/useLocalStorage';
import useWebSocket from '../../../hooks/useWebSocket';

// Utils
import { trackEvent } from '../../../utils/analytics';

// Constants
const SECURITY_LEVELS = {
  low: { color: 'text-red-500', bgColor: 'bg-red-500/20', borderColor: 'border-red-300/50' },
  medium: { color: 'text-yellow-500', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-300/50' },
  high: { color: 'text-green-500', bgColor: 'bg-green-500/20', borderColor: 'border-green-300/50' },
  critical: { color: 'text-blue-500', bgColor: 'bg-blue-500/20', borderColor: 'border-blue-300/50' }
};

const CONNECTION_QUALITY_ICONS = {
  excellent: 'fas fa-signal',
  good: 'fas fa-wifi',
  fair: 'fas fa-wifi',
  poor: 'fas fa-exclamation-triangle',
  offline: 'fas fa-times-circle'
};

const CONNECTION_QUALITY_COLORS = {
  excellent: 'text-green-500',
  good: 'text-blue-500',
  fair: 'text-yellow-500',
  poor: 'text-orange-500',
  offline: 'text-red-500'
};

const SecurityBadge = ({
  securityLevel = 'high',
  securityScore = 85,
  isConnected = true,
  connectionQuality = 'good',
  adminVerified = true,
  sessionTimeLeft = 3600000, // 1 hour in milliseconds
  onRefreshSession = null,
  position = 'fixed',
  className = ''
}) => {
  const { user } = useSelector(state => state.auth);
  
  // Local state
  const [isExpanded, setIsExpanded] = useLocalStorage('securityBadgeExpanded', false);
  const [showDetails, setShowDetails] = useState(false);
  const [animatePulse, setAnimatePulse] = useState(false);
  const [lastSecurityCheck, setLastSecurityCheck] = useState(Date.now());
  const [notifications, setNotifications] = useState([]);

  // Get security level configuration
  const securityConfig = useMemo(() => 
    SECURITY_LEVELS[securityLevel] || SECURITY_LEVELS.medium,
    [securityLevel]
  );

  // Calculate session time left in minutes
  const sessionMinutesLeft = useMemo(() => 
    Math.max(0, Math.floor(sessionTimeLeft / 60000)),
    [sessionTimeLeft]
  );

  // Determine overall security status
  const securityStatus = useMemo(() => {
    if (!isConnected) return 'offline';
    if (!adminVerified) return 'unverified';
    if (securityScore < 60) return 'low';
    if (securityScore < 80) return 'medium';
    if (sessionMinutesLeft < 10) return 'expiring';
    return 'secure';
  }, [isConnected, adminVerified, securityScore, sessionMinutesLeft]);

  // Get status color based on security status
  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'secure': return 'text-green-500';
      case 'expiring': return 'text-yellow-500';
      case 'medium': return 'text-blue-500';
      case 'low': return 'text-orange-500';
      case 'unverified': return 'text-red-500';
      case 'offline': return 'text-red-600';
      default: return 'text-gray-500';
    }
  }, []);

  // Get status icon based on security status
  const getStatusIcon = useCallback((status) => {
    switch (status) {
      case 'secure': return 'fas fa-shield-alt';
      case 'expiring': return 'fas fa-clock';
      case 'medium': return 'fas fa-shield-check';
      case 'low': return 'fas fa-exclamation-triangle';
      case 'unverified': return 'fas fa-user-times';
      case 'offline': return 'fas fa-wifi-slash';
      default: return 'fas fa-shield';
    }
  }, []);

  // Format time remaining
  const formatTimeRemaining = useCallback((minutes) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }, []);

  // Handle session refresh
  const handleRefreshSession = useCallback(async () => {
    if (onRefreshSession) {
      try {
        await onRefreshSession();
        trackEvent('security_badge_session_refreshed', {
          user_id: user?._id,
          security_score: securityScore
        });
      } catch (error) {
        console.error('Failed to refresh session:', error);
      }
    }
  }, [onRefreshSession, user, securityScore]);

  // Check for security warnings
  useEffect(() => {
    const newNotifications = [];

    if (sessionMinutesLeft < 10 && sessionMinutesLeft > 0) {
      newNotifications.push({
        type: 'warning',
        message: `Session expires in ${sessionMinutesLeft} minutes`,
        action: onRefreshSession ? 'Refresh Session' : null
      });
    }

    if (securityScore < 70) {
      newNotifications.push({
        type: 'alert',
        message: `Security score is low (${securityScore}/100)`,
        action: null
      });
    }

    if (!isConnected) {
      newNotifications.push({
        type: 'error',
        message: 'Connection lost',
        action: null
      });
    }

    setNotifications(newNotifications);
  }, [sessionMinutesLeft, securityScore, isConnected, onRefreshSession]);

  // Trigger pulse animation for important alerts
  useEffect(() => {
    if (notifications.some(n => n.type === 'error' || (n.type === 'warning' && sessionMinutesLeft < 5))) {
      setAnimatePulse(true);
      const timer = setTimeout(() => setAnimatePulse(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [notifications, sessionMinutesLeft]);

  // Update last security check timestamp
  useEffect(() => {
    const interval = setInterval(() => {
      setLastSecurityCheck(Date.now());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Render compact badge
  const renderCompactBadge = () => (
    <div 
      className={`group cursor-pointer transition-all duration-200 hover:scale-110 ${
        animatePulse ? 'animate-pulse' : ''
      }`}
      onClick={() => setIsExpanded(true)}
      title="Security Status - Click to expand"
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-2 ${
        securityConfig.bgColor
      } ${securityConfig.borderColor} backdrop-blur-lg`}>
        <i className={`${getStatusIcon(securityStatus)} ${getStatusColor(securityStatus)} text-lg`}></i>
      </div>
      
      {/* Status indicator dot */}
      <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
        securityStatus === 'secure' ? 'bg-green-400' :
        securityStatus === 'expiring' ? 'bg-yellow-400' :
        'bg-red-400'
      } ${animatePulse ? 'animate-ping' : ''}`}></div>

      {/* Notification count */}
      {notifications.length > 0 && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
          {notifications.length}
        </div>
      )}
    </div>
  );

  // Render expanded badge
  const renderExpandedBadge = () => (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${securityConfig.bgColor}`}>
              <i className={`${getStatusIcon(securityStatus)} ${getStatusColor(securityStatus)} text-lg`}></i>
            </div>
            <div>
              <h3 className="text-theme font-bold">Security Status</h3>
              <p className="text-muted-theme text-sm capitalize">{securityStatus}</p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-theme hover:bg-white/30 transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        
        {/* Security Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Security Score</span>
              <span className={`font-bold ${
                securityScore >= 80 ? 'text-green-500' : 
                securityScore >= 60 ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {securityScore}/100
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  securityScore >= 80 ? 'bg-green-500' : 
                  securityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${securityScore}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Session</span>
              <span className={`font-bold ${
                sessionMinutesLeft > 30 ? 'text-green-500' : 
                sessionMinutesLeft > 10 ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {formatTimeRemaining(sessionMinutesLeft)}
              </span>
            </div>
            {onRefreshSession && sessionMinutesLeft < 30 && (
              <button
                onClick={handleRefreshSession}
                className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-2 rounded transition-colors"
              >
                Refresh
              </button>
            )}
          </div>
        </div>

        {/* Connection Status */}
        <div className="bg-white/10 rounded-xl p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <i className={`${CONNECTION_QUALITY_ICONS[connectionQuality] || 'fas fa-wifi'} ${
                CONNECTION_QUALITY_COLORS[connectionQuality] || 'text-gray-500'
              }`}></i>
              <span className="text-sm text-gray-600 dark:text-gray-400">Connection</span>
            </div>
            <span className={`font-bold capitalize ${
              CONNECTION_QUALITY_COLORS[connectionQuality] || 'text-gray-500'
            }`}>
              {isConnected ? connectionQuality : 'Offline'}
            </span>
          </div>
        </div>

        {/* Admin Verification */}
        <div className="bg-white/10 rounded-xl p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <i className={`fas fa-user-shield ${adminVerified ? 'text-green-500' : 'text-red-500'}`}></i>
              <span className="text-sm text-gray-600 dark:text-gray-400">Admin Status</span>
            </div>
            <span className={`font-bold ${adminVerified ? 'text-green-500' : 'text-red-500'}`}>
              {adminVerified ? 'Verified' : 'Unverified'}
            </span>
          </div>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Alerts</h4>
            {notifications.map((notification, index) => (
              <div
                key={index}
                className={`p-3 rounded-xl border ${
                  notification.type === 'error' ? 'bg-red-500/20 border-red-300/50 text-red-800 dark:text-red-200' :
                  notification.type === 'warning' ? 'bg-yellow-500/20 border-yellow-300/50 text-yellow-800 dark:text-yellow-200' :
                  'bg-blue-500/20 border-blue-300/50 text-blue-800 dark:text-blue-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <i className={`fas ${
                      notification.type === 'error' ? 'fa-exclamation-triangle' :
                      notification.type === 'warning' ? 'fa-clock' :
                      'fa-info-circle'
                    }`}></i>
                    <span className="text-sm">{notification.message}</span>
                  </div>
                  {notification.action && (
                    <button
                      onClick={handleRefreshSession}
                      className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors"
                    >
                      {notification.action}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Security Details Toggle */}
        <div className="pt-3 border-t border-white/20 dark:border-gray-700/20">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center justify-between w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <span>Security Details</span>
            <i className={`fas fa-chevron-${showDetails ? 'up' : 'down'}`}></i>
          </button>
          
          {showDetails && (
            <div className="mt-3 space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Security Level:</span>
                <span className="capitalize">{securityLevel}</span>
              </div>
              <div className="flex justify-between">
                <span>User Role:</span>
                <span>{user?.role || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Check:</span>
                <span>{new Date(lastSecurityCheck).toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Connection Quality:</span>
                <span className="capitalize">{connectionQuality}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`${position === 'fixed' ? 'fixed bottom-6 right-6 z-50' : 'relative'} ${className}`}>
      {isExpanded ? renderExpandedBadge() : renderCompactBadge()}

      {/* Custom Styles */}
    </div>
  );
};

export default SecurityBadge;
