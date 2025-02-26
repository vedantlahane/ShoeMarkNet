const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  text: { type: String, required: true },
  img: { type: String, required: true },
  url: { type: String, required: true },
  like: { type: String, required: true },
  time: { type: String, required: true },
  by: { type: String, required: true },
  btn: { type: String, required: true },
});

const storySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    news: [newsSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Story', storySchema);
