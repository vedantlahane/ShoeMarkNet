import React, { useState, useEffect, useCallback, useRef } from 'react';

// Utils
import { trackEvent } from '../../utils/analytics';

// Constants
const TESTIMONIALS = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Fashion Influencer',
    company: '@sarahstyles',
    image: 'https://images.unsplash.com/photo-1494790108755-2616c75e9e0e?q=80&w=200&auto=format&fit=crop',
    rating: 5,
    content: 'ShoeMarkNet has completely transformed my shoe shopping experience! The quality is exceptional and the customer service is outstanding. I\'ve found my go-to place for premium footwear.',
    location: 'New York, USA',
    verified: true,
    purchaseCount: 12
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Professional Athlete',
    company: 'Nike Sponsored Athlete',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    rating: 5,
    content: 'As a professional athlete, I need shoes that perform at the highest level. ShoeMarkNet delivers exactly that - premium quality, perfect fit, and unmatched durability. Absolutely recommended!',
    location: 'Los Angeles, USA',
    verified: true,
    purchaseCount: 8
  },
  {
    id: 3,
    name: 'Emma Rodriguez',
    role: 'Business Executive',
    company: 'Tech Solutions Inc.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop',
    rating: 5,
    content: 'From boardroom to weekend adventures, ShoeMarkNet has shoes for every occasion. The premium selection and exceptional service make them my first choice for quality footwear.',
    location: 'Toronto, Canada',
    verified: true,
    purchaseCount: 15
  },
  {
    id: 4,
    name: 'David Thompson',
    role: 'Fashion Designer',
    company: 'Thompson Designs',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop',
    rating: 5,
    content: 'The attention to detail and craftsmanship at ShoeMarkNet is remarkable. Every pair tells a story of quality and style. It\'s where fashion meets functionality perfectly.',
    location: 'London, UK',
    verified: true,
    purchaseCount: 20
  },
  {
    id: 5,
    name: 'Lisa Wang',
    role: 'Fitness Coach',
    company: 'FitLife Studios',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
    rating: 5,
    content: 'I recommend ShoeMarkNet to all my clients! Their athletic shoes provide the perfect combination of comfort, support, and style. The customer service is simply amazing.',
    location: 'Sydney, Australia',
    verified: true,
    purchaseCount: 9
  },
  {
    id: 6,
    name: 'James Mitchell',
    role: 'Startup Founder',
    company: 'InnovateNow',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop',
    rating: 5,
    content: 'Fast-paced startup life demands reliable gear. ShoeMarkNet delivers premium shoes that keep up with my demanding schedule. Quality, comfort, and style - they have it all!',
    location: 'Berlin, Germany',
    verified: true,
    purchaseCount: 7
  }
];

const TestimonialCarousel = ({
  autoPlay = true,
  autoPlayInterval = 5000,
  showDots = true,
  showArrows = true,
  className = '',
  variant = 'default' // default, compact, featured
}) => {
  // State management
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isHovered, setIsHovered] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Refs
  const intervalRef = useRef(null);
  const carouselRef = useRef(null);

  // Handle auto-play
  useEffect(() => {
    if (isPlaying && !isHovered && autoPlay) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % TESTIMONIALS.length);
      }, autoPlayInterval);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, isHovered, autoPlay, autoPlayInterval]);

  // Navigation handlers
  const goToSlide = useCallback((index) => {
    if (index !== currentIndex) {
      setAnimationClass('animate-slide-out');
      setTimeout(() => {
        setCurrentIndex(index);
        setAnimationClass('animate-slide-in');
      }, 150);

      trackEvent('testimonial_carousel_navigation', {
        from_index: currentIndex,
        to_index: index,
        navigation_type: 'dots'
      });
    }
  }, [currentIndex]);

  const goToPrevious = useCallback(() => {
    const newIndex = currentIndex === 0 ? TESTIMONIALS.length - 1 : currentIndex - 1;
    setAnimationClass('animate-slide-out-right');
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setAnimationClass('animate-slide-in-left');
    }, 150);

    trackEvent('testimonial_carousel_navigation', {
      from_index: currentIndex,
      to_index: newIndex,
      navigation_type: 'arrow_previous'
    });
  }, [currentIndex]);

  const goToNext = useCallback(() => {
    const newIndex = (currentIndex + 1) % TESTIMONIALS.length;
    setAnimationClass('animate-slide-out-left');
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setAnimationClass('animate-slide-in-right');
    }, 150);

    trackEvent('testimonial_carousel_navigation', {
      from_index: currentIndex,
      to_index: newIndex,
      navigation_type: 'arrow_next'
    });
  }, [currentIndex]);

  // Touch/swipe handlers
  const handleTouchStart = useCallback((e) => {
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }

    setTouchStart(0);
    setTouchEnd(0);
  }, [touchStart, touchEnd, goToNext, goToPrevious]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevious, goToNext, isPlaying]);

  // Render star rating
  const renderRating = (rating) => (
    <div className="flex items-center space-x-1">
      {[...Array(5)].map((_, i) => (
        <i
          key={i}
          className={`fas fa-star text-sm ${
            i < rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
          }`}
        />
      ))}
    </div>
  );

  const currentTestimonial = TESTIMONIALS[currentIndex];

  return (
    <div className={`relative max-w-6xl mx-auto ${className}`}>
      
      {/* Main Carousel Container */}
      <div
        ref={carouselRef}
        className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl overflow-hidden shadow-2xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                <i className="fas fa-quote-left mr-3"></i>
                What Our Customers Say
              </h3>
              <p className="text-blue-100">
                Real feedback from our amazing community
              </p>
            </div>
            
            {/* Play/Pause Control */}
            {autoPlay && (
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-12 h-12 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200"
                title={isPlaying ? 'Pause Carousel' : 'Play Carousel'}
              >
                <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
              </button>
            )}
          </div>
        </div>

        {/* Testimonial Content */}
        <div className="relative p-8 md:p-12 min-h-96">
          
          {/* Navigation Arrows */}
          {showArrows && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-white/30 hover:scale-110 transition-all duration-200 z-10"
                title="Previous Testimonial"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-white/30 hover:scale-110 transition-all duration-200 z-10"
                title="Next Testimonial"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </>
          )}

          {/* Testimonial Card */}
          <div className={`text-center ${animationClass}`}>
            
            {/* Customer Avatar */}
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-white/30 shadow-2xl">
                <img
                  src={currentTestimonial.image}
                  alt={currentTestimonial.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Verified Badge */}
              {currentTestimonial.verified && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                  <i className="fas fa-check text-white text-sm"></i>
                </div>
              )}
            </div>

            {/* Customer Info */}
            <div className="mb-6">
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {currentTestimonial.name}
              </h4>
              <p className="text-blue-600 dark:text-blue-400 font-semibold mb-1">
                {currentTestimonial.role}
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                {currentTestimonial.company}
              </p>
              
              {/* Rating */}
              <div className="flex items-center justify-center space-x-3 mb-3">
                {renderRating(currentTestimonial.rating)}
                <span className="text-yellow-500 font-bold">
                  {currentTestimonial.rating}.0
                </span>
              </div>

              {/* Location & Purchase Count */}
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <i className="fas fa-map-marker-alt mr-1 text-red-500"></i>
                  {currentTestimonial.location}
                </div>
                <div className="flex items-center">
                  <i className="fas fa-shopping-bag mr-1 text-green-500"></i>
                  {currentTestimonial.purchaseCount} purchases
                </div>
              </div>
            </div>

            {/* Testimonial Quote */}
            <div className="max-w-4xl mx-auto mb-8">
              <div className="relative">
                <i className="fas fa-quote-left text-4xl text-blue-500/30 absolute -top-4 -left-4"></i>
                <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed italic px-8">
                  {currentTestimonial.content}
                </p>
                <i className="fas fa-quote-right text-4xl text-blue-500/30 absolute -bottom-4 -right-4"></i>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center space-x-8 text-sm">
              <div className="flex items-center text-green-600 dark:text-green-400">
                <i className="fas fa-shield-check mr-2"></i>
                <span>Verified Purchase</span>
              </div>
              <div className="flex items-center text-blue-600 dark:text-blue-400">
                <i className="fas fa-user-check mr-2"></i>
                <span>Verified Customer</span>
              </div>
              <div className="flex items-center text-purple-600 dark:text-purple-400">
                <i className="fas fa-award mr-2"></i>
                <span>5-Star Review</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dots Navigation */}
        {showDots && (
          <div className="flex justify-center space-x-3 p-6 bg-white/5 backdrop-blur-lg">
            {TESTIMONIALS.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 ${
                  index === currentIndex
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg'
                    : 'bg-gray-400 dark:bg-gray-600 hover:bg-gray-500 dark:hover:bg-gray-500'
                }`}
                title={`Go to testimonial ${index + 1}`}
                aria-label={`Testimonial ${index + 1} of ${TESTIMONIALS.length}`}
              />
            ))}
          </div>
        )}

        {/* Progress Bar */}
        {autoPlay && isPlaying && (
          <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-progress origin-left"></div>
        )}
      </div>

      {/* Testimonial Counter */}
      <div className="text-center mt-6">
        <div className="inline-flex items-center bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl px-6 py-3 shadow-xl">
          <i className="fas fa-users mr-3 text-blue-500"></i>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Testimonial {currentIndex + 1} of {TESTIMONIALS.length}
          </span>
        </div>
      </div>

      {/* Custom Styles */}
    </div>
  );
};

export default TestimonialCarousel;
