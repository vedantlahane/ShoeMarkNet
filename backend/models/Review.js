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

// Ensure a user can review a product only once
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Recalculate product rating after review changes
ReviewSchema.statics.updateProductAggregates = async function(productId) {
  if (!mongoose.Types.ObjectId.isValid(productId)) return;

  const stats = await this.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId), status: 'approved' } },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  const Product = mongoose.model('Product');
  if (stats.length === 0) {
    await Product.findByIdAndUpdate(productId, { rating: 0, numReviews: 0 }, { new: false });
  } else {
    await Product.findByIdAndUpdate(
      productId,
      {
        rating: Number(stats[0].averageRating.toFixed(2)),
        numReviews: stats[0].reviewCount
      },
      { new: false }
    );
  }
};

const recalcProductRating = async (doc) => {
  if (doc?.product) {
    await doc.constructor.updateProductAggregates(doc.product);
  }
};

ReviewSchema.post('save', recalcProductRating);
ReviewSchema.post('findOneAndDelete', recalcProductRating);
ReviewSchema.post('findOneAndUpdate', async function(result) {
  if (result) await recalcProductRating(result);
});
ReviewSchema.post('remove', recalcProductRating);

module.exports = mongoose.model('Review', ReviewSchema);
