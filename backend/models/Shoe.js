const mongoose = require('mongoose');

// Define enums
const categories = ['Running', 'Casual', 'Sports', 'Formal'];
const colors = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow'];

// Define a sub-schema for sizes
const sizeSchema = new mongoose.Schema({
  size: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0 },
});

// Define a sub-schema for images
const imageSchema = new mongoose.Schema({
  url: { 
    type: String, 
    required: true, 
    trim: true,
    validate: {
      validator: function(v) {
        return v.startsWith('http') || v.startsWith('/');
      },
      message: 'Image URL must start with http or /'
    }
  },
  altText: { type: String, trim: true },
  isPrimary: { type: Boolean, default: false }
});

// Shoe Schema
const shoeSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true, 
    index: true,
    minlength: 2, // Ensure name has at least 2 characters
    maxlength: 100 // Limit name to 100 characters
  },
  brand: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Brand', 
    required: true,
    index: true
  },
  description: { 
    type: String, 
    required: true, 
    trim: true,
    minlength: 10,
    maxlength: 1000
  },
  price: { 
    type: Number, 
    required: true, 
    min: 0,
    // Consider adding a max value if applicable
  },
  sizes: { 
    type: [sizeSchema], 
    default: [],
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: 'At least one size must be specified'
    }
  },
  colors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Color',
    required: true
  }],
  inStock: { 
    type: Boolean, 
    required: true, 
    default: true 
  },
  images: {
    type: [imageSchema],
    validate: {
      validator: function(v) {
        return v.some(image => image.isPrimary);
      },
      message: 'At least one image must be marked as primary'
    }
  },
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    required: true,
    index: true
  },
  rating: { 
    type: Number, 
    required: true, 
    default: 0, 
    min: 0, 
    max: 5,
    validate: {
      validator: function(v) {
        return Number.isInteger(v * 10); // Ensure rating is to one decimal place
      },
      message: 'Rating must be to one decimal place'
    }
  },
  discount: { 
    type: Number, 
    default: 0, 
    min: 0, 
    max: 100 
  },
  tags: [{ 
    type: String, 
    trim: true 
  }],
  material: { 
    type: String, 
    trim: true 
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Create a text index for full-text search
shoeSchema.index({ name: 'text', brand: 'text', description: 'text', tags: 'text' });

// Virtual for computed average price
shoeSchema.virtual('averagePrice').get(function() {
  if (this.sizes.length === 0) return this.price;
  const totalPrice = this.sizes.reduce((sum, size) => sum + size.quantity * this.price, 0);
  const totalQuantity = this.sizes.reduce((sum, size) => sum + size.quantity, 0);
  return totalQuantity > 0 ? totalPrice / totalQuantity : this.price;
});

// Pre-save hook
shoeSchema.pre('save', function(next) {
  // Perform any necessary operations before saving
  if (this.isModified('price')) {
    // Update related documents or perform other actions
    console.log('Price has been modified');
  }
  next();
});

// Post-save hook
shoeSchema.post('save', function(doc, next) {
  // Perform any necessary operations after saving
  console.log('Shoe saved:', doc);
  next();
});

const Shoe = mongoose.model('Shoe', shoeSchema);
module.exports = Shoe;