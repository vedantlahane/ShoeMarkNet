import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import {
  Heart,
  ShoppingBag,
  Star,
  Eye,
  Zap,
  TrendingUp,
  Award,
  ShoppingCart
} from 'lucide-react';

// Redux
import { addToCart } from '../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice';

// Utils
import { formatCurrency } from '../utils/helpers';
import { showCartToast, showWishlistToast, showErrorToast } from '../utils/toast';

// Hooks
import useGsap from '../hooks/useGsap';
import useReducedMotion from '../hooks/useReducedMotion';

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
  const imageRef = useRef(null);
  const actionsRef = useRef(null);
  const badgeRef = useRef(null);

  // Default product data
  const defaultProduct = {
    id: '1',
    name: 'Premium Running Shoes',
    brand: 'ShoeMarkNet',
    price: 129.99,
    originalPrice: 159.99,
    discount: 19,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=400&auto=format&fit=crop'
    ],
    rating: 4.8,
    reviewCount: 156,
    isNew: false,
    isTrending: false,
    isBestseller: false,
    inStock: true,
    category: 'Running Shoes'
  };

  const productData = { ...defaultProduct, ...product };
  const productId = productData._id || productData.id;
  const productSlug = productData.slug || productId;
  const dispatch = useDispatch();
  
  // Redux state
  const { items: wishlistItems } = useSelector(state => state.wishlist || { items: [] });
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

  const displayedSizes = useMemo(() => availableSizes.slice(0, 4), [availableSizes]);
  const remainingSizeCount = Math.max(availableSizes.length - displayedSizes.length, 0);

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

  const ratingValue = Number(productData.rating ?? defaultProduct.rating ?? 0);
  const reviewCount = Number(productData.reviewCount ?? defaultProduct.reviewCount ?? 0);
  const ratingLabel = ratingValue > 0 ? ratingValue.toFixed(1) : 'New';
  const reviewLabel = reviewCount > 0 ? `${reviewCount.toLocaleString()} reviews` : 'Be the first to review';

  const categoryLabel = useMemo(() => {
    if (!productData.category) return null;
    if (typeof productData.category === 'string') return productData.category;
    return productData.category?.name || productData.category?.title || null;
  }, [productData.category]);

  const stockStatus = useMemo(() => {
    const status = productData.stockStatus;
    if (status === 'out-of-stock') {
      return { label: 'Out of stock', badgeClass: 'bg-rose-500/15 text-rose-300', dotClass: 'bg-rose-400' };
    }
    if (status === 'low-stock') {
      return { label: 'Low stock', badgeClass: 'bg-amber-500/15 text-amber-300', dotClass: 'bg-amber-400' };
    }

    const total = productData.calculatedCountInStock ?? productData.countInStock ?? (productData.inStock ? 10 : 0);
    if (!productData.inStock || total <= 0) {
      return { label: 'Out of stock', badgeClass: 'bg-rose-500/15 text-rose-300', dotClass: 'bg-rose-400' };
    }
    if (total <= 5) {
      return { label: 'Low stock', badgeClass: 'bg-amber-500/15 text-amber-300', dotClass: 'bg-amber-400' };
    }
    return { label: 'In stock', badgeClass: 'bg-emerald-500/15 text-emerald-300', dotClass: 'bg-emerald-400' };
  }, [productData.calculatedCountInStock, productData.countInStock, productData.inStock, productData.stockStatus]);

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

  // GSAP Animations
  const cardRef = useGsap((_, card) => {
    if (prefersReducedMotion || !card) {
      return undefined;
    }

    const imageEl = imageRef.current;
    const badgeEl = card.querySelector('.badge');

    gsap.fromTo(
      card,
      { y: 50, opacity: 0, scale: 0.9 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.6,
        delay: index * 0.1,
        ease: 'power3.out'
      }
    );

    if (badgeEl && (productData.isNew || productData.isTrending || productData.isBestseller)) {
      gsap.fromTo(
        badgeEl,
        { scale: 0, rotation: -180 },
        { scale: 1, rotation: 0, duration: 0.6, ease: 'bounce.out', delay: 0.3 }
      );
    }

    let rafId = null;

    const handleMouseEnter = () => {
      setIsHovered(true);
      setShowActions(true);

      gsap.to(card, { y: -8, duration: 0.3, ease: 'power2.out' });

      if (imageEl) {
        gsap.to(imageEl, { scale: 1.1, duration: 0.4, ease: 'power2.out' });
      }

      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(() => {
        const actionsEl = actionsRef.current;
        if (actionsEl) {
          gsap.fromTo(
            actionsEl,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
          );
        }
      });
    };

    const handleMouseLeave = () => {
      setIsHovered(false);

      gsap.to(card, { y: 0, duration: 0.3, ease: 'power2.out' });

      if (imageEl) {
        gsap.to(imageEl, { scale: 1, duration: 0.4, ease: 'power2.out' });
      }

      const actionsEl = actionsRef.current;
      if (actionsEl) {
        gsap.to(actionsEl, {
          opacity: 0,
          y: 20,
          duration: 0.2,
          ease: 'power2.in',
          onComplete: () => setShowActions(false)
        });
      } else {
        setShowActions(false);
      }
    };

    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }

      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);

      gsap.killTweensOf([card, imageRef.current, actionsRef.current]);
      rafId = null;
    };
  }, [index, productData.isNew, productData.isTrending, productData.isBestseller, prefersReducedMotion]);

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

    // Animation feedback
    if (!prefersReducedMotion) {
      gsap.to(e.target, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut'
      });
    }

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

    // Heart animation
    if (!prefersReducedMotion) {
      gsap.to(e.target, {
        scale: 1.3,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut'
      });
    }

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
    const stars = [];
    const fullStars = Math.floor(productData.rating);
    const hasHalfStar = productData.rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          size={14}
          className={`${
            i < fullStars 
              ? 'text-yellow-400 fill-current' 
              : i === fullStars && hasHalfStar 
                ? 'text-yellow-400 fill-current opacity-50'
                : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  // Compact variant
  if (variant === 'compact') {
    return (
      <div 
        ref={cardRef}
        className={`card-premium p-4 flex items-center space-x-4 hover-lift ${className}`}
      >
        <div className="flex-shrink-0">
          <img
            src={productData.images[0]}
            alt={productData.name}
            className="w-16 h-16 rounded-xl object-cover"
            onLoad={() => setIsImageLoaded(true)}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{productData.name}</h3>
          <p className="text-sm text-gray-300 truncate">{productData.brand}</p>
          <div className="flex items-center space-x-2 mt-1">
            <span className="font-bold text-cyan-400">{formatCurrency(productData.price)}</span>
            {productData.originalPrice > productData.price && (
              <span className="text-xs text-gray-400 line-through">
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
        className={`card-premium overflow-hidden relative group ${className}`}
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            ref={imageRef}
            src={productData.images[0]}
            alt={productData.name}
            className="w-full h-full object-cover transition-transform duration-500"
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
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                      selectedSize === size
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
              className={`p-3 rounded-xl transition-all duration-300 ${
                isInWishlist 
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
        className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40 transition-all duration-200 hover:-translate-y-1 hover:border-white/20 ${className}`}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-slate-900/30">
          <img
            ref={imageRef}
            src={productImages[currentImage] || primaryImage}
            alt={productData.name}
            className="h-full w-full scale-105 object-cover transition-transform duration-500 group-hover:scale-110"
            onLoad={() => setIsImageLoaded(true)}
            loading="lazy"
          />
          {!isImageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-slate-800/40" />
          )}

          {badgeInfo && (
            <div
              ref={badgeRef}
              className={`badge absolute left-3 top-3 flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white ${badgeInfo.color}`}
            >
              {React.createElement(badgeInfo.icon, { size: 12 })}
              <span>{badgeInfo.text}</span>
            </div>
          )}

          {discountPercentage && (
            <span className="absolute right-3 top-3 rounded-full bg-rose-500 px-3 py-1 text-[11px] font-semibold text-white">
              -{discountPercentage}%
            </span>
          )}

          {showActionsProp && (
            <div
              ref={actionsRef}
              className={`absolute right-3 top-14 flex flex-col gap-2 transition-all duration-200 ${
                isHovered && showActions ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0 pointer-events-none'
              }`}
            >
              <button
                onClick={handleToggleWishlist}
                className={`flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/80 text-white transition-colors duration-150 ${
                  isInWishlist ? 'bg-rose-500 hover:bg-rose-600' : 'hover:bg-slate-800'
                }`}
                aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart size={16} className={isInWishlist ? 'fill-current' : ''} />
              </button>

              {onQuickView && showQuickView && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onQuickView(productData);
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/80 text-white transition-colors duration-150 hover:bg-blue-500"
                  aria-label="Quick view product"
                >
                  <Eye size={16} />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-4 p-4">
          {categoryLabel && (
            <span className="inline-flex w-fit items-center rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-slate-200">
              {categoryLabel}
            </span>
          )}

          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white transition-colors duration-150 group-hover:text-blue-200">
              {productData.name}
            </h3>
            <p className="text-sm text-slate-300">{productData.brand ?? defaultProduct.brand}</p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[11px] font-medium text-slate-300">
            <span className="flex items-center gap-1">
              <Star size={12} className="text-amber-400" />
              {ratingLabel}
            </span>
            <span className="truncate text-center text-slate-400">{reviewLabel}</span>
            <span className={`flex items-center justify-end gap-1 rounded-full px-2 py-1 ${stockStatus.badgeClass}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${stockStatus.dotClass}`}></span>
              {stockStatus.label}
            </span>
          </div>

          {displayedSizes.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {displayedSizes.map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setSelectedSize(size);
                  }}
                  className={`rounded-lg px-2.5 py-1 font-semibold transition-all duration-150 ${
                    selectedSize === size
                      ? 'bg-white text-slate-900 shadow'
                      : 'bg-white/10 text-slate-200 hover:bg-white/20'
                  }`}
                  aria-label={`Select size ${size}`}
                >
                  {size}
                </button>
              ))}
              {remainingSizeCount > 0 && (
                <span className="rounded-lg bg-white/5 px-2.5 py-1 font-semibold text-slate-300">
                  +{remainingSizeCount}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-semibold text-white">
                {formatCurrency(productData.price)}
              </span>
              {productData.originalPrice > productData.price && (
                <span className="text-xs text-slate-400 line-through">
                  {formatCurrency(productData.originalPrice)}
                </span>
              )}
            </div>

            {discountPercentage && (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2 py-1 text-[11px] font-semibold text-rose-200">
                <Zap size={12} className="text-rose-300" />
                Save {discountPercentage}%
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!productData.inStock}
            className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-150 ${
              !productData.inStock
                ? 'cursor-not-allowed bg-slate-700/60 text-slate-400'
                : isInCart
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500'
            }`}
          >
            <ShoppingBag size={16} />
            <span>
              {!productData.inStock
                ? 'Out of Stock'
                : isInCart
                  ? 'In Cart'
                  : 'Add to Cart'}
            </span>
          </button>
        </div>
      </article>
    </Link>
  );
};

export default ProductCard;
