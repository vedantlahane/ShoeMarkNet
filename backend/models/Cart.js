const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    shoe: { type: mongoose.Schema.Types.ObjectId, ref: 'Shoe', required: true },
    color: { type: String, required: true }, // Selected color
    size: { type: Number, required: true }, // Selected size
    quantity: { type: Number, required: true, min: 1 },
    priceAtTimeOfAdding: { type: Number, required: true }, // Store price at time of adding
    discount: { type: Number, default: 0 }, // Store any applied discount
  }],
}, { timestamps: true });

// Virtual field to calculate total cart price
CartSchema.virtual('totalPrice').get(function () {
  return this.items.reduce((total, item) => {
    const discountedPrice = item.priceAtTimeOfAdding - (item.discount || 0);
    return total + discountedPrice * item.quantity;
  }, 0);
});

module.exports = mongoose.model('Cart', CartSchema);
