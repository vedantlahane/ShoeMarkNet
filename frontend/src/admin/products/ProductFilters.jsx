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
      className={`rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm space-y-6 dark:border-slate-800 dark:bg-slate-900/80 ${
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
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-blue-500"
            />
            <i className="fas fa-search absolute right-4 top-3 text-slate-400"></i>
          </label>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                viewMode === 'cards'
                  ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
              }`}
              title="Card view"
              onClick={() => onViewModeChange('cards')}
            >
              <i className="fas fa-grip-horizontal"></i>
            </button>
            <button
              type="button"
              className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                viewMode === 'table'
                  ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
              }`}
              title="Table view"
              onClick={() => onViewModeChange('table')}
            >
              <i className="fas fa-table"></i>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-500 dark:text-slate-300">
            {selectedCount > 0 ? (
              <button
                type="button"
                onClick={onClearSelection}
                className="mr-3 text-blue-600 transition hover:text-blue-500"
              >
                Clear selection
              </button>
            ) : null}
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {selectedCount > 0 ? `${selectedCount} selected` : `${totalCount} products`}
            </span>
          </div>
          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-500"
            onClick={onSelectAll}
          >
            {selectedCount > 0 ? 'Select none' : 'Select all'}
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
          <span>Status</span>
          <select
            value={statusFilter}
            onChange={(event) => onStatusFilterChange(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-blue-500"
          >
            {statusFilters.map((option) => (
              <option key={option.value} value={option.value} className="text-gray-900">
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
          <span>Category</span>
          <select
            value={categoryFilter}
            onChange={(event) => onCategoryFilterChange(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category._id || category.name} value={category._id || category.slug || category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
          <span>Sort by</span>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={handleSortChange}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-blue-500"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
          <span>Per page</span>
          <select
            value={productsPerPage}
            onChange={(event) => onProductsPerPageChange(Number(event.target.value))}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-blue-500"
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
