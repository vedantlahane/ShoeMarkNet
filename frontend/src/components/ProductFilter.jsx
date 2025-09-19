// src/components/ProductFilter.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { debounce } from 'lodash';

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
  const [animateFilters, setAnimateFilters] = useState(false);

  // Trigger animations
  useEffect(() => {
    setAnimateFilters(true);
  }, []);

  // Debounced price change handler
  const debouncedPriceChange = useCallback(
    debounce((newPriceRange) => {
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

  // Enhanced options
  const genderOptions = [
    { value: 'men', label: 'Men', icon: 'fa-mars', color: 'from-blue-500 to-cyan-500' },
    { value: 'women', label: 'Women', icon: 'fa-venus', color: 'from-pink-500 to-rose-500' },
    { value: 'unisex', label: 'Unisex', icon: 'fa-venus-mars', color: 'from-purple-500 to-indigo-500' }
  ];

  const featureOptions = [
    { value: 'waterproof', label: 'Waterproof', icon: 'fa-tint' },
    { value: 'breathable', label: 'Breathable', icon: 'fa-wind' },
    { value: 'lightweight', label: 'Lightweight', icon: 'fa-feather' },
    { value: 'cushioned', label: 'Cushioned', icon: 'fa-bed' },
    { value: 'durable', label: 'Durable', icon: 'fa-shield-alt' },
    { value: 'eco-friendly', label: 'Eco-Friendly', icon: 'fa-leaf' }
  ];

  // Calculate active filters count
  const activeFiltersCount = Object.values({
    category: currentFilters.category,
    brand: currentFilters.brand,
    gender: currentFilters.gender,
    priceMin: currentFilters.priceRange?.min > 0 ? currentFilters.priceRange.min : null,
    priceMax: currentFilters.priceRange?.max < 1000 ? currentFilters.priceRange.max : null
  }).filter(Boolean).length;

  return (
    <div className="space-y-6">
      
      {/* Enhanced Category Filter */}
      <div className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl overflow-hidden shadow-2xl ${
        animateFilters ? 'animate-fade-in-up' : 'opacity-0'
      }`}>
        <button
          onClick={() => toggleSection('categories')}
          className="w-full p-6 flex justify-between items-center hover:bg-white/10 transition-all duration-200"
          aria-expanded={expanded.categories}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
              <i className="fas fa-list text-white"></i>
            </div>
            <div className="text-left">
              <h3 className="font-bold text-gray-900 dark:text-white">Categories</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Browse by type</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {currentFilters.category && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                1
              </span>
            )}
            <i className={`fas fa-chevron-down transition-transform duration-200 text-gray-600 dark:text-gray-400 ${
              expanded.categories ? 'rotate-180' : ''
            }`}></i>
          </div>
        </button>
        
        {expanded.categories && (
          <div className="px-6 pb-6 animate-fade-in">
            {categories && categories.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {categories.map((category, index) => (
                  <div
                    key={category._id || category.name}
                    className={`animate-fade-in-up`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <label className="flex items-center space-x-3 p-3 rounded-2xl hover:bg-white/10 transition-all duration-200 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          id={`category-${category._id || category.name}`}
                          checked={currentFilters.category === (category._id || category.name)}
                          onChange={() => handleCategoryChange(category._id || category.name)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-lg border-2 border-white/30 flex items-center justify-center transition-all duration-200 ${
                          currentFilters.category === (category._id || category.name)
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-blue-400'
                            : 'bg-white/10 group-hover:bg-white/20'
                        }`}>
                          {currentFilters.category === (category._id || category.name) && (
                            <i className="fas fa-check text-white text-xs"></i>
                          )}
                        </div>
                      </div>
                      <span className="text-gray-900 dark:text-white font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {category.name}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <i className="fas fa-folder-open text-4xl text-gray-400 mb-3"></i>
                <p className="text-gray-500 dark:text-gray-400">No categories available</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Enhanced Price Range Filter */}
      <div className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl overflow-hidden shadow-2xl ${
        animateFilters ? 'animate-fade-in-up' : 'opacity-0'
      }`} style={{ animationDelay: '0.1s' }}>
        <button
          onClick={() => toggleSection('price')}
          className="w-full p-6 flex justify-between items-center hover:bg-white/10 transition-all duration-200"
          aria-expanded={expanded.price}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
              <i className="fas fa-dollar-sign text-white"></i>
            </div>
            <div className="text-left">
              <h3 className="font-bold text-gray-900 dark:text-white">Price Range</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Set your budget</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {(currentFilters.priceRange?.min > 0 || currentFilters.priceRange?.max < 1000) && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                ${currentFilters.priceRange?.min} - ${currentFilters.priceRange?.max}
              </span>
            )}
            <i className={`fas fa-chevron-down transition-transform duration-200 text-gray-600 dark:text-gray-400 ${
              expanded.price ? 'rotate-180' : ''
            }`}></i>
          </div>
        </button>
        
        {expanded.price && (
          <div className="px-6 pb-6 animate-fade-in">
            <div className="space-y-6">
              {/* Price Input Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    <i className="fas fa-arrow-down mr-2 text-green-500"></i>
                    Min Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      name="min"
                      value={priceRange.min}
                      onChange={handlePriceChange}
                      className="w-full pl-8 pr-4 py-3 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    <i className="fas fa-arrow-up mr-2 text-red-500"></i>
                    Max Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      name="max"
                      value={priceRange.max}
                      onChange={handlePriceChange}
                      className="w-full pl-8 pr-4 py-3 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-400"
                      placeholder="1000"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Enhanced Range Slider */}
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={priceRange.max}
                    onChange={(e) => handlePriceChange({ target: { name: 'max', value: e.target.value } })}
                    className="w-full h-2 bg-gradient-to-r from-green-200 to-red-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <span>$0</span>
                    <span>$250</span>
                    <span>$500</span>
                    <span>$750</span>
                    <span>$1000+</span>
                  </div>
                </div>

                {/* Quick Price Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Under $50', min: 0, max: 50 },
                    { label: 'Under $100', min: 0, max: 100 },
                    { label: '$100 - $200', min: 100, max: 200 },
                    { label: '$200+', min: 200, max: 1000 }
                  ].map((range, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        const newRange = { min: range.min, max: range.max };
                        setPriceRange(newRange);
                        debouncedPriceChange(newRange);
                      }}
                      className={`p-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                        priceRange.min === range.min && priceRange.max === range.max
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                          : 'bg-white/20 text-gray-900 dark:text-white hover:bg-white/30'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Validation */}
              {Number(priceRange.min) > Number(priceRange.max) && (
                <div className="bg-red-500/20 border border-red-300/50 rounded-2xl p-3">
                  <div className="flex items-center text-red-600 dark:text-red-400">
                    <i className="fas fa-exclamation-triangle mr-2"></i>
                    <span className="text-sm">Minimum price cannot be greater than maximum price</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Enhanced Brand Filter */}
      {brands && brands.length > 0 && (
        <div className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl overflow-hidden shadow-2xl ${
          animateFilters ? 'animate-fade-in-up' : 'opacity-0'
        }`} style={{ animationDelay: '0.2s' }}>
          <button
            onClick={() => toggleSection('brand')}
            className="w-full p-6 flex justify-between items-center hover:bg-white/10 transition-all duration-200"
            aria-expanded={expanded.brand}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                <i className="fas fa-tags text-white"></i>
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-900 dark:text-white">Brands</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Filter by brand</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {currentFilters.brand && (
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-semibold">
                  1
                </span>
              )}
              <i className={`fas fa-chevron-down transition-transform duration-200 text-gray-600 dark:text-gray-400 ${
                expanded.brand ? 'rotate-180' : ''
              }`}></i>
            </div>
          </button>
          
          {expanded.brand && (
            <div className="px-6 pb-6 animate-fade-in">
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {brands.map((brand, index) => (
                  <div
                    key={brand}
                    className={`animate-fade-in-up`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <label className="flex items-center space-x-3 p-3 rounded-2xl hover:bg-white/10 transition-all duration-200 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          id={`brand-${brand}`}
                          checked={currentFilters.brand === brand}
                          onChange={() => handleBrandChange(brand)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-lg border-2 border-white/30 flex items-center justify-center transition-all duration-200 ${
                          currentFilters.brand === brand
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-purple-400'
                            : 'bg-white/10 group-hover:bg-white/20'
                        }`}>
                          {currentFilters.brand === brand && (
                            <i className="fas fa-check text-white text-xs"></i>
                          )}
                        </div>
                      </div>
                      <span className="text-gray-900 dark:text-white font-medium group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {brand}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Enhanced Gender Filter */}
      <div className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl overflow-hidden shadow-2xl ${
        animateFilters ? 'animate-fade-in-up' : 'opacity-0'
      }`} style={{ animationDelay: '0.3s' }}>
        <button
          onClick={() => toggleSection('gender')}
          className="w-full p-6 flex justify-between items-center hover:bg-white/10 transition-all duration-200"
          aria-expanded={expanded.gender}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
              <i className="fas fa-venus-mars text-white"></i>
            </div>
            <div className="text-left">
              <h3 className="font-bold text-gray-900 dark:text-white">Gender</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Target audience</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {currentFilters.gender && (
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-semibold">
                1
              </span>
            )}
            <i className={`fas fa-chevron-down transition-transform duration-200 text-gray-600 dark:text-gray-400 ${
              expanded.gender ? 'rotate-180' : ''
            }`}></i>
          </div>
        </button>
        
        {expanded.gender && (
          <div className="px-6 pb-6 animate-fade-in">
            <div className="space-y-3">
              {genderOptions.map((option, index) => (
                <div
                  key={option.value}
                  className={`animate-fade-in-up`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <label className="flex items-center space-x-3 p-3 rounded-2xl hover:bg-white/10 transition-all duration-200 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        id={`gender-${option.value}`}
                        checked={currentFilters.gender === option.value}
                        onChange={() => handleGenderChange(option.value)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded-lg border-2 border-white/30 flex items-center justify-center transition-all duration-200 ${
                        currentFilters.gender === option.value
                          ? `bg-gradient-to-r ${option.color} border-opacity-60`
                          : 'bg-white/10 group-hover:bg-white/20'
                      }`}>
                        {currentFilters.gender === option.value && (
                          <i className="fas fa-check text-white text-xs"></i>
                        )}
                      </div>
                    </div>
                    <div className={`w-8 h-8 bg-gradient-to-r ${option.color} rounded-xl flex items-center justify-center`}>
                      <i className={`fas ${option.icon} text-white text-sm`}></i>
                    </div>
                    <span className="text-gray-900 dark:text-white font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {option.label}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Features Filter */}
      <div className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl overflow-hidden shadow-2xl ${
        animateFilters ? 'animate-fade-in-up' : 'opacity-0'
      }`} style={{ animationDelay: '0.4s' }}>
        <button
          onClick={() => toggleSection('features')}
          className="w-full p-6 flex justify-between items-center hover:bg-white/10 transition-all duration-200"
          aria-expanded={expanded.features}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center">
              <i className="fas fa-star text-white"></i>
            </div>
            <div className="text-left">
              <h3 className="font-bold text-gray-900 dark:text-white">Features</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Special attributes</p>
            </div>
          </div>
          <i className={`fas fa-chevron-down transition-transform duration-200 text-gray-600 dark:text-gray-400 ${
            expanded.features ? 'rotate-180' : ''
          }`}></i>
        </button>
        
        {expanded.features && (
          <div className="px-6 pb-6 animate-fade-in">
            <div className="grid grid-cols-2 gap-3">
              {featureOptions.map((feature, index) => (
                <div
                  key={feature.value}
                  className={`animate-fade-in-up`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <button className="w-full p-3 bg-white/20 hover:bg-white/30 rounded-2xl transition-all duration-200 text-left">
                    <div className="flex items-center space-x-2">
                      <i className={`fas ${feature.icon} text-cyan-500`}></i>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{feature.label}</span>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Enhanced Active Filters */}
      {activeFiltersCount > 0 && (
        <div className={`bg-blue-500/20 backdrop-blur-xl border border-blue-300/50 rounded-3xl p-6 shadow-2xl ${
          animateFilters ? 'animate-fade-in-up' : 'opacity-0'
        }`} style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-blue-800 dark:text-blue-200">
              <i className="fas fa-filter mr-2"></i>
              Active Filters ({activeFiltersCount})
            </h3>
            <button
              onClick={clearAllFilters}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm font-semibold"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentFilters.category && (
              <span className="inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-800 dark:text-blue-200 px-3 py-2 rounded-full text-sm font-medium">
                <i className="fas fa-list mr-2"></i>
                {categories.find(c => (c._id || c.name) === currentFilters.category)?.name || currentFilters.category}
                <button 
                  onClick={() => handleCategoryChange(currentFilters.category)}
                  className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                >
                  <i className="fas fa-times"></i>
                </button>
              </span>
            )}
            
            {currentFilters.brand && (
              <span className="inline-flex items-center bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-800 dark:text-purple-200 px-3 py-2 rounded-full text-sm font-medium">
                <i className="fas fa-tags mr-2"></i>
                {currentFilters.brand}
                <button 
                  onClick={() => handleBrandChange(currentFilters.brand)}
                  className="ml-2 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
                >
                  <i className="fas fa-times"></i>
                </button>
              </span>
            )}
            
            {currentFilters.gender && (
              <span className="inline-flex items-center bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 text-orange-800 dark:text-orange-200 px-3 py-2 rounded-full text-sm font-medium">
                <i className="fas fa-venus-mars mr-2"></i>
                {genderOptions.find(g => g.value === currentFilters.gender)?.label || currentFilters.gender}
                <button 
                  onClick={() => handleGenderChange(currentFilters.gender)}
                  className="ml-2 text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200"
                >
                  <i className="fas fa-times"></i>
                </button>
              </span>
            )}
            
            {(currentFilters.priceRange?.min > 0 || currentFilters.priceRange?.max < 1000) && (
              <span className="inline-flex items-center bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-800 dark:text-green-200 px-3 py-2 rounded-full text-sm font-medium">
                <i className="fas fa-dollar-sign mr-2"></i>
                ${currentFilters.priceRange?.min} - ${currentFilters.priceRange?.max}
                <button 
                  onClick={() => {
                    const newRange = { min: 0, max: 1000 };
                    setPriceRange(newRange);
                    onFilterChange({ priceRange: newRange });
                  }}
                  className="ml-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                >
                  <i className="fas fa-times"></i>
                </button>
              </span>
            )}
          </div>
        </div>
      )}
      
      {/* Enhanced Clear All Button */}
      <div className={`${animateFilters ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
        <button
          onClick={clearAllFilters}
          className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-2xl"
        >
          <i className="fas fa-broom mr-3"></i>
          Clear All Filters
          {activeFiltersCount > 0 && (
            <span className="ml-2 bg-white/20 rounded-full px-2 py-1 text-xs">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Custom Styles */}
    </div>
  );
};

export default ProductFilter;
