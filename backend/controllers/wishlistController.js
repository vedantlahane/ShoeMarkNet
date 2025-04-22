const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const { updateLeadScore } = require('./leadScoreController');

// Get user's wishlist
const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id }).populate('products');
    
    if (!wishlist) {
      wishlist = { user: req.user.id, products: [] };
    }
    
    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wishlist', error: error.message });
  }
};

// Add product to wishlist
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    
    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Find user's wishlist or create new one
    let wishlist = await Wishlist.findOne({ user: req.user.id });
    
    if (!wishlist) {
      wishlist = new Wishlist({
        user: req.user.id,
        products: []
      });
    }
    
    // Check if product already in wishlist
    if (wishlist.products.includes(productId)) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }
    
    // Add product to wishlist
    wishlist.products.push(productId);
    await wishlist.save();
    
    // Update lead score
    updateLeadScore(req.user.id, 'add_to_wishlist');
    
    // Return populated wishlist
    const populatedWishlist = await Wishlist.findById(wishlist._id).populate('products');
    
    res.status(200).json({ message: 'Product added to wishlist', wishlist: populatedWishlist });
  } catch (error) {
    res.status(500).json({ message: 'Error adding to wishlist', error: error.message });
  }
};

// Remove product from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const productId = req.params.productId;
    
    // Find user's wishlist
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    
    // Check if product in wishlist
    if (!wishlist.products.includes(productId)) {
      return res.status(400).json({ message: 'Product not in wishlist' });
    }
    
    // Remove product from wishlist
    wishlist.products = wishlist.products.filter(
      product => product.toString() !== productId
    );
    
    await wishlist.save();
    
    // Return populated wishlist
    const populatedWishlist = await Wishlist.findById(wishlist._id).populate('products');
    
    res.status(200).json({ message: 'Product removed from wishlist', wishlist: populatedWishlist });
  } catch (error) {
    res.status(500).json({ message: 'Error removing from wishlist', error: error.message });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist
};
