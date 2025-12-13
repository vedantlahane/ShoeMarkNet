const mongoose = require('mongoose');

/**
 * @description Mongoose schema for the Payment model.
 * This schema records all transactions, including details about the user,
 * order, amount, payment method, and status. It's crucial for tracking
 * financial data and order fulfillment.
 */
const PaymentSchema = new mongoose.Schema({
  // Reference to the User who made the payment
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Reference to the Order associated with this payment
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  
  // Financial Details
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'INR' }, // E.g., 'INR' for Indian Rupees, 'USD', 'EUR', etc.
  
  // Transaction Information
  transactionId: { type: String, unique: true, required: true },
  paymentMethod: { type: String, enum: ['credit_card', 'debit_card', 'paypal', 'upi', 'cod'], required: true },
  paymentGateway: { type: String, enum: ['Stripe', 'PayPal', 'Razorpay', 'Paytm'], required: true },
  
  // Timestamps and Status
  transactionDate: { type: Date, default: Date.now }, // The date and time the payment was completed
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  refundStatus: { type: String, enum: ['not_requested', 'requested', 'processed'], default: 'not_requested' },
  failureReason: { type: String, default: null }, // Reason for a failed payment, if applicable
}, { timestamps: true }); // Mongoose adds `createdAt` and `updatedAt` fields

// PaymentSchema.index({ transactionId: 1 }, { unique: true });
PaymentSchema.index({ user: 1, status: 1 });
PaymentSchema.index({ order: 1 });

module.exports = mongoose.model('Payment', PaymentSchema);
