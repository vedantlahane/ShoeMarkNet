// src/components/ReviewForm.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaStar } from 'react-icons/fa';
import { createReview } from '../redux/slices/productSlice';

const ReviewForm = ({ productId }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.product);
  
  // Form state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle star hover
  const handleStarHover = (starValue) => {
    setHoveredRating(starValue);
  };

  // Handle star click
  const handleStarClick = (starValue) => {
    setRating(starValue);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate form
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (comment.trim().length < 5) {
      setError('Please provide a comment with at least 5 characters');
      return;
    }

    try {
      // Create review object
      const reviewData = {
        rating,
        comment,
      };

      // Dispatch action to submit review
      const resultAction = await dispatch(createReview({ productId, reviewData }));
      
      if (createReview.fulfilled.match(resultAction)) {
        // Reset form on success
        setRating(0);
        setComment('');
        setSuccess('Your review has been submitted successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        setError(resultAction.error.message || 'Failed to submit review');
      }
    } catch (err) {
      setError('An error occurred while submitting your review');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
      
      {!user ? (
        <p className="text-gray-600 mb-4">
          Please <a href="/login" className="text-blue-500 hover:underline">sign in</a> to write a review.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Error message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {/* Success message */}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}
          
          {/* Rating selection */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Rating</label>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="focus:outline-none mr-1"
                  onMouseEnter={() => handleStarHover(star)}
                  onMouseLeave={() => handleStarHover(0)}
                  onClick={() => handleStarClick(star)}
                  aria-label={`${star} Star${star !== 1 ? 's' : ''}`}
                >
                  <FaStar
                    size={24}
                    className={`${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    } transition-colors duration-150`}
                  />
                </button>
              ))}
              <span className="ml-2 text-gray-600">
                {rating > 0 ? `${rating} star${rating !== 1 ? 's' : ''}` : 'Select a rating'}
              </span>
            </div>
          </div>
          
          {/* Comment input */}
          <div className="mb-4">
            <label htmlFor="comment" className="block text-gray-700 font-medium mb-2">
              Your Review
            </label>
            <textarea
              id="comment"
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this product..."
              required
            ></textarea>
          </div>
          
          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md font-medium ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } transition-colors duration-150`}
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ReviewForm;
