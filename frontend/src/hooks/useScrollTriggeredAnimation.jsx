import { useState, useEffect, useRef } from 'react';
import useIntersectionObserver from './useIntersectionObserver';

/**
 * Hook for complex scroll-triggered animations with multiple stages
 * @param {Object} options - Animation configuration
 * @returns {Object} Animation state and controls
 */
const useScrollTriggeredAnimation = (options = {}) => {
  const {
    threshold = [0, 0.25, 0.5, 0.75, 1],
    animationStages = ['fadeIn', 'slideUp', 'scaleIn', 'complete'],
    triggerOnce = true,
    delay = 0
  } = options;

  const [currentStage, setCurrentStage] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const stageTimeouts = useRef([]);

  const { ref, intersectionRatio, isIntersecting } = useIntersectionObserver({
    threshold,
    triggerOnce: false, // We handle triggerOnce logic manually
    delay
  });

  useEffect(() => {
    if (!isIntersecting) return;

    // Determine animation stage based on intersection ratio
    const stageIndex = Math.floor(intersectionRatio * animationStages.length);
    const clampedStage = Math.min(stageIndex, animationStages.length - 1);

    if (clampedStage > currentStage || (!triggerOnce && clampedStage !== currentStage)) {
      setCurrentStage(clampedStage);
      
      // Mark as complete when fully visible
      if (intersectionRatio >= 0.99 && !isComplete) {
        setIsComplete(true);
      }
    }

    return () => {
      stageTimeouts.current.forEach(timeout => clearTimeout(timeout));
    };
  }, [intersectionRatio, isIntersecting, currentStage, animationStages.length, triggerOnce, isComplete]);

  // Get current animation classes
  const getAnimationClasses = () => {
    const classes = [];
    for (let i = 0; i <= currentStage; i++) {
      classes.push(`animate-${animationStages[i]}`);
    }
    return classes.join(' ');
  };

  // Get current stage name
  const getCurrentStageName = () => {
    return animationStages[currentStage] || 'initial';
  };

  // Calculate progress percentage
  const getProgress = () => {
    return Math.round(intersectionRatio * 100);
  };

  return {
    ref,
    currentStage,
    isComplete,
    intersectionRatio,
    isIntersecting,
    animationClasses: getAnimationClasses(),
    stageName: getCurrentStageName(),
    progress: getProgress(),
    isVisible: intersectionRatio > 0
  };
};

export default useScrollTriggeredAnimation;
