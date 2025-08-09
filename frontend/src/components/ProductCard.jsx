// src/components/ProductCard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlist } from '../redux/slices/wishlistSlice';
import { addToCart } from '../redux/slices/cartSlice';

const ProductCard = ({ product, viewMode = 'grid', index = 0 }) => {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.wishlist);
  const isInWishlist = items.some(item => item._id === product._id);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Calculate sale price based on discountPercentage
  const salePrice = product.discountPercentage > 0 
    ? product.price - (product.price * product.discountPercentage / 100)
    : null;
  
  // Safely format price
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

  const handleAddToWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToWishlist(product._id));
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // For now, add with default size and color - ideally this should open a modal for variant selection
    const defaultVariant = product.variants && product.variants[0];
    const defaultSize = defaultVariant?.sizes && defaultVariant.sizes[0];
    
    const cartItem = {
      productId: product._id,
      quantity: 1,
      size: defaultSize?.size || null,
      color: defaultVariant?.color || null
    };
    
    dispatch(addToCart(cartItem));
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl overflow-hidden shadow-2xl hover:shadow-4xl transition-all duration-500 hover:scale-[1.01] group">
        <div className="flex flex-col md:flex-row">
          {/* List Image */}
          <Link to={`/products/${product._id}`} className="md:w-1/3">
            <div className="relative h-48 md:h-full overflow-hidden">
              <img
                src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop'}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                onLoad={() => setImageLoaded(true)}
              />
              {discountPercentage > 0 && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  {discountPercentage}% OFF
                </div>
              )}
            </div>
          </Link>

          {/* List Content */}
          <div className="md:w-2/3 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  {product.brand}
                </span>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className={`fas text-sm ${
                      i < fullStars ? 'fa-star text-yellow-400' : 
                      i === fullStars && hasHalfStar ? 'fa-star-half-alt text-yellow-400' : 
                      'fa-star text-gray-300'
                    }`}></i>
                  ))}
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">({rating.toFixed(1)})</span>
                </div>
              </div>
              
              <Link to={`/products/${product._id}`}>
                <h3 className="font-bold text-xl mb-3 text-gray-900 dark:text-white hover:text-blue-600 transition-colors">
                  {product.name}
                </h3>
              </Link>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {salePrice ? (
                    <>
                      <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        ${formatPrice(salePrice)}
                      </span>
                      <span className="text-lg text-gray-500 line-through">${formatPrice(product.price)}</span>
                    </>
                  ) : (
                    <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      ${formatPrice(product.price)}
                    </span>
                  )}
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  product.countInStock > 10 ? 'bg-green-100 text-green-800' :
                  product.countInStock > 0 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {product.countInStock > 10 ? 'In Stock' : 
                   product.countInStock > 0 ? 'Low Stock' : 'Out of Stock'}
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button 
                onClick={handleAddToCart}
                disabled={product.countInStock === 0}
                className={`flex-1 py-3 px-6 rounded-2xl font-semibold transition-all duration-200 ${
                  product.countInStock === 0 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:scale-105'
                }`}
              >
                <i className="fas fa-cart-plus mr-2"></i>
                {product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button 
                onClick={handleAddToWishlist}
                className={`p-3 rounded-2xl transition-all duration-200 ${
                  isInWishlist 
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white' 
                    : 'bg-white/20 text-gray-600 dark:text-gray-400 hover:bg-white/30 hover:text-pink-500'
                }`}
              >
                <i className="fas fa-heart"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`group bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl overflow-hidden shadow-2xl hover:shadow-4xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 animate-fade-in-scale`}
      style={{ animationDelay: `${index * 0.1}s` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      
      {/* Enhanced Product Image Section */}
      <Link to={`/products/${product._id}`}>
        <div className="relative h-64 overflow-hidden">
          {/* Image with lazy loading */}
          <div className={`transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}>
            <img
              src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop'}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
            />
          </div>
          
          {/* Loading skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse">
              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                <i className="fas fa-image text-gray-400 text-4xl"></i>
              </div>
            </div>
          )}
          
          {/* Enhanced Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}></div>
          
          {/* Premium Badges */}
          <div className="absolute top-4 right-4 flex flex-col space-y-2">
            {discountPercentage > 0 && (
              <div className="bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
                <i className="fas fa-percentage mr-1"></i>
                {discountPercentage}% OFF
              </div>
            )}
            
            {product.isNew && (
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                <i className="fas fa-sparkles mr-1"></i>
                NEW
              </div>
            )}
            
            {product.isFeatured && (
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                <i className="fas fa-crown mr-1"></i>
                FEATURED
              </div>
            )}
          </div>

          {/* Low Stock Warning */}
          {product.countInStock <= 5 && product.countInStock > 0 && (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-bounce">
              <i className="fas fa-exclamation-triangle mr-1"></i>
              Only {product.countInStock} left!
            </div>
          )}

          {/* Enhanced Quick Actions */}
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex space-x-3 transition-all duration-300 ${
            isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}>
            <button
              onClick={handleAddToWishlist}
              className={`w-12 h-12 rounded-full backdrop-blur-lg border border-white/20 flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-2xl ${
                isInWishlist 
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              title={isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
            >
              <i className={`fas fa-heart ${isInWishlist ? 'animate-pulse' : ''}`}></i>
            </button>
            
            <button
              onClick={handleAddToCart}
              disabled={product.countInStock === 0}
              className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
              title="Quick Add to Cart"
            >
              <i className="fas fa-plus"></i>
            </button>
            
            <Link
              to={`/products/${product._id}`}
              className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-2xl"
              title="View Details"
            >
              <i className="fas fa-eye"></i>
            </Link>
          </div>

          {/* Out of Stock Overlay */}
          {product.countInStock === 0 && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur-lg border border-white/20 rounded-2xl px-6 py-4 text-center transform group-hover:scale-105 transition-transform duration-300">
                <i className="fas fa-times-circle text-red-500 text-3xl mb-2"></i>
                <p className="text-red-600 font-bold">Out of Stock</p>
                <p className="text-gray-600 text-sm">Notify when available</p>
              </div>
            </div>
          )}

          {/* Premium Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </div>
      </Link>

      {/* Enhanced Product Info Section */}
      <div className="p-6 relative">
        
        {/* Brand with Icon */}
        {product.brand && (
          <div className="flex items-center mb-3">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-2 animate-pulse"></div>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
              {product.brand}
            </span>
            <div className="ml-auto flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                product.countInStock > 10 ? 'bg-green-400' : 
                product.countInStock > 0 ? 'bg-yellow-400' : 'bg-red-400'
              }`}></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {product.countInStock > 10 ? 'In Stock' : 
                 product.countInStock > 0 ? 'Low Stock' : 'Out of Stock'}
              </span>
            </div>
          </div>
        )}

        {/* Enhanced Product Name */}
        <Link to={`/products/${product._id}`}>
          <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 line-clamp-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400">
            {product.name}
          </h3>
        </Link>

        {/* Enhanced Rating with Reviews */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="flex items-center mr-2">
              {[...Array(5)].map((_, i) => (
                <i 
                  key={i} 
                  className={`fas text-sm transition-colors duration-200 ${
                    i < fullStars 
                      ? 'fa-star text-yellow-400 drop-shadow-sm' 
                      : i === fullStars && hasHalfStar 
                        ? 'fa-star-half-alt text-yellow-400 drop-shadow-sm'
                        : 'fa-star text-gray-300 dark:text-gray-600'
                  }`}
                ></i>
              ))}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              ({rating.toFixed(1)})
            </span>
          </div>
          
          {/* Quick Info Icons */}
          <div className="flex items-center space-x-2 text-xs">
            <div className="flex items-center text-blue-500" title="Free Shipping">
              <i className="fas fa-shipping-fast"></i>
            </div>
            <div className="flex items-center text-green-500" title="30-day Returns">
              <i className="fas fa-undo"></i>
            </div>
            <div className="flex items-center text-purple-500" title="Warranty">
              <i className="fas fa-shield-alt"></i>
            </div>
          </div>
        </div>

        {/* Enhanced Price Display with Savings */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
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
            
            {/* Enhanced Savings Badge */}
            {salePrice && (
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 text-green-700 dark:text-green-400 text-xs font-bold px-3 py-1.5 rounded-full border border-green-200 dark:border-green-800">
                <i className="fas fa-piggy-bank mr-1"></i>
                Save ${formatPrice(product.price - salePrice)}
              </div>
            )}
          </div>
          
          {/* Payment Options Hint */}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <i className="fas fa-credit-card mr-1"></i>
            or 4 payments of ${formatPrice((salePrice || product.price) / 4)}
          </div>
        </div>

        {/* Enhanced Action Buttons */}
        <div className="space-y-3">
          {/* Main Add to Cart Button */}
          <button 
            onClick={handleAddToCart}
            disabled={product.countInStock === 0}
            className={`w-full flex items-center justify-center py-3 px-4 rounded-2xl font-semibold transition-all duration-200 relative overflow-hidden group ${
              product.countInStock === 0 
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
            }`}
          >
            {/* Button Shimmer Effect */}
            {product.countInStock > 0 && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            )}
            
            <i className={`fas ${product.countInStock === 0 ? 'fa-times' : 'fa-cart-plus'} mr-2 relative z-10`}></i>
            <span className="relative z-10">
              {product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </span>
          </button>

          {/* Secondary Actions */}
          <div className="flex space-x-2">
            <button 
              onClick={handleAddToWishlist}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-2xl font-semibold transition-all duration-200 border-2 ${
                isInWishlist 
                  ? 'bg-gradient-to-r from-pink-100 to-rose-100 dark:from-pink-900/20 dark:to-rose-900/20 border-pink-200 dark:border-pink-800 text-pink-600 dark:text-pink-400' 
                  : 'bg-white/10 backdrop-blur-lg border-white/20 dark:border-gray-700/20 text-gray-600 dark:text-gray-400 hover:bg-white/20 dark:hover:bg-gray-700/20 hover:text-pink-500 dark:hover:text-pink-400 hover:border-pink-200 dark:hover:border-pink-800'
              }`}
              title={isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
            >
              <i className={`fas fa-heart mr-2 ${isInWishlist ? 'animate-pulse' : ''}`}></i>
              <span className="text-sm">{isInWishlist ? 'Wishlisted' : 'Wishlist'}</span>
            </button>
            
            <button className="flex-1 flex items-center justify-center py-3 px-4 rounded-2xl font-semibold bg-white/10 backdrop-blur-lg border-2 border-white/20 dark:border-gray-700/20 text-gray-600 dark:text-gray-400 hover:bg-white/20 dark:hover:bg-gray-700/20 hover:text-orange-500 dark:hover:text-orange-400 hover:border-orange-200 dark:hover:border-orange-800 transition-all duration-200">
              <i className="fas fa-balance-scale mr-2"></i>
              <span className="text-sm">Compare</span>
            </button>
          </div>
        </div>

        {/* Enhanced Product Features */}
        <div className="mt-4 pt-4 border-t border-white/10 dark:border-gray-700/20">
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="text-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="fas fa-shipping-fast text-white"></i>
              </div>
              <span className="text-gray-600 dark:text-gray-400 font-medium">Free Ship</span>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="fas fa-undo text-white"></i>
              </div>
              <span className="text-gray-600 dark:text-gray-400 font-medium">30-Day Return</span>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="fas fa-shield-alt text-white"></i>
              </div>
              <span className="text-gray-600 dark:text-gray-400 font-medium">Warranty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Hover Effects */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      
      {/* Border Glow Effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 -z-10"></div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fade-in-scale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in-scale {
          animation: fade-in-scale 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default ProductCard;
