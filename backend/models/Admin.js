const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * @description Mongoose schema for the Admin model.
 * This schema defines the structure for administrative users, including
 * authentication details, granular permissions, and account status.
 */
const AdminSchema = new mongoose.Schema({
  // Basic Information
  name: { type: String, required: true, trim: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  // Password is not selected by default for security
  password: { type: String, required: true, select: false },
  
  // Roles and Permissions
  role: { type: String, enum: ['admin', 'superadmin'], default: 'admin' },
  permissions: {
    users: {
      read: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    products: {
      read: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    orders: {
      read: { type: Boolean, default: false },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    reviews: {
      read: { type: Boolean, default: false },
      moderate: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    campaigns: {
      read: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    settings: {
      read: { type: Boolean, default: false },
      update: { type: Boolean, default: false }
    }
  },
  
  // Account Status and Security
  status: { type: String, enum: ['active', 'suspended', 'inactive'], default: 'active' },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date, // Account is locked until this date
  lastLogin: Date,
  lastLoginIP: String,
  passwordChangedAt: Date,
  passwordExpiresAt: Date,
  
  // Two-Factor Authentication (2FA)
  twoFactorSecret: { type: String, select: false }, // Store 2FA secret (not selected by default)
  twoFactorEnabled: { type: Boolean, default: false },
  
  // Password Reset
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
  // Additional Admin Information
  department: String,
  phoneNumber: String,
  avatar: String,
  // Link to the admin who created this record
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
}, { timestamps: true });

// ====================================================================
// ========================= SCHEMA HOOKS & METHODS ===================
// ====================================================================

// Indexes for improved query performance
AdminSchema.index({ email: 1 });
AdminSchema.index({ status: 1 });
AdminSchema.index({ role: 1 });
AdminSchema.index({ 'permissions.users.read': 1 });

/**
 * @description Pre-save hook to hash the password before saving a new user
 * or updating an existing user's password.
 */
AdminSchema.pre('save', async function(next) {
  // Only run this if the password field has been modified
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

/**
 * @description Method to compare a plain-text password with the stored hashed password.
 * @param {string} candidatePassword - The password to check
 * @returns {Promise<boolean>} - True if passwords match, false otherwise
 */
AdminSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Admin', AdminSchema);
