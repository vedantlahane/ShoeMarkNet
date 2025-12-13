const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { updateLeadScore } = require('./leadScoreController');
const asyncHandler = require('express-async-handler');

/**
 * @description Get the cart for the authenticated user.
 * @route GET /api/cart
 * @access Private
 */
exports.getCart = asyncHandler(async (req, res) => {
  // Find the cart by the user's ID and populate the product details for each item
  const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

  // If no cart is found, return a new, empty cart object.
  // We do not save it to the database yet, as it's empty.
  if (!cart) {
    return res.status(200).json({ user: req.user.id, items: [], totalPrice: 0 });
  }

  res.status(200).json(cart);
});

/**
 * @description Add an item to the user's cart.
 * @route POST /api/cart
 * @access Private
 */
exports.addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, variant = {} } = req.body;

  // First, find the product to check if it exists and has enough stock
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  if (!product.isActive) {
    res.status(400);
    throw new Error('Product is not available for purchase');
  }

  // Find the user's existing cart or create a new one if it doesn't exist
  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    cart = new Cart({ user: req.user.id, items: [] });
  }

  // Use the addItem method defined in the Cart schema to add or update the item
  await cart.addItem(productId, quantity, variant);

  // Update the user's lead score for adding an item to the cart
  if (req.user && req.user.id) {
    await updateLeadScore(req.user.id, 'add_to_cart');
  }

  // Populate the cart again to include product details in the response
  const populatedCart = await Cart.findById(cart._id)
    .populate('items.product', 'name price images countInStock rating slug');
  res.status(200).json({ message: 'Product added to cart', cart: populatedCart });
});

/**
 * @description Update the quantity of a specific item in the cart.
 * @route PUT /api/cart/:itemId
 * @access Private
 */
exports.updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const itemId = req.params.itemId;

  if (quantity <= 0) {
    res.status(400);
    throw new Error('Quantity must be greater than 0');
  }

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  // Use the updateQuantity method from the schema to handle the update
  await cart.updateQuantity(itemId, quantity);

  // Populate the cart again to include product details in the response
  const populatedCart = await Cart.findById(cart._id)
    .populate('items.product', 'name price images countInStock rating slug');
  res.status(200).json({ message: 'Cart updated', cart: populatedCart });
});

/**
 * @description Remove a specific item from the cart.
 * @route DELETE /api/cart/:itemId
 * @access Private
 */
exports.removeFromCart = asyncHandler(async (req, res) => {
  const itemId = req.params.itemId;
  
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  // Use the removeItem method from the schema to remove the item
  await cart.removeItem(itemId);
  
  // Populate the cart again to include product details in the response
  const populatedCart = await Cart.findById(cart._id)
    .populate('items.product', 'name price images countInStock rating slug');
  res.status(200).json({ message: 'Item removed from cart', cart: populatedCart });
});

/**
 * @description Clear the user's cart by deleting the cart document.
 * @route DELETE /api/cart
 * @access Private
 */
exports.clearCart = asyncHandler(async (req, res) => {
  // Find and delete the user's cart document
  await Cart.findOneAndDelete({ user: req.user.id });
  res.status(200).json({ message: 'Cart cleared successfully' });
});
