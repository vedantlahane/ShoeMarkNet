// controllers/reviewController.js
const Review = require('../models/Review');
const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews
// @access  Private/Admin
const getAllReviews = asyncHandler(async (req, res) => {
  const { product, rating, status, page = 1, limit = 10 } = req.query;

  const filter = {};
  if (product) filter.product = product;
  if (rating) filter.rating = Number(rating);
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);

  const reviews = await Review.find(filter)
    .populate('user', 'name email')
    .populate('product', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

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

// @desc    Moderate review (Admin)
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

  review.status = status || review.status;
  review.adminComment = adminComment || review.adminComment;
  review.moderatedAt = Date.now();
  review.moderatedBy = req.user.id;

  await review.save();

  if (status === 'approved' || status === 'rejected') {
    const product = await Product.findById(review.product);
    if (product) {
      const approvedReviews = await Review.find({ product: review.product, status: 'approved' });
      if (approvedReviews.length > 0) {
        const totalRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0);
        product.rating = totalRating / approvedReviews.length;
        product.numReviews = approvedReviews.length;
        await product.save();
      } else {
        product.rating = 0;
        product.numReviews = 0;
        await product.save();
      }
    }
  }

  res.json({ message: 'Review moderated successfully', review: review.toObject() });
});

module.exports = {
  getAllReviews,
  moderateReview
};
