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
  const allSelected = selectedItems.length === totalItems && totalItems > 0;
  const hasSelection = selectedItems.length > 0;

  const handleToggle = (key) => {
    onFilterChange({ [key]: !filterBy[key] });
  };

  const handlePriceChange = (key, value) => {
    const numeric = Number.isFinite(value) ? value : 0;
    onFilterChange({
      priceRange: {
        ...filterBy.priceRange,
        [key]: numeric
      }
    });
  };

  const handleCategoryChange = (value) => {
    onFilterChange({ category: value });
  };

  return (
    <div className={`space-y-6 ${className}`} style={style}>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <div className="flex flex-col gap-5 lg:flex-row">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={onSearchChange}
              placeholder="Search your wishlist..."
              className="w-full"
            />
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-slate-200">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="h-11 w-48 appearance-none rounded-xl border border-slate-700 bg-slate-900/80 px-4 pr-10 transition-colors focus:border-slate-400 focus:outline-none"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-slate-900 text-slate-200">
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                <i className="fas fa-chevron-down"></i>
              </div>
            </div>

            <div className="relative">
              <select
                value={itemsPerPage}
                onChange={(e) => onItemsPerPageChange(parseInt(e.target.value, 10))}
                className="h-11 w-40 appearance-none rounded-xl border border-slate-700 bg-slate-900/80 px-4 pr-10 transition-colors focus:border-slate-400 focus:outline-none"
              >
                {itemsPerPageOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-slate-900 text-slate-200">
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                <i className="fas fa-chevron-down"></i>
              </div>
            </div>

            <div className="flex rounded-xl border border-slate-700 bg-slate-900/70 p-1">
              {[
                { key: 'grid', icon: 'fa-th-large' },
                { key: 'list', icon: 'fa-list' },
                { key: 'compact', icon: 'fa-th' }
              ].map((mode) => (
                <button
                  key={mode.key}
                  onClick={() => onViewModeChange(mode.key)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                    viewMode === mode.key ? 'bg-white text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                  aria-label={`Use ${mode.key} view`}
                >
                  <i className={`fas ${mode.icon}`}></i>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 text-sm text-slate-300 md:grid-cols-2 xl:grid-cols-4">
          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-wide text-slate-500">Category</span>
            <input
              type="text"
              value={filterBy.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              placeholder="All categories"
              className="h-11 rounded-xl border border-slate-700 bg-slate-900/80 px-4 text-slate-200 placeholder:text-slate-500 transition-colors focus:border-slate-400 focus:outline-none"
            />
          </label>

          <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <input
                type="checkbox"
                checked={filterBy.inStock}
                onChange={() => handleToggle('inStock')}
                className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-slate-900 focus:ring-0"
              />
              In stock
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <input
                type="checkbox"
                checked={filterBy.onSale}
                onChange={() => handleToggle('onSale')}
                className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-slate-900 focus:ring-0"
              />
              On sale
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-wide text-slate-500">Min price</span>
            <input
              type="number"
              min={0}
              value={filterBy.priceRange.min}
              onChange={(e) => handlePriceChange('min', parseInt(e.target.value, 10) || 0)}
              className="h-11 rounded-xl border border-slate-700 bg-slate-900/80 px-4 text-slate-200 placeholder:text-slate-500 transition-colors focus:border-slate-400 focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-wide text-slate-500">Max price</span>
            <input
              type="number"
              min={0}
              value={filterBy.priceRange.max}
              onChange={(e) => handlePriceChange('max', parseInt(e.target.value, 10) || 0)}
              className="h-11 rounded-xl border border-slate-700 bg-slate-900/80 px-4 text-slate-200 placeholder:text-slate-500 transition-colors focus:border-slate-400 focus:outline-none"
            />
          </label>
        </div>
      </div>

      {totalItems > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <button
                onClick={onSelectAll}
                className="inline-flex items-center gap-2 font-semibold transition-colors hover:text-white"
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded border ${
                    allSelected ? 'border-white bg-white text-slate-950' : 'border-slate-600'
                  }`}
                >
                  {allSelected && <i className="fas fa-check text-xs"></i>}
                </span>
                {allSelected ? 'Deselect all' : 'Select all'}
              </button>

              {hasSelection && <span>{selectedItems.length} selected</span>}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              {hasSelection && (
                <>
                  <button
                    onClick={onBulkAddToCart}
                    disabled={bulkLoading}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white px-4 py-2 font-semibold text-slate-950 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <i className="fas fa-cart-plus"></i>
                    Add to cart ({selectedItems.length})
                  </button>
                  <button
                    onClick={onBulkRemove}
                    disabled={bulkLoading}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-400 px-4 py-2 font-semibold text-red-200 transition-colors hover:border-red-300 hover:text-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <i className="fas fa-trash"></i>
                    Remove
                  </button>
                </>
              )}

              <button
                onClick={onClearWishlist}
                className="text-sm font-semibold text-slate-500 transition-colors hover:text-red-300"
              >
                <i className="fas fa-ban mr-2"></i>
                Clear wishlist
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="text-center text-xs uppercase tracking-wide text-slate-500">
        <i className="fas fa-info-circle mr-2 text-slate-400"></i>
        {totalItems} items in your wishlist
      </div>
    </div>
  );
};

export default WishlistFilters;
