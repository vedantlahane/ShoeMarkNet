const Review = require('../models/Review');
const Product = require('../models/Product');

// Get all reviews (Admin)
const getAllReviews = async (req, res) => {
  try {
    const { 
      product, 
      rating, 
      status,
      page = 1, 
      limit = 10 
    } = req.query;
    
    // Build filter
    const filter = {};
    if (product) filter.product = product;
    if (rating) filter.rating = Number(rating);
    if (status) filter.status = status;
    
    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    // Get reviews
    const reviews = await Review.find(filter)
      .populate('user', 'name email')
      .populate('product', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    // Get total count
    const total = await Review.countDocuments(filter);
    
    res.status(200).json({
      reviews,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
};

// Moderate review (Admin)
const moderateReview = async (req, res) => {
  try {
    const { status, adminComment } = req.body;
    const reviewId = req.params.reviewId;
    
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Update review
    review.status = status || review.status;
    review.adminComment = adminComment;
    review.moderatedAt = Date.now();
    review.moderatedBy = req.user.id;
    
    await review.save();
    
    // If review is approved or rejected, update product rating
    if (status === 'approved' || status === 'rejected') {
      const product = await Product.findById(review.product);
      
      if (product) {
        // Only count approved reviews for product rating
        const approvedReviews = await Review.find({ 
          product: review.product,
          status: 'approved'
        });
        
        if (approvedReviews.length > 0) {
          const totalRating = approvedReviews.reduce((sum, item) => sum + item.rating, 0);
          product.rating = totalRating / approvedReviews.length;
          product.numReviews = approvedReviews.length;
          await product.save();
        }
      }
    }
    
    res.status(200).json({ message: 'Review moderated successfully', review });
  } catch (error) {
    res.status(500).json({ message: 'Error moderating review', error: error.message });
  }
};

module.exports = {
  getAllReviews,
  moderateReview
};
