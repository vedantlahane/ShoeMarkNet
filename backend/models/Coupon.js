const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  },
  value: {
    type: Number,
    required: true,
    min: [0, 'Coupon value cannot be negative']
  },
  minPurchase: {
    type: Number,
    default: 0,
    min: [0, 'Minimum purchase must be greater than or equal to 0']
  },
  maxDiscount: {
    type: Number,
    min: [0, 'Maximum discount cannot be negative'],
    default: null
  },
  usageLimit: {
    total: {
      type: Number,
      default: null,
      min: [0, 'Total usage limit cannot be negative']
    },
    perUser: {
      type: Number,
      default: 1,
      min: [0, 'Per-user usage limit cannot be negative']
    }
  },
  usageCount: {
    type: Number,
    default: 0,
    min: 0
  },
  userUsage: {
    type: Map,
    of: Number,
    default: {}
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  metadata: {
    description: String,
    tags: [String]
  }
}, {
  timestamps: true
});

CouponSchema.pre('save', function(next) {
  if (this.isModified('code') && this.code) {
    this.code = this.code.toUpperCase();
  }

  if (this.endDate < this.startDate) {
    return next(new Error('Coupon end date must be after the start date'));
  }

  return next();
});

CouponSchema.methods.isCurrentlyValid = function(now = new Date()) {
  if (!this.isActive) return false;
  if (now < this.startDate || now > this.endDate) return false;
  if (this.usageLimit.total && this.usageCount >= this.usageLimit.total) return false;
  return true;
};

CouponSchema.methods.getUserUsageCount = function(userId) {
  if (!userId) return 0;
  const key = String(userId);
  return Number(this.userUsage.get(key) || 0);
};

CouponSchema.methods.hasUserExceededLimit = function(userId) {
  if (!this.usageLimit.perUser) return false;
  return this.getUserUsageCount(userId) >= this.usageLimit.perUser;
};

CouponSchema.methods.calculateDiscount = function(amount) {
  if (!amount || amount <= 0) return 0;

  let discount = 0;
  if (this.type === 'percentage') {
    discount = (amount * this.value) / 100;
  } else {
    discount = this.value;
  }

  if (this.maxDiscount !== null && discount > this.maxDiscount) {
    discount = this.maxDiscount;
  }

  return Math.max(discount, 0);
};

module.exports = mongoose.model('Coupon', CouponSchema);
