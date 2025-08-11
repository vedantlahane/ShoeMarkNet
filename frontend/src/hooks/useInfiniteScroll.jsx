import { useEffect, useRef, useState, useCallback } from 'react';

// Utils
import { trackEvent } from '../utils/analytics';

/**
 * Advanced Infinite Scroll Hook with comprehensive features
 * @param {Object} options - Configuration options
 * @param {Function} options.onLoadMore - Function to call when more content should be loaded
 * @param {boolean} options.hasMore - Whether there is more content to load
 * @param {boolean} options.isLoading - Whether content is currently being loaded
 * @param {number} options.threshold - Distance from bottom to trigger load (default: 100)
 * @param {string} options.rootMargin - Root margin for intersection observer (default: '0px')
 * @param {number} options.debounceMs - Debounce time for load more calls (default: 300)
 * @param {boolean} options.enabled - Whether infinite scroll is enabled (default: true)
 * @param {Element} options.root - Root element for intersection observer (default: null - viewport)
 * @param {Function} options.onError - Error handler function
 * @returns {Object} Hook utilities and state
 */
const useInfiniteScroll = (options = {}) => {
  const {
    onLoadMore = () => {},
    hasMore = true,
    isLoading = false,
    threshold = 100,
    rootMargin = '0px 0px 100px 0px',
    debounceMs = 300,
    enabled = true,
    root = null,
    onError = null
  } = options;

  // State management
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [loadCount, setLoadCount] = useState(0);
  const [error, setError] = useState(null);

  // Refs
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);
  const debounceTimeoutRef = useRef(null);
  const loadingRef = useRef(false);

  // Debounced load more function
  const debouncedLoadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore || !enabled) return;

    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        loadingRef.current = true;
        setLoadCount(prev => prev + 1);
        
        await onLoadMore();
        
        trackEvent('infinite_scroll_load_more', {
          load_count: loadCount + 1,
          has_more: hasMore,
          threshold
        });

        setError(null);
      } catch (err) {
        const errorMessage = err.message || 'Failed to load more content';
        setError(errorMessage);
        
        if (onError) {
          onError(err);
        }
        
        trackEvent('infinite_scroll_error', {
          error: errorMessage,
          load_count: loadCount
        });
      } finally {
        loadingRef.current = false;
      }
    }, debounceMs);
  }, [onLoadMore, hasMore, enabled, debounceMs, loadCount, onError, threshold]);

  // Intersection observer callback
  const handleIntersection = useCallback((entries) => {
    const [entry] = entries;
    setIsIntersecting(entry.isIntersecting);
    
    if (entry.isIntersecting && hasMore && !isLoading && enabled) {
      debouncedLoadMore();
    }
  }, [hasMore, isLoading, enabled, debouncedLoadMore]);

  // Initialize intersection observer
  useEffect(() => {
    if (!enabled || !sentinelRef.current) return;

    // Clean up existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    try {
      observerRef.current = new IntersectionObserver(handleIntersection, {
        root,
        rootMargin,
        threshold: 0.1
      });

      observerRef.current.observe(sentinelRef.current);
    } catch (error) {
      console.warn('IntersectionObserver not supported:', error);
      setError('Infinite scroll not supported in this browser');
    }

    // Cleanup function
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [enabled, root, rootMargin, handleIntersection]);

  // Reset function
  const reset = useCallback(() => {
    setLoadCount(0);
    setError(null);
    setIsIntersecting(false);
    loadingRef.current = false;
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  }, []);

  // Manual trigger function
  const trigger = useCallback(() => {
    if (hasMore && !isLoading && enabled) {
      debouncedLoadMore();
    }
  }, [hasMore, isLoading, enabled, debouncedLoadMore]);

  return {
    // Ref to attach to sentinel element
    sentinelRef,
    
    // State
    isIntersecting,
    loadCount,
    error,
    
    // Methods
    reset,
    trigger,
    
    // Computed values
    canLoadMore: hasMore && !isLoading && enabled,
    isLoadingMore: isLoading || loadingRef.current
  };
};

export default useInfiniteScroll;
