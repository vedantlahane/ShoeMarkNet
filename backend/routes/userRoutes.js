const express = require('express');
const {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  getAllUsers,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// ====================================================================
// ==================== PROTECTED USER ROUTES =========================
// These routes require a valid JWT to access.
// ====================================================================

/**
 * @description Get the profile of the currently authenticated user.
 * @route GET /api/users/profile
 * @access Private
 */
router.get('/profile', protect, getUserProfile);

/**
 * @description Update the profile of the currently authenticated user.
 * @route PUT /api/users/profile
 * @access Private
 */
router.put('/profile', protect, updateUserProfile);

/**
 * @description Change the password for the currently authenticated user.
 * @route PUT /api/users/password
 * @access Private
 */
router.put('/password', protect, changePassword);

// ====================================================================
// ==================== PROTECTED ADDRESS ROUTES ======================
// These routes manage the addresses for the authenticated user.
// ====================================================================

/**
 * @description Get all addresses for the authenticated user.
 * @route GET /api/users/addresses
 * @access Private
 */
router.get('/addresses', protect, getUserAddresses);

/**
 * @description Add a new address for the authenticated user.
 * @route POST /api/users/addresses
 * @access Private
 */
router.post('/addresses', protect, addUserAddress);

/**
 * @description Update a specific address belonging to the authenticated user.
 * @route PUT /api/users/addresses/:addressId
 * @access Private
 */
router.put('/addresses/:addressId', protect, updateUserAddress);

/**
 * @description Delete a specific address belonging to the authenticated user.
 * @route DELETE /api/users/addresses/:addressId
 * @access Private
 */
router.delete('/addresses/:addressId', protect, deleteUserAddress);

// ====================================================================
// ===================== PROTECTED ADMIN ROUTES =======================
// These routes require a valid JWT AND the user to have an 'admin' role.
// ====================================================================

/**
 * @description Get all users, with optional search and filtering (Admin only).
 * @route GET /api/users/admin
 * @access Private/Admin
 */
router.get('/admin', protect, admin, getAllUsers);

/**
 * @description Update a user's profile by their ID (Admin only).
 * @route PUT /api/users/admin/:userId
 * @access Private/Admin
 */
router.put('/admin/:userId', protect, admin, updateUser);

/**
 * @description Delete a user and their addresses by ID (Admin only).
 * @route DELETE /api/users/admin/:userId
 * @access Private/Admin
 */
router.delete('/admin/:userId', protect, admin, deleteUser);

module.exports = router;
