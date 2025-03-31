const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  amount: { type: Number, required: true },
  transactionId: { type: String, unique: true, required: true },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
