const mongoose = require('mongoose');
const slugify = require('slugify');

/**
 * @description Mongoose schema for a Product.
 * This schema includes fields for product details, pricing, inventory,
 * variations (variants), SEO, and virtual fields for dynamic data.
 */
const ProductSchema = new mongoose.Schema({
  // Basic Product Information
  name: { type: String, required: true, trim: true, minlength: 2 },
  slug: { type: String, unique: true }, // URL-friendly name, auto-generated
  description: { type: String, required: true, trim: true, minlength: 20 },
  brand: { type: String, required: true, trim: true },

  // Categorization and Pricing
  // Using an index to improve the performance of category-based queries
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: false, index: true },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, min: 0 },
  discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
  images: [{ type: String, trim: true }], // Array of image URLs

  // Inventory and Ratings
  countInStock: { type: Number, required: true, default: 0, min: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  numReviews: { type: Number, default: 0 },
  
  // Flags for Product Discovery
  isFeatured: { type: Boolean, default: false, index: true },
  isNewArrival: { type: Boolean, default: false },
  gender: { type: String, enum: ['men', 'women', 'unisex'] },

  // Product Variants (e.g., different colors and sizes)
  variants: [{
    color: { type: String, trim: true },
    colorCode: { type: String, trim: true },
    images: [{ type: String, trim: true }],
    sizes: [{
      size: { type: String, trim: true },
      countInStock: { type: Number, default: 0, min: 0 },
      price: { type: Number, min: 0 }
    }]
  }],

  // Dynamic specifications using a Map
  specifications: { type: Map, of: String },

  // SEO Fields
  metaTitle: { type: String },
  metaDescription: { type: String },
  metaKeywords: [{ type: String }],

  // Unique SKU (Stock Keeping Unit), auto-generated on creation
  sku: {
    type: String,
    unique: true,
    default: function() {
      // Creates a unique SKU using a timestamp and a random string
      return 'SKU-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    }
  },

  // Shipping information
  weight: { type: Number, min: 0 },
  dimensions: {
    length: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 }
  },

  isActive: { type: Boolean, default: true, index: true },
}, {
  timestamps: true,
  toJSON: { virtuals: true }, // Enable virtuals when converting to JSON
  toObject: { virtuals: true } // Enable virtuals when converting to an object
});

// Require at least one image for active products
ProductSchema.path('images').validate(function(images) {
  if (this.isActive === false) return true;
  return Array.isArray(images) && images.length > 0;
}, 'Please provide at least one product image');

// ====================================================================
// ========================= HELPER METHODS ===========================
// ====================================================================

ProductSchema.methods.syncStockFromVariants = function() {
  if (!Array.isArray(this.variants) || this.variants.length === 0) {
    return;
  }

  const totalStock = this.variants.reduce((productTotal, variant) => {
    if (!variant || !Array.isArray(variant.sizes)) return productTotal;
    const variantTotal = variant.sizes.reduce((sizeTotal, size) => sizeTotal + (size?.countInStock || 0), 0);
    return productTotal + variantTotal;
  }, 0);

  if (totalStock >= 0) {
    this.countInStock = totalStock;
  }
};

ProductSchema.statics.recalculateReviewStats = async function(productId) {
  if (!mongoose.Types.ObjectId.isValid(productId)) return;

  const Review = mongoose.model('Review');
  const stats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId), status: 'approved' } },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  const payload = stats.length > 0
    ? { rating: Number(stats[0].averageRating.toFixed(2)), numReviews: stats[0].reviewCount }
    : { rating: 0, numReviews: 0 };

  await this.findByIdAndUpdate(productId, payload, { new: false });
};

// ====================================================================
// ========================= SCHEMA HOOKS =============================
// ====================================================================

ProductSchema.pre('validate', function(next) {
  if (this.price < 0) {
    return next(new Error('Price cannot be negative'));
  }

  if (this.originalPrice && this.originalPrice < this.price) {
    this.originalPrice = this.price;
  }

  if (this.originalPrice && this.originalPrice > 0) {
    const computedDiscount = 100 - Math.round((this.price / this.originalPrice) * 100);
    this.discountPercentage = Math.max(0, Math.min(100, computedDiscount));
  } else if (this.discountPercentage > 0 && this.discountPercentage < 100) {
    const divisor = 1 - this.discountPercentage / 100;
    if (divisor <= 0) {
      return next(new Error('Discount percentage cannot be 100 or more without original price'));
    }
    this.originalPrice = Number((this.price / divisor).toFixed(2));
  }

  next();
});

// Indexes for better performance on common queries
// For text search, you can use .find({ $text: { $search: 'keyword' }})
ProductSchema.index({ name: 'text', description: 'text' });
// For filtering by brand and category
ProductSchema.index({ brand: 1, category: 1 });
// For sorting products by price and rating
ProductSchema.index({ price: 1, rating: -1 });

// 'pre' save hook to handle automatic data generation and validation
ProductSchema.pre('save', async function(next) {
  if (this.isModified('variants')) {
    this.syncStockFromVariants();
  }

  // Generate a slug from the name if the name is modified
  if (this.isModified('name')) {
    const baseSlug = slugify(this.name, { lower: true, strict: true });
    let slugCandidate = baseSlug;
    let counter = 1;

    while (await mongoose.models.Product.exists({ slug: slugCandidate, _id: { $ne: this._id } })) {
      slugCandidate = `${baseSlug}-${counter++}`;
    }

    this.slug = slugCandidate;
  }

  // Ensure the autogenerated SKU is truly unique
  if (this.isNew) {
    let skuExists = await mongoose.models.Product.findOne({ sku: this.sku });
    while (skuExists) {
      // If a duplicate SKU exists, generate a new one
      this.sku = 'SKU-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
      skuExists = await mongoose.models.Product.findOne({ sku: this.sku });
    }
  }
  next();
});

// ====================================================================
// ======================= VIRTUAL FIELDS =============================
// ====================================================================

// Virtual field for a calculated discount price
ProductSchema.virtual('discountPrice').get(function() {
  if (this.discountPercentage > 0) {
    return this.price - (this.price * this.discountPercentage / 100);
  }
  return this.price;
});

// Virtual field to sum up stock from all variants and sizes
ProductSchema.virtual('calculatedCountInStock').get(function() {
  // Handle case where variants might be undefined or empty
  if (!this.variants || !Array.isArray(this.variants) || this.variants.length === 0) {
    return this.countInStock || 0;
  }
  
  return this.variants.reduce((total, variant) => {
    if (!variant || !variant.sizes || !Array.isArray(variant.sizes)) {
      return total;
    }
    const sizeStock = variant.sizes.reduce((sum, size) => sum + (size.countInStock || 0), 0) || 0;
    return total + sizeStock;
  }, 0);
});

// Virtual field to provide a user-friendly stock status
ProductSchema.virtual('stockStatus').get(function() {
  // Use the calculated stock if variants exist, otherwise use the main countInStock
  const totalStock = this.calculatedCountInStock || this.countInStock;
  
  if (totalStock === 0) return 'out-of-stock';
  if (totalStock < 10) return 'low-stock';
  return 'in-stock';
});

// Virtual field to dynamically populate reviews
// You can use `Product.find().populate('reviews')` in your queries
ProductSchema.virtual('reviews', {
  ref: 'Review', // The model to use
  localField: '_id', // Find documents in the 'Review' model where 'foreignField' equals this '_id'
  foreignField: 'product' // The field on the 'Review' model to match
});

module.exports = mongoose.model('Product', ProductSchema);
