/**
 * @description A centralized error handling middleware for the application.
 * It catches errors passed to it by other middleware or route handlers.
 * @param {object} err - The error object.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The Express next middleware function.
 */
const errorMiddleware = (err, req, res, next) => {
  // Determine the status code. If a status code was not explicitly set on the response (it defaults to 200),
  // we set it to a 500 (Internal Server Error) to signify that something went wrong.
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    // Return the error message to the client
    message: err.message,
    // Provide the full error stack trace for debugging in development environments.
    // In production, the stack trace is hidden for security reasons.
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
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
  // Explicitly set the response status to 404 (Not Found).
  res.status(404);
  // Pass the newly created error object to the next middleware.
  // This will be caught by the errorMiddleware function above.
  next(error);
};

module.exports = { errorMiddleware, notFound };
