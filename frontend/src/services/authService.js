// src/services/authService.js
import api from "../utils/api";

const normalizeResponse = (response) => {
  const envelope = response?.data;

  if (!envelope || typeof envelope !== "object") {
    return envelope ?? response;
  }

  const payload = Object.prototype.hasOwnProperty.call(envelope, "data")
    ? envelope.data
    : envelope;

  const meta = {};
  if (Object.prototype.hasOwnProperty.call(envelope, "success")) {
    meta.success = envelope.success;
  }
  if (Object.prototype.hasOwnProperty.call(envelope, "message")) {
    meta.message = envelope.message;
  }
  if (Object.prototype.hasOwnProperty.call(envelope, "meta")) {
    meta.meta = envelope.meta;
  }

  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    return { ...payload, ...meta };
  }

  return { data: payload, ...meta };
};

const storeTokens = (token, refreshToken) => {
  try {
    if (token) {
      localStorage.setItem("token", token);
    }
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
  } catch (storageError) {
    console.warn("Unable to persist auth tokens", storageError);
  }
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} - Promise resolving to user data and tokens
 */
const login = async (email, password) => {
  try {
    const response = await api.post("/auth/login", { email, password });
    const normalized = normalizeResponse(response);
    storeTokens(normalized.token, normalized.refreshToken);
    return normalized;
  } catch (error) {
    console.error("Login error:", error);
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
    const response = await api.post("/auth/register", userData);
    const normalized = normalizeResponse(response);
    storeTokens(normalized.token, normalized.refreshToken);
    return normalized;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

/**
 * Get current user profile
 * @returns {Promise} - Promise resolving to user profile data
 */
const getProfile = async () => {
  try {
    const response = await api.get("/auth/profile");
    return normalizeResponse(response);
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};

/**
 * Update user profile
 * @param {Object} profileData - Updated profile data
 * @returns {Promise} - Promise resolving to updated user data
 */
const updateProfile = async (profileData) => {
  try {
    const response = await api.put("/auth/profile", profileData);
    return normalizeResponse(response);
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

/**
 * Logout user by removing tokens
 */
const logoutUser = () => {
  try {
    api.post("/auth/logout").catch((err) =>
      console.warn("Server logout failed:", err)
    );
  } finally {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
    } catch (storageError) {
      console.error("Logout storage cleanup failed:", storageError);
    }
  }
};

/**
 * Refresh authentication token
 * @param {string} refreshTokenValue - Refresh token
 * @returns {Promise} - Promise resolving to new tokens
 */
const refreshToken = async (refreshTokenValue) => {
  try {
    const response = await api.post("/auth/refresh-token", {
      refreshToken: refreshTokenValue,
    });
    const normalized = normalizeResponse(response);
    storeTokens(normalized.token, normalized.refreshToken);
    return normalized;
  } catch (error) {
    console.error("Token refresh error:", error);
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
    const response = await api.post("/auth/forgot-password", { email });
    return normalizeResponse(response);
  } catch (error) {
    console.error("Password reset request error:", error);
    throw error;
  }
};

/**
 * Reset password with token
 * @param {string} token - Reset token from URL
 * @param {string} password - New password
 * @returns {Promise} - Promise resolving to success message
 */
const resetPassword = async (token, password) => {
  try {
    const response = await api.post(`/auth/reset-password/${token}`, {
      password,
    });
    return normalizeResponse(response);
  } catch (error) {
    console.error("Password reset error:", error);
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
    const response = await api.get(`/auth/verify-email/${verificationToken}`);
    return normalizeResponse(response);
  } catch (error) {
    console.error("Email verification error:", error);
    throw error;
  }
};

const authService = {
  login,
  register,
  getProfile,
  updateProfile,
  logoutUser,
  refreshToken,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
};

export default authService;
