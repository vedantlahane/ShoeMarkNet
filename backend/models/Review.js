const mongoose = require('mongoose');

/**
 * @description Mongoose schema for the Review model.
 * This schema is designed to store product reviews submitted by users. It includes
 * fields for the review content, a rating, images, and moderation details.
 */
const ReviewSchema = new mongoose.Schema({
  // References to the user who wrote the review and the product it's for
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  
  // Review content and rating
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String },
  comment: { type: String, required: true },
  
  // Optional pros and cons lists
  pros: [{ type: String }],
  cons: [{ type: String }],
  
  // Media and engagement
  images: [{ type: String }], // Array of image URLs
  likes: { type: Number, default: 0 }, // Number of users who found this review helpful
  
  // Validation and moderation
  verifiedPurchase: { type: Boolean, default: false }, // Indicates if the user bought the product
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminComment: { type: String }, // Comments from an admin during moderation
  moderatedAt: { type: Date },
  moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // The admin who moderated the review
}, { timestamps: true }); // Mongoose adds `createdAt` and `updatedAt`

module.exports = mongoose.model('Review', ReviewSchema);
