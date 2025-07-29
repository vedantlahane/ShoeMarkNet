const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // index removed - explicit index below
  sessionId: { type: String }, // For guest carts - index removed - explicit index below

  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1, max: 99 },
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

  subtotal: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  shippingAmount: { type: Number, default: 0 },
  totalPrice: { type: Number, default: 0 },

  appliedCoupons: [{
    code: String,
    discountAmount: Number,
    discountType: { type: String, enum: ['percentage', 'fixed'] }
  }],

  status: { type: String, enum: ['active', 'abandoned', 'converted', 'merged'], default: 'active' },
  lastActivityAt: { type: Date, default: Date.now },
  abandonedAt: Date,
  reminderSent: { type: Boolean, default: false },

  expiresAt: { type: Date, default: Date.now, expires: 30 * 24 * 60 * 60 }
}, { timestamps: true });

CartSchema.index({ user: 1 }, { unique: true, partialFilterExpression: { user: { $exists: true } } });
CartSchema.index({ sessionId: 1 }, { unique: true, partialFilterExpression: { sessionId: { $exists: true } } });
CartSchema.index({ user: 1, status: 1 });
CartSchema.index({ sessionId: 1, status: 1 });

// Pre-save: update lastActivityAt and handle abandonment
CartSchema.pre('save', function(next) {
  this.lastActivityAt = new Date();
  if (this.items.length > 0 && this.status === 'active') {
    const hoursSinceActivity = (Date.now() - this.lastActivityAt) / (1000 * 60 * 60);
    if (hoursSinceActivity > 2) {
      this.status = 'abandoned';
      this.abandonedAt = new Date();
    }
  }
  next();
});

// Virtuals
CartSchema.virtual('itemCount').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});
CartSchema.virtual('isEmpty').get(function() {
  return this.items.length === 0;
});

// Methods: calculate totals, add/update/remove/clear items, apply coupon, validate stock, merge carts
CartSchema.methods.calculateTotalPrice = function() {
  this.subtotal = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  this.discountAmount = this.appliedCoupons.reduce((total, c) => total + c.discountAmount, 0);
  this.taxAmount = (this.subtotal - this.discountAmount) * 0.08;
  this.totalPrice = this.subtotal - this.discountAmount + this.taxAmount + this.shippingAmount;
  return this.totalPrice;
};

CartSchema.methods.addItem = async function(productId, quantity, variant = {}) {
  const existingItemIndex = this.items.findIndex(item =>
    item.product.toString() === productId.toString() &&
    item.variant.color === variant.color &&
    item.variant.size === variant.size
  );
  if (existingItemIndex > -1) {
    this.items[existingItemIndex].quantity += quantity;
  } else {
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

CartSchema.methods.updateQuantity = async function(itemId, newQuantity) {
  const itemIndex = this.items.findIndex(item => item._id.toString() === itemId);
  if (itemIndex === -1) throw new Error('Item not found in cart');
  if (newQuantity <= 0) {
    this.items.splice(itemIndex, 1);
  } else {
    const Product = mongoose.model('Product');
    const product = await Product.findById(this.items[itemIndex].product);
    if (!product || product.countInStock < newQuantity) throw new Error('Insufficient stock');
    this.items[itemIndex].quantity = newQuantity;
  }
  this.calculateTotalPrice();
  return this.save();
};

CartSchema.methods.removeItem = function(itemId) {
  this.items = this.items.filter(item => item._id.toString() !== itemId);
  this.calculateTotalPrice();
  return this.save();
};

CartSchema.methods.clear = function() {
  this.items = [];
  this.appliedCoupons = [];
  this.calculateTotalPrice();
  return this.save();
};

// ... (other methods like applyCoupon, validateStock, merge, sendAbandonmentReminders as in your code)

module.exports = mongoose.model('Cart', CartSchema);
