import React, { useState, useEffect, useRef, useCallback } from 'react';
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

const FeaturedProducts = ({ products, onAddToCart }) => {
  const { featuredLoading: loading } = useSelector(state => state.product);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoplayRef = useRef(null);
  const carouselRef = useRef(null);

  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  
  // Use passed products or fallback to empty array
  const displayProducts = products || [];
  const slidesToShow = windowWidth >= 1280 ? 4 : windowWidth >= 1024 ? 3 : windowWidth >= 640 ? 2 : 1;
  const maxIndex = Math.max(0, Math.ceil(displayProducts.length / slidesToShow) - 1);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && displayProducts.length > slidesToShow) {
      autoplayRef.current = setInterval(() => {
        setCurrentIndex(prev => prev >= maxIndex ? 0 : prev + 1);
      }, 4000);
    } else {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    }

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [isPlaying, currentIndex, maxIndex, displayProducts.length, slidesToShow]);

  // Touch handlers
  const handleTouchStart = useCallback((e) => {
    setTouchStartX(e.touches[0].clientX);
    setIsPlaying(false);
  }, []);

  const handleTouchMove = useCallback((e) => {
    setTouchEndX(e.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStartX || !touchEndX) return;

    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentIndex < maxIndex) {
      setCurrentIndex(prev => prev + 1);
    } else if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }

    setTouchStartX(0);
    setTouchEndX(0);
    setTimeout(() => setIsPlaying(true), 1000);
  }, [touchStartX, touchEndX, currentIndex, maxIndex]);

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(prev => prev >= maxIndex ? 0 : prev + 1);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning, maxIndex]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(prev => prev <= 0 ? maxIndex : prev - 1);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning, maxIndex]);

  const goToSlide = useCallback((index) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning]);

  const toggleAutoplay = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  if (loading) {
    return (
      <section className="py-20 bg-white dark:bg-gray-900 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 reveal">
            <div className="inline-flex items-center space-x-2 glass bg-blue-100/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full px-6 py-3 mb-6">
              <Star size={16} className="animate-pulse" aria-hidden="true" />
              <span className="text-sm font-medium">Featured Collection</span>
            </div>
            <h2 className="text-4xl lg:text-6xl font-heading font-bold mb-6 text-gray-900 dark:text-white">
              <span className="text-gradient">Trending</span> Now
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              <Truck size={20} className="inline mr-2" aria-hidden="true" />
              Discover premium products with exclusive discounts and lightning-fast delivery
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-2xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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
      className="py-20 bg-white dark:bg-gray-900 relative overflow-hidden"
      aria-label="Featured products"
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 reveal">
          <div className="inline-flex items-center space-x-2 glass bg-blue-100/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full px-6 py-3 mb-6">
            <Star size={16} className="animate-pulse" aria-hidden="true" />
            <span className="text-sm font-medium">Featured Collection</span>
          </div>

          <h2 className="text-4xl lg:text-6xl font-heading font-bold mb-6 text-gray-900 dark:text-white">
            <span className="text-gradient">Trending</span> Now
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            <Truck size={20} className="inline mr-2" aria-hidden="true" />
            Discover premium products with exclusive discounts and lightning-fast delivery
          </p>
        </div>

        {/* Enhanced Carousel Container */}
        <div className="relative">
          {/* Carousel Navigation */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={prevSlide}
                className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 micro-bounce disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={currentIndex === 0}
                aria-label="Previous products"
              >
                <ChevronLeft size={20} aria-hidden="true" />
              </button>
              <button
                onClick={nextSlide}
                className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 micro-bounce disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 micro-bounce focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={isPlaying ? "Pause carousel" : "Play carousel"}
              >
                {isPlaying ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
              </button>
              <div className="flex items-center space-x-2" role="tablist" aria-label="Carousel navigation">
                {Array.from({ length: Math.ceil(displayProducts.length / slidesToShow) }, (_, i) => (
                  <button
                    key={i}
                    className={`w-3 h-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      i === currentIndex 
                        ? 'bg-blue-600 w-8' 
                        : 'bg-gray-300 dark:bg-gray-600 hover:bg-blue-400'
                    }`}
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
              ref={carouselRef}
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
              {displayProducts.map((product, index) => (
                <div
                  key={product._id || product.id}
                  className="carousel-slide flex-shrink-0 px-4"
                  style={{
                    width: `${100 / slidesToShow}%`
                  }}
                >
                  <div className="product-card glass rounded-2xl overflow-hidden group reveal h-full">
                    <div className="relative">
                      <img
                        src={product.images?.[0] || product.image || '/api/placeholder/400/300'}
                        alt={product.name}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        <Percent size={12} className="inline mr-1" aria-hidden="true" />
                        {product.discount || '20%'}
                      </div>
                      <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        <Star size={12} aria-hidden="true" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                        {product.name}
                      </h3>
                      <div className="flex items-center mb-3">
                        <div className="flex text-yellow-400 text-sm" aria-label={`Rating: ${product.rating || 4.8} out of 5 stars`}>
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={16} 
                              className={`${
                                i < Math.floor(product.rating || 4.5) 
                                  ? 'fill-current' 
                                  : i < (product.rating || 4.5) 
                                  ? 'fill-current opacity-50' 
                                  : ''
                              }`}
                              aria-hidden="true"
                            />
                          ))}
                        </div>
                        <span className="text-gray-600 dark:text-gray-400 ml-2 text-sm">
                          ({product.rating || 4.8})
                        </span>
                      </div>
                      <div className="flex items-center mb-4">
                        <span className="text-2xl font-bold text-blue-600">
                          ${product.price?.toFixed(2) || '99.99'}
                        </span>
                        {product.originalPrice && (
                          <span className="text-gray-500 line-through ml-2">
                            ${product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <button
                        className="add-to-cart w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 micro-bounce focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        onClick={() => onAddToCart(product)}
                        aria-label={`Add ${product.name} to cart`}
                      >
                        <ShoppingCart size={16} className="inline mr-2" aria-hidden="true" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-8 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
            <div
              className="h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / (maxIndex + 1)) * 100}%`
              }}
              role="progressbar"
              aria-valuenow={currentIndex + 1}
              aria-valuemin={1}
              aria-valuemax={maxIndex + 1}
              aria-label="Carousel progress"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
