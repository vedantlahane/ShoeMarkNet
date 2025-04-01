const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shoes: [{
    shoe: { type: mongoose.Schema.Types.ObjectId, ref: 'Shoe', required: true },
    color: { type: String }, // User-preferred color
    size: { type: Number }, // User-preferred size
    addedAt: { type: Date, default: Date.now } // Timestamp for when added
  }],
  notes: { type: String } // Optional user note about why they added this item
}, { timestamps: true });

module.exports = mongoose.model('Wishlist', WishlistSchema);
