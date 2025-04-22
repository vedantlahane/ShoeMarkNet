const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    color: { type: String },
    size: { type: Number },
    price: { type: Number }, // Price at time of adding
  }],
  totalPrice: { type: Number, default: 0 },
}, { timestamps: true });

// Method to recalculate total price
CartSchema.methods.calculateTotalPrice = function() {
  this.totalPrice = this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
};

module.exports = mongoose.model('Cart', CartSchema);
