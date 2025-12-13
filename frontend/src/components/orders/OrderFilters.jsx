import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Utils
import { trackEvent } from '../../utils/analytics';
import { formatCurrency } from '../../utils/helpers';

// Hooks
import useLocalStorage from '../../hooks/useLocalStorage';

const OrderFilters = ({
  onFiltersChange = () => {},
  initialFilters = {},
  variant = 'default', // default, compact, advanced
  showQuickFilters = true,
  showAdvancedFilters = true,
  className = ''
}) => {
  // Default filter structure
  const defaultFilters = {
    status: '',
    dateRange: '',
    customDateStart: '',
    customDateEnd: '',
    amountMin: '',
    amountMax: '',
    paymentMethod: '',
    shippingMethod: '',
    customer: '',
    orderId: '',
    productName: '',
    category: '',
    sortBy: 'newest',
    page: 1,
    limit: 20
  };

  // State management
  const [filters, setFilters] = useState({ ...defaultFilters, ...initialFilters });
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [animateElements, setAnimateElements] = useState(false);
  const [appliedFiltersCount, setAppliedFiltersCount] = useState(0);

  // Local storage for filter preferences
  const [savedFilters, setSavedFilters] = useLocalStorage('orderFilters', {});

  // Initialize animations
  useEffect(() => {
    setTimeout(() => setAnimateElements(true), 100);
  }, []);

  // Order statuses
  const orderStatuses = [
    { value: '', label: 'All Statuses', color: 'from-gray-500 to-gray-600' },
    { value: 'pending', label: 'Pending', color: 'from-yellow-500 to-orange-500' },
    { value: 'confirmed', label: 'Confirmed', color: 'from-blue-500 to-cyan-500' },
    { value: 'processing', label: 'Processing', color: 'from-purple-500 to-pink-500' },
    { value: 'shipped', label: 'Shipped', color: 'from-indigo-500 to-blue-500' },
    { value: 'delivered', label: 'Delivered', color: 'from-green-500 to-emerald-500' },
    { value: 'cancelled', label: 'Cancelled', color: 'from-red-500 to-rose-500' },
    { value: 'refunded', label: 'Refunded', color: 'from-orange-500 to-red-500' }
  ];

  // Date ranges
  const dateRanges = [
    { value: '', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'thisYear', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  // Payment methods
  const paymentMethods = [
    { value: '', label: 'All Payment Methods' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'stripe', label: 'Stripe' },
    { value: 'apple_pay', label: 'Apple Pay' },
    { value: 'google_pay', label: 'Google Pay' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cash_on_delivery', label: 'Cash on Delivery' }
  ];

  // Shipping methods
  const shippingMethods = [
    { value: '', label: 'All Shipping Methods' },
    { value: 'standard', label: 'Standard Shipping' },
    { value: 'express', label: 'Express Shipping' },
    { value: 'overnight', label: 'Overnight Shipping' },
    { value: 'same_day', label: 'Same Day Delivery' },
    { value: 'pickup', label: 'Store Pickup' },
    { value: 'international', label: 'International Shipping' }
  ];

  // Sort options
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'amount_high', label: 'Amount: High to Low' },
    { value: 'amount_low', label: 'Amount: Low to High' },
    { value: 'customer_name', label: 'Customer Name (A-Z)' },
    { value: 'status', label: 'Status' }
  ];

  // Product categories
  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'running', label: 'Running Shoes' },
    { value: 'basketball', label: 'Basketball' },
    { value: 'casual', label: 'Casual' },
    { value: 'formal', label: 'Formal' },
    { value: 'athletic', label: 'Athletic' },
    { value: 'boots', label: 'Boots' }
  ];

  // Count applied filters
  useEffect(() => {
    const count = Object.entries(filters).filter(([key, value]) => {
      if (key === 'page' || key === 'limit' || key === 'sortBy') return false;
      return value && value !== '';
    }).length;
    setAppliedFiltersCount(count);
  }, [filters]);

  // Handle filter change
  const handleFilterChange = useCallback((key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    onFiltersChange(newFilters);

    trackEvent('order_filters_changed', {
      filter_key: key,
      filter_value: value,
      total_applied_filters: appliedFiltersCount
    });
  }, [filters, onFiltersChange, appliedFiltersCount]);

  // Handle debounced filter changes
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  // Clear all filters
  const handleClearAll = useCallback(() => {
    const clearedFilters = { ...defaultFilters, sortBy: filters.sortBy };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);

    trackEvent('order_filters_cleared', {
      previous_applied_filters: appliedFiltersCount
    });
  }, [defaultFilters, filters.sortBy, onFiltersChange, appliedFiltersCount]);

  // Save current filters
  const handleSaveFilters = useCallback(() => {
    const filterName = prompt('Enter a name for this filter preset:');
    if (filterName && filterName.trim()) {
      const newSavedFilters = {
        ...savedFilters,
        [filterName.trim()]: filters
      };
      setSavedFilters(newSavedFilters);
      
      trackEvent('order_filters_saved', {
        filter_name: filterName.trim(),
        applied_filters: appliedFiltersCount
      });
    }
  }, [filters, savedFilters, setSavedFilters, appliedFiltersCount]);

  // Load saved filters
  const handleLoadFilters = useCallback((filterName) => {
    const loadedFilters = savedFilters[filterName];
    if (loadedFilters) {
      setFilters(loadedFilters);
      onFiltersChange(loadedFilters);
      
      trackEvent('order_filters_loaded', {
        filter_name: filterName
      });
    }
  }, [savedFilters, onFiltersChange]);

  // Quick filter buttons
  const quickFilters = useMemo(() => [
    { key: 'status', value: 'pending', label: 'Pending Orders', icon: 'fas fa-clock', color: 'from-yellow-500 to-orange-500' },
    { key: 'dateRange', value: 'today', label: 'Today', icon: 'fas fa-calendar-day', color: 'from-blue-500 to-cyan-500' },
    { key: 'status', value: 'shipped', label: 'Shipped', icon: 'fas fa-shipping-fast', color: 'from-indigo-500 to-blue-500' },
    { key: 'status', value: 'delivered', label: 'Delivered', icon: 'fas fa-check-circle', color: 'from-green-500 to-emerald-500' },
    { key: 'paymentMethod', value: 'credit_card', label: 'Credit Card', icon: 'fas fa-credit-card', color: 'from-purple-500 to-pink-500' }
  ], []);

  // Render compact variant
  if (variant === 'compact') {
    return (
      <div className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl p-4 shadow-xl ${className}`}>
        <div className="flex flex-wrap items-center gap-4">
          
          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-3 py-2 text-gray-900 dark:text-white text-sm"
          >
            {orderStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          {/* Date Range */}
          <select
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-3 py-2 text-gray-900 dark:text-white text-sm"
          >
            {dateRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>

          {/* Search */}
          <input
            type="text"
            placeholder="Search orders..."
            value={filters.orderId}
            onChange={(e) => handleFilterChange('orderId', e.target.value)}
            className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-3 py-2 text-gray-900 dark:text-white text-sm placeholder-gray-500"
          />

          {/* Clear */}
          {appliedFiltersCount > 0 && (
            <button
              onClick={handleClearAll}
              className="bg-red-500/20 border border-red-300 text-red-700 dark:text-red-400 px-3 py-2 rounded-xl hover:bg-red-500/30 transition-colors text-sm"
            >
              Clear ({appliedFiltersCount})
            </button>
          )}
        </div>
      </div>
    );
  }

  // Render default variant
  return (
    <div className={`space-y-6 ${className}`}>
      
      {/* Header */}
      <div className={`${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`}>
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                <i className="fas fa-filter mr-3"></i>
                Order Filters
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Filter and search through orders with advanced criteria
                {appliedFiltersCount > 0 && (
                  <span className="ml-2 bg-blue-500/20 border border-blue-300 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full text-sm font-semibold">
                    {appliedFiltersCount} active
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Saved Filters */}
              {Object.keys(savedFilters).length > 0 && (
                <div className="relative group">
                  <button className="bg-white/20 backdrop-blur-lg border border-white/30 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-2xl hover:bg-white/30 transition-colors">
                    <i className="fas fa-bookmark mr-2"></i>
                    Saved Filters
                  </button>
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <div className="p-3 space-y-2">
                      {Object.keys(savedFilters).map((filterName) => (
                        <button
                          key={filterName}
                          onClick={() => handleLoadFilters(filterName)}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/20 rounded-xl transition-colors"
                        >
                          {filterName}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Save Current Filters */}
              {appliedFiltersCount > 0 && (
                <button
                  onClick={handleSaveFilters}
                  className="bg-white/20 backdrop-blur-lg border border-white/30 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-2xl hover:bg-white/30 transition-colors"
                >
                  <i className="fas fa-save mr-2"></i>
                  Save
                </button>
              )}
              
              {/* Clear All */}
              {appliedFiltersCount > 0 && (
                <button
                  onClick={handleClearAll}
                  className="bg-red-500/20 border border-red-300 text-red-700 dark:text-red-400 font-semibold py-2 px-4 rounded-2xl hover:bg-red-500/30 transition-colors"
                >
                  <i className="fas fa-times mr-2"></i>
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      {showQuickFilters && (
        <div className={`${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-2xl">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <i className="fas fa-bolt mr-2 text-yellow-500"></i>
              Quick Filters
            </h3>
            <div className="flex flex-wrap gap-3">
              {quickFilters.map((filter, index) => (
                <button
                  key={index}
                  onClick={() => handleFilterChange(filter.key, filter.value)}
                  className={`flex items-center px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
                    filters[filter.key] === filter.value
                      ? `bg-gradient-to-r ${filter.color} text-white shadow-lg`
                      : 'bg-white/20 text-gray-700 dark:text-gray-300 hover:bg-white/30'
                  }`}
                >
                  <i className={`${filter.icon} mr-2`}></i>
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Filters */}
      <div className={`${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-2xl">
          
          {/* Basic Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
            
            {/* Order Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                <i className="fas fa-info-circle mr-2 text-blue-500"></i>
                Order Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {orderStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                <i className="fas fa-calendar mr-2 text-green-500"></i>
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {dateRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                <i className="fas fa-user mr-2 text-purple-500"></i>
                Customer
              </label>
              <input
                type="text"
                placeholder="Search by customer name or email..."
                value={filters.customer}
                onChange={(e) => handleFilterChange('customer', e.target.value)}
                className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Order ID Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                <i className="fas fa-hashtag mr-2 text-orange-500"></i>
                Order ID
              </label>
              <input
                type="text"
                placeholder="Search by order ID..."
                value={filters.orderId}
                onChange={(e) => handleFilterChange('orderId', e.target.value)}
                className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex items-center justify-between pt-6 border-t border-white/20 dark:border-gray-700/20">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-semibold text-gray-900 dark:text-white">
                <i className="fas fa-sort mr-2 text-indigo-500"></i>
                Sort By:
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-3 py-2 text-gray-900 dark:text-white"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Advanced Filters Toggle */}
            {showAdvancedFilters && (
              <button
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                className="flex items-center space-x-2 bg-white/20 backdrop-blur-lg border border-white/30 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-xl hover:bg-white/30 transition-colors"
              >
                <i className="fas fa-cog"></i>
                <span>Advanced Filters</span>
                <i className={`fas fa-chevron-${isAdvancedOpen ? 'up' : 'down'} transition-transform duration-200`}></i>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && isAdvancedOpen && (
        <div className={`${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-2xl">
            <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <i className="fas fa-sliders-h mr-2 text-purple-500"></i>
              Advanced Filters
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Amount Range */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  <i className="fas fa-dollar-sign mr-2 text-green-500"></i>
                  Amount Range
                </label>
                <div className="flex space-x-3">
                  <input
                    type="number"
                    placeholder="Min amount"
                    value={filters.amountMin}
                    onChange={(e) => handleFilterChange('amountMin', e.target.value)}
                    className="flex-1 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="flex items-center text-gray-500">to</span>
                  <input
                    type="number"
                    placeholder="Max amount"
                    value={filters.amountMax}
                    onChange={(e) => handleFilterChange('amountMax', e.target.value)}
                    className="flex-1 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  <i className="fas fa-credit-card mr-2 text-blue-500"></i>
                  Payment Method
                </label>
                <select
                  value={filters.paymentMethod}
                  onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                  className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {paymentMethods.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Shipping Method */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  <i className="fas fa-shipping-fast mr-2 text-indigo-500"></i>
                  Shipping Method
                </label>
                <select
                  value={filters.shippingMethod}
                  onChange={(e) => handleFilterChange('shippingMethod', e.target.value)}
                  className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {shippingMethods.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  <i className="fas fa-th-large mr-2 text-pink-500"></i>
                  Product Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Name Search */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  <i className="fas fa-search mr-2 text-teal-500"></i>
                  Product Name
                </label>
                <input
                  type="text"
                  placeholder="Search by product name..."
                  value={filters.productName}
                  onChange={(e) => handleFilterChange('productName', e.target.value)}
                  className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Custom Date Range */}
            {filters.dateRange === 'custom' && (
              <div className="mt-6 pt-6 border-t border-white/20 dark:border-gray-700/20">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  <i className="fas fa-calendar-alt mr-2 text-orange-500"></i>
                  Custom Date Range
                </label>
                <div className="flex space-x-3">
                  <input
                    type="date"
                    value={filters.customDateStart}
                    onChange={(e) => handleFilterChange('customDateStart', e.target.value)}
                    className="flex-1 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="flex items-center text-gray-500">to</span>
                  <input
                    type="date"
                    value={filters.customDateEnd}
                    onChange={(e) => handleFilterChange('customDateEnd', e.target.value)}
                    className="flex-1 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Styles */}
    </div>
  );
};

export default OrderFilters;
