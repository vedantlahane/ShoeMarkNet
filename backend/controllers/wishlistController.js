const mongoose = require('mongoose');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const { updateLeadScore } = require('../utils/leadScoring');
const asyncHandler = require('express-async-handler');

// Configuration
const MAX_WISHLIST_ITEMS = 50;

/**
 * @description Get the authenticated user's wishlist with pagination.
 * @route GET /api/wishlist
 * @access Private
 */
const getWishlist = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, sort = '-createdAt' } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Find the user's wishlist
  let wishlist = await Wishlist.findOne({ user: req.user.id });
  
  if (!wishlist) {
    // If no wishlist is found, return an empty list with pagination info
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

  // Calculate total count for pagination
  const total = wishlist.products.length;
  const pages = Math.ceil(total / parseInt(limit));

  // Find the wishlist again, but this time populate the products with pagination options
  // and select a subset of product fields for a lighter response
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
});

/**
 * @description Add a product to the authenticated user's wishlist.
 * Uses a Mongoose transaction to ensure atomicity.
 * @route POST /api/wishlist
 * @access Private
 */
const addToWishlist = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { productId } = req.body;
    
    // Verify that the product exists
    const product = await Product.findById(productId).session(session);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    
    // Find or create the user's wishlist
    let wishlist = await Wishlist.findOne({ user: req.user.id }).session(session);
    
    if (!wishlist) {
      wishlist = new Wishlist({ 
        user: req.user.id, 
        products: [] 
      });
    }
    
    // Check if the product is already in the wishlist
    if (wishlist.products.includes(productId)) {
      res.status(400);
      throw new Error('Product already in wishlist');
    }
    
    // Check the wishlist size limit
    if (wishlist.products.length >= MAX_WISHLIST_ITEMS) {
      res.status(400);
      throw new Error(`Wishlist cannot exceed ${MAX_WISHLIST_ITEMS} items`);
    }
    
    // Add the product and save the wishlist
    wishlist.products.push(productId);
    await wishlist.save({ session });
    
    // Update the user's lead score (and continue if it fails)
    try {
      await updateLeadScore(req.user.id, 'add_to_wishlist', { session });
    } catch (leadScoreError) {
      console.error('Lead score update failed:', leadScoreError);
    }
    
    await session.commitTransaction();
    
    // Return the updated wishlist with populated product details
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
    throw error;
  } finally {
    session.endSession();
  }
});

/**
 * @description Remove a product from the authenticated user's wishlist.
 * Uses a Mongoose transaction to ensure atomicity.
 * @route DELETE /api/wishlist/:productId
 * @access Private
 */
const removeFromWishlist = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { productId } = req.params;
    
    const wishlist = await Wishlist.findOne({ user: req.user.id }).session(session);
    
    if (!wishlist) {
      res.status(404);
      throw new Error('Wishlist not found');
    }
    
    const productIndex = wishlist.products.findIndex(
      product => product.toString() === productId
    );
    
    if (productIndex === -1) {
      res.status(400);
      throw new Error('Product not in wishlist');
    }
    
    // Remove the product and save the wishlist
    wishlist.products.splice(productIndex, 1);
    await wishlist.save({ session });
    
    await session.commitTransaction();
    
    // Return the updated wishlist with populated product details
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
    throw error;
  } finally {
    session.endSession();
  }
});

/**
 * @description Clear the entire wishlist for the authenticated user.
 * @route DELETE /api/wishlist
 * @access Private
 */
const clearWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user.id });
  
  if (!wishlist) {
    res.status(404);
    throw new Error('Wishlist not found');
  }
  
  wishlist.products = [];
  await wishlist.save();
  
  res.status(200).json({
    message: 'Wishlist cleared',
    products: [],
    productCount: 0
  });
});

/**
 * @description Check if a specific product is in the user's wishlist.
 * @route GET /api/wishlist/contains/:productId
 * @access Private
 */
const checkProductInWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  
  const wishlist = await Wishlist.findOne({ user: req.user.id });
  
  if (!wishlist) {
    // If no wishlist exists, the product cannot be in it
    return res.status(200).json({ inWishlist: false });
  }
  
  // Use .some() to check if the product ID exists in the products array
  const inWishlist = wishlist.products.some(
    product => product.toString() === productId
  );
  
  res.status(200).json({ inWishlist });
});

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkProductInWishlist
};
