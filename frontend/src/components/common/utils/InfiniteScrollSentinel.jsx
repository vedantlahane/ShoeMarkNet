import React, { forwardRef } from 'react';

const InfiniteScrollSentinel = forwardRef(({
  isLoading = false,
  hasMore = true,
  error = null,
  loadingText = 'Loading more...',
  endText = 'No more items to load',
  errorText = 'Failed to load more items',
  onRetry = null,
  className = ''
}, ref) => {
  if (error) {
    return (
      <div ref={ref} className={`text-center py-8 ${className}`}>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-2xl p-6 max-w-md mx-auto">
          <i className="fas fa-exclamation-triangle text-red-500 text-2xl mb-3"></i>
          <p className="text-red-700 dark:text-red-400 mb-4">{errorText}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-xl transition-colors"
            >
              <i className="fas fa-redo mr-2"></i>
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!hasMore) {
    return (
      <div ref={ref} className={`text-center py-8 ${className}`}>
        <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 max-w-md mx-auto">
          <i className="fas fa-check-circle text-green-500 text-2xl mb-3"></i>
          <p className="text-gray-600 dark:text-gray-400">{endText}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div ref={ref} className={`text-center py-8 ${className}`}>
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl p-6 max-w-md mx-auto">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-700 dark:text-gray-300 font-medium">{loadingText}</span>
          </div>
        </div>
      </div>
    );
  }

  // Default invisible sentinel
  return <div ref={ref} className="h-1" />;
});

InfiniteScrollSentinel.displayName = 'InfiniteScrollSentinel';

export default InfiniteScrollSentinel;
