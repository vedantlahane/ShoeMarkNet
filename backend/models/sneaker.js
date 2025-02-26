const mongoose = require('mongoose');

const sneakerSchema = new mongoose.Schema(
  {
    heading: { type: String, required: true },
    title: { type: String, required: true },
    text: { type: String, required: true },
    btn: { type: String, required: true },
    url: { type: String, required: true },
    img: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Sneaker', sneakerSchema);
