const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Generate unique order IDs

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true }, // Readable order ID
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }, // Price at time of purchase
    color: { type: String },
    size: { type: Number }
  }],
  totalPrice: { type: Number, required: true },
  discount: { type: Number, default: 0 }, // Discount applied
  tax: { type: Number, default: 0 }, // Tax applied
  shippingFee: { type: Number, default: 0 },
  grandTotal: { type: Number }, // Final amount after discounts, tax, shipping
  paymentMethod: { type: String, enum: ['credit_card', 'paypal', 'cod', 'upi'], required: true },
  paymentResult: {
    id: { type: String },
    status: { type: String },
    update_time: { type: String },
    email_address: { type: String }
  },
  isPaid: { type: Boolean, default: false },
  paidAt: { type: Date },
  status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  isDelivered: { type: Boolean, default: false },
  deliveredAt: { type: Date },
  trackingNumber: { type: String },
  estimatedDelivery: { type: Date },
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
  notes: { type: String } // Customer notes for the order
}, { timestamps: true });

// Auto-generate order ID before saving
OrderSchema.pre('save', function(next) {
  if (!this.orderId) {
    this.orderId = `ORD-${new Date().toISOString().slice(0, 10)}-${uuidv4().slice(0, 8)}`;
  }
  
  // Calculate grand total
  if (!this.grandTotal) {
    this.grandTotal = this.totalPrice + this.tax + this.shippingFee - this.discount;
  }
  
  next();
});

module.exports = mongoose.model('Order', OrderSchema);
