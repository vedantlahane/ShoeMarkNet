// src/components/ReviewForm.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import { createReview } from '../../redux/slices/productSlice';
import Rating from './Rating';

const ReviewForm = ({ productId }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { loading, error: productError } = useSelector((state) => state.product);
  
  // Enhanced form state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [touched, setTouched] = useState({
    rating: false,
    comment: false
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [animateForm, setAnimateForm] = useState(false);

  // Trigger animations
  useEffect(() => {
    setAnimateForm(true);
  }, []);

  // Clear product errors when component unmounts
  useEffect(() => {
    return () => {
      // You could dispatch an action to clear product errors here
      // dispatch(clearProductError());
    };
  }, [dispatch]);

  // Enhanced validation with better UX
  const validateForm = () => {
    const errors = {};
    
    if (!rating) {
      errors.rating = 'Please select a rating to share your experience';
    }
    
    if (!comment.trim()) {
      errors.comment = 'Please share your thoughts about this product';
    } else if (comment.trim().length < 10) {
      errors.comment = 'Please provide a more detailed review (at least 10 characters)';
    } else if (comment.trim().length > 500) {
      errors.comment = 'Review is too long (maximum 500 characters)';
    }
    
    return errors;
  };

  // Mark field as touched when it loses focus
  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
  };

  // Enhanced rating change handler
  const handleRatingChange = (newRating) => {
    setRating(newRating);
    setTouched({ ...touched, rating: true });
    
    // Clear error when user selects a rating
    if (error.includes('rating')) {
      setError('');
    }

    // Auto-expand form when rating is selected
    if (!isExpanded && newRating > 0) {
      setIsExpanded(true);
    }
  };

  // Enhanced comment change handler
  const handleCommentChange = (e) => {
    const value = e.target.value;
    setComment(value);
    setCharacterCount(value.length);
    
    // Real-time validation for better UX
    if (touched.comment) {
      if (!value.trim()) {
        setError('Please share your thoughts about this product');
      } else if (value.trim().length < 10) {
        setError('Please provide a more detailed review (at least 10 characters)');
      } else if (value.trim().length > 500) {
        setError('Review is too long (maximum 500 characters)');
      } else {
        setError('');
      }
    }
  };

  // Enhanced form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({ rating: true, comment: true });
    
    // Validate form
    const formErrors = validateForm();
    
    if (Object.keys(formErrors).length > 0) {
      setError(Object.values(formErrors)[0]);
      return;
    }
    
    setError('');
    
    try {
      const reviewData = {
        rating,
        comment: comment.trim()
      };

      const resultAction = await dispatch(createReview({ productId, reviewData }));
      
      if (createReview.fulfilled.match(resultAction)) {
        // Reset form on success
        setRating(0);
        setComment('');
        setCharacterCount(0);
        setTouched({ rating: false, comment: false });
        setIsExpanded(false);
        setSuccess('🎉 Thank you! Your review has been submitted successfully and will help other customers make informed decisions.');
        
        // Clear success message after 6 seconds
        setTimeout(() => {
          setSuccess('');
        }, 6000);
      } else {
        const errorMessage = resultAction.payload?.message || 
                            resultAction.error?.message || 
                            'Unable to submit your review at this time. Please try again in a few moments.';
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Review submission error:', err);
      setError('An unexpected error occurred while submitting your review. Please check your connection and try again.');
    }
  };

  // Get field-specific errors
  const getFieldError = (field) => {
    if (!touched[field]) return null;
    const formErrors = validateForm();
    return formErrors[field];
  };

  const ratingError = getFieldError('rating');
  const commentError = getFieldError('comment');

  // Get rating labels for better UX
  const getRatingLabel = (rating) => {
    const labels = {
      1: 'Poor - Not satisfied',
      2: 'Fair - Below expectations',
      3: 'Good - Meets expectations',
      4: 'Very Good - Exceeds expectations',
      5: 'Excellent - Outstanding product!'
    };
    return labels[rating] || 'Select a rating';
  };

  return (
    <div className="relative">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-3xl"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-4 left-4 w-8 h-8 bg-gradient-to-r from-pink-400/20 to-red-400/20 rounded-full blur-lg animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className={`relative bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl shadow-2xl p-8 mb-8 transition-all duration-700 ${
        animateForm ? 'animate-fade-in-up' : 'opacity-0'
      }`}>
        
        {/* Enhanced Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <i className="fas fa-star text-2xl text-white"></i>
          </div>
          <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Share Your Experience
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            <i className="fas fa-heart mr-2 text-red-500"></i>
            Help others discover this amazing product
          </p>
        </div>
        
        {!isAuthenticated ? (
          /* Enhanced Login Prompt */
          <div className="bg-blue-500/20 backdrop-blur-lg border border-blue-300/50 rounded-3xl p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <i className="fas fa-user-circle text-3xl text-white"></i>
            </div>
            <h4 className="text-xl font-bold text-blue-800 dark:text-blue-200 mb-3">
              Join Our Community
            </h4>
            <p className="text-blue-700 dark:text-blue-300 mb-6">
              Please sign in to share your valuable feedback and help other customers make informed decisions.
            </p>
            <Link 
              to={`/login?redirect=${encodeURIComponent(window.location.pathname)}`}
              className="inline-flex items-center bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-2xl"
            >
              <i className="fas fa-sign-in-alt mr-3"></i>
              Sign In to Write Review
              <i className="fas fa-arrow-right ml-3"></i>
            </Link>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-4">
              <i className="fas fa-shield-alt mr-1"></i>
              Secure & Protected Account Access
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8" aria-label="Review submission form" noValidate>
            
            {/* Enhanced Error Message */}
            {error && (
              <div className="bg-red-500/20 backdrop-blur-lg border border-red-300/50 rounded-3xl p-6 animate-shake">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <i className="fas fa-exclamation-triangle text-white"></i>
                  </div>
                  <div>
                    <h5 className="font-semibold text-red-800 dark:text-red-200 text-lg">Oops!</h5>
                    <p className="text-red-700 dark:text-red-300">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Enhanced Success Message */}
            {success && (
              <div className="bg-green-500/20 backdrop-blur-lg border border-green-300/50 rounded-3xl p-6 animate-fade-in">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <i className="fas fa-check-circle text-white"></i>
                  </div>
                  <div>
                    <h5 className="font-semibold text-green-800 dark:text-green-200 text-lg">Success!</h5>
                    <p className="text-green-700 dark:text-green-300">{success}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Enhanced Rating Selection */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-3xl p-8">
              <fieldset>
                <legend className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <i className="fas fa-star mr-3 text-yellow-500"></i>
                  Rate This Product
                  <span className="text-red-500 ml-2 text-lg">*</span>
                </legend>
                
                {/* Custom Star Rating */}
                <div className="flex items-center justify-center space-x-2 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingChange(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
                        star <= (hoveredRating || rating)
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-500 shadow-2xl'
                          : 'bg-white/20 backdrop-blur-lg border border-white/30 hover:bg-white/30'
                      }`}
                    >
                      <FaStar 
                        className={`text-2xl transition-all duration-300 ${
                          star <= (hoveredRating || rating) ? 'text-white' : 'text-gray-400'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                
                {/* Rating Label */}
                <div className="text-center">
                  <p className={`text-lg font-semibold transition-all duration-300 ${
                    rating > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {hoveredRating > 0 ? getRatingLabel(hoveredRating) : getRatingLabel(rating)}
                  </p>
                  {rating > 0 && (
                    <div className="flex items-center justify-center mt-2">
                      <div className="flex space-x-1">
                        {[...Array(rating)].map((_, i) => (
                          <div key={i} className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}></div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {ratingError && (
                  <div className="mt-4 p-4 bg-red-500/20 backdrop-blur-lg border border-red-300/50 rounded-2xl">
                    <p className="text-red-700 dark:text-red-300 text-center">
                      <i className="fas fa-exclamation-circle mr-2"></i>
                      {ratingError}
                    </p>
                  </div>
                )}
              </fieldset>
            </div>
            
            {/* Enhanced Comment Section */}
            <div className={`bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 transition-all duration-500 ${
              isExpanded || rating > 0 ? 'opacity-100 transform translate-y-0' : 'opacity-50 transform translate-y-4'
            }`}>
              <label htmlFor="comment" className="block text-xl font-bold text-gray-900 dark:text-white mb-6 items-center">
                <i className="fas fa-comment-alt mr-3 text-blue-500"></i>
                Share Your Thoughts
                <span className="text-red-500 ml-2 text-lg">*</span>
              </label>
              
              <div className="relative">
                <textarea
                  id="comment"
                  name="comment"
                  rows="6"
                  className={`w-full px-6 py-4 bg-white/20 backdrop-blur-lg border ${
                    commentError ? 'border-red-500/50' : 'border-white/30'
                  } rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 ${
                    commentError ? 'focus:ring-red-500' : 'focus:ring-blue-400'
                  } focus:border-transparent transition-all duration-200 resize-none`}
                  value={comment}
                  onChange={handleCommentChange}
                  onBlur={() => handleBlur('comment')}
                  placeholder="What did you love about this product? Share details that will help other customers..."
                  aria-required="true"
                  aria-invalid={!!commentError}
                  aria-describedby={commentError ? "comment-error" : "comment-hint"}
                />
                
                {/* Character Counter */}
                <div className="absolute bottom-4 right-4 flex items-center space-x-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    characterCount > 500 ? 'bg-red-100 text-red-700' :
                    characterCount > 400 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {characterCount}/500
                  </div>
                </div>
              </div>
              
              {commentError ? (
                <div className="mt-4 p-4 bg-red-500/20 backdrop-blur-lg border border-red-300/50 rounded-2xl">
                  <p className="text-red-700 dark:text-red-300">
                    <i className="fas fa-exclamation-circle mr-2"></i>
                    {commentError}
                  </p>
                </div>
              ) : (
                <div className="mt-4 p-4 bg-blue-500/20 backdrop-blur-lg border border-blue-300/50 rounded-2xl">
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    <i className="fas fa-lightbulb mr-2"></i>
                    <strong>Tips for a great review:</strong> Mention specific features, quality, comfort, and how the product met your expectations.
                  </p>
                </div>
              )}
            </div>
            
            {/* Review Guidelines */}
            <div className="bg-purple-500/20 backdrop-blur-lg border border-purple-300/50 rounded-3xl p-6">
              <h4 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-3">
                <i className="fas fa-info-circle mr-2"></i>
                Review Guidelines
              </h4>
              <ul className="text-purple-700 dark:text-purple-300 space-y-2 text-sm">
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mr-2 mt-0.5 flex-shrink-0"></i>
                  Be honest and specific about your experience
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mr-2 mt-0.5 flex-shrink-0"></i>
                  Focus on the product's features and quality
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mr-2 mt-0.5 flex-shrink-0"></i>
                  Keep language respectful and constructive
                </li>
                <li className="flex items-start">
                  <i className="fas fa-times text-red-500 mr-2 mt-0.5 flex-shrink-0"></i>
                  Avoid personal information or inappropriate content
                </li>
              </ul>
            </div>
            
            {/* Enhanced Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={loading || !rating || !comment.trim()}
                className={`group relative px-12 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform focus:outline-none focus:ring-4 focus:ring-blue-400/50 ${
                  loading || !rating || !comment.trim()
                    ? 'bg-gray-400/50 cursor-not-allowed text-gray-600'
                    : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-2xl hover:scale-105 active:scale-95'
                }`}
                aria-busy={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                    <span>Publishing Your Review...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <i className="fas fa-paper-plane mr-3 group-hover:animate-bounce"></i>
                    <span>Publish Review</span>
                    <i className="fas fa-arrow-right ml-3 group-hover:translate-x-1 transition-transform duration-200"></i>
                  </span>
                )}
                
                {/* Button Glow Effect */}
                {!loading && rating && comment.trim() && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300 -z-10"></div>
                )}
              </button>
              
              {/* Form Requirements */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center space-x-4">
                  <span className="flex items-center">
                    <span className="text-red-500 mr-1">*</span>
                    Required fields
                  </span>
                  <span className="w-px h-4 bg-gray-300"></span>
                  <span className="flex items-center">
                    <i className="fas fa-shield-alt text-green-500 mr-2"></i>
                    Your review is secure and verified
                  </span>
                </p>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Custom Styles */}
    </div>
  );
};

export default ReviewForm;
