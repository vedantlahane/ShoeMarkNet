const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const AdminSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: { 
    type: String, 
    required: true,
    select: false // Don't include in queries by default
  },
  role: { 
    type: String, 
    enum: ['admin', 'superadmin'], 
    default: 'admin' 
  },
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
  status: { 
    type: String, 
    enum: ['active', 'suspended', 'inactive'], 
    default: 'active' 
  },
  
  // Security fields
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  lastLogin: Date,
  lastLoginIP: String,
  passwordChangedAt: Date,
  passwordExpiresAt: Date,
  
  // 2FA
  twoFactorSecret: { type: String, select: false },
  twoFactorEnabled: { type: Boolean, default: false },
  
  // Reset tokens
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
  // Additional info
  department: String,
  phoneNumber: String,
  avatar: String,
  
  // Created by
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Admin' 
  }
}, { 
  timestamps: true 
});

// Indexes
AdminSchema.index({ email: 1 });
AdminSchema.index({ status: 1 });
AdminSchema.index({ role: 1 });
AdminSchema.index({ 'permissions.users.read': 1 }); // Example permission index

// Export
module.exports = mongoose.model('Admin', AdminSchema);