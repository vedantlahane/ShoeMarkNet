const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'superadmin'], default: 'admin' },
  permissions: [{ type: String }], // e.g., ['manage-users', 'manage-orders']
  status: { type: String, enum: ['active', 'suspended', 'inactive'], default: 'active' },
  lastLogin: { type: Date }, // Stores last login timestamp
  resetToken: { type: String }, // Password reset token
  resetTokenExpiry: { type: Date }, // Expiry for reset token
}, { timestamps: true });

// Pre-save hook to hash password if modified
AdminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
AdminSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to check if admin has a specific permission
AdminSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission);
};

module.exports = mongoose.model('Admin', AdminSchema);
