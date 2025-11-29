import React, { useState, useEffect } from 'react';
import { FaStar, FaStarHalfAlt, FaFilter, FaCheck } from 'react-icons/fa';

const RatingFilter = ({
  selectedRating,
  onRatingFilter,
  showCounts = true,
  className = ""
}) => {
  const [ratings, setRatings] = useState([
    { value: 5, label: '5 Stars', count: 124 },
    { value: 4, label: '4 Stars & Up', count: 298 },
    { value: 3, label: '3 Stars & Up', count: 456 },
    { value: 2, label: '2 Stars & Up', count: 523 },
    { value: 1, label: '1 Star & Up', count: 567 }
  ]);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(
          <FaStar key={i} className="text-yellow-400 w-4 h-4" />
        );
      } else {
        stars.push(
          <FaStar key={i} className="text-gray-300 w-4 h-4" />
        );
      }
    }
    return stars;
  };

  return (
    <div className={`rating-filter ${className}`}>
      <div className="flex items-center mb-3">
        <FaFilter className="text-gray-500 mr-2" />
        <h3 className="text-sm font-medium text-gray-700">Customer Rating</h3>
      </div>

      <div className="space-y-2">
        {ratings.map((rating) => (
          <label
            key={rating.value}
            className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
          >
            <input
              type="radio"
              name="rating"
              value={rating.value}
              checked={selectedRating === rating.value}
              onChange={() => onRatingFilter(rating.value)}
              className="sr-only"
            />
            
            <div className={`flex items-center justify-center w-5 h-5 border-2 rounded mr-3 transition-colors ${
              selectedRating === rating.value
                ? 'border-blue-600 bg-blue-600'
                : 'border-gray-300'
            }`}>
              {selectedRating === rating.value && (
                <FaCheck className="text-white w-3 h-3" />
              )}
            </div>

            <div className="flex items-center space-x-2 flex-1">
              <div className="flex items-center space-x-1">
                {renderStars(rating.value)}
              </div>
              
              <span className="text-sm text-gray-600">
                {rating.label}
              </span>

              {showCounts && (
                <span className="text-xs text-gray-500 ml-auto">
                  ({rating.count})
                </span>
              )}
            </div>
          </label>
        ))}
      </div>

      {selectedRating && (
        <button
          onClick={() => onRatingFilter(null)}
          className="mt-3 text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          Clear rating filter
        </button>
      )}
    </div>
  );
};

export default RatingFilter;
