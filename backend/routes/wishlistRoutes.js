const express = require('express');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkProductInWishlist
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');
const {
  validateProductId,
  validateProductParam,
  handleValidationErrors
} = require('../middleware/validationMiddleware');

const router = express.Router();

// All routes in this router require authentication via a valid JWT
router.use(protect);

// ====================================================================
// ==================== PROTECTED USER ROUTES =========================
// These routes are accessible only to authenticated users.
// ====================================================================

/**
 * @description Get the authenticated user's wishlist, with support for pagination.
 * @route GET /api/wishlist
 * @access Private
 */
router.get('/', getWishlist);

/**
 * @description Add a product to the user's wishlist.
 * The `validateProductId` middleware ensures the request body has a valid product ID.
 * @route POST /api/wishlist
 * @access Private
 */
router.post('/', 
  validateProductId,
  handleValidationErrors,
  addToWishlist
);

/**
 * @description Remove a product from the user's wishlist.
 * The `validateProductParam` middleware checks the validity of the product ID in the URL.
 * @route DELETE /api/wishlist/:productId
 * @access Private
 */
router.delete('/:productId', 
  validateProductParam,
  handleValidationErrors,
  removeFromWishlist
);

/**
 * @description Clear all products from the user's wishlist.
 * @route DELETE /api/wishlist
 * @access Private
 */
router.delete('/', clearWishlist);

/**
 * @description Check if a specific product is in the user's wishlist.
 * The `validateProductParam` middleware checks the validity of the product ID in the URL.
 * @route GET /api/wishlist/contains/:productId
 * @access Private
 */
router.get('/check/:productId',
  validateProductParam,
  handleValidationErrors,
  checkProductInWishlist
);

module.exports = router;
