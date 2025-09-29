import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useLocation, Link } from 'react-router-dom';
import PageMeta from '../components/seo/PageMeta';
import { debounce } from 'lodash';

// Redux actions
import { 
  fetchProducts,
  fetchCategories,
  searchProducts,
  clearProductError,
  clearSearchResults
} from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { toggleWishlistItem } from '../redux/slices/wishlistSlice';

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

// Utils
import { trackEvent } from '../utils/analytics';

const DEFAULT_PRICE_RANGE = { min: 0, max: 1000 };

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
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);

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
    gender: searchParams.get('gender') || '',
    search: searchParams.get('search') || '',
    priceRange: {
      min: parseInt(searchParams.get('minPrice') || String(DEFAULT_PRICE_RANGE.min), 10),
      max: parseInt(searchParams.get('maxPrice') || String(DEFAULT_PRICE_RANGE.max), 10),
    },
    rating: parseInt(searchParams.get('rating') || '0', 10),
    inStock: searchParams.get('inStock') === 'true',
    onSale: searchParams.get('onSale') === 'true' || isSalePage,
    sort: searchParams.get('sort') || 'newest',
    page: currentPage,
    limit: itemsPerPage
  }));

  const wishlistProductIds = useMemo(() => (
    wishlistItems
      .map((item) => {
        if (item.product?._id) return item.product._id;
        if (item.product?.id) return item.product.id;
        if (item._id) return item._id;
        if (item.id) return item.id;
        return null;
      })
      .filter(Boolean)
  ), [wishlistItems]);

  // Debounced search and filter functions
  const buildFilterParams = useCallback((baseFilters, overrides = {}) => {
    const merged = { ...baseFilters, ...overrides };
    const { priceRange, ...rest } = merged;

    if (priceRange) {
      const min = Number(priceRange.min);
      const max = Number(priceRange.max);

      if (Number.isFinite(min) && min > DEFAULT_PRICE_RANGE.min) {
        rest.minPrice = min;
      } else {
        delete rest.minPrice;
      }

      if (Number.isFinite(max) && max < DEFAULT_PRICE_RANGE.max) {
        rest.maxPrice = max;
      } else {
        delete rest.maxPrice;
      }
    }

    if (!rest.search || !rest.search.trim()) {
      delete rest.search;
    }

    return rest;
  }, []);

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

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.();
      debouncedFetchProducts.cancel?.();
    };
  }, [debouncedSearch, debouncedFetchProducts]);

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
  if (filters.gender) active.add(`gender:${filters.gender}`);
    if (filters.rating > 0) active.add(`rating:${filters.rating}`);
    if (filters.inStock) active.add('inStock');
    if (filters.onSale) active.add('onSale');
    if (filters.priceRange?.min > DEFAULT_PRICE_RANGE.min || filters.priceRange.max < DEFAULT_PRICE_RANGE.max) {
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
  if (filters.gender) params.set('gender', filters.gender);
    if (filters.search) params.set('search', filters.search);
  if (filters.priceRange?.min > DEFAULT_PRICE_RANGE.min) params.set('minPrice', filters.priceRange.min.toString());
  if (filters.priceRange?.max < DEFAULT_PRICE_RANGE.max) params.set('maxPrice', filters.priceRange.max.toString());
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
    const filterParams = buildFilterParams(filters, {
      onSale: isSalePage ? true : filters.onSale,
      page: currentPage,
      limit: itemsPerPage
    });

    if (filters.search.trim()) {
      debouncedSearch(filters.search, filterParams);
    } else {
      debouncedFetchProducts(filterParams);
    }
  }, [filters, currentPage, itemsPerPage, debouncedSearch, debouncedFetchProducts, setSearchParams, searchParams, isSalePage, buildFilterParams]);

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

  const handleAddProductToCart = useCallback((product) => {
    const productId = product?._id || product?.id;
    if (!productId) return;

    dispatch(addToCart({
      productId,
      quantity: 1,
      product
    }));

    trackEvent('add_to_cart', {
      product_id: productId,
      product_name: product?.name,
      price: product?.price
    });
  }, [dispatch]);

  const handleToggleProductWishlist = useCallback((product) => {
    const productId = product?._id || product?.id;
    if (!productId) return;

    const isCurrentlySaved = wishlistProductIds.includes(productId);

    dispatch(toggleWishlistItem({
      productId,
      product
    }));

    trackEvent(isCurrentlySaved ? 'wishlist_removed' : 'wishlist_added', {
      product_id: productId,
      product_name: product?.name
    });
  }, [dispatch, wishlistProductIds]);

  // Handle retry
  const handleRetry = useCallback(() => {
    dispatch(clearProductError());
    const filterParams = buildFilterParams(filters, { page: currentPage, limit: itemsPerPage });
    
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
      gender: '',
      search: '',
      priceRange: { ...DEFAULT_PRICE_RANGE },
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
      case 'gender':
        handleFilterChange({ gender: '' });
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
        handleFilterChange({ priceRange: { ...DEFAULT_PRICE_RANGE } });
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

  const headerBreadcrumbs = useMemo(() => (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400"
    >
      <Link
        to="/"
        className="transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400"
      >
        Home
      </Link>
      <span className="opacity-60">/</span>
      {isSalePage ? (
        <>
          <Link
            to="/products"
            className="transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400"
          >
            Products
          </Link>
          <span className="opacity-60">/</span>
          <span className="text-gray-900 dark:text-gray-200">Sale</span>
        </>
      ) : (
        <span className="text-gray-900 dark:text-gray-200">Products</span>
      )}
    </nav>
  ), [isSalePage]);

  

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
        breadcrumbs={headerBreadcrumbs}
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

          <div className="relative">
            {isMobileFilterOpen && (
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="fixed inset-0 z-30 bg-slate-900/55 backdrop-blur-sm lg:hidden"
                aria-label="Close filters"
              />
            )}

            <div className="space-y-6">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                <aside
                  className={`transition-all duration-200 ease-out lg:relative lg:top-auto lg:block lg:h-auto lg:w-[250px] xl:w-[280px] ${
                    isMobileFilterOpen
                      ? 'fixed inset-y-0 left-0 z-40 h-full w-4/5 max-w-sm translate-x-0 lg:static'
                      : 'pointer-events-none fixed inset-y-0 left-0 z-40 h-full w-4/5 max-w-sm -translate-x-full lg:pointer-events-auto lg:static lg:translate-x-0'
                  }`}
                >
                  <div className="flex h-full flex-col overflow-y-auto bg-white/95 p-4 shadow-2xl dark:bg-slate-900/95 lg:h-auto lg:overflow-visible lg:bg-transparent lg:p-0 lg:shadow-none">
                    <div className="mb-4 flex items-center justify-between lg:hidden">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.4em] text-gray-600">
                        Filters
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsMobileFilterOpen(false)}
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-gray-600"
                        aria-label="Close filters"
                      >
                        Close
                      </button>
                    </div>
                    <div className="space-y-4 lg:sticky lg:top-24 xl:top-28">
                      <ProductFilter
                        currentFilters={filters}
                        onFilterChange={handleFilterChange}
                        onClose={() => setIsMobileFilterOpen(false)}
                      />
                    </div>
                  </div>
                </aside>

                <section className="min-w-0 flex-1 space-y-5">
                  <GlassPanel padding="p-4" className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <SortDropdown
                        value={filters.sort}
                        options={SORT_OPTIONS}
                        onChange={handleSortChange}
                      />

                      <select
                        className="rounded-2xl border border-white/40 bg-white/70 px-3 py-1.5 text-sm font-medium text-gray-900 shadow-sm transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-white"
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
                    <GlassPanel padding="p-5" className="space-y-5">
                      {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                          {[...Array(itemsPerPage)].map((_, index) => (
                            <div
                              key={`skeleton-${index}`}
                              className="h-72 rounded-2xl border border-white/30 bg-white/40 p-4 dark:border-slate-800/60 dark:bg-slate-900/60"
                            >
                              <div className="flex h-full flex-col space-y-4 animate-pulse">
                                <div className="h-36 rounded-xl bg-white/60 dark:bg-slate-800/60"></div>
                                <div className="h-4 w-3/4 rounded-full bg-white/60 dark:bg-slate-800/60"></div>
                                <div className="h-4 w-1/2 rounded-full bg-white/60 dark:bg-slate-800/60"></div>
                                <div className="mt-auto h-7 w-1/3 rounded-full bg-white/60 dark:bg-slate-800/60"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-3.5">
                          {[...Array(itemsPerPage)].map((_, index) => (
                            <div
                              key={`skeleton-list-${index}`}
                              className="rounded-2xl border border-white/30 bg-white/40 p-4 dark:border-slate-800/60 dark:bg-slate-900/60"
                            >
                              <div className="flex gap-4 animate-pulse">
                                <div className="h-20 w-20 flex-shrink-0 rounded-xl bg-white/60 dark:bg-slate-800/60"></div>
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
                          <GlassPanel padding="p-4 md:p-5" className="space-y-5">
                            {viewMode === 'grid' ? (
                              <ProductGrid
                                products={productsList}
                                onAddToCart={handleAddProductToCart}
                                onToggleWishlist={handleToggleProductWishlist}
                              />
                            ) : (
                              <ProductList
                                products={productsList}
                                onAddToCart={handleAddProductToCart}
                                onToggleWishlist={handleToggleProductWishlist}
                                wishlistProductIds={wishlistProductIds}
                              />
                            )}
                          </GlassPanel>

                          {totalPages > 1 && (
                            <GlassPanel padding="p-3.5" className="flex justify-center">
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
                </section>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    </>
  );
};

export default Products;
