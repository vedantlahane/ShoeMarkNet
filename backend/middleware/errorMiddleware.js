const { buildError, normalizeError } = require('../utils/apiResponse');

/**
 * Centralised error handling middleware to keep API responses consistent.
 * @param {object} err - The error object passed down the middleware chain.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
const errorMiddleware = (err, req, res, next) => {
  const currentStatus = res.statusCode;
  const derivedStatus = err.statusCode || err.status || (currentStatus && currentStatus !== 200 ? currentStatus : 500);

  const message = err.message || 'Internal server error';
  const errorPayload = normalizeError(err);

  const meta = {
    path: req.originalUrl,
    method: req.method
  };

  if (req.id) {
    meta.requestId = req.id;
  }

  res.status(derivedStatus);
  res.json(buildError(message, errorPayload, meta));
};

/**
 * @description Middleware for handling requests to routes that do not exist.
 * This should be placed after all other routes to act as a catch-all for "Not Found" errors.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 */
const notFound = (req, res, next) => {
  // Create a new Error object with a descriptive "Not Found" message.
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = { errorMiddleware, notFound };
