import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import PageMeta from '../components/seo/PageMeta';
import PageLayout from '../components/common/layout/PageLayout';
import { toast } from 'react-toastify';
import PageHeader from '../components/common/layout/PageHeader';

// Redux actions
import {
  fetchWishlist,
  removeFromWishlist,
  clearWishlistAsync,
  clearWishlistLocal
} from '../redux/slices/wishlistSlice';
import { addToCart } from '../redux/slices/cartSlice';

// Components
import LoadingSpinner from '../components/common/feedback/LoadingSpinner';
import ErrorMessage from '../components/common/feedback/ErrorMessage';
import WishlistItem from '../components/wishlist/WishlistItem';
import WishlistFilters from '../components/wishlist/WishlistFilters';
import ShareModal from '../components/common/modals/ShareModal';
import CompareModal from '../components/product-details/CompareModal';
import Pagination from '../components/common/navigation/Pagination';

// Hooks
import useLocalStorage from '../hooks/useLocalStorage';

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
  const [bulkLoading, setBulkLoading] = useState(false);
  const [processingItems, setProcessingItems] = useState(new Set());

  // Initialize animations
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
        ...(searchTerm && { search: searchTerm }),
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
    searchTerm,
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
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [wishlistItems, searchTerm]);

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
      <div className="min-h-screen bg-theme text-theme">
        <div className="mx-auto flex max-w-4xl items-center justify-center px-4 py-24">
          <LoadingSpinner size="large" message="Loading your wishlist..." />
        </div>
      </div>
    );
  }

  // Error state
  if (error && !wishlistItems?.length) {
    return (
      <div className="min-h-screen bg-theme text-theme">
        <div className="mx-auto flex max-w-4xl items-center justify-center px-4 py-24">
          <ErrorMessage
            message={error || 'Failed to load wishlist'}
            onRetry={() => dispatch(fetchWishlist())}
            className="max-w-md"
          />
        </div>
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

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="container-app py-10">
          <PageHeader
            title="Wishlist"
            description="Keep the shoes you love within reach. Move them to your cart whenever you're ready."
            breadcrumbItems={[{ label: 'Wishlist' }]}
            actions={
              items.length > 0 && (
                <div className="flex flex-wrap gap-3 text-sm text-muted-theme">
                  <div className="rounded-xl border border-theme-strong bg-card px-4 py-2">
                    {items.length} saved • {formatPrice(totalValue)}
                  </div>
                  <div className="rounded-xl border border-theme-strong bg-card px-4 py-2">
                    {availableItems.length} in stock
                  </div>
                  {compareItems.length > 0 && (
                    <button
                      onClick={() => setShowCompareModal(true)}
                      className="inline-flex items-center gap-2 rounded-xl border border-theme-strong bg-card px-4 py-2 text-muted-strong transition-colors hover:border-primary hover:text-theme"
                    >
                      <i className="fas fa-balance-scale"></i>
                      Compare ({compareItems.length})
                    </button>
                  )}
                </div>
              )
            }
          />

          {items.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <i className="fas fa-heart text-2xl text-slate-400 dark:text-slate-500"></i>
              </div>
              <h2 className="mt-6 text-2xl font-semibold text-slate-900 dark:text-white">Nothing saved yet</h2>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 md:text-base">
                Tap the heart on any product to store it here. It's the easiest way to compare styles and come back later.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  to="/products"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  Browse products
                </Link>
                <Link
                  to="/categories"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  View categories
                </Link>
              </div>
            </div>
          ) : (
            <>
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
                className="mb-8"
              />

              {loading && items.length > 0 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                  <LoadingSpinner size="medium" message="Updating wishlist..." />
                </div>
              )}

              <div className="mb-10">
                <div
                  className={`grid gap-6 ${viewMode === VIEW_MODES.GRID
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                    : viewMode === VIEW_MODES.LIST
                      ? 'grid-cols-1'
                      : 'grid-cols-2 lg:grid-cols-4'
                    }`}
                >
                  {filteredAndSortedItems.map((item) => (
                    <WishlistItem
                      key={item._id}
                      item={item}
                      viewMode={viewMode}
                      isSelected={selectedItems.includes(item._id)}
                      isProcessing={processingItems.has(item._id)}
                      isInCart={isInCart(item._id)}
                      onSelect={handleItemSelect}
                      onRemove={handleRemoveFromWishlist}
                      onAddToCart={handleAddToCart}
                      onShare={handleShare}
                      onAddToCompare={handleAddToCompare}
                      className="transition-colors hover:border-slate-600"
                    />
                  ))}
                </div>
              </div>

              {totalPages > 1 && (
                <div className="mb-10">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    showInfo={true}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    className="rounded-2xl border border-theme-strong bg-card"
                  />
                </div>
              )}

              <div className="rounded-2xl border border-theme-strong bg-card p-8 text-center">
                <h3 className="text-xl font-semibold text-theme">Still browsing?</h3>
                <p className="mt-2 text-sm text-muted-theme">
                  Jump back into the catalog or head straight to best sellers.
                </p>
                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link
                    to="/products"
                    className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-strong"
                  >
                    Continue shopping
                  </Link>
                  <Link
                    to="/products?sort=rating:desc"
                    className="inline-flex h-12 items-center justify-center rounded-xl border border-theme-strong px-6 text-sm font-semibold text-muted-strong transition-colors hover:border-primary hover:text-theme"
                  >
                    Top rated picks
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

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
    </>
  );
};

export default Wishlist;
