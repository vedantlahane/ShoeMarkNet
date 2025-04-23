const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'is invalid']
  },
  phone: { type: String },
  password: { type: String, required: true },
  source: { type: String, enum: ['web', 'email', 'social_media', 'referral','direct','other','facebook','instagram','google'], default: 'web' },
  score: { type: Number, default: 0 }, // Lead score
  profilePic: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  lastLogin: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
  preferences: {
    newsletter: { type: Boolean, default: false },
    marketing: { type: Boolean, default: false }
  }
}, { timestamps: true });

// Pre-save hook to hash password
UserSchema.pre('save', async function(next) {
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
UserSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
