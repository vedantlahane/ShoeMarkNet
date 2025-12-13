const express = require('express');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// The `protect` middleware is used here to secure all routes defined in this router.
// This ensures that only authenticated users can access and modify their cart.
router.use(protect);

/**
 * @description Get the authenticated user's cart.
 * @route GET /api/cart
 * @access Private
 */
router.get('/', getCart);

/**
 * @description Add a new item to the user's cart.
 * @route POST /api/cart
 * @access Private
 */
router.post('/', addToCart);

/**
 * @description Update the quantity of a specific item in the cart.
 * @route PUT /api/cart/:itemId
 * @access Private
 */
router.put('/:itemId', updateCartItem);

/**
 * @description Remove a specific item from the cart.
 * @route DELETE /api/cart/:itemId
 * @access Private
 */
router.delete('/:itemId', removeFromCart);

/**
 * @description Clear the entire cart for the user.
 * @route DELETE /api/cart
 * @access Private
 */
router.delete('/', clearCart);

module.exports = router;
