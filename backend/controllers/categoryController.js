// controllers/categoryController.js
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

// @desc    Get products by category with filters, sorting, and pagination
// @route   GET /api/categories/:id/products
// @access  Public
const getProductsByCategory = asyncHandler(async (req, res) => {
  const { minPrice, maxPrice, sort, page = 1, limit = 10 } = req.query;

  const filters = { category: req.params.id };

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

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image } = req.body;

  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    res.status(400);
    throw new Error('Category already exists');
  }

  const category = new Category({ name, description, image });
  await category.save();

  res.status(201).json({ message: 'Category created successfully', category });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const { name, description, image } = req.body;

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

  if (name) category.name = name;
  if (description) category.description = description;
  if (image) category.image = image;

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

  const productsCount = await Product.countDocuments({ category: req.params.id });

  if (productsCount > 0) {
    res.status(400);
    throw new Error(`Cannot delete category with ${productsCount} associated products`);
  }

  await category.remove();

  res.status(200).json({ message: 'Category deleted successfully' });
});

module.exports = {
  getAllCategories,
  getCategoryById,
  getProductsByCategory,
  createCategory,
  updateCategory,
  deleteCategory
};
