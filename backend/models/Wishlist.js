const mongoose = require('mongoose');

/**
 * @description Mongoose schema for the Wishlist model.
 * This schema provides a simple way for users to save a list of products
 * they are interested in.
 */
const WishlistSchema = new mongoose.Schema({
  // Reference to the user who owns the wishlist. This field is required
  // and serves as the primary key for finding a user's wishlist.
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // An array of product IDs that the user has added to their wishlist.
  products: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product' 
  }]
}, { timestamps: true }); // Mongoose adds `createdAt` and `updatedAt`

// ====================================================================
// ========================= SCHEMA HOOKS & METHODS ===================
// ====================================================================

// Indexes for better query performance.
// The first index allows for fast lookup of a user's wishlist.
// The second index allows for efficient checking of whether a product is in a user's wishlist.
WishlistSchema.index({ user: 1 });
WishlistSchema.index({ user: 1, products: 1 });

/**
 * @description Virtual field to get the total number of products in the wishlist.
 * This is a computed property that is not stored in the database.
 */
WishlistSchema.virtual('productCount').get(function() {
  return this.products.length;
});

module.exports = mongoose.model('Wishlist', WishlistSchema);
