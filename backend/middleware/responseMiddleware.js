const { buildSuccess, buildError } = require('../utils/apiResponse');

/**
 * Express middleware that standardises API responses.
 * It adds helper methods to the response object and automatically
 * wraps payloads returned via res.json that do not follow the
 * { success, message, data, error, meta } contract yet.
 */
const responseFormatter = (req, res, next) => {
  const originalJson = res.json.bind(res);

  /**
   * Sends a success response with the standard shape.
   * @param {string} message
   * @param {*} data
   * @param {Object|null} meta
   * @param {number} statusCode
   */
  res.success = (message = 'OK', data = null, meta = null, statusCode) => {
    const finalStatus = typeof statusCode === 'number' ? statusCode : res.statusCode || 200;
    if (finalStatus !== res.statusCode) res.status(finalStatus);
    return originalJson(buildSuccess(message, data, meta));
  };

  /**
   * Sends an error response with the standard shape.
   * @param {number} statusCode
   * @param {string} message
   * @param {*} error
   * @param {Object|null} meta
   */
  res.error = (statusCode = 500, message = 'Error', error = null, meta = null) => {
    res.status(statusCode);
    return originalJson(buildError(message, error, meta));
  };

  res.fail = res.error;

  res.json = (body) => {
    if (Array.isArray(body)) {
      return originalJson(buildSuccess('OK', body, null));
    }

    if (!body || typeof body !== 'object') {
      return originalJson(buildSuccess('OK', body ?? null));
    }

    if (Object.prototype.hasOwnProperty.call(body, 'success') && Object.prototype.hasOwnProperty.call(body, 'message')) {
      return originalJson(body);
    }

    const cloned = { ...body };
    let message = 'OK';
    let data = cloned;
    let meta = null;

    if (Object.prototype.hasOwnProperty.call(cloned, 'meta')) {
      meta = cloned.meta;
      delete cloned.meta;
    }

    if (Object.prototype.hasOwnProperty.call(cloned, 'message')) {
      message = cloned.message;
      delete cloned.message;
    }

    if (Object.keys(cloned).length === 0) {
      data = null;
    } else {
      data = cloned;
    }

    return originalJson(buildSuccess(message, data, meta));
  };

  next();
};

module.exports = { responseFormatter };
