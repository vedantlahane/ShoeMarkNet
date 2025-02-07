//// filepath: /home/vedant/Desktop/ShoeMarkNet/backend/models/data.js
const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
  homeapi: Object,
  popularsales: Object,
  highlight: Object,
  sneaker: Object,
  toprateslaes: Object,
  story: Object,
  footerAPI: Object,
});

module.exports = mongoose.model("Data", dataSchema);