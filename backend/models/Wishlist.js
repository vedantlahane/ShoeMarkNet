const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product' 
  }]
}, { timestamps: true });

// Add indexes for better performance
WishlistSchema.index({ user: 1 });
WishlistSchema.index({ user: 1, products: 1 });

// Add a virtual for product count
WishlistSchema.virtual('productCount').get(function() {
  return this.products.length;
});

module.exports = mongoose.model('Wishlist', WishlistSchema);