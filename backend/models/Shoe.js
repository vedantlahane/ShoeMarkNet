const mongoose = require('mongoose');

const ShoeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, required: true }, // e.g., sneakers, formal, running
  gender: { type: String, enum: ['men', 'women', 'unisex'], default: 'unisex' },
  basePrice: { type: Number, required: true }, // Base price before discount
  discountPercentage: { type: Number, default: 0 }, // Discount on base price
  totalSales: { type: Number, default: 0 }, // Track total sales
  tags: [{ type: String }], // Search-friendly keywords
  isNewArrival: { type: Boolean, default: false }, // New product flag
  featured: { type: Boolean, default: false }, // Featured product flag
  sku: { type: String, unique: true }, // Unique SKU for inventory, sku is a common identifier for products ex: 'SNEAKER-1234'

  variants: [{
    color: { type: String, required: true },
    images: [{ type: String }], // Image URLs specific to this color
    options: [{
      size: { type: Number, required: true },
      stock: { type: Number, default: 0 },
      discountPrice: { type: Number, default: 0 }, // Discounted price for this variant
    }]
  }],

  rating: { type: Number, default: 0 },  // Average rating
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }], // Review references

}, { timestamps: true });

module.exports = mongoose.model('Shoe', ShoeSchema);
