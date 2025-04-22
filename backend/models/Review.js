const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String },
  comment: { type: String, required: true },
  pros: [{ type: String }], // List of positive aspects
  cons: [{ type: String }], // List of negative aspects
  images: [{ type: String }], // Array of image URLs
  likes: { type: Number, default: 0 }, // Number of people who found this review helpful
  verifiedPurchase: { type: Boolean, default: false }, // Was the product bought by this user?
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminComment: { type: String }, // Admin comment for moderation
  moderatedAt: { type: Date },
  moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Review', ReviewSchema);
