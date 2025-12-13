const mongoose = require('mongoose');

/**
 * @description Mongoose schema for the SearchHistory model.
 * This schema tracks a user's search queries, the number of results they received,
 * and any filters they applied. This data is valuable for analytics, personalization,
 * and improving search functionality.
 */
const SearchHistorySchema = new mongoose.Schema({
  // Reference to the user who performed the search. This field is optional
  // to support guest users who may not be logged in.
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // The actual search query string.
  query: { type: String, required: true },
  
  // The number of results returned by the search.
  resultsCount: { type: Number, default: 0 },
  
  // A map to store any filters that were applied during the search.
  // E.g., `filters: { category: 'electronics', brand: 'sony' }`
  filters: { type: Map, of: String }
}, { timestamps: true }); // Mongoose adds `createdAt` and `updatedAt`

module.exports = mongoose.model('SearchHistory', SearchHistorySchema);
