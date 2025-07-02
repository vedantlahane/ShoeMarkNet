const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  phone: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
  addressType: { type: String, enum: ['shipping', 'billing', 'both'], default: 'both' }
}, { timestamps: true });

// Ensure only one default address per user
AddressSchema.index({ user: 1, isDefault: 1 }, { unique: true, partialFilterExpression: { isDefault: true } });

// Pre-save hook to unset other defaults for the user
AddressSchema.pre('save', async function(next) {
  try {
    if (this.isDefault) {
      await mongoose.model('Address').updateMany(
        { user: this.user, _id: { $ne: this._id }, isDefault: true },
        { $set: { isDefault: false } }
      );
    }
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Address', AddressSchema);
