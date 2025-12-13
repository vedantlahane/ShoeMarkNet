import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack,
  Maximize2,
  Grid3X3,
  List,
  Shuffle
} from 'lucide-react';
import useReducedMotion from '../../../hooks/useReducedMotion';

const Carousel = ({
  items = [],
  children,
  
  // Layout options
  slidesToShow = 4,
  slidesToScroll = 1,
  gap = 16,
  
  // Responsive breakpoints
  responsive = {
    320: { slidesToShow: 1, slidesToScroll: 1 },
    640: { slidesToShow: 2, slidesToScroll: 1 },
    1024: { slidesToShow: 3, slidesToScroll: 1 },
    1280: { slidesToShow: 4, slidesToScroll: 1 },
  },
  
  // Auto-play options
  autoPlay = false,
  autoPlayInterval = 4000,
  pauseOnHover = true,
  
  // Navigation options
  showArrows = true,
  showDots = true,
  showProgress = true,
  showPlayPause = false,
  showViewToggle = false,
  
  // Visual options
  variant = 'glass', // glass, solid, minimal, premium
  animation = 'slide', // slide, fade, zoom, flip
  
  // Callbacks
  onSlideChange,
  onItemClick,
  renderItem,
  
  // Additional props
  className = '',
  itemClassName = '',
  infinite = true,
  centerMode = false,
  
  // Touch/Swipe
  touchEnabled = true,
  swipeThreshold = 50,
  
  // Accessibility
  ariaLabel = 'Carousel',
  
  // Advanced options
  lazy = false,
  preloadRange = 2,
  virtualScrolling = false,
  
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [isRevealed, setIsRevealed] = useState(prefersReducedMotion);

  // Responsive calculations
  const getResponsiveConfig = useCallback(() => {
    if (typeof window === 'undefined') {
      return { slidesToShow, slidesToScroll };
    }

    const width = window.innerWidth;
    let config = { slidesToShow, slidesToScroll };
    
    Object.keys(responsive)
      .map(Number)
      .sort((a, b) => b - a) // Sort descending
      .forEach(breakpoint => {
        if (width >= breakpoint) {
          config = { ...config, ...responsive[breakpoint] };
          return false; // Break out of forEach
        }
      });
    
    return config;
  }, [slidesToShow, slidesToScroll, responsive]);
  
  // State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay && !prefersReducedMotion);
  const [isAnimating, setIsAnimating] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [config, setConfig] = useState(getResponsiveConfig());
  const [loadedImages, setLoadedImages] = useState(new Set());
  
  // Refs
  const carouselRef = useRef(null);
  const containerRef = useRef(null);
  const dotsRef = useRef(null);
  const progressRef = useRef(null);
  const autoPlayRef = useRef(null);
  const observerRef = useRef(null);
  const animationTimeoutRef = useRef(null);
  
  // Memoized values
  const totalItems = useMemo(() => 
    children ? React.Children.count(children) : items.length
  , [children, items.length]);
  
  const maxIndex = useMemo(() => 
    Math.max(0, Math.ceil(totalItems / config.slidesToScroll) - 1)
  , [totalItems, config.slidesToScroll]);
  
  const canGoPrev = useMemo(() => currentIndex > 0, [currentIndex]);
  const canGoNext = useMemo(() => currentIndex < maxIndex, [currentIndex, maxIndex]);

  const transitionSettings = useMemo(() => {
    switch (animation) {
      case 'fade':
        return { duration: 450, easing: 'ease-out' };
      case 'zoom':
        return { duration: 500, easing: 'cubic-bezier(0.32, 0.72, 0.23, 0.99)' };
      case 'flip':
        return { duration: 520, easing: 'cubic-bezier(0.19, 1, 0.22, 1)' };
      default:
        return { duration: 600, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' };
    }
  }, [animation]);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) {
      return;
    }

    const translateX = -(currentIndex * (100 / config.slidesToShow));
    const duration = prefersReducedMotion ? 0 : transitionSettings.duration;
    const easing = transitionSettings.easing;
    carousel.style.transition = duration ? `transform ${duration}ms ${easing}` : 'none';
    carousel.style.transform = `translateX(${translateX}%)`;
  }, [currentIndex, config.slidesToShow, prefersReducedMotion, transitionSettings]);
  
  // Responsive handler
  useEffect(() => {
    const handleResize = () => {
      setConfig(getResponsiveConfig());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getResponsiveConfig]);
  
  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && totalItems > config.slidesToShow) {
      autoPlayRef.current = setInterval(() => {
        goToNext();
      }, autoPlayInterval);
    }
    
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isPlaying, totalItems, config.slidesToShow, autoPlayInterval, goToNext]);

  useEffect(() => {
    if (prefersReducedMotion && isPlaying) {
      setIsPlaying(false);
    }
  }, [prefersReducedMotion, isPlaying]);

  useEffect(() => () => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
  }, []);
  
  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy) return;
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.dataset.src;
            if (src) {
              img.src = src;
              img.removeAttribute('data-src');
              observerRef.current?.unobserve(img);
            }
          }
        });
      },
      { rootMargin: `${preloadRange * 100}px` }
    );
    
    return () => observerRef.current?.disconnect();
  }, [lazy, preloadRange]);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    if (variant === 'premium') {
      container.classList.add('animate-pulse-slow');
    } else {
      container.classList.remove('animate-pulse-slow');
    }

    if (prefersReducedMotion) {
      setIsRevealed(true);
      return undefined;
    }

    setIsRevealed(false);
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry?.isIntersecting) {
        setIsRevealed(true);
        observer.disconnect();
      }
    }, { threshold: 0.15 });

    observer.observe(container);

    return () => observer.disconnect();
  }, [variant, prefersReducedMotion]);
  
  // Navigation functions
  const goToSlide = useCallback((index, force = false) => {
    if (isAnimating && !force) return;

    const nextIndex = Math.max(0, Math.min(index, maxIndex));
    if (nextIndex === currentIndex) return;

    if (!prefersReducedMotion) {
      setIsAnimating(true);
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      animationTimeoutRef.current = window.setTimeout(() => {
        setIsAnimating(false);
      }, transitionSettings.duration + 50);
    }

    setCurrentIndex(nextIndex);
    onSlideChange?.(nextIndex);
  }, [currentIndex, maxIndex, isAnimating, prefersReducedMotion, onSlideChange, transitionSettings]);
  
  const goToPrev = useCallback(() => {
    if (infinite && currentIndex === 0) {
      goToSlide(maxIndex);
    } else {
      goToSlide(Math.max(0, currentIndex - config.slidesToScroll));
    }
  }, [currentIndex, maxIndex, config.slidesToScroll, infinite, goToSlide]);
  
  const goToNext = useCallback(() => {
    if (infinite && currentIndex >= maxIndex) {
      goToSlide(0);
    } else {
      goToSlide(Math.min(maxIndex, currentIndex + config.slidesToScroll));
    }
  }, [currentIndex, maxIndex, config.slidesToScroll, infinite, goToSlide]);
  
  // Touch handlers
  const handleTouchStart = useCallback((e) => {
    if (!touchEnabled) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, [touchEnabled]);
  
  const handleTouchMove = useCallback((e) => {
    if (!touchEnabled) return;
    setTouchEnd(e.targetTouches[0].clientX);
  }, [touchEnabled]);
  
  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > swipeThreshold;
    const isRightSwipe = distance < -swipeThreshold;
    
    if (isLeftSwipe && canGoNext) {
      goToNext();
    } else if (isRightSwipe && canGoPrev) {
      goToPrev();
    }
  }, [touchStart, touchEnd, swipeThreshold, canGoNext, canGoPrev, goToNext, goToPrev]);
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goToPrev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNext();
          break;
        case ' ':
          e.preventDefault();
          setIsPlaying(!isPlaying);
          break;
        case 'Home':
          e.preventDefault();
          goToSlide(0);
          break;
        case 'End':
          e.preventDefault();
          goToSlide(maxIndex);
          break;
      }
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('keydown', handleKeyDown);
      return () => container.removeEventListener('keydown', handleKeyDown);
    }
  }, [goToPrev, goToNext, goToSlide, maxIndex, isPlaying]);
  
  // Progress bar animation
  useEffect(() => {
    const progress = progressRef.current;
    if (progress) {
      const percentage = ((currentIndex + 1) / (maxIndex + 1)) * 100;
      progress.style.transition = prefersReducedMotion ? 'none' : 'width 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
      progress.style.width = `${percentage}%`;
    }
  }, [currentIndex, maxIndex, prefersReducedMotion]);
  
  // Auto-pause on hover
  const handleMouseEnter = useCallback(() => {
    if (pauseOnHover && autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  }, [pauseOnHover]);
  
  const handleMouseLeave = useCallback(() => {
    if (pauseOnHover && isPlaying) {
      autoPlayRef.current = setInterval(() => {
        goToNext();
      }, autoPlayInterval);
    }
  }, [pauseOnHover, isPlaying, goToNext, autoPlayInterval]);
  
  // Render functions
  const renderItems = () => {
    if (children) {
      return React.Children.map(children, (child, index) => (
        <div
          key={index}
          className={`carousel-item flex-shrink-0 ${itemClassName}`}
          style={{ 
            width: `${viewMode === 'list' ? 100 : 100 / config.slidesToShow}%`,
            paddingRight: `${gap / 2}px`,
            paddingLeft: `${gap / 2}px`
          }}
          onClick={() => onItemClick?.(index)}
        >
          {child}
        </div>
      ));
    }
    
    return items.map((item, index) => (
      <div
        key={item.id || index}
        className={`carousel-item flex-shrink-0 ${itemClassName}`}
        style={{ 
            width: `${viewMode === 'list' ? 100 : 100 / config.slidesToShow}%`,
          paddingRight: `${gap / 2}px`,
          paddingLeft: `${gap / 2}px`
        }}
        onClick={() => onItemClick?.(item, index)}
      >
        {renderItem ? renderItem(item, index) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            Item {index + 1}
          </div>
        )}
      </div>
    ));
  };
  
  // Variant styles
  const getVariantClasses = () => {
    switch (variant) {
      case 'glass':
        return 'glass border border-white/20 dark:border-gray-700/20';
      case 'solid':
        return 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl';
      case 'minimal':
        return 'bg-transparent';
      case 'premium':
        return 'card-premium shadow-2xl hover-lift';
      default:
        return 'glass border border-white/20 dark:border-gray-700/20';
    }
  };
  
  if (totalItems === 0) {
    return (
      <div className={`flex items-center justify-center p-12 rounded-3xl ${getVariantClasses()} ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mb-4 mx-auto flex items-center justify-center">
            <Grid3X3 size={32} className="text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">No items to display</p>
        </div>
      </div>
    );
  }
  
  return (
    <div
      ref={containerRef}
      className={`relative w-full transition-all duration-700 ${
        isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      } ${className}`}
      tabIndex={0}
      role="region"
      aria-label={ariaLabel}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      
      {/* Main Carousel Container */}
      <div className={`relative rounded-3xl overflow-hidden ${getVariantClasses()}`}>
        
        {/* Header */}
        {(showPlayPause || showViewToggle) && (
          <div className="flex items-center justify-between p-6 border-b border-white/20 dark:border-gray-700/20">
            <div className="flex items-center space-x-4">
              {showPlayPause && (
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 glass rounded-xl hover:glass transition-all duration-200 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  title={isPlaying ? 'Pause autoplay' : 'Start autoplay'}
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
              )}
            </div>
            
            {showViewToggle && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-blue-500 text-white' 
                      : 'glass text-gray-600 dark:text-gray-400'
                  }`}
                  title="Grid view"
                >
                  <Grid3X3 size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-blue-500 text-white' 
                      : 'glass text-gray-600 dark:text-gray-400'
                  }`}
                  title="List view"
                >
                  <List size={16} />
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Carousel Content */}
        <div className="relative overflow-hidden">
          <div
            ref={carouselRef}
            className="flex"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {renderItems()}
          </div>
          
          {/* Navigation Arrows */}
          {showArrows && totalItems > config.slidesToShow && (
            <>
              <button
                onClick={goToPrev}
                disabled={!infinite && !canGoPrev}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 glass rounded-2xl flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-white hover:bg-blue-500 dark:hover:bg-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl micro-bounce"
                aria-label="Previous slide"
              >
                <ChevronLeft size={24} />
              </button>
              
              <button
                onClick={goToNext}
                disabled={!infinite && !canGoNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 glass rounded-2xl flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-white hover:bg-blue-500 dark:hover:bg-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl micro-bounce"
                aria-label="Next slide"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>
        
        {/* Progress Bar */}
        {showProgress && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 dark:bg-gray-700/20">
            <div
              ref={progressRef}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            />
          </div>
        )}
      </div>
      
      {/* Dots Navigation */}
      {showDots && totalItems > config.slidesToShow && (
        <div
          ref={dotsRef}
          className="flex items-center justify-center space-x-3 mt-6"
        >
          {Array.from({ length: maxIndex + 1 }, (_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`carousel-dot transition-all duration-300 hover:scale-125 ${
                index === currentIndex ? 'active' : ''
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
      
      {/* Additional Controls */}
      {(showPlayPause || showArrows) && (
        <div className="flex items-center justify-center space-x-2 mt-4">
          <button
            onClick={() => goToSlide(0)}
            disabled={currentIndex === 0}
            className="p-2 glass rounded-xl text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 disabled:opacity-50"
            title="First slide"
          >
            <SkipBack size={16} />
          </button>
          
          <button
            onClick={() => goToSlide(maxIndex)}
            disabled={currentIndex === maxIndex}
            className="p-2 glass rounded-xl text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 disabled:opacity-50"
            title="Last slide"
          >
            <SkipForward size={16} />
          </button>
          
          {items.length > 0 && (
            <button
              onClick={() => {
                const shuffled = [...items].sort(() => Math.random() - 0.5);
                // This would require a callback to update parent state
                console.log('Shuffle functionality would be implemented by parent');
              }}
              className="p-2 glass rounded-xl text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
              title="Shuffle items"
            >
              <Shuffle size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Carousel;
