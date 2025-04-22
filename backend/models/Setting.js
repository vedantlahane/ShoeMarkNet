const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
  siteName: { type: String, default: 'E-Commerce Store' },
  logo: { type: String },
  contactEmail: { type: String },
  supportPhone: { type: String },
  address: { type: String },
  socialMedia: {
    facebook: { type: String },
    twitter: { type: String },
    instagram: { type: String }
  },
  shippingFee: { type: Number, default: 0 },
  taxRate: { type: Number, default: 0 },
  enableReviews: { type: Boolean, default: true },
  requireLoginForCheckout: { type: Boolean, default: false },
  maintenanceMode: { type: Boolean, default: false },
  currency: { type: String, default: 'INR' },
  paymentGateways: {
    stripe: { type: Boolean, default: false },
    paypal: { type: Boolean, default: false },
    razorpay: { type: Boolean, default: false }
  }
}, { timestamps: true });

module.exports = mongoose.model('Setting', SettingSchema);
