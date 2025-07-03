// src/components/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlist } from '../redux/slices/wishlistSlice';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.wishlist);
  const isInWishlist = items.some(item => item._id === product._id);

  // Calculate sale price based on discountPercentage if available
  const salePrice = product.discountPercentage > 0 
    ? product.price - (product.price * product.discountPercentage / 100)
    : null;
  
  // Safely format price with fallback for non-numeric values
  const formatPrice = (price) => {
    const numPrice = Number(price);
    return !isNaN(numPrice) ? numPrice.toFixed(2) : '0.00';
  };

  // Calculate discount percentage
  const discountPercentage = salePrice 
    ? Math.round(((product.price - salePrice) / product.price) * 100)
    : product.discountPercentage || 0;

  // Generate mock rating if not provided
  const rating = product.rating || (4.0 + Math.random() * 1.0);
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;

  const handleAddToWishlist = () => {
    dispatch(addToWishlist(product._id));
  };

  const handleAddToCart = () => {
    // Create add to cart functionality here if needed
    console.log('Add to cart:', product._id);
  };

  return (
    <div className="group bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2">
      
      {/* Enhanced Product Image Section */}
      <Link to={`/products/${product._id}`}>
        <div className="relative h-64 overflow-hidden">
          {/* Product Image */}
          <img
            src={product.images && product.images.length > 0 
              ? product.images[0] 
              : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop'}
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
            loading="lazy"
          />
          
          {/* Gradient Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Enhanced Sale Badge */}
          {discountPercentage > 0 && (
            <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
              <i className="fas fa-percentage mr-1"></i>
              {discountPercentage}% OFF
            </div>
          )}
          
          {/* New Product Badge */}
          {product.isNew && (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              <i className="fas fa-sparkles mr-1"></i>
              NEW
            </div>
          )}
          
          {/* Low Stock Badge */}
          {product.countInStock <= 5 && product.countInStock > 0 && (
            <div className="absolute top-16 left-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              <i className="fas fa-exclamation-triangle mr-1"></i>
              Only {product.countInStock} left
            </div>
          )}

          {/* Quick Action Buttons */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <button
              onClick={(e) => {
                e.preventDefault();
                handleAddToWishlist();
              }}
              className={`w-10 h-10 rounded-full backdrop-blur-lg border border-white/20 flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                isInWishlist 
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              title={isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
            >
              <i className={`fas fa-heart ${isInWishlist ? 'animate-pulse' : ''}`}></i>
            </button>
            
            <button
              onClick={(e) => {
                e.preventDefault();
                handleAddToCart();
              }}
              className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
              title="Quick Add to Cart"
            >
              <i className="fas fa-plus"></i>
            </button>
          </div>

          {/* Stock Status Overlay */}
          {product.countInStock === 0 && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur-lg border border-white/20 rounded-2xl px-6 py-3 text-center">
                <i className="fas fa-times-circle text-red-500 text-2xl mb-2"></i>
                <p className="text-red-600 font-bold text-sm">Out of Stock</p>
              </div>
            </div>
          )}
        </div>
      </Link>

      {/* Enhanced Product Info Section */}
      <div className="p-6 relative">
        {/* Brand */}
        {product.brand && (
          <div className="flex items-center mb-2">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-2"></div>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              {product.brand}
            </span>
          </div>
        )}

        {/* Product Name */}
        <Link to={`/products/${product._id}`}>
          <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 line-clamp-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400">
            {product.name}
          </h3>
        </Link>

        {/* Enhanced Rating */}
        <div className="flex items-center mb-4">
          <div className="flex items-center mr-2">
            {[...Array(5)].map((_, i) => (
              <i 
                key={i} 
                className={`fas text-sm ${
                  i < fullStars 
                    ? 'fa-star text-yellow-400' 
                    : i === fullStars && hasHalfStar 
                      ? 'fa-star-half-alt text-yellow-400'
                      : 'fa-star text-gray-300 dark:text-gray-600'
                }`}
              ></i>
            ))}
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            ({rating.toFixed(1)})
          </span>
          
          {/* Stock indicator */}
          <div className="ml-auto flex items-center">
            <div className={`w-2 h-2 rounded-full mr-1 ${
              product.countInStock > 10 
                ? 'bg-green-400' 
                : product.countInStock > 0 
                  ? 'bg-yellow-400' 
                  : 'bg-red-400'
            }`}></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {product.countInStock > 10 
                ? 'In Stock' 
                : product.countInStock > 0 
                  ? 'Low Stock' 
                  : 'Out of Stock'
              }
            </span>
          </div>
        </div>

        {/* Enhanced Price Display */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            {salePrice ? (
              <>
                <span className="text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ${formatPrice(salePrice)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 line-through font-medium">
                  ${formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                ${formatPrice(product.price)}
              </span>
            )}
          </div>
          
          {/* Savings badge */}
          {salePrice && (
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 text-green-700 dark:text-green-400 text-xs font-bold px-2 py-1 rounded-full">
              Save ${formatPrice(product.price - salePrice)}
            </div>
          )}
        </div>

        {/* Enhanced Action Buttons */}
        <div className="flex space-x-3">
          {/* Add to Cart Button */}
          <button 
            onClick={handleAddToCart}
            disabled={product.countInStock === 0}
            className={`flex-1 flex items-center justify-center py-3 px-4 rounded-2xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 ${
              product.countInStock === 0 
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            <i className={`fas ${product.countInStock === 0 ? 'fa-times' : 'fa-cart-plus'} mr-2`}></i>
            {product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>

          {/* Enhanced Wishlist Button */}
          <button 
            onClick={handleAddToWishlist}
            disabled={isInWishlist}
            className={`p-3 rounded-2xl transition-all duration-200 hover:scale-110 active:scale-95 border-2 ${
              isInWishlist 
                ? 'bg-gradient-to-r from-pink-100 to-rose-100 dark:from-pink-900/20 dark:to-rose-900/20 border-pink-200 dark:border-pink-800 text-pink-600 dark:text-pink-400' 
                : 'bg-white/10 backdrop-blur-lg border-white/20 dark:border-gray-700/20 text-gray-600 dark:text-gray-400 hover:bg-white/20 dark:hover:bg-gray-700/20 hover:text-pink-500 dark:hover:text-pink-400 hover:border-pink-200 dark:hover:border-pink-800'
            }`}
            title={isInWishlist ? 'Already in wishlist' : 'Add to wishlist'}
          >
            <i className={`fas fa-heart ${isInWishlist ? 'animate-pulse' : ''}`}></i>
          </button>
        </div>

        {/* Additional Product Info */}
        <div className="mt-4 pt-4 border-t border-white/10 dark:border-gray-700/20">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <i className="fas fa-shipping-fast mr-1 text-blue-500"></i>
              <span>Free Shipping</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-undo mr-1 text-green-500"></i>
              <span>30-day Returns</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-shield-alt mr-1 text-purple-500"></i>
              <span>Warranty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Hover Effects */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      
      {/* Border Glow Effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 -z-10"></div>
    </div>
  );
};

export default ProductCard;
