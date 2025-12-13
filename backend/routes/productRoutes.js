const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

// ====================================================================
// ========================= PUBLIC ROUTES ============================
// These routes are accessible to all users without authentication.
// ====================================================================

/**
 * @description Get a list of all products with optional filters, sorting, and pagination.
 * @route GET /api/products
 * @access Public
 */
router.get('/', getAllProducts);

/**
 * @description Get a list of featured products.
 * @route GET /api/products/featured
 * @access Public
 */
router.get('/featured', getFeaturedProducts);

/**
 * @description Get a list of the newest products.
 * @route GET /api/products/new-arrivals
 * @access Public
 */
router.get('/new-arrivals', getNewArrivals);

/**
 * @description Search for products using a text query.
 * @route GET /api/products/search
 * @access Public
 */
router.get('/search', searchProducts);

/**
 * @description Get a single product by its URL-friendly slug.
 * @route GET /api/products/slug/:slug
 * @access Public
 */
router.get('/slug/:slug', getProductBySlug);

/**
 * @description Get a single product by its database ID.
 * @route GET /api/products/:id
 * @access Public
 */
router.get('/:id', getProductById);

/**
 * @description Get a list of products related to a specific product (by category or brand).
 * @route GET /api/products/:id/related
 * @access Public
 */
router.get('/:id/related', getRelatedProducts);

/**
 * @description Get a list of reviews for a specific product.
 * @route GET /api/products/:id/reviews
 * @access Public
 */
router.get('/:id/reviews', getProductReviews);

/**
 * @description Check the availability and price of a product or product variant.
 * @route POST /api/products/check-availability
 * @access Public
 */
router.post('/check-availability', checkProductAvailability);

// ====================================================================
// ===================== PROTECTED USER ROUTES ========================
// These routes require a valid JWT from an authenticated user.
// ====================================================================

/**
 * @description Submit a new review for a product.
 * @route POST /api/products/:id/reviews
 * @access Private
 */
router.post('/:id/reviews', protect, createProductReview);

/**
 * @description Update an existing review. The user must be the review's owner.
 * @route PUT /api/products/:id/reviews/:reviewId
 * @access Private
 */
router.put('/:id/reviews/:reviewId', protect, updateProductReview);

/**
 * @description Delete a review. The user must be the review's owner or an admin.
 * @route DELETE /api/products/:id/reviews/:reviewId
 * @access Private
 */
router.delete('/:id/reviews/:reviewId', protect, deleteProductReview);

// ====================================================================
// ========================= ADMIN ROUTES =============================
// These routes require a valid JWT from a user with the 'admin' role.
// ====================================================================

/**
 * @description Create a new product.
 * @route POST /api/products
 * @access Private/Admin
 */
router.post('/', protect, admin, createProduct);

/**
 * @description Update an existing product by its ID.
 * @route PUT /api/products/:id
 * @access Private/Admin
 */
router.put('/:id', protect, admin, updateProduct);

/**
 * @description Delete an existing product by its ID.
 * @route DELETE /api/products/:id
 * @access Private/Admin
 */
router.delete('/:id', protect, admin, deleteProduct);

/**
 * @description Perform a bulk update on product prices.
 * @route POST /api/products/batch-update-prices
 * @access Private/Admin
 */
router.post('/batch-update-prices', protect, admin, batchUpdatePrices);

/**
 * @description Perform a bulk update on product stock levels.
 * @route POST /api/products/batch-update-stock
 * @access Private/Admin
 */
router.post('/batch-update-stock', protect, admin, batchUpdateStock);

/**
 * @description Perform a bulk update on multiple products.
 * @route POST /api/products/bulk-update
 * @access Private/Admin
 */
router.post('/bulk-update', protect, admin, bulkUpdateProducts);

module.exports = router;
