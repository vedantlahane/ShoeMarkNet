// src/components/ProductFilter.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { debounce } from 'lodash'; // You'll need to install lodash

const ProductFilter = ({ currentFilters, onFilterChange }) => {
  const { categories } = useSelector((state) => state.product);
  const [priceRange, setPriceRange] = useState({
    min: currentFilters.priceRange?.min || 0,
    max: currentFilters.priceRange?.max || 1000
  });
  const [expanded, setExpanded] = useState({
    categories: true,
    price: true,
    brand: false,
    gender: false
  });

  // Create a debounced version of the filter change handler
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedPriceChange = useCallback(
    debounce((newPriceRange) => {
      // Validate price range before applying filter
      if (Number(newPriceRange.min) <= Number(newPriceRange.max)) {
        onFilterChange({ priceRange: newPriceRange });
      }
    }, 500),
    [onFilterChange]
  );

  // Handle category selection
  const handleCategoryChange = (categoryId) => {
    onFilterChange({ category: categoryId === currentFilters.category ? '' : categoryId });
  };

  // Handle price range changes
  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    const newPriceRange = { ...priceRange, [name]: value };
    setPriceRange(newPriceRange);
    debouncedPriceChange(newPriceRange);
  };

  // Handle brand selection
  const handleBrandChange = (brand) => {
    onFilterChange({ brand: brand === currentFilters.brand ? '' : brand });
  };

  // Handle gender selection
  const handleGenderChange = (gender) => {
    onFilterChange({ gender: gender === currentFilters.gender ? '' : gender });
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpanded({ ...expanded, [section]: !expanded[section] });
  };

  // Reset price inputs if they're invalid
  useEffect(() => {
    if (Number(priceRange.min) > Number(priceRange.max)) {
      setPriceRange({
        min: currentFilters.priceRange?.min || 0,
        max: currentFilters.priceRange?.max || 1000
      });
    }
  }, [priceRange, currentFilters.priceRange]);

  // Extract unique brands from products for the brand filter
  const { products } = useSelector((state) => state.product);
  const brands = [...new Set(products?.map(product => product.brand).filter(Boolean))];

  // Gender options
  const genderOptions = [
    { value: 'men', label: 'Men' },
    { value: 'women', label: 'Women' },
    { value: 'unisex', label: 'Unisex' }
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Filters</h2>
      
      {/* Mobile filter toggle */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setExpanded({
            categories: !Object.values(expanded).every(Boolean),
            price: !Object.values(expanded).every(Boolean),
            brand: !Object.values(expanded).every(Boolean),
            gender: !Object.values(expanded).every(Boolean)
          })}
          className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-800 flex justify-between items-center"
        >
          <span>Toggle All Filters</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {/* Category filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('categories')}
          className="w-full flex justify-between items-center font-medium mb-2 focus:outline-none"
          aria-expanded={expanded.categories}
        >
          <h3>Categories</h3>
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${expanded.categories ? 'transform rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        
        {expanded.categories && (
          <div className="mt-2 max-h-60 overflow-y-auto">
            {categories && categories.length > 0 ? (
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li key={category._id || category.name} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`category-${category._id || category.name}`}
                      checked={currentFilters.category === (category._id || category.name)}
                      onChange={() => handleCategoryChange(category._id || category.name)}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      aria-label={`Filter by ${category.name}`}
                    />
                    <label htmlFor={`category-${category._id || category.name}`} className="cursor-pointer text-gray-700">
                      {category.name}
                    </label>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No categories available</p>
            )}
          </div>
        )}
      </div>
      
      {/* Price range filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex justify-between items-center font-medium mb-2 focus:outline-none"
          aria-expanded={expanded.price}
        >
          <h3>Price Range</h3>
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${expanded.price ? 'transform rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        
        {expanded.price && (
          <div className="mt-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-1/2">
                <label htmlFor="min-price" className="block text-sm text-gray-700 mb-1">Min ($)</label>
                <input
                  type="number"
                  id="min-price"
                  name="min"
                  value={priceRange.min}
                  onChange={handlePriceChange}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Min"
                  min="0"
                  aria-label="Minimum price"
                />
              </div>
              <div className="w-1/2">
                <label htmlFor="max-price" className="block text-sm text-gray-700 mb-1">Max ($)</label>
                <input
                  type="number"
                  id="max-price"
                  name="max"
                  value={priceRange.max}
                  onChange={handlePriceChange}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Max"
                  min="0"
                  aria-label="Maximum price"
                />
              </div>
            </div>
            
            {Number(priceRange.min) > Number(priceRange.max) && (
              <p className="text-red-500 text-sm">Minimum price cannot be greater than maximum price</p>
            )}
            
            <div className="mt-2">
              <input
                type="range"
                min="0"
                max="1000"
                value={priceRange.max}
                onChange={(e) => handlePriceChange({ target: { name: 'max', value: e.target.value } })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>$0</span>
                <span>$250</span>
                <span>$500</span>
                <span>$750</span>
                <span>$1000+</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Brand filter */}
      {brands && brands.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => toggleSection('brand')}
            className="w-full flex justify-between items-center font-medium mb-2 focus:outline-none"
            aria-expanded={expanded.brand}
          >
            <h3>Brands</h3>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${expanded.brand ? 'transform rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          
          {expanded.brand && (
            <div className="mt-2 max-h-60 overflow-y-auto">
              <ul className="space-y-2">
                {brands.map((brand) => (
                  <li key={brand} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`brand-${brand}`}
                      checked={currentFilters.brand === brand}
                      onChange={() => handleBrandChange(brand)}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      aria-label={`Filter by ${brand}`}
                    />
                    <label htmlFor={`brand-${brand}`} className="cursor-pointer text-gray-700">
                      {brand}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {/* Gender filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('gender')}
          className="w-full flex justify-between items-center font-medium mb-2 focus:outline-none"
          aria-expanded={expanded.gender}
        >
          <h3>Gender</h3>
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${expanded.gender ? 'transform rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        
        {expanded.gender && (
          <div className="mt-2">
            <ul className="space-y-2">
              {genderOptions.map((option) => (
                <li key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`gender-${option.value}`}
                    checked={currentFilters.gender === option.value}
                    onChange={() => handleGenderChange(option.value)}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    aria-label={`Filter by ${option.label}`}
                  />
                  <label htmlFor={`gender-${option.value}`} className="cursor-pointer text-gray-700">
                    {option.label}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Active filters display */}
      <div className="mb-4">
        <h3 className="font-medium mb-2">Active Filters</h3>
        <div className="flex flex-wrap gap-2">
          {currentFilters.category && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center">
              {categories.find(c => (c._id || c.name) === currentFilters.category)?.name || currentFilters.category}
              <button 
                onClick={() => handleCategoryChange(currentFilters.category)}
                className="ml-1 text-blue-600 hover:text-blue-800"
                aria-label={`Remove category filter`}
              >
                ×
              </button>
            </span>
          )}
          
          {currentFilters.brand && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center">
              {currentFilters.brand}
              <button 
                onClick={() => handleBrandChange(currentFilters.brand)}
                className="ml-1 text-blue-600 hover:text-blue-800"
                aria-label={`Remove brand filter`}
              >
                ×
              </button>
            </span>
          )}
          
          {currentFilters.gender && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center">
              {genderOptions.find(g => g.value === currentFilters.gender)?.label || currentFilters.gender}
              <button 
                onClick={() => handleGenderChange(currentFilters.gender)}
                className="ml-1 text-blue-600 hover:text-blue-800"
                aria-label={`Remove gender filter`}
              >
                ×
              </button>
            </span>
          )}
          
          {(currentFilters.priceRange?.min > 0 || currentFilters.priceRange?.max < 1000) && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center">
              ${currentFilters.priceRange?.min} - ${currentFilters.priceRange?.max}
              <button 
                onClick={() => onFilterChange({ priceRange: { min: 0, max: 1000 } })}
                className="ml-1 text-blue-600 hover:text-blue-800"
                aria-label="Remove price range filter"
              >
                ×
              </button>
            </span>
          )}
        </div>
      </div>
      
      {/* Clear filters button */}
      <button
        onClick={() => onFilterChange({
          category: '',
          brand: '',
          gender: '',
          priceRange: { min: 0, max: 1000 },
          sort: 'newest'
        })}
        className="w-full py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-800 font-medium transition-colors"
        aria-label="Clear all filters"
      >
        Clear All Filters
      </button>
    </div>
  );
};

export default ProductFilter;
