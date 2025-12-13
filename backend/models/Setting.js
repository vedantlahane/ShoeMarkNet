const mongoose = require('mongoose');

/**
 * @description Mongoose schema for the Setting model.
 * This schema stores all system-wide settings for the application, such as
 * site name, contact information, social media links, and feature flags.
 * It is designed to have a single document in the database.
 */
const SettingSchema = new mongoose.Schema({
  // Basic Site Information
  siteName: { type: String, default: 'E-Commerce Store' },
  logo: { type: String }, // URL to the site logo
  contactEmail: { type: String },
  supportPhone: { type: String },
  address: { type: String },
  
  // Social Media Links
  socialMedia: {
    facebook: { type: String },
    twitter: { type: String },
    instagram: { type: String }
  },
  
  // E-Commerce Configuration
  shippingFee: { type: Number, default: 0 },
  taxRate: { type: Number, default: 0 }, // Stored as a decimal (e.g., 0.08 for 8%)
  currency: { type: String, default: 'INR' }, // E.g., 'INR', 'USD', 'EUR', etc.
  
  // Feature Flags
  enableReviews: { type: Boolean, default: true },
  requireLoginForCheckout: { type: Boolean, default: false },
  maintenanceMode: { type: Boolean, default: false },
  
  // Payment Gateway Integrations
  paymentGateways: {
    stripe: { type: Boolean, default: false },
    paypal: { type: Boolean, default: false },
    razorpay: { type: Boolean, default: false }
  }
}, { timestamps: true }); // Mongoose adds `createdAt` and `updatedAt`

module.exports = mongoose.model('Setting', SettingSchema);
