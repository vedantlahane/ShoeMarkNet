import React, { useState, useCallback } from 'react';
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
  labelText = 'stars'
}) => {
  const [hoveredStar, setHoveredStar] = useState(0);
  
  // Memoize handlers to prevent unnecessary re-renders
  const handleClick = useCallback((star) => {
    if (onRate && !disabled && !readOnly) {
      onRate(star);
    }
  }, [onRate, disabled, readOnly]);

  const handleMouseEnter = useCallback((star) => {
    if (!disabled && !readOnly) {
      setHoveredStar(star);
    }
  }, [disabled, readOnly]);

  const handleMouseLeave = useCallback(() => {
    if (!disabled && !readOnly) {
      setHoveredStar(0);
    }
  }, [disabled, readOnly]);

  // Determine the current display value (hovered or selected)
  const displayValue = hoveredStar || selectedStars;
  
  // Generate label text
  const label = showLabel ? 
    `${displayValue} ${labelText}` : 
    `Rated ${displayValue} out of ${totalStars} stars`;

  return (
    <div className="flex items-center" role="group" aria-label="Rating">
      <div className="flex">
        {[...Array(totalStars)].map((_, index) => {
          const starNumber = index + 1;
          const isActive = starNumber <= displayValue;
          
          return (
            <button
              key={starNumber}
              type="button"
              disabled={disabled || readOnly}
              className={`focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-full p-1 transition-colors duration-150 ${
                isActive ? `text-${color}` : `text-${inactiveColor}`
              } ${disabled ? 'cursor-not-allowed opacity-60' : ''} 
              ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
              onClick={() => handleClick(starNumber)}
              onMouseEnter={() => handleMouseEnter(starNumber)}
              onMouseLeave={handleMouseLeave}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
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
              <FaStar size={size} className={isActive ? 'animate-pulse-once' : ''} />
            </button>
          );
        })}
      </div>
      
      {showLabel && (
        <span className={`text-sm font-medium ml-2 ${labelPosition === 'right' ? 'ml-2' : 'mr-2 order-first'}`}>
          {label}
        </span>
      )}
      
      {/* Hidden for screen readers to announce the current rating */}
      <span className="sr-only" aria-live="polite">
        {label}
      </span>
    </div>
  );
};

// Add prop type validation
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
  labelText: PropTypes.string
};

export default Rating;
