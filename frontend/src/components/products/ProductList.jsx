import React from 'react';
import { Link } from 'react-router-dom';

const ProductList = ({ products, onAddToCart, onToggleWishlist, wishlistProductIds = [] }) => {
  const wishlistIdSet = new Set(
    Array.isArray(wishlistProductIds)
      ? wishlistProductIds
      : Array.from(wishlistProductIds || [])
  );
  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div
          key={product._id || product.id}
          className="flex gap-4 rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700/60 dark:bg-slate-900"
        >
          <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
            <img
              src={product.images?.[0] || '/placeholder-product.jpg'}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-1 flex-col justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                {product.name}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {product.brand}
              </p>
              <div className="mt-1 flex items-center gap-1">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={`fas fa-star text-xs ${
                        i < Math.floor(product.rating || 0)
                          ? 'text-yellow-400'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  ({product.reviewCount || 0})
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  ${product.price}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-slate-500 line-through dark:text-slate-400">
                    ${product.originalPrice}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onToggleWishlist(product)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-200 ${
                    wishlistIdSet.has(product._id || product.id)
                      ? 'bg-red-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-red-500 hover:text-white dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  <i className="fas fa-heart text-xs" />
                </button>
                <button
                  onClick={() => onAddToCart(product)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white transition-colors duration-200 hover:bg-blue-600"
                >
                  <i className="fas fa-plus text-xs" />
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
