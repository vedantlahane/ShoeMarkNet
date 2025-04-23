const mongoose = require('mongoose');
const slugify = require('slugify');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  description: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: false },
  price: { type: Number, required: true }, // Current selling price
  originalPrice: { type: Number }, // Original price before discount
  discountPercentage: { type: Number, default: 0 },
  images: [{ type: String }], // Main product images
  countInStock: { type: Number, required: true, default: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  numReviews: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  
  // Additional fields for shoes
  gender: { type: String, enum: ['men', 'women', 'unisex'] },
  
  // Product variants (for shoes: different colors and sizes)
  variants: [{
    color: { type: String },
    colorCode: { type: String }, // Hex code for the color
    images: [{ type: String }], // Images specific to this color
    sizes: [{
      size: { type: Number },
      countInStock: { type: Number, default: 0 },
      price: { type: Number } // Optional different price for specific size
    }]
  }],
  
  // Product specifications
  specifications: { type: Map, of: String },
  
  // SEO fields
  metaTitle: { type: String },
  metaDescription: { type: String },
  metaKeywords: [{ type: String }],
  
  // Tracking fields
  sku: {
    type: String,
    unique: true,
    default: function() {
      // Generate a unique SKU based on other fields or a random string
      return 'SKU-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    }
  },
  weight: { type: Number }, // Weight in grams
  dimensions: {
    length: { type: Number },
    width: { type: Number },
    height: { type: Number }
  },
  
  // Status
  isActive: { type: Boolean, default: true },
  
}, { timestamps: true });

// Generate slug before saving
ProductSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Calculate discount price
ProductSchema.virtual('discountPrice').get(function() {
  if (this.discountPercentage > 0) {
    return this.price - (this.price * this.discountPercentage / 100);
  }
  return this.price;
});

module.exports = mongoose.model('Product', ProductSchema);
