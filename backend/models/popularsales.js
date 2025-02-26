const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  text: { type: String, required: true },
  rating: { type: String, required: true },
  btn: { type: String, required: true },
  img: { type: String, required: true },
  price: { type: String, required: true },
  color: { type: String, required: true },
  shadow: { type: String, required: true },
});

const popularsalesSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    items: [itemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Popularsales', popularsalesSchema);
