import React from 'react';
import PropTypes from 'prop-types';

const ProductFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  sortBy,
  sortOrder,
  onSortChange,
  viewMode,
  onViewModeChange,
  productsPerPage,
  onProductsPerPageChange,
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  categories = [],
  statusFilters = [],
  sortOptions = [],
  perPageOptions = [],
  animateCards = false,
  className = ''
}) => {
  const handleSortChange = (event) => {
    const [field, order] = event.target.value.split('-');
    onSortChange(field, order);
  };

  return (
    <section
      className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-xl space-y-6 ${
        animateCards ? 'animate-fade-in-up' : ''
      } ${className}`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
          <label className="relative flex-1">
            <span className="sr-only">Search products</span>
            <input
              id="product-search"
              type="search"
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search products, SKU or brand..."
              className="w-full px-4 py-3 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
            />
            <i className="fas fa-search absolute right-4 top-3 text-gray-400"></i>
          </label>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              className={`w-10 h-10 rounded-2xl border border-white/30 backdrop-blur-lg flex items-center justify-center transition-all ${
                viewMode === 'cards'
                  ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white'
                  : 'bg-white/10 text-gray-600 dark:text-gray-300'
              }`}
              title="Card view"
              onClick={() => onViewModeChange('cards')}
            >
              <i className="fas fa-grip-horizontal"></i>
            </button>
            <button
              type="button"
              className={`w-10 h-10 rounded-2xl border border-white/30 backdrop-blur-lg flex items-center justify-center transition-all ${
                viewMode === 'table'
                  ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white'
                  : 'bg-white/10 text-gray-600 dark:text-gray-300'
              }`}
              title="Table view"
              onClick={() => onViewModeChange('table')}
            >
              <i className="fas fa-table"></i>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {selectedCount > 0 ? (
              <button
                type="button"
                onClick={onClearSelection}
                className="text-blue-500 hover:text-blue-400 mr-2"
              >
                Clear selection
              </button>
            ) : null}
            <span className="font-semibold text-gray-900 dark:text-white">
              {selectedCount > 0 ? `${selectedCount} selected` : `${totalCount} products`}
            </span>
          </div>
          <button
            type="button"
            className="px-4 py-2 bg-white/10 backdrop-blur-lg border border-white/30 rounded-2xl text-sm text-gray-700 dark:text-gray-200 hover:bg-white/20"
            onClick={onSelectAll}
          >
            {selectedCount > 0 ? 'Select none' : 'Select all'}
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <span>Status</span>
          <select
            value={statusFilter}
            onChange={(event) => onStatusFilterChange(event.target.value)}
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
          >
            {statusFilters.map((option) => (
              <option key={option.value} value={option.value} className="text-gray-900">
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <span>Category</span>
          <select
            value={categoryFilter}
            onChange={(event) => onCategoryFilterChange(event.target.value)}
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category._id || category.name} value={category._id || category.slug || category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <span>Sort by</span>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={handleSortChange}
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <span>Per page</span>
          <select
            value={productsPerPage}
            onChange={(event) => onProductsPerPageChange(Number(event.target.value))}
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
          >
            {perPageOptions.map((option) => (
              <option key={option} value={option}>
                {option} items
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
};

ProductFilters.propTypes = {
  searchTerm: PropTypes.string,
  onSearchChange: PropTypes.func.isRequired,
  statusFilter: PropTypes.string,
  onStatusFilterChange: PropTypes.func.isRequired,
  categoryFilter: PropTypes.string,
  onCategoryFilterChange: PropTypes.func.isRequired,
  sortBy: PropTypes.string,
  sortOrder: PropTypes.string,
  onSortChange: PropTypes.func.isRequired,
  viewMode: PropTypes.string,
  onViewModeChange: PropTypes.func.isRequired,
  productsPerPage: PropTypes.number,
  onProductsPerPageChange: PropTypes.func.isRequired,
  selectedCount: PropTypes.number,
  totalCount: PropTypes.number,
  onSelectAll: PropTypes.func.isRequired,
  onClearSelection: PropTypes.func.isRequired,
  categories: PropTypes.array,
  statusFilters: PropTypes.array,
  sortOptions: PropTypes.array,
  perPageOptions: PropTypes.array,
  animateCards: PropTypes.bool,
  className: PropTypes.string
};

export default ProductFilters;
