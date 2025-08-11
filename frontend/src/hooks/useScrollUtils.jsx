import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Comprehensive scroll utilities hook
 * @param {Object} options - Configuration options
 * @returns {Object} Scroll utilities and state
 */
const useScrollUtils = (options = {}) => {
  const {
    threshold = 100,
    throttleMs = 16,
    enableDirection = true,
    enableProgress = true,
    enableVisibility = true
  } = options;

  const [scrollY, setScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState('up');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  const lastScrollY = useRef(0);
  const scrollTimer = useRef(null);
  const ticking = useRef(false);

  // Throttled scroll handler
  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(() => {
        const currentScrollY = window.pageYOffset;
        
        // Update scroll position
        setScrollY(currentScrollY);
        
        // Track if user has scrolled
        if (!hasScrolled && currentScrollY > 10) {
          setHasScrolled(true);
        }
        
        // Calculate scroll direction
        if (enableDirection) {
          if (Math.abs(currentScrollY - lastScrollY.current) > threshold) {
            setScrollDirection(currentScrollY > lastScrollY.current ? 'down' : 'up');
            lastScrollY.current = currentScrollY;
          }
        }
        
        // Calculate scroll progress
        if (enableProgress) {
          const windowHeight = window.innerHeight;
          const documentHeight = document.documentElement.scrollHeight;
          const maxScroll = documentHeight - windowHeight;
          const progress = maxScroll > 0 ? (currentScrollY / maxScroll) * 100 : 0;
          setScrollProgress(Math.min(100, Math.max(0, progress)));
        }
        
        // Set scrolling state
        setIsScrolling(true);
        clearTimeout(scrollTimer.current);
        scrollTimer.current = setTimeout(() => {
          setIsScrolling(false);
        }, 150);
        
        ticking.current = false;
      });
      ticking.current = true;
    }
  }, [threshold, enableDirection, enableProgress, hasScrolled]);

  // Throttled scroll event listener
  useEffect(() => {
    let timeoutId;
    
    const throttledHandler = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, throttleMs);
    };

    window.addEventListener('scroll', throttledHandler, { passive: true });
    
    // Initial call
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', throttledHandler);
      clearTimeout(timeoutId);
      clearTimeout(scrollTimer.current);
    };
  }, [handleScroll, throttleMs]);

  // Scroll to element
  const scrollToElement = useCallback((elementId, options = {}) => {
    const element = document.getElementById(elementId);
    if (element) {
      const offsetTop = options.offset || 0;
      const targetPosition = element.offsetTop - offsetTop;
      
      window.scrollTo({
        top: targetPosition,
        behavior: options.behavior || 'smooth'
      });
    }
  }, []);

  // Smooth scroll to position
  const scrollToPosition = useCallback((position, behavior = 'smooth') => {
    window.scrollTo({
      top: position,
      behavior
    });
  }, []);

  // Check if element is in viewport
  const isElementInViewport = useCallback((element, margin = 0) => {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
    
    return (
      rect.top >= -margin &&
      rect.left >= -margin &&
      rect.bottom <= windowHeight + margin &&
      rect.right <= windowWidth + margin
    );
  }, []);

  return {
    // State
    scrollY,
    scrollDirection,
    scrollProgress,
    isScrolling,
    hasScrolled,
    
    // Computed values
    isAtTop: scrollY <= 10,
    isAtBottom: scrollProgress >= 95,
    
    // Methods
    scrollToElement,
    scrollToPosition,
    isElementInViewport
  };
};

export default useScrollUtils;
