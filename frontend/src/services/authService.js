// src/services/authService.js
import api from "../utils/api";
/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} - Promise resolving to user data and tokens
 */
const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', {email, password});
    if(response.data.token){
      localStorage.setItem("token", response.data.token);
      if(response.data.refreshToken) {
        localStorage.setItem("refreshToken", response.data.refreshToken);
      }
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @returns {Promise} - Promise resolving to user data and tokens
 */
const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    if(response.data.token){
      localStorage.setItem("token", response.data.token);
      if(response.data.refreshToken) {
        localStorage.setItem("refreshToken", response.data.refreshToken);
      }
    }
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

/**
 * Get current user profile
 * @returns {Promise} - Promise resolving to user profile data
 */
const getProfile = async () => {
  try {
    const response = await api.get('/auth/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

/**
 * Logout user by removing tokens
 */
const logoutUser = () => {
  try {
    // Call logout endpoint to invalidate token on server (if implemented)
    api.post('/auth/logout').catch(err => console.warn('Server logout failed:', err));
    
    // Remove tokens from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  } catch (error) {
    console.error('Logout error:', error);
    // Still remove tokens even if API call fails
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  }
};

/**
 * Refresh authentication token
 * @param {string} refreshTokenValue - Refresh token
 * @returns {Promise} - Promise resolving to new tokens
 */
const refreshToken = async (refreshTokenValue) => {
  try {
    const response = await api.post('/auth/refresh-token', { refreshToken: refreshTokenValue });
    
    // Update tokens in localStorage
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    if (response.data.refreshToken) {
      localStorage.setItem("refreshToken", response.data.refreshToken);
    }
    
    return response.data;
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
};

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise} - Promise resolving to success message
 */
const requestPasswordReset = async (email) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    console.error('Password reset request error:', error);
    throw error;
  }
};

/**
 * Reset password with token
 * @param {Object} resetData - Reset token and new password
 * @returns {Promise} - Promise resolving to success message
 */
const resetPassword = async (resetData) => {
  try {
    const response = await api.post('/auth/reset-password', resetData);
    return response.data;
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};

/**
 * Verify email address
 * @param {string} verificationToken - Email verification token
 * @returns {Promise} - Promise resolving to success message
 */
const verifyEmail = async (verificationToken) => {
  try {
    const response = await api.post('/auth/verify-email', { token: verificationToken });
    return response.data;
  } catch (error) {
    console.error('Email verification error:', error);
    throw error;
  }
};

const authService = {
  login,
  register,
  getProfile,
  logoutUser,
  refreshToken,
  requestPasswordReset,
  resetPassword,
  verifyEmail
};

export default authService;
