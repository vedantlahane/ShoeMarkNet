/**
 * Format API response consistently
 * @param {boolean} success - Whether the request was successful
 * @param {string} message - Message to include in response
 * @param {*} data - Data to include in response
 * @param {*} error - Error details (if any)
 * @returns {Object} Formatted response object
 */
const formatResponse = (success, message, data = null, error = null) => {
    const response = {
      success,
      message
    };
    
    if (data) response.data = data;
    if (error) response.error = error;
    
    return response;
  };
  
  /**
   * Success response
   * @param {string} message - Success message
   * @param {*} data - Data to include in response
   * @returns {Object} Formatted success response
   */
  const successResponse = (message, data) => {
    return formatResponse(true, message, data);
  };
  
  /**
   * Error response
   * @param {string} message - Error message
   * @param {*} error - Error details
   * @returns {Object} Formatted error response
   */
  const errorResponse = (message, error) => {
    return formatResponse(false, message, null, error);
  };
  
  module.exports = {
    formatResponse,
    successResponse,
    errorResponse
  };
  