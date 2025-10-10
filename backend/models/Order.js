const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Used to generate unique order IDs

/**
 * @description Mongoose schema for the Order model.
 * This schema stores all information related to a customer's order, including
 * products, pricing, payment details, and shipping information.
 */
const OrderSchema = new mongoose.Schema({
  // A human-readable and unique order ID, auto-generated before saving.
  orderId: { type: String, unique: true },
  
  // Reference to the user who placed the order.
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Array of products included in the order.
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 }, // Price at the time of purchase
    color: { type: String },
    size: { type: String }
  }],
  
  // Financial Details
  totalPrice: { type: Number, required: true, min: 0 }, // Subtotal of all items
  discount: { type: Number, default: 0, min: 0 },
  tax: { type: Number, default: 0, min: 0 },
  shippingFee: { type: Number, default: 0, min: 0 },
  grandTotal: { type: Number, min: 0 }, // Final amount paid
  coupon: {
    couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
    code: { type: String },
    discountType: { type: String, enum: ['percentage', 'fixed'] },
    discountValue: { type: Number, min: 0 },
    discountAmount: { type: Number, min: 0 },
    appliedAt: { type: Date }
  },
  
  // Payment Information
  paymentMethod: { type: String, enum: ['credit_card', 'paypal', 'cod', 'upi'], required: true },
  paymentResult: { // Details returned from the payment gateway
    id: { type: String },
    status: { type: String },
    update_time: { type: String },
    email_address: { type: String }
  },
  isPaid: { type: Boolean, default: false },
  paidAt: { type: Date },
  
  // Order Status and Fulfillment
  status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  isDelivered: { type: Boolean, default: false },
  deliveredAt: { type: Date },
  trackingNumber: { type: String },
  estimatedDelivery: { type: Date },
  
  // Shipping Address
  shippingAddress: {
    fullName: { type: String, required: true, trim: true },
    addressLine1: { type: String, required: true, trim: true },
    addressLine2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true }
  },
  
  // Additional Notes
  notes: { type: String }
}, { timestamps: true }); // Mongoose adds `createdAt` and `updatedAt`

OrderSchema.virtual('itemCount').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

OrderSchema.methods.calculateTotals = function() {
  if (!Array.isArray(this.items) || this.items.length === 0) {
    throw new Error('Order must contain at least one item');
  }

  this.totalPrice = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = Math.min(this.discount || 0, this.totalPrice);
  if (this.coupon && this.coupon.discountAmount !== undefined) {
    this.coupon.discountAmount = Math.min(this.coupon.discountAmount || 0, this.totalPrice);
  }
  const tax = this.tax || 0;
  const shipping = this.shippingFee || 0;
  this.grandTotal = Math.max(this.totalPrice + tax + shipping - discount, 0);
};

OrderSchema.index({ user: 1, status: 1 });
// OrderSchema.index({ orderId: 1 });

// ====================================================================
// ========================= SCHEMA HOOKS =============================
// ====================================================================

OrderSchema.pre('validate', function(next) {
  try {
    this.calculateTotals();
    next();
  } catch (err) {
    next(err);
  }
});

/**
 * @description Pre-save hook to automatically generate a unique order ID
 * and calculate the grand total before the document is saved.
 */
OrderSchema.pre('save', function(next) {
  // Generate a unique order ID if one doesn't exist
  if (!this.orderId) {
    this.orderId = `ORD-${new Date().toISOString().slice(0, 10)}-${uuidv4().slice(0, 8)}`;
  }
  
  // Totals are recalculated during validation but ensure they exist
  if (this.grandTotal === undefined || this.grandTotal === null) {
    this.calculateTotals();
  }

  next();
});

module.exports = mongoose.model('Order', OrderSchema);
