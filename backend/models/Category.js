const mongoose = require('mongoose');
const slugify = require('slugify'); // To generate slugs

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, unique: true }, // URL-friendly category name
  description: { type: String },
  image: { type: String }, // Category image
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null }, // Parent category (for subcategories)
  isActive: { type: Boolean, default: true }, // Enable/disable category
}, { timestamps: true });

// Middleware to generate slug before saving
CategorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('Category', CategorySchema);
