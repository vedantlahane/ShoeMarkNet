const { body, param, validationResult } = require('express-validator');

// Validation rules
const validateProductId = body('productId')
  .isMongoId()
  .withMessage('Invalid product ID');

const validateProductParam = param('productId')
  .isMongoId()
  .withMessage('Invalid product ID');

// Middleware to check validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  validateProductId,
  validateProductParam,
  handleValidationErrors
};