const mongoose = require('mongoose');
const slugify = require('slugify');

const CategorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  slug: { 
    type: String, 
    unique: true,
    index: true
  },
  description: { 
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Images
  image: { type: String },
  icon: { type: String }, // Small icon for menus
  banner: { type: String }, // Banner for category pages
  
  // Hierarchy
  parentCategory: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    default: null,
    index: true
  },
  level: { 
    type: Number, 
    default: 0 
  }, // Depth in hierarchy (0 = root)
  path: { 
    type: String,
    index: true 
  }, // Full path like "electronics/computers/laptops"
  
  // Display
  displayOrder: { 
    type: Number, 
    default: 0 
  }, // For custom ordering
  isActive: { 
    type: Boolean, 
    default: true, 
    index: true 
  },
  isFeatured: { 
    type: Boolean, 
    default: false,
    index: true
  },
  showInMenu: { 
    type: Boolean, 
    default: true 
  },
  
  // SEO
  metaTitle: { 
    type: String,
    maxlength: [70, 'Meta title cannot exceed 70 characters']
  },
  metaDescription: { 
    type: String,
    maxlength: [160, 'Meta description cannot exceed 160 characters']
  },
  
  // Analytics
  productCount: { 
    type: Number, 
    default: 0 
  } // Cached count for performance
}, { 
  timestamps: true 
});

// Indexes for performance
CategorySchema.index({ parentCategory: 1, displayOrder: 1 });
CategorySchema.index({ isActive: 1, showInMenu: 1 });
CategorySchema.index({ level: 1 });
CategorySchema.index({ path: 1 });

// Virtual to get all ancestors (for breadcrumbs)
CategorySchema.virtual('ancestors', {
  ref: 'Category',
  localField: '_id',
  foreignField: '_id',
  justOne: false,
  options: { sort: { level: 1 } }
});

// Pre-save middleware
CategorySchema.pre('save', async function(next) {
  try {
    // Generate slug
    if (this.isModified('name')) {
      let baseSlug = slugify(this.name, { lower: true, strict: true });
      let slug = baseSlug;
      let counter = 1;

      // Ensure unique slug
      while (true) {
        const existing = await mongoose.models.Category.findOne({ 
          slug, 
          _id: { $ne: this._id } 
        });
        
        if (!existing) break;
        slug = `${baseSlug}-${counter++}`;
      }
      
      this.slug = slug;
    }
    
    // Update hierarchy info when parent changes
    if (this.isModified('parentCategory')) {
      if (this.parentCategory) {
        // Prevent circular reference
        await this.checkCircularReference();
        
        // Get parent category
        const parent = await mongoose.models.Category.findById(this.parentCategory);
        
        if (!parent) {
          throw new Error('Parent category not found');
        }
        
        // Limit depth to 3 levels (0, 1, 2, 3)
        if (parent.level >= 3) {
          throw new Error('Maximum category depth exceeded (4 levels)');
        }
        
        // Update level and path
        this.level = parent.level + 1;
        this.path = parent.path ? `${parent.path}/${this.slug}` : `${parent.slug}/${this.slug}`;
      } else {
        // Root category
        this.level = 0;
        this.path = this.slug;
      }
    }
    
    // Auto-generate SEO fields if empty
    if (!this.metaTitle && this.name) {
      this.metaTitle = this.name;
    }
    
    if (!this.metaDescription && this.description) {
      this.metaDescription = this.description.substring(0, 160);
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Update children when parent changes
CategorySchema.post('save', async function() {
  if (this.wasModified('slug') || this.wasModified('path')) {
    await this.updateChildrenPaths();
  }
});

// Check for circular references
CategorySchema.methods.checkCircularReference = async function() {
  if (!this.parentCategory) return;
  
  let currentId = this.parentCategory;
  const maxDepth = 10; // Safety limit
  let depth = 0;
  
  while (currentId && depth < maxDepth) {
    if (currentId.toString() === this._id.toString()) {
      throw new Error('Circular reference detected');
    }
    
    const parent = await mongoose.models.Category
      .findById(currentId)
      .select('parentCategory');
    
    currentId = parent ? parent.parentCategory : null;
    depth++;
  }
};

// Update paths of all children
CategorySchema.methods.updateChildrenPaths = async function() {
  const children = await mongoose.models.Category.find({ 
    parentCategory: this._id 
  });
  
  for (const child of children) {
    child.path = `${this.path}/${child.slug}`;
    child.level = this.level + 1;
    await child.save(); // This will recursively update grandchildren
  }
};

// Get immediate children
CategorySchema.methods.getChildren = function(activeOnly = true) {
  const query = { parentCategory: this._id };
  if (activeOnly) query.isActive = true;
  
  return mongoose.models.Category
    .find(query)
    .sort({ displayOrder: 1, name: 1 });
};

// Get all descendants (subcategories at all levels)
CategorySchema.methods.getDescendants = async function(activeOnly = true) {
  const descendants = [];
  const children = await this.getChildren(activeOnly);
  
  for (const child of children) {
    descendants.push(child);
    const grandChildren = await child.getDescendants(activeOnly);
    descendants.push(...grandChildren);
  }
  
  return descendants;
};

// Get breadcrumb path
CategorySchema.methods.getBreadcrumb = async function() {
  const breadcrumb = [];
  let current = this;
  
  // Add current category
  breadcrumb.unshift({
    _id: current._id,
    name: current.name,
    slug: current.slug,
    path: current.path
  });
  
  // Traverse up the hierarchy
  while (current.parentCategory) {
    current = await mongoose.models.Category
      .findById(current.parentCategory)
      .select('_id name slug path parentCategory');
    
    if (current) {
      breadcrumb.unshift({
        _id: current._id,
        name: current.name,
        slug: current.slug,
        path: current.path
      });
    } else {
      break;
    }
  }
  
  return breadcrumb;
};

// Check if category can be deleted
CategorySchema.methods.canBeDeleted = async function() {
  // Check for subcategories
  const childCount = await mongoose.models.Category.countDocuments({ 
    parentCategory: this._id 
  });
  
  if (childCount > 0) {
    return { 
      canDelete: false, 
      reason: `Has ${childCount} subcategories` 
    };
  }
  
  // Check for products
  const Product = mongoose.model('Product');
  const productCount = await Product.countDocuments({ 
    category: this._id 
  });
  
  if (productCount > 0) {
    return { 
      canDelete: false, 
      reason: `Has ${productCount} products` 
    };
  }
  
  return { canDelete: true };
};

// Update product count (call this when products are added/removed)
CategorySchema.methods.updateProductCount = async function() {
  const Product = mongoose.model('Product');
  
  this.productCount = await Product.countDocuments({ 
    category: this._id,
    isActive: true
  });
  
  return this.save();
};

// Static method to get category tree
CategorySchema.statics.getCategoryTree = async function(options = {}) {
  const { activeOnly = true, maxLevel = null } = options;
  
  const query = { parentCategory: null };
  if (activeOnly) query.isActive = true;
  
  const rootCategories = await this.find(query)
    .sort({ displayOrder: 1, name: 1 })
    .lean();
  
  // Recursive function to build tree
  const buildTree = async (parent) => {
    const childQuery = { parentCategory: parent._id };
    if (activeOnly) childQuery.isActive = true;
    if (maxLevel !== null && parent.level >= maxLevel) return parent;
    
    const children = await this.find(childQuery)
      .sort({ displayOrder: 1, name: 1 })
      .lean();
    
    if (children.length > 0) {
      parent.children = await Promise.all(
        children.map(child => buildTree(child))
      );
    }
    
    return parent;
  };
  
  return Promise.all(rootCategories.map(cat => buildTree(cat)));
};

// Find category by path
CategorySchema.statics.findByPath = function(path) {
  return this.findOne({ path });
};

module.exports = mongoose.model('Category', CategorySchema);