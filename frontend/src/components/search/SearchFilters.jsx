import React, { useState, useCallback, useMemo } from 'react';

// Utils
import { trackEvent } from '../../utils/analytics';

// Constants
const PRICE_RANGES = [
  { label: 'Under $50', value: '0-50', min: 0, max: 50 },
  { label: '$50 - $100', value: '50-100', min: 50, max: 100 },
  { label: '$100 - $200', value: '100-200', min: 100, max: 200 },
  { label: '$200 - $500', value: '200-500', min: 200, max: 500 },
  { label: 'Over $500', value: '500-999999', min: 500, max: 999999 }
];

const BRAND_OPTIONS = [
  { label: 'Nike', value: 'nike', count: 156 },
  { label: 'Adidas', value: 'adidas', count: 134 },
  { label: 'Jordan', value: 'jordan', count: 89 },
  { label: 'Puma', value: 'puma', count: 76 },
  { label: 'New Balance', value: 'new-balance', count: 67 },
  { label: 'Converse', value: 'converse', count: 45 },
  { label: 'Vans', value: 'vans', count: 43 },
  { label: 'Reebok', value: 'reebok', count: 38 }
];

const SIZE_OPTIONS = [
  { label: 'US 6', value: '6' },
  { label: 'US 7', value: '7' },
  { label: 'US 8', value: '8' },
  { label: 'US 9', value: '9' },
  { label: 'US 10', value: '10' },
  { label: 'US 11', value: '11' },
  { label: 'US 12', value: '12' },
  { label: 'US 13', value: '13' }
];

const CATEGORY_OPTIONS = [
  { label: 'Running', value: 'running', icon: 'fas fa-running' },
  { label: 'Basketball', value: 'basketball', icon: 'fas fa-basketball-ball' },
  { label: 'Casual', value: 'casual', icon: 'fas fa-walking' },
  { label: 'Athletic', value: 'athletic', icon: 'fas fa-dumbbell' },
  { label: 'Formal', value: 'formal', icon: 'fas fa-user-tie' },
  { label: 'Sneakers', value: 'sneakers', icon: 'fas fa-shoe-prints' }
];

const RATING_OPTIONS = [
  { label: '4+ Stars', value: '4', icon: '★★★★☆' },
  { label: '3+ Stars', value: '3', icon: '★★★☆☆' },
  { label: '2+ Stars', value: '2', icon: '★★☆☆☆' },
  { label: '1+ Stars', value: '1', icon: '★☆☆☆☆' }
];

const SORT_OPTIONS = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Best Rating', value: 'rating' },
  { label: 'Most Popular', value: 'popular' },
  { label: 'Best Sellers', value: 'bestseller' }
];

const SearchFilters = ({
  filters = {},
  activeFilters = {},
  onFilterChange = () => {},
  onClearFilters = () => {},
  onClearFilter = () => {},
  hasActiveFilters = false,
  resultCount = 0,
  isLoading = false,
  className = ''
}) => {
  // Local state
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    brand: true,
    size: false,
    category: true,
    rating: false,
    sort: true
  });
  const [showMoreBrands, setShowMoreBrands] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [searchBrand, setSearchBrand] = useState('');

  // Toggle section expansion
  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
    
    trackEvent('filter_section_toggled', {
      section,
      expanded: !expandedSections[section]
    });
  }, [expandedSections]);

  // Handle filter change
  const handleFilterChange = useCallback((filterType, value, checked) => {
    const currentValues = activeFilters[filterType] || [];
    let newValues;

    if (checked) {
      newValues = [...currentValues, value];
    } else {
      newValues = currentValues.filter(v => v !== value);
    }

    onFilterChange(filterType, newValues);
    
    trackEvent('filter_applied', {
      filter_type: filterType,
      filter_value: value,
      action: checked ? 'added' : 'removed',
      total_active: newValues.length
    });
  }, [activeFilters, onFilterChange]);

  // Handle price range change
  const handlePriceRangeChange = useCallback((range) => {
    setPriceRange(range);
    onFilterChange('priceRange', range);
    
    trackEvent('price_range_changed', {
      min_price: range[0],
      max_price: range[1]
    });
  }, [onFilterChange]);

  // Clear specific filter type
  const handleClearFilterType = useCallback((filterType) => {
    onClearFilter(filterType);
    
    trackEvent('filter_type_cleared', {
      filter_type: filterType
    });
  }, [onClearFilter]);

  // Get filtered brands based on search
  const filteredBrands = useMemo(() => {
    if (!searchBrand) return BRAND_OPTIONS;
    return BRAND_OPTIONS.filter(brand =>
      brand.label.toLowerCase().includes(searchBrand.toLowerCase())
    );
  }, [searchBrand]);

  // Get visible brands (with show more functionality)
  const visibleBrands = useMemo(() => {
    return showMoreBrands ? filteredBrands : filteredBrands.slice(0, 6);
  }, [filteredBrands, showMoreBrands]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return Object.values(activeFilters).reduce((count, values) => {
      return count + (Array.isArray(values) ? values.length : 0);
    }, 0);
  }, [activeFilters]);

  return (
    <div className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl shadow-2xl overflow-hidden ${className}`}>
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <i className="fas fa-filter text-white text-lg"></i>
            </div>
            <div>
              <h3 className="text-xl font-bold text-theme">Filters</h3>
              <p className="text-muted-theme text-sm">
                {resultCount.toLocaleString()} products found
              </p>
            </div>
          </div>
          
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="bg-white/20 backdrop-blur-lg border border-white/30 text-white px-4 py-2 rounded-2xl hover:bg-white/30 transition-all duration-200 text-sm font-medium"
              title="Clear all filters"
            >
              <i className="fas fa-times mr-2"></i>
              Clear All ({activeFilterCount})
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        
        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-2xl p-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center">
              <i className="fas fa-tags mr-2"></i>
              Active Filters ({activeFilterCount})
            </h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(activeFilters).map(([filterType, values]) => 
                Array.isArray(values) && values.length > 0 && values.map(value => (
                  <span
                    key={`${filterType}-${value}`}
                    className="inline-flex items-center bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {value}
                    <button
                      onClick={() => handleFilterChange(filterType, value, false)}
                      className="ml-2 hover:bg-blue-200 dark:hover:bg-blue-700 rounded-full p-1 transition-colors"
                    >
                      <i className="fas fa-times text-xs"></i>
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
        )}

        {/* Sort Options */}
        <div className="space-y-4">
          <button
            onClick={() => toggleSection('sort')}
            className="w-full flex items-center justify-between p-4 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl hover:bg-white/20 transition-all duration-200"
          >
            <div className="flex items-center">
              <i className="fas fa-sort text-purple-500 mr-3"></i>
              <span className="font-semibold text-gray-900 dark:text-white">Sort By</span>
            </div>
            <i className={`fas fa-chevron-${expandedSections.sort ? 'up' : 'down'} text-gray-500`}></i>
          </button>

          {expandedSections.sort && (
            <div className="space-y-2 animate-fade-in">
              {SORT_OPTIONS.map((option) => (
                <label key={option.value} className="flex items-center p-3 hover:bg-white/10 rounded-xl cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="sort"
                    value={option.value}
                    checked={activeFilters.sort === option.value}
                    onChange={(e) => onFilterChange('sort', e.target.value)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mr-3"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Price Filter */}
        <div className="space-y-4">
          <button
            onClick={() => toggleSection('price')}
            className="w-full flex items-center justify-between p-4 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl hover:bg-white/20 transition-all duration-200"
          >
            <div className="flex items-center">
              <i className="fas fa-dollar-sign text-green-500 mr-3"></i>
              <span className="font-semibold text-gray-900 dark:text-white">Price</span>
              {activeFilters.price?.length > 0 && (
                <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  {activeFilters.price.length}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {activeFilters.price?.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearFilterType('price');
                  }}
                  className="text-red-500 hover:text-red-700 text-sm"
                  title="Clear price filters"
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
              <i className={`fas fa-chevron-${expandedSections.price ? 'up' : 'down'} text-gray-500`}></i>
            </div>
          </button>

          {expandedSections.price && (
            <div className="space-y-3 animate-fade-in">
              {PRICE_RANGES.map((range) => (
                <label key={range.value} className="flex items-center p-3 hover:bg-white/10 rounded-xl cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={activeFilters.price?.includes(range.value) || false}
                    onChange={(e) => handleFilterChange('price', range.value, e.target.checked)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500 mr-3"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    {range.label}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Brand Filter */}
        <div className="space-y-4">
          <button
            onClick={() => toggleSection('brand')}
            className="w-full flex items-center justify-between p-4 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl hover:bg-white/20 transition-all duration-200"
          >
            <div className="flex items-center">
              <i className="fas fa-tags text-blue-500 mr-3"></i>
              <span className="font-semibold text-gray-900 dark:text-white">Brand</span>
              {activeFilters.brand?.length > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {activeFilters.brand.length}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {activeFilters.brand?.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearFilterType('brand');
                  }}
                  className="text-red-500 hover:text-red-700 text-sm"
                  title="Clear brand filters"
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
              <i className={`fas fa-chevron-${expandedSections.brand ? 'up' : 'down'} text-gray-500`}></i>
            </div>
          </button>

          {expandedSections.brand && (
            <div className="space-y-3 animate-fade-in">
              {/* Brand Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search brands..."
                  value={searchBrand}
                  onChange={(e) => setSearchBrand(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>

              {/* Brand Options */}
              <div className="max-h-64 overflow-y-auto space-y-2">
                {visibleBrands.map((brand) => (
                  <label key={brand.value} className="flex items-center justify-between p-3 hover:bg-white/10 rounded-xl cursor-pointer transition-colors">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={activeFilters.brand?.includes(brand.value) || false}
                        onChange={(e) => handleFilterChange('brand', brand.value, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {brand.label}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 bg-white/20 px-2 py-1 rounded-full">
                      {brand.count}
                    </span>
                  </label>
                ))}
              </div>

              {filteredBrands.length > 6 && (
                <button
                  onClick={() => setShowMoreBrands(!showMoreBrands)}
                  className="w-full text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm font-medium py-2 transition-colors"
                >
                  {showMoreBrands ? 'Show Less' : `Show ${filteredBrands.length - 6} More`}
                  <i className={`fas fa-chevron-${showMoreBrands ? 'up' : 'down'} ml-2`}></i>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Category Filter */}
        <div className="space-y-4">
          <button
            onClick={() => toggleSection('category')}
            className="w-full flex items-center justify-between p-4 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl hover:bg-white/20 transition-all duration-200"
          >
            <div className="flex items-center">
              <i className="fas fa-th-large text-orange-500 mr-3"></i>
              <span className="font-semibold text-gray-900 dark:text-white">Category</span>
              {activeFilters.category?.length > 0 && (
                <span className="ml-2 bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                  {activeFilters.category.length}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {activeFilters.category?.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearFilterType('category');
                  }}
                  className="text-red-500 hover:text-red-700 text-sm"
                  title="Clear category filters"
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
              <i className={`fas fa-chevron-${expandedSections.category ? 'up' : 'down'} text-gray-500`}></i>
            </div>
          </button>

          {expandedSections.category && (
            <div className="grid grid-cols-1 gap-2 animate-fade-in">
              {CATEGORY_OPTIONS.map((category) => (
                <label key={category.value} className="flex items-center p-3 hover:bg-white/10 rounded-xl cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={activeFilters.category?.includes(category.value) || false}
                    onChange={(e) => handleFilterChange('category', category.value, e.target.checked)}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 mr-3"
                  />
                  <i className={`${category.icon} text-orange-500 mr-3 w-4`}></i>
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    {category.label}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Size Filter */}
        <div className="space-y-4">
          <button
            onClick={() => toggleSection('size')}
            className="w-full flex items-center justify-between p-4 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl hover:bg-white/20 transition-all duration-200"
          >
            <div className="flex items-center">
              <i className="fas fa-ruler text-purple-500 mr-3"></i>
              <span className="font-semibold text-gray-900 dark:text-white">Size</span>
              {activeFilters.size?.length > 0 && (
                <span className="ml-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                  {activeFilters.size.length}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {activeFilters.size?.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearFilterType('size');
                  }}
                  className="text-red-500 hover:text-red-700 text-sm"
                  title="Clear size filters"
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
              <i className={`fas fa-chevron-${expandedSections.size ? 'up' : 'down'} text-gray-500`}></i>
            </div>
          </button>

          {expandedSections.size && (
            <div className="grid grid-cols-4 gap-2 animate-fade-in">
              {SIZE_OPTIONS.map((size) => (
                <label key={size.value} className="relative">
                  <input
                    type="checkbox"
                    checked={activeFilters.size?.includes(size.value) || false}
                    onChange={(e) => handleFilterChange('size', size.value, e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`p-3 text-center rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                    activeFilters.size?.includes(size.value)
                      ? 'border-purple-500 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      : 'border-white/30 bg-white/10 text-gray-700 dark:text-gray-300 hover:border-purple-300'
                  }`}>
                    <span className="font-medium text-sm">{size.label}</span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Rating Filter */}
        <div className="space-y-4">
          <button
            onClick={() => toggleSection('rating')}
            className="w-full flex items-center justify-between p-4 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl hover:bg-white/20 transition-all duration-200"
          >
            <div className="flex items-center">
              <i className="fas fa-star text-yellow-500 mr-3"></i>
              <span className="font-semibold text-gray-900 dark:text-white">Rating</span>
              {activeFilters.rating?.length > 0 && (
                <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                  {activeFilters.rating.length}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {activeFilters.rating?.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearFilterType('rating');
                  }}
                  className="text-red-500 hover:text-red-700 text-sm"
                  title="Clear rating filters"
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
              <i className={`fas fa-chevron-${expandedSections.rating ? 'up' : 'down'} text-gray-500`}></i>
            </div>
          </button>

          {expandedSections.rating && (
            <div className="space-y-2 animate-fade-in">
              {RATING_OPTIONS.map((rating) => (
                <label key={rating.value} className="flex items-center p-3 hover:bg-white/10 rounded-xl cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={activeFilters.rating?.includes(rating.value) || false}
                    onChange={(e) => handleFilterChange('rating', rating.value, e.target.checked)}
                    className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 mr-3"
                  />
                  <span className="text-yellow-500 mr-2 text-sm">{rating.icon}</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    {rating.label}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/20 dark:border-gray-700/20 p-6">
        <div className="flex space-x-3">
          <button
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
            className="flex-1 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white font-semibold py-3 px-4 rounded-2xl hover:bg-white/20 transition-all duration-200"
          >
            <i className="fas fa-eraser mr-2"></i>
            Clear All
          </button>
          
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-2xl transition-all duration-200 transform hover:scale-105"
          >
            <i className="fas fa-arrow-up mr-2"></i>
            Back to Top
          </button>
        </div>
      </div>

      {/* Custom Styles */}
    </div>
  );
};

export default SearchFilters;
