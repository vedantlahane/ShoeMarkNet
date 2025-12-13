import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';

import { formatCurrency } from '../../utils/helpers';

const ProductList = ({ products = [], onAddToCart, onToggleWishlist, wishlistProductIds = [] }) => {
  const wishlistIdSet = useMemo(() => {
    if (wishlistProductIds instanceof Set) {
      return wishlistProductIds;
    }

    return new Set(Array.isArray(wishlistProductIds) ? wishlistProductIds : []);
  }, [wishlistProductIds]);

  if (!Array.isArray(products) || products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {products.map((product) => {
        const productId = product?._id || product?.id;
        const productSlug = product?.slug || productId || '';
        const price = Number(product?.price ?? 0);
        const originalPrice = Number(product?.originalPrice ?? 0);
        const hasDiscount = originalPrice > price;
        const ratingValue = Number(product?.rating ?? 0);
        const reviewCount = Number(product?.reviewCount ?? 0);
        const discountPercent = hasDiscount
          ? Math.max(0, Math.round(((originalPrice - price) / originalPrice) * 100))
          : null;
        const stockCount = product?.calculatedCountInStock ?? product?.countInStock;
        const isInStock = product?.inStock ?? (typeof stockCount === 'number' ? stockCount > 0 : true);
        const stockLabel = isInStock ? 'In stock' : 'Out of stock';
        const isWishlisted = productId ? wishlistIdSet.has(productId) : false;
        const productDescription = product?.shortDescription || product?.description;

        const handleWishlistClick = (event) => {
          event.preventDefault();
          event.stopPropagation();
          onToggleWishlist?.(product);
        };

        const handleAddToCartClick = (event) => {
          event.preventDefault();
          event.stopPropagation();
          onAddToCart?.(product);
        };

        return (
          <Link
            key={productId || product?.name}
            to={productSlug ? `/products/${productSlug}` : '#'}
            className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900"
          >
            <article className="group flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:flex-row sm:p-5 dark:border-slate-700/60 dark:bg-slate-900/70">
              <div className="relative h-40 w-full flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-40 sm:w-40 dark:bg-slate-800">
                <img
                  src={product?.images?.[0] || '/placeholder-product.jpg'}
                  alt={product?.name || 'Product image'}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />

                {discountPercent ? (
                  <span className="absolute left-3 top-3 rounded-full bg-rose-500/90 px-2.5 py-1 text-xs font-semibold text-white">
                    -{discountPercent}%
                  </span>
                ) : null}
              </div>

              <div className="flex flex-1 flex-col justify-between gap-4">
                <header className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-500/80 dark:text-blue-300/80">
                        {typeof product?.category === 'object'
                          ? product?.category?.name || product?.category?.title || 'Featured'
                          : product?.category || 'Featured'}
                      </p>
                      <h3 className="text-lg font-semibold text-slate-900 transition-colors duration-150 group-hover:text-blue-600 dark:text-slate-100 dark:group-hover:text-blue-200">
                        {product?.name || 'Untitled product'}
                      </h3>
                      {product?.brand && (
                        <p className="text-sm text-slate-500 dark:text-slate-400">{product.brand}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleWishlistClick}
                      className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200 ${
                        isWishlisted
                          ? 'bg-rose-500 text-white hover:bg-rose-600'
                          : 'bg-slate-100 text-slate-500 hover:bg-rose-100 hover:text-rose-500 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-rose-500/20 dark:hover:text-rose-200'
                      }`}
                      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <Heart size={18} className={isWishlisted ? 'fill-current' : ''} />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 font-medium text-amber-600 dark:bg-amber-500/20 dark:text-amber-300">
                      <Star size={14} className="text-amber-400" />
                      {ratingValue > 0 ? ratingValue.toFixed(1) : 'New'}
                      {reviewCount > 0 && <span className="text-xs text-slate-400">({reviewCount})</span>}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                        isInStock
                          ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300'
                          : 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300'
                      }`}
                    >
                      {stockLabel}
                    </span>
                  </div>

                  {productDescription && (
                    <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                      {productDescription}
                    </p>
                  )}
                </header>

                <footer className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-baseline gap-3">
                    <span className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                      {formatCurrency(price)}
                    </span>
                    {hasDiscount && (
                      <span className="text-sm text-slate-400 line-through dark:text-slate-500">
                        {formatCurrency(originalPrice)}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToCartClick}
                    disabled={!isInStock}
                    className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                      isInStock
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500'
                        : 'cursor-not-allowed bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500'
                    }`}
                    aria-label="Add product to cart"
                  >
                    <ShoppingBag size={18} />
                    <span>{isInStock ? 'Add to cart' : 'Out of stock'}</span>
                  </button>
                </footer>
              </div>
            </article>
          </Link>
        );
      })}
    </div>
  );
};

export default ProductList;
