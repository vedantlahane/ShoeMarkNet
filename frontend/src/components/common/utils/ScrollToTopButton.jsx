import React from 'react';
import useScrollToTopButton from '../../../hooks/useScrollToTopButton';

const ScrollToTopButton = ({ 
  className = '',
  variant = 'default', // default, minimal, premium
  size = 'medium', // small, medium, large
  showProgress = false,
  ...options 
}) => {
  const { 
    isVisible, 
    isScrolling, 
    scrollY, 
    handleScrollToTop, 
    buttonStyles 
  } = useScrollToTopButton(options);

  // Size configurations
  const sizeClasses = {
    small: 'w-10 h-10 text-sm',
    medium: 'w-12 h-12 text-base',
    large: 'w-14 h-14 text-lg'
  };

  // Variant configurations
  const variantClasses = {
    default: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl',
    minimal: 'bg-white/20 backdrop-blur-lg border border-white/30 text-gray-900 dark:text-white hover:bg-white/30',
    premium: 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 text-white shadow-2xl'
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={handleScrollToTop}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        rounded-full
        flex items-center justify-center
        transition-all duration-300
        hover:scale-110
        active:scale-95
        focus:outline-none
        focus:ring-4
        focus:ring-blue-500/50
        group
        ${isScrolling ? 'animate-pulse' : ''}
        ${className}
      `}
      style={buttonStyles}
      title="Scroll to top"
      aria-label="Scroll to top"
    >
      {/* Progress Ring */}
      {showProgress && (
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 36 36"
        >
          <path
            className="text-white/20"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className="text-white"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray={`${(scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100}, 100`}
            strokeLinecap="round"
            fill="none"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
      )}
      
      {/* Arrow Icon */}
      <i className={`fas fa-arrow-up relative z-10 group-hover:scale-110 transition-transform duration-200`}></i>
      
      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
    </button>
  );
};

export default ScrollToTopButton;
