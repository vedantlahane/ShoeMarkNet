import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ProductCard = ({ product, onAddToCart, onToggleWishlist, isWishlisted, index }) => {
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

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: (index || 0) * 0.05,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group relative flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-2xl dark:hover:shadow-blue-500/10"
    >
      {/* Product Image Container */}
      <div className="relative overflow-hidden rounded-t-2xl bg-gray-50">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 opacity-50"></div>

        {/* Main Image */}
        <div className="relative aspect-square overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 flex animate-pulse items-center justify-center bg-slate-200 dark:bg-slate-800">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-blue-500 dark:border-slate-700 dark:border-t-blue-500"></div>
            </div>
          )}
          <img
            src={image}
            alt={name}
            className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${
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
          <div className="absolute top-3 left-3 rounded-full bg-gradient-to-r from-red-500 to-pink-500 px-3 py-1 text-xs font-bold text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
            -{discount}%
          </div>
        )}

        {/* Stock Status Badge */}
        <div
          className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-semibold shadow-lg transition-all duration-300 ${
            isInStock
              ? 'bg-green-100 text-green-800 group-hover:bg-green-200 dark:bg-green-900/70 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900/70 dark:text-red-200'
          }`}
        >
          {isInStock ? 'In Stock' : 'Out of Stock'}
        </div>

        {/* Quick Actions Overlay */}
        <div
          className={`absolute bottom-0 left-0 right-0 flex justify-center space-x-2 bg-gradient-to-t from-black/60 to-transparent p-4 transform transition-all duration-300 ease-in-out ${
            isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          }`}
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleWishlist(product);
            }}
            className={`relative h-10 w-10 rounded-full bg-white/20 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/30 ${
              isWishlisted ? 'text-pink-500' : ''
            }`}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <i className={`fas fa-heart transition-transform duration-300 ${isWishlisted ? 'scale-110' : ''}`}></i>
            {isWishlisted && (
              <span className="absolute top-0 right-0 h-3 w-3 animate-ping rounded-full bg-pink-400 opacity-75"></span>
            )}
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              // Quick view functionality
              console.log('Quick view:', product);
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
            title="Quick View"
          >
            <i className="fas fa-eye"></i>
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Brand */}
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {brand}
        </div>

        {/* Product Name */}
        <h3 className="mb-2 text-base font-bold text-slate-800 line-clamp-2 transition-colors duration-300 group-hover:text-blue-600 dark:text-slate-100 dark:group-hover:text-blue-400">
          <Link to={`/products/${slug || id}`} className="focus:outline-none">
            <span className="absolute inset-0" aria-hidden="true" />
            {name}
          </Link>
        </h3>

        {/* Rating */}
        {rating > 0 && (
          <div className="mb-3 flex items-center">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <i
                  key={i}
                  className={`text-sm transition-colors duration-300 fas fa-star ${
                    i < Math.floor(rating)
                      ? 'text-yellow-400 group-hover:text-yellow-500'
                      : 'text-slate-300 dark:text-slate-600'
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">({rating.toFixed(1)})</span>
          </div>
        )}

        {/* Price */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="text-xl font-bold text-slate-900 dark:text-white">${price}</span>
            {originalPrice && (
              <span className="text-sm text-slate-500 line-through dark:text-slate-400">
                ${originalPrice}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-3">
          {onAddToCart && isInStock && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onAddToCart(product);
              }}
              className="relative z-10 flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 py-2.5 px-4 font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/30 active:scale-95 dark:shadow-blue-500/30"
              title="Add to Cart"
            >
              <span className="flex items-center justify-center gap-2">
                <i className="fas fa-cart-plus"></i>
                <span>Add to Cart</span>
              </span>
            </button>
          )}
          {!isInStock && (
             <div className="relative z-10 flex-1 rounded-xl border border-slate-300 bg-slate-100 py-2.5 px-4 text-center font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
              Out of Stock
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
