const express = require('express');
const { getAllReviews, moderateReview } = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// Admin routes for review management
router.get('/admin', authMiddleware, adminMiddleware, getAllReviews);
router.put('/admin/:reviewId', authMiddleware, adminMiddleware, moderateReview);

module.exports = router;
