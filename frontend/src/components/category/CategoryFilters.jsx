import React, { useState } from 'react';
import SearchBar from '../common/SearchBar';
import PriceRangeSlider from '../common/PriceRangeSlider';
import RatingFilter from '../common/RatingFilter';

const CategoryFilters = ({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  filterBy,
  onFilterChange,
  viewMode,
  onViewModeChange,
  itemsPerPage,
  onItemsPerPageChange,
  priceRange,
  onPriceRangeChange,
  selectedBrands,
  availableBrands,
  onBrandToggle,
  selectedRating,
  onRatingFilter,
  showFilters,
  onToggleFilters,
  onClearFilters,
  totalResults,
  currentResults,
  sortOptions,
  filterOptions,
  viewModes,
  itemsPerPageOptions,
  loading
}) => {
  const hasActiveFilters = filterBy !== 'all' || 
                          searchTerm || 
                          selectedBrands.length > 0 || 
                          selectedRating > 0 || 
                          priceRange.min > 0 || 
                          priceRange.max < 10000;

  return (
    <div className="space-y-6">
      
      {/* Main Controls Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
        
        {/* Left Side - Search and Quick Filters */}
        <div className="flex flex-wrap items-center gap-4 flex-1">
          
          {/* Search */}
          <div className="min-w-80">
            <SearchBar
              value={searchTerm}
              onChange={onSearchChange}
              placeholder="Search in category..."
              className="w-full"
            />
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {filterOptions.slice(0, 4).map((option) => (
              <button
                key={option.value}
                onClick={() => onFilterChange(option.value)}
                className={`flex items-center px-4 py-2 rounded-2xl font-medium transition-all duration-200 ${
                  filterBy === option.value
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white/20 backdrop-blur-lg border border-white/30 text-gray-900 dark:text-white hover:bg-white/30'
                }`}
              >
                <i className={`fas ${option.icon} mr-2`}></i>
                {option.label}
              </button>
            ))}
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={onToggleFilters}
            className={`flex items-center px-4 py-2 rounded-2xl font-medium transition-all duration-200 ${
              showFilters || hasActiveFilters
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white/20 backdrop-blur-lg border border-white/30 text-gray-900 dark:text-white hover:bg-white/30'
            }`}
          >
            <i className="fas fa-sliders-h mr-2"></i>
            Filters
            {hasActiveFilters && (
              <span className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </button>
        </div>

        {/* Right Side - View Controls */}
        <div className="flex items-center gap-4">
          
          {/* Results Count */}
          <span className="text-gray-600 dark:text-gray-400 text-sm whitespace-nowrap">
            <i className="fas fa-list-alt mr-1"></i>
            {loading ? 'Loading...' : `${currentResults} of ${totalResults} products`}
          </span>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl px-4 py-2 pr-10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={loading}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value} className="bg-gray-800 text-white">
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <i className="fas fa-chevron-down text-gray-400"></i>
            </div>
          </div>

          {/* Items Per Page */}
          <div className="relative">
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(parseInt(e.target.value, 10))}
              className="appearance-none bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl px-4 py-2 pr-10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={loading}
            >
              {itemsPerPageOptions.map(option => (
                <option key={option.value} value={option.value} className="bg-gray-800 text-white">
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <i className="fas fa-chevron-down text-gray-400"></i>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-1">
            {viewModes.map((mode) => (
              <button
                key={mode.value}
                onClick={() => onViewModeChange(mode.value)}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  viewMode === mode.value 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
                title={mode.label}
              >
                <i className={`fas ${mode.icon}`}></i>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-2xl animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Price Range */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <i className="fas fa-dollar-sign mr-2 text-green-500"></i>
                Price Range
              </h4>
              <PriceRangeSlider
                min={0}
                max={10000}
                value={priceRange}
                onChange={onPriceRangeChange}
              />
            </div>

            {/* Brand Filter */}
            {availableBrands.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <i className="fas fa-tags mr-2 text-blue-500"></i>
                  Brands ({selectedBrands.length})
                </h4>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {availableBrands.map((brand) => (
                    <label key={brand} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => onBrandToggle(brand)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded border-2 mr-2 flex items-center justify-center transition-colors ${
                        selectedBrands.includes(brand)
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {selectedBrands.includes(brand) && (
                          <i className="fas fa-check text-white text-xs"></i>
                        )}
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Rating Filter */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <i className="fas fa-star mr-2 text-yellow-500"></i>
                Minimum Rating
              </h4>
              <RatingFilter
                selectedRating={selectedRating}
                onRatingSelect={onRatingFilter}
              />
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={onClearFilters}
                disabled={!hasActiveFilters}
                className={`w-full py-2 px-4 rounded-2xl font-medium transition-all duration-200 ${
                  hasActiveFilters
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                <i className="fas fa-times mr-2"></i>
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active filters:</span>
          
          {filterBy !== 'all' && (
            <button
              onClick={() => onFilterChange('all')}
              className="flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800/30 transition-colors"
            >
              {filterOptions.find(f => f.value === filterBy)?.label}
              <i className="fas fa-times ml-2"></i>
            </button>
          )}

          {selectedBrands.map((brand) => (
            <button
              key={brand}
              onClick={() => onBrandToggle(brand)}
              className="flex items-center bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-800/30 transition-colors"
            >
              {brand}
              <i className="fas fa-times ml-2"></i>
            </button>
          ))}

          {selectedRating > 0 && (
            <button
              onClick={() => onRatingFilter(0)}
              className="flex items-center bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full text-sm font-medium hover:bg-yellow-200 dark:hover:bg-yellow-800/30 transition-colors"
            >
              {selectedRating}+ stars
              <i className="fas fa-times ml-2"></i>
            </button>
          )}

          {(priceRange.min > 0 || priceRange.max < 10000) && (
            <button
              onClick={() => onPriceRangeChange({ min: 0, max: 10000 })}
              className="flex items-center bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium hover:bg-green-200 dark:hover:bg-green-800/30 transition-colors"
            >
              ${priceRange.min} - ${priceRange.max}
              <i className="fas fa-times ml-2"></i>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryFilters;
