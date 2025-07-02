const mongoose = require('mongoose');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const { updateLeadScore } = require('../utils/leadScoring');

// Configuration
const MAX_WISHLIST_ITEMS = 50;

// Get user's wishlist with pagination
const getWishlist = async (req, res) => {
  try {
    const { page = 1, limit = 20, sort = '-createdAt' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let wishlist = await Wishlist.findOne({ user: req.user.id });
    
    if (!wishlist) {
      return res.status(200).json({
        products: [],
        pagination: {
          total: 0,
          page: parseInt(page),
          pages: 0,
          limit: parseInt(limit)
        }
      });
    }

    // Get total count for pagination
    const total = wishlist.products.length;
    const pages = Math.ceil(total / parseInt(limit));

    // Populate products with pagination
    wishlist = await Wishlist.findOne({ user: req.user.id })
      .populate({
        path: 'products',
        options: {
          skip,
          limit: parseInt(limit),
          sort
        },
        select: 'name price images description inStock rating'
      });

    res.status(200).json({
      products: wishlist.products,
      pagination: {
        total,
        page: parseInt(page),
        pages,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ 
      message: 'Error fetching wishlist', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

// Add product to wishlist
const addToWishlist = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { productId } = req.body;
    
    // Verify product exists
    const product = await Product.findById(productId).session(session);
    if (!product) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ user: req.user.id }).session(session);
    
    if (!wishlist) {
      wishlist = new Wishlist({ 
        user: req.user.id, 
        products: [] 
      });
    }
    
    // Check if product already in wishlist
    if (wishlist.products.includes(productId)) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Product already in wishlist' });
    }
    
    // Check wishlist size limit
    if (wishlist.products.length >= MAX_WISHLIST_ITEMS) {
      await session.abortTransaction();
      return res.status(400).json({ 
        message: `Wishlist cannot exceed ${MAX_WISHLIST_ITEMS} items` 
      });
    }
    
    // Add product to wishlist
    wishlist.products.push(productId);
    await wishlist.save({ session });
    
    // Update lead score
    try {
      await updateLeadScore(req.user.id, 'add_to_wishlist', { session });
    } catch (leadScoreError) {
      console.error('Lead score update failed:', leadScoreError);
      // Continue even if lead score fails
    }
    
    await session.commitTransaction();
    
    // Return updated wishlist
    const populatedWishlist = await Wishlist.findById(wishlist._id)
      .populate({
        path: 'products',
        select: 'name price images description inStock rating'
      });
    
    res.status(200).json({
      message: 'Product added to wishlist',
      products: populatedWishlist.products,
      productCount: populatedWishlist.products.length
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Add to wishlist error:', error);
    res.status(500).json({ 
      message: 'Error adding to wishlist', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  } finally {
    session.endSession();
  }
};

// Remove product from wishlist
const removeFromWishlist = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { productId } = req.params;
    
    const wishlist = await Wishlist.findOne({ user: req.user.id }).session(session);
    
    if (!wishlist) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    
    const productIndex = wishlist.products.findIndex(
      product => product.toString() === productId
    );
    
    if (productIndex === -1) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Product not in wishlist' });
    }
    
    // Remove product from wishlist
    wishlist.products.splice(productIndex, 1);
    await wishlist.save({ session });
    
    await session.commitTransaction();
    
    // Return updated wishlist
    const populatedWishlist = await Wishlist.findById(wishlist._id)
      .populate({
        path: 'products',
        select: 'name price images description inStock rating'
      });
    
    res.status(200).json({
      message: 'Product removed from wishlist',
      products: populatedWishlist.products,
      productCount: populatedWishlist.products.length
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ 
      message: 'Error removing from wishlist', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  } finally {
    session.endSession();
  }
};

// Clear entire wishlist
const clearWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    
    wishlist.products = [];
    await wishlist.save();
    
    res.status(200).json({
      message: 'Wishlist cleared',
      products: [],
      productCount: 0
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({ 
      message: 'Error clearing wishlist', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

// Check if product is in wishlist
const checkProductInWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    
    if (!wishlist) {
      return res.status(200).json({ inWishlist: false });
    }
    
    const inWishlist = wishlist.products.some(
      product => product.toString() === productId
    );
    
    res.status(200).json({ inWishlist });
  } catch (error) {
    console.error('Check product in wishlist error:', error);
    res.status(500).json({ 
      message: 'Error checking wishlist', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkProductInWishlist
};