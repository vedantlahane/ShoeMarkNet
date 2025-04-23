const mongoose = require('mongoose');
const slugify = require('slugify');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, unique: true },
  description: { type: String },
  image: { type: String },
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true });

// Middleware to generate slug before saving
CategorySchema.pre('save', async function(next) {
  if (this.isModified('name')) {
    let baseSlug = slugify(this.name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    // Check if slug exists, if yes, append a counter
    while (await mongoose.models.Category.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }
    this.slug = slug;
  }
  next();
});

module.exports = mongoose.model('Category', CategorySchema);
