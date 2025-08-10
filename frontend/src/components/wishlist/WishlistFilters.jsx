import React from 'react';
import SearchBar from '../common/SearchBar';

const WishlistFilters = ({
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
  totalItems,
  selectedItems,
  onSelectAll,
  onBulkAddToCart,
  onBulkRemove,
  onClearWishlist,
  bulkLoading,
  sortOptions,
  itemsPerPageOptions,
  className = '',
  style = {}
}) => {
  return (
    <div className={`space-y-6 ${className}`} style={style}>
      
      {/* Search and Primary Controls */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Search */}
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={onSearchChange}
              placeholder="Search your wishlist..."
              className="w-full"
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl px-6 py-3 pr-12 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors duration-200"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value} className="bg-gray-800 text-white">
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <i className="fas fa-chevron-down text-gray-400"></i>
            </div>
          </div>

          {/* Items per page */}
          <div className="relative">
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(parseInt(e.target.value, 10))}
              className="appearance-none bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl px-6 py-3 pr-12 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors duration-200"
            >
              {itemsPerPageOptions.map(option => (
                <option key={option.value} value={option.value} className="bg-gray-800 text-white">
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <i className="fas fa-chevron-down text-gray-400"></i>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-3 rounded-xl transition-all duration-200 ${
                viewMode === 'grid' 
                  ? 'bg-pink-600 text-white' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400'
              }`}
            >
              <i className="fas fa-th-large"></i>
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-3 rounded-xl transition-all duration-200 ${
                viewMode === 'list' 
                  ? 'bg-pink-600 text-white' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400'
              }`}
            >
              <i className="fas fa-list"></i>
            </button>
            <button
              onClick={() => onViewModeChange('compact')}
              className={`p-3 rounded-xl transition-all duration-200 ${
                viewMode === 'compact' 
                  ? 'bg-pink-600 text-white' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400'
              }`}
            >
              <i className="fas fa-th"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {totalItems > 0 && (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            
            {/* Selection Controls */}
            <div className="flex items-center space-x-4">
              <button
                onClick={onSelectAll}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors font-medium"
              >
                <div className={`w-5 h-5 rounded border-2 border-current flex items-center justify-center ${
                  selectedItems.length === totalItems ? 'bg-pink-600 border-pink-600' : ''
                }`}>
                  {selectedItems.length === totalItems && (
                    <i className="fas fa-check text-white text-xs"></i>
                  )}
                </div>
                <span>{selectedItems.length === totalItems ? 'Deselect All' : 'Select All'}</span>
              </button>
              
              {selectedItems.length > 0 && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedItems.length} selected
                </span>
              )}
            </div>

            {/* Bulk Actions */}
            {selectedItems.length > 0 && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={onBulkAddToCart}
                  disabled={bulkLoading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-2xl transition-all duration-200 disabled:opacity-50"
                >
                  <i className="fas fa-cart-plus mr-2"></i>
                  Add to Cart ({selectedItems.length})
                </button>
                <button
                  onClick={onBulkRemove}
                  disabled={bulkLoading}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-2xl transition-all duration-200 disabled:opacity-50"
                >
                  <i className="fas fa-trash mr-2"></i>
                  Remove
                </button>
              </div>
            )}

            {/* Clear All */}
            <button
              onClick={onClearWishlist}
              className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors text-sm font-medium"
            >
              <i className="fas fa-trash mr-1"></i>
              Clear Wishlist
            </button>
          </div>
        </div>
      )}

      {/* Results Info */}
      <div className="text-center text-gray-600 dark:text-gray-400">
        <i className="fas fa-info-circle mr-2"></i>
        {totalItems} items in your wishlist
      </div>
    </div>
  );
};

export default WishlistFilters;
