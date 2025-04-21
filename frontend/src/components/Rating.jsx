import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';

const Rating = ({ totalStars = 5, selectedStars = 0, onRate }) => {
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleClick = (star) => {
    if (onRate) {
      onRate(star);
    }
  };

  const handleMouseEnter = (star) => {
    setHoveredStar(star);
  };

  const handleMouseLeave = () => {
    setHoveredStar(0);
  };

  return (
    <div className="flex flex-row">
      {[...Array(totalStars)].map((_, index) => {
        const starNumber = index + 1;
        return (
          <button
            key={starNumber}
            type="button"
            className={`focus:outline-none ${
              starNumber <= (hoveredStar || selectedStars) ? 'text-yellow-400' : 'text-gray-300'
            }`}
            onClick={() => handleClick(starNumber)}
            onMouseEnter={() => handleMouseEnter(starNumber)}
            onMouseLeave={handleMouseLeave}
            aria-label={`${starNumber} Star`}
          >
            <FaStar size={24} />
          </button>
        );
      })}
    </div>
  );
};

export default Rating;
