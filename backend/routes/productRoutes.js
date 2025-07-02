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
  getProductReviews,
  createProductReview,
  updateProductReview,
  deleteProductReview,
  getRelatedProducts,
  searchProducts
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/search', searchProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProductById);
router.get('/:id/related', getRelatedProducts);
router.get('/:id/reviews', getProductReviews);
router.post('/check-availability', checkProductAvailability);

// Protected routes
router.post('/:id/reviews', protect, createProductReview);
router.put('/:id/reviews/:reviewId', protect, updateProductReview);
router.delete('/:id/reviews/:reviewId', protect, deleteProductReview);

// Admin routes
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.post('/batch-update-prices', protect, admin, batchUpdatePrices);
router.post('/batch-update-stock', protect, admin, batchUpdateStock);

module.exports = router;
