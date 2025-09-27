import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useLocation } from 'react-router-dom';
import PageMeta from '../components/seo/PageMeta';
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
import ProductFilter from '../components/ProductFilter';
import ErrorMessage from '../components/common/ErrorMessage';
import SearchBar from '../components/common/SearchBar';
import SortDropdown from '../components/products/SortDropdown';
import ViewToggle from '../components/products/ViewToggle';
import ProductGrid from '../components/products/ProductGrid';
import ProductList from '../components/products/ProductList';
import Pagination from '../components/common/Pagination';
import FilterChips from '../components/products/FilterChips';
import PageLayout from '../components/common/PageLayout';
import GlassPanel from '../components/common/GlassPanel';

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
  const isSalePage = location.pathname === '/sale';
  
  // Redux state
  const {
    products,
    searchResults,
    loading,
    searchLoading,
    error,
    pagination,
    totalProducts
  } = useSelector((state) => state.product);
  const categories = useSelector((state) => state.product.categories || []);

  // Local state
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [itemsPerPage, setItemsPerPage] = useLocalStorage('productsPerPage', parseInt(searchParams.get('limit') || '12', 10));
  const [viewMode, setViewMode] = useLocalStorage('productsViewMode', 'grid');
  const [activeFilters, setActiveFilters] = useState(new Set());
  
  // Initialize filters from URL params
  const [filters, setFilters] = useState(() => ({
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    search: searchParams.get('search') || '',
    priceRange: {
      min: parseInt(searchParams.get('minPrice') || '0', 10),
      max: parseInt(searchParams.get('maxPrice') || '1000', 10),
    },
    rating: parseInt(searchParams.get('rating') || '0', 10),
    inStock: searchParams.get('inStock') === 'true',
    onSale: searchParams.get('onSale') === 'true' || isSalePage,
    sort: searchParams.get('sort') || 'newest',
    page: currentPage,
    limit: itemsPerPage
  }));

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
      page_title: isSalePage ? 'Sale' : 'Products',
      page_location: window.location.href,
      content_category: 'product_listing'
    });
  }, [dispatch, isSalePage]);

  useEffect(() => {
    if (isSalePage && !filters.onSale) {
      setFilters(prev => ({ ...prev, onSale: true }));
    }
  }, [isSalePage, filters.onSale]);

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
      onSale: isSalePage ? true : filters.onSale,
      page: currentPage,
      limit: itemsPerPage
    };

    if (filters.search.trim()) {
      debouncedSearch(filters.search, filterParams);
    } else {
      debouncedFetchProducts(filterParams);
    }
  }, [filters, currentPage, itemsPerPage, debouncedSearch, debouncedFetchProducts, setSearchParams, searchParams, isSalePage]);

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
      onSale: isSalePage,
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
    if (isSalePage || filters.onSale) {
      return 'Sale Shoes & Exclusive Deals | ShoeMarkNet';
    }
    return 'Premium Shoes Collection | ShoeMarkNet';
  }, [filters.search, filters.category, filters.onSale, isSalePage]);

  const seoDescription = useMemo(() => {
    if (filters.search) {
      return `Find the best shoes matching "${filters.search}". Browse our premium collection with fast shipping and great prices.`;
    }
    if (filters.category) {
      return `Shop premium ${filters.category.toLowerCase()} shoes. Discover the latest styles with fast shipping and competitive prices.`;
    }
    if (isSalePage || filters.onSale) {
      return 'Shop limited-time footwear deals with deep discounts on top brands. Grab exclusive offers before they are gone!';
    }
    return 'Browse our premium shoe collection. Find the perfect footwear with advanced filters, competitive prices, and fast shipping.';
  }, [filters.search, filters.category, filters.onSale, isSalePage]);

  const canonicalPath = useMemo(() => (isSalePage ? '/sale' : '/products'), [isSalePage]);
  const canonicalSearch = useMemo(() => {
    if (!location.search) return '';
    const params = new URLSearchParams(location.search);
    if (isSalePage) {
      params.delete('onSale');
    }
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  }, [location.search, isSalePage]);

  const headerTitle = useMemo(() => {
    if (filters.search) {
      return (
        <>
          Search results for{' '}
          <span className="text-blue-600 dark:text-blue-300">"{filters.search}"</span>
        </>
      );
    }

    if (filters.category) {
      return `${filters.category} Collection`;
    }

    if (isSalePage || filters.onSale) {
      return 'Exclusive Sale Picks';
    }

    return 'All Products';
  }, [filters.search, filters.category, filters.onSale, isSalePage]);

  const headerSubtitle = useMemo(() => {
    if (currentLoading) {
      return 'Fetching the latest picks for you…';
    }

    const count = Number.isFinite(totalCount) ? totalCount : 0;

    if (count === 0) {
      return 'No products match your filters yet—try adjusting the filters below to discover more styles.';
    }

    return `${count.toLocaleString()} products curated for your style`;
  }, [currentLoading, totalCount]);

  const headerActions = useMemo(() => (
    <div className="w-full md:w-80 lg:w-96">
      <SearchBar
        value={filters.search}
        onChange={handleSearch}
        placeholder="Search products..."
        className="w-full"
      />
    </div>
  ), [filters.search, handleSearch]);

  return (
    <>
      {/* SEO Meta Tags */}
      <PageMeta
        title={seoTitle}
        description={seoDescription}
        robots="index, follow"
        canonical={`https://shoemarknet.com${canonicalPath}${canonicalSearch}`}
        openGraph={{
          title: seoTitle,
          description: seoDescription,
          type: 'website',
          url: `https://shoemarknet.com${canonicalPath}${canonicalSearch}`,
        }}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: seoTitle,
          description: seoDescription,
          url: `https://shoemarknet.com${canonicalPath}${canonicalSearch}`,
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

      <PageLayout
        title={headerTitle}
        description={headerSubtitle}
        actions={headerActions}
      >
        <div className="space-y-6">
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="flex w-full items-center justify-between rounded-2xl border border-white/40 bg-white/70 px-4 py-3 font-semibold text-gray-900 shadow-sm transition-colors duration-200 hover:bg-white/90 dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-white dark:hover:bg-slate-900"
            >
              <span className="flex items-center gap-2">
                <i className="fas fa-sliders-h text-blue-500"></i>
                Filters
                {activeFilters.size > 0 && (
                  <span className="ml-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                    {activeFilters.size}
                  </span>
                )}
              </span>
              <i className={`fas fa-chevron-${isMobileFilterOpen ? 'up' : 'down'} text-sm opacity-60`}></i>
            </button>
          </div>

          {activeFilters.size > 0 && (
            <GlassPanel padding="p-4" className="shadow-[0_25px_45px_-24px_rgba(15,23,42,0.45)]">
              <FilterChips
                filters={activeFilters}
                onRemove={handleRemoveFilter}
                onClearAll={handleClearAllFilters}
                className="mb-0"
              />
            </GlassPanel>
          )}

          <div className="flex flex-col gap-8 lg:flex-row">
            <div className={`${isMobileFilterOpen ? 'block' : 'hidden'} lg:block w-full transition-all duration-300 lg:w-80`}>
              <div className="space-y-6 lg:sticky lg:top-6">
                <ProductFilter
                  currentFilters={filters}
                  onFilterChange={handleFilterChange}
                  onClose={() => setIsMobileFilterOpen(false)}
                />
              </div>
            </div>

            <div className="flex-1 min-w-0 space-y-6">
              <GlassPanel padding="p-4" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <SortDropdown
                    value={filters.sort}
                    options={SORT_OPTIONS}
                    onChange={handleSortChange}
                  />

                  <select
                    className="rounded-2xl border border-white/40 bg-white/70 px-3 py-2 text-sm font-medium text-gray-900 shadow-sm transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-white"
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
              </GlassPanel>

              {error && (
                <GlassPanel padding="p-0">
                  <ErrorMessage
                    message={error.message || 'Failed to load products'}
                    onRetry={handleRetry}
                    className="mb-0"
                  />
                </GlassPanel>
              )}

              {currentLoading ? (
                <GlassPanel padding="p-6" className="space-y-6">
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {[...Array(itemsPerPage)].map((_, index) => (
                        <div
                          key={`skeleton-${index}`}
                          className="h-80 rounded-2xl border border-white/30 bg-white/40 p-4 dark:border-slate-800/60 dark:bg-slate-900/60"
                        >
                          <div className="flex h-full flex-col space-y-4 animate-pulse">
                            <div className="h-40 rounded-xl bg-white/60 dark:bg-slate-800/60"></div>
                            <div className="h-4 w-3/4 rounded-full bg-white/60 dark:bg-slate-800/60"></div>
                            <div className="h-4 w-1/2 rounded-full bg-white/60 dark:bg-slate-800/60"></div>
                            <div className="mt-auto h-8 w-1/3 rounded-full bg-white/60 dark:bg-slate-800/60"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {[...Array(itemsPerPage)].map((_, index) => (
                        <div
                          key={`skeleton-list-${index}`}
                          className="rounded-2xl border border-white/30 bg-white/40 p-4 dark:border-slate-800/60 dark:bg-slate-900/60"
                        >
                          <div className="flex gap-4 animate-pulse">
                            <div className="h-24 w-24 flex-shrink-0 rounded-xl bg-white/60 dark:bg-slate-800/60"></div>
                            <div className="flex flex-1 flex-col gap-3">
                              <div className="h-4 w-3/4 rounded-full bg-white/60 dark:bg-slate-800/60"></div>
                              <div className="h-4 w-1/2 rounded-full bg-white/60 dark:bg-slate-800/60"></div>
                              <div className="h-6 w-1/4 rounded-full bg-white/60 dark:bg-slate-800/60"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </GlassPanel>
              ) : (
                <>
                  {productsList.length === 0 ? (
                    <GlassPanel padding="p-12" className="text-center">
                      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white/40 text-blue-500 dark:bg-slate-800/60">
                        <i className="fas fa-search text-3xl"></i>
                      </div>
                      <h3 className="mb-3 text-2xl font-semibold text-gray-900 dark:text-white">
                        No products found
                      </h3>
                      <p className="mb-6 text-gray-600 dark:text-gray-400">
                        {filters.search
                          ? `No products match your search for "${filters.search}"`
                          : 'No products match your current filters'}
                      </p>
                      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <button
                          onClick={handleClearAllFilters}
                          className="rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-6 py-3 font-semibold text-white shadow-lg transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-2xl"
                        >
                          <i className="fas fa-times mr-2"></i>
                          Clear All Filters
                        </button>
                        {filters.search && (
                          <button
                            onClick={() => handleSearch('')}
                            className="rounded-2xl border border-white/40 bg-white/60 px-6 py-3 font-semibold text-gray-900 transition-colors duration-200 hover:bg-white/80 dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-white dark:hover:bg-slate-900"
                          >
                            <i className="fas fa-search mr-2"></i>
                            Clear Search
                          </button>
                        )}
                      </div>
                    </GlassPanel>
                  ) : (
                    <>
                      <GlassPanel padding="p-6" className="space-y-6">
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
                      </GlassPanel>

                      {totalPages > 1 && (
                        <GlassPanel padding="p-4" className="flex justify-center">
                          <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            showInfo={true}
                            totalItems={totalCount}
                            itemsPerPage={itemsPerPage}
                          />
                        </GlassPanel>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </PageLayout>
    </>
  );
};

export default Products;
