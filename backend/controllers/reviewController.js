const Review = require('../models/Review');
const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');

// @desc    Get all reviews with filters, sorting, and pagination (Admin)
// @route   GET /api/reviews
// @access  Private/Admin
const getAllReviews = asyncHandler(async (req, res) => {
  const { product, rating, status, page = 1, limit = 10 } = req.query;

  // Build a filter object based on query parameters
  const filter = {};
  if (product) filter.product = product;
  if (rating) filter.rating = Number(rating);
  if (status) filter.status = status;

  // Calculate pagination skip value
  const skip = (Number(page) - 1) * Number(limit);

  // Find reviews with the specified filters and pagination
  const reviews = await Review.find(filter)
    .populate('user', 'name email') // Populate user details
    .populate('product', 'name') // Populate product name
    .sort({ createdAt: -1 }) // Sort by newest first
    .skip(skip)
    .limit(Number(limit))
    .lean(); // Use lean() for faster read performance

  // Get the total count for pagination info
  const total = await Review.countDocuments(filter);

  res.json({
    reviews,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    }
  });
});

// @desc    Moderate a specific review (Admin)
// @route   PUT /api/reviews/:reviewId/moderate
// @access  Private/Admin
const moderateReview = asyncHandler(async (req, res) => {
  const { status, adminComment } = req.body;
  const reviewId = req.params.reviewId;

  const review = await Review.findById(reviewId);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  // Update the review's status and moderation details
  review.status = status || review.status;
  review.adminComment = adminComment || review.adminComment;
  review.moderatedAt = Date.now();
  review.moderatedBy = req.user.id;

  await review.save();

  res.json({ message: 'Review moderated successfully', review: review.toObject() });
});

// @desc    Get review statistics for admin dashboard
// @route   GET /api/reviews/admin/stats
// @access  Private/Admin
const getReviewStats = asyncHandler(async (req, res) => {
  const totalReviews = await Review.countDocuments();
  const pendingReviews = await Review.countDocuments({ status: 'pending' });
  const approvedReviews = await Review.countDocuments({ status: 'approved' });
  const rejectedReviews = await Review.countDocuments({ status: 'rejected' });
  
  const averageRating = await Review.aggregate([
    { $match: { status: 'approved' } },
    { $group: { _id: null, avgRating: { $avg: '$rating' } } }
  ]);

  // Recent reviews (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentReviews = await Review.countDocuments({ 
    createdAt: { $gte: thirtyDaysAgo } 
  });

  res.json({
    totalReviews,
    pendingReviews,
    approvedReviews,
    rejectedReviews,
    averageRating: averageRating.length > 0 ? averageRating[0].avgRating : 0,
    recentReviews
  });
});

module.exports = {
  getAllReviews,
  moderateReview,
  getReviewStats
};
