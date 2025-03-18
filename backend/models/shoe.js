const mongoose = require('mongoose');

// Define a sub-schema for sizes (optional enhancement)
const sizeSchema = new mongoose.Schema({
size: { type: String, required: true, trim: true },
quantity: { type: Number, required: true, min: 0 },
});

// Shoe Schema
const shoeSchema = new mongoose.Schema({
name: { type: String, required: true, trim: true, index: true },
brand: { type: String, required: true, trim: true, index: true },
description: { type: String, required: true, trim: true },
price: { type: Number, required: true, min: 0 },
sizes: [sizeSchema],
colors: [{ type: String, required: true, trim: true }],
inStock: { type: Boolean, required: true, default: true },
// If you want to support multiple images, use an array.
image: { type: String, required: true, trim: true },
// Alternatively, to support multiple images:
// images: [{ type: String, trim: true }],
category: { type: String, required: true, trim: true, index: true },
rating: { type: Number, required: true, default: 0, min: 0, max: 5 },
}, {
timestamps: true // Automatically adds createdAt and updatedAt fields
});

const Shoe = mongoose.model('Shoe', shoeSchema);
module.exports = Shoe;