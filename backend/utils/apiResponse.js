/**
 * Creates a consistently shaped API response object.
 * All responses expose the following fields:
 * success {boolean} - whether the request was successful
 * message {string} - human friendly summary
 * data {*} - payload returned to the caller (null when absent)
 * error {*} - machine friendly error details (null for successful responses)
 * meta {Object|null} - optional metadata (pagination, totals, etc.)
 */
const formatResponse = (
  success,
  message,
  data = null,
  error = null,
  meta = null
) => ({
  success,
  message: message ?? (success ? 'OK' : 'Error'),
  data: data === undefined ? null : data,
  error: error === undefined ? null : error,
  meta: meta === undefined ? null : meta
});

/**
 * Shapes a successful API response.
 * @param {string} message - Success message displayed to the user.
 * @param {*} data - Optional payload returned to the caller.
 * @param {Object|null} meta - Optional meta information like pagination.
 * @returns {Object}
 */
const buildSuccess = (message = 'OK', data = null, meta = null) =>
  formatResponse(true, message, data, null, meta);

/**
 * Shapes an error API response.
 * @param {string} message - Human friendly error message.
 * @param {*} error - Additional error context (validation issues, stack, etc.).
 * @param {Object|null} meta - Optional meta information.
 * @returns {Object}
 */
const buildError = (message = 'Error', error = null, meta = null) =>
  formatResponse(false, message, null, error, meta);

/**
 * Maps a thrown error into the API error structure.
 * Useful inside error handlers to avoid leaking internals in production.
 * @param {Error|Object|string} err - Error instance or plain error payload.
 * @param {boolean} includeStack - Whether stack traces should be exposed.
 * @returns {*}
 */
const normalizeError = (err, includeStack = process.env.NODE_ENV !== 'production') => {
  if (!err) return null;

  if (typeof err === 'string') return { message: err };

  if (err instanceof Error) {
    const normalized = {
      name: err.name,
      message: err.message
    };

    if (err.code) normalized.code = err.code;
    if (includeStack && err.stack) normalized.stack = err.stack;
    if (err.details) normalized.details = err.details;
    if (err.errors) normalized.errors = err.errors;

    return normalized;
  }

  return err;
};

module.exports = {
  formatResponse,
  buildSuccess,
  buildError,
  normalizeError
};
  