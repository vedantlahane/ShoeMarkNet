const Category = require('../models/Category');
const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 }).lean();
  res.status(200).json(categories);
});

// @desc    Get category tree
// @route   GET /api/categories/tree
// @access  Public
const getCategoryTree = asyncHandler(async (req, res) => {
  const { activeOnly = true, maxLevel = 3 } = req.query;
  
  const tree = await Category.getCategoryTree({ 
    activeOnly: activeOnly === 'true',
    maxLevel: Number(maxLevel) 
  });
  
  res.status(200).json(tree);
});

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id).lean();

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  res.status(200).json(category);
});

// @desc    Get category breadcrumb
// @route   GET /api/categories/:id/breadcrumb
// @access  Public
const getCategoryBreadcrumb = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  
  const breadcrumb = await category.getBreadcrumb();
  res.status(200).json(breadcrumb);
});

// @desc    Get products by category with filters, sorting, and pagination
// @route   GET /api/categories/:id/products
// @access  Public
const getProductsByCategory = asyncHandler(async (req, res) => {
  const { minPrice, maxPrice, sort, page = 1, limit = 10 } = req.query;

  const filters = { category: req.params.id, isActive: true };

  if (minPrice || maxPrice) {
    filters.price = {};
    if (minPrice) filters.price.$gte = Number(minPrice);
    if (maxPrice) filters.price.$lte = Number(maxPrice);
  }

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
    }
  });
});

// @desc    Get products by category tree (including subcategories)
// @route   GET /api/categories/:id/products-tree
// @access  Public
const getProductsByCategoryTree = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  
  // Get all descendant categories
  const descendants = await category.getDescendants(true);
  const categoryIds = [category._id, ...descendants.map(d => d._id)];
  
  // Apply filters from query
  const { minPrice, maxPrice, sort, page = 1, limit = 10 } = req.query;
  
  const filters = { 
    category: { $in: categoryIds },
    isActive: true 
  };
  
  if (minPrice || maxPrice) {
    filters.price = {};
    if (minPrice) filters.price.$gte = Number(minPrice);
    if (maxPrice) filters.price.$lte = Number(maxPrice);
  }
  
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

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private/Admin
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

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const { name, description, image, parentCategory, displayOrder, isFeatured, showInMenu, metaTitle, metaDescription, isActive } = req.body;

  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  if (name && name !== category.name) {
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      res.status(400);
      throw new Error('Category name already exists');
    }
  }

  // Prevent setting itself as parent
  if (parentCategory && parentCategory === req.params.id) {
    res.status(400);
    throw new Error('Category cannot be its own parent');
  }

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

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  const canDelete = await category.canBeDeleted();

  if (!canDelete.canDelete) {
    res.status(400);
    throw new Error(`Cannot delete category: ${canDelete.reason}`);
  }

  await Category.findByIdAndDelete(req.params.id);

  res.status(200).json({ message: 'Category deleted successfully' });
});

// @desc    Update category product count
// @route   POST /api/categories/:id/update-count
// @access  Private/Admin
const updateCategoryProductCount = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

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