const Product = require('../models/Product');
const Review = require('../models/Review');
const Category = require('../models/Category');
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const { updateLeadScore } = require('./leadScoreController');

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const sanitizeProductPayload = (payload = {}) => {
  const sanitized = { ...payload };

  // Normalize empty or placeholder category values
  if (!sanitized.category || sanitized.category === 'null' || sanitized.category === 'undefined') {
    delete sanitized.category;
  }

  // Convert numeric fields
  const numericFields = [
    'price',
    'originalPrice',
    'discountPercentage',
    'countInStock',
    'weight'
  ];

  numericFields.forEach((field) => {
    if (sanitized[field] === '' || sanitized[field] === null || typeof sanitized[field] === 'undefined') {
      delete sanitized[field];
      return;
    }

    const value = Number(sanitized[field]);
    if (Number.isNaN(value)) {
      delete sanitized[field];
      return;
    }

    sanitized[field] = value;
  });

  if (sanitized.dimensions && typeof sanitized.dimensions === 'object') {
    const dimensionKeys = ['length', 'width', 'height'];
    const cleanedDimensions = {};

    dimensionKeys.forEach((key) => {
      const raw = sanitized.dimensions[key];
      if (raw === '' || raw === null || typeof raw === 'undefined') {
        return;
      }

      const value = Number(raw);
      if (!Number.isNaN(value)) {
        cleanedDimensions[key] = value;
      }
    });

    if (Object.keys(cleanedDimensions).length > 0) {
      sanitized.dimensions = cleanedDimensions;
    } else {
      delete sanitized.dimensions;
    }
  }

  if (Array.isArray(sanitized.images)) {
    sanitized.images = sanitized.images.filter(Boolean);
    if (sanitized.images.length === 0) {
      delete sanitized.images;
    }
  }

  if (Array.isArray(sanitized.metaKeywords)) {
    sanitized.metaKeywords = sanitized.metaKeywords.filter(Boolean);
  }

  if (sanitized.specifications && typeof sanitized.specifications === 'object' && !Array.isArray(sanitized.specifications)) {
    const cleanedSpecs = {};
    Object.entries(sanitized.specifications).forEach(([key, value]) => {
      if (value === null || typeof value === 'undefined') return;
      const stringValue = String(value).trim();
      if (stringValue) {
        cleanedSpecs[key] = stringValue;
      }
    });

    sanitized.specifications = cleanedSpecs;
  }

  if (Array.isArray(sanitized.variants)) {
    sanitized.variants = sanitized.variants
      .map((variant) => {
        if (!variant || typeof variant !== 'object') return null;

        const cleanedVariant = { ...variant };

        if (Array.isArray(cleanedVariant.images)) {
          cleanedVariant.images = cleanedVariant.images.filter(Boolean);
        }

        if (Array.isArray(cleanedVariant.sizes)) {
          cleanedVariant.sizes = cleanedVariant.sizes
            .map((size) => {
              if (!size || typeof size !== 'object') return null;
              const cleanedSize = { ...size };

              if (cleanedSize.countInStock !== undefined) {
                const count = Number(cleanedSize.countInStock);
                cleanedSize.countInStock = Number.isNaN(count) ? 0 : count;
              }

              if (cleanedSize.price !== undefined) {
                const price = Number(cleanedSize.price);
                cleanedSize.price = Number.isNaN(price) ? 0 : price;
              }

              cleanedSize.size = typeof cleanedSize.size === 'string' ? cleanedSize.size.trim() : cleanedSize.size;

              return cleanedSize;
            })
            .filter(Boolean);
        }

        return cleanedVariant;
      })
      .filter(Boolean);

    if (sanitized.variants.length === 0) {
      delete sanitized.variants;
    }
  }

  return sanitized;
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  // Remove the category field if it's an empty string to avoid validation errors
  if (req.body.category === '') {
    delete req.body.category;
  }
  
  const product = new Product(req.body);
  await product.save();
  
  // If a category was assigned, update the product count on the Category model
  if (product.category) {
    const category = await Category.findById(product.category);
    if (category) {
      await category.updateProductCount();
    }
  }
  
  res.status(201).json({ message: 'Product created successfully', product });
});

// @desc    Get all products with filters, sorting, and pagination
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
  } = req.query;//
  
  // Build a filter object for the MongoDB query
  const filters = { isActive: true };
  
  // Handle category filtering - support both ObjectId and category name
  if (category) {
    // Check if category is a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(category)) {
      filters.category = category;
    } else {
      // If not ObjectId, support slug or name lookup for user-facing URLs
      const normalizedCategory = String(category).trim();
      const categoryDoc = await Category.findOne({
        $or: [
          { slug: normalizedCategory.toLowerCase() },
          { name: new RegExp(`^${escapeRegex(normalizedCategory)}$`, 'i') }
        ]
      });
      if (categoryDoc) {
        filters.category = categoryDoc._id;
      } else {
        // If category name not found, return empty results
        const parsedPage = Number(page);
        const pageNumber = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
        const pageSizeValue = Number(limit);
        const safePageSize = Number.isFinite(pageSizeValue) && pageSizeValue > 0 ? pageSizeValue : 10;

        return res.status(200).json({
          products: [],
          totalProducts: 0,
          pagination: {
            total: 0,
            totalPages: 0,
            page: pageNumber,
            limit: safePageSize,
            hasMore: false
          }
        });
      }
    }
  }
  if (brand) {
    const brandValues = (Array.isArray(brand) ? brand : String(brand).split(','))
      .map((value) => value.trim())
      .filter(Boolean);

    if (brandValues.length === 1) {
      filters.brand = new RegExp(`^${escapeRegex(brandValues[0])}$`, 'i');
    } else if (brandValues.length > 1) {
      filters.brand = { $in: brandValues.map((value) => new RegExp(`^${escapeRegex(value)}$`, 'i')) };
    }
  }
  if (gender) filters.gender = gender;
  if (isFeatured === 'true') filters.isFeatured = true;
  if (isNewArrival === 'true') filters.isNewArrival = true;
  
  // Create a case-insensitive search query across multiple fields
  if (search) {
    filters.$or = [
      { name: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
      { brand: new RegExp(search, 'i') }
    ];
  }
  
  // Add a price range filter
  if (minPrice || maxPrice) {
    filters.price = {};
    if (minPrice) filters.price.$gte = Number(minPrice);
    if (maxPrice) filters.price.$lte = Number(maxPrice);
  }
  
  // Filter for products that are in stock
  if (inStock === 'true') {
    filters.countInStock = { $gt: 0 };
  }
  
  // Build a sort object based on the query parameter
  let sortOption = {};
  if (sort) {
    const [field, order] = sort.split(':');
    sortOption[field] = order === 'desc' ? -1 : 1;
  } else {
    sortOption = { createdAt: -1 }; // Default sort by newest
  }
  
  // Calculate pagination values
  const parsedPage = Number(page);
  const pageNumber = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const pageSizeValue = Number(limit);
  const safePageSize = Number.isFinite(pageSizeValue) && pageSizeValue > 0 ? pageSizeValue : 10;
  const skip = (pageNumber - 1) * safePageSize;

  // Execute the main query with filters, sorting, and pagination
  const products = await Product.find(filters)
    .sort(sortOption)
    .skip(skip)
    .limit(safePageSize)
    .lean({ virtuals: true });
  
  // Get the total count of documents matching the filters for pagination info
  const total = await Product.countDocuments(filters);
  const totalPages = total > 0 ? Math.ceil(total / safePageSize) : 0;

  res.status(200).json({
    products,
    totalProducts: total,
    pagination: {
      total,
      totalPages,
      page: pageNumber,
      limit: safePageSize,
      hasMore: pageNumber < totalPages
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
  
  // If a user is authenticated, update their lead score
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
  
  // If a user is authenticated, update their lead score
  if (req.user) {
    updateLeadScore(req.user.id, 'view_product');
  }
  
  res.status(200).json(product);
});

// @desc    Update a product by ID
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  // Prevent casting errors when the category dropdown sends an empty string
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    const sanitizedPayload = sanitizeProductPayload(req.body);
    product.set(sanitizedPayload);
    await product.save();

    res.status(200).json({ message: 'Product updated successfully', product });
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      res.status(400);
      throw new Error(error.message);
    }

    throw error;
  }
});

// @desc    Delete a product by ID
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  // Store category ID before deletion to update the category count later
  const categoryId = product.category;
  
  // Delete the product document
  await Product.findByIdAndDelete(req.params.id);
  
  // Also delete all associated reviews
  await Review.deleteMany({ product: req.params.id });
  
  // Update the category's product count
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
  
  // Handle products with variants (colors, sizes)
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
  
  // Handle simple products without variants
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
  const { updates } = req.body; // Expects an array of { productId, price, originalPrice? }
  
  if (!Array.isArray(updates) || updates.length === 0) {
    res.status(400);
    throw new Error('Invalid updates array');
  }
  
  // Create an array of bulk operations for efficient database updates
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
  const { updates } = req.body; // Expects an array of { productId, countInStock }
  
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

// @desc    Bulk update products
// @route   POST /api/products/bulk-update
// @access  Private/Admin
const bulkUpdateProducts = asyncHandler(async (req, res) => {
  const { productIds, updates } = req.body; // Expects { productIds: [], updates: {} }
  
  if (!Array.isArray(productIds) || productIds.length === 0) {
    res.status(400);
    throw new Error('Invalid productIds array');
  }
  
  if (!updates || typeof updates !== 'object' || Object.keys(updates).length === 0) {
    res.status(400);
    throw new Error('Invalid updates object');
  }
  
  const bulkOps = productIds.map(productId => ({
    updateOne: {
      filter: { _id: productId },
      update: { $set: updates }
    }
  }));
  
  const result = await Product.bulkWrite(bulkOps);
  
  res.status(200).json({ 
    message: 'Products updated successfully',
    modifiedCount: result.modifiedCount,
    matchedCount: result.matchedCount
  });
});

// @desc    Get product reviews with pagination
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

// @desc    Create a new product review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  
  // Validate the provided rating
  if (!rating || rating < 1 || rating > 5) {
    res.status(400);
    throw new Error('Please provide a rating between 1 and 5');
  }
  
  // Check if the product exists
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  // Check if the user has already reviewed this product
  const alreadyReviewed = await Review.findOne({ 
    user: req.user.id, 
    product: req.params.id 
  });
  
  if (alreadyReviewed) {
    res.status(400);
    throw new Error('You have already reviewed this product');
  }
  
  // Create and save the new review
  const review = new Review({
    user: req.user.id,
    product: req.params.id,
    rating: Number(rating),
    comment
  });
  
  await review.save();
  
  // Recalculate the product's average rating and number of reviews
  const allReviews = await Review.find({ product: req.params.id });
  const totalRating = allReviews.reduce((sum, item) => sum + item.rating, 0);
  
  product.rating = totalRating / allReviews.length;
  product.numReviews = allReviews.length;
  
  await product.save();
  
  // Update the user's lead score
  if (req.user) {
    updateLeadScore(req.user.id, 'add_review');
  }
  
  res.status(201).json({ message: 'Review added successfully', review });
});

// @desc    Update a product review
// @route   PUT /api/products/:id/reviews/:reviewId
// @access  Private
const updateProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  
  // Validate rating if provided
  if (rating && (rating < 1 || rating > 5)) {
    res.status(400);
    throw new Error('Please provide a rating between 1 and 5');
  }
  
  const review = await Review.findById(req.params.reviewId);
  
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }
  
  // Ensure the authenticated user is the owner of the review
  if (review.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to update this review');
  }
  
  // Update the review fields
  review.rating = Number(rating) || review.rating;
  review.comment = comment || review.comment;
  
  await review.save();
  
  // Recalculate the product's average rating
  const product = await Product.findById(req.params.id);
  const allReviews = await Review.find({ product: req.params.id });
  const totalRating = allReviews.reduce((sum, item) => sum + item.rating, 0);
  
  product.rating = totalRating / allReviews.length;
  
  await product.save();
  
  res.status(200).json({ message: 'Review updated successfully', review });
});

// @desc    Delete a product review
// @route   DELETE /api/products/:id/reviews/:reviewId
// @access  Private
const deleteProductReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.reviewId);
  
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }
  
  // Ensure the user is either the review owner or an admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this review');
  }
  
  await Review.findByIdAndDelete(req.params.reviewId);
  
  // Recalculate the product's average rating and number of reviews
  const product = await Product.findById(req.params.id);
  const allReviews = await Review.find({ product: req.params.id });
  
  if (allReviews.length > 0) {
    const totalRating = allReviews.reduce((sum, item) => sum + item.rating, 0);
    product.rating = totalRating / allReviews.length;
    product.numReviews = allReviews.length;
  } else {
    // If no reviews are left, reset rating and review count
    product.rating = 0;
    product.numReviews = 0;
  }
  
  await product.save();
  
  res.status(200).json({ message: 'Review deleted successfully' });
});

// @desc    Get related products based on category and brand
// @route   GET /api/products/:id/related
// @access  Public
const getRelatedProducts = asyncHandler(async (req, res) => {
  const { limit = 4 } = req.query;
  
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  // Find products in the same category, excluding the current product
  const relatedProducts = await Product.find({
    _id: { $ne: req.params.id },
    category: product.category,
    isActive: true
  })
    .populate('category', 'name slug')
    .limit(Number(limit))
    .lean({ virtuals: true });
  
  // If we don't have enough related products, add more from the same brand
  if (relatedProducts.length < limit) {
    const brandProducts = await Product.find({
      _id: { 
        $ne: req.params.id,
        $nin: relatedProducts.map(p => p._id) // Avoid duplicates
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

// @desc    Search products using a text index
// @route   GET /api/products/search
// @access  Public
const searchProducts = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  const rawQuery = req.query.q ?? req.query.search;
  
  if (!rawQuery || rawQuery.trim().length === 0) {
    res.status(400);
    throw new Error('Search query is required');
  }
  const q = rawQuery.trim();
  
  // Use MongoDB's text search feature, which requires a text index on the schema
  const products = await Product.find(
    { 
      $text: { $search: q },
      isActive: true 
    },
    { score: { $meta: "textScore" } } // Include a textScore for sorting relevance
  )
    .sort({ score: { $meta: "textScore" } }) // Sort by the relevance score
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
  bulkUpdateProducts,
  getProductReviews,
  createProductReview,
  updateProductReview,
  deleteProductReview,
  getRelatedProducts,
  searchProducts
};
