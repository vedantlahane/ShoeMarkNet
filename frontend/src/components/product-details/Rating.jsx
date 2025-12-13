// src/components/Rating.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import PropTypes from 'prop-types';

const Rating = ({ 
  totalStars = 5, 
  selectedStars = 0, 
  onRate, 
  size = 24, 
  disabled = false,
  readOnly = false,
  name = 'rating',
  color = 'yellow-400',
  inactiveColor = 'gray-300',
  showLabel = false,
  labelPosition = 'right',
  labelText = 'stars',
  showTooltip = true,
  allowHalf = false,
  showValue = false,
  variant = 'default', // 'default', 'premium', 'minimal', 'large'
  animated = true
}) => {
  const [hoveredStar, setHoveredStar] = useState(0);
  const [animateStars, setAnimateStars] = useState(false);
  const [showTooltipState, setShowTooltipState] = useState(false);
  const [tooltipText, setTooltipText] = useState('');

  // Trigger animation on mount
  useEffect(() => {
    if (animated && selectedStars > 0) {
      setAnimateStars(true);
      setTimeout(() => setAnimateStars(false), 1000);
    }
  }, [selectedStars, animated]);
  
  // Memoize handlers to prevent unnecessary re-renders
  const handleClick = useCallback((star, isHalf = false) => {
    if (onRate && !disabled && !readOnly) {
      const value = allowHalf && isHalf ? star - 0.5 : star;
      onRate(value);
      
      // Trigger animation
      if (animated) {
        setAnimateStars(true);
        setTimeout(() => setAnimateStars(false), 600);
      }
    }
  }, [onRate, disabled, readOnly, allowHalf, animated]);

  const handleMouseEnter = useCallback((star) => {
    if (!disabled && !readOnly) {
      setHoveredStar(star);
      
      if (showTooltip) {
        setTooltipText(getRatingLabel(star));
        setShowTooltipState(true);
      }
    }
  }, [disabled, readOnly, showTooltip]);

  const handleMouseLeave = useCallback(() => {
    if (!disabled && !readOnly) {
      setHoveredStar(0);
      setShowTooltipState(false);
    }
  }, [disabled, readOnly]);

  // Get rating labels for better UX
  const getRatingLabel = useCallback((rating) => {
    const labels = {
      0.5: 'Very Poor',
      1: 'Poor',
      1.5: 'Below Average',
      2: 'Fair',
      2.5: 'Average',
      3: 'Good',
      3.5: 'Very Good',
      4: 'Excellent',
      4.5: 'Outstanding',
      5: 'Perfect'
    };
    return labels[rating] || `${rating} ${labelText}`;
  }, [labelText]);

  // Determine the current display value (hovered or selected)
  const displayValue = hoveredStar || selectedStars;
  
  // Generate label text
  const label = showLabel ? 
    `${displayValue} ${labelText}` : 
    `Rated ${displayValue} out of ${totalStars} stars`;

  // Get variant-specific styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'premium':
        return {
          container: 'bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl p-4 shadow-2xl',
          starSize: size * 1.2,
          spacing: 'space-x-2'
        };
      case 'minimal':
        return {
          container: 'bg-transparent',
          starSize: size * 0.9,
          spacing: 'space-x-1'
        };
      case 'large':
        return {
          container: 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-3xl p-6 shadow-lg',
          starSize: size * 1.5,
          spacing: 'space-x-3'
        };
      default:
        return {
          container: 'bg-white/5 backdrop-blur-lg rounded-xl p-2',
          starSize: size,
          spacing: 'space-x-1'
        };
    }
  };

  const styles = getVariantStyles();

  // Check if star should be filled (supporting half stars)
  const isStarFilled = (starNumber, displayValue) => {
    if (allowHalf) {
      return starNumber <= Math.ceil(displayValue);
    }
    return starNumber <= displayValue;
  };

  // Get fill percentage for half stars
  const getStarFillPercentage = (starNumber, displayValue) => {
    if (!allowHalf) return isStarFilled(starNumber, displayValue) ? 100 : 0;
    
    if (starNumber <= Math.floor(displayValue)) return 100;
    if (starNumber === Math.ceil(displayValue) && displayValue % 1 !== 0) return 50;
    return 0;
  };

  return (
    <div className="relative inline-block">
      <div 
        className={`${styles.container} flex items-center transition-all duration-300`} 
        role="group" 
        aria-label="Rating"
      >
        {/* Star Rating Container */}
        <div className={`flex ${styles.spacing} relative`}>
          {[...Array(totalStars)].map((_, index) => {
            const starNumber = index + 1;
            const fillPercentage = getStarFillPercentage(starNumber, displayValue);
            const isActive = fillPercentage > 0;
            
            return (
              <div key={starNumber} className="relative group">
                {/* Star Button */}
                <button
                  type="button"
                  disabled={disabled || readOnly}
                  className={`relative focus:outline-none focus:ring-4 focus:ring-blue-400/50 rounded-full p-1 transition-all duration-300 transform ${
                    disabled ? 'cursor-not-allowed opacity-50' : 
                    readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
                  } ${isActive && animated && animateStars ? 'animate-star-burst' : ''}`}
                  onClick={() => handleClick(starNumber)}
                  onMouseEnter={() => handleMouseEnter(starNumber)}
                  onMouseLeave={handleMouseLeave}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleClick(starNumber);
                    }
                  }}
                  aria-label={`${starNumber} Star${starNumber === 1 ? '' : 's'}`}
                  aria-checked={isActive}
                  role="radio"
                  aria-setsize={totalStars}
                  aria-posinset={starNumber}
                  name={name}
                  tabIndex={readOnly ? -1 : 0}
                >
                  {/* Background Star */}
                  <FaStar 
                    size={styles.starSize} 
                    className={`text-gray-300 dark:text-gray-600 transition-all duration-300`}
                  />
                  
                  {/* Filled Star Overlay */}
                  <div 
                    className="absolute inset-0 overflow-hidden rounded-full"
                    style={{
                      clipPath: allowHalf && fillPercentage === 50 ? 'inset(0 50% 0 0)' : 'none'
                    }}
                  >
                    <FaStar 
                      size={styles.starSize} 
                      className={`absolute top-1 left-1 transition-all duration-300 ${
                        isActive 
                          ? 'text-transparent bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text' 
                          : 'text-transparent'
                      } ${hoveredStar >= starNumber ? 'drop-shadow-lg' : ''}`}
                      style={{
                        background: isActive 
                          ? 'linear-gradient(45deg, #fbbf24, #f97316, #ef4444)' 
                          : 'transparent',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}
                    />
                  </div>

                  {/* Glow effect for active stars */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 via-orange-500/30 to-red-500/30 rounded-full blur-lg opacity-60 animate-pulse"></div>
                  )}

                  {/* Hover effect */}
                  {hoveredStar >= starNumber && !readOnly && !disabled && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full animate-pulse"></div>
                  )}
                </button>

                {/* Half star click area for allowHalf */}
                {allowHalf && !readOnly && !disabled && (
                  <button
                    type="button"
                    className="absolute left-0 top-0 w-1/2 h-full z-10 opacity-0"
                    onClick={() => handleClick(starNumber, true)}
                    aria-label={`${starNumber - 0.5} and a half stars`}
                  />
                )}
              </div>
            );
          })}

          {/* Tooltip */}
          {showTooltip && showTooltipState && hoveredStar > 0 && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 animate-fade-in">
              <div className="bg-surface backdrop-blur-lg text-theme text-xs font-medium px-3 py-2 rounded-lg shadow-2xl border border-theme-strong">
                {tooltipText}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-surface"></div>
              </div>
            </div>
          )}
        </div>
        
        {/* Rating Label */}
        {showLabel && (
          <span className={`text-sm font-semibold text-gray-700 dark:text-gray-300 transition-all duration-300 ${
            labelPosition === 'right' ? 'ml-3' : 'mr-3 order-first'
          }`}>
            <i className="fas fa-star text-yellow-500 mr-1"></i>
            {label}
          </span>
        )}

        {/* Numeric Value Display */}
        {showValue && (
          <div className={`${labelPosition === 'right' ? 'ml-3' : 'mr-3 order-first'}`}>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold text-lg">
              {displayValue.toFixed(allowHalf ? 1 : 0)}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">/{totalStars}</span>
          </div>
        )}

        {/* Progress Bar (for premium variant) */}
        {variant === 'premium' && (
          <div className="ml-4 flex-1 max-w-24">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(displayValue / totalStars) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Hidden for screen readers to announce the current rating */}
      <span className="sr-only" aria-live="polite">
        {label}
      </span>

      {/* Rating Statistics (for large variant) */}
      {variant === 'large' && selectedStars > 0 && (
        <div className="mt-4 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center space-x-2 text-sm">
              <span className="w-8 text-gray-600 dark:text-gray-400">{star}</span>
              <FaStar className="text-yellow-400 w-4 h-4" />
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 max-w-32">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${star <= selectedStars ? ((selectedStars >= star ? 100 : (selectedStars - (star - 1)) * 100)) : 0}%` 
                  }}
                ></div>
              </div>
              <span className="w-8 text-xs text-gray-500 dark:text-gray-400">
                {star <= selectedStars ? '100' : '0'}%
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Custom Styles */}
    </div>
  );
};

// Enhanced prop type validation
Rating.propTypes = {
  totalStars: PropTypes.number,
  selectedStars: PropTypes.number,
  onRate: PropTypes.func,
  size: PropTypes.number,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  name: PropTypes.string,
  color: PropTypes.string,
  inactiveColor: PropTypes.string,
  showLabel: PropTypes.bool,
  labelPosition: PropTypes.oneOf(['left', 'right']),
  labelText: PropTypes.string,
  showTooltip: PropTypes.bool,
  allowHalf: PropTypes.bool,
  showValue: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'premium', 'minimal', 'large']),
  animated: PropTypes.bool
};

// Default props for better developer experience
Rating.defaultProps = {
  totalStars: 5,
  selectedStars: 0,
  size: 24,
  disabled: false,
  readOnly: false,
  name: 'rating',
  color: 'yellow-400',
  inactiveColor: 'gray-300',
  showLabel: false,
  labelPosition: 'right',
  labelText: 'stars',
  showTooltip: true,
  allowHalf: false,
  showValue: false,
  variant: 'default',
  animated: true
};

export default Rating;
