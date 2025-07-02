const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  // Support both registered and guest users
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    index: true
  },
  sessionId: { 
    type: String, 
    index: true 
  }, // For guest users
  
  // Enhanced item structure
  items: [{
    product: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Product', 
      required: true 
    },
    quantity: { 
      type: Number, 
      required: true, 
      min: [1, 'Quantity must be at least 1'],
      max: [99, 'Quantity cannot exceed 99']
    },
    
    // Variant details
    variant: {
      color: { type: String },
      size: { type: String }, // Changed to String for flexibility (S, M, L, XL or 8, 9, 10)
      sku: { type: String }
    },
    
    // Price tracking
    price: { 
      type: Number, 
      required: true 
    }, // Current price
    originalPrice: { type: Number }, // Price before any discounts
    
    // Stock validation
    isInStock: { type: Boolean, default: true },
    stockCheckedAt: { type: Date, default: Date.now },
    
    // Metadata
    addedAt: { type: Date, default: Date.now }
  }],
  
  // Pricing breakdown
  subtotal: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  shippingAmount: { type: Number, default: 0 },
  totalPrice: { type: Number, default: 0 },
  
  // Applied discount codes
  appliedCoupons: [{
    code: { type: String },
    discountAmount: { type: Number },
    discountType: { type: String, enum: ['percentage', 'fixed'] }
  }],
  
  // Cart state
  status: {
    type: String,
    enum: ['active', 'abandoned', 'converted'],
    default: 'active'
  },
  
  // Abandonment tracking
  lastActivityAt: { type: Date, default: Date.now },
  abandonedAt: { type: Date },
  reminderSent: { type: Boolean, default: false },
  
  // Expiry (auto-cleanup after 30 days)
  expiresAt: { 
    type: Date, 
    default: Date.now,
    expires: 30 * 24 * 60 * 60 // 30 days
  }
}, { 
  timestamps: true 
});

// Indexes for performance
CartSchema.index({ user: 1, status: 1 });
CartSchema.index({ sessionId: 1, status: 1 });
CartSchema.index({ lastActivityAt: 1 });
CartSchema.index({ status: 1, abandonedAt: 1 });

// Ensure unique cart per user/session
CartSchema.index({ user: 1 }, { 
  unique: true, 
  partialFilterExpression: { user: { $exists: true } } 
});
CartSchema.index({ sessionId: 1 }, { 
  unique: true, 
  partialFilterExpression: { sessionId: { $exists: true } } 
});

// Pre-save middleware
CartSchema.pre('save', function(next) {
  // Update last activity
  this.lastActivityAt = new Date();
  
  // Check for abandonment (2 hours of inactivity)
  if (this.items.length > 0 && this.status === 'active') {
    const hoursSinceActivity = (Date.now() - this.lastActivityAt) / (1000 * 60 * 60);
    if (hoursSinceActivity > 2) {
      this.status = 'abandoned';
      this.abandonedAt = new Date();
    }
  }
  
  next();
});

// Virtual properties
CartSchema.virtual('itemCount').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

CartSchema.virtual('isEmpty').get(function() {
  return this.items.length === 0;
});

// Methods
CartSchema.methods.calculateTotalPrice = function() {
  // Calculate subtotal
  this.subtotal = this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  
  // Calculate discount from coupons
  this.discountAmount = this.appliedCoupons.reduce((total, coupon) => {
    return total + coupon.discountAmount;
  }, 0);
  
  // Simple tax calculation (would need proper tax logic in production)
  this.taxAmount = (this.subtotal - this.discountAmount) * 0.08; // 8% tax
  
  // Calculate total
  this.totalPrice = this.subtotal - this.discountAmount + this.taxAmount + this.shippingAmount;
  
  return this.totalPrice;
};

CartSchema.methods.addItem = async function(productId, quantity, variant = {}) {
  // Check if item already exists
  const existingItemIndex = this.items.findIndex(item => 
    item.product.toString() === productId.toString() &&
    item.variant.color === variant.color &&
    item.variant.size === variant.size
  );
  
  if (existingItemIndex > -1) {
    // Update quantity
    this.items[existingItemIndex].quantity += quantity;
  } else {
    // Get product details
    const Product = mongoose.model('Product');
    const product = await Product.findById(productId);
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    // Check stock
    if (product.countInStock < quantity) {
      throw new Error('Insufficient stock');
    }
    
    // Add new item
    this.items.push({
      product: productId,
      quantity,
      variant,
      price: product.price,
      originalPrice: product.originalPrice || product.price,
      isInStock: true
    });
  }
  
  // Reset abandonment status
  this.status = 'active';
  this.abandonedAt = undefined;
  
  // Recalculate prices
  this.calculateTotalPrice();
  
  return this.save();
};

CartSchema.methods.updateQuantity = async function(itemId, newQuantity) {
  const itemIndex = this.items.findIndex(
    item => item._id.toString() === itemId
  );
  
  if (itemIndex === -1) {
    throw new Error('Item not found in cart');
  }
  
  if (newQuantity <= 0) {
    // Remove item
    this.items.splice(itemIndex, 1);
  } else {
    // Check stock
    const Product = mongoose.model('Product');
    const product = await Product.findById(this.items[itemIndex].product);
    
    if (!product || product.countInStock < newQuantity) {
      throw new Error('Insufficient stock');
    }
    
    this.items[itemIndex].quantity = newQuantity;
  }
  
  this.calculateTotalPrice();
  return this.save();
};

CartSchema.methods.removeItem = function(itemId) {
  this.items = this.items.filter(
    item => item._id.toString() !== itemId
  );
  
  this.calculateTotalPrice();
  return this.save();
};

CartSchema.methods.clear = function() {
  this.items = [];
  this.appliedCoupons = [];
  this.calculateTotalPrice();
  return this.save();
};

CartSchema.methods.applyCoupon = async function(couponCode) {
  // Check if already applied
  if (this.appliedCoupons.some(c => c.code === couponCode)) {
    throw new Error('Coupon already applied');
  }
  
  // Validate coupon (would need Campaign model integration)
  const Campaign = mongoose.model('Campaign');
  const campaign = await Campaign.findOne({ 
    code: couponCode,
    isActive: true,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() }
  });
  
  if (!campaign) {
    throw new Error('Invalid coupon code');
  }
  
  // Calculate discount
  let discountAmount = 0;
  if (campaign.discount.type === 'percentage') {
    discountAmount = this.subtotal * (campaign.discount.value / 100);
  } else {
    discountAmount = campaign.discount.value;
  }
  
  this.appliedCoupons.push({
    code: couponCode,
    discountAmount,
    discountType: campaign.discount.type
  });
  
  this.calculateTotalPrice();
  return this.save();
};

CartSchema.methods.validateStock = async function() {
  const Product = mongoose.model('Product');
  
  for (let item of this.items) {
    const product = await Product.findById(item.product);
    
    if (!product) {
      item.isInStock = false;
      continue;
    }
    
    // Check variant stock if applicable
    if (item.variant.color && item.variant.size) {
      const variant = product.variants.find(v => 
        v.color === item.variant.color
      );
      
      if (variant) {
        const sizeData = variant.sizes.find(s => 
          s.size.toString() === item.variant.size.toString()
        );
        
        item.isInStock = sizeData && sizeData.countInStock >= item.quantity;
      } else {
        item.isInStock = product.countInStock >= item.quantity;
      }
    } else {
      item.isInStock = product.countInStock >= item.quantity;
    }
    
    // Update price if changed
    if (product.price !== item.price) {
      item.price = product.price;
    }
    
    item.stockCheckedAt = new Date();
  }
  
  this.calculateTotalPrice();
  return this.save();
};

CartSchema.methods.merge = async function(otherCart) {
  // Merge items from another cart (useful when guest converts to user)
  for (let item of otherCart.items) {
    await this.addItem(item.product, item.quantity, item.variant);
  }
  
  // Mark other cart as merged
  otherCart.status = 'merged';
  await otherCart.save();
  
  return this.save();
};

// Static method to clean up abandoned carts
CartSchema.statics.sendAbandonmentReminders = async function() {
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  
  const abandonedCarts = await this.find({
    status: 'abandoned',
    reminderSent: false,
    abandonedAt: { $lte: twoDaysAgo },
    'items.0': { $exists: true } // Has items
  }).populate('user');
  
  // Send reminders (implement email logic)
  for (let cart of abandonedCarts) {
    // Send email
    cart.reminderSent = true;
    await cart.save();
  }
  
  return abandonedCarts.length;
};

module.exports = mongoose.model('Cart', CartSchema);