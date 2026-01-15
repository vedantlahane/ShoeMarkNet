import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  Star,
  Truck,
  ShoppingCart,
  Percent
} from 'lucide-react';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';

const SCROLL_SPEED = 60; // pixels per second
const CARD_WIDTH = 420; // base card width in pixels
const CARD_GAP = 34; // gap between cards

const FeaturedProducts = ({ products, onAddToCart }) => {
  const { featuredLoading: loading } = useSelector(state => state.product);
  const prefersReducedMotion = usePrefersReducedMotion();
  const enableAnimations = !prefersReducedMotion;
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const scrollRef = useRef(null);
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const lastTimeRef = useRef(null);
  const isPausedRef = useRef(false);
  const [isPaused, setIsPaused] = useState(false);

  const displayProducts = useMemo(() => products || [], [products]);

  // Triple the products array for seamless scrolling
  const scrollProducts = useMemo(() => {
    if (displayProducts.length === 0) return [];
    return [...displayProducts, ...displayProducts, ...displayProducts];
  }, [displayProducts]);

  const formatCurrency = useCallback((value) => {
    const numeric = typeof value === 'number' ? value : parseFloat(value ?? '');
    if (Number.isNaN(numeric)) return null;
    return numeric.toFixed(2);
  }, []);

  // Calculate scale based on card position
  const updateCardScales = useCallback(() => {
    if (!containerRef.current || !scrollRef.current) return;

    const container = containerRef.current;
    const cards = scrollRef.current.querySelectorAll('.carousel-card');
    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;

    cards.forEach((card) => {
      const cardRect = card.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const distance = Math.abs(containerCenter - cardCenter);
      const maxDistance = containerRect.width / 2;

      // Calculate scale (1 at center, 0.8 at edges)
      const scale = Math.max(0.8, 1 - (distance / maxDistance) * 0.2);

      // Calculate opacity (1 at center, 0.3 at edges)
      const opacity = Math.max(0.3, 1 - (distance / maxDistance) * 0.7);

      card.style.transform = `scale(${scale})`;
      card.style.opacity = opacity;
    });
  }, []);

  // Continuous scroll animation
  useEffect(() => {
    if (!enableAnimations || !scrollRef.current || displayProducts.length === 0) {
      return;
    }

    const totalWidth = displayProducts.length * (CARD_WIDTH + CARD_GAP);

    const animate = (currentTime) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = currentTime;
      }

      const deltaTime = currentTime - lastTimeRef.current;

      if (!isPausedRef.current) {
        const deltaScroll = (deltaTime / 1000) * SCROLL_SPEED;
        scrollPositionRef.current = (scrollPositionRef.current + deltaScroll) % totalWidth;
      }

      if (scrollRef.current) {
        scrollRef.current.style.transform = `translateX(-${scrollPositionRef.current}px)`;
        updateCardScales();
      }

      lastTimeRef.current = currentTime;
      animationRef.current = requestAnimationFrame(animate);
    };

    if (scrollRef.current) {
      scrollRef.current.style.transform = `translateX(-${scrollPositionRef.current}px)`;
      updateCardScales();
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      lastTimeRef.current = null;
      scrollPositionRef.current = 0;
    };
  }, [enableAnimations, displayProducts.length, updateCardScales]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const handleCardPointerMove = useCallback((event, productId) => {
    if (!enableAnimations) return;

    setHoveredProduct(productId);
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--hover-x', `${x}%`);
    card.style.setProperty('--hover-y', `${y}%`);
  }, [enableAnimations]);

  const handleCardLeave = useCallback((event) => {
    setHoveredProduct(null);
    if (!enableAnimations) return;

    const card = event.currentTarget;
    card.style.removeProperty('--hover-x');
    card.style.removeProperty('--hover-y');
  }, [enableAnimations]);

  if (loading) {
    return (
      <section className="py-12 bg-slate-50 dark:bg-slate-900/50">

        <div className="container-app">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
              <Star size={12} className="animate-pulse" aria-hidden="true" />
              Featured Collection
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-white md:text-3xl">Trending Picks</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              <Truck size={16} className="mr-1.5 inline" aria-hidden="true" />
              Curating the latest drops while we load your recommendations
            </p>
          </div>
          <div className="flex gap-4 overflow-hidden">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex-shrink-0 w-72 space-y-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
                <div className="aspect-square w-full rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                <div className="h-2.5 w-3/4 rounded bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                <div className="h-2.5 w-2/5 rounded bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
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
      className="relative overflow-hidden bg-gradient-to-b from-white/50 to-transparent dark:from-slate-950/70 dark:to-transparent py-12 md:py-16"
      aria-label="Featured products"
    >

      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className={`absolute -top-24 left-1/4 h-64 w-64 rotate-12 rounded-full bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 blur-3xl ${enableAnimations ? 'animate-pulse' : ''}`}></div>
        <div className={`absolute bottom-[-6rem] right-1/5 h-72 w-72 rounded-full bg-gradient-to-br from-purple-500/15 via-pink-500/10 to-rose-500/10 blur-3xl ${enableAnimations ? 'animate-pulse' : ''}`}></div>
      </div>

      {/* Carousel Masks */}
      <div className="pointer-events-none absolute left-0 top-0 z-20 h-full w-32 bg-gradient-to-r from-white/85 via-white/7 to-transparent dark:from-slate-950/85 dark:via-slate-950/7 md:w-48" />
      <div className="pointer-events-none absolute right-0 top-0 z-20 h-full w-32 bg-gradient-to-l from-white/85 via-white/7 to-transparent dark:from-slate-950/85 dark:via-slate-950/7 md:w-48" />

      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className={`absolute -top-24 left-1/4 h-64 w-64 rotate-12 rounded-full bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 blur-3xl ${enableAnimations ? 'animate-pulse' : ''}`}></div>
        <div className={`absolute bottom-[-6rem] right-1/5 h-72 w-72 rounded-full bg-gradient-to-br from-purple-500/15 via-pink-500/10 to-rose-500/10 blur-3xl ${enableAnimations ? 'animate-pulse' : ''}`}></div>
      </div>

      {/* Section Header */}
      <div className="relative z-10 mb-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
          <Star size={12} className={enableAnimations ? 'animate-pulse' : ''} aria-hidden="true" />
          Featured collection
        </div>

        <h2 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-white md:text-3xl">
          Curated{' '}
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Highlights
          </span>
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          <Truck size={16} className="mr-1.5 inline" aria-hidden="true" />
          Discover the pieces people keep coming back for
        </p>
      </div>

      {/* Continuous Carousel */}
      <div
        ref={containerRef}
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Fade masks */}
        <div className="pointer-events-none absolute left-0 top-0 z-20 h-full w-24 md:w-40 carousel-mask-left" />
        <div className="pointer-events-none absolute right-0 top-0 z-20 h-full w-24 md:w-40 carousel-mask-right" />

        {/* Carousel Container */}
        <div className="overflow-hidden">
          <div
            ref={scrollRef}
            className="flex gap-4 py-3"
            style={{ width: 'max-content', willChange: 'transform' }}
          >
            {scrollProducts.map((product, index) => {
              const discountValue = typeof product.discountPercentage === 'number' && product.discountPercentage > 0
                ? `${Math.round(product.discountPercentage)}% off`
                : typeof product.discount === 'number' && product.discount > 0
                  ? `${Math.round(product.discount)}% off`
                  : null;
              const currentPrice = formatCurrency(product.price ?? product.currentPrice);
              const originalPrice = formatCurrency(product.originalPrice);
              const productId = `${product._id || product.id || index}-${index}`;
              const isActiveCard = enableAnimations && hoveredProduct === productId;

              return (
                <div
                  key={productId}
                  className="flex-shrink-0 transition-all duration-300 ease-out transform-gpu"
                  style={{ width: `${CARD_WIDTH}px` }}
                >
                  <div
                    className={`group relative flex h-full flex-col overflow-hidden rounded-xl border ${isActiveCard ? 'border-blue-500/60 shadow-xl' : 'border-slate-200 dark:border-slate-700 shadow-sm'
                      } bg-white dark:bg-slate-800 transform-gpu transition-all duration-300`}
                    onPointerMove={(event) => handleCardPointerMove(event, productId)}
                    onPointerLeave={handleCardLeave}
                    onFocus={(event) => handleCardPointerMove(event, productId)}
                    onBlur={handleCardLeave}
                    role="group"
                  >
                    <div
                      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{
                        background:
                          'radial-gradient(220px circle at var(--hover-x, 50%) var(--hover-y, 50%), rgba(59,130,246,0.15), transparent 65%)',
                        mixBlendMode: 'screen',
                        opacity: isActiveCard ? 1 : undefined
                      }}
                      aria-hidden="true"
                    />
                    <div className="relative">
                      <img
                        src={product.images?.[0] || product.image || '/api/placeholder/400/300'}
                        alt={product.name}
                        className="h-72 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                      />
                      {discountValue && (
                        <div className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full border border-green-500/30 bg-green-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-green-900 dark:text-green-100">
                          <Percent size={12} aria-hidden="true" />
                          {discountValue}
                        </div>
                      )}
                      <div className="pointer-events-none absolute inset-0 bg-gray-900/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </div>
                    <div className="flex flex-1 flex-col gap-4 p-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                          {product.name}
                        </h3>
                        <div className="mt-2 flex items-center text-xs text-gray-600 dark:text-gray-400" aria-label={`Rating: ${product.rating || 4.8} out of 5`}>
                          <span className="flex items-center gap-1 text-amber-400">
                            <Star size={14} fill="currentColor" aria-hidden="true" />
                            {Number(product.rating || 4.8).toFixed(1)}
                          </span>
                          {product.numReviews ? (
                            <span className="ml-2">• {product.numReviews} reviews</span>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2 text-sm">
                        <span className="text-xl font-semibold text-gray-900 dark:text-white">
                          {currentPrice ? `$${currentPrice}` : '—'}
                        </span>
                        {originalPrice && currentPrice && originalPrice !== currentPrice && parseFloat(originalPrice) > parseFloat(currentPrice) && (
                          <span className="text-xs text-gray-500 dark:text-gray-500 line-through">
                            ${originalPrice}
                          </span>
                        )}
                      </div>
                      <button
                        className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3 text-sm font-semibold transition-all duration-200 hover:bg-gray-800 dark:hover:bg-gray-100 hover:shadow-md"
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
      </div>

    </section>
  );
};

export default FeaturedProducts;