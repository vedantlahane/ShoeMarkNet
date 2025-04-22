const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { updateLeadScore } = require('./leadScoreController');

// Get user's cart
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    
    if (!cart) {
      cart = { user: req.user.id, items: [], totalPrice: 0 };
    }
    
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart', error: error.message });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if product is in stock
    if (product.countInStock < quantity) {
      return res.status(400).json({ 
        message: `Not enough stock. Available: ${product.countInStock}` 
      });
    }
    
    // Find user's cart or create new one
    let cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      cart = new Cart({
        user: req.user.id,
        items: [],
        totalPrice: 0
      });
    }
    
    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );
    
    if (existingItemIndex > -1) {
      // Update quantity if product already in cart
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      cart.items.push({
        product: productId,
        quantity
      });
    }
    
    // Recalculate total price
    cart.totalPrice = cart.items.reduce((total, item) => {
      return total + (product.price * item.quantity);
    }, 0);
    
    await cart.save();
    
    // Update lead score
    updateLeadScore(req.user.id, 'add_to_cart');
    
    // Return populated cart
    const populatedCart = await Cart.findById(cart._id).populate('items.product');
    
    res.status(200).json({ message: 'Product added to cart', cart: populatedCart });
  } catch (error) {
    res.status(500).json({ message: 'Error adding to cart', error: error.message });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const itemId = req.params.itemId;
    
    // Validate quantity
    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than 0' });
    }
    
    // Find user's cart
    const cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    // Find the item in the cart
    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    // Get product to check stock and update price
    const product = await Product.findById(cart.items[itemIndex].product);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if product is in stock
    if (product.countInStock < quantity) {
      return res.status(400).json({ 
        message: `Not enough stock. Available: ${product.countInStock}` 
      });
    }
    
    // Update quantity
    cart.items[itemIndex].quantity = quantity;
    
    // Recalculate total price
    cart.totalPrice = cart.items.reduce((total, item) => {
      return total + (product.price * item.quantity);
    }, 0);
    
    await cart.save();
    
    // Return populated cart
    const populatedCart = await Cart.findById(cart._id).populate('items.product');
    
    res.status(200).json({ message: 'Cart updated', cart: populatedCart });
  } catch (error) {
    res.status(500).json({ message: 'Error updating cart', error: error.message });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    
    // Find user's cart
    const cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    // Find the item in the cart
    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    // Remove the item
    cart.items.splice(itemIndex, 1);
    
    // Recalculate total price
    cart.totalPrice = 0;
    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (product) {
        cart.totalPrice += product.price * item.quantity;
      }
    }
    
    await cart.save();
    
    // Return populated cart
    const populatedCart = await Cart.findById(cart._id).populate('items.product');
    
    res.status(200).json({ message: 'Item removed from cart', cart: populatedCart });
  } catch (error) {
    res.status(500).json({ message: 'Error removing item from cart', error: error.message });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    // Find and delete user's cart
    await Cart.findOneAndDelete({ user: req.user.id });
    
    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing cart', error: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
