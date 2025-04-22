// src/components/ProductFilter.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const ProductFilter = ({ currentFilters, onFilterChange }) => {
  const { categories } = useSelector((state) => state.product);
  const [priceRange, setPriceRange] = useState({
    min: currentFilters.priceRange?.min || 0,
    max: currentFilters.priceRange?.max || 1000
  });

  // Handle category selection
  const handleCategoryChange = (category) => {
    onFilterChange({ category: category === currentFilters.category ? '' : category });
  };

  // Handle price range changes
  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setPriceRange({...priceRange, [name]: value});
  };

  // Apply price filter when user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ priceRange });
    }, 500);
    
    return () => clearTimeout(timer);
  }, [priceRange]);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Filters</h2>
      
      {/* Category filter */}
      <div className="mb-6">
        <h3 className="font-medium mb-2">Categories</h3>
        <ul className="space-y-2">
          {categories.map((category) => (
            <li key={category} className="flex items-center">
              <input
                type="checkbox"
                id={`category-${category}`}
                checked={currentFilters.category === category}
                onChange={() => handleCategoryChange(category)}
                className="mr-2"
              />
              <label htmlFor={`category-${category}`} className="cursor-pointer">
                {category}
              </label>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Price range filter */}
      <div className="mb-6">
        <h3 className="font-medium mb-2">Price Range</h3>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            name="min"
            value={priceRange.min}
            onChange={handlePriceChange}
            className="w-1/2 p-2 border rounded"
            placeholder="Min"
          />
          <span>-</span>
          <input
            type="number"
            name="max"
            value={priceRange.max}
            onChange={handlePriceChange}
            className="w-1/2 p-2 border rounded"
            placeholder="Max"
          />
        </div>
      </div>
      
      {/* Clear filters button */}
      <button
        onClick={() => onFilterChange({
          category: '',
          priceRange: { min: 0, max: 1000 },
          sort: 'newest'
        })}
        className="w-full py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-800"
      >
        Clear Filters
      </button>
    </div>
  );
};

export default ProductFilter;
