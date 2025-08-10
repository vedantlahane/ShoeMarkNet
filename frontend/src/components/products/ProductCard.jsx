import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/helpers';

const ProductCard = ({ 
  product, 
  onAddToCart, 
  onToggleWishlist, 
  isInWishlist = false,
  isInCart = false,
  className = '' 
}) => {
  if (!product) return null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (onAddToCart) onAddToCart(product);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    if (onToggleWishlist) onToggleWishlist(product);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ${className}`}>
      <Link to={`/products/${product.slug || product.id}`} className="block">
        <div className="relative">
          <img
            src={product.image || product.images?.[0] || '/placeholder-product.jpg'}
            alt={product.name}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          {product.discount && (
            <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm">
              -{product.discount}%
            </span>
          )}
          <button
            onClick={handleToggleWishlist}
            className={`absolute top-2 right-2 p-2 rounded-full ${
              isInWishlist ? 'bg-red-500 text-white' : 'bg-white text-gray-600'
            } hover:bg-red-500 hover:text-white transition-colors`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
            {product.name}
          </h3>
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-gray-500 line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>
            
            {product.rating && (
              <div className="flex items-center">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-300'}`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-600 ml-1">({product.rating})</span>
              </div>
            )}
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={isInCart}
            className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
              isInCart
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isInCart ? 'In Cart' : 'Add to Cart'}
          </button>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
