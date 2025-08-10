import React from 'react';
import { Link } from 'react-router-dom';

const ProductList = ({ products, onAddToCart, onToggleWishlist, className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {products.map((product, index) => (
        <div 
          key={product._id || `product-${index}`} 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex gap-6">
            {/* Product Image */}
            <div className="flex-shrink-0">
              <Link to={`/products/${product._id}`}>
                <img
                  src={product.images?.[0] || '/product-placeholder.jpg'}
                  alt={product.name}
                  className="w-32 h-32 object-cover rounded-lg hover:opacity-75 transition-opacity duration-200"
                />
              </Link>
            </div>
            
            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-2">
                <Link 
                  to={`/products/${product._id}`}
                  className="text-xl font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                >
                  {product.name}
                </Link>
                <button
                  onClick={() => onToggleWishlist(product)}
                  className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                  aria-label="Add to wishlist"
                >
                  <i className="fas fa-heart"></i>
                </button>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {product.description}
              </p>
              
              <div className="flex items-center gap-4 mb-4">
                {product.rating && (
                  <div className="flex items-center">
                    <div className="flex text-yellow-400 text-sm">
                      {[...Array(5)].map((_, i) => (
                        <i 
                          key={i} 
                          className={`fas fa-star ${i < Math.floor(product.rating) ? '' : 'text-gray-300 dark:text-gray-600'}`}
                        />
                      ))}
                    </div>
                    <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
                      ({product.numReviews || 0})
                    </span>
                  </div>
                )}
                
                {product.brand && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    by {product.brand}
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${product.price}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-lg text-gray-500 line-through">
                      ${product.originalPrice}
                    </span>
                  )}
                </div>
                
                <button
                  onClick={() => onAddToCart(product)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
