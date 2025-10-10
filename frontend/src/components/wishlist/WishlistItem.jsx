import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice, calculateDiscount } from '../../utils/helpers';

const WishlistItem = ({
  item,
  viewMode,
  isSelected,
  isProcessing,
  isInCart,
  onSelect,
  onRemove,
  onAddToCart,
  onShare,
  onAddToCompare,
  className = ''
}) => {
  const discountedPrice = calculateDiscount(item.price, item.discountPercentage);
  const isList = viewMode === 'list';
  const isCompact = viewMode === 'compact';
  
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-theme bg-surface backdrop-blur-xl theme-shadow-soft ${
        isList ? 'md:flex md:items-stretch md:gap-6' : 'flex flex-col'
      } ${className}`}
    >
      <div
        className={`relative overflow-hidden ${
          isList ? 'md:w-56 h-56 md:h-auto' : isCompact ? 'h-44' : 'h-60'
        }`}
      >
        <button
          onClick={() => onSelect(item._id)}
          className={`absolute left-4 top-4 z-10 flex h-6 w-6 items-center justify-center rounded border text-xs transition-colors ${
            isSelected
              ? 'border-theme-strong bg-card text-theme shadow-focus'
              : 'border-theme bg-surface text-muted-theme hover:border-theme-strong'
          }`}
        >
          {isSelected && <i className="fas fa-check"></i>}
        </button>

        <Link to={`/products/${item._id}`} className="block h-full w-full">
          <img
            src={item.images?.[0] || '/product-placeholder.jpg'}
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </Link>

  <div className="absolute right-4 top-4 flex flex-col gap-2 text-[10px] font-semibold uppercase tracking-wide text-white">
          {item.discountPercentage > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/80 px-2 py-1">
              <i className="fas fa-percentage"></i>
              {item.discountPercentage}% off
            </span>
          )}
          {item.isNew && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/80 px-2 py-1">
              <i className="fas fa-sparkles"></i>
              New
            </span>
          )}
          {item.countInStock <= 5 && item.countInStock > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/80 px-2 py-1">
              <i className="fas fa-clock"></i>
              {item.countInStock} left
            </span>
          )}
        </div>

        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/70 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <button
            onClick={() => onShare(item)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-theme bg-surface text-white transition-colors hover:border-theme-strong"
            title="Share"
          >
            <i className="fas fa-share"></i>
          </button>
          <Link
            to={`/products/${item._id}`}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-theme bg-surface text-white transition-colors hover:border-theme-strong"
            title="View"
          >
            <i className="fas fa-eye"></i>
          </Link>
          <button
            onClick={() => onAddToCompare(item)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-theme bg-surface text-white transition-colors hover:border-theme-strong"
            title="Compare"
          >
            <i className="fas fa-balance-scale"></i>
          </button>
        </div>

        <button
          onClick={() => onRemove(item._id, item.name)}
          disabled={isProcessing}
          className="absolute left-4 bottom-4 flex h-9 w-9 items-center justify-center rounded-full border border-theme bg-surface text-red-500 transition-colors hover:border-red-500 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-60"
          title="Remove from wishlist"
        >
          {isProcessing ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
          ) : (
            <i className="fas fa-trash"></i>
          )}
        </button>
      </div>

      <div className={`${isList ? 'flex-1 py-6 pr-6' : 'flex flex-1 flex-col p-6'}`}>
        <div className={`${isList ? 'flex h-full flex-col justify-between' : 'flex flex-col gap-4'}`}>
          <div className="space-y-3 text-theme">
            {item.brand && (
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-theme">
                {item.brand}
              </span>
            )}

            <Link to={`/products/${item._id}`} className="text-lg font-semibold text-theme transition-colors hover:text-primary-500">
              {item.name}
            </Link>

            <div className="text-sm text-muted-theme">
              {discountedPrice ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-semibold text-theme">{formatPrice(discountedPrice)}</span>
                  <span className="text-xs text-muted-theme line-through opacity-70">{formatPrice(item.price)}</span>
                  <span className="text-xs text-emerald-300">save {formatPrice(item.price - discountedPrice)}</span>
                </div>
              ) : (
                <span className="text-xl font-semibold text-theme">{formatPrice(item.price)}</span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
              <span
                className={`${
                  item.countInStock > 0 ? 'text-emerald-300' : 'text-red-300'
                }`}
              >
                {item.countInStock > 0 ? `${item.countInStock} in stock` : 'Out of stock'}
              </span>
              {item.countInStock > 0 && item.countInStock <= 5 && (
                <span className="text-amber-300">low stock</span>
              )}
            </div>
          </div>

          <div className={`mt-6 flex flex-col gap-2 ${isList ? 'md:flex-row md:items-center md:gap-3' : ''}`}>
            <button
              onClick={() => onAddToCart(item)}
              disabled={item.countInStock === 0 || isProcessing}
              className={`inline-flex h-11 w-full items-center justify-center rounded-xl border px-4 text-sm font-semibold transition-colors ${
                item.countInStock === 0 || isProcessing
                  ? 'cursor-not-allowed border-theme bg-surface text-muted-theme'
                  : isInCart
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 dark:text-emerald-200'
                  : 'border-theme bg-primary-500/90 text-white hover:bg-primary-500'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Processing
                </>
              ) : (
                <>
                  <i className={`fas ${item.countInStock === 0 ? 'fa-ban' : isInCart ? 'fa-check' : 'fa-cart-plus'} mr-2`}></i>
                  {item.countInStock === 0 ? 'Out of stock' : isInCart ? 'In cart' : 'Add to cart'}
                </>
              )}
            </button>

            <div className={`flex gap-2 ${isList ? 'md:flex-1' : ''}`}>
              <Link
                to={`/products/${item._id}`}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-theme px-4 text-sm font-semibold text-muted-theme transition-colors hover:border-theme-strong hover:text-theme"
              >
                <i className="fas fa-eye mr-2"></i>
                View
              </Link>
              <button
                onClick={() => onAddToCompare(item)}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-theme px-4 text-sm font-semibold text-muted-theme transition-colors hover:border-theme-strong hover:text-theme"
              >
                <i className="fas fa-balance-scale mr-2"></i>
                Compare
              </button>
            </div>
          </div>

          {!isCompact && (
            <div className="mt-6 grid grid-cols-3 gap-4 text-[11px] uppercase tracking-wide text-muted-theme">
              <span className="flex items-center gap-1">
                <i className="fas fa-shipping-fast text-muted-theme"></i>
                Free ship
              </span>
              <span className="flex items-center gap-1">
                <i className="fas fa-undo text-muted-theme"></i>
                Easy returns
              </span>
              <span className="flex items-center gap-1">
                <i className="fas fa-shield-alt text-muted-theme"></i>
                Warranty
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WishlistItem;
