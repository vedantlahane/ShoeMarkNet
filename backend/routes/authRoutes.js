const express = require('express');
const {
  register,
  login,
  getProfile,
  forgotPassword,
  resetPassword,
  verifyEmail,
  refreshToken
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.post('/refresh-token', refreshToken);

// Protected routes
router.get('/profile', authMiddleware, getProfile);

module.exports = router;
