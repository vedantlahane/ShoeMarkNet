// src/components/ProductFilter.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { debounce } from 'lodash';

const genderOptions = [
  { value: 'men', label: 'Men', icon: 'fa-mars', color: 'from-blue-500 to-cyan-500' },
  { value: 'women', label: 'Women', icon: 'fa-venus', color: 'from-pink-500 to-rose-500' },
  { value: 'unisex', label: 'Unisex', icon: 'fa-venus-mars', color: 'from-purple-500 to-indigo-500' }
];

const ProductFilter = ({ currentFilters, onFilterChange, onClose }) => {
  const { categories } = useSelector((state) => state.product);
  const [priceRange, setPriceRange] = useState({
    min: currentFilters.priceRange?.min || 0,
    max: currentFilters.priceRange?.max || 1000
  });
  const [expanded, setExpanded] = useState({
    categories: true,
    price: true,
    brand: true,
    gender: true,
    features: false
  });

  // Debounced price change handler
  const debouncedPriceChange = useMemo(
    () => debounce((newPriceRange) => {
      if (Number(newPriceRange.min) <= Number(newPriceRange.max)) {
        onFilterChange({ priceRange: newPriceRange });
      }
    }, 500),
    [onFilterChange]
  );

  // Enhanced handlers
  const handleCategoryChange = (categoryId) => {
    onFilterChange({ category: categoryId === currentFilters.category ? '' : categoryId });
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    const newPriceRange = { ...priceRange, [name]: value };
    setPriceRange(newPriceRange);
    debouncedPriceChange(newPriceRange);
  };

  const handleBrandChange = (brand) => {
    onFilterChange({ brand: brand === currentFilters.brand ? '' : brand });
  };

  const handleGenderChange = (gender) => {
    onFilterChange({ gender: gender === currentFilters.gender ? '' : gender });
  };

  const toggleSection = (section) => {
    setExpanded({ ...expanded, [section]: !expanded[section] });
  };

  const clearAllFilters = () => {
    onFilterChange({
      category: '',
      brand: '',
      gender: '',
      priceRange: { min: 0, max: 1000 },
      sort: 'newest'
    });
    setPriceRange({ min: 0, max: 1000 });
  };

  // Reset price inputs if invalid
  useEffect(() => {
    if (Number(priceRange.min) > Number(priceRange.max)) {
      setPriceRange({
        min: currentFilters.priceRange?.min || 0,
        max: currentFilters.priceRange?.max || 1000
      });
    }
  }, [priceRange, currentFilters.priceRange]);

  // Extract unique brands
  const { products } = useSelector((state) => state.product);
  const brands = [...new Set(products?.map(product => product.brand).filter(Boolean))];

  const activeFilters = useMemo(() => {
    const filters = [];

    if (currentFilters.category) {
      const categoryMatch = categories?.find(category => (category._id || category.name) === currentFilters.category);
      filters.push({
        key: 'category',
        label: `Category: ${categoryMatch?.name || currentFilters.category}`
      });
    }

    if (currentFilters.brand) {
      filters.push({ key: 'brand', label: `Brand: ${currentFilters.brand}` });
    }

    if (currentFilters.gender) {
      const genderLabel = genderOptions.find(option => option.value === currentFilters.gender)?.label || currentFilters.gender;
      filters.push({ key: 'gender', label: `Gender: ${genderLabel}` });
    }

    const minPrice = Number(currentFilters.priceRange?.min ?? 0);
    const maxPrice = Number(currentFilters.priceRange?.max ?? 1000);
    if (minPrice > 0 || maxPrice < 1000) {
      filters.push({
        key: 'priceRange',
        label: `Price: $${minPrice} - $${maxPrice >= 1000 ? '1000+' : maxPrice}`
      });
    }

    return filters;
  }, [categories, currentFilters.category, currentFilters.brand, currentFilters.gender, currentFilters.priceRange]);

  const handleRemoveFilter = (key) => {
    switch (key) {
      case 'category':
        onFilterChange({ category: '' });
        break;
      case 'brand':
        onFilterChange({ brand: '' });
        break;
      case 'gender':
        onFilterChange({ gender: '' });
        break;
      case 'priceRange':
        onFilterChange({ priceRange: { min: 0, max: 1000 } });
        setPriceRange({ min: 0, max: 1000 });
        break;
      default:
        break;
    }
  };

  // Enhanced options
  const featureOptions = [
    { value: 'waterproof', label: 'Waterproof', icon: 'fa-tint' },
    { value: 'breathable', label: 'Breathable', icon: 'fa-wind' },
    { value: 'lightweight', label: 'Lightweight', icon: 'fa-feather' },
    { value: 'cushioned', label: 'Cushioned', icon: 'fa-bed' },
    { value: 'durable', label: 'Durable', icon: 'fa-shield-alt' },
    { value: 'eco-friendly', label: 'Eco-Friendly', icon: 'fa-leaf' }
  ];

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="mb-4 block lg:hidden">
        <button
          onClick={onClose}
          className="flex w-full items-center justify-between rounded-xl border border-slate-200/70 bg-white/70 px-4 py-3 text-left font-medium text-slate-900 shadow-sm backdrop-blur-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-slate-100"
        >
          <span>Filters</span>
          <i className="fas fa-times text-slate-500 dark:text-slate-400" />
        </button>
      </div>

      {/* Active Filters */}
      {activeFilters.size > 0 && (
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-slate-100">
              Active Filters
            </h3>
            <button
              onClick={clearAllFilters}
              className="text-xs font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from(activeFilters).map((filter) => (
              <span
                key={filter}
                className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
              >
                {filter}
                <button
                  onClick={() => handleRemoveFilter(filter.split(':')[0])}
                  className="ml-1 hover:text-blue-800 dark:hover:text-blue-200"
                >
                  <i className="fas fa-times text-xs" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filter Sections */}
      <div className="space-y-6">
        {/* Categories */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('categories')}
            className="flex w-full items-center justify-between text-left"
          >
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-slate-100">
              Categories
            </h3>
            <i className={`fas fa-chevron-down text-xs text-slate-500 transition-transform duration-200 dark:text-slate-400 ${expanded.categories ? 'rotate-180' : ''}`} />
          </button>
          {expanded.categories && (
            <div className="space-y-2">
              {categories?.map((category) => (
                <button
                  key={category._id || category.name}
                  onClick={() => handleCategoryChange(category._id || category.name)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors duration-200 ${
                    currentFilters.category === (category._id || category.name)
                      ? 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{category.name}</span>
                  {currentFilters.category === (category._id || category.name) && (
                    <i className="fas fa-check text-blue-500" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('price')}
            className="flex w-full items-center justify-between text-left"
          >
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-slate-100">
              Price Range
            </h3>
            <i className={`fas fa-chevron-down text-xs text-slate-500 transition-transform duration-200 dark:text-slate-400 ${expanded.price ? 'rotate-180' : ''}`} />
          </button>
          {expanded.price && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                    Min Price
                  </label>
                  <input
                    type="number"
                    name="min"
                    value={priceRange.min}
                    onChange={handlePriceChange}
                    placeholder="0"
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                    Max Price
                  </label>
                  <input
                    type="number"
                    name="max"
                    value={priceRange.max}
                    onChange={handlePriceChange}
                    placeholder="1000"
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Brand */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('brand')}
            className="flex w-full items-center justify-between text-left"
          >
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-slate-100">
              Brand
            </h3>
            <i className={`fas fa-chevron-down text-xs text-slate-500 transition-transform duration-200 dark:text-slate-400 ${expanded.brand ? 'rotate-180' : ''}`} />
          </button>
          {expanded.brand && (
            <div className="space-y-2">
              {brands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => handleBrandChange(brand)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors duration-200 ${
                    currentFilters.brand === brand
                      ? 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{brand}</span>
                  {currentFilters.brand === brand && (
                    <i className="fas fa-check text-blue-500" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Gender */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('gender')}
            className="flex w-full items-center justify-between text-left"
          >
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-slate-100">
              Gender
            </h3>
            <i className={`fas fa-chevron-down text-xs text-slate-500 transition-transform duration-200 dark:text-slate-400 ${expanded.gender ? 'rotate-180' : ''}`} />
          </button>
          {expanded.gender && (
            <div className="space-y-2">
              {genderOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleGenderChange(option.value)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors duration-200 ${
                    currentFilters.gender === option.value
                      ? 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <i className={`fas ${option.icon} text-sm`} />
                    <span>{option.label}</span>
                  </div>
                  {currentFilters.gender === option.value && (
                    <i className="fas fa-check text-blue-500" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Features */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('features')}
            className="flex w-full items-center justify-between text-left"
          >
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-slate-100">
              Features
            </h3>
            <i className={`fas fa-chevron-down text-xs text-slate-500 transition-transform duration-200 dark:text-slate-400 ${expanded.features ? 'rotate-180' : ''}`} />
          </button>
          {expanded.features && (
            <div className="space-y-2">
              {featureOptions.map((feature) => (
                <div key={feature.value} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={feature.value}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800"
                  />
                  <label
                    htmlFor={feature.value}
                    className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"
                  >
                    <i className={`fas ${feature.icon} text-slate-500`} />
                    <span>{feature.label}</span>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductFilter;
