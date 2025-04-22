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
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// User routes (protected)
router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, updateUserProfile);
router.put('/password', authMiddleware, changePassword);

// Address routes
router.get('/addresses', authMiddleware, getUserAddresses);
router.post('/addresses', authMiddleware, addUserAddress);
router.put('/addresses/:addressId', authMiddleware, updateUserAddress);
router.delete('/addresses/:addressId', authMiddleware, deleteUserAddress);

// Admin routes
router.get('/admin', authMiddleware, adminMiddleware, getAllUsers);
router.put('/admin/:userId', authMiddleware, adminMiddleware, updateUser);
router.delete('/admin/:userId', authMiddleware, adminMiddleware, deleteUser);

module.exports = router;
