const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // bcrypt for hashing passwords, what is does is that it takes a password and generates a hash that is stored in the database, when a user logs in, the entered password is hashed again and compared with the stored hash to verify the password

const PHONE_REGEX = /^\+?[0-9]{7,15}$/;

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2 },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, 'is invalid'] // regular expression to validate email format
  },
  phone: {
    type: String,
    trim: true,
    match: [PHONE_REGEX, 'Please provide a valid phone number'],
    sparse: true
  },
  password: { type: String, required: true, minlength: 8 },
  source: { type: String, enum: ['web', 'email', 'social_media', 'referral', 'direct', 'other', 'facebook', 'instagram', 'google'], default: 'web' },
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
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Indexes for faster lookups and to enforce unique constraints
// UserSchema.index({ email: 1 }, { unique: true });
// UserSchema.index({ phone: 1 }, { sparse: true });

// Pre-save hook to normalize data and hash password
UserSchema.pre('save', async function(next) {
  if (this.isModified('email') && this.email) {
    this.email = this.email.toLowerCase().trim();
  }

  if (this.isModified('phone') && this.phone === '') {
    this.phone = undefined;
  }

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

// Hide sensitive fields when converting to JSON/Objects
UserSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    delete ret.password;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpire;
    delete ret.emailVerificationToken;
    return ret;
  }
});

UserSchema.set('toObject', {
  virtuals: true,
  transform: (_, ret) => {
    delete ret.password;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpire;
    delete ret.emailVerificationToken;
    return ret;
  }
});

module.exports = mongoose.model('User', UserSchema);
