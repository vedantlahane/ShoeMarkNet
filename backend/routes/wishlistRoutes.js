const express = require('express');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkProductInWishlist
} = require('../controllers/wishlistController');
const authMiddleware = require('../middleware/authMiddleware');
const {
  validateProductId,
  validateProductParam,
  handleValidationErrors
} = require('../middleware/validation');

const router = express.Router();

// All wishlist routes require authentication
router.use(authMiddleware);

// Get wishlist with pagination
router.get('/', getWishlist);

// Add product to wishlist
router.post('/', 
  validateProductId,
  handleValidationErrors,
  addToWishlist
);

// Remove product from wishlist
router.delete('/:productId', 
  validateProductParam,
  handleValidationErrors,
  removeFromWishlist
);

// Clear entire wishlist
router.delete('/', clearWishlist);

// Check if product is in wishlist
router.get('/check/:productId',
  validateProductParam,
  handleValidationErrors,
  checkProductInWishlist
);

module.exports = router;