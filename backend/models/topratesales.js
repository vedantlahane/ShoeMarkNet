const mongoose = require('mongoose');

const topRateItemSchema = new mongoose.Schema({
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

const topratesalesSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    items: [topRateItemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Topratesales', topratesalesSchema);
