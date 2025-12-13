import React from 'react';

const SearchFilters = ({ 
  filters, 
  activeFilters, 
  onFilterChange, 
  onClearFilters, 
  hasActiveFilters 
}) => {
  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          <i className="fas fa-filter mr-2 text-blue-500"></i>
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-red-500 hover:text-red-600 transition-colors duration-200"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-6">
        {Object.entries(filters).map(([filterType, options]) => (
          <div key={filterType}>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 capitalize">
              {filterType}
            </h4>
            <div className="space-y-2">
              {options.map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={activeFilters[filterType]?.includes(option.value) || false}
                    onChange={(e) => {
                      const currentValues = activeFilters[filterType] || [];
                      const newValues = e.target.checked
                        ? [...currentValues, option.value]
                        : currentValues.filter(v => v !== option.value);
                      onFilterChange(filterType, newValues);
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchFilters;
