import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

// Utils
import { trackEvent } from '../../utils/analytics';

const CompareButton = ({
  product,
  variant = 'default', // default, icon-only, text-only
  size = 'medium', // small, medium, large
  maxCompareItems = 4,
  className = ''
}) => {
  const dispatch = useDispatch();
  const { compareItems = [] } = useSelector(state => ({
    compareItems: state.compare?.items || []
  }));

  const isInCompare = compareItems.some(item => item.id === product.id);
  const isMaxReached = compareItems.length >= maxCompareItems;

  const sizeClasses = {
    small: 'w-8 h-8 text-xs',
    medium: 'w-10 h-10 text-sm',
    large: 'w-12 h-12 text-base'
  };

  const handleToggleCompare = useCallback(() => {
    if (isInCompare) {
      // Remove from compare
      dispatch({ type: 'REMOVE_FROM_COMPARE', payload: product.id });
      toast.success('Removed from comparison');
      
      trackEvent('compare_item_removed', {
        product_id: product.id,
        product_name: product.name,
        remaining_items: compareItems.length - 1
      });
    } else {
      // Add to compare
      if (isMaxReached) {
        toast.warning(`You can only compare up to ${maxCompareItems} products`);
        return;
      }
      
      dispatch({ type: 'ADD_TO_COMPARE', payload: product });
      toast.success('Added to comparison');
      
      trackEvent('compare_item_added', {
        product_id: product.id,
        product_name: product.name,
        total_items: compareItems.length + 1
      });
    }
  }, [isInCompare, isMaxReached, product, dispatch, compareItems.length, maxCompareItems]);

  if (variant === 'icon-only') {
    return (
      <button
        onClick={handleToggleCompare}
        disabled={!isInCompare && isMaxReached}
        className={`${sizeClasses[size]} bg-white/20 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
          isInCompare 
            ? 'text-blue-600 border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
        } ${className}`}
        title={isInCompare ? 'Remove from comparison' : 'Add to comparison'}
      >
        <i className={`fas ${isInCompare ? 'fa-check' : 'fa-balance-scale'}`}></i>
      </button>
    );
  }

  if (variant === 'text-only') {
    return (
      <button
        onClick={handleToggleCompare}
        disabled={!isInCompare && isMaxReached}
        className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
          isInCompare
            ? 'bg-blue-500 text-white border border-blue-500'
            : 'bg-white/20 backdrop-blur-lg border border-white/30 text-gray-900 dark:text-white hover:bg-white/30'
        } ${className}`}
      >
        {isInCompare ? 'Remove' : 'Compare'}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggleCompare}
      disabled={!isInCompare && isMaxReached}
      className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
        isInCompare
          ? 'bg-blue-500 text-white border border-blue-500'
          : 'bg-white/20 backdrop-blur-lg border border-white/30 text-gray-900 dark:text-white hover:bg-white/30'
      } ${className}`}
    >
      <i className={`fas ${isInCompare ? 'fa-check' : 'fa-balance-scale'}`}></i>
      <span className="text-sm">
        {isInCompare ? 'Added' : 'Compare'}
      </span>
    </button>
  );
};

export default CompareButton;
