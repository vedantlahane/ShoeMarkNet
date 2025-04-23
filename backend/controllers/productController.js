const Product = require('../models/Product');
const Review = require('../models/Review');
const { updateLeadScore } = require('./leadScoreController');

// Create a new product (Admin)
// In your createProduct controller
const createProduct = async (req, res) => {
  try {
    // Remove empty category field if present
    if (req.body.category === '') {
      delete req.body.category;
    }
    
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
};


// Get all products with optional filters
const getAllProducts = async (req, res) => {
  try {
    const { 
      category, 
      brand, 
      search, 
      minPrice, 
      maxPrice, 
      sort, 
      page = 1, 
      limit = 10 
    } = req.query;
    
    // Build filter object
    const filters = {};
    if (category) filters.category = category;
    if (brand) filters.brand = brand;
    if (search) filters.name = new RegExp(search, 'i');
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = Number(minPrice);
      if (maxPrice) filters.price.$lte = Number(maxPrice);
    }
    
    // Build sort object
    let sortOption = {};
    if (sort) {
      const [field, order] = sort.split(':');
      sortOption[field] = order === 'desc' ? -1 : 1;
    } else {
      sortOption = { createdAt: -1 }; // Default sort by newest
    }
    
    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    // Execute query
    const products = await Product.find(filters)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));
    
    // Get total count for pagination
    const total = await Product.countDocuments(filters);
    
    res.status(200).json({
      products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

// Get featured products
const getFeaturedProducts = async (req, res) => {
  try {
    const featuredProducts = await Product.find({ isFeatured: true }).limit(8);
    res.status(200).json(featuredProducts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching featured products', error: error.message });
  }
};

// Get a single product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    // If user is authenticated, update lead score
    if (req.user) {
      updateLeadScore(req.user.id, 'view_product');
    }
    
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
};

// Update a product (Admin)
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    res.status(200).json({ message: 'Product updated successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

// Delete a product (Admin)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    // Also delete all reviews for this product
    await Review.deleteMany({ product: req.params.id });
    
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};

// Get product reviews
const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.id })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
};

// Create product review
const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    // Check if product exists
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    // Check if user already reviewed this product
    const alreadyReviewed = await Review.findOne({ 
      user: req.user.id, 
      product: req.params.id 
    });
    
    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }
    
    // Create review
    const review = new Review({
      user: req.user.id,
      product: req.params.id,
      rating: Number(rating),
      comment
    });
    
    await review.save();
    
    // Update product rating
    const allReviews = await Review.find({ product: req.params.id });
    const totalRating = allReviews.reduce((sum, item) => sum + item.rating, 0);
    
    product.rating = totalRating / allReviews.length;
    product.numReviews = allReviews.length;
    
    await product.save();
    
    res.status(201).json({ message: 'Review added successfully', review });
  } catch (error) {
    res.status(500).json({ message: 'Error creating review', error: error.message });
  }
};

// Update product review
const updateProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    // Find the review
    const review = await Review.findById(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if the review belongs to the user
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }
    
    // Update review
    review.rating = Number(rating) || review.rating;
    review.comment = comment || review.comment;
    
    await review.save();
    
    // Update product rating
    const product = await Product.findById(req.params.id);
    const allReviews = await Review.find({ product: req.params.id });
    const totalRating = allReviews.reduce((sum, item) => sum + item.rating, 0);
    
    product.rating = totalRating / allReviews.length;
    
    await product.save();
    
    res.status(200).json({ message: 'Review updated successfully', review });
  } catch (error) {
    res.status(500).json({ message: 'Error updating review', error: error.message });
  }
};

// Delete product review
const deleteProductReview = async (req, res) => {
  try {
    // Find the review
    const review = await Review.findById(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if the review belongs to the user or user is admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }
    
    await review.remove();
    
    // Update product rating
    const product = await Product.findById(req.params.id);
    const allReviews = await Review.find({ product: req.params.id });
    
    if (allReviews.length > 0) {
      const totalRating = allReviews.reduce((sum, item) => sum + item.rating, 0);
      product.rating = totalRating / allReviews.length;
      product.numReviews = allReviews.length;
    } else {
      product.rating = 0;
      product.numReviews = 0;
    }
    
    await product.save();
    
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getFeaturedProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductReviews,
  createProductReview,
  updateProductReview,
  deleteProductReview
};
