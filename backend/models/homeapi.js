const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  imgsrc: { type: String, required: true },
  clip: { type: String, required: true },
});

const socialLinkSchema = new mongoose.Schema({
  icon: { type: String, required: true },
});

const homeapiSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    img: { type: String, required: true },
    btntext: { type: String, required: true },
    videos: [videoSchema],
    sociallinks: [socialLinkSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Homeapi', homeapiSchema);
