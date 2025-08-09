const mongoose = require('mongoose');
const slugify = require('slugify');

/**
 * @description Mongoose schema for the Category model.
 * This schema defines a hierarchical category structure for products.
 * It includes fields for SEO, hierarchy management, and virtual methods
 * to handle complex queries like fetching breadcrumbs and category trees.
 */
const CategorySchema = new mongoose.Schema({
  // Basic Information
  name: { 
    type: String, 
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  slug: { 
    type: String, 
    unique: true
  },
  description: { 
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Images
  image: { type: String }, // Main category image
  icon: { type: String }, // Small icon for menus
  banner: { type: String }, // Banner for category pages
  
  // Hierarchy Fields
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
    type: String
  }, // Full path like "electronics/computers/laptops"
  
  // Display and Visibility
  displayOrder: { 
    type: Number, 
    default: 0 
  }, // For custom ordering in lists and menus
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
  
  // SEO Fields
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

// ====================================================================
// ========================= SCHEMA HOOKS & METHODS ===================
// ====================================================================

// Indexes for performance
CategorySchema.index({ parentCategory: 1, displayOrder: 1 });
CategorySchema.index({ isActive: 1, showInMenu: 1 });
CategorySchema.index({ level: 1 });
CategorySchema.index({ path: 1 });

/**
 * @description Pre-save middleware to handle slug, hierarchy, and SEO auto-generation.
 * It ensures unique slugs, updates the path and level, and prevents circular references.
 */
CategorySchema.pre('save', async function(next) {
  try {
    // Generate a unique slug from the category name
    if (this.isModified('name')) {
      let baseSlug = slugify(this.name, { lower: true, strict: true });
      let slug = baseSlug;
      let counter = 1;

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
    
    // Update hierarchy info if the parent category is modified
    if (this.isModified('parentCategory')) {
      if (this.parentCategory) {
        await this.checkCircularReference(); // Prevent infinite loops
        const parent = await mongoose.models.Category.findById(this.parentCategory);
        
        if (!parent) {
          throw new Error('Parent category not found');
        }
        
        if (parent.level >= 3) {
          throw new Error('Maximum category depth exceeded (4 levels)');
        }
        
        this.level = parent.level + 1;
        this.path = parent.path ? `${parent.path}/${this.slug}` : `${parent.slug}/${this.slug}`;
      } else {
        this.level = 0;
        this.path = this.slug;
      }
    }
    
    // Auto-generate SEO fields if they are not provided
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

/**
 * @description Post-save middleware to update the paths of all child categories
 * if the current category's slug or path changes.
 */
CategorySchema.post('save', async function() {
  if (this.isModified('slug') || this.isModified('path')) {
    await this.updateChildrenPaths();
  }
});

// ====================================================================
// ========================== SCHEMA METHODS ==========================
// ====================================================================

/**
 * @description A method to prevent a category from being its own ancestor.
 * @throws {Error} If a circular reference is detected.
 */
CategorySchema.methods.checkCircularReference = async function() {
  if (!this.parentCategory) return;
  
  let currentId = this.parentCategory;
  const maxDepth = 10;
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

/**
 * @description Recursively updates the `path` and `level` for all child categories
 * when a parent category's details change.
 */
CategorySchema.methods.updateChildrenPaths = async function() {
  const children = await mongoose.models.Category.find({ 
    parentCategory: this._id 
  });
  
  for (const child of children) {
    child.path = `${this.path}/${child.slug}`;
    child.level = this.level + 1;
    await child.save();
  }
};

/**
 * @description Gets the immediate children of the current category.
 * @param {boolean} activeOnly - If true, only returns active children.
 * @returns {Promise<Document[]>} - An array of child category documents.
 */
CategorySchema.methods.getChildren = function(activeOnly = true) {
  const query = { parentCategory: this._id };
  if (activeOnly) query.isActive = true;
  
  return mongoose.models.Category
    .find(query)
    .sort({ displayOrder: 1, name: 1 });
};

/**
 * @description Recursively gets all descendant categories at all levels.
 * @param {boolean} activeOnly - If true, only returns active descendants.
 * @returns {Promise<Document[]>} - An array of all descendant category documents.
 */
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

/**
 * @description Gets the breadcrumb path from the root category to the current one.
 * @returns {Promise<object[]>} - An array of objects representing the breadcrumb trail.
 */
CategorySchema.methods.getBreadcrumb = async function() {
  const breadcrumb = [];
  let current = this;
  
  breadcrumb.unshift({
    _id: current._id,
    name: current.name,
    slug: current.slug,
    path: current.path
  });
  
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

/**
 * @description Checks if a category can be safely deleted.
 * @returns {Promise<object>} - An object with `canDelete` (boolean) and a `reason` (string).
 */
CategorySchema.methods.canBeDeleted = async function() {
  const childCount = await mongoose.models.Category.countDocuments({ 
    parentCategory: this._id 
  });
  
  if (childCount > 0) {
    return { canDelete: false, reason: `Has ${childCount} subcategories` };
  }
  
  const Product = mongoose.model('Product');
  const productCount = await Product.countDocuments({ 
    category: this._id 
  });
  
  if (productCount > 0) {
    return { canDelete: false, reason: `Has ${productCount} products` };
  }
  
  return { canDelete: true };
};

/**
 * @description A method to update the cached product count for the category.
 * This should be called whenever a product is added or removed from this category.
 */
CategorySchema.methods.updateProductCount = async function() {
  const Product = mongoose.model('Product');
  
  this.productCount = await Product.countDocuments({ 
    category: this._id,
    isActive: true
  });
  
  return this.save();
};

// ====================================================================
// ======================== STATIC METHODS ============================
// ====================================================================

/**
 * @description A static method to fetch the entire category tree.
 * @param {object} options - Options for the query, including `activeOnly` and `maxLevel`.
 * @returns {Promise<object[]>} - An array representing the category tree structure.
 */
CategorySchema.statics.getCategoryTree = async function(options = {}) {
  const { activeOnly = true, maxLevel = null } = options;
  
  const query = { parentCategory: null };
  if (activeOnly) query.isActive = true;
  
  const rootCategories = await this.find(query)
    .sort({ displayOrder: 1, name: 1 })
    .lean();
  
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

/**
 * @description A static method to find a category by its full path.
 * @param {string} path - The full path of the category (e.g., 'electronics/laptops').
 * @returns {Promise<Document|null>} - The found category document or null.
 */
CategorySchema.statics.findByPath = function(path) {
  return this.findOne({ path });
};

module.exports = mongoose.model('Category', CategorySchema);
