const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  verifyEmail,
  refreshToken,
  logout
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// ====================================================================
// ========================= PUBLIC ROUTES ============================
// These routes are accessible without any authentication token.
// ====================================================================

/**
 * @description Register a new user.
 * @route POST /api/auth/register
 * @access Public
 */
router.post('/register', register);

/**
 * @description Authenticate a user and return a JWT token.
 * @route POST /api/auth/login
 * @access Public
 */
router.post('/login', login);

/**
 * @description Request a password reset link to be sent to a user's email.
 * @route POST /api/auth/forgot-password
 * @access Public
 */
router.post('/forgot-password', forgotPassword);

/**
 * @description Reset a user's password using a valid reset token.
 * @route POST /api/auth/reset-password/:token
 * @access Public
 */
router.post('/reset-password/:token', resetPassword);

/**
 * @description Verify a user's email address using a verification token.
 * @route GET /api/auth/verify-email/:token
 * @access Public
 */
router.get('/verify-email/:token', verifyEmail);

/**
 * @description Refresh an expired access token with a refresh token.
 * @route POST /api/auth/refresh-token
 * @access Public
 */
router.post('/refresh-token', refreshToken);

// ====================================================================
// ==================== PROTECTED USER ROUTES =========================
// These routes require a valid JWT to access.
// ====================================================================

/**
 * @description Log out the currently authenticated user by invalidating the token.
 * @route POST /api/auth/logout
 * @access Private
 */
router.post('/logout', protect, logout);

/**
 * @description Get the profile of the currently authenticated user.
 * This route should be protected.
 * @route GET /api/auth/profile
 * @access Private
 */
router.get('/profile', protect, getProfile);

/**
 * @description Update the profile of the currently authenticated user.
 * @route PUT /api/auth/profile
 * @access Private
 */
router.put('/profile', protect, updateProfile);

module.exports = router;
