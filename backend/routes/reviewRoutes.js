const express = require('express');
const { getAllReviews, moderateReview } = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Admin routes for review management
router.get('/admin', authMiddleware.protect, authMiddleware.admin, getAllReviews);
router.put('/admin/:reviewId', authMiddleware.protect, authMiddleware.admin, moderateReview);

module.exports = router;
