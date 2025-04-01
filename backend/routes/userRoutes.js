const express = require('express');
const { updateProfile, deleteUser } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Route to update user profile (protected)
router.put('/profile', authMiddleware, updateProfile);

// Route to delete user account (protected)
router.delete('/account', authMiddleware, deleteUser);

module.exports = router;
