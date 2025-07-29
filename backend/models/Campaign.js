const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema({
  // Basic Information
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: [100, 'Campaign name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  code: {
    type: String,
    unique: true,
    uppercase: true,
    sparse: true // Allows null values while maintaining uniqueness
    // index: true removed - unique already creates an index
  },
  description: { 
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Campaign Type and Configuration
  type: { 
    type: String, 
    enum: ['discount', 'promotion', 'sale', 'email', 'loyalty', 'referral', 'bundle'], 
    required: true 
  },
  
  // Discount Configuration
  discount: {
    type: { 
      type: String, 
      enum: ['percentage', 'fixed', 'bogo', 'bundle'] 
    },
    value: { 
      type: Number,
      min: [0, 'Discount value cannot be negative']
    },
    maxDiscountAmount: { 
      type: Number,
      min: [0, 'Max discount amount cannot be negative']
    }, // Cap for percentage discounts
    minimumPurchase: {
      type: Number,
      default: 0,
      min: [0, 'Minimum purchase cannot be negative']
    }
  },
  
  // Bundle/BOGO Configuration
  bundleConfig: {
    buyQuantity: { type: Number, min: 1 },
    getQuantity: { type: Number, min: 0 },
    getDiscountPercentage: { type: Number, min: 0, max: 100 }
  },
  
  // Timing
  startDate: { 
    type: Date,
    required: true,
    index: true
  },
  endDate: { 
    type: Date,
    required: true,
    index: true
  },
  
  // Scheduling (for recurring campaigns)
  schedule: {
    isRecurring: { type: Boolean, default: false },
    frequency: { 
      type: String, 
      enum: ['daily', 'weekly', 'monthly'] 
    },
    daysOfWeek: [{ 
      type: Number, 
      min: 0, 
      max: 6 
    }], // 0 = Sunday, 6 = Saturday
    timeOfDay: {
      start: String, // "09:00"
      end: String    // "17:00"
    }
  },
  
  // Targeting
  targetAudience: {
    segments: [{
      type: String,
      enum: ['all', 'new_users', 'existing_users', 'inactive_users', 'vip', 'subscribers']
    }],
    userTags: [String], // Custom tags
    minimumOrderCount: { type: Number, min: 0 },
    minimumLifetimeValue: { type: Number, min: 0 },
    specificUsers: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }]
  },
  
  // Product/Category Targeting
  applicableItems: {
    allProducts: { type: Boolean, default: false },
    products: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Product' 
    }],
    categories: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Category' 
    }],
    brands: [String],
    excludedProducts: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Product' 
    }],
    excludedCategories: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Category' 
    }]
  },
  
  // Usage Limits
  usageLimits: {
    totalUses: { 
      type: Number, 
      default: null // null = unlimited
    },
    usesPerCustomer: { 
      type: Number, 
      default: 1 
    },
    currentUses: { 
      type: Number, 
      default: 0 
    }
  },
  
  // Budget Management
  budget: {
    totalBudget: { type: Number, min: 0 },
    currentSpend: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' }
  },
  
  // Geographic Restrictions
  geoRestrictions: {
    countries: [String], // ISO country codes
    regions: [String],
    cities: [String],
    postalCodes: [String]
  },
  
  // Channel Configuration
  channels: {
    website: { type: Boolean, default: true },
    mobile: { type: Boolean, default: true },
    pos: { type: Boolean, default: false },
    email: { type: Boolean, default: false }
  },
  
  // Status and Visibility
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled'],
    default: 'draft'
  },
  isActive: { 
    type: Boolean, 
    default: true,
    index: true
  },
  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }, // Higher priority campaigns apply first
  
  // Stacking Rules
  stackingRules: {
    allowStacking: { type: Boolean, default: false },
    stackableWith: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Campaign' 
    }],
    exclusiveWith: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Campaign' 
    }]
  },
  
  // Analytics
  analytics: {
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 }
  },
  
  // Usage History
  usageHistory: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    usedAt: { type: Date, default: Date.now },
    discountAmount: Number,
    orderTotal: Number
  }],
  
  // Content for Marketing
  marketing: {
    bannerImage: String,
    thumbnailImage: String,
    emailTemplate: String,
    landingPageUrl: String,
    terms: String,
    hashtags: [String]
  },
  
  // Metadata
  tags: [String],
  notes: String,
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Admin',
    required: true
  },
  lastModifiedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Admin'
  }
}, { 
  timestamps: true 
});

// Indexes for performance
// code index is already created by unique: true
CampaignSchema.index({ status: 1, isActive: 1 });
CampaignSchema.index({ startDate: 1, endDate: 1 });
CampaignSchema.index({ type: 1 });
CampaignSchema.index({ 'targetAudience.segments': 1 });
CampaignSchema.index({ priority: -1 });

// Compound indexes for common queries
CampaignSchema.index({ 
  isActive: 1, 
  startDate: 1, 
  endDate: 1, 
  status: 1 
});

// Text index for search
CampaignSchema.index({ 
  name: 'text', 
  description: 'text', 
  code: 'text' 
});

// Virtual for checking if campaign is currently valid
CampaignSchema.virtual('isCurrentlyValid').get(function() {
  const now = new Date();
  return this.isActive && 
         this.status === 'active' &&
         this.startDate <= now && 
         this.endDate >= now &&
         (!this.usageLimits.totalUses || this.usageLimits.currentUses < this.usageLimits.totalUses) &&
         (!this.budget.totalBudget || this.budget.currentSpend < this.budget.totalBudget);
});

// Virtual for remaining budget
CampaignSchema.virtual('remainingBudget').get(function() {
  if (!this.budget.totalBudget) return null;
  return this.budget.totalBudget - this.budget.currentSpend;
});

// Virtual for usage percentage
CampaignSchema.virtual('usagePercentage').get(function() {
  if (!this.usageLimits.totalUses) return null;
  return (this.usageLimits.currentUses / this.usageLimits.totalUses) * 100;
});

// Pre-save validation
CampaignSchema.pre('save', async function(next) {
  // Validate dates
  if (this.endDate && this.startDate && this.endDate < this.startDate) {
    return next(new Error('End date must be after start date'));
  }
  
  // Generate slug if name is modified
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
  }
  
  // Generate code if not provided
  if (!this.code && ['discount', 'promotion'].includes(this.type)) {
    this.code = await generateUniqueCode();
  }
  
  // Update status based on dates
  const now = new Date();
  if (this.startDate > now) {
    this.status = 'scheduled';
  } else if (this.endDate < now) {
    this.status = 'completed';
  } else if (this.isActive && this.status === 'scheduled') {
    this.status = 'active';
  }
  
  next();
});

// Methods
CampaignSchema.methods.canBeUsedBy = async function(userId) {
  // Check if campaign is valid
  if (!this.isCurrentlyValid) return false;
  
  // Check user targeting
  if (this.targetAudience.specificUsers.length > 0) {
    if (!this.targetAudience.specificUsers.includes(userId)) return false;
  }
  
  // Check usage limits
  if (this.usageLimits.usesPerCustomer) {
    const userUses = this.usageHistory.filter(
      h => h.user.toString() === userId.toString()
    ).length;
    
    if (userUses >= this.usageLimits.usesPerCustomer) return false;
  }
  
  return true;
};

CampaignSchema.methods.recordUsage = async function(userId, orderId, discountAmount, orderTotal) {
  this.usageLimits.currentUses += 1;
  this.budget.currentSpend += discountAmount;
  this.analytics.conversions += 1;
  this.analytics.revenue += orderTotal;
  
  this.usageHistory.push({
    user: userId,
    order: orderId,
    discountAmount,
    orderTotal
  });
  
  // Update average order value
  this.analytics.averageOrderValue = 
    this.analytics.revenue / this.analytics.conversions;
  
  return this.save();
};

CampaignSchema.methods.calculateDiscount = function(originalAmount, productCount = 1) {
  if (!this.discount.type) return 0;
  
  let discountAmount = 0;
  
  switch (this.discount.type) {
    case 'percentage':
      discountAmount = originalAmount * (this.discount.value / 100);
      if (this.discount.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, this.discount.maxDiscountAmount);
      }
      break;
      
    case 'fixed':
      discountAmount = this.discount.value;
      break;
      
    case 'bogo':
      if (this.bundleConfig && productCount >= this.bundleConfig.buyQuantity) {
        const freeItems = Math.floor(productCount / this.bundleConfig.buyQuantity) * 
                         this.bundleConfig.getQuantity;
        discountAmount = (originalAmount / productCount) * freeItems * 
                        (this.bundleConfig.getDiscountPercentage / 100);
      }
      break;
  }
  
  return Math.min(discountAmount, originalAmount);
};

// Helper function to generate unique code
async function generateUniqueCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code;
  let isUnique = false;
  
  while (!isUnique) {
    code = '';
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    const existing = await mongoose.models.Campaign.findOne({ code });
    if (!existing) isUnique = true;
  }
  
  return code;
}

module.exports = mongoose.model('Campaign', CampaignSchema);