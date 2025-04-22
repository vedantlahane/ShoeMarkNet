// src/pages/Products.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { fetchProducts } from "../redux/slices/productSlice";
import ProductCard from "../components/ProductCard";
import ProductFilter from "../components/ProductFilter";
import Loader from "../components/common/Loader";

const Products = () => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.product);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    priceRange: {
      min: searchParams.get("minPrice") || 0,
      max: searchParams.get("maxPrice") || 1000,
    },
    sort: searchParams.get("sort") || "newest",
  });

  useEffect(() => {
    dispatch(fetchProducts(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });

    // Update URL params
    const params = new URLSearchParams();
    if (newFilters.category) params.set("category", newFilters.category);
    if (newFilters.priceRange?.min)
      params.set("minPrice", newFilters.priceRange.min);
    if (newFilters.priceRange?.max)
      params.set("maxPrice", newFilters.priceRange.max);
    if (newFilters.sort) params.set("sort", newFilters.sort);
    setSearchParams(params);
  };

  // Safely get the products array
  const productsList = Array.isArray(products) ? products : [];
  const productsCount = productsList.length;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">All Products</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters sidebar */}
        <div className="w-full md:w-1/4">
          <ProductFilter
            currentFilters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Products grid */}
        <div className="w-full md:w-3/4">
          {loading ? (
            <Loader />
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error.message || "Failed to load products"}
            </div>
          ) : (
            <>
              {/* Products count and sorting */}
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600">{productsCount} products found</p>
                <select
                  className="border rounded p-2"
                  value={filters.sort}
                  onChange={(e) => handleFilterChange({ sort: e.target.value })}
                >
                  <option value="newest">Newest</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>

              {/* Products grid */}
              {productsCount === 0 ? (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-600">
                    No products found matching your criteria
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {productsList.map((product) => (
                    <ProductCard key={product._id || index} product={product} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
