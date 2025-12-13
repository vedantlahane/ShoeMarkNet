const mongoose = require('mongoose');
const slugify = require('slugify');

/**
 * @description Mongoose schema for the Campaign model.
 * This schema is designed to handle complex marketing campaigns, including
 * discounts, promotions, loyalty programs, and more. It includes fields for
 * targeting, usage limits, budget management, and analytics.
 */
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
  
  // Discount Configuration (for 'discount' and 'promotion' types)
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
  
  // Bundle/BOGO (Buy One Get One) Configuration
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
  
  // Scheduling for recurring campaigns
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
  
  // Targeting specific user groups or demographics
  targetAudience: {
    segments: [{
      type: String,
      enum: ['all', 'new_users', 'existing_users', 'inactive_users', 'vip', 'subscribers']
    }],
    userTags: [String], // Custom tags for advanced filtering
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
  isPublic: {
    type: Boolean,
    default: false,
    index: true
  },
  bannerImage: {
    type: String,
    trim: true
  },
  ctaUrl: {
    type: String,
    trim: true
  },
  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }, // Higher priority campaigns apply first
  
  // Stacking Rules (e.g., can this campaign be combined with others?)
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

// ====================================================================
// ========================= SCHEMA HOOKS & METHODS ===================
// ====================================================================

// Indexes for performance
// The 'code' index is already created by `unique: true`
CampaignSchema.index({ status: 1, isActive: 1 });
CampaignSchema.index({ startDate: 1, endDate: 1 });
CampaignSchema.index({ type: 1 });
CampaignSchema.index({ 'targetAudience.segments': 1 });
CampaignSchema.index({ priority: -1 });
CampaignSchema.index({ isPublic: 1, status: 1 });

// Compound index for common queries to find active campaigns
CampaignSchema.index({ 
  isActive: 1, 
  startDate: 1, 
  endDate: 1, 
  status: 1 
});

// Text index for search functionality on key fields
CampaignSchema.index({ 
  name: 'text', 
  description: 'text', 
  code: 'text' 
});

/**
 * @description Virtual field to check if a campaign is currently active and valid.
 * This combines checks for `isActive`, `status`, dates, and usage limits.
 */
CampaignSchema.virtual('isCurrentlyValid').get(function() {
  const now = new Date();
  return this.isActive && 
         this.status === 'active' &&
         this.startDate <= now && 
         this.endDate >= now &&
         (!this.usageLimits.totalUses || this.usageLimits.currentUses < this.usageLimits.totalUses) &&
         (!this.budget.totalBudget || this.budget.currentSpend < this.budget.totalBudget);
});

/**
 * @description Virtual field to calculate the remaining budget of the campaign.
 */
CampaignSchema.virtual('remainingBudget').get(function() {
  if (!this.budget.totalBudget) return null;
  return this.budget.totalBudget - this.budget.currentSpend;
});

/**
 * @description Virtual field to calculate the percentage of usage limit consumed.
 */
CampaignSchema.virtual('usagePercentage').get(function() {
  if (!this.usageLimits.totalUses) return null;
  return (this.usageLimits.currentUses / this.usageLimits.totalUses) * 100;
});

/**
 * @description Pre-save hook for validation and auto-generation of data.
 * It handles slug and code generation and updates the campaign status based on dates.
 */
CampaignSchema.pre('save', async function(next) {
  // Validate dates
  if (this.endDate && this.startDate && this.endDate < this.startDate) {
    return next(new Error('End date must be after start date'));
  }
  
  // Generate slug if name is modified and slug is not already present
  if (this.isModified('name') && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  
  // Generate a unique code if one is not provided and the campaign type is applicable
  if (!this.code && ['discount', 'promotion'].includes(this.type)) {
    this.code = await generateUniqueCode();
  }
  
  // Automatically update the campaign status based on the current date
  const now = new Date();
  if (this.status === 'draft' && this.startDate <= now) {
    this.status = 'active';
  } else if (this.startDate > now) {
    this.status = 'scheduled';
  } else if (this.endDate < now) {
    this.status = 'completed';
  }
  
  next();
});

// ====================================================================
// ========================== SCHEMA METHODS ==========================
// ====================================================================

/**
 * @description Checks if a campaign can be used by a specific user.
 * It verifies the campaign's validity and checks against user-specific usage limits.
 * @param {string} userId - The ID of the user to check
 * @returns {Promise<boolean>} - True if the user can use the campaign, false otherwise
 */
CampaignSchema.methods.canBeUsedBy = async function(userId) {
  // Check if the campaign is generally valid
  if (!this.isCurrentlyValid) return false;
  
  // Check against specific user targeting
  if (this.targetAudience.specificUsers.length > 0) {
    if (!this.targetAudience.specificUsers.includes(userId)) return false;
  }
  
  // Check if the user has reached their per-customer usage limit
  if (this.usageLimits.usesPerCustomer) {
    const userUses = this.usageHistory.filter(
      h => h.user.toString() === userId.toString()
    ).length;
    
    if (userUses >= this.usageLimits.usesPerCustomer) return false;
  }
  
  return true;
};

/**
 * @description Records the usage of a campaign for a specific user and order.
 * Updates usage counts, budget, and analytics.
 * @param {string} userId - The ID of the user who used the campaign
 * @param {string} orderId - The ID of the order where the campaign was applied
 * @param {number} discountAmount - The amount discounted by the campaign
 * @param {number} orderTotal - The total value of the order
 * @returns {Promise<Document>} - The saved Campaign document
 */
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

/**
 * @description Calculates the discount amount for a given purchase.
 * @param {number} originalAmount - The original total amount of the purchase
 * @param {number} productCount - The number of products in the purchase (for bundle/BOGO)
 * @returns {number} - The calculated discount amount, capped at the original amount
 */
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
        const freeItems = Math.floor(productCount / this.bundleConfig.buyQuantity) * this.bundleConfig.getQuantity;
        discountAmount = (originalAmount / productCount) * freeItems * (this.bundleConfig.getDiscountPercentage / 100);
      }
      break;
  }
  
  return Math.min(discountAmount, originalAmount);
};

// Helper function to generate a unique 8-character alphanumeric code
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
