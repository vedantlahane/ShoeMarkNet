const mongoose = require('mongoose');

const userProductInteractionSchema = new mongoose.Schema({
user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
shoe: { type: mongoose.Schema.Types.ObjectId, ref: 'Shoe', required: true },
visits: { type: Number, default: 0 },
clicks: { type: Number, default: 0 },
addedToCart: { type: Boolean, default: false },
// You can store a product-specific score calculated from the above metrics.
score: { type: Number, default: 0 },
lastUpdated: { type: Date, default: Date.now }
});

// Optional: Create compound index—one document per (user, shoe)
userProductInteractionSchema.index({ user: 1, shoe: 1 }, { unique: true });
module.exports = mongoose.model('UserProductInteraction', userProductInteractionSchema);