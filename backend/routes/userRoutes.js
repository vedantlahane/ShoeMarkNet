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
const {protect ,admin } = require('../middleware/authMiddleware');

const router = express.Router();

// User routes (protected)
router.get('/profile',protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/password', protect ,changePassword);

// Address routes
router.get('/addresses', protect, getUserAddresses);
router.post('/addresses', protect  , addUserAddress);
router.put('/addresses/:addressId', protect,updateUserAddress);
router.delete('/addresses/:addressId',protect, deleteUserAddress);

// Admin routes
router.get('/admin',protect, admin,  getAllUsers);
router.put('/admin/:userId', protect, admin,  updateUser);
router.delete('/admin/:userId',protect, admin,  deleteUser);

module.exports = router;
