const mongoose = require('mongoose');

/**
 * @description Mongoose schema for the Address model.
 * This schema stores a user's address details, including fields for
 * shipping, billing, and a default address flag.
 */
const AddressSchema = new mongoose.Schema({
  // Link to the User model, required for all addresses
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Basic Address Details
  fullName: { type: String, required: true, trim: true },
  addressLine1: { type: String, required: true, trim: true },
  addressLine2: { type: String, trim: true }, // Optional second line
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  postalCode: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  
  // Flags and Address Type
  isDefault: { type: Boolean, default: false },
  addressType: { type: String, enum: ['shipping', 'billing', 'both'], default: 'both' }
}, { timestamps: true });

// ====================================================================
// ========================= SCHEMA HOOKS & INDEXES ===================
// ====================================================================

// A unique index to ensure that a user can only have one default address.
// `partialFilterExpression` ensures this uniqueness constraint only applies
// when `isDefault` is true.
AddressSchema.index(
  { user: 1, isDefault: 1 }, 
  { unique: true, partialFilterExpression: { isDefault: true } }
);

/**
 * @description Pre-save hook to ensure only one address per user is marked as default.
 * If the current address is being saved as the default, this hook will
 * automatically unset the `isDefault` flag on any other addresses for that user.
 */
AddressSchema.pre('save', async function(next) {
  try {
    // Only run this logic if the current address is being set as the default
    if (this.isDefault) {
      await mongoose.model('Address').updateMany(
        // Find all other addresses for the same user that are currently default
        { user: this.user, _id: { $ne: this._id }, isDefault: true },
        // Set their `isDefault` flag to false
        { $set: { isDefault: false } }
      );
    }
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Address', AddressSchema);
