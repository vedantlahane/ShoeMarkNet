import React from 'react';

const FilterChips = ({ filters, onRemove, onClearAll, className = '' }) => {
  const getFilterLabel = (filterKey) => {
    const [type, value] = filterKey.split(':');
    
    switch (type) {
      case 'category':
        return `Category: ${value}`;
      case 'brand':
        return `Brand: ${value}`;
      case 'rating':
        return `${value}+ Stars`;
      case 'price':
        const [min, max] = value.split('-');
        return `$${min} - $${max}`;
      case 'inStock':
        return 'In Stock';
      case 'onSale':
        return 'On Sale';
      default:
        return value;
    }
  };

  if (filters.size === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Active filters:
      </span>
      
      {Array.from(filters).map((filter) => (
        <span
          key={filter}
          className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
        >
          {getFilterLabel(filter)}
          <button
            onClick={() => onRemove(filter)}
            className="ml-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            aria-label={`Remove ${getFilterLabel(filter)} filter`}
          >
            <i className="fas fa-times text-xs"></i>
          </button>
        </span>
      ))}
      
      <button
        onClick={onClearAll}
        className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline transition-colors duration-200"
      >
        Clear all
      </button>
    </div>
  );
};

export default FilterChips;
