import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/helpers';

const ProductList = ({ products, onAddToCart, onToggleWishlist, wishlistProductIds = [], className = '' }) => {
  const wishlistIdSet = new Set(
    Array.isArray(wishlistProductIds)
      ? wishlistProductIds
      : Array.from(wishlistProductIds || [])
  );
  return (
    <div className={`space-y-4 ${className}`}>
      {products.map((product, index) => {
        const productId = product._id || product.id || product.productId;
        const inWishlist = wishlistIdSet.has(productId);
        const isInStock = typeof product.inStock === 'boolean'
          ? product.inStock
          : typeof product.stock === 'number'
            ? product.stock > 0
            : typeof product.countInStock === 'number'
              ? product.countInStock > 0
              : true;
        const price = typeof product.price === 'number' ? product.price : Number(product.price) || 0;
        const originalPrice = typeof product.originalPrice === 'number'
          ? product.originalPrice
          : Number(product.originalPrice) || null;
        const ratingCount = product.numReviews || product.reviewCount || 0;

        return (
          <div 
            key={productId || `product-${index}`} 
            className="group rounded-2xl border border-white/30 bg-white/60 p-6 shadow-[0_25px_45px_-24px_rgba(15,23,42,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_35px_65px_-28px_rgba(15,23,42,0.45)] dark:border-slate-800/60 dark:bg-slate-900/60"
          >
            <div className="flex flex-col gap-6 md:flex-row">
              {/* Product Image */}
              <div className="w-full flex-shrink-0 md:w-40">
                <Link to={`/products/${product._id || product.id}`} className="block overflow-hidden rounded-2xl">
                  <img
                    src={product.images?.[0] || '/product-placeholder.jpg'}
                    alt={product.name}
                    className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>
              </div>
              
              {/* Product Info */}
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-start justify-between gap-4">
                  <Link 
                    to={`/products/${product._id || product.id}`}
                    className="text-xl font-semibold text-gray-900 transition-colors duration-200 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
                  >
                    {product.name}
                  </Link>
                  <button
                    onClick={() => onToggleWishlist?.(product)}
                    className={`rounded-full p-2 transition-colors duration-200 ${
                      inWishlist ? 'text-red-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'
                    }`}
                    aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                    aria-pressed={inWishlist}
                  >
                    <i className={`fas fa-heart text-lg ${inWishlist ? '' : 'opacity-60'}`}></i>
                  </button>
                </div>
                
                <p className="mb-3 line-clamp-2 text-gray-600 dark:text-gray-400">
                  {product.description}
                </p>
                
                <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
                  {product.brand && (
                    <span className="rounded-full bg-white/70 px-3 py-1 font-medium text-gray-700 shadow-sm dark:bg-slate-800/70 dark:text-gray-200">
                      {product.brand}
                    </span>
                  )}
                  <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                    isInStock
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
                  }`}>
                    <i className={`fas fa-${isInStock ? 'check-circle' : 'exclamation-triangle'}`}></i>
                    {isInStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                  {product.gender && (
                    <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-slate-800/70 dark:text-gray-300">
                      {product.gender}
                    </span>
                  )}
                </div>
                
                {(product.rating || ratingCount > 0) && (
                  <div className="mb-4 flex items-center">
                    <div className="flex text-sm text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <i 
                          key={i} 
                          className={`fas fa-star ${i < Math.floor(product.rating || 0) ? '' : 'text-gray-300 dark:text-gray-600'}`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      ({ratingCount})
                    </span>
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(price)}
                    </span>
                    {originalPrice && originalPrice > price && (
                      <span className="text-lg text-gray-500 line-through">
                        {formatCurrency(originalPrice)}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => onAddToCart?.(product)}
                      disabled={!isInStock}
                      className={`rounded-2xl px-6 py-3 font-semibold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 ${
                        isInStock
                          ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500'
                          : 'cursor-not-allowed bg-gray-200 text-gray-500 dark:bg-slate-800 dark:text-gray-400'
                      }`}
                    >
                      <i className="fas fa-shopping-bag mr-2"></i>
                      {isInStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                    <Link
                      to={`/products/${product._id || product.id}`}
                      className="rounded-2xl border border-white/40 bg-white/60 px-6 py-3 font-semibold text-gray-900 shadow-sm transition-colors duration-200 hover:bg-white/80 dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-white dark:hover:bg-slate-900"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductList;
