import React from 'react';
import PropTypes from 'prop-types';

const ErrorMessage = ({ message, onRetry, className = '' }) => {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-6 text-center ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        {/* Error Icon */}
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <i className="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
        </div>

        {/* Error Message */}
        <div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Oops! Something went wrong
          </h3>
          <p className="text-red-700 text-sm max-w-md">
            {message || 'An unexpected error occurred. Please try again.'}
          </p>
        </div>

        {/* Retry Button */}
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <i className="fas fa-redo"></i>
            <span>Try Again</span>
          </button>
        )}

        {/* Additional Help */}
        <div className="text-xs text-red-600 mt-4">
          If the problem persists, please contact our support team.
        </div>
      </div>
    </div>
  );
};

ErrorMessage.propTypes = {
  message: PropTypes.string,
  onRetry: PropTypes.func,
  className: PropTypes.string
};

export default ErrorMessage;
