import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import PageMeta from '../components/seo/PageMeta';
import { toast } from 'react-toastify';

// Redux actions
import { 
  searchProducts, 
  clearSearch, 
  updateSearchFilters,
  saveSearchQuery,
  addToRecentSearches
} from '../redux/slices/searchSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { toggleWishlistItem as toggleWishlist } from '../redux/slices/wishlistSlice';

// Components
import LoadingSpinner from '../components/common/feedback/LoadingSpinner';
import SearchFilters from '../components/search/SearchFilters';
import SearchSuggestions from '../components/search/SearchSuggestions';
import RecentSearches from '../components/search/RecentSearches';
import SearchResults from '../components/search/SearchResults';
import NoResults from '../components/search/NoResults';
import Pagination from '../components/common/navigation/Pagination';
import PageLayout from '../components/common/layout/PageLayout';

// Hooks
import useLocalStorage from '../hooks/useLocalStorage';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';

// Utils
import { trackEvent } from '../utils/analytics';
import { validateSearchQuery } from '../utils/validation';

// Constants
const SEARCH_FILTERS = {
  price: [
    { label: 'Under $50', value: '0-50' },
    { label: '$50 - $100', value: '50-100' },
    { label: '$100 - $200', value: '100-200' },
    { label: '$200 - $500', value: '200-500' },
    { label: 'Over $500', value: '500-999999' }
  ],
  brand: [
    { label: 'Nike', value: 'nike' },
    { label: 'Adidas', value: 'adidas' },
    { label: 'Jordan', value: 'jordan' },
    { label: 'Puma', value: 'puma' },
    { label: 'New Balance', value: 'new-balance' },
    { label: 'Converse', value: 'converse' }
  ],
  size: [
    { label: 'US 6', value: '6' },
    { label: 'US 7', value: '7' },
    { label: 'US 8', value: '8' },
    { label: 'US 9', value: '9' },
    { label: 'US 10', value: '10' },
    { label: 'US 11', value: '11' },
    { label: 'US 12', value: '12' }
  ],
  category: [
    { label: 'Running', value: 'running' },
    { label: 'Basketball', value: 'basketball' },
    { label: 'Casual', value: 'casual' },
    { label: 'Athletic', value: 'athletic' },
    { label: 'Formal', value: 'formal' }
  ],
  rating: [
    { label: '4+ Stars', value: '4' },
    { label: '3+ Stars', value: '3' },
    { label: '2+ Stars', value: '2' },
    { label: '1+ Stars', value: '1' }
  ]
};

const SORT_OPTIONS = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Best Rating', value: 'rating' },
  { label: 'Most Popular', value: 'popular' },
  { label: 'Best Sellers', value: 'bestseller' }
];
const SORT_QUERY_MAP = {
  'relevance': '',
  'price-asc': 'price:asc',
  'price-desc': 'price:desc',
  'newest': 'createdAt:desc',
  'rating': 'rating:desc',
  'popular': 'numReviews:desc',
  'bestseller': 'rating:desc'
};

const PRICE_RANGE_MAX_OPEN = 999999;

const buildSearchQueryParams = (filters = {}, { page, limit, sort } = {}) => {
  const params = {};

  // Price range handling (supports checkbox selections expressed as "min-max")
  const priceRanges = Array.isArray(filters.price) ? filters.price : [];
  if (priceRanges.length > 0) {
    let minPrice;
    let maxPrice = -Infinity;

    priceRanges.forEach((range) => {
      if (typeof range !== 'string') return;
      const [minStr, maxStr] = range.split('-');
      const parsedMin = Number(minStr);
      const parsedMaxRaw = Number(maxStr);

      if (!Number.isNaN(parsedMin)) {
        minPrice = minPrice === undefined ? parsedMin : Math.min(minPrice, parsedMin);
      }

      if (!Number.isNaN(parsedMaxRaw)) {
        if (parsedMaxRaw >= PRICE_RANGE_MAX_OPEN) {
          maxPrice = Infinity;
        } else {
          maxPrice = Math.max(maxPrice, parsedMaxRaw);
        }
      }
    });

    if (Number.isFinite(minPrice)) {
      params.minPrice = minPrice;
    }

    if (maxPrice !== -Infinity && Number.isFinite(maxPrice)) {
      params.maxPrice = maxPrice;
    }
  }

  // Copy the rest of the filters, serialising arrays as comma-separated strings
  Object.entries(filters).forEach(([key, value]) => {
    if (!value || key === 'price') return;

    if (Array.isArray(value)) {
      if (value.length > 0) {
        params[key] = value.join(',');
      }
    } else {
      params[key] = value;
    }
  });

  if (Number.isFinite(page) && page > 0) {
    params.page = page;
  }

  if (Number.isFinite(limit) && limit > 0) {
    params.limit = limit;
  }

  const sortParam = SORT_QUERY_MAP[sort];
  if (sortParam) {
    params.sort = sortParam;
  }

  return params;
};

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  // Redux state
  const { 
    results, 
    loading, 
    error, 
    suggestions, 
    recentSearches,
    filters,
    pagination,
    totalResults
  } = useSelector(state => state.search);
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { items: cartItems } = useSelector(state => state.cart);
  const { items: wishlistItems } = useSelector(state => state.wishlist);

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useLocalStorage('searchFilters', {});
  const [sortBy, setSortBy] = useLocalStorage('searchSort', 'relevance');
  const [viewMode, setViewMode] = useLocalStorage('searchViewMode', 'grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [animateResults, setAnimateResults] = useState(false);

  // Refs
  const searchInputRef = useRef(null);
  const resultsRef = useRef(null);

  // Get initial search query from URL
  useEffect(() => {
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page')) || 1;
    const sort = searchParams.get('sort') || 'relevance';
    
    setSearchQuery(query);
    setCurrentPage(page);
    setSortBy(sort);
    
    if (query) {
      performSearch(query, page, sort);
    }
  }, []);

  // Enhanced keyboard shortcuts
  useKeyboardShortcuts({
    'ctrl+k': () => searchInputRef.current?.focus(),
    'ctrl+f': () => searchInputRef.current?.focus(),
    'escape': () => {
      setShowSuggestions(false);
      setShowFilters(false);
    },
    'enter': () => {
      if (document.activeElement === searchInputRef.current) {
        handleSearch();
      }
    }
  });

  // Perform search
  const performSearch = useCallback(async (
    query,
    page = 1,
    sort = sortBy,
    overrideFilters = activeFilters
  ) => {
    if (!query.trim()) return;

    const normalizedFilters = buildSearchQueryParams(overrideFilters, {
      page,
      limit: 24,
      sort
    });

    try {
      await dispatch(
        searchProducts({
          query: query.trim(),
          filters: normalizedFilters
        })
      ).unwrap();

      // Update URL with normalized filters
      const newSearchParams = new URLSearchParams();
      newSearchParams.set('q', query.trim());

      Object.entries(normalizedFilters).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        newSearchParams.set(key, String(value));
      });

      setSearchParams(newSearchParams);

      // Persist recent searches
      dispatch(addToRecentSearches(query.trim()));

      // Track search event with both raw and normalized filters
      trackEvent('search_performed', {
        query: query.trim(),
        filters: overrideFilters,
        normalized_filters: normalizedFilters,
        sort,
        page,
        user_authenticated: isAuthenticated,
        total_results: totalResults
      });

      // Animate results
      setTimeout(() => setAnimateResults(true), 100);
    } catch (error) {
      toast.error('Search failed. Please try again.');
    }
  }, [dispatch, activeFilters, sortBy, isAuthenticated, totalResults, setSearchParams]);

  // Handle search
  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) return;
    
    if (!validateSearchQuery(searchQuery)) {
      toast.error('Please enter a valid search term');
      return;
    }
    
    setCurrentPage(1);
    performSearch(searchQuery, 1, sortBy);
    setShowSuggestions(false);
  }, [searchQuery, sortBy, performSearch]);

  // Handle search input change
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.length >= 2) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, []);

  // Handle filter change
  const handleFilterChange = useCallback((filterType, values) => {
    const newFilters = {
      ...activeFilters,
      [filterType]: values
    };
    
    setActiveFilters(newFilters);
    
    if (searchQuery) {
      setCurrentPage(1);
      performSearch(searchQuery, 1, sortBy, newFilters);
    }
  }, [activeFilters, searchQuery, sortBy, performSearch, setActiveFilters]);

  // Handle sort change
  const handleSortChange = useCallback((newSort) => {
    setSortBy(newSort);
    
    if (searchQuery) {
      setCurrentPage(1);
      performSearch(searchQuery, 1, newSort, activeFilters);
    }
  }, [searchQuery, activeFilters, performSearch, setSortBy]);

  // Handle page change
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    performSearch(searchQuery, page, sortBy, activeFilters);
    
    // Scroll to results
    resultsRef.current?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  }, [searchQuery, sortBy, activeFilters, performSearch]);

  // Handle add to cart
  const handleAddToCart = useCallback((product) => {
    dispatch(addToCart({
      ...product,
      quantity: 1
    }));
    
    toast.success(`${product.name} added to cart!`);
    
    trackEvent('product_added_to_cart_from_search', {
      product_id: product._id,
      product_name: product.name,
      search_query: searchQuery,
      user_authenticated: isAuthenticated
    });
  }, [dispatch, searchQuery, isAuthenticated]);

  // Handle add to wishlist
  const handleToggleWishlist = useCallback((product) => {
    dispatch(toggleWishlist(product));
    
    const isInWishlist = wishlistItems.some(item => item._id === product._id);
    toast.success(`${product.name} ${isInWishlist ? 'removed from' : 'added to'} wishlist!`);
    
    trackEvent('product_wishlist_toggled_from_search', {
      product_id: product._id,
      product_name: product.name,
      action: isInWishlist ? 'removed' : 'added',
      search_query: searchQuery,
      user_authenticated: isAuthenticated
    });
  }, [dispatch, wishlistItems, searchQuery, isAuthenticated]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setActiveFilters({});
    
    if (searchQuery) {
      setCurrentPage(1);
      performSearch(searchQuery, 1, sortBy, {});
    }
  }, [searchQuery, sortBy, performSearch, setActiveFilters]);

  // Memoized values
  const hasActiveFilters = useMemo(() => 
    Object.values(activeFilters).some(values => values.length > 0),
    [activeFilters]
  );

  const activeFiltersCount = useMemo(() =>
    Object.values(activeFilters).reduce((count, values) => count + values.length, 0),
    [activeFilters]
  );

  const isProductInWishlist = useCallback((productId) => 
    wishlistItems.some(item => item._id === productId),
    [wishlistItems]
  );

  const isProductInCart = useCallback((productId) => 
    cartItems.some(item => item._id === productId),
    [cartItems]
  );

  const metaTitle = useMemo(
    () => `${searchQuery ? `Search results for "${searchQuery}"` : 'Search'} - ShoeMarkNet`,
    [searchQuery]
  );

  const metaDescription = useMemo(
    () => searchQuery
      ? `Find the best shoes for "${searchQuery}". Browse our collection of premium footwear.`
      : 'Search for your perfect pair of shoes from our extensive collection of premium footwear.',
    [searchQuery]
  );

  const metaKeywords = useMemo(
    () => (searchQuery ? `${searchQuery}, shoes, footwear, sneakers, ShoeMarkNet` : undefined),
    [searchQuery]
  );

  const headerTitle = useMemo(() => (
    searchQuery
      ? (
        <span>
          Results for{' '}
          <span className="text-blue-600 dark:text-blue-300">“{searchQuery}”</span>
        </span>
      )
      : 'Find your perfect shoes'
  ), [searchQuery]);

  const headerDescription = useMemo(() => (
    searchQuery
      ? `Curated matches tailored to your search. ${totalResults ? `${totalResults.toLocaleString()} styles available.` : ''}`.trim()
      : 'Search thousands of premium footwear options across top brands, sports, and styles.'
  ), [searchQuery, totalResults]);

  const headerBreadcrumbs = useMemo(() => (
    <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-2">
      <button
        type="button"
        onClick={() => navigate('/')}
        className="font-medium text-gray-600 transition-colors duration-200 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-300"
      >
        Home
      </button>
      <span className="text-gray-400">/</span>
      <span className="font-medium text-gray-700 dark:text-gray-300">Search</span>
      {searchQuery && (
        <>
          <span className="text-gray-400">/</span>
          <span className="truncate max-w-[140px] sm:max-w-[220px]" title={searchQuery}>
            {searchQuery}
          </span>
        </>
      )}
    </nav>
  ), [navigate, searchQuery]);

  const headerActions = useMemo(() => () => (
    <div className="relative w-full md:w-[360px] lg:w-[420px] xl:w-[460px]">
      <div className="relative">
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search for shoes, brands, styles..."
          className="w-full pl-12 pr-24 py-4 text-base md:text-lg bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-700/40 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 shadow-sm dark:shadow-[0_20px_40px_-25px_rgba(59,130,246,0.65)]"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <i className="fas fa-search text-lg" />
        </div>
        <button
          onClick={handleSearch}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-5 py-2 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
        >
          Search
        </button>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-2">
          <i className="fas fa-keyboard text-blue-500" />
          <span className="hidden sm:inline">Press</span>
          <span className="rounded-lg border border-slate-200 bg-white px-2 py-0.5 font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
            Ctrl / Cmd + K
          </span>
        </span>
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setShowSuggestions(false);
              dispatch(clearSearch());
              setSearchParams(new URLSearchParams());
            }}
            className="flex items-center gap-1 rounded-lg px-2 py-1 font-medium text-gray-500 transition-colors duration-200 hover:text-red-500"
          >
            <i className="fas fa-times" />
            Clear
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <SearchSuggestions
          suggestions={suggestions}
          onSelect={(suggestion) => {
            setSearchQuery(suggestion);
            setShowSuggestions(false);
            performSearch(suggestion, 1, sortBy);
          }}
          onClose={() => setShowSuggestions(false)}
        />
      )}
    </div>
  ), [dispatch, handleSearch, handleSearchChange, performSearch, searchQuery, setSearchParams, showSuggestions, sortBy, suggestions, setSearchQuery, setShowSuggestions]);

  const headerAfter = useMemo(() => (
    searchQuery ? (
      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-2 whitespace-nowrap">
          <i className="fas fa-box-open text-blue-500" />
          {totalResults > 0 ? `${totalResults.toLocaleString()} result${totalResults !== 1 ? 's' : ''}` : 'No matches yet'}
        </span>
        {hasActiveFilters && (
          <span className="flex items-center gap-2 whitespace-nowrap">
            <i className="fas fa-sliders-h text-purple-500" />
            {activeFiltersCount} active filter{activeFiltersCount !== 1 ? 's' : ''}
          </span>
        )}
        <span className="flex items-center gap-2 whitespace-nowrap">
          <i className="fas fa-clock text-amber-500" />
          Updated moments ago
        </span>
      </div>
    ) : (
      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <i className="fas fa-lightbulb text-amber-500" />
        <span>Tip: use filters to narrow down by brand, price, size, and more.</span>
      </div>
    )
  ), [searchQuery, totalResults, hasActiveFilters, activeFiltersCount]);

  return (
    <>
      {/* SEO Meta Tags */}
      <PageMeta
        title={metaTitle}
        description={metaDescription}
        robots="index, follow"
        keywords={metaKeywords}
      />

      <PageLayout
        title={headerTitle}
        description={headerDescription}
        breadcrumbs={headerBreadcrumbs}
        actions={headerActions}
        afterHeader={headerAfter}
      >
        <div className="space-y-10">
          {!searchQuery && (
            <>
              {recentSearches.length > 0 && (
                <div className="max-w-3xl rounded-2xl border border-slate-200/70 bg-white p-6 text-slate-900 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700/60 dark:bg-slate-900 dark:text-slate-100">
                  <RecentSearches
                    searches={recentSearches}
                    onSelect={(query) => {
                      setSearchQuery(query);
                      performSearch(query, 1, sortBy);
                    }}
                  />
                </div>
              )}

              <div className="space-y-6 rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white via-slate-50 to-white p-10 text-center text-slate-900 shadow-md transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-xl dark:border-slate-700/60 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 dark:text-slate-100">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-xl">
                  <i className="fas fa-search text-3xl" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">
                    Discover incredible footwear without leaving your seat
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Start typing above to explore thousands of curated sneakers, trainers, and limited editions.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3 rounded-2xl border border-slate-200/70 bg-white p-6 text-slate-900 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700/60 dark:bg-slate-900 dark:text-slate-100">
                {['Nike Air Max', 'Jordan Retro', 'Adidas Ultraboost', 'Running Shoes', 'Basketball Shoes'].map((term, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchQuery(term);
                      performSearch(term, 1, sortBy);
                    }}
                    className="rounded-xl border border-white/40 bg-white/70 px-4 py-2 text-sm font-medium text-gray-800 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500 hover:text-blue-600 dark:border-slate-700/40 dark:bg-slate-900/60 dark:text-gray-200 dark:hover:border-blue-400"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </>
          )}

          {searchQuery && (
            <section className="space-y-6">
              <div className="flex flex-col gap-6 rounded-2xl border border-slate-200/70 bg-white p-6 text-slate-900 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700/60 dark:bg-slate-900 dark:text-slate-100 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300">
                    Search overview
                  </p>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Showing {results.length ? results.length.toLocaleString() : 0} of {totalResults ? totalResults.toLocaleString() : '0'} matches for “{searchQuery}”
                  </h2>
                  {hasActiveFilters && (
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-2">
                        <i className="fas fa-sliders-h text-purple-500" />
                        Filters active: {activeFiltersCount}
                      </span>
                      <button
                        onClick={clearFilters}
                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-red-500 transition-colors duration-200 hover:text-red-600"
                      >
                        <i className="fas fa-times" />
                        Clear all
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex rounded-xl border border-white/40 bg-white/70 p-1 backdrop-blur-lg dark:border-slate-700/40 dark:bg-slate-900/60">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                        viewMode === 'grid'
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'text-gray-600 hover:text-blue-600 dark:text-gray-300'
                      }`}
                    >
                      <i className="fas fa-th-large" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                        viewMode === 'list'
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'text-gray-600 hover:text-blue-600 dark:text-gray-300'
                      }`}
                    >
                      <i className="fas fa-list" />
                    </button>
                  </div>

                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="rounded-xl border border-white/40 bg-white/70 px-4 py-2 text-sm font-medium text-gray-800 shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700/40 dark:bg-slate-900/60 dark:text-gray-200"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value} className="bg-white dark:bg-slate-900">
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 rounded-xl border border-white/40 bg-white/70 px-4 py-2 text-sm font-medium text-gray-800 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500 hover:text-blue-600 dark:border-slate-700/40 dark:bg-slate-900/60 dark:text-gray-200"
                  >
                    <i className="fas fa-filter" />
                    Filters
                    {hasActiveFilters && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-6 xl:flex-row">
                {showFilters && (
                  <div className="w-full xl:w-80">
                    <SearchFilters
                      filters={SEARCH_FILTERS}
                      activeFilters={activeFilters}
                      onFilterChange={handleFilterChange}
                      onClearFilters={clearFilters}
                      hasActiveFilters={hasActiveFilters}
                    />
                  </div>
                )}

                <div className="flex-1 space-y-6" ref={resultsRef}>
                  {loading ? (
                    <div className="flex items-center justify-center rounded-2xl border border-slate-200/70 bg-white p-12 text-slate-900 shadow-sm dark:border-slate-700/60 dark:bg-slate-900 dark:text-slate-100">
                      <LoadingSpinner size="large" message="Searching for products..." />
                    </div>
                  ) : error ? (
                    <div className="rounded-2xl border border-red-200/80 bg-white p-10 text-center text-slate-900 shadow-sm dark:border-red-900/60 dark:bg-slate-900 dark:text-slate-100">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
                        <i className="fas fa-exclamation-triangle text-2xl" />
                      </div>
                      <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
                        Search error
                      </h3>
                      <p className="mt-2 text-gray-600 dark:text-gray-400">
                        {error.message || 'Something went wrong while searching. Please try again.'}
                      </p>
                      <button
                        onClick={() => performSearch(searchQuery, currentPage, sortBy)}
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2 text-sm font-semibold text-white shadow-lg transition-colors duration-200 hover:bg-red-600"
                      >
                        <i className="fas fa-redo" />
                        Try again
                      </button>
                    </div>
                  ) : results.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200/70 bg-white p-10 text-slate-900 shadow-sm dark:border-slate-700/60 dark:bg-slate-900 dark:text-slate-100">
                      <NoResults
                        query={searchQuery}
                        onClearFilters={clearFilters}
                        hasActiveFilters={hasActiveFilters}
                        recentSearches={recentSearches}
                        onSearchSuggestion={(query) => {
                          setSearchQuery(query);
                          performSearch(query, 1, sortBy);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-slate-200/70 bg-white p-6 text-slate-900 shadow-sm dark:border-slate-700/60 dark:bg-slate-900 dark:text-slate-100">
                      <SearchResults
                        results={results}
                        viewMode={viewMode}
                        animateResults={animateResults}
                        onAddToCart={handleAddToCart}
                        onToggleWishlist={handleToggleWishlist}
                        isProductInWishlist={isProductInWishlist}
                        isProductInCart={isProductInCart}
                      />
                    </div>
                  )}

                  {results.length > 0 && pagination && pagination.totalPages > 1 && (
                    <div className="flex justify-center rounded-2xl border border-slate-200/70 bg-white p-4 text-slate-900 shadow-sm dark:border-slate-700/60 dark:bg-slate-900 dark:text-slate-100">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={handlePageChange}
                        showInfo={true}
                        totalItems={totalResults}
                        itemsPerPage={pagination.limit || 24}
                      />
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>
      </PageLayout>
    </>
  );
};

export default Search;
