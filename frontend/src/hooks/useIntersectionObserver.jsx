import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Advanced Intersection Observer Hook with comprehensive features
 * @param {Object} options - Configuration options
 * @param {number|Array} options.threshold - Threshold(s) for intersection (default: 0.1)
 * @param {string} options.rootMargin - Root margin for intersection (default: '0px')
 * @param {Element} options.root - Root element for intersection (default: null - viewport)
 * @param {boolean} options.triggerOnce - Only trigger once when element enters (default: false)
 * @param {boolean} options.enabled - Enable/disable the observer (default: true)
 * @param {Function} options.onIntersect - Callback when intersection changes
 * @param {number} options.delay - Delay before triggering callback (default: 0)
 * @returns {Object} Hook utilities and state
 */
const useIntersectionObserver = (options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    root = null,
    triggerOnce = false,
    enabled = true,
    onIntersect = null,
    delay = 0
  } = options;

  // State management
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [intersectionRatio, setIntersectionRatio] = useState(0);
  const [hasIntersected, setHasIntersected] = useState(false);
  const [entry, setEntry] = useState(null);

  // Refs
  const elementRef = useRef(null);
  const observerRef = useRef(null);
  const timeoutRef = useRef(null);

  // Intersection callback with delay support
  const handleIntersection = useCallback((entries) => {
    const [intersectionEntry] = entries;
    
    const executeCallback = () => {
      setEntry(intersectionEntry);
      setIsIntersecting(intersectionEntry.isIntersecting);
      setIntersectionRatio(intersectionEntry.intersectionRatio);
      
      if (intersectionEntry.isIntersecting) {
        setHasIntersected(true);
      }

      // Execute custom callback
      if (onIntersect) {
        onIntersect(intersectionEntry, {
          isIntersecting: intersectionEntry.isIntersecting,
          intersectionRatio: intersectionEntry.intersectionRatio,
          hasIntersected: intersectionEntry.isIntersecting || hasIntersected
        });
      }

      // Disconnect if triggerOnce and intersecting
      if (triggerOnce && intersectionEntry.isIntersecting && observerRef.current) {
        observerRef.current.disconnect();
      }
    };

    // Apply delay if specified
    if (delay > 0) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(executeCallback, delay);
    } else {
      executeCallback();
    }
  }, [onIntersect, triggerOnce, delay, hasIntersected]);

  // Create and manage observer
  useEffect(() => {
    if (!enabled || !elementRef.current) return;

    // Clean up existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    try {
      observerRef.current = new IntersectionObserver(handleIntersection, {
        threshold,
        rootMargin,
        root
      });

      observerRef.current.observe(elementRef.current);
    } catch (error) {
      console.warn('IntersectionObserver not supported or failed to initialize:', error);
    }

    // Cleanup function
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, threshold, rootMargin, root, handleIntersection]);

  // Manual trigger function
  const trigger = useCallback(() => {
    if (elementRef.current && observerRef.current) {
      // Force a check by disconnecting and reconnecting
      observerRef.current.disconnect();
      observerRef.current.observe(elementRef.current);
    }
  }, []);

  // Reset function
  const reset = useCallback(() => {
    setIsIntersecting(false);
    setIntersectionRatio(0);
    setHasIntersected(false);
    setEntry(null);
  }, []);

  return {
    // Ref to attach to target element
    ref: elementRef,
    
    // State
    isIntersecting,
    intersectionRatio,
    hasIntersected,
    entry,
    
    // Methods
    trigger,
    reset,
    
    // Computed values
    isVisible: isIntersecting,
    isFullyVisible: intersectionRatio >= 0.99,
    isPartiallyVisible: intersectionRatio > 0 && intersectionRatio < 1,
    visibilityPercentage: Math.round(intersectionRatio * 100)
  };
};

export default useIntersectionObserver;
