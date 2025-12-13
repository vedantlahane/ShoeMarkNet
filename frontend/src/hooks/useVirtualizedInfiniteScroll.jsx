import { useState, useCallback, useMemo } from 'react';
import useInfiniteScrollList from './useInfiniteScrollList';

/**
 * Hook for virtualized infinite scroll (for large lists)
 * @param {Object} options - Configuration options
 * @param {Function} options.fetchData - Function to fetch data
 * @param {number} options.itemHeight - Height of each item in pixels
 * @param {number} options.containerHeight - Height of the container in pixels
 * @param {number} options.overscan - Number of items to render outside visible area (default: 5)
 * @param {number} options.pageSize - Number of items per page
 * @returns {Object} Virtualized list state and utilities
 */
const useVirtualizedInfiniteScroll = (options = {}) => {
  const {
    fetchData,
    itemHeight = 100,
    containerHeight = 400,
    overscan = 5,
    pageSize = 20
  } = options;

  const [scrollTop, setScrollTop] = useState(0);

  // Use infinite scroll list
  const listState = useInfiniteScrollList({
    fetchData,
    pageSize
  });

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const visibleItemCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + visibleItemCount + overscan,
      listState.items.length
    );

    return {
      start: Math.max(0, startIndex - overscan),
      end: endIndex,
      visibleStart: startIndex,
      visibleEnd: Math.min(startIndex + visibleItemCount, listState.items.length)
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, listState.items.length]);

  // Get visible items
  const visibleItems = useMemo(() => {
    return listState.items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      ...item,
      virtualIndex: visibleRange.start + index,
      top: (visibleRange.start + index) * itemHeight
    }));
  }, [listState.items, visibleRange, itemHeight]);

  // Handle scroll
  const handleScroll = useCallback((e) => {
    const newScrollTop = e.target.scrollTop;
    setScrollTop(newScrollTop);

    // Check if we need to load more (approaching end)
    const scrollHeight = e.target.scrollHeight;
    const clientHeight = e.target.clientHeight;
    const scrollPosition = newScrollTop + clientHeight;
    const threshold = 200; // pixels from bottom

    if (scrollPosition >= scrollHeight - threshold && listState.hasMore && !listState.isLoading) {
      listState.trigger();
    }
  }, [listState]);

  // Total height for scrollbar
  const totalHeight = listState.items.length * itemHeight;

  return {
    ...listState,
    visibleItems,
    visibleRange,
    totalHeight,
    handleScroll,
    scrollTop,
    
    // Virtual scroll specific
    itemHeight,
    containerHeight
  };
};

export default useVirtualizedInfiniteScroll;
