const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['discount', 'promotion', 'sale', 'email'], required: true },
  targetAudience: { type: String, enum: ['all', 'new_users', 'existing_users', 'inactive_users'] },
  discount: {
    type: { type: String, enum: ['percentage', 'fixed'] },
    value: { type: Number }
  },
  startDate: { type: Date },
  endDate: { type: Date },
  description: { type: String },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Campaign', CampaignSchema);
