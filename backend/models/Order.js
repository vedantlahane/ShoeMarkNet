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
    price: { type: Number, required: true }, // Price at the time of purchase
    color: { type: String },
    size: { type: Number }
  }],
  
  // Financial Details
  totalPrice: { type: Number, required: true }, // Subtotal of all items
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  shippingFee: { type: Number, default: 0 },
  grandTotal: { type: Number }, // Final amount paid
  
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
    fullName: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true }
  },
  
  // Additional Notes
  notes: { type: String }
}, { timestamps: true }); // Mongoose adds `createdAt` and `updatedAt`

// ====================================================================
// ========================= SCHEMA HOOKS =============================
// ====================================================================

/**
 * @description Pre-save hook to automatically generate a unique order ID
 * and calculate the grand total before the document is saved.
 */
OrderSchema.pre('save', function(next) {
  // Generate a unique order ID if one doesn't exist
  if (!this.orderId) {
    this.orderId = `ORD-${new Date().toISOString().slice(0, 10)}-${uuidv4().slice(0, 8)}`;
  }
  
  // Calculate the grand total if it's not already set
  if (!this.grandTotal) {
    this.grandTotal = this.totalPrice + this.tax + this.shippingFee - this.discount;
  }
  
  next();
});

module.exports = mongoose.model('Order', OrderSchema);
