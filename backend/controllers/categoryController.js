const mongoose = require('mongoose');
const slugify = require('slugify');
const Category = require('../models/Category');
const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');

const findCategoryByIdentifier = async (identifier, { lean = false } = {}) => {
  if (!identifier) return null;
  const normalized = identifier.toString().trim();
  if (!normalized) return null;

  const execute = (query) => (lean ? query.lean() : query);

  let category = null;

  if (mongoose.Types.ObjectId.isValid(normalized)) {
    category = await execute(Category.findById(normalized));
  }

  if (!category) {
    category = await execute(Category.findOne({ slug: normalized }));
  }

  if (!category) {
    category = await execute(Category.findOne({ path: normalized }));
  }

  if (!category) {
    const slugCandidate = slugify(normalized, { lower: true, strict: true });
    if (slugCandidate && slugCandidate !== normalized) {
      category = await execute(Category.findOne({ slug: slugCandidate }));

      if (!category) {
        category = await execute(Category.findOne({ path: slugCandidate }));
      }
    }
  }

  if (!category) {
    category = await execute(
      Category.findOne({ name: { $regex: `^${normalized}$`, $options: 'i' } })
    );
  }

  return category;
};

// ====================================================================
// ========================= PUBLIC ROUTES ============================
// ====================================================================

/**
 * @description Get a list of all categories, sorted alphabetically by name.
 * @route GET /api/categories
 * @access Public
 */
const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 }).lean();
  res.status(200).json(categories);
});

/**
 * @description Get the entire category tree structure, great for menus and navigation.
 * @route GET /api/categories/tree
 * @access Public
 */
const getCategoryTree = asyncHandler(async (req, res) => {
  const { activeOnly = true, maxLevel = 3 } = req.query;

  // Use the static method from the Category schema to build the tree
  const tree = await Category.getCategoryTree({
    activeOnly: activeOnly === 'true',
    maxLevel: Number(maxLevel)
  });

  res.status(200).json(tree);
});

/**
 * @description Get a single category by its ID.
 * @route GET /api/categories/:id
 * @access Public
 */
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await findCategoryByIdentifier(req.params.id, { lean: true });

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  res.status(200).json(category);
});

/**
 * @description Get the breadcrumb path for a given category ID.
 * @route GET /api/categories/:id/breadcrumb
 * @access Public
 */
const getCategoryBreadcrumb = asyncHandler(async (req, res) => {
  const category = await findCategoryByIdentifier(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Use the instance method from the Category schema to build the breadcrumb trail
  const breadcrumb = await category.getBreadcrumb();
  res.status(200).json(breadcrumb);
});

/**
 * @description Get products belonging to a specific category (without subcategories).
 * @route GET /api/categories/:id/products
 * @access Public
 */
const getProductsByCategory = asyncHandler(async (req, res) => {
  const { minPrice, maxPrice, sort, page = 1, limit = 10, discount, minDiscount } = req.query;

  let category = null;
  let filters = { isActive: true };

  // Handle special "sale" category
  if (req.params.id === 'sale') {
    filters.discountPercentage = { $gt: 0 };
    if (minDiscount) {
      filters.discountPercentage.$gte = Number(minDiscount);
    }

    // Try to find an active sale campaign
    const Campaign = require('../models/Campaign');
    const now = new Date();
    const activeCampaign = await Campaign.findOne({
      type: 'sale',
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now },
      isActive: true
    }).sort({ priority: -1, createdAt: -1 });

    if (activeCampaign) {
      category = {
        name: activeCampaign.name,
        slug: 'sale',
        description: activeCampaign.description,
        bannerImage: activeCampaign.bannerImage,
        endDate: activeCampaign.endDate
      };
    }
  } else {
    category = await findCategoryByIdentifier(req.params.id);

    if (!category) {
      res.status(404);
      throw new Error('Category not found');
    }

    filters.category = category._id;
  }

  // Price range filtering
  if (minPrice || maxPrice) {
    filters.price = {};
    if (minPrice) filters.price.$gte = Number(minPrice);
    if (maxPrice) filters.price.$lte = Number(maxPrice);
  }

  // Sorting logic
  let sortOption = {};
  if (sort) {
    const [field, order] = sort.split(':');
    sortOption[field] = order === 'desc' ? -1 : 1;
  } else {
    sortOption = { createdAt: -1 };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const products = await Product.find(filters)
    .populate('category', 'name slug')
    .sort(sortOption)
    .skip(skip)
    .limit(Number(limit))
    .lean({ virtuals: true });

  const total = await Product.countDocuments(filters);

  res.status(200).json({
    products,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    },
    categoryInfo: category ? {
      name: category.name,
      slug: category.slug,
      description: category.description,
      bannerImage: category.bannerImage,
      endDate: category.endDate
    } : {
      name: 'Sale',
      slug: 'sale',
      description: 'Special offers and discounts'
    }
  });
});

/**
 * @description Get products from a category and all its subcategories (the entire tree).
 * @route GET /api/categories/:id/products-tree
 * @access Public
 */
const getProductsByCategoryTree = asyncHandler(async (req, res) => {
  const category = await findCategoryByIdentifier(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Get all descendant categories using the instance method
  const descendants = await category.getDescendants(true);
  const categoryIds = [category._id, ...descendants.map(d => d._id)];

  const { minPrice, maxPrice, sort, page = 1, limit = 10 } = req.query;

  const filters = {
    category: { $in: categoryIds },
    isActive: true
  };

  // Price range filtering
  if (minPrice || maxPrice) {
    filters.price = {};
    if (minPrice) filters.price.$gte = Number(minPrice);
    if (maxPrice) filters.price.$lte = Number(maxPrice);
  }

  // Sorting logic
  let sortOption = {};
  if (sort) {
    const [field, order] = sort.split(':');
    sortOption[field] = order === 'desc' ? -1 : 1;
  } else {
    sortOption = { createdAt: -1 };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const products = await Product.find(filters)
    .populate('category', 'name slug')
    .sort(sortOption)
    .skip(skip)
    .limit(Number(limit))
    .lean({ virtuals: true });

  const total = await Product.countDocuments(filters);

  res.status(200).json({
    products,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    },
    categoryInfo: {
      name: category.name,
      slug: category.slug,
      includesSubcategories: descendants.length > 0
    }
  });
});

// ====================================================================
// ========================== ADMIN ROUTES ============================
// ====================================================================

/**
 * @description Create a new category.
 * @route POST /api/categories
 * @access Private/Admin
 */
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image, parentCategory, displayOrder, isFeatured, showInMenu, metaTitle, metaDescription } = req.body;

  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    res.status(400);
    throw new Error('Category already exists');
  }

  const category = new Category({
    name,
    description,
    image,
    parentCategory,
    displayOrder,
    isFeatured,
    showInMenu,
    metaTitle,
    metaDescription
  });

  await category.save();

  res.status(201).json({ message: 'Category created successfully', category });
});

/**
 * @description Update an existing category by its ID.
 * @route PUT /api/categories/:id
 * @access Private/Admin
 */
const updateCategory = asyncHandler(async (req, res) => {
  const { name, description, image, parentCategory, displayOrder, isFeatured, showInMenu, metaTitle, metaDescription, isActive } = req.body;

  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Check for duplicate name
  if (name && name !== category.name) {
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      res.status(400);
      throw new Error('Category name already exists');
    }
  }

  // Prevent a category from being its own parent
  if (parentCategory && parentCategory === req.params.id) {
    res.status(400);
    throw new Error('Category cannot be its own parent');
  }

  // Update fields
  if (name !== undefined) category.name = name;
  if (description !== undefined) category.description = description;
  if (image !== undefined) category.image = image;
  if (parentCategory !== undefined) category.parentCategory = parentCategory;
  if (displayOrder !== undefined) category.displayOrder = displayOrder;
  if (isFeatured !== undefined) category.isFeatured = isFeatured;
  if (showInMenu !== undefined) category.showInMenu = showInMenu;
  if (metaTitle !== undefined) category.metaTitle = metaTitle;
  if (metaDescription !== undefined) category.metaDescription = metaDescription;
  if (isActive !== undefined) category.isActive = isActive;

  await category.save();

  res.status(200).json({ message: 'Category updated successfully', category });
});

/**
 * @description Delete a category by its ID.
 * @route DELETE /api/categories/:id
 * @access Private/Admin
 */
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Use the schema method to check if the category can be deleted
  const canDelete = await category.canBeDeleted();

  if (!canDelete.canDelete) {
    res.status(400);
    throw new Error(`Cannot delete category: ${canDelete.reason}`);
  }

  await Category.findByIdAndDelete(req.params.id);

  res.status(200).json({ message: 'Category deleted successfully' });
});

/**
 * @description Manually update the cached product count for a category.
 * This can be useful for data consistency after a bulk product operation.
 * @route POST /api/categories/:id/update-count
 * @access Private/Admin
 */
const updateCategoryProductCount = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Use the schema method to update the count
  await category.updateProductCount();

  res.status(200).json({
    message: 'Product count updated successfully',
    productCount: category.productCount
  });
});

module.exports = {
  getAllCategories,
  getCategoryTree,
  getCategoryById,
  getCategoryBreadcrumb,
  getProductsByCategory,
  getProductsByCategoryTree,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoryProductCount
};
