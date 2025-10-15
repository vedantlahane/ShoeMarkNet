import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { 
  Star, 
  Truck, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  ShoppingCart, 
  Percent 
} from 'lucide-react';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';

const AUTO_PLAY_INTERVAL = 4000;

const FeaturedProducts = ({ products, onAddToCart }) => {
  const { featuredLoading: loading } = useSelector(state => state.product);
  const [currentIndex, setCurrentIndex] = useState(0);
  const prefersReducedMotion = usePrefersReducedMotion();
  const enableAnimations = !prefersReducedMotion;
  const [isPlaying, setIsPlaying] = useState(enableAnimations);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoplayRef = useRef(null);
  const [hoveredProduct, setHoveredProduct] = useState(null);

  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const pulseClass = enableAnimations ? 'animate-pulse-slow' : '';
  const floatClass = enableAnimations ? 'animate-bounce' : '';
  const shimmerClass = enableAnimations ? 'animate-gradient' : '';
  const navigationButtonClass = `flex h-11 w-11 items-center justify-center rounded-full border border-theme-strong bg-card text-muted-theme transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-40 ${
    enableAnimations ? 'hover:-translate-y-0.5 hover:border-primary hover:text-theme hover:shadow-[0_8px_20px_-12px_rgba(15,23,42,0.9)]' : 'hover:border-primary hover:text-theme'
  }`;
  const dotBaseClass = 'w-3 h-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary';
  const dotActiveClass = enableAnimations
    ? 'w-8 bg-primary shadow-[0_0_16px_rgba(37,99,235,0.4)]'
    : 'w-8 bg-primary';
  const dotInactiveClass = 'bg-muted-theme hover:bg-primary';
  
  // Use passed products or fallback to empty array
  const displayProducts = useMemo(() => products || [], [products]);
  const slidesToShow = useMemo(() => {
    if (windowWidth >= 1280) return 4;
    if (windowWidth >= 1024) return 3;
    if (windowWidth >= 640) return 2;
    return 1;
  }, [windowWidth]);
  const totalSlides = useMemo(() => {
    if (!slidesToShow) return 0;
    return Math.ceil(displayProducts.length / slidesToShow);
  }, [displayProducts.length, slidesToShow]);
  const maxIndex = Math.max(0, totalSlides - 1);

  const formatCurrency = useCallback((value) => {
    const numeric = typeof value === 'number' ? value : parseFloat(value ?? '');
    if (Number.isNaN(numeric)) return null;
    return numeric.toFixed(2);
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!enableAnimations) {
      setIsPlaying(false);
    }
  }, [enableAnimations]);

  // Auto-play functionality
  useEffect(() => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }

    if (!enableAnimations || !isPlaying || displayProducts.length <= slidesToShow) {
      return undefined;
    }

    autoplayRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
    }, AUTO_PLAY_INTERVAL);

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
    };
  }, [enableAnimations, isPlaying, maxIndex, displayProducts.length, slidesToShow]);

  // Clamp index when layout changes
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [currentIndex, maxIndex]);

  // Touch handlers
  const handleTouchStart = useCallback((e) => {
    setTouchStartX(e.touches[0].clientX);
    if (enableAnimations) {
      setIsPlaying(false);
    }
  }, [enableAnimations]);

  const handleTouchMove = useCallback((e) => {
    setTouchEndX(e.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
  if (touchStartX === null || touchEndX === null) return;

    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentIndex < maxIndex) {
      setCurrentIndex(prev => prev + 1);
    } else if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }

  setTouchStartX(null);
  setTouchEndX(null);
    if (enableAnimations) {
      setTimeout(() => setIsPlaying(true), 1000);
    }
  }, [touchStartX, touchEndX, currentIndex, maxIndex, enableAnimations]);

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    const wasPlaying = isPlaying;
    if (enableAnimations && wasPlaying) {
      setIsPlaying(false);
    }
    setCurrentIndex(prev => prev >= maxIndex ? 0 : prev + 1);
    setTimeout(() => {
      setIsTransitioning(false);
      if (enableAnimations && wasPlaying) {
        setIsPlaying(true);
      }
    }, 500);
  }, [enableAnimations, isPlaying, isTransitioning, maxIndex]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    const wasPlaying = isPlaying;
    if (enableAnimations && wasPlaying) {
      setIsPlaying(false);
    }
    setCurrentIndex(prev => prev <= 0 ? maxIndex : prev - 1);
    setTimeout(() => {
      setIsTransitioning(false);
      if (enableAnimations && wasPlaying) {
        setIsPlaying(true);
      }
    }, 500);
  }, [enableAnimations, isPlaying, isTransitioning, maxIndex]);

  const goToSlide = useCallback((index) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    const wasPlaying = enableAnimations && isPlaying;
    if (wasPlaying) {
      setIsPlaying(false);
    }
    setCurrentIndex(index);
    setTimeout(() => {
      setIsTransitioning(false);
      if (wasPlaying) {
        setIsPlaying(true);
      }
    }, 500);
  }, [enableAnimations, isPlaying, isTransitioning]);

  const toggleAutoplay = useCallback(() => {
    if (!enableAnimations) return;
    setIsPlaying(prev => !prev);
  }, [enableAnimations]);

  const handleCardPointerMove = useCallback((event, productId) => {
    if (!enableAnimations) {
      return;
    }

    setHoveredProduct(prev => (prev === productId ? prev : productId));
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return;
    }

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--hover-x', `${x}%`);
    card.style.setProperty('--hover-y', `${y}%`);
  }, [enableAnimations]);

  const handleCardLeave = useCallback((event) => {
    setHoveredProduct(null);
    if (!enableAnimations) {
      return;
    }

    const card = event.currentTarget;
    card.style.removeProperty('--hover-x');
    card.style.removeProperty('--hover-y');
  }, [enableAnimations]);

  const handleCardFocus = useCallback((event, productId) => {
    setHoveredProduct(productId);
    if (!enableAnimations) {
      return;
    }

    const card = event.currentTarget;
    card.style.setProperty('--hover-x', '50%');
    card.style.setProperty('--hover-y', '50%');
  }, [enableAnimations]);

  if (loading) {
    return (
      <section className="py-16 bg-theme text-theme">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-theme-strong bg-card px-5 py-2 text-xs font-semibold uppercase tracking-wide text-muted-theme">
              <Star size={14} className="animate-pulse" aria-hidden="true" />
              Featured Collection
            </div>
            <h2 className="mt-6 text-3xl font-semibold text-theme md:text-4xl">Trending Picks</h2>
            <p className="mt-3 text-sm text-muted-theme md:text-base">
              <Truck size={18} className="mr-2 inline" aria-hidden="true" />
              Curating the latest drops while we load your recommendations
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="space-y-3 rounded-2xl border border-theme-strong bg-surface p-5">
                <div className="aspect-square w-full rounded-xl bg-muted-theme/70"></div>
                <div className="h-3 w-3/4 rounded bg-muted-theme/70"></div>
                <div className="h-3 w-2/5 rounded bg-muted-theme/70"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="featured"
      className="relative overflow-hidden bg-theme py-16 text-theme md:py-20"
      aria-label="Featured products"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className={`absolute -top-24 left-1/4 h-64 w-64 rotate-12 rounded-full bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 blur-3xl ${pulseClass}`}></div>
        <div className={`absolute bottom-[-6rem] right-1/5 h-72 w-72 rounded-full bg-gradient-to-br from-purple-500/15 via-pink-500/10 to-rose-500/10 blur-3xl ${pulseClass}`} style={{ animationDelay: '1.2s' }}></div>
        <div className={`absolute top-1/3 right-10 h-16 w-16 rounded-3xl border border-theme-strong/40 bg-card/60 backdrop-blur ${floatClass}`} style={{ animationDelay: '0.6s' }}></div>
        <div className={`absolute bottom-1/4 left-10 h-10 w-10 rounded-full border border-theme-strong/60 bg-surface/50 ${floatClass}`} style={{ animationDelay: '1.8s' }}></div>
        <div className="absolute inset-0 mix-blend-soft-light">
          <div className={`absolute left-1/2 top-12 h-[1px] w-40 -translate-x-1/2 bg-gradient-to-r from-transparent via-muted-theme/40 to-transparent ${shimmerClass}`} aria-hidden="true" />
        </div>
      </div>
  <div className="mx-auto w-full  px-4 sm:px-5 lg:px-6">
        {/* Section Header */}
        <div className="mb-14 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-theme-strong bg-card px-5 py-2 text-xs font-semibold uppercase tracking-wide text-muted-theme">
            <Star size={14} className={enableAnimations ? 'animate-pulse' : ''} aria-hidden="true" />
            Featured collection
          </div>

          <h2 className="mt-6 text-3xl font-semibold text-theme md:text-4xl">
            Curated{' '}
            <span
              className={`bg-gradient-to-r from-theme via-primary to-secondary bg-clip-text text-transparent ${shimmerClass}`}
            >
              Highlights
              Highlights
            </span>
          </h2>
          <p className="mt-3 text-sm text-muted-theme md:text-base">
            <Truck size={18} className="mr-2 inline" aria-hidden="true" />
            Discover the pieces people keep coming back for, refreshed every few minutes.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs uppercase tracking-widest text-muted-theme">
            <div className="inline-flex items-center gap-2 rounded-full border border-theme-strong bg-surface px-4 py-2">
              <span className="text-muted-strong">Slide</span>
              <span className="font-semibold text-theme">{String(Math.min(currentIndex + 1, totalSlides || 1)).padStart(2, '0')}</span>
              <span className="text-muted-strong">/ {String(totalSlides || 1).padStart(2, '0')}</span>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-theme-strong bg-surface px-4 py-2 sm:inline-flex">
              <ShoppingCart size={14} aria-hidden="true" />
              <span>{displayProducts.length} curated picks</span>
            </div>
          </div>
        </div>

        {/* Enhanced Carousel Container */}
        <div className="relative">
          {/* Carousel Navigation */}
          <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={prevSlide}
                className={navigationButtonClass}
                disabled={currentIndex === 0}
                aria-label="Previous products"
              >
                <ChevronLeft size={20} aria-hidden="true" />
              </button>
              <button
                onClick={nextSlide}
                className={navigationButtonClass}
                disabled={currentIndex >= maxIndex}
                aria-label="Next products"
              >
                <ChevronRight size={20} aria-hidden="true" />
              </button>
            </div>

            {/* Carousel Controls */}
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleAutoplay}
                className={navigationButtonClass}
                aria-label={isPlaying ? "Pause carousel" : "Play carousel"}
              >
                {isPlaying ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
              </button>
              <div className="flex items-center space-x-2" role="tablist" aria-label="Carousel navigation">
                {Array.from({ length: totalSlides || 0 }, (_, i) => (
                  <button
                    key={i}
                    className={`${dotBaseClass} ${i === currentIndex ? dotActiveClass : dotInactiveClass}`}
                    onClick={() => goToSlide(i)}
                    role="tab"
                    aria-selected={i === currentIndex}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Carousel Wrapper */}
          <div className="carousel-wrapper overflow-hidden">
            <div
              className="carousel-container flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translate3d(-${currentIndex * (100 / slidesToShow)}%, 0, 0)`
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              role="tabpanel"
              aria-live="polite"
            >
              {displayProducts.map((product, index) => {
                const discountValue = typeof product.discountPercentage === 'number'
                  ? `${Math.round(product.discountPercentage)}% off`
                  : typeof product.discount === 'number'
                    ? `${Math.round(product.discount)}% off`
                    : product.discount || null;
                const currentPrice = formatCurrency(product.price ?? product.currentPrice);
                const originalPrice = formatCurrency(product.originalPrice);
                const productId = product._id || product.id || index;
                const isActiveCard = enableAnimations && hoveredProduct === productId;

                return (
                  <div
                    key={productId}
                    className="carousel-slide flex-shrink-0 px-3 sm:px-4"
                    style={{
                      width: `${100 / slidesToShow}%`
                    }}
                  >
                    <div
                      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border ${
                        isActiveCard ? 'border-primary/60 theme-shadow-strong' : 'border-theme-strong theme-shadow-soft'
                      } bg-card transform-gpu transition-all duration-300 hover:-translate-y-1 hover:theme-shadow-strong focus-within:-translate-y-1 focus-within:theme-shadow-strong`}
                      onPointerMove={(event) => handleCardPointerMove(event, productId)}
                      onPointerLeave={handleCardLeave}
                      onFocus={(event) => handleCardFocus(event, productId)}
                      onBlur={handleCardLeave}
                      role="group"
                    >
                      <div
                        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
                        style={{
                          background:
                            'radial-gradient(220px circle at var(--hover-x, 50%) var(--hover-y, 50%), rgba(148,163,184,0.25), transparent 65%)',
                          mixBlendMode: 'screen',
                          opacity: isActiveCard ? 1 : undefined
                        }}
                        aria-hidden="true"
                      />
                      <div className="relative">
                        <img
                          src={product.images?.[0] || product.image || '/api/placeholder/400/300'}
                          alt={product.name}
                          className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading={index < slidesToShow ? 'eager' : 'lazy'}
                          decoding="async"
                        />
                        {discountValue && (
                          <div className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-200">
                            <Percent size={12} aria-hidden="true" />
                            {discountValue}
                          </div>
                        )}
                        <div className="pointer-events-none absolute inset-0 bg-theme/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      </div>
                      <div className="flex flex-1 flex-col gap-4 p-6">
                        <div>
                          <h3 className="text-lg font-semibold text-theme line-clamp-2">
                            {product.name}
                          </h3>
                          <div className="mt-2 flex items-center text-xs text-muted-theme" aria-label={`Rating: ${product.rating || 4.8} out of 5`}>
                            <span className="flex items-center gap-1 text-amber-300">
                              <Star size={14} aria-hidden="true" />
                              {Number(product.rating || 4.8).toFixed(1)}
                            </span>
                            {product.numReviews ? (
                              <span className="ml-2">• {product.numReviews} reviews</span>
                            ) : null}
                          </div>
                        </div>
                        <div className="flex items-baseline gap-2 text-sm">
                          <span className="text-xl font-semibold text-theme">
                            {currentPrice ? `$${currentPrice}` : '—'}
                          </span>
                          {originalPrice && (
                            <span className="text-xs text-muted-strong line-through">
                              ${originalPrice}
                            </span>
                          )}
                        </div>
                        <button
                          className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-white/90 py-3 text-sm font-semibold text-slate-950 transition-colors duration-200 hover:bg-white"
                          onClick={() => onAddToCart(product)}
                          aria-label={`Add ${product.name} to cart`}
                        >
                          <ShoppingCart size={16} aria-hidden="true" />
                          Add to cart
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-8 h-1 w-full rounded-full bg-muted-theme">
            <div
              className="h-1 rounded-full bg-primary transition-all duration-300"
              style={{
                width: `${totalSlides ? ((currentIndex + 1) / totalSlides) * 100 : 0}%`
              }}
              role="progressbar"
              aria-valuenow={currentIndex + 1}
              aria-valuemin={1}
              aria-valuemax={totalSlides || 1}
              aria-label="Carousel progress"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
