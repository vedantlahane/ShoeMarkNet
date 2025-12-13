import React from 'react';
import ProductCard from '../products/ProductCard';

const SearchResults = ({
  results,
  viewMode,
  animateResults,
  onAddToCart,
  onToggleWishlist,
  isProductInWishlist,
  isProductInCart
}) => {
  if (viewMode === 'grid') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${
        animateResults ? 'animate-fade-in-up' : 'opacity-0'
      }`}>
        {results.map((product, index) => (
          <ProductCard
            key={product._id}
            product={product}
            index={index}
            onAddToCart={() => onAddToCart(product)}
            onToggleWishlist={() => onToggleWishlist(product)}
            isInWishlist={isProductInWishlist(product._id)}
            isInCart={isProductInCart(product._id)}
            animateCards={animateResults}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${animateResults ? 'animate-fade-in-up' : 'opacity-0'}`}>
      {results.map((product, index) => (
        <div key={product._id} className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/4">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover rounded-xl"
              />
            </div>
            <div className="md:w-3/4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {product.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {product.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-blue-600">
                  ${product.price}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onToggleWishlist(product)}
                    className={`p-2 rounded-xl transition-all duration-200 ${
                      isProductInWishlist(product._id)
                        ? 'bg-red-500 text-white'
                        : 'bg-white/20 text-gray-600 dark:text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <i className="fas fa-heart"></i>
                  </button>
                  <button
                    onClick={() => onAddToCart(product)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl transition-all duration-200"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchResults;
