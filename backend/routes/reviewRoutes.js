const express = require('express');
const { getAllReviews, moderateReview, getReviewStats } = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// ====================================================================
// ========================= ADMIN ROUTES =============================
// These routes are for review management and require a valid JWT from
// a user with the 'admin' role.
// ====================================================================

/**
 * @description Get a list of all reviews, with options for filtering and pagination.
 * This is intended for the admin dashboard.
 * @route GET /api/reviews/admin
 * @access Private/Admin
 */
router.get('/admin', protect, admin, getAllReviews);

/**
 * @description Moderate a specific review by updating its status and adding an admin comment.
 * @route PUT /api/reviews/admin/:reviewId
 * @access Private/Admin
 */
router.put('/admin/:reviewId', protect, admin, moderateReview);

/**
 * @description Get review statistics for admin dashboard
 * @route GET /api/reviews/admin/stats
 * @access Private/Admin
 */
router.get('/admin/stats', protect, admin, getReviewStats);

module.exports = router;
