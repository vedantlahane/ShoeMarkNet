const mongoose = require('mongoose');

const ShoeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  price: { type: Number, required: true },
  sizes: [{ type: Number, required: true }],  // Array of available sizes
  color: { type: String, required: true },
  category: { type: String, required: true }, // e.g., sneakers, formal, running
  stock: { type: Number, default: 0 },
  description: { type: String },
  images: [{ type: String }], // URLs for product images
  rating: { type: Number, default: 0 },  // Average rating
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
}, { timestamps: true });

module.exports = mongoose.model('Shoe', ShoeSchema);
