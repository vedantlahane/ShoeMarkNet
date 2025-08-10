import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice, calculateDiscount } from '../../utils/helpers';

const WishlistItem = ({
  item,
  index,
  viewMode,
  isSelected,
  isProcessing,
  isInCart,
  onSelect,
  onRemove,
  onAddToCart,
  onShare,
  onAddToCompare,
  animateElements,
  className = ''
}) => {
  const discountedPrice = calculateDiscount(item.price, item.discountPercentage);
  
  return (
    <div
      className={`group bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl overflow-hidden shadow-2xl hover:scale-105 transition-all duration-500 ${
        viewMode === 'list' ? 'flex flex-col md:flex-row' : ''
      } ${animateElements ? 'animate-fade-in-scale' : 'opacity-0'} ${className}`}
      style={{ animationDelay: `${0.6 + index * 0.1}s` }}
    >
      {/* Image Section */}
      <div className={`relative overflow-hidden ${viewMode === 'list' ? 'md:w-64 h-48 md:h-full' : viewMode === 'compact' ? 'h-48' : 'h-64'}`}>
        
        {/* Selection Checkbox */}
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={() => onSelect(item._id)}
            className={`w-6 h-6 rounded border-2 border-white/50 flex items-center justify-center transition-all duration-200 ${
              isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white/20 backdrop-blur-lg hover:bg-white/30'
            }`}
          >
            {isSelected && <i className="fas fa-check text-white text-xs"></i>}
          </button>
        </div>

        <Link to={`/products/${item._id}`}>
          <img 
            src={item.images?.[0] || '/product-placeholder.jpg'} 
            alt={item.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          
          {/* Enhanced Badges */}
          <div className="absolute top-4 right-4 flex flex-col space-y-2">
            {item.discountPercentage > 0 && (
              <div className="bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                <i className="fas fa-percentage mr-1"></i>
                {item.discountPercentage}% OFF
              </div>
            )}
            {item.isNew && (
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                <i className="fas fa-sparkles mr-1"></i>
                NEW
              </div>
            )}
            {item.countInStock <= 5 && item.countInStock > 0 && (
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
                <i className="fas fa-exclamation mr-1"></i>
                ONLY {item.countInStock} LEFT
              </div>
            )}
          </div>
        </Link>

        {/* Action Buttons Overlay */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center space-x-3">
          <button
            onClick={() => onShare(item)}
            className="w-10 h-10 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200"
            title="Share"
          >
            <i className="fas fa-share"></i>
          </button>
          <Link
            to={`/products/${item._id}`}
            className="w-10 h-10 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200"
            title="Quick View"
          >
            <i className="fas fa-eye"></i>
          </Link>
          <button
            onClick={() => onAddToCompare(item)}
            className="w-10 h-10 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200"
            title="Compare"
          >
            <i className="fas fa-balance-scale"></i>
          </button>
        </div>

        {/* Remove Button */}
        <button 
          onClick={() => onRemove(item._id, item.name)}
          disabled={isProcessing}
          className="absolute bottom-4 left-4 w-10 h-10 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200"
          title="Remove from wishlist"
        >
          {isProcessing ? (
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <i className="fas fa-trash hover:animate-bounce"></i>
          )}
        </button>
      </div>
      
      {/* Content Section */}
      <div className={`p-6 flex-1 flex flex-col ${viewMode === 'list' ? 'justify-between' : ''}`}>
        
        {/* Brand */}
        {item.brand && (
          <div className="flex items-center mb-2">
            <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full mr-2"></div>
            <span className="text-xs font-semibold text-pink-600 dark:text-pink-400 uppercase tracking-wider">
              {item.brand}
            </span>
          </div>
        )}

        {/* Product Name */}
        <Link to={`/products/${item._id}`}>
          <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white hover:text-pink-600 dark:hover:text-pink-400 transition-colors duration-200 line-clamp-2 leading-tight">
            {item.name}
          </h3>
        </Link>
        
        {/* Enhanced Price Display */}
        <div className="mb-6">
          {discountedPrice ? (
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl font-black bg-gradient-to-r from-pink-600 via-red-600 to-rose-600 bg-clip-text text-transparent">
                {formatPrice(discountedPrice)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                {formatPrice(item.price)}
              </span>
            </div>
          ) : (
            <span className="text-2xl font-black bg-gradient-to-r from-pink-600 via-red-600 to-rose-600 bg-clip-text text-transparent">
              {formatPrice(item.price)}
            </span>
          )}
          
          {/* Savings Badge */}
          {discountedPrice && (
            <div className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full inline-block">
              <i className="fas fa-piggy-bank mr-1"></i>
              Save {formatPrice(item.price - discountedPrice)}
            </div>
          )}
        </div>
        
        {/* Stock Status */}
        <div className="mb-4">
          <div className={`flex items-center text-sm font-semibold ${
            item.countInStock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              item.countInStock > 0 ? 'bg-green-400 animate-pulse' : 'bg-red-400'
            }`}></div>
            {item.countInStock > 0 ? `${item.countInStock} in stock` : 'Out of Stock'}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-3 mt-auto">
          <button 
            onClick={() => onAddToCart(item)}
            disabled={item.countInStock === 0 || isProcessing}
            className={`w-full flex items-center justify-center py-3 px-4 rounded-2xl font-semibold transition-all duration-200 relative overflow-hidden ${
              item.countInStock === 0 || isProcessing
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                : isInCart
                ? 'bg-green-500 text-white'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:scale-105 active:scale-95'
            }`}
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <i className={`fas ${item.countInStock === 0 ? 'fa-times' : isInCart ? 'fa-check' : 'fa-cart-plus'} mr-2`}></i>
                {item.countInStock === 0 ? 'Out of Stock' : isInCart ? 'In Cart' : 'Add to Cart'}
              </>
            )}
            
            {/* Button shine effect */}
            {item.countInStock > 0 && !isProcessing && !isInCart && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            )}
          </button>
          
          <div className="flex space-x-2">
            <Link 
              to={`/products/${item._id}`}
              className="flex-1 text-center py-2 px-4 bg-white/20 backdrop-blur-lg border border-white/30 text-gray-900 dark:text-white rounded-2xl hover:bg-white/30 transition-all duration-200 font-semibold"
            >
              <i className="fas fa-eye mr-2"></i>
              View
            </Link>
            <button 
              onClick={() => onAddToCompare(item)}
              className="flex-1 text-center py-2 px-4 bg-white/20 backdrop-blur-lg border border-white/30 text-gray-900 dark:text-white rounded-2xl hover:bg-white/30 transition-all duration-200 font-semibold"
            >
              <i className="fas fa-balance-scale mr-2"></i>
              Compare
            </button>
          </div>
        </div>

        {/* Product Features */}
        {viewMode !== 'compact' && (
          <div className="mt-4 pt-4 border-t border-white/10 dark:border-gray-700/20">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <i className="fas fa-shipping-fast mr-1 text-blue-500"></i>
                <span>Free Ship</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-undo mr-1 text-green-500"></i>
                <span>Returns</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-shield-alt mr-1 text-purple-500"></i>
                <span>Warranty</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistItem;
