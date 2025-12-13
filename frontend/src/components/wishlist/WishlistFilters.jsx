import React from 'react';
import SearchBar from '../common/forms/SearchBar';

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
      <div className="rounded-2xl border border-theme bg-surface p-6 theme-shadow-soft">
        <div className="flex flex-col gap-5 lg:flex-row">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={onSearchChange}
              placeholder="Search your wishlist..."
              className="w-full"
            />
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-muted-theme">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="h-11 w-48 appearance-none rounded-xl border border-theme bg-card px-4 pr-10 text-theme transition-colors focus:border-theme-strong focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-theme"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-card text-theme">
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-theme">
                <i className="fas fa-chevron-down"></i>
              </div>
            </div>

            <div className="relative">
              <select
                value={itemsPerPage}
                onChange={(e) => onItemsPerPageChange(parseInt(e.target.value, 10))}
                className="h-11 w-40 appearance-none rounded-xl border border-theme bg-card px-4 pr-10 text-theme transition-colors focus:border-theme-strong focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-theme"
              >
                {itemsPerPageOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-card text-theme">
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-theme">
                <i className="fas fa-chevron-down"></i>
              </div>
            </div>

            <div className="flex rounded-xl border border-theme bg-card p-1">
              {[
                { key: 'grid', icon: 'fa-th-large' },
                { key: 'list', icon: 'fa-list' },
                { key: 'compact', icon: 'fa-th' }
              ].map((mode) => (
                <button
                  key={mode.key}
                  onClick={() => onViewModeChange(mode.key)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                    viewMode === mode.key ? 'bg-primary-500 text-white shadow-focus' : 'text-muted-theme hover:text-theme'
                  }`}
                  aria-label={`Use ${mode.key} view`}
                >
                  <i className={`fas ${mode.icon}`}></i>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 text-sm text-muted-theme md:grid-cols-2 xl:grid-cols-4">
          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-wide text-muted-theme opacity-80">Category</span>
            <input
              type="text"
              value={filterBy.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              placeholder="All categories"
              className="h-11 rounded-xl border border-theme bg-card px-4 text-theme placeholder:text-muted-theme transition-colors focus:border-theme-strong focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-theme"
            />
          </label>

          <div className="flex items-center justify-between gap-3 rounded-xl border border-theme bg-card px-4 py-3">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-theme">
              <input
                type="checkbox"
                checked={filterBy.inStock}
                onChange={() => handleToggle('inStock')}
                className="h-4 w-4 rounded border border-theme bg-card text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-theme"
              />
              In stock
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-theme">
              <input
                type="checkbox"
                checked={filterBy.onSale}
                onChange={() => handleToggle('onSale')}
                className="h-4 w-4 rounded border border-theme bg-card text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-theme"
              />
              On sale
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-wide text-muted-theme opacity-80">Min price</span>
            <input
              type="number"
              min={0}
              value={filterBy.priceRange.min}
              onChange={(e) => handlePriceChange('min', parseInt(e.target.value, 10) || 0)}
              className="h-11 rounded-xl border border-theme bg-card px-4 text-theme placeholder:text-muted-theme transition-colors focus:border-theme-strong focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-theme"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-wide text-muted-theme opacity-80">Max price</span>
            <input
              type="number"
              min={0}
              value={filterBy.priceRange.max}
              onChange={(e) => handlePriceChange('max', parseInt(e.target.value, 10) || 0)}
              className="h-11 rounded-xl border border-theme bg-card px-4 text-theme placeholder:text-muted-theme transition-colors focus:border-theme-strong focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-theme"
            />
          </label>
        </div>
      </div>

      {totalItems > 0 && (
        <div className="rounded-2xl border border-theme bg-surface p-6 theme-shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-sm text-muted-theme">
              <button
                onClick={onSelectAll}
                className="inline-flex items-center gap-2 font-semibold transition-colors hover:text-theme"
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded border ${
                    allSelected ? 'border-primary-500 bg-primary-500 text-white shadow-focus' : 'border-theme'
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
                    className="inline-flex items-center gap-2 rounded-xl border border-primary-500 bg-primary-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <i className="fas fa-cart-plus"></i>
                    Add to cart ({selectedItems.length})
                  </button>
                  <button
                    onClick={onBulkRemove}
                    disabled={bulkLoading}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-500 px-4 py-2 font-semibold text-red-500 transition-colors hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <i className="fas fa-trash"></i>
                    Remove
                  </button>
                </>
              )}

              <button
                onClick={onClearWishlist}
                className="text-sm font-semibold text-muted-theme transition-colors hover:text-red-500"
              >
                <i className="fas fa-ban mr-2"></i>
                Clear wishlist
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="text-center text-xs uppercase tracking-wide text-muted-theme">
        <i className="fas fa-info-circle mr-2 text-muted-theme"></i>
        {totalItems} items in your wishlist
      </div>
    </div>
  );
};

export default WishlistFilters;
