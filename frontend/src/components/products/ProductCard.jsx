import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Eye,
  Zap,
  TrendingUp,
  Award,
  ShoppingCart
} from 'lucide-react';

// Redux
import { addToCart } from '../../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../redux/slices/wishlistSlice';

// Utils
import { formatCurrency } from '../../utils/helpers';
import { showCartToast, showWishlistToast, showErrorToast } from '../../utils/toast';

// Hooks
import useReducedMotion from '../../hooks/useReducedMotion';

const defaultProduct = {
  name: 'Product',
  brand: '',
  price: 0,
  images: ['https://via.placeholder.com/400x500?text=Product']
};

const ProductCard = ({
  product = {},
  variant = 'default', // default, compact, featured, grid
  showActionsProp = true,
  showQuickView = true,
  className = '',
  onQuickView = null,
  index = 0,
  onAddToCart = null,
  onToggleWishlist = null
}) => {
  const cardRef = useRef(null);
  const imageRef = useRef(null);
  const actionsRef = useRef(null);
  const badgeRef = useRef(null);

  const productData = { ...product };
  const productId = productData._id || productData.id;
  const productSlug = productData.slug || productId;
  const dispatch = useDispatch();

  // Redux state
  const wishlistItems = useSelector(state => state.wishlist?.items || []);
  const { items: cartItems } = useSelector(state => state.cart || { items: [] });

  // Local state
  const [currentImage, setCurrentImage] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');

  const prefersReducedMotion = useReducedMotion();

  const availableSizes = useMemo(() => {
    const rawSizes = productData?.sizes;
    if (!Array.isArray(rawSizes)) return [];

    return rawSizes
      .map(entry => {
        if (typeof entry === 'string') return entry;
        if (entry && typeof entry === 'object') return entry.size;
        return null;
      })
      .filter(Boolean)
      .slice(0, 6);
  }, [productData?.sizes]);

  const productImages = Array.isArray(productData.images) && productData.images.length > 0
    ? productData.images
    : defaultProduct.images;

  const primaryImage = productImages[0];
  const secondaryImage = productImages[1];

  const discountPercentage = useMemo(() => {
    if (productData.discount) return Math.round(productData.discount);
    if (productData.discountPercentage) return Math.round(productData.discountPercentage);
    if (productData.originalPrice && productData.originalPrice > productData.price) {
      const discount = 100 - (productData.price / productData.originalPrice) * 100;
      return Math.round(discount);
    }
    return null;
  }, [productData.discount, productData.discountPercentage, productData.originalPrice, productData.price]);

  useEffect(() => {
    if (!secondaryImage) return;
    const targetIndex = isHovered ? 1 : 0;
    setCurrentImage(prev => (prev === targetIndex ? prev : targetIndex));
  }, [isHovered, secondaryImage]);

  const isInWishlist = wishlistItems.some(item => (item.id || item._id) === productId);
  const isInCart = cartItems.some(item => {
    const cartProductId = item.productId || item.product?._id || item.product?.id || item.product;
    const variantSize = item.variant?.size || item.size;
    if (availableSizes.length > 0 && variantSize) {
      return cartProductId === productId && variantSize === selectedSize;
    }
    return cartProductId === productId;
  });

  // Set default size
  useEffect(() => {
    if (availableSizes.length === 0) {
      setSelectedSize('');
      return;
    }

    setSelectedSize(prev => (prev && availableSizes.includes(prev) ? prev : availableSizes[0]));
  }, [availableSizes]);

  const [isCardVisible, setIsCardVisible] = useState(() => prefersReducedMotion);

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsCardVisible(true);
      return undefined;
    }

    let mounted = true;
    const timeout = window.setTimeout(() => {
      if (mounted) {
        setIsCardVisible(true);
      }
    }, Math.min(500, index * 80));

    return () => {
      mounted = false;
      window.clearTimeout(timeout);
    };
  }, [index, prefersReducedMotion]);

  useEffect(() => {
    if (isHovered) {
      setShowActions(true);
      return undefined;
    }

    const timeout = window.setTimeout(() => setShowActions(false), 150);
    return () => window.clearTimeout(timeout);
  }, [isHovered]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const triggerButtonFeedback = useCallback((element) => {
    if (prefersReducedMotion || !element?.animate) {
      return;
    }

    element.animate(
      [
        { transform: 'scale(1)' },
        { transform: 'scale(0.95)' },
        { transform: 'scale(1)' }
      ],
      {
        duration: 180,
        easing: 'ease-in-out'
      }
    );
  }, [prefersReducedMotion]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!productData.inStock) {
      showErrorToast("This product is currently out of stock");
      return;
    }

    if (availableSizes.length > 0 && !selectedSize) {
      showErrorToast('Please select a size first');
      return;
    }

    let addResult;

    if (typeof onAddToCart === 'function') {
      addResult = onAddToCart({
        product: productData,
        productId,
        size: selectedSize || undefined
      });
    } else {
      dispatch(addToCart({
        productId,
        quantity: 1,
        product: productData,
        size: selectedSize || undefined
      }));
      addResult = 'added';
    }

    triggerButtonFeedback(e.currentTarget);

    if (addResult !== false) {
      showCartToast.added(productData.name);
    }
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    let wishlistResult;

    if (typeof onToggleWishlist === 'function') {
      wishlistResult = onToggleWishlist({
        product: productData,
        productId,
        isInWishlist
      });
    } else {
      if (isInWishlist) {
        dispatch(removeFromWishlist(productId));
        wishlistResult = 'removed';
      } else {
        dispatch(addToWishlist(productData));
        wishlistResult = 'added';
      }
    }

    triggerButtonFeedback(e.currentTarget);

    if (wishlistResult === 'added') {
      showWishlistToast.added(productData.name);
    } else if (wishlistResult === 'removed') {
      showWishlistToast.removed(productData.name);
    }
  };

  const getBadgeInfo = () => {
    if (productData.isNew) return { text: 'NEW', color: 'bg-gradient-accent', icon: Zap };
    if (productData.isTrending) return { text: 'TRENDING', color: 'bg-gradient-secondary', icon: TrendingUp };
    if (productData.isBestseller) return { text: 'BESTSELLER', color: 'bg-gradient-gold', icon: Award };
    return null;
  };

  const badgeInfo = getBadgeInfo();

  const renderStars = () => {
    const rating = Number(productData.rating ?? 0);
    const stars = [];

    for (let i = 0; i < 5; i += 1) {
      const isFilled = rating >= i + 1;
      stars.push(
        <span
          key={i}
          className={`h-2 w-2 rounded-full ${isFilled ? 'bg-yellow-400' : 'bg-slate-300 dark:bg-slate-600'
            }`}
        />
      );
    }

    return <div className="flex items-center gap-1">{stars}</div>;
  };

  // Compact variant
  if (variant === 'compact') {
    return (
      <div
        ref={cardRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        className={`card-premium p-4 flex items-center space-x-4 transition-all duration-300 ${isCardVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          } ${className}`}
        style={prefersReducedMotion ? undefined : { transitionDelay: `${index * 60}ms` }}
      >
        <div className="flex-shrink-0">
          <img
            src={productData.images[0]}
            alt={productData.name}
            className={`w-16 h-16 rounded-xl object-cover transition-transform duration-300 ${isHovered ? 'scale-105' : 'scale-100'
              }`}
            onLoad={() => setIsImageLoaded(true)}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 dark:text-white truncate">{productData.name}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 truncate">{productData.brand}</p>
          <div className="flex items-center space-x-2 mt-1">
            <span className="font-bold text-cyan-600 dark:text-cyan-400">{formatCurrency(productData.price)}</span>
            {productData.originalPrice > productData.price && (
              <span className="text-xs text-slate-500 dark:text-slate-400 line-through">
                {formatCurrency(productData.originalPrice)}
              </span>
            )}
          </div>
        </div>

        <div className="flex-shrink-0">
          <button
            onClick={handleAddToCart}
            className="p-2 glass rounded-lg hover:glass transition-all duration-200"
          >
            <ShoppingBag size={16} className="text-white" />
          </button>
        </div>
      </div>
    );
  }

  // Featured variant
  if (variant === 'featured') {
    return (
      <div
        ref={cardRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        className={`card-premium overflow-hidden relative group transition-all duration-300 ${isCardVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          } ${className}`}
        style={prefersReducedMotion ? undefined : { transitionDelay: `${index * 60}ms` }}
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            ref={imageRef}
            src={productData.images[0]}
            alt={productData.name}
            className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'
              }`}
            onLoad={() => setIsImageLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        </div>

        {/* Badge */}
        {getBadgeInfo() && (
          <div
            ref={badgeRef}
            className={`absolute top-4 left-4 ${getBadgeInfo().color} px-3 py-1 rounded-full text-xs font-bold text-white flex items-center space-x-1`}
          >
            {React.createElement(getBadgeInfo().icon, { size: 12 })}
            <span>{getBadgeInfo().text}</span>
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 p-6 h-full flex flex-col justify-end">
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-white mb-2">{productData.name}</h3>
            <p className="text-blue-200 mb-3">{productData.brand}</p>
            {availableSizes.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {availableSizes.map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      setSelectedSize(size);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${selectedSize === size
                        ? 'bg-white text-slate-900 shadow-lg'
                        : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    aria-label={`Select size ${size}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center space-x-1 mb-4">
              {renderStars()}
              <span className="text-sm text-gray-300 ml-2">({productData.reviewCount})</span>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold text-white">
                {formatCurrency(productData.price)}
              </span>
              {productData.originalPrice > productData.price && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    {formatCurrency(productData.originalPrice)}
                  </span>
                  <span className="bg-gradient-secondary px-2 py-1 rounded-full text-xs font-bold text-white">
                    -{productData.discount}%
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleAddToCart}
              disabled={!productData.inStock}
              className="btn-premium flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart size={20} className="mr-2" />
              {productData.inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>

            <button
              onClick={handleToggleWishlist}
              className={`p-3 rounded-xl transition-all duration-300 ${isInWishlist
                  ? 'bg-red-500 text-white'
                  : 'glass text-white hover:glass'
                }`}
            >
              <Heart size={20} className={isInWishlist ? 'fill-current' : ''} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <Link
      to={`/products/${productSlug}`}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
    >
      <article
        ref={cardRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        className={`group relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900/50 transition-all duration-300 ${isCardVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-3 scale-98'
          } ${isHovered ? 'shadow-lg border-slate-300/80 dark:border-slate-700/80' : 'shadow-sm'
          } ${className}`}
        style={prefersReducedMotion ? undefined : { transitionDelay: `${index * 50}ms` }}
      >
        <div className="relative aspect-[1/1] overflow-hidden bg-slate-100 dark:bg-slate-800/40">
          <img
            ref={imageRef}
            src={productImages[currentImage] || primaryImage}
            alt={productData.name}
            className={`h-full w-full object-cover transition-transform duration-500 ${isHovered ? 'scale-105' : 'scale-100'}`}
            onLoad={() => setIsImageLoaded(true)}
            loading="lazy"
          />
          {!isImageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-slate-200/60 dark:bg-slate-700/40" />
          )}

          {badgeInfo && (
            <div
              ref={badgeRef}
              className={`badge absolute left-2 top-2 flex items-center gap-1.5 rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white ${badgeInfo.color}`}
            >
              {React.createElement(badgeInfo.icon, { size: 10 })}
              <span>{badgeInfo.text}</span>
            </div>
          )}

          {discountPercentage && (
            <span className="absolute right-2 top-2 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-semibold text-white">
              -{discountPercentage}%
            </span>
          )}

          {showActionsProp && (
            <div
              ref={actionsRef}
              className={`absolute right-2 top-9 flex flex-col gap-1.5 transition-all duration-200 ${isHovered && showActions ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0 pointer-events-none'
                }`}
            >
              <button
                onClick={handleToggleWishlist}
                className={`flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/70 text-white transition-colors duration-150 ${isInWishlist ? 'bg-rose-500 hover:bg-rose-600' : 'hover:bg-slate-800'
                  }`}
                aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart size={14} className={isInWishlist ? 'fill-current' : ''} />
              </button>

              {onQuickView && showQuickView && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onQuickView(productData);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/70 text-white transition-colors duration-150 hover:bg-blue-500"
                  aria-label="Quick view product"
                >
                  <Eye size={14} />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-2.5">
          <div className="space-y-0.5">
            <h3 className="text-[13px] font-medium text-slate-900 dark:text-white transition-colors duration-150 group-hover:text-blue-600 dark:group-hover:text-blue-300 line-clamp-1">
              {productData.name}
            </h3>
            {productData.brand && (
              <p className="text-xs text-slate-500 dark:text-slate-400">{productData.brand}</p>
            )}
          </div>

          <div className="mt-auto flex items-center justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {formatCurrency(productData.price)}
              </span>
              {productData.originalPrice > productData.price && (
                <span className="text-[10px] text-slate-400 line-through">
                  {formatCurrency(productData.originalPrice)}
                </span>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default ProductCard;
