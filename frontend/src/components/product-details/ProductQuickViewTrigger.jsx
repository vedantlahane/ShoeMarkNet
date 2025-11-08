import React from 'react';

const ProductQuickViewTrigger = ({ 
  onQuickView = () => {},
  variant = 'default', // default, icon-only, text-only
  size = 'medium', // small, medium, large
  className = '' 
}) => {
  const sizeClasses = {
    small: 'w-8 h-8 text-xs',
    medium: 'w-10 h-10 text-sm',
    large: 'w-12 h-12 text-base'
  };

  if (variant === 'icon-only') {
    return (
      <button
        onClick={onQuickView}
        className={`${sizeClasses[size]} bg-white/20 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center text-gray-900 dark:text-white hover:bg-white/30 transition-all duration-200 hover:scale-110 group ${className}`}
        title="Quick View"
      >
        <i className="fas fa-eye group-hover:scale-110 transition-transform duration-200"></i>
      </button>
    );
  }

  if (variant === 'text-only') {
    return (
      <button
        onClick={onQuickView}
        className={`px-4 py-2 bg-white/20 backdrop-blur-lg border border-white/30 text-gray-900 dark:text-white rounded-xl hover:bg-white/30 transition-all duration-200 hover:scale-105 font-medium ${className}`}
      >
        Quick View
      </button>
    );
  }

  return (
    <button
      onClick={onQuickView}
      className={`${sizeClasses[size]} bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 group shadow-lg ${className}`}
      title="Quick View"
    >
      <i className="fas fa-eye mr-2 group-hover:scale-110 transition-transform duration-200"></i>
      <span className="hidden sm:inline text-sm font-medium">Quick View</span>
    </button>
  );
};

export default ProductQuickViewTrigger;
