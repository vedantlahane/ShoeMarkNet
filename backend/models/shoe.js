const mongoose = require('mongoose');

const shoeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  sizes: [
    {
      size: { type: String, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  colors: [{ type: String, required: true }],
  inStock: { type: Boolean, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  rating: { type: Number, required: true },
});

const Shoe = mongoose.model('Shoe', shoeSchema);

module.exports = Shoe;