const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { updateLeadScore } = require('./leadScoreController');

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart) cart = { user: req.user.id, items: [], totalPrice: 0 };
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart', error: error.message });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, variant = {} } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.countInStock < quantity) {
      return res.status(400).json({ message: `Not enough stock. Available: ${product.countInStock}` });
    }
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) cart = new Cart({ user: req.user.id, items: [], totalPrice: 0 });
    await cart.addItem(productId, quantity, variant);
    await updateLeadScore(req.user.id, 'add_to_cart');
    const populatedCart = await Cart.findById(cart._id).populate('items.product');
    res.status(200).json({ message: 'Product added to cart', cart: populatedCart });
  } catch (error) {
    res.status(500).json({ message: 'Error adding to cart', error: error.message });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const itemId = req.params.itemId;
    if (quantity <= 0) return res.status(400).json({ message: 'Quantity must be greater than 0' });
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    await cart.updateQuantity(itemId, quantity);
    const populatedCart = await Cart.findById(cart._id).populate('items.product');
    res.status(200).json({ message: 'Cart updated', cart: populatedCart });
  } catch (error) {
    res.status(500).json({ message: 'Error updating cart', error: error.message });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    await cart.removeItem(itemId);
    const populatedCart = await Cart.findById(cart._id).populate('items.product');
    res.status(200).json({ message: 'Item removed from cart', cart: populatedCart });
  } catch (error) {
    res.status(500).json({ message: 'Error removing item from cart', error: error.message });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user.id });
    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing cart', error: error.message });
  }
};
