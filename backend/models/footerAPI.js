const mongoose = require('mongoose');

const titleSchema = new mongoose.Schema({
  title: { type: String, required: true },
});

const linkSchema = new mongoose.Schema({
  link: { type: String, required: true },
});

const footerAPISchema = new mongoose.Schema(
  {
    titles: [titleSchema],
    // Using an array of arrays for links:
    links: {
      type: [[linkSchema]],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FooterAPI', footerAPISchema);
