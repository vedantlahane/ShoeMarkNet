import { useRef, useState, useEffect, useCallback } from 'react';

/**
 * Hook for observing multiple elements with staggered animations
 * @param {Object} options - Configuration options
 * @param {number} options.staggerDelay - Delay between each element animation
 * @param {number} options.threshold - Intersection threshold
 * @param {boolean} options.triggerOnce - Only trigger once per element
 * @returns {Object} Hook utilities for list animations
 */
const useIntersectionObserverList = (options = {}) => {
  const {
    staggerDelay = 100,
    threshold = 0.1,
    triggerOnce = true,
    rootMargin = '0px'
  } = options;

  const [visibleItems, setVisibleItems] = useState(new Set());
  const [animatedItems, setAnimatedItems] = useState(new Set());
  const observerRef = useRef(null);
  const elementsRef = useRef(new Map());

  // Intersection callback for list items
  const handleIntersection = useCallback((entries) => {
    entries.forEach((entry) => {
      const index = parseInt(entry.target.dataset.index, 10);
      
      if (entry.isIntersecting) {
        setVisibleItems(prev => new Set([...prev, index]));
        
        // Apply staggered animation
        setTimeout(() => {
          setAnimatedItems(prev => new Set([...prev, index]));
        }, index * staggerDelay);

        // Disconnect if triggerOnce
        if (triggerOnce && observerRef.current) {
          observerRef.current.unobserve(entry.target);
        }
      } else if (!triggerOnce) {
        setVisibleItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(index);
          return newSet;
        });
        setAnimatedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(index);
          return newSet;
        });
      }
    });
  }, [staggerDelay, triggerOnce]);

  // Initialize observer
  useEffect(() => {
    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, threshold, rootMargin]);

  // Register element for observation
  const registerElement = useCallback((element, index) => {
    if (element && observerRef.current) {
      element.dataset.index = index.toString();
      elementsRef.current.set(index, element);
      observerRef.current.observe(element);
    }
  }, []);

  // Unregister element
  const unregisterElement = useCallback((index) => {
    const element = elementsRef.current.get(index);
    if (element && observerRef.current) {
      observerRef.current.unobserve(element);
      elementsRef.current.delete(index);
    }
  }, []);

  // Check if item should be animated
  const isItemAnimated = useCallback((index) => {
    return animatedItems.has(index);
  }, [animatedItems]);

  // Check if item is visible
  const isItemVisible = useCallback((index) => {
    return visibleItems.has(index);
  }, [visibleItems]);

  // Get animation delay for item
  const getAnimationDelay = useCallback((index) => {
    return `${index * staggerDelay}ms`;
  }, [staggerDelay]);

  return {
    registerElement,
    unregisterElement,
    isItemAnimated,
    isItemVisible,
    getAnimationDelay,
    visibleItems,
    animatedItems
  };
};

export default useIntersectionObserverList;
