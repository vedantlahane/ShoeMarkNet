import React from 'react';

const CategoryQuickFilters = ({ 
  filters = [], 
  activeFilters = [], 
  onFilterChange = () => {},
  className = '' 
}) => {
  const defaultFilters = [
    { id: 'price-low', label: 'Under $50', icon: 'fas fa-dollar-sign', color: 'text-green-500' },
    { id: 'rating-high', label: '4+ Stars', icon: 'fas fa-star', color: 'text-yellow-500' },
    { id: 'new-arrivals', label: 'New Arrivals', icon: 'fas fa-sparkles', color: 'text-blue-500' },
    { id: 'on-sale', label: 'On Sale', icon: 'fas fa-percentage', color: 'text-red-500' },
    { id: 'free-shipping', label: 'Free Shipping', icon: 'fas fa-shipping-fast', color: 'text-purple-500' }
  ];

  const filterOptions = filters.length > 0 ? filters : defaultFilters;

  return (
    <div className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl p-6 shadow-xl ${className}`}>
      <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <i className="fas fa-filter mr-2 text-blue-500"></i>
        Quick Filters
      </h4>
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`flex items-center px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
              activeFilters.includes(filter.id)
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white/20 text-gray-700 dark:text-gray-300 hover:bg-white/30'
            }`}
          >
            <i className={`${filter.icon} mr-2 ${activeFilters.includes(filter.id) ? 'text-white' : filter.color}`}></i>
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryQuickFilters;
