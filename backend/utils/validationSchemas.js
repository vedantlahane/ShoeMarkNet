const { body } = require('express-validator');

// User validation schemas
const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Product validation schemas
const productValidation = [
  body('name').notEmpty().withMessage('Product name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('category').notEmpty().withMessage('Category is required'),
  body('countInStock').isInt({ min: 0 }).withMessage('Count in stock must be a positive number')
];

// Order validation schemas
const orderValidation = [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('paymentMethod').notEmpty().withMessage('Payment method is required'),
  body('shippingAddress').notEmpty().withMessage('Shipping address is required')
];

// Review validation schemas
const reviewValidation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').notEmpty().withMessage('Review comment is required')
];

module.exports = {
  registerValidation,
  loginValidation,
  productValidation,
  orderValidation,
  reviewValidation
};
