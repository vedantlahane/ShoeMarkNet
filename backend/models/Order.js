const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Generate unique order IDs

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true }, // Readable order ID
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    shoe: { type: mongoose.Schema.Types.ObjectId, ref: 'Shoe', required: true },
    color: { type: String, required: true }, // Track selected color
    size: { type: Number, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  totalPrice: { type: Number, required: true },
  discount: { type: Number, default: 0 }, // Discount applied
  tax: { type: Number, default: 0 }, // Tax applied
  grandTotal: { type: Number, required: true }, // Computed total price
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  paymentMethod: { type: String, enum: ['credit_card', 'paypal', 'cod'], required: true },
  paymentDetails: {
    transactionId: { type: String }, // Store transaction reference
    paymentDate: { type: Date }
  },
  status: { type: String, enum: ['pending', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  trackingNumber: { type: String }, // Store tracking ID for shipping
  estimatedDelivery: { type: Date }, // Expected delivery date
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String,
  },
  isReviewed: { type: Boolean, default: false }, // Track if the order has been reviewed
}, { timestamps: true });

// Auto-generate order ID before saving
OrderSchema.pre('save', function(next) {
  if (!this.orderId) {
    this.orderId = `ORD-${new Date().toISOString().slice(0, 10)}-${uuidv4().slice(0, 8)}`;
  }
  next();
});

module.exports = mongoose.model('Order', OrderSchema);
