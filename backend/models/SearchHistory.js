const mongoose = require('mongoose');

const SearchHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  query: { type: String, required: true },
  resultsCount: { type: Number, default: 0 },
  filters: { type: Map, of: String }
}, { timestamps: true });

module.exports = mongoose.model('SearchHistory', SearchHistorySchema);
