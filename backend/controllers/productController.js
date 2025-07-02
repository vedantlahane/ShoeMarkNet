const Product = require('../models/Product');
const Review = require('../models/Review');
const Category = require('../models/Category');
const asyncHandler = require('express-async-handler');
const { updateLeadScore } = require('./leadScoreController');

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  // Remove empty category field if present
  if (req.body.category === '') {
    delete req.body.category;
  }
  
  const product = new Product(req.body);
  await product.save();
  
  // Update category product count if category exists
  if (product.category) {
    const category = await Category.findById(product.category);
    if (category) {
      await category.updateProductCount();
    }
  }
  
  res.status(201).json({ message: 'Product created successfully', product });
});

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
const getAllProducts = asyncHandler(async (req, res) => {
  const { 
    category, 
    brand, 
    search, 
    minPrice, 
    maxPrice, 
    sort, 
    page = 1, 
    limit = 10,
    gender,
    isFeatured,
    isNewArrival,
    inStock
  } = req.query;
  
  // Build filter object
  const filters = { isActive: true };
  
  if (category) filters.category = category;
  if (brand) filters.brand = brand;
  if (gender) filters.gender = gender;
  if (isFeatured === 'true') filters.isFeatured = true;
  if (isNewArrival === 'true') filters.isNewArrival = true;
  
  // Search across multiple fields
  if (search) {
    filters.$or = [
      { name: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
      { brand: new RegExp(search, 'i') }
    ];
  }
  
  // Price range filter
  if (minPrice || maxPrice) {
    filters.price = {};
    if (minPrice) filters.price.$gte = Number(minPrice);
    if (maxPrice) filters.price.$lte = Number(maxPrice);
  }
  
  // Stock filter
  if (inStock === 'true') {
    filters.countInStock = { $gt: 0 };
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
    .populate('category', 'name slug')
    .sort(sortOption)
    .skip(skip)
    .limit(Number(limit))
    .lean({ virtuals: true });
  
  // Get total count for pagination
  const total = await Product.countDocuments(filters);
  
  res.status(200).json({
    products,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      hasMore: Number(page) < Math.ceil(total / Number(limit))
    }
  });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const { limit = 8 } = req.query;
  
  const featuredProducts = await Product.find({ 
    isFeatured: true, 
    isActive: true 
  })
    .populate('category', 'name slug')
    .limit(Number(limit))
    .lean({ virtuals: true });
    
  res.status(200).json(featuredProducts);
});

// @desc    Get new arrivals
// @route   GET /api/products/new-arrivals
// @access  Public
const getNewArrivals = asyncHandler(async (req, res) => {
  const { limit = 8 } = req.query;
  
  const newArrivals = await Product.find({ 
    isNewArrival: true, 
    isActive: true 
  })
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .lean({ virtuals: true });
    
  res.status(200).json(newArrivals);
});

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name slug path')
    .lean({ virtuals: true });
    
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  // If user is authenticated, update lead score
  if (req.user) {
    updateLeadScore(req.user.id, 'view_product');
  }
  
  res.status(200).json(product);
});

// @desc    Get product by slug
// @route   GET /api/products/slug/:slug
// @access  Public
const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug })
    .populate('category', 'name slug path')
    .lean({ virtuals: true });
    
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  // If user is authenticated, update lead score
  if (req.user) {
    updateLeadScore(req.user.id, 'view_product');
  }
  
  res.status(200).json(product);
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id, 
    req.body, 
    { new: true, runValidators: true }
  );
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  res.status(200).json({ message: 'Product updated successfully', product });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  // Get category before deleting product
  const categoryId = product.category;
  
  // Delete product
  await Product.findByIdAndDelete(req.params.id);
  
  // Also delete all reviews for this product
  await Review.deleteMany({ product: req.params.id });
  
  // Update category product count
  if (categoryId) {
    const category = await Category.findById(categoryId);
    if (category) {
      await category.updateProductCount();
    }
  }
  
  res.status(200).json({ message: 'Product deleted successfully' });
});

// @desc    Check product availability
// @route   POST /api/products/check-availability
// @access  Public
const checkProductAvailability = asyncHandler(async (req, res) => {
  const { productId, variantId, sizeId, quantity = 1 } = req.body;
  
  const product = await Product.findById(productId);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  // For products with variants
  if (variantId && sizeId) {
    const variant = product.variants.id(variantId);
    if (!variant) {
      res.status(404);
      throw new Error('Variant not found');
    }
    
    const size = variant.sizes.find(s => s._id.toString() === sizeId);
    if (!size) {
      res.status(404);
      throw new Error('Size not found');
    }
    
    const isAvailable = size.countInStock >= quantity;
        return res.status(200).json({
      available: isAvailable,
      inStock: size.countInStock,
      requestedQuantity: quantity,
      price: size.price || product.price
    });
  }
  
  // For simple products
  const isAvailable = product.countInStock >= quantity;
  
  res.status(200).json({
    available: isAvailable,
    inStock: product.countInStock,
    requestedQuantity: quantity,
    price: product.price
  });
});

// @desc    Batch update product prices
// @route   POST /api/products/batch-update-prices
// @access  Private/Admin
const batchUpdatePrices = asyncHandler(async (req, res) => {
  const { updates } = req.body; // Array of { productId, price, originalPrice? }
  
  if (!Array.isArray(updates) || updates.length === 0) {
    res.status(400);
    throw new Error('Invalid updates array');
  }
  
  const bulkOps = updates.map(update => {
    const updateData = { price: update.price };
    if (update.originalPrice) {
      updateData.originalPrice = update.originalPrice;
    }
    if (update.discountPercentage !== undefined) {
      updateData.discountPercentage = update.discountPercentage;
    }
    
    return {
      updateOne: {
        filter: { _id: update.productId },
        update: { $set: updateData }
      }
    };
  });
  
  const result = await Product.bulkWrite(bulkOps);
  
  res.status(200).json({ 
    message: 'Prices updated successfully',
    modifiedCount: result.modifiedCount,
    matchedCount: result.matchedCount
  });
});

// @desc    Batch update product stock
// @route   POST /api/products/batch-update-stock
// @access  Private/Admin
const batchUpdateStock = asyncHandler(async (req, res) => {
  const { updates } = req.body; // Array of { productId, countInStock }
  
  if (!Array.isArray(updates) || updates.length === 0) {
    res.status(400);
    throw new Error('Invalid updates array');
  }
  
  const bulkOps = updates.map(update => ({
    updateOne: {
      filter: { _id: update.productId },
      update: { $set: { countInStock: update.countInStock } }
    }
  }));
  
  const result = await Product.bulkWrite(bulkOps);
  
  res.status(200).json({ 
    message: 'Stock updated successfully',
    modifiedCount: result.modifiedCount,
    matchedCount: result.matchedCount
  });
});

// @desc    Get product reviews
// @route   GET /api/products/:id/reviews
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
  
  const skip = (Number(page) - 1) * Number(limit);
  
  const reviews = await Review.find({ product: req.params.id })
    .populate('user', 'name')
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));
  
  const total = await Review.countDocuments({ product: req.params.id });
  
  res.status(200).json({
    reviews,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    }
  });
});

// @desc    Create product review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  
  // Validate rating
  if (!rating || rating < 1 || rating > 5) {
    res.status(400);
    throw new Error('Please provide a rating between 1 and 5');
  }
  
  // Check if product exists
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  // Check if user already reviewed this product
  const alreadyReviewed = await Review.findOne({ 
    user: req.user.id, 
    product: req.params.id 
  });
  
  if (alreadyReviewed) {
    res.status(400);
    throw new Error('You have already reviewed this product');
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
  
  // Update lead score
  if (req.user) {
    updateLeadScore(req.user.id, 'add_review');
  }
  
  res.status(201).json({ message: 'Review added successfully', review });
});

// @desc    Update product review
// @route   PUT /api/products/:id/reviews/:reviewId
// @access  Private
const updateProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  
  // Validate rating if provided
  if (rating && (rating < 1 || rating > 5)) {
    res.status(400);
    throw new Error('Please provide a rating between 1 and 5');
  }
  
  // Find the review
  const review = await Review.findById(req.params.reviewId);
  
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }
  
  // Check if the review belongs to the user
  if (review.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to update this review');
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
});

// @desc    Delete product review
// @route   DELETE /api/products/:id/reviews/:reviewId
// @access  Private
const deleteProductReview = asyncHandler(async (req, res) => {
  // Find the review
  const review = await Review.findById(req.params.reviewId);
  
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }
  
  // Check if the review belongs to the user or user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this review');
  }
  
  await Review.findByIdAndDelete(req.params.reviewId);
  
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
});

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
const getRelatedProducts = asyncHandler(async (req, res) => {
  const { limit = 4 } = req.query;
  
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  // Find products in the same category, excluding current product
  const relatedProducts = await Product.find({
    _id: { $ne: req.params.id },
    category: product.category,
    isActive: true
  })
    .populate('category', 'name slug')
    .limit(Number(limit))
    .lean({ virtuals: true });
  
  // If not enough products in same category, add products from same brand
  if (relatedProducts.length < limit) {
    const brandProducts = await Product.find({
      _id: { 
        $ne: req.params.id,
        $nin: relatedProducts.map(p => p._id)
      },
      brand: product.brand,
      isActive: true
    })
      .populate('category', 'name slug')
      .limit(Number(limit) - relatedProducts.length)
      .lean({ virtuals: true });
    
    relatedProducts.push(...brandProducts);
  }
  
  res.status(200).json(relatedProducts);
});

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
const searchProducts = asyncHandler(async (req, res) => {
  const { q, limit = 10 } = req.query;
  
  if (!q || q.trim().length === 0) {
    res.status(400);
    throw new Error('Search query is required');
  }
  
  // Use text search if text index is available
  const products = await Product.find(
    { 
      $text: { $search: q },
      isActive: true 
    },
    { score: { $meta: "textScore" } }
  )
    .sort({ score: { $meta: "textScore" } })
    .populate('category', 'name slug')
    .limit(Number(limit))
    .lean({ virtuals: true });
  
  res.status(200).json(products);
});

module.exports = {
  createProduct,
  getAllProducts,
  getFeaturedProducts,
  getNewArrivals,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  checkProductAvailability,
  batchUpdatePrices,
  batchUpdateStock,
  getProductReviews,
  createProductReview,
  updateProductReview,
  deleteProductReview,
  getRelatedProducts,
  searchProducts
};