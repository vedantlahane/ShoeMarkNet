const mongoose = require('mongoose');

/**
 * @description Mongoose schema for the Wishlist model.
 * This schema provides a simple way for users to save a list of products
 * they are interested in.
 */
const WishlistSchema = new mongoose.Schema({
  // Reference to the user who owns the wishlist. This field is required
  // and serves as the primary key for finding a user's wishlist.
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  
  // An array of products with metadata such as when they were added.
  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    addedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true }); // Mongoose adds `createdAt` and `updatedAt`

WishlistSchema.path('products').default(() => []);

// ====================================================================
// ========================= SCHEMA HOOKS & METHODS ===================
// ====================================================================

// Indexes for better query performance.
// WishlistSchema.index({ user: 1 });
WishlistSchema.index({ user: 1, 'products.product': 1 }, { unique: true });

/**
 * @description Virtual field to get the total number of products in the wishlist.
 * This is a computed property that is not stored in the database.
 */
WishlistSchema.virtual('productCount').get(function() {
  return Array.isArray(this.products) ? this.products.length : 0;
});

WishlistSchema.methods.hasProduct = function(productId) {
  return this.products.some(item => item.product.toString() === productId.toString());
};

WishlistSchema.methods.addProduct = function(productId) {
  if (this.hasProduct(productId)) {
    throw new Error('Product already in wishlist');
  }
  this.products.push({ product: productId, addedAt: new Date() });
  return this.save();
};

WishlistSchema.methods.removeProduct = function(productId) {
  this.products = this.products.filter(item => item.product.toString() !== productId.toString());
  return this.save();
};

module.exports = mongoose.model('Wishlist', WishlistSchema);
