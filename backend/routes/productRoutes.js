const express = require('express');
const {
  createProduct,
  getAllProducts,
  getFeaturedProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  createProductReview,
  getProductReviews,
  updateProductReview,
  deleteProductReview
} = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProductById);
router.get('/:id/reviews', getProductReviews);

// Protected routes
router.post('/', authMiddleware, adminMiddleware, createProduct);
router.put('/:id', authMiddleware, adminMiddleware, updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, deleteProduct);

// Review routes
router.post('/:id/reviews', authMiddleware, createProductReview);
router.put('/:id/reviews/:reviewId', authMiddleware, updateProductReview);
router.delete('/:id/reviews/:reviewId', authMiddleware, deleteProductReview);

module.exports = router;
