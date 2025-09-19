import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
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
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorBoundary from '../components/common/ErrorBoundary';
import ProductCard from '../components/products/ProductCard';
import SearchFilters from '../components/search/SearchFilters';
import SearchSuggestions from '../components/search/SearchSuggestions';
import RecentSearches from '../components/search/RecentSearches';
import SearchResults from '../components/search/SearchResults';
import NoResults from '../components/search/NoResults';
import Pagination from '../components/common/Pagination';

// Hooks
import useDebounce from '../hooks/useDebounce';
import useLocalStorage from '../hooks/useLocalStorage';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';

// Utils
import { trackEvent } from '../utils/analytics';
import { formatCurrency } from '../utils/helpers';
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
  { label: 'Most Popular', value: 'popular' }
];

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

  // Debounced search
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

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
  const performSearch = useCallback(async (query, page = 1, sort = sortBy) => {
    if (!query.trim()) return;

    try {
      const searchData = {
        query: query.trim(),
        page,
        limit: 24,
        sort,
        filters: activeFilters
      };

      await dispatch(searchProducts(searchData)).unwrap();
      
      // Update URL
      const newSearchParams = new URLSearchParams();
      newSearchParams.set('q', query.trim());
      newSearchParams.set('page', page.toString());
      newSearchParams.set('sort', sort);
      
      Object.entries(activeFilters).forEach(([key, values]) => {
        if (values.length > 0) {
          newSearchParams.set(key, values.join(','));
        }
      });
      
      setSearchParams(newSearchParams);
      
      // Add to recent searches
      dispatch(addToRecentSearches(query.trim()));
      
      // Track search event
      trackEvent('search_performed', {
        query: query.trim(),
        filters: activeFilters,
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
      performSearch(searchQuery, 1, sortBy);
    }
  }, [activeFilters, searchQuery, sortBy, performSearch, setActiveFilters]);

  // Handle sort change
  const handleSortChange = useCallback((newSort) => {
    setSortBy(newSort);
    
    if (searchQuery) {
      setCurrentPage(1);
      performSearch(searchQuery, 1, newSort);
    }
  }, [searchQuery, performSearch, setSortBy]);

  // Handle page change
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    performSearch(searchQuery, page, sortBy);
    
    // Scroll to results
    resultsRef.current?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  }, [searchQuery, sortBy, performSearch]);

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
      performSearch(searchQuery, 1, sortBy);
    }
  }, [searchQuery, sortBy, performSearch, setActiveFilters]);

  // Memoized values
  const hasActiveFilters = useMemo(() => 
    Object.values(activeFilters).some(values => values.length > 0),
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

  return (
    <ErrorBoundary>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{searchQuery ? `Search results for "${searchQuery}"` : 'Search'} - ShoeMarkNet</title>
        <meta name="description" content={searchQuery ? `Find the best shoes for "${searchQuery}". Browse our collection of premium footwear.` : 'Search for your perfect pair of shoes from our extensive collection of premium footwear.'} />
        <meta name="robots" content="index, follow" />
        {searchQuery && <meta name="keywords" content={`${searchQuery}, shoes, footwear, sneakers, ShoeMarkNet`} />}
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        
        {/* Enhanced Search Header */}
        <div className="bg-white/10 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/20 py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              
              {/* Search Title */}
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  <i className="fas fa-search mr-3"></i>
                  Find Your Perfect Shoes
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Search through thousands of premium footwear options
                </p>
              </div>

              {/* Enhanced Search Bar */}
              <div className="relative">
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search for shoes, brands, styles..."
                    className="w-full pl-12 pr-20 py-4 text-lg bg-white/20 backdrop-blur-lg border border-white/30 dark:border-gray-700/30 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <i className="fas fa-search text-gray-400 text-xl"></i>
                  </div>
                  <button
                    onClick={handleSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl transition-all duration-200 font-medium"
                  >
                    Search
                  </button>
                </div>

                {/* Search Suggestions */}
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

              {/* Recent Searches */}
              {!searchQuery && recentSearches.length > 0 && (
                <RecentSearches
                  searches={recentSearches}
                  onSelect={(query) => {
                    setSearchQuery(query);
                    performSearch(query, 1, sortBy);
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Search Results Section */}
        {searchQuery && (
          <div className="container mx-auto px-4 py-8">
            
            {/* Results Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Search Results for "{searchQuery}"
                </h2>
                {totalResults > 0 && (
                  <p className="text-gray-600 dark:text-gray-400">
                    Found {totalResults.toLocaleString()} result{totalResults !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                
                {/* View Mode Toggle */}
                <div className="flex bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === 'grid' 
                        ? 'bg-blue-500 text-white' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-blue-500'
                    }`}
                  >
                    <i className="fas fa-th-large"></i>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === 'list' 
                        ? 'bg-blue-500 text-white' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-blue-500'
                    }`}
                  >
                    <i className="fas fa-list"></i>
                  </button>
                </div>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-xl px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value} className="bg-white dark:bg-gray-800">
                      {option.label}
                    </option>
                  ))}
                </select>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-xl px-4 py-2 text-gray-900 dark:text-white hover:bg-white/20 transition-all duration-200 flex items-center space-x-2"
                >
                  <i className="fas fa-filter"></i>
                  <span>Filters</span>
                  {hasActiveFilters && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {Object.values(activeFilters).reduce((count, values) => count + values.length, 0)}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              
              {/* Search Filters Sidebar */}
              {showFilters && (
                <div className="lg:w-1/4">
                  <SearchFilters
                    filters={SEARCH_FILTERS}
                    activeFilters={activeFilters}
                    onFilterChange={handleFilterChange}
                    onClearFilters={clearFilters}
                    hasActiveFilters={hasActiveFilters}
                  />
                </div>
              )}

              {/* Search Results */}
              <div className={`${showFilters ? 'lg:w-3/4' : 'w-full'}`} ref={resultsRef}>
                {loading ? (
                  <div className="flex justify-center items-center py-20">
                    <LoadingSpinner size="large" message="Searching for products..." />
                  </div>
                ) : error ? (
                  <div className="text-center py-20">
                    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-2xl p-8 max-w-md mx-auto">
                      <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
                      <h3 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">
                        Search Error
                      </h3>
                      <p className="text-red-600 dark:text-red-300 mb-4">
                        {error.message || 'Something went wrong while searching'}
                      </p>
                      <button
                        onClick={() => performSearch(searchQuery, currentPage, sortBy)}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl transition-colors duration-200"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                ) : results.length === 0 ? (
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
                ) : (
                  <SearchResults
                    results={results}
                    viewMode={viewMode}
                    animateResults={animateResults}
                    onAddToCart={handleAddToCart}
                    onToggleWishlist={handleToggleWishlist}
                    isProductInWishlist={isProductInWishlist}
                    isProductInCart={isProductInCart}
                  />
                )}

                {/* Pagination */}
                {results.length > 0 && pagination && pagination.totalPages > 1 && (
                  <div className="mt-12">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePageChange}
                      showInfo={true}
                      totalItems={totalResults}
                      itemsPerPage={pagination.limit || 24}
                      className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl shadow-xl"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty State - No Search Query */}
        {!searchQuery && (
          <div className="container mx-auto px-4 py-20">
            <div className="text-center max-w-2xl mx-auto">
              <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                <i className="fas fa-search text-4xl text-white"></i>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Discover Amazing Shoes
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
                Search through our extensive collection of premium footwear from top brands
              </p>
              
              {/* Popular Searches */}
              <div className="flex flex-wrap justify-center gap-3">
                {['Nike Air Max', 'Jordan Retro', 'Adidas Ultraboost', 'Running Shoes', 'Basketball Shoes'].map((term, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchQuery(term);
                      performSearch(term, 1, sortBy);
                    }}
                    className="bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-xl px-4 py-2 text-gray-900 dark:text-white hover:bg-white/20 transition-all duration-200 hover:scale-105"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Search;
