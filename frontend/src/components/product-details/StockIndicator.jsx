import React from 'react';

const StockIndicator = ({ stock, className = '' }) => {
  const getStockStatus = () => {
    if (stock === 0) return { color: 'red', text: 'Out of Stock', icon: 'fa-times-circle' };
    if (stock <= 5) return { color: 'orange', text: `Only ${stock} left!`, icon: 'fa-exclamation-triangle' };
    if (stock <= 10) return { color: 'yellow', text: `${stock} in stock`, icon: 'fa-clock' };
    return { color: 'green', text: 'In Stock', icon: 'fa-check-circle' };
  };

  const status = getStockStatus();

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={`w-3 h-3 rounded-full bg-${status.color}-400 animate-pulse`}></div>
      <span className={`font-semibold text-${status.color}-600 dark:text-${status.color}-400 flex items-center`}>
        <i className={`fas ${status.icon} mr-2`}></i>
        {status.text}
      </span>
      {stock > 0 && stock <= 5 && (
        <span className="text-orange-500 text-sm font-medium animate-pulse">
          Hurry up!
        </span>
      )}
    </div>
  );
};

export default StockIndicator;
