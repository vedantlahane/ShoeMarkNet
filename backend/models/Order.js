const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    shoe: { type: mongoose.Schema.Types.ObjectId, ref: 'Shoe', required: true },
    size: { type: Number, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  totalPrice: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  paymentMethod: { type: String, enum: ['credit_card', 'paypal', 'cod'], required: true },
  status: { type: String, enum: ['pending', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
