const mongoose = require('mongoose');

/**
 * @description Mongoose schema for the Cart model.
 * This schema supports both authenticated users and guest sessions by
 * using either a `user` ObjectId or a `sessionId`. It includes fields
 * for cart items, pricing, discounts, and expiration.
 */
const CartSchema = new mongoose.Schema({
  // Reference to the User model for authenticated users.
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // A session ID for unauthenticated (guest) users.
  sessionId: { type: String },

  // Array of items in the cart
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1, max: 99 },
    // Details for product variants, if applicable
    variant: {
      color: String,
      size: String,
      sku: String
    },
    price: { type: Number, required: true },
    originalPrice: Number,
    isInStock: { type: Boolean, default: true },
    stockCheckedAt: { type: Date, default: Date.now },
    addedAt: { type: Date, default: Date.now }
  }],

  // Pricing fields, automatically calculated by the `calculateTotalPrice` method
  subtotal: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  shippingAmount: { type: Number, default: 0 },
  totalPrice: { type: Number, default: 0 },

  // Coupons applied to the cart
  appliedCoupons: [{
    code: String,
    discountAmount: Number,
    discountType: { type: String, enum: ['percentage', 'fixed'] }
  }],

  // Cart status for tracking purposes (e.g., for abandoned cart emails)
  status: { type: String, enum: ['active', 'abandoned', 'converted', 'merged'], default: 'active' },
  lastActivityAt: { type: Date, default: Date.now },
  abandonedAt: Date,
  reminderSent: { type: Boolean, default: false },

  // A time-to-live (TTL) index that automatically deletes the document
  // from the database after a specified period (30 days in this case).
  // This is great for cleaning up old guest carts.
  expiresAt: { type: Date, default: Date.now, expires: 30 * 24 * 60 * 60 }
}, { timestamps: true });

// ====================================================================
// ========================= INDEXES & HOOKS ==========================
// ====================================================================

// Unique index for a user's cart. The `partialFilterExpression` ensures that
// the uniqueness constraint only applies when a `user` field exists, allowing
// for multiple guest carts.
CartSchema.index({ user: 1 }, { unique: true, partialFilterExpression: { user: { $exists: true } } });

// Unique index for a guest cart. This ensures each session ID has a unique cart.
CartSchema.index({ sessionId: 1 }, { unique: true, partialFilterExpression: { sessionId: { $exists: true } } });

// Compound indexes for efficient querying by user or session and status.
CartSchema.index({ user: 1, status: 1 });
CartSchema.index({ sessionId: 1, status: 1 });

/**
 * @description Pre-save hook to automatically update timestamps and handle abandonment logic.
 */
CartSchema.pre('save', function(next) {
  // Update the last activity timestamp whenever the cart is saved
  this.lastActivityAt = new Date();
  
  // Check for abandonment only if the cart has items and is currently active
  if (this.items.length > 0 && this.status === 'active') {
    const hoursSinceActivity = (Date.now() - this.lastActivityAt) / (1000 * 60 * 60);
    // If no activity for more than 2 hours, mark as abandoned
    if (hoursSinceActivity > 2) {
      this.status = 'abandoned';
      this.abandonedAt = new Date();
    }
  }
  next();
});

// ====================================================================
// ========================= VIRTUALS & METHODS =======================
// ====================================================================

/**
 * @description Virtual field to get the total number of items in the cart.
 */
CartSchema.virtual('itemCount').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

/**
 * @description Virtual field to check if the cart is empty.
 */
CartSchema.virtual('isEmpty').get(function() {
  return this.items.length === 0;
});

/**
 * @description Method to calculate all pricing fields (subtotal, tax, total).
 * @returns {number} The new total price.
 */
CartSchema.methods.calculateTotalPrice = function() {
  this.subtotal = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  this.discountAmount = this.appliedCoupons.reduce((total, c) => total + c.discountAmount, 0);
  // Example tax calculation (8%)
  this.taxAmount = (this.subtotal - this.discountAmount) * 0.08;
  this.totalPrice = this.subtotal - this.discountAmount + this.taxAmount + this.shippingAmount;
  return this.totalPrice;
};

/**
 * @description Adds or updates an item in the cart.
 * @param {string} productId - The ID of the product to add.
 * @param {number} quantity - The quantity to add.
 * @param {object} variant - The product variant details.
 */
CartSchema.methods.addItem = async function(productId, quantity, variant = {}) {
  // Check if item with same product and variant already exists
  const existingItemIndex = this.items.findIndex(item =>
    item.product.toString() === productId.toString() &&
    item.variant.color === variant.color &&
    item.variant.size === variant.size
  );
  
  if (existingItemIndex > -1) {
    // If it exists, just update the quantity
    this.items[existingItemIndex].quantity += quantity;
  } else {
    // If it's a new item, fetch product details and validate stock
    const Product = mongoose.model('Product');
    const product = await Product.findById(productId);
    if (!product) throw new Error('Product not found');
    if (product.countInStock < quantity) throw new Error('Insufficient stock');
    
    this.items.push({
      product: productId,
      quantity,
      variant,
      price: product.price,
      originalPrice: product.originalPrice || product.price,
      isInStock: true
    });
  }
  
  this.status = 'active';
  this.abandonedAt = undefined;
  this.calculateTotalPrice();
  return this.save();
};

/**
 * @description Updates the quantity of a specific item in the cart.
 * @param {string} itemId - The ID of the item to update.
 * @param {number} newQuantity - The new quantity for the item.
 */
CartSchema.methods.updateQuantity = async function(itemId, newQuantity) {
  const itemIndex = this.items.findIndex(item => item._id.toString() === itemId);
  if (itemIndex === -1) throw new Error('Item not found in cart');
  
  if (newQuantity <= 0) {
    // If the new quantity is 0 or less, remove the item
    this.items.splice(itemIndex, 1);
  } else {
    // Otherwise, validate stock and update the quantity
    const Product = mongoose.model('Product');
    const product = await Product.findById(this.items[itemIndex].product);
    if (!product || product.countInStock < newQuantity) throw new Error('Insufficient stock');
    this.items[itemIndex].quantity = newQuantity;
  }
  
  this.calculateTotalPrice();
  return this.save();
};

/**
 * @description Removes a specific item from the cart.
 * @param {string} itemId - The ID of the item to remove.
 */
CartSchema.methods.removeItem = function(itemId) {
  this.items = this.items.filter(item => item._id.toString() !== itemId);
  this.calculateTotalPrice();
  return this.save();
};

/**
 * @description Clears all items and coupons from the cart.
 */
CartSchema.methods.clear = function() {
  this.items = [];
  this.appliedCoupons = [];
  this.calculateTotalPrice();
  return this.save();
};
