import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product, onAddToCart }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Simple fallback for missing product data
  const {
    _id,
    id = _id || '1',
    name = 'Sample Product',
    brand = 'Brand',
    price = 99.99,
    originalPrice,
    images = [],
    image = images[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop',
    rating = 0,
    inStock = true,
    countInStock = 0,
    slug
  } = product || {};

  const isInStock = inStock && countInStock > 0;
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <div
      className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Container */}
      <div className="relative overflow-hidden rounded-t-2xl bg-gray-50">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 opacity-50"></div>

        {/* Main Image */}
        <div className="relative aspect-square overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          )}
          <img
            src={image}
            alt={name}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Overlay on Hover */}
          <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}></div>
        </div>

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg transform transition-transform duration-300 group-hover:scale-110">
            -{discount}%
          </div>
        )}

        {/* Stock Status Badge */}
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold shadow-lg transition-all duration-300 ${
          isInStock
            ? 'bg-green-500 text-white group-hover:bg-green-600'
            : 'bg-red-500 text-white'
        }`}>
          {isInStock ? 'In Stock' : 'Out of Stock'}
        </div>

        {/* Quick Actions Overlay */}
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transform transition-transform duration-300 ${
          isHovered ? 'translate-y-0' : 'translate-y-full'
        }`}>
          <div className="flex justify-center space-x-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                // Add to wishlist functionality
                console.log('Add to wishlist:', product);
              }}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              title="Add to Wishlist"
            >
              <i className="fas fa-heart"></i>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                // Quick view functionality
                console.log('Quick view:', product);
              }}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              title="Quick View"
            >
              <i className="fas fa-eye"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-6">
        {/* Brand */}
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          {brand}
        </div>

        {/* Product Name */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
          {name}
        </h3>

        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center mb-3">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <i
                  key={i}
                  className={`fas fa-star text-sm transition-colors duration-300 ${
                    i < Math.floor(rating)
                      ? 'text-yellow-400 group-hover:text-yellow-500'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-2">({rating})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900">${price}</span>
            {originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ${originalPrice}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2">
          <Link
            to={`/products/${slug || id}`}
            className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium text-center group-hover:bg-blue-50 group-hover:text-blue-600"
          >
            View Details
          </Link>
          {onAddToCart && isInStock && (
            <button
              onClick={() => onAddToCart(product)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 font-medium flex items-center justify-center gap-2"
              title="Add to Cart"
            >
              <i className="fas fa-cart-plus"></i>
              <span className="hidden sm:inline">Add</span>
            </button>
          )}
        </div>
      </div>

      {/* Hover Effect Border */}
      <div className={`absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-400 transition-all duration-300 pointer-events-none ${
        isHovered ? 'border-blue-400' : ''
      }`}></div>
    </div>
  );
};

export default ProductCard;
