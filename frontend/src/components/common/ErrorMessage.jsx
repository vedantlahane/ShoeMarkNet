import React from 'react';

const ErrorMessage = ({ 
  message, 
  className = '', 
  variant = 'default',
  onRetry,
  showRetry = false 
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'inline':
        return 'text-red-600 text-sm';
      case 'card':
        return 'bg-red-50 border border-red-200 rounded-lg p-4 text-red-800';
      case 'banner':
        return 'bg-red-100 border-l-4 border-red-500 p-4 text-red-700';
      default:
        return 'text-red-600';
    }
  };

  if (!message) return null;

  return (
    <div className={`${getVariantClasses()} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <svg 
            className="w-5 h-5 mr-2" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
              clipRule="evenodd" 
            />
          </svg>
          <span>{message}</span>
        </div>
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="ml-4 text-sm font-medium underline hover:no-underline"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
