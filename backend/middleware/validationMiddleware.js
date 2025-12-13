const { body, param, validationResult } = require('express-validator');

// Validation rules
/**
 * @description Validation rule for a 'productId' in the request body.
 * This checks if the productId field exists and is a valid MongoDB ObjectId.
 */
const validateProductId = body('productId')
  .isMongoId()// This checks if the productId is a valid MongoDB ObjectId, it is provided by express-validator.
  .withMessage('Invalid product ID');//withMesssage is used to provide a custom error message if validation fails.

/**
 * @description Validation rule for a 'productId' in the request parameters.
 * This checks if the productId in the URL parameter is a valid MongoDB ObjectId.
 */
const validateProductParam = param('productId')
  .isMongoId()
  .withMessage('Invalid product ID');

/**
 * @description Middleware to check for and handle validation errors.
 * This function should be placed after the validation rules in a route chain.
 * If errors are found, it sends a 400 Bad Request response with the error details.
 * If there are no errors, it calls next() to proceed to the next middleware.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 */
const handleValidationErrors = (req, res, next) => {
  // Extract validation errors from the request object
  const errors = validationResult(req);
  
  // Check if the errors object is empty. If it's not, there are validation failures.
  if (!errors.isEmpty()) {
    // Send a 400 Bad Request response with the array of errors
    return res.status(400).json({ errors: errors.array() });
  }

  // If validation passes, move to the next middleware or route handler
  next();
};

module.exports = {
  validateProductId,
  validateProductParam,
  handleValidationErrors
};
