// src/components/ReviewForm.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import { createReview } from '../redux/slices/productSlice';
import Rating from './Rating'; // Import the Rating component

const ReviewForm = ({ productId }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { loading, error: productError } = useSelector((state) => state.product);
  
  // Form state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [touched, setTouched] = useState({
    rating: false,
    comment: false
  });

  // Clear product errors when component unmounts
  useEffect(() => {
    return () => {
      // You could dispatch an action to clear product errors here
      // dispatch(clearProductError());
    };
  }, [dispatch]);

  // Handle validation
  const validateForm = () => {
    const errors = {};
    
    if (!rating) {
      errors.rating = 'Please select a rating';
    }
    
    if (!comment.trim()) {
      errors.comment = 'Please enter a comment';
    } else if (comment.trim().length < 5) {
      errors.comment = 'Comment must be at least 5 characters';
    }
    
    return errors;
  };

  // Mark field as touched when it loses focus
  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
  };

  // Handle rating change
  const handleRatingChange = (newRating) => {
    setRating(newRating);
    setTouched({ ...touched, rating: true });
    
    // Clear error when user selects a rating
    if (error === 'Please select a rating') {
      setError('');
    }
  };

  // Handle comment change
  const handleCommentChange = (e) => {
    const value = e.target.value;
    setComment(value);
    
    // Real-time validation for better UX
    if (touched.comment) {
      if (!value.trim()) {
        setError('Please enter a comment');
      } else if (value.trim().length < 5) {
        setError('Comment must be at least 5 characters');
      } else {
        setError('');
      }
    }
  };

  // Handle form submission with enhanced validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({ rating: true, comment: true });
    
    // Validate form
    const formErrors = validateForm();
    
    if (Object.keys(formErrors).length > 0) {
      // Set the first error message
      setError(Object.values(formErrors)[0]);
      return;
    }
    
    setError('');
    
    try {
      // Create review object
      const reviewData = {
        rating,
        comment: comment.trim()
      };

      // Dispatch action to submit review
      const resultAction = await dispatch(createReview({ productId, reviewData }));
      
      if (createReview.fulfilled.match(resultAction)) {
        // Reset form on success
        setRating(0);
        setComment('');
        setTouched({ rating: false, comment: false });
        setSuccess('Your review has been submitted successfully! Thank you for your feedback.');
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccess('');
        }, 5000);
      } else {
        // Handle rejected action with improved error extraction
        const errorMessage = resultAction.payload?.message || 
                            resultAction.error?.message || 
                            'Failed to submit review. Please try again later.';
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Review submission error:', err);
      setError('An unexpected error occurred. Please try again later.');
    }
  };

  // Show validation errors when fields are touched
  const getFieldError = (field) => {
    if (!touched[field]) return null;
    
    const formErrors = validateForm();
    return formErrors[field];
  };

  const ratingError = getFieldError('rating');
  const commentError = getFieldError('comment');

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
      
      {!isAuthenticated ? (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4" role="alert">
          <p className="text-center">
            Please <Link to={`/login?redirect=${encodeURIComponent(window.location.pathname)}`} className="font-medium text-blue-600 hover:underline">sign in</Link> to write a review.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} aria-label="Review submission form" noValidate>
          {/* Error message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {/* Success message */}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="status">
              <span className="block sm:inline">{success}</span>
            </div>
          )}
          
          {/* Rating selection using the Rating component */}
          <div className="mb-6">
            <fieldset>
              <legend className="block text-gray-700 font-medium mb-2">Rating<span className="text-red-500">*</span></legend>
              <Rating 
                totalStars={5}
                selectedStars={rating}
                onRate={handleRatingChange}
                size={28}
                name="product-rating"
                showLabel={true}
                labelText="stars"
              />
              {ratingError && (
                <p className="mt-1 text-sm text-red-600" id="rating-error">
                  {ratingError}
                </p>
              )}
            </fieldset>
          </div>
          
          {/* Comment input with improved accessibility */}
          <div className="mb-6">
            <label htmlFor="comment" className="block text-gray-700 font-medium mb-2">
              Your Review<span className="text-red-500">*</span>
            </label>
            <textarea
              id="comment"
              name="comment"
              rows="4"
              className={`w-full px-3 py-2 border ${
                commentError ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 ${
                commentError ? 'focus:ring-red-500' : 'focus:ring-blue-500'
              } transition-colors`}
              value={comment}
              onChange={handleCommentChange}
              onBlur={() => handleBlur('comment')}
              placeholder="Share your experience with this product..."
              aria-required="true"
              aria-invalid={!!commentError}
              aria-describedby={commentError ? "comment-error" : "comment-hint"}
            ></textarea>
            {commentError ? (
              <p className="mt-1 text-sm text-red-600" id="comment-error">
                {commentError}
              </p>
            ) : (
              <p id="comment-hint" className="text-sm text-gray-500 mt-1">
                Please provide at least 5 characters
              </p>
            )}
          </div>
          
          {/* Submit button with improved states */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md font-medium ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            aria-busy={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : (
              'Submit Review'
            )}
          </button>
          
          <p className="text-sm text-gray-500 mt-3">
            <span className="text-red-500">*</span> Required fields
          </p>
        </form>
      )}
    </div>
  );
};

export default ReviewForm;
