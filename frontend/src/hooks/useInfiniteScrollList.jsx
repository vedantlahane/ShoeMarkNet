import { useState, useCallback, useRef } from 'react';
import useInfiniteScroll from './useInfiniteScroll';

/**
 * Hook for managing infinite scroll with list data
 * @param {Object} options - Configuration options
 * @param {Function} options.fetchData - Function to fetch data (should return { items, hasMore, total })
 * @param {number} options.pageSize - Number of items per page (default: 20)
 * @param {Array} options.initialItems - Initial items array (default: [])
 * @param {Function} options.onError - Error handler function
 * @returns {Object} List state and infinite scroll utilities
 */
const useInfiniteScrollList = (options = {}) => {
  const {
    fetchData = async () => ({ items: [], hasMore: false, total: 0 }),
    pageSize = 20,
    initialItems = [],
    onError = null
  } = options;

  // State management
  const [items, setItems] = useState(initialItems);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);

  // Refs
  const initialLoadRef = useRef(false);

  // Load more function
  const loadMore = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const currentPage = initialLoadRef.current ? page + 1 : 0;
      const result = await fetchData({
        page: currentPage,
        pageSize,
        offset: currentPage * pageSize
      });

      const newItems = result.items || [];
      const resultHasMore = result.hasMore !== undefined ? result.hasMore : newItems.length === pageSize;
      const resultTotal = result.total || 0;

      if (currentPage === 0) {
        // First load or reset
        setItems(newItems);
      } else {
        // Append to existing items
        setItems(prev => [...prev, ...newItems]);
      }

      setHasMore(resultHasMore);
      setPage(currentPage);
      setTotal(resultTotal);
      
      if (!initialLoadRef.current) {
        initialLoadRef.current = true;
      }

    } catch (err) {
      const errorMessage = err.message || 'Failed to load data';
      setError(errorMessage);
      
      if (onError) {
        onError(err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchData, pageSize, page, isLoading, onError]);

  // Infinite scroll hook
  const {
    sentinelRef,
    isIntersecting,
    loadCount,
    error: scrollError,
    reset: resetScroll,
    trigger
  } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading,
    enabled: true,
    onError
  });

  // Reset function
  const reset = useCallback(() => {
    setItems(initialItems);
    setIsLoading(false);
    setHasMore(true);
    setPage(0);
    setTotal(0);
    setError(null);
    initialLoadRef.current = false;
    resetScroll();
  }, [initialItems, resetScroll]);

  // Refresh function (reset and load first page)
  const refresh = useCallback(async () => {
    reset();
    await loadMore();
  }, [reset, loadMore]);

  return {
    // Data state
    items,
    isLoading,
    hasMore,
    page,
    total,
    error: error || scrollError,
    
    // Scroll state
    isIntersecting,
    loadCount,
    sentinelRef,
    
    // Methods
    loadMore,
    reset,
    refresh,
    trigger,
    
    // Computed values
    isEmpty: items.length === 0 && !isLoading,
    isFirstLoad: !initialLoadRef.current && isLoading,
    hasItems: items.length > 0,
    progress: total > 0 ? Math.round((items.length / total) * 100) : 0
  };
};

export default useInfiniteScrollList;
