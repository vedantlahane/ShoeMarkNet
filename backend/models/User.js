const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },   // New: separate names
  lastName: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,  // Auto-lowercase emails
    match: [/\S+@\S+\.\S+/, 'is invalid']  // Basic regex for email validation
  },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  source: { type: String, enum: ['web', 'email', 'social media', 'referral'], required: true },
  score: { type: Number, default: 0 },
  profilePic: { type: String },   // URL for profile picture
  addresses: [{
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String,
  }],
  isVerified: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'banned', 'pending'], default: 'active' },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  lastLogin: { type: Date },
  passwordChangedAt: { type: Date },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, { timestamps: true });

// Virtual field for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save hook: Hash password & set initial score if new
UserSchema.pre('save', async function(next) {
  // Ensure email is lowercased (redundant if 'lowercase' is used, but extra assurance)
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase();
  }
  
  // Set initial score based on source for new users
  if (this.isNew) {
    this.score = this.source === 'referral' ? 10 : 5;
  }
  
  // Hash password if it has been modified
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordChangedAt = Date.now(); // Update password change time
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare entered password with stored hash
UserSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Instance method to generate JWT token
UserSchema.methods.generateAuthToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

module.exports = mongoose.model('User', UserSchema);
