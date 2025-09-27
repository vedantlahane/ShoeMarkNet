import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import PageMeta from '../components/seo/PageMeta';
import { toast } from 'react-toastify';

// Redux actions
import { 
  fetchWishlist, 
  removeFromWishlist, 
  clearWishlistAsync,
  clearWishlistLocal 
} from '../redux/slices/wishlistSlice';
import { addToCart } from '../redux/slices/cartSlice';

// Components
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import WishlistItem from '../components/wishlist/WishlistItem';
import WishlistFilters from '../components/wishlist/WishlistFilters';
import ShareModal from '../components/common/ShareModal';
import CompareModal from '../components/products/CompareModal';
import Pagination from '../components/common/Pagination';

// Hooks
import useLocalStorage from '../hooks/useLocalStorage';
import useDebounce from '../hooks/useDebounce';

// Utils
import { trackEvent } from '../utils/analytics';
import { formatPrice, calculateDiscount } from '../utils/helpers';

// Constants
const VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list',
  COMPACT: 'compact'
};

const SORT_OPTIONS = [
  { value: 'dateAdded:desc', label: 'Recently Added', icon: 'fa-clock' },
  { value: 'dateAdded:asc', label: 'Oldest First', icon: 'fa-history' },
  { value: 'price:asc', label: 'Price: Low to High', icon: 'fa-sort-amount-up' },
  { value: 'price:desc', label: 'Price: High to Low', icon: 'fa-sort-amount-down' },
  { value: 'name:asc', label: 'Name: A-Z', icon: 'fa-sort-alpha-up' },
  { value: 'rating:desc', label: 'Highest Rated', icon: 'fa-star' },
  { value: 'discount:desc', label: 'Best Deals', icon: 'fa-percentage' }
];

const ITEMS_PER_PAGE_OPTIONS = [
  { value: 12, label: '12 items' },
  { value: 24, label: '24 items' },
  { value: 48, label: '48 items' }
];

const Wishlist = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Redux state
  const { 
    items: wishlistItems, 
    totalItems,
    pagination,
    loading, 
    error 
  } = useSelector((state) => state.wishlist);
  
  const { user, isAuthenticated, isInitialized } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart);

  // Local state
  const [selectedItems, setSelectedItems] = useState([]);
  const [viewMode, setViewMode] = useLocalStorage('wishlistViewMode', VIEW_MODES.GRID);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'dateAdded:desc');
  const [filterBy, setFilterBy] = useState({
    category: searchParams.get('category') || '',
    priceRange: {
      min: parseInt(searchParams.get('minPrice') || '0', 10),
      max: parseInt(searchParams.get('maxPrice') || '10000', 10)
    },
    inStock: searchParams.get('inStock') === 'true',
    onSale: searchParams.get('onSale') === 'true'
  });
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [itemsPerPage, setItemsPerPage] = useLocalStorage('wishlistItemsPerPage', 12);
  
  // Modal states
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [shareItem, setShareItem] = useState(null);
  const [compareItems, setCompareItems] = useState([]);
  
  // Animation and interaction states
  const [animateElements, setAnimateElements] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [processingItems, setProcessingItems] = useState(new Set());
  
  // Debounced search
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Initialize animations
  useEffect(() => {
    setTimeout(() => setAnimateElements(true), 100);
  }, []);

  // Authentication and initialization check
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      toast.info('Please sign in to view your wishlist');
      navigate(`/login?redirect=${encodeURIComponent('/wishlist')}`);
      return;
    }

    if (isAuthenticated && user) {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sort: sortBy,
        ...(filterBy.category && { category: filterBy.category }),
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(filterBy.inStock && { inStock: true }),
        ...(filterBy.onSale && { onSale: true }),
        ...(filterBy.priceRange.min > 0 && { minPrice: filterBy.priceRange.min }),
        ...(filterBy.priceRange.max < 10000 && { maxPrice: filterBy.priceRange.max })
      };

      dispatch(fetchWishlist(params));
      
      // Track page view
      trackEvent('page_view', {
        page_title: 'Wishlist',
        page_location: window.location.href,
        wishlist_item_count: totalItems
      });
    }
  }, [
    dispatch, 
    user, 
    isAuthenticated, 
    isInitialized, 
    navigate, 
    currentPage,
    itemsPerPage,
    sortBy,
    filterBy,
    debouncedSearchTerm,
    totalItems
  ]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (sortBy !== 'dateAdded:desc') params.set('sort', sortBy);
    if (filterBy.category) params.set('category', filterBy.category);
    if (searchTerm) params.set('search', searchTerm);
    if (filterBy.inStock) params.set('inStock', 'true');
    if (filterBy.onSale) params.set('onSale', 'true');
    if (filterBy.priceRange.min > 0) params.set('minPrice', filterBy.priceRange.min.toString());
    if (filterBy.priceRange.max < 10000) params.set('maxPrice', filterBy.priceRange.max.toString());
    if (currentPage > 1) params.set('page', currentPage.toString());

    const newParamsString = params.toString();
    const currentParamsString = searchParams.toString();
    
    if (newParamsString !== currentParamsString) {
      setSearchParams(params, { replace: true });
    }
  }, [sortBy, filterBy, searchTerm, currentPage, searchParams, setSearchParams]);

  // Memoized calculations
  const filteredAndSortedItems = useMemo(() => {
    if (!Array.isArray(wishlistItems)) return [];
    
    let filtered = [...wishlistItems];
    
    // Apply client-side filtering if needed
    if (searchTerm && !debouncedSearchTerm) {
      filtered = filtered.filter(item => 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [wishlistItems, searchTerm, debouncedSearchTerm]);

  const totalValue = useMemo(() => {
    return filteredAndSortedItems.reduce((sum, item) => {
      const discountedPrice = calculateDiscount(item.price, item.discountPercentage);
      return sum + (discountedPrice || item.price);
    }, 0);
  }, [filteredAndSortedItems]);

  const totalSavings = useMemo(() => {
    return filteredAndSortedItems.reduce((savings, item) => {
      if (item.discountPercentage > 0) {
        const originalPrice = item.price;
        const discountedPrice = calculateDiscount(originalPrice, item.discountPercentage);
        return savings + (originalPrice - discountedPrice);
      }
      return savings;
    }, 0);
  }, [filteredAndSortedItems]);

  const availableItems = useMemo(() => {
    return filteredAndSortedItems.filter(item => item.countInStock > 0);
  }, [filteredAndSortedItems]);

  // Enhanced handlers
  const handleRemoveFromWishlist = useCallback(async (productId, productName) => {
    setProcessingItems(prev => new Set(prev).add(productId));
    
    try {
      await dispatch(removeFromWishlist(productId)).unwrap();
      setSelectedItems(prev => prev.filter(id => id !== productId));
      
      trackEvent('remove_from_wishlist', {
        item_id: productId,
        item_name: productName
      });
      
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  }, [dispatch]);

  const handleAddToCart = useCallback(async (item) => {
    setProcessingItems(prev => new Set(prev).add(item._id));
    
    try {
      const cartItem = {
        productId: item._id,
        quantity: 1,
        product: {
          _id: item._id,
          name: item.name,
          price: item.price,
          image: item.images?.[0]
        }
      };

      await dispatch(addToCart(cartItem)).unwrap();
      
      trackEvent('add_to_cart', {
        currency: 'USD',
        value: item.price,
        items: [{
          item_id: item._id,
          item_name: item.name,
          price: item.price,
          quantity: 1
        }]
      });

    } catch (err) {
      console.error('Failed to add to cart:', err);
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(item._id);
        return newSet;
      });
    }
  }, [dispatch]);

  const handleBulkAddToCart = useCallback(async () => {
    if (selectedItems.length === 0) {
      toast.warning('Please select items first');
      return;
    }

    const availableSelectedItems = selectedItems.filter(id => {
      const item = filteredAndSortedItems.find(item => item._id === id);
      return item && item.countInStock > 0;
    });

    if (availableSelectedItems.length === 0) {
      toast.warning('No available items selected');
      return;
    }

    setBulkLoading(true);

    try {
      for (const itemId of availableSelectedItems) {
        const item = filteredAndSortedItems.find(item => item._id === itemId);
        await handleAddToCart(item);
      }

      setSelectedItems([]);
      toast.success(`🎉 ${availableSelectedItems.length} items added to cart!`);
      
      trackEvent('bulk_add_to_cart', {
        item_count: availableSelectedItems.length,
        total_value: availableSelectedItems.reduce((sum, id) => {
          const item = filteredAndSortedItems.find(item => item._id === id);
          return sum + item.price;
        }, 0)
      });

    } catch (error) {
      toast.error('Failed to add some items to cart');
    } finally {
      setBulkLoading(false);
    }
  }, [selectedItems, filteredAndSortedItems, handleAddToCart]);

  const handleBulkRemove = useCallback(async () => {
    if (selectedItems.length === 0) {
      toast.warning('Please select items first');
      return;
    }

    if (!window.confirm(`Remove ${selectedItems.length} items from your wishlist?`)) {
      return;
    }

    setBulkLoading(true);

    try {
      for (const itemId of selectedItems) {
        const item = filteredAndSortedItems.find(item => item._id === itemId);
        await handleRemoveFromWishlist(itemId, item?.name);
      }

      setSelectedItems([]);
      toast.success(`${selectedItems.length} items removed from wishlist`);

    } catch (error) {
      toast.error('Failed to remove some items');
    } finally {
      setBulkLoading(false);
    }
  }, [selectedItems, filteredAndSortedItems, handleRemoveFromWishlist]);

  const handleClearWishlist = useCallback(async () => {
    if (!window.confirm('Are you sure you want to clear your entire wishlist? This action cannot be undone.')) {
      return;
    }

    try {
      await dispatch(clearWishlistAsync()).unwrap();
      setSelectedItems([]);
      
      trackEvent('wishlist_cleared', {
        item_count: filteredAndSortedItems.length
      });

    } catch (error) {
      console.error('Failed to clear wishlist:', error);
    }
  }, [dispatch, filteredAndSortedItems.length]);

  const handleItemSelect = useCallback((itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedItems.length === filteredAndSortedItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredAndSortedItems.map(item => item._id));
    }
  }, [selectedItems.length, filteredAndSortedItems]);

  const handleShare = useCallback((item) => {
    setShareItem(item);
    setShowShareModal(true);
    
    trackEvent('wishlist_item_share_clicked', {
      item_id: item._id,
      item_name: item.name
    });
  }, []);

  const handleAddToCompare = useCallback((item) => {
    if (compareItems.find(compareItem => compareItem._id === item._id)) {
      toast.info('Item already in comparison');
      return;
    }

    if (compareItems.length >= 4) {
      toast.warning('You can compare up to 4 items at once');
      return;
    }

    setCompareItems(prev => [...prev, item]);
    toast.success(`${item.name} added to comparison`);
    
    trackEvent('add_to_compare', {
      item_id: item._id,
      item_name: item.name,
      compare_count: compareItems.length + 1
    });
  }, [compareItems]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    trackEvent('pagination_click', {
      page_number: page
    });
  }, []);

  const handleSortChange = useCallback((newSort) => {
    setSortBy(newSort);
    setCurrentPage(1);
    
    trackEvent('wishlist_sort_changed', {
      sort_option: newSort
    });
  }, []);

  const handleFilterChange = useCallback((newFilter) => {
    setFilterBy(prev => ({ ...prev, ...newFilter }));
    setCurrentPage(1);
    
    trackEvent('wishlist_filter_changed', {
      filter_type: Object.keys(newFilter)[0],
      filter_value: Object.values(newFilter)[0]
    });
  }, []);

  const isInCart = useCallback((productId) => {
    return cartItems?.some(item => 
      (item.product?._id || item.productId) === productId
    );
  }, [cartItems]);

  // Loading state
  if (loading && !wishlistItems?.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner size="large" message="Loading your wishlist..." />
        </div>
      </div>
    );
  }

  // Error state
  if (error && !wishlistItems?.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <ErrorMessage
          message={error || 'Failed to load wishlist'}
          onRetry={() => dispatch(fetchWishlist())}
          className="max-w-md"
        />
      </div>
    );
  }

  const items = Array.isArray(wishlistItems) ? wishlistItems : [];
  const totalPages = pagination?.totalPages || Math.ceil(items.length / itemsPerPage);

  return (
    <>
      {/* SEO Meta Tags */}
      <PageMeta
        title={`My Wishlist - ${totalItems} Items | ShoeMarkNet`}
        description={`Your wishlist contains ${totalItems} carefully selected items worth ${formatPrice(totalValue)}. Save and organize your favorite products.`}
        robots="noindex, nofollow"
        canonical="https://shoemarknet.com/wishlist"
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        
        {/* Animated Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-pink-400/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${4 + Math.random() * 6}s`
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          
          {/* Enhanced Header */}
          <div className={`mb-8 ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 shadow-2xl">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                  <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors font-semibold mb-4 group"
                  >
                    <i className="fas fa-arrow-left mr-3 text-lg group-hover:-translate-x-1 transition-transform duration-200"></i>
                    Back
                  </button>
                  
                  <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-pink-600 via-red-600 to-rose-600 bg-clip-text text-transparent mb-2">
                    <i className="fas fa-heart mr-3"></i>
                    Your Wishlist
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    <i className="fas fa-sparkles mr-2"></i>
                    Save your favorite items for later
                  </p>
                  
                  {items.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-3">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {items.length} items • Total value: {formatPrice(totalValue)}
                        {totalSavings > 0 && (
                          <span className="text-green-600 ml-2">
                            (Save {formatPrice(totalSavings)})
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Quick Stats */}
                {items.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    <div className="bg-pink-500/20 backdrop-blur-lg border border-pink-300/50 rounded-2xl px-4 py-2 text-pink-800 dark:text-pink-200">
                      <i className="fas fa-heart mr-2"></i>
                      {items.length} Items
                    </div>
                    <div className="bg-green-500/20 backdrop-blur-lg border border-green-300/50 rounded-2xl px-4 py-2 text-green-800 dark:text-green-200">
                      <i className="fas fa-check-circle mr-2"></i>
                      {availableItems.length} Available
                    </div>
                    {compareItems.length > 0 && (
                      <button
                        onClick={() => setShowCompareModal(true)}
                        className="bg-purple-500/20 backdrop-blur-lg border border-purple-300/50 rounded-2xl px-4 py-2 text-purple-800 dark:text-purple-200 hover:bg-purple-500/30 transition-colors duration-200"
                      >
                        <i className="fas fa-balance-scale mr-2"></i>
                        Compare ({compareItems.length})
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {items.length === 0 ? (
            /* Enhanced Empty State */
            <div className={`text-center py-16 ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-12 shadow-2xl max-w-2xl mx-auto">
                <div className="w-24 h-24 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                  <i className="fas fa-heart text-4xl text-white animate-pulse"></i>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Your Wishlist is Empty
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg leading-relaxed">
                  Start adding items you love to your wishlist. 
                  It's a great way to keep track of products you want to buy later!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/products">
                    <button className="bg-gradient-to-r from-pink-600 via-red-600 to-rose-600 hover:from-pink-700 hover:via-red-700 hover:to-rose-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-2xl">
                      <i className="fas fa-search mr-3"></i>
                      Discover Products
                      <i className="fas fa-arrow-right ml-3"></i>
                    </button>
                  </Link>
                  <Link to="/categories">
                    <button className="bg-white/20 backdrop-blur-lg border border-white/30 text-gray-900 dark:text-white font-bold py-4 px-8 rounded-2xl hover:bg-white/30 transition-all duration-200">
                      <i className="fas fa-th-large mr-3"></i>
                      Browse Categories
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Enhanced Filters and Controls */}
              <WishlistFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                sortBy={sortBy}
                onSortChange={handleSortChange}
                filterBy={filterBy}
                onFilterChange={handleFilterChange}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
                totalItems={items.length}
                selectedItems={selectedItems}
                onSelectAll={handleSelectAll}
                onBulkAddToCart={handleBulkAddToCart}
                onBulkRemove={handleBulkRemove}
                onClearWishlist={handleClearWishlist}
                bulkLoading={bulkLoading}
                sortOptions={SORT_OPTIONS}
                itemsPerPageOptions={ITEMS_PER_PAGE_OPTIONS}
                className={`mb-8 ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`}
                style={{ animationDelay: '0.2s' }}
              />

              {/* Loading overlay for pagination */}
              {loading && items.length > 0 && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
                  <LoadingSpinner size="medium" message="Updating wishlist..." />
                </div>
              )}

              {/* Enhanced Wishlist Items */}
              <div className={`mb-8 ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
                <div className={`grid gap-6 ${
                  viewMode === VIEW_MODES.GRID 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : viewMode === VIEW_MODES.LIST
                    ? 'grid-cols-1'
                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
                }`}>
                  {filteredAndSortedItems.map((item, index) => (
                    <WishlistItem
                      key={item._id}
                      item={item}
                      index={index}
                      viewMode={viewMode}
                      isSelected={selectedItems.includes(item._id)}
                      isProcessing={processingItems.has(item._id)}
                      isInCart={isInCart(item._id)}
                      onSelect={handleItemSelect}
                      onRemove={handleRemoveFromWishlist}
                      onAddToCart={handleAddToCart}
                      onShare={handleShare}
                      onAddToCompare={handleAddToCompare}
                      animateElements={animateElements}
                      className="transition-all duration-300 hover:scale-105"
                    />
                  ))}
                </div>
              </div>

              {/* Enhanced Pagination */}
              {totalPages > 1 && (
                <div className={`mb-8 ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    showInfo={true}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl shadow-2xl"
                  />
                </div>
              )}

              {/* Continue Shopping CTA */}
              <div className={`text-center ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.8s' }}>
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 shadow-2xl">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    <i className="fas fa-search mr-3 text-blue-500"></i>
                    Looking for More?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Discover more amazing products from our curated collection
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/products">
                      <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-2xl transition-all duration-200 transform hover:scale-105">
                        <i className="fas fa-store mr-2"></i>
                        Continue Shopping
                      </button>
                    </Link>
                    <Link to="/products?sort=rating:desc">
                      <button className="bg-white/20 backdrop-blur-lg border border-white/30 text-gray-900 dark:text-white font-bold py-3 px-8 rounded-2xl hover:bg-white/30 transition-all duration-200">
                        <i className="fas fa-star mr-2"></i>
                        Top Rated
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modals */}
        {showShareModal && shareItem && (
          <ShareModal
            item={shareItem}
            onClose={() => {
              setShowShareModal(false);
              setShareItem(null);
            }}
            shareUrl={`${window.location.origin}/products/${shareItem._id}`}
            title={`Check out this amazing ${shareItem.name}!`}
            description={`I found this on ShoeMarkNet and thought you'd love it! Only ${formatPrice(shareItem.price)}.`}
          />
        )}

        {showCompareModal && (
          <CompareModal
            items={compareItems}
            onClose={() => setShowCompareModal(false)}
            onRemoveItem={(itemId) => {
              setCompareItems(prev => prev.filter(item => item._id !== itemId));
            }}
            onClearAll={() => setCompareItems([])}
          />
        )}

        {/* Custom Styles */}
      </div>
    </>
  );
};

export default Wishlist;
