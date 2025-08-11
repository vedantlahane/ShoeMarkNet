import { useState, useEffect, useCallback } from 'react';
import useScrollUtils from './useScrollUtils';

/**
 * Hook for scroll-to-top button functionality
 * @param {Object} options - Configuration options
 * @returns {Object} Button state and handlers
 */
const useScrollToTopButton = (options = {}) => {
  const {
    showThreshold = 300,
    hideDelay = 2000,
    behavior = 'smooth',
    position = { bottom: 24, right: 24 }
  } = options;

  const { scrollY, isScrolling, scrollToPosition } = useScrollUtils();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Show/hide button based on scroll position
  useEffect(() => {
    const shouldShow = scrollY > showThreshold;
    
    if (shouldShow !== isVisible) {
      setIsAnimating(true);
      setIsVisible(shouldShow);
      
      // Reset animation state
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }
  }, [scrollY, showThreshold, isVisible]);

  // Handle scroll to top
  const handleScrollToTop = useCallback((customBehavior) => {
    scrollToPosition(0, customBehavior || behavior);
    
    // Track analytics
    if (window.gtag) {
      window.gtag('event', 'scroll_to_top_clicked', {
        scroll_position: scrollY
      });
    }
  }, [scrollToPosition, behavior, scrollY]);

  // Button styles
  const buttonStyles = {
    position: 'fixed',
    bottom: `${position.bottom}px`,
    right: `${position.right}px`,
    zIndex: 1000,
    opacity: isVisible ? 1 : 0,
    visibility: isVisible ? 'visible' : 'hidden',
    transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.8)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    pointerEvents: isVisible ? 'auto' : 'none'
  };

  return {
    isVisible,
    isAnimating,
    isScrolling,
    scrollY,
    handleScrollToTop,
    buttonStyles
  };
};

export default useScrollToTopButton;
