const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shoes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Shoe' }],
}, { timestamps: true });

module.exports = mongoose.model('Wishlist', WishlistSchema);
