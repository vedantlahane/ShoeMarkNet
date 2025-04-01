const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' }, // Default to Indian Rupees (or 'USD' as per region)
  transactionId: { type: String, unique: true, required: true },
  paymentMethod: { type: String, enum: ['credit_card', 'debit_card', 'paypal', 'upi', 'cod'], required: true },
  paymentGateway: { type: String, enum: ['Stripe', 'PayPal', 'Razorpay', 'Paytm'], required: true },
  transactionDate: { type: Date, default: Date.now }, // Store when payment was completed
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  refundStatus: { type: String, enum: ['not_requested', 'requested', 'processed'], default: 'not_requested' },
  failureReason: { type: String, default: null }, // Store reason if payment fails
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
