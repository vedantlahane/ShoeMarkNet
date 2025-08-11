import { useState, useEffect } from 'react';
import useIntersectionObserver from './useIntersectionObserver';

/**
 * Specialized hook for intersection-triggered animations
 * @param {Object} options - Animation configuration
 * @param {string} options.animationClass - CSS class to apply when intersecting
 * @param {number} options.delay - Delay before applying animation
 * @param {boolean} options.triggerOnce - Only animate once
 * @param {number} options.threshold - Intersection threshold
 * @returns {Object} Animation state and ref
 */
const useIntersectionAnimation = (options = {}) => {
  const {
    animationClass = 'animate-fade-in',
    delay = 0,
    triggerOnce = true,
    threshold = 0.1,
    staggerDelay = 0,
    resetOnExit = false
  } = options;

  const [isAnimated, setIsAnimated] = useState(false);
  const [animationClasses, setAnimationClasses] = useState('opacity-0');

  const { ref, isIntersecting, hasIntersected } = useIntersectionObserver({
    threshold,
    triggerOnce,
    delay
  });

  useEffect(() => {
    if (isIntersecting && !isAnimated) {
      const animateTimeout = setTimeout(() => {
        setAnimationClasses(animationClass);
        setIsAnimated(true);
      }, staggerDelay);

      return () => clearTimeout(animateTimeout);
    } else if (!isIntersecting && resetOnExit && isAnimated) {
      setAnimationClasses('opacity-0');
      setIsAnimated(false);
    }
  }, [isIntersecting, isAnimated, animationClass, staggerDelay, resetOnExit]);

  return {
    ref,
    isAnimated,
    animationClasses,
    isIntersecting,
    hasIntersected,
    shouldAnimate: isIntersecting || (triggerOnce && hasIntersected)
  };
};

export default useIntersectionAnimation;
