import { useEffect, useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook for scroll to top functionality
 * @param {Object} options - Configuration options
 * @param {boolean} options.auto - Auto scroll to top on route change (default: true)
 * @param {string} options.behavior - Scroll behavior: 'smooth' | 'instant' (default: 'smooth')
 * @param {number} options.top - Target scroll position (default: 0)
 * @param {number} options.delay - Delay before scrolling in ms (default: 0)
 * @param {boolean} options.enabled - Enable/disable the hook (default: true)
 * @returns {Object} Hook utilities
 */
const useScrollToTop = (options = {}) => {
  const {
    auto = true,
    behavior = 'smooth',
    top = 0,
    delay = 0,
    enabled = true
  } = options;

  const location = useLocation();
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.pageYOffset);
    };

    if (enabled) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [enabled]);

  // Manual scroll to top function
  const scrollToTop = useCallback((customOptions = {}) => {
    if (!enabled) return;

    const scrollOptions = {
      top: customOptions.top ?? top,
      behavior: customOptions.behavior ?? behavior
    };

    const executeScroll = () => {
      setIsScrolling(true);
      
      try {
        window.scrollTo(scrollOptions);
        
        // Track completion for smooth scrolling
        if (scrollOptions.behavior === 'smooth') {
          const checkScrollComplete = () => {
            if (window.pageYOffset <= scrollOptions.top + 10) {
              setIsScrolling(false);
            } else {
              requestAnimationFrame(checkScrollComplete);
            }
          };
          requestAnimationFrame(checkScrollComplete);
        } else {
          setIsScrolling(false);
        }
      } catch (error) {
        console.warn('Scroll to top failed:', error);
        setIsScrolling(false);
      }
    };

    if (delay > 0) {
      setTimeout(executeScroll, delay);
    } else {
      executeScroll();
    }
  }, [enabled, top, behavior, delay]);

  // Auto scroll to top on route change
  useEffect(() => {
    if (auto && enabled) {
      scrollToTop();
    }
  }, [location.pathname, auto, enabled, scrollToTop]);

  // Check if user is at top
  const isAtTop = scrollPosition <= 10;

  // Check if user can scroll up
  const canScrollUp = scrollPosition > 0;

  return {
    scrollToTop,
    isScrolling,
    scrollPosition,
    isAtTop,
    canScrollUp
  };
};

export default useScrollToTop;
