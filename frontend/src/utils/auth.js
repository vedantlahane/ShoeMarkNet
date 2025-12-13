// Auth utility functions for ShoeMarkNet
// Provides comprehensive authentication and authorization utilities

import { jwtDecode } from 'jwt-decode';

// Constants
const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';
const LAST_ACTIVITY_KEY = 'lastActivity';
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
const REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry

// Role hierarchy for permission checking
const ROLE_HIERARCHY = {
  'super_admin': 100,
  'admin': 80,
  'moderator': 60,
  'premium_user': 40,
  'user': 20,
  'guest': 0
};

// Default permissions by role
const DEFAULT_PERMISSIONS = {
  'super_admin': [
    'admin.dashboard.view',
    'admin.users.manage',
    'admin.products.manage',
    'admin.orders.manage',
    'admin.analytics.view',
    'admin.settings.manage',
    'admin.security.manage',
    'content.create',
    'content.edit',
    'content.delete',
    'reviews.moderate',
    'system.backup',
    'system.restore'
  ],
  'admin': [
    'admin.dashboard.view',
    'admin.users.view',
    'admin.users.edit',
    'admin.products.manage',
    'admin.orders.manage',
    'admin.analytics.view',
    'admin.settings.view',
    'content.create',
    'content.edit',
    'reviews.moderate'
  ],
  'moderator': [
    'admin.dashboard.view',
    'admin.products.view',
    'admin.orders.view',
    'content.edit',
    'reviews.moderate'
  ],
  'premium_user': [
    'profile.edit',
    'orders.view',
    'reviews.create',
    'wishlist.manage',
    'cart.manage',
    'priority.support'
  ],
  'user': [
    'profile.edit',
    'orders.view',
    'reviews.create',
    'wishlist.manage',
    'cart.manage'
  ],
  'guest': [
    'products.view',
    'categories.view'
  ]
};

/**
 * Token Management Functions
 */

// Get token from localStorage
export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.warn('Failed to get token from localStorage:', error);
    return null;
  }
};

// Set token in localStorage
export const setToken = (token) => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      updateLastActivity();
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (error) {
    console.warn('Failed to set token in localStorage:', error);
  }
};

// Get refresh token
export const getRefreshToken = () => {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.warn('Failed to get refresh token from localStorage:', error);
    return null;
  }
};

// Set refresh token
export const setRefreshToken = (refreshToken) => {
  try {
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  } catch (error) {
    console.warn('Failed to set refresh token in localStorage:', error);
  }
};

// Remove all tokens
export const clearTokens = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(LAST_ACTIVITY_KEY);
  } catch (error) {
    console.warn('Failed to clear tokens from localStorage:', error);
  }
};

/**
 * JWT Token Validation and Decoding
 */

// Decode JWT token safely
export const decodeToken = (token) => {
  try {
    if (!token) return null;
    return jwtDecode(token);
  } catch (error) {
    console.warn('Failed to decode token:', error);
    return null;
  }
};

// Check if token is valid (not expired)
export const isTokenValid = (token) => {
  try {
    if (!token) return false;
    
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return false;
    
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    console.warn('Failed to validate token:', error);
    return false;
  }
};

// Check if token needs refresh (within threshold)
export const shouldRefreshToken = (token) => {
  try {
    if (!token) return false;
    
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return false;
    
    const currentTime = Date.now() / 1000;
    const timeUntilExpiry = (decoded.exp - currentTime) * 1000;
    
    return timeUntilExpiry <= REFRESH_THRESHOLD && timeUntilExpiry > 0;
  } catch (error) {
    console.warn('Failed to check token refresh need:', error);
    return false;
  }
};

// Get token expiry time
export const getTokenExpiryTime = (token) => {
  try {
    const decoded = decodeToken(token);
    return decoded?.exp ? decoded.exp * 1000 : null;
  } catch (error) {
    console.warn('Failed to get token expiry:', error);
    return null;
  }
};

/**
 * User Authentication State
 */

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getToken();
  return token && isTokenValid(token);
};

// Get current user from token or localStorage
export const getCurrentUser = () => {
  try {
    // First try to get from localStorage
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    
    // Fallback to token
    const token = getToken();
    if (token && isTokenValid(token)) {
      const decoded = decodeToken(token);
      return decoded?.user || null;
    }
    
    return null;
  } catch (error) {
    console.warn('Failed to get current user:', error);
    return null;
  }
};

// Set current user in localStorage
export const setCurrentUser = (user) => {
  try {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  } catch (error) {
    console.warn('Failed to set current user:', error);
  }
};

// Get user role
export const getUserRole = () => {
  const user = getCurrentUser();
  return user?.role || 'guest';
};

// Get user permissions
export const getUserPermissions = () => {
  const user = getCurrentUser();
  if (user?.permissions && Array.isArray(user.permissions)) {
    return user.permissions;
  }
  
  // Fallback to default permissions based on role
  const role = getUserRole();
  return DEFAULT_PERMISSIONS[role] || DEFAULT_PERMISSIONS['guest'];
};

/**
 * Role and Permission Checking
 */

// Check if user has specific role
export const hasRole = (requiredRole) => {
  const userRole = getUserRole();
  const userRoleLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredRoleLevel = ROLE_HIERARCHY[requiredRole] || 0;
  
  return userRoleLevel >= requiredRoleLevel;
};

// Check if user has specific permission
export const hasPermission = (permission) => {
  const permissions = getUserPermissions();
  return permissions.includes(permission);
};

// Check if user has any of the specified permissions
export const hasAnyPermission = (permissionsList) => {
  if (!Array.isArray(permissionsList)) return false;
  const userPermissions = getUserPermissions();
  return permissionsList.some(permission => userPermissions.includes(permission));
};

// Check if user has all specified permissions
export const hasAllPermissions = (permissionsList) => {
  if (!Array.isArray(permissionsList)) return false;
  const userPermissions = getUserPermissions();
  return permissionsList.every(permission => userPermissions.includes(permission));
};

// Check if user is admin
export const isAdmin = () => {
  return hasRole('admin');
};

// Check if user is super admin
export const isSuperAdmin = () => {
  return hasRole('super_admin');
};

// Check if user is moderator or higher
export const isModerator = () => {
  return hasRole('moderator');
};

/**
 * Route Protection Utilities
 */

// Check if user can access admin routes
export const canAccessAdmin = () => {
  return isAuthenticated() && hasRole('moderator');
};

// Check if user can access specific admin section
export const canAccessAdminSection = (section) => {
  if (!isAuthenticated()) return false;
  
  const sectionPermissions = {
    'dashboard': 'admin.dashboard.view',
    'users': 'admin.users.view',
    'products': 'admin.products.view',
    'orders': 'admin.orders.view',
    'analytics': 'admin.analytics.view',
    'settings': 'admin.settings.view'
  };
  
  const requiredPermission = sectionPermissions[section];
  return requiredPermission ? hasPermission(requiredPermission) : false;
};

// Check if user can perform action on resource
export const canPerformAction = (action, resource) => {
  if (!isAuthenticated()) return false;
  
  const permission = `${resource}.${action}`;
  return hasPermission(permission);
};

/**
 * Session Management
 */

// Update last activity timestamp
export const updateLastActivity = () => {
  try {
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
  } catch (error) {
    console.warn('Failed to update last activity:', error);
  }
};

// Get last activity timestamp
export const getLastActivity = () => {
  try {
    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
    return lastActivity ? parseInt(lastActivity, 10) : null;
  } catch (error) {
    console.warn('Failed to get last activity:', error);
    return null;
  }
};

// Check if session has expired
export const isSessionExpired = () => {
  const lastActivity = getLastActivity();
  if (!lastActivity) return true;
  
  const timeSinceActivity = Date.now() - lastActivity;
  return timeSinceActivity > SESSION_TIMEOUT;
};

// Get time until session expires
export const getTimeUntilSessionExpiry = () => {
  const lastActivity = getLastActivity();
  if (!lastActivity) return 0;
  
  const timeSinceActivity = Date.now() - lastActivity;
  const timeRemaining = SESSION_TIMEOUT - timeSinceActivity;
  
  return Math.max(0, timeRemaining);
};

// Extend session
export const extendSession = () => {
  updateLastActivity();
};

/**
 * Security Utilities
 */

// Generate CSRF token
export const generateCSRFToken = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Get device fingerprint
export const getDeviceFingerprint = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillText('Device fingerprint', 2, 2);
  
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    canvasFingerprint: canvas.toDataURL()
  };
};

// Check if login is from trusted device
export const isTrustedDevice = () => {
  try {
    const trustedDevices = JSON.parse(localStorage.getItem('trustedDevices') || '[]');
    const currentFingerprint = getDeviceFingerprint();
    
    return trustedDevices.some(device => 
      device.userAgent === currentFingerprint.userAgent &&
      device.screenResolution === currentFingerprint.screenResolution
    );
  } catch (error) {
    console.warn('Failed to check trusted device:', error);
    return false;
  }
};

// Add current device to trusted devices
export const addTrustedDevice = () => {
  try {
    const trustedDevices = JSON.parse(localStorage.getItem('trustedDevices') || '[]');
    const currentFingerprint = getDeviceFingerprint();
    
    // Check if device already exists
    const deviceExists = trustedDevices.some(device => 
      device.userAgent === currentFingerprint.userAgent &&
      device.screenResolution === currentFingerprint.screenResolution
    );
    
    if (!deviceExists) {
      trustedDevices.push({
        ...currentFingerprint,
        addedAt: new Date().toISOString()
      });
      
      // Keep only last 5 trusted devices
      if (trustedDevices.length > 5) {
        trustedDevices.splice(0, trustedDevices.length - 5);
      }
      
      localStorage.setItem('trustedDevices', JSON.stringify(trustedDevices));
    }
  } catch (error) {
    console.warn('Failed to add trusted device:', error);
  }
};

/**
 * Password Security
 */

// Check password strength
export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, level: 'weak', feedback: [] };
  
  let score = 0;
  const feedback = [];
  
  // Length check
  if (password.length >= 8) score += 1;
  else feedback.push('Use at least 8 characters');
  
  if (password.length >= 12) score += 1;
  else feedback.push('Use 12+ characters for better security');
  
  // Character variety
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Include lowercase letters');
  
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Include uppercase letters');
  
  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('Include numbers');
  
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  else feedback.push('Include special characters');
  
  // Common patterns
  if (!/(.)\1{2,}/.test(password)) score += 1;
  else feedback.push('Avoid repeated characters');
  
  if (!/123|abc|qwe|password|admin/.test(password.toLowerCase())) score += 1;
  else feedback.push('Avoid common patterns');
  
  // Determine level
  let level = 'weak';
  if (score >= 6) level = 'strong';
  else if (score >= 4) level = 'medium';
  
  return { score, level, feedback };
};

/**
 * Logout Utilities
 */

// Perform complete logout
export const logout = () => {
  clearTokens();
  
  // Clear other auth-related data
  try {
    localStorage.removeItem('trustedDevices');
    localStorage.removeItem('userPreferences');
    localStorage.removeItem('checkoutStep');
    localStorage.removeItem('searchHistory');
  } catch (error) {
    console.warn('Failed to clear additional data during logout:', error);
  }
};

// Force logout (for security issues)
export const forceLogout = (reason = 'Security check') => {
  logout();
  
  // Redirect to login with message
  const currentPath = window.location.pathname;
  const redirectUrl = `/login?redirect=${encodeURIComponent(currentPath)}&reason=${encodeURIComponent(reason)}`;
  window.location.href = redirectUrl;
};

/**
 * Validation Utilities
 */

// Validate authentication state
export const validateAuthState = () => {
  const token = getToken();
  const user = getCurrentUser();
  
  // Check if we have token but no user data
  if (token && !user) {
    console.warn('Token exists but no user data found');
    return false;
  }
  
  // Check if token is valid
  if (token && !isTokenValid(token)) {
    console.warn('Invalid token detected');
    clearTokens();
    return false;
  }
  
  // Check session expiry
  if (isSessionExpired()) {
    console.warn('Session expired');
    clearTokens();
    return false;
  }
  
  return true;
};

/**
 * Export all utilities
 */
export default {
  // Token management
  getToken,
  setToken,
  getRefreshToken,
  setRefreshToken,
  clearTokens,
  
  // JWT utilities
  decodeToken,
  isTokenValid,
  shouldRefreshToken,
  getTokenExpiryTime,
  
  // Authentication state
  isAuthenticated,
  getCurrentUser,
  setCurrentUser,
  getUserRole,
  getUserPermissions,
  
  // Permission checking
  hasRole,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isAdmin,
  isSuperAdmin,
  isModerator,
  
  // Route protection
  canAccessAdmin,
  canAccessAdminSection,
  canPerformAction,
  
  // Session management
  updateLastActivity,
  getLastActivity,
  isSessionExpired,
  getTimeUntilSessionExpiry,
  extendSession,
  
  // Security
  generateCSRFToken,
  getDeviceFingerprint,
  isTrustedDevice,
  addTrustedDevice,
  getPasswordStrength,
  
  // Logout
  logout,
  forceLogout,
  
  // Validation
  validateAuthState
};
