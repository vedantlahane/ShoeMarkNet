const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    shoe: { type: mongoose.Schema.Types.ObjectId, ref: 'Shoe', required: true },
    size: { type: Number, required: true },
    quantity: { type: Number, required: true }
  }],
}, { timestamps: true });

module.exports = mongoose.model('Cart', CartSchema);
