const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shoe: { type: mongoose.Schema.Types.ObjectId, ref: 'Shoe', required: true },
  title: { type: String }, // Optional short title for the review
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  pros: [{ type: String }], // List of positive aspects
  cons: [{ type: String }], // List of negative aspects
  images: [{ type: String }], // Array of image URLs
  likes: { type: Number, default: 0 }, // Number of people who found this review helpful
  verifiedPurchase: { type: Boolean, default: false }, // Was the product bought by this user?
}, { timestamps: true });

module.exports = mongoose.model('Review', ReviewSchema);
