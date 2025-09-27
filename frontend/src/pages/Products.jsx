import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useLocation } from 'react-router-dom';
import PageMeta from '../components/seo/PageMeta';
import { toast } from 'react-toastify';
import { debounce } from 'lodash';

// Redux actions
import { 
  fetchProducts,
  fetchCategories,
  searchProducts,
  clearProductError,
  clearSearchResults,
  setProducts
} from '../redux/slices/productSlice';

// Components
import ProductCard from '../components/ProductCard';
import ProductFilter from '../components/ProductFilter';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import SearchBar from '../components/common/SearchBar';
import SortDropdown from '../components/products/SortDropdown';
import ViewToggle from '../components/products/ViewToggle';
import ProductGrid from '../components/products/ProductGrid';
import ProductList from '../components/products/ProductList';
import Pagination from '../components/common/Pagination';
import FilterChips from '../components/products/FilterChips';

// Hooks
import useLocalStorage from '../hooks/useLocalStorage';
import useDebounce from '../hooks/useDebounce';

// Utils
import { trackEvent } from '../utils/analytics';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First', icon: 'fa-clock' },
  { value: 'price:asc', label: 'Price: Low to High', icon: 'fa-sort-amount-up' },
  { value: 'price:desc', label: 'Price: High to Low', icon: 'fa-sort-amount-down' },
  { value: 'rating:desc', label: 'Highest Rated', icon: 'fa-star' },
  { value: 'popularity:desc', label: 'Most Popular', icon: 'fa-fire' },
  { value: 'name:asc', label: 'A to Z', icon: 'fa-sort-alpha-up' },
  { value: 'name:desc', label: 'Z to A', icon: 'fa-sort-alpha-down' }
];

const ITEMS_PER_PAGE_OPTIONS = [
  { value: 12, label: '12 per page' },
  { value: 24, label: '24 per page' },
  { value: 48, label: '48 per page' },
  { value: 96, label: '96 per page' }
];

const Products = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Redux state
  const { 
    products, 
    searchResults,
    categories,
    loading, 
    searchLoading,
    error,
    pagination,
    totalProducts,
    lastSearchQuery
  } = useSelector((state) => state.product);

  // Local state
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [itemsPerPage, setItemsPerPage] = useLocalStorage('productsPerPage', parseInt(searchParams.get('limit') || '12', 10));
  const [viewMode, setViewMode] = useLocalStorage('productsViewMode', 'grid');
  const [activeFilters, setActiveFilters] = useState(new Set());
  
  // Initialize filters from URL params
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    search: searchParams.get('search') || '',
    priceRange: {
      min: parseInt(searchParams.get('minPrice') || '0', 10),
      max: parseInt(searchParams.get('maxPrice') || '1000', 10),
    },
    rating: parseInt(searchParams.get('rating') || '0', 10),
    inStock: searchParams.get('inStock') === 'true',
    onSale: searchParams.get('onSale') === 'true',
    sort: searchParams.get('sort') || 'newest',
    page: currentPage,
    limit: itemsPerPage
  });

  // Debounced search and filter functions
  const debouncedSearch = useCallback(
    debounce((query, filterParams) => {
      if (query.trim()) {
        dispatch(searchProducts({ query, filters: filterParams }));
        trackEvent('search', {
          search_term: query,
          category: filterParams.category || 'all'
        });
      } else {
        dispatch(fetchProducts(filterParams));
      }
    }, 500),
    [dispatch]
  );

  const debouncedFetchProducts = useCallback(
    debounce((filterParams) => {
      dispatch(fetchProducts(filterParams));
    }, 300),
    [dispatch]
  );

  // Memoized values
  const isSearchMode = useMemo(() => !!filters.search.trim(), [filters.search]);
  const productsList = useMemo(() => {
    if (isSearchMode) {
      return Array.isArray(searchResults) ? searchResults : [];
    }
    return Array.isArray(products) ? products : [];
  }, [isSearchMode, searchResults, products]);

  const currentLoading = useMemo(() => {
    return isSearchMode ? searchLoading : loading;
  }, [isSearchMode, searchLoading, loading]);

  const totalCount = useMemo(() => {
    return totalProducts || productsList.length;
  }, [totalProducts, productsList.length]);

  const totalPages = useMemo(() => {
    return pagination?.totalPages || Math.ceil(totalCount / itemsPerPage);
  }, [pagination, totalCount, itemsPerPage]);

  // Update active filters for filter chips
  useEffect(() => {
    const active = new Set();
    if (filters.category) active.add(`category:${filters.category}`);
    if (filters.brand) active.add(`brand:${filters.brand}`);
    if (filters.rating > 0) active.add(`rating:${filters.rating}`);
    if (filters.inStock) active.add('inStock');
    if (filters.onSale) active.add('onSale');
    if (filters.priceRange.min > 0 || filters.priceRange.max < 1000) {
      active.add(`price:${filters.priceRange.min}-${filters.priceRange.max}`);
    }
    setActiveFilters(active);
  }, [filters]);

  // Load categories on mount
  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length]);

  // Clear errors on mount
  useEffect(() => {
    dispatch(clearProductError());
    
    // Track page view
    trackEvent('page_view', {
      page_title: 'Products',
      page_location: window.location.href,
      content_category: 'product_listing'
    });
  }, [dispatch]);

  // Handle URL and data synchronization
  useEffect(() => {
    // Update URL with all current filters
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.brand) params.set('brand', filters.brand);
    if (filters.search) params.set('search', filters.search);
    if (filters.priceRange?.min > 0) params.set('minPrice', filters.priceRange.min.toString());
    if (filters.priceRange?.max < 1000) params.set('maxPrice', filters.priceRange.max.toString());
    if (filters.rating > 0) params.set('rating', filters.rating.toString());
    if (filters.inStock) params.set('inStock', 'true');
    if (filters.onSale) params.set('onSale', 'true');
    if (filters.sort !== 'newest') params.set('sort', filters.sort);
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (itemsPerPage !== 12) params.set('limit', itemsPerPage.toString());

    const newParamsString = params.toString();
    const currentParamsString = searchParams.toString();
    
    if (newParamsString !== currentParamsString) {
      setSearchParams(params, { replace: true });
    }

    // Fetch products with current filters
    const filterParams = {
      ...filters,
      page: currentPage,
      limit: itemsPerPage
    };

    if (filters.search.trim()) {
      debouncedSearch(filters.search, filterParams);
    } else {
      debouncedFetchProducts(filterParams);
    }
  }, [filters, currentPage, itemsPerPage, debouncedSearch, debouncedFetchProducts, setSearchParams, searchParams]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters) => {
    // Reset to page 1 when filters change
    setCurrentPage(1);
    setFilters(prev => ({ ...prev, ...newFilters }));

    // Track filter usage
    trackEvent('filter_applied', {
      filter_type: Object.keys(newFilters)[0],
      filter_value: Object.values(newFilters)[0]
    });
  }, []);

  // Handle search
  const handleSearch = useCallback((searchTerm) => {
    setCurrentPage(1);
    setFilters(prev => ({ ...prev, search: searchTerm }));
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((sortValue) => {
    handleFilterChange({ sort: sortValue });
    
    trackEvent('sort_applied', {
      sort_option: sortValue
    });
  }, [handleFilterChange]);

  // Handle pagination
  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    trackEvent('pagination_click', {
      page_number: newPage,
      total_pages: totalPages
    });
  }, [totalPages]);

  // Handle items per page change
  const handlePerPageChange = useCallback((newLimit) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
    
    trackEvent('items_per_page_changed', {
      items_per_page: newLimit
    });
  }, [setItemsPerPage]);

  // Handle view mode change
  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
    
    trackEvent('view_mode_changed', {
      view_mode: mode
    });
  }, [setViewMode]);

  // Handle retry
  const handleRetry = useCallback(() => {
    dispatch(clearProductError());
    const filterParams = { ...filters, page: currentPage, limit: itemsPerPage };
    
    if (filters.search.trim()) {
      dispatch(searchProducts({ query: filters.search, filters: filterParams }));
    } else {
      dispatch(fetchProducts(filterParams));
    }
    
    trackEvent('retry_clicked', {
      error_type: 'products_fetch_failed'
    });
  }, [dispatch, filters, currentPage, itemsPerPage]);

  // Handle clear all filters
  const handleClearAllFilters = useCallback(() => {
    const clearedFilters = {
      category: '',
      brand: '',
      search: '',
      priceRange: { min: 0, max: 1000 },
      rating: 0,
      inStock: false,
      onSale: false,
      sort: 'newest'
    };
    
    setFilters(clearedFilters);
    setCurrentPage(1);
    dispatch(clearSearchResults());
    
    trackEvent('filters_cleared', {
      previous_filter_count: activeFilters.size
    });
  }, [dispatch, activeFilters.size]);

  // Handle individual filter removal
  const handleRemoveFilter = useCallback((filterKey) => {
    const [type, value] = filterKey.split(':');
    
    switch (type) {
      case 'category':
        handleFilterChange({ category: '' });
        break;
      case 'brand':
        handleFilterChange({ brand: '' });
        break;
      case 'rating':
        handleFilterChange({ rating: 0 });
        break;
      case 'inStock':
        handleFilterChange({ inStock: false });
        break;
      case 'onSale':
        handleFilterChange({ onSale: false });
        break;
      case 'price':
        handleFilterChange({ priceRange: { min: 0, max: 1000 } });
        break;
      default:
        break;
    }
    
    trackEvent('filter_removed', {
      filter_type: type,
      filter_value: value
    });
  }, [handleFilterChange]);

  // SEO meta data
  const seoTitle = useMemo(() => {
    if (filters.search) {
      return `Search Results for "${filters.search}" | ShoeMarkNet`;
    }
    if (filters.category) {
      return `${filters.category} Shoes | ShoeMarkNet`;
    }
    return 'Premium Shoes Collection | ShoeMarkNet';
  }, [filters.search, filters.category]);

  const seoDescription = useMemo(() => {
    if (filters.search) {
      return `Find the best shoes matching "${filters.search}". Browse our premium collection with fast shipping and great prices.`;
    }
    if (filters.category) {
      return `Shop premium ${filters.category.toLowerCase()} shoes. Discover the latest styles with fast shipping and competitive prices.`;
    }
    return 'Browse our premium shoe collection. Find the perfect footwear with advanced filters, competitive prices, and fast shipping.';
  }, [filters.search, filters.category]);

  return (
    <>
      {/* SEO Meta Tags */}
      <PageMeta
        title={seoTitle}
        description={seoDescription}
        robots="index, follow"
        canonical={`https://shoemarknet.com/products${location.search}`}
        openGraph={{
          title: seoTitle,
          description: seoDescription,
          type: 'website',
          url: `https://shoemarknet.com/products${location.search}`,
        }}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: seoTitle,
          description: seoDescription,
          url: `https://shoemarknet.com/products${location.search}`,
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: totalCount,
            itemListElement: productsList.slice(0, 10).map((product, index) => ({
              '@type': 'Product',
              position: index + 1,
              name: product.name,
              description: product.description,
              image: product.images?.[0],
              offers: {
                '@type': 'Offer',
                price: product.price,
                priceCurrency: 'USD',
                availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
              },
            })),
          },
        }}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {filters.search ? (
                    <>Search Results for "<span className="text-blue-600">{filters.search}</span>"</>
                  ) : filters.category ? (
                    `${filters.category} Collection`
                  ) : (
                    'All Products'
                  )}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {currentLoading ? 'Loading products...' : `${totalCount.toLocaleString()} products found`}
                </p>
              </div>
              
              {/* Search Bar */}
              <div className="lg:w-96">
                <SearchBar
                  value={filters.search}
                  onChange={handleSearch}
                  placeholder="Search products..."
                  className="w-full"
                />
              </div>
            </div>

            {/* Filter Chips */}
            {activeFilters.size > 0 && (
              <FilterChips
                filters={activeFilters}
                onRemove={handleRemoveFilter}
                onClearAll={handleClearAllFilters}
                className="mb-6"
              />
            )}
          </div>

          {/* Mobile filter toggle */}
          <div className="lg:hidden mb-6">
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="w-full py-3 px-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-between shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <span className="font-medium text-gray-900 dark:text-white flex items-center">
                <i className="fas fa-filter mr-2"></i>
                Filters
                {activeFilters.size > 0 && (
                  <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    {activeFilters.size}
                  </span>
                )}
              </span>
              <i className={`fas fa-chevron-${isMobileFilterOpen ? 'up' : 'down'} text-gray-400`}></i>
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Filters Sidebar */}
            <div className={`${isMobileFilterOpen ? 'block' : 'hidden'} lg:block w-full lg:w-80 transition-all duration-300 ease-in-out`}>
              <div className="sticky top-4">
                <ProductFilter
                  currentFilters={filters}
                  onFilterChange={handleFilterChange}
                  onClose={() => setIsMobileFilterOpen(false)}
                  categories={categories}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                />
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              
              {/* Controls Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <SortDropdown
                    value={filters.sort}
                    options={SORT_OPTIONS}
                    onChange={handleSortChange}
                  />
                  
                  <select
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    value={itemsPerPage}
                    onChange={(e) => handlePerPageChange(parseInt(e.target.value, 10))}
                    aria-label="Products per page"
                  >
                    {ITEMS_PER_PAGE_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <ViewToggle
                  value={viewMode}
                  onChange={handleViewModeChange}
                />
              </div>

              {/* Error State */}
              {error && (
                <ErrorMessage
                  message={error.message || 'Failed to load products'}
                  onRetry={handleRetry}
                  className="mb-6"
                />
              )}

              {/* Loading State */}
              {currentLoading && (
                <div className="space-y-6">
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {[...Array(itemsPerPage)].map((_, index) => (
                        <div key={`skeleton-${index}`} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-80">
                          <div className="animate-pulse flex flex-col h-full">
                            <div className="bg-gray-200 dark:bg-gray-600 h-40 mb-4 rounded-lg"></div>
                            <div className="bg-gray-200 dark:bg-gray-600 h-4 w-3/4 mb-2 rounded"></div>
                            <div className="bg-gray-200 dark:bg-gray-600 h-4 w-1/2 mb-4 rounded"></div>
                            <div className="bg-gray-200 dark:bg-gray-600 h-8 w-1/3 mt-auto rounded"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {[...Array(itemsPerPage)].map((_, index) => (
                        <div key={`skeleton-list-${index}`} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                          <div className="animate-pulse flex gap-4">
                            <div className="bg-gray-200 dark:bg-gray-600 h-24 w-24 rounded-lg flex-shrink-0"></div>
                            <div className="flex-1">
                              <div className="bg-gray-200 dark:bg-gray-600 h-4 w-3/4 mb-2 rounded"></div>
                              <div className="bg-gray-200 dark:bg-gray-600 h-4 w-1/2 mb-2 rounded"></div>
                              <div className="bg-gray-200 dark:bg-gray-600 h-6 w-1/4 rounded"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Products Display */}
              {!currentLoading && (
                <>
                  {productsList.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                      <div className="max-w-md mx-auto">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <i className="fas fa-search text-3xl text-gray-400"></i>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          No products found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          {filters.search 
                            ? `No products match your search for "${filters.search}"`
                            : 'No products match your current filters'
                          }
                        </p>
                        <div className="space-y-3">
                          <button 
                            onClick={handleClearAllFilters}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                          >
                            <i className="fas fa-times mr-2"></i>
                            Clear All Filters
                          </button>
                          {filters.search && (
                            <button 
                              onClick={() => handleSearch('')}
                              className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                            >
                              <i className="fas fa-search mr-2"></i>
                              Clear Search
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Products Grid/List */}
                      {viewMode === 'grid' ? (
                        <ProductGrid
                          products={productsList}
                          onAddToCart={(product) => console.log('Add to cart:', product)}
                          onToggleWishlist={(product) => console.log('Toggle wishlist:', product)}
                        />
                      ) : (
                        <ProductList
                          products={productsList}
                          onAddToCart={(product) => console.log('Add to cart:', product)}
                          onToggleWishlist={(product) => console.log('Toggle wishlist:', product)}
                        />
                      )}

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="mt-8">
                          <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            showInfo={true}
                            totalItems={totalCount}
                            itemsPerPage={itemsPerPage}
                          />
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Products;
