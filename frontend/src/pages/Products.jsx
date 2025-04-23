// src/pages/Products.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { fetchProducts, clearProductError } from "../redux/slices/productSlice";
import ProductCard from "../components/ProductCard";
import ProductFilter from "../components/ProductFilter";
import Loader from "../components/common/Loader";
import { debounce } from "lodash"; // You'll need to install lodash

const Products = () => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.product);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1", 10));
  const [itemsPerPage, setItemsPerPage] = useState(parseInt(searchParams.get("limit") || "12", 10));
  
  // Initialize filters from URL params
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    brand: searchParams.get("brand") || "",
    search: searchParams.get("search") || "",
    priceRange: {
      min: parseInt(searchParams.get("minPrice") || "0", 10),
      max: parseInt(searchParams.get("maxPrice") || "1000", 10),
    },
    sort: searchParams.get("sort") || "newest",
    page: currentPage,
    limit: itemsPerPage
  });

  // Debounced version of filter change handler to prevent excessive API calls
  const debouncedFetchProducts = useCallback(
    debounce((filterParams) => {
      dispatch(fetchProducts(filterParams));
    }, 500),
    [dispatch]
  );

  useEffect(() => {
    // Update URL with all current filters
    const params = new URLSearchParams();
    if (filters.category) params.set("category", filters.category);
    if (filters.brand) params.set("brand", filters.brand);
    if (filters.search) params.set("search", filters.search);
    if (filters.priceRange?.min) params.set("minPrice", filters.priceRange.min);
    if (filters.priceRange?.max) params.set("maxPrice", filters.priceRange.max);
    if (filters.sort) params.set("sort", filters.sort);
    params.set("page", currentPage.toString());
    params.set("limit", itemsPerPage.toString());
    setSearchParams(params);

    // Fetch products with current filters
    debouncedFetchProducts({
      ...filters,
      page: currentPage,
      limit: itemsPerPage
    });
  }, [filters, currentPage, itemsPerPage, debouncedFetchProducts, setSearchParams]);

  const handleFilterChange = (newFilters) => {
    // Reset to page 1 when filters change
    setCurrentPage(1);
    setFilters({ ...filters, ...newFilters });
  };

  const handleRetry = () => {
    dispatch(clearProductError());
    dispatch(fetchProducts(filters));
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePerPageChange = (e) => {
    const newLimit = parseInt(e.target.value, 10);
    setItemsPerPage(newLimit);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Safely get the products data
  const productsList = Array.isArray(products?.products) ? products.products : Array.isArray(products) ? products : [];
  const totalProducts = products?.pagination?.total || productsList.length;
  const totalPages = products?.pagination?.pages || Math.ceil(totalProducts / itemsPerPage);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">All Products</h1>

      {/* Mobile filter toggle */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-between"
        >
          <span className="font-medium">Filters</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters sidebar - responsive */}
        <div className={`${isMobileFilterOpen ? 'block' : 'hidden'} md:block w-full md:w-1/4 transition-all duration-300 ease-in-out`}>
          <ProductFilter
            currentFilters={filters}
            onFilterChange={handleFilterChange}
            onClose={() => setIsMobileFilterOpen(false)}
          />
        </div>

        {/* Products grid */}
        <div className="w-full md:w-3/4">
          {/* Products count and sorting controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <p className="text-gray-600">
              {loading ? 'Loading products...' : `${totalProducts} products found`}
            </p>
            
            <div className="flex items-center gap-4">
              <select
                className="border rounded p-2"
                value={filters.sort}
                onChange={(e) => handleFilterChange({ sort: e.target.value })}
                aria-label="Sort products"
              >
                <option value="newest">Newest</option>
                <option value="price:asc">Price: Low to High</option>
                <option value="price:desc">Price: High to Low</option>
                <option value="rating:desc">Highest Rated</option>
                <option value="popularity:desc">Most Popular</option>
              </select>
              
              <select
                className="border rounded p-2"
                value={itemsPerPage}
                onChange={handlePerPageChange}
                aria-label="Products per page"
              >
                <option value="12">12 per page</option>
                <option value="24">24 per page</option>
                <option value="48">48 per page</option>
              </select>
            </div>
          </div>

          {/* Error state with retry */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <div className="flex justify-between items-center">
                <p>{error.message || "Failed to load products"}</p>
                <button
                  onClick={handleRetry}
                  className="bg-red-700 text-white px-4 py-1 rounded hover:bg-red-800"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Loading state - skeleton loader */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(itemsPerPage)].map((_, index) => (
                <div key={`skeleton-${index}`} className="border rounded-lg p-4 h-80">
                  <div className="animate-pulse flex flex-col h-full">
                    <div className="bg-gray-200 h-40 mb-4 rounded"></div>
                    <div className="bg-gray-200 h-4 w-3/4 mb-2 rounded"></div>
                    <div className="bg-gray-200 h-4 w-1/2 mb-4 rounded"></div>
                    <div className="bg-gray-200 h-8 w-1/3 mt-auto rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Products grid */}
          {!loading && (
            <>
              {productsList.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xl text-gray-600 mb-4">No products found matching your criteria</p>
                  <button 
                    onClick={() => {
                      setFilters({
                        category: "",
                        brand: "",
                        search: "",
                        priceRange: { min: 0, max: 1000 },
                        sort: "newest"
                      });
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {productsList.map((product, index) => (
                      <ProductCard key={product._id || `product-${index}`} product={product} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                      <nav className="flex items-center gap-1" aria-label="Pagination">
                        <button
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className={`px-3 py-1 rounded ${
                            currentPage === 1 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                          }`}
                          aria-label="Previous page"
                        >
                          &laquo;
                        </button>
                        
                        {[...Array(totalPages)].map((_, index) => {
                          const pageNumber = index + 1;
                          // Show limited page numbers with ellipsis
                          if (
                            pageNumber === 1 ||
                            pageNumber === totalPages ||
                            (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                          ) {
                            return (
                              <button
                                key={`page-${pageNumber}`}
                                onClick={() => handlePageChange(pageNumber)}
                                className={`px-3 py-1 rounded ${
                                  currentPage === pageNumber
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                }`}
                                aria-label={`Page ${pageNumber}`}
                                aria-current={currentPage === pageNumber ? 'page' : undefined}
                              >
                                {pageNumber}
                              </button>
                            );
                          } else if (
                            (pageNumber === 2 && currentPage > 3) ||
                            (pageNumber === totalPages - 1 && currentPage < totalPages - 2)
                          ) {
                            return <span key={`ellipsis-${pageNumber}`} className="px-2">...</span>;
                          }
                          return null;
                        })}
                        
                        <button
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className={`px-3 py-1 rounded ${
                            currentPage === totalPages
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                          }`}
                          aria-label="Next page"
                        >
                          &raquo;
                        </button>
                      </nav>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
