import React from 'react';
import { useSelector } from 'react-redux';

const CompareModalTrigger = ({
  onClick = () => {},
  variant = 'default', // default, floating, minimal
  position = 'bottom-right', // bottom-right, bottom-left, top-right, top-left
  className = ''
}) => {
  const { compareItems = [] } = useSelector(state => ({
    compareItems: state.compare?.items || []
  }));

  if (compareItems.length === 0) return null;

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6', 
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  if (variant === 'floating') {
    return (
      <button
        onClick={onClick}
        className={`fixed ${positionClasses[position]} z-40 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-200 transform hover:scale-105 ${className}`}
      >
        <i className="fas fa-balance-scale mr-2"></i>
        Compare ({compareItems.length})
      </button>
    );
  }

  if (variant === 'minimal') {
    return (
      <button
        onClick={onClick}
        className={`flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium transition-colors ${className}`}
      >
        <i className="fas fa-balance-scale"></i>
        <span>Compare ({compareItems.length})</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 bg-white/20 backdrop-blur-lg border border-white/30 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-xl hover:bg-white/30 transition-colors ${className}`}
    >
      <i className="fas fa-balance-scale"></i>
      <span>Compare Products ({compareItems.length})</span>
    </button>
  );
};

export default CompareModalTrigger;
