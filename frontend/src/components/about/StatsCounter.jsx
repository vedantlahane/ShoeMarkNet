import React, { useState, useEffect, useCallback, useRef } from 'react';

// Utils
import { trackEvent } from '../../utils/analytics';

// Custom hook for intersection observer
const useIntersectionObserver = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated) {
        setIsVisible(true);
        setHasAnimated(true);
      }
    }, {
      threshold: 0.3,
      ...options
    });

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [hasAnimated, options]);

  return [elementRef, isVisible];
};

// Custom hook for animated counter
const useAnimatedCounter = (targetValue, isVisible, duration = 2000, startDelay = 0) => {
  const [currentValue, setCurrentValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const startTime = Date.now() + startDelay;
    setIsAnimating(true);

    const animate = () => {
      const now = Date.now();
      const elapsed = Math.max(0, now - startTime);
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out cubic)
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(easedProgress * targetValue);

      setCurrentValue(value);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    const timeoutId = setTimeout(() => {
      requestAnimationFrame(animate);
    }, startDelay);

    return () => clearTimeout(timeoutId);
  }, [targetValue, isVisible, duration, startDelay]);

  return [currentValue, isAnimating];
};

const StatsCounter = ({
  stats = [],
  variant = 'default', // default, compact, featured, minimal
  animationDuration = 2000,
  staggerDelay = 200,
  showIcons = true,
  showLabels = true,
  showPlusSign = true,
  className = ''
}) => {
  // Default stats data
  const defaultStats = [
    {
      id: 'customers',
      icon: 'fas fa-users',
      value: 1000000,
      label: 'Happy Customers',
      suffix: '+',
      prefix: '',
      color: 'from-blue-500 to-cyan-500',
      description: 'Customers worldwide trust our products'
    },
    {
      id: 'products',
      icon: 'fas fa-shoe-prints',
      value: 50000,
      label: 'Products Sold',
      suffix: '+',
      prefix: '',
      color: 'from-green-500 to-emerald-500',
      description: 'Premium footwear delivered globally'
    },
    {
      id: 'years',
      icon: 'fas fa-calendar-alt',
      value: 7,
      label: 'Years of Excellence',
      suffix: '+',
      prefix: '',
      color: 'from-purple-500 to-pink-500',
      description: 'Years of innovation and growth'
    },
    {
      id: 'satisfaction',
      icon: 'fas fa-heart',
      value: 98,
      label: 'Customer Satisfaction',
      suffix: '%',
      prefix: '',
      color: 'from-red-500 to-rose-500',
      description: 'Customer satisfaction rate'
    }
  ];

  // Use provided stats or fallback to default
  const statsData = stats.length > 0 ? stats : defaultStats;
  
  // Intersection observer for animation trigger
  const [containerRef, isVisible] = useIntersectionObserver({ threshold: 0.2 });
  
  // Track animation completion
  const [animationComplete, setAnimationComplete] = useState(false);

  // Handle stat click for analytics
  const handleStatClick = useCallback((stat) => {
    trackEvent('stats_counter_clicked', {
      stat_id: stat.id,
      stat_label: stat.label,
      stat_value: stat.value
    });
  }, []);

  // Check if all animations are complete
  useEffect(() => {
    if (isVisible && !animationComplete) {
      const totalDuration = animationDuration + (statsData.length * staggerDelay);
      const timer = setTimeout(() => {
        setAnimationComplete(true);
        trackEvent('stats_counter_animation_complete', {
          total_stats: statsData.length,
          animation_duration: totalDuration
        });
      }, totalDuration + 500);

      return () => clearTimeout(timer);
    }
  }, [isVisible, animationComplete, animationDuration, statsData.length, staggerDelay]);

  // Format number with commas
  const formatNumber = useCallback((num) => {
    return num.toLocaleString();
  }, []);

  // Render individual stat item
  const StatItem = ({ stat, index, variant }) => {
    const [currentValue, isAnimating] = useAnimatedCounter(
      stat.value, 
      isVisible, 
      animationDuration,
      index * staggerDelay
    );

    // Compact variant
    if (variant === 'compact') {
      return (
        <div 
          className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
          onClick={() => handleStatClick(stat)}
        >
          <div className="flex items-center space-x-3">
            {showIcons && (
              <div className={`w-10 h-10 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <i className={`${stat.icon} text-white text-lg`}></i>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {stat.prefix}{formatNumber(currentValue)}{stat.suffix}
              </div>
              {showLabels && (
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium truncate">
                  {stat.label}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Minimal variant
    if (variant === 'minimal') {
      return (
        <div className="text-center">
          <div className="text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            {stat.prefix}{formatNumber(currentValue)}{stat.suffix}
          </div>
          {showLabels && (
            <div className="text-gray-600 dark:text-gray-400 font-medium">
              {stat.label}
            </div>
          )}
        </div>
      );
    }

    // Default and featured variants
    return (
      <div 
        className={`relative bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-3xl hover:scale-105 cursor-pointer group ${
          variant === 'featured' ? 'ring-2 ring-blue-500/50' : ''
        }`}
        onClick={() => handleStatClick(stat)}
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transform translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transform -translate-x-12 translate-y-12"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-8 text-center">
          
          {/* Icon */}
          {showIcons && (
            <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200 shadow-xl`}>
              <i className={`${stat.icon} text-white text-2xl`}></i>
            </div>
          )}

          {/* Counter */}
          <div className="mb-4">
            <div className={`text-5xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2 relative`}>
              {stat.prefix}{formatNumber(currentValue)}{stat.suffix}
              
              {/* Animation indicator */}
              {isAnimating && (
                <div className="absolute -top-2 -right-2">
                  <div className="w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
                </div>
              )}
            </div>
            
            {showLabels && (
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {stat.label}
              </h3>
            )}
          </div>

          {/* Description */}
          {stat.description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              {stat.description}
            </p>
          )}

          {/* Progress Bar */}
          <div className="mt-6 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-1000 ease-out`}
              style={{ 
                width: isVisible ? '100%' : '0%',
                transitionDelay: `${index * staggerDelay}ms`
              }}
            ></div>
          </div>

          {/* Hover Effect */}
          <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none rounded-3xl`}></div>
        </div>

        {/* Pulse Effect */}
        {isAnimating && (
          <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} rounded-3xl animate-ping opacity-20`}></div>
        )}
      </div>
    );
  };

  return (
    <div ref={containerRef} className={`${className}`}>
      
      {/* Header (only for default and featured variants) */}
      {(variant === 'default' || variant === 'featured') && (
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            <i className="fas fa-chart-line mr-4"></i>
            Our Impact in Numbers
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Real achievements that showcase our commitment to excellence and customer satisfaction
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className={`grid gap-6 ${
        variant === 'compact' ? 'grid-cols-1 sm:grid-cols-2' :
        variant === 'minimal' ? 'grid-cols-2 md:grid-cols-4' :
        'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      }`}>
        {statsData.map((stat, index) => (
          <div
            key={stat.id}
            className={`${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <StatItem stat={stat} index={index} variant={variant} />
          </div>
        ))}
      </div>

      {/* Achievement Summary (only for featured variant) */}
      {variant === 'featured' && animationComplete && (
        <div className="mt-16 animate-fade-in">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">
              <i className="fas fa-trophy mr-3"></i>
              Celebrating Excellence Together
            </h3>
            <p className="text-white/90 max-w-2xl mx-auto">
              These numbers represent more than statistics—they reflect the trust our customers place in us 
              and our unwavering commitment to delivering exceptional footwear experiences.
            </p>
          </div>
        </div>
      )}

      {/* Interactive Elements (only for default and featured variants) */}
      {(variant === 'default' || variant === 'featured') && isVisible && (
        <div className="mt-12 text-center animate-fade-in" style={{ animationDelay: '1s' }}>
          <div className="inline-flex items-center bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl px-6 py-3 shadow-xl">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Live Statistics • Updated in Real-time
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        /* Counter animation enhancement */
        @keyframes counter-glow {
          0%, 100% { text-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
          50% { text-shadow: 0 0 20px rgba(59, 130, 246, 0.8); }
        }
        
        /* Progress bar animation */
        @keyframes progress-fill {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .text-5xl {
            font-size: 2.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default StatsCounter;
