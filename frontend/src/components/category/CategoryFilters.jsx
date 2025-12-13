import React, { useState } from 'react';
import SearchBar from '../common/forms/SearchBar';
import PriceRangeSlider from '../common/forms/PriceRangeSlider';
import RatingFilter from '../common/forms/RatingFilter';

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
    <div className="space-y-4">
      
      {/* Main Controls Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
        
        {/* Left Side - Search and Quick Filters */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          
          {/* Search */}
          <div className="min-w-72">
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
                className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filterBy === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                <i className={`fas ${option.icon} mr-1.5`}></i>
                {option.label}
              </button>
            ))}
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={onToggleFilters}
            className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-purple-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            <i className="fas fa-sliders-h mr-1.5"></i>
            Filters
            {hasActiveFilters && (
              <span className="ml-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            )}
          </button>
        </div>

        {/* Right Side - View Controls */}
        <div className="flex items-center gap-3">
          
          {/* Results Count */}
          <span className="text-slate-500 dark:text-slate-400 text-sm whitespace-nowrap">
            <i className="fas fa-list-alt mr-1"></i>
            {loading ? 'Loading...' : `${currentResults} products`}
          </span>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-lg px-3 py-1.5 pr-8 text-sm text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <i className="fas fa-chevron-down text-xs text-slate-400"></i>
            </div>
          </div>

          {/* Items Per Page */}
          <div className="relative">
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(parseInt(e.target.value, 10))}
              className="appearance-none bg-white border border-slate-200 rounded-lg px-3 py-1.5 pr-8 text-sm text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              {itemsPerPageOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <i className="fas fa-chevron-down text-xs text-slate-400"></i>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5">
            {viewModes.map((mode) => (
              <button
                key={mode.value}
                onClick={() => onViewModeChange(mode.value)}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === mode.value 
                    ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title={mode.label}
              >
                <i className={`fas ${mode.icon} text-sm`}></i>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Price Range */}
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white mb-2 flex items-center text-sm">
                <i className="fas fa-dollar-sign mr-1.5 text-green-500"></i>
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
                <h4 className="font-medium text-slate-900 dark:text-white mb-2 flex items-center text-sm">
                  <i className="fas fa-tags mr-1.5 text-blue-500"></i>
                  Brands ({selectedBrands.length})
                </h4>
                <div className="max-h-32 overflow-y-auto space-y-1.5">
                  {availableBrands.map((brand) => (
                    <label key={brand} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => onBrandToggle(brand)}
                        className="sr-only"
                      />
                      <div className={`w-3.5 h-3.5 rounded border-2 mr-1.5 flex items-center justify-center transition-colors ${
                        selectedBrands.includes(brand)
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}>
                        {selectedBrands.includes(brand) && (
                          <i className="fas fa-check text-white text-[10px]"></i>
                        )}
                      </div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Rating Filter */}
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white mb-2 flex items-center text-sm">
                <i className="fas fa-star mr-1.5 text-yellow-500"></i>
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
                className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  hasActiveFilters
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                }`}
              >
                <i className="fas fa-times mr-1.5"></i>
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Active:</span>
          
          {filterBy !== 'all' && (
            <button
              onClick={() => onFilterChange('all')}
              className="flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors"
            >
              {filterOptions.find(f => f.value === filterBy)?.label}
              <i className="fas fa-times ml-1.5 text-[10px]"></i>
            </button>
          )}

          {selectedBrands.map((brand) => (
            <button
              key={brand}
              onClick={() => onBrandToggle(brand)}
              className="flex items-center bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-md text-xs font-medium hover:bg-purple-200 dark:hover:bg-purple-800/40 transition-colors"
            >
              {brand}
              <i className="fas fa-times ml-1.5 text-[10px]"></i>
            </button>
          ))}

          {selectedRating > 0 && (
            <button
              onClick={() => onRatingFilter(0)}
              className="flex items-center bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 rounded-md text-xs font-medium hover:bg-yellow-200 dark:hover:bg-yellow-800/40 transition-colors"
            >
              {selectedRating}+ stars
              <i className="fas fa-times ml-1.5 text-[10px]"></i>
            </button>
          )}

          {(priceRange.min > 0 || priceRange.max < 10000) && (
            <button
              onClick={() => onPriceRangeChange({ min: 0, max: 10000 })}
              className="flex items-center bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-md text-xs font-medium hover:bg-green-200 dark:hover:bg-green-800/40 transition-colors"
            >
              ${priceRange.min} - ${priceRange.max}
              <i className="fas fa-times ml-1.5 text-[10px]"></i>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryFilters;
