import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import {
  Heart,
  ShoppingBag,
  Star,
  Eye,
  Share2,
  Zap,
  TrendingUp,
  Award,
  ShoppingCart
} from 'lucide-react';
import { addToCart } from '../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice';
import { formatCurrency } from '../utils/helpers';
import { showCartToast, showWishlistToast, showErrorToast, showSuccessToast } from '../utils/toast';

const ProductCard = ({
  product = {},
  variant = 'default', // default, compact, featured, grid
  showActionsProp = true,
  showQuickView = true,
  className = '',
  onQuickView = null,
  index = 0
}) => {
  const cardRef = useRef(null);
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
  const productId = productData.id || productData._id;
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

  const isInWishlist = wishlistItems.some(item => (item.id || item._id) === productId);
  const isInCart = cartItems.some(item => {
    const cartProductId = item.productId || item.product?._id || item.product?.id || item.product;
    const variantSize = item.variant?.size || item.size;
    if (availableSizes.length > 0 && variantSize) {
      return cartProductId === productId && variantSize === selectedSize;
    }
    return cartProductId === productId;
  });

  useEffect(() => {
    if (availableSizes.length === 0) {
      setSelectedSize('');
      return;
    }

    setSelectedSize(prev => (prev && availableSizes.includes(prev) ? prev : availableSizes[0]));
  }, [availableSizes]);

  // GSAP Animations
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    // Entrance animation
    gsap.fromTo(card, 
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

    // Hover animations setup
    const handleMouseEnter = () => {
      setIsHovered(true);
      setShowActions(true);
      
      gsap.to(card, { y: -8, duration: 0.3, ease: 'power2.out' });
      gsap.to(imageRef.current, { scale: 1.1, duration: 0.4, ease: 'power2.out' });
      gsap.fromTo(actionsRef.current, 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      );
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      
      gsap.to(card, { y: 0, duration: 0.3, ease: 'power2.out' });
      gsap.to(imageRef.current, { scale: 1, duration: 0.4, ease: 'power2.out' });
      gsap.to(actionsRef.current, 
        { opacity: 0, y: 20, duration: 0.2, ease: 'power2.in',
          onComplete: () => setShowActions(false)
        }
      );
    };

    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [index]);

  // Badge animation
  useEffect(() => {
    if (badgeRef.current && (productData.isNew || productData.isTrending || productData.isBestseller)) {
      gsap.fromTo(badgeRef.current,
        { scale: 0, rotation: -180 },
        { scale: 1, rotation: 0, duration: 0.6, ease: 'bounce.out', delay: 0.3 }
      );
    }
  }, [productData.isNew, productData.isTrending, productData.isBestseller]);

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
    
    dispatch(addToCart({
      productId,
      quantity: 1,
      product: productData,
      size: selectedSize || undefined
    }));

    // Animation feedback
    gsap.to(e.target, {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut'
    });

    showCartToast.added(productData.name);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWishlist) {
      dispatch(removeFromWishlist(productData.id));
      showWishlistToast.removed(productData.name);
    } else {
      dispatch(addToWishlist(productData));
      showWishlistToast.added(productData.name);
    }

    // Heart animation
    gsap.to(e.target, {
      scale: 1.3,
      duration: 0.2,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut'
    });
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (navigator.share) {
      navigator.share({
        title: productData.name,
        text: `Check out ${productData.name} for ${formatCurrency(productData.price)}`,
        url: `/products/${productData.id}`
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/products/${productData.id}`);
      showSuccessToast('Link copied to clipboard!');
    }
  };

  const getBadgeInfo = () => {
    if (productData.isNew) return { text: 'NEW', color: 'bg-gradient-accent', icon: Zap };
    if (productData.isTrending) return { text: 'TRENDING', color: 'bg-gradient-secondary', icon: TrendingUp };
    if (productData.isBestseller) return { text: 'BESTSELLER', color: 'bg-gradient-gold', icon: Award };
    return null;
  };

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
    <Link to={`/products/${productData.id}`} className="block">
      <div 
        ref={cardRef}
        className={`card-premium overflow-hidden relative group cursor-pointer ${className}`}
      >
        {/* Product Image */}
        <div className="relative overflow-hidden rounded-t-3xl">
          <img
            ref={imageRef}
            src={productData.images[currentImage]}
            alt={productData.name}
            className="w-full h-48 sm:h-56 lg:h-64 object-cover transition-transform duration-500"
            onLoad={() => setIsImageLoaded(true)}
          />
          
          {/* Image Loading Skeleton */}
          {!isImageLoaded && (
            <div className="absolute inset-0 skeleton rounded-t-3xl"></div>
          )}

          {/* Badge */}
          {getBadgeInfo() && (
            <div 
              ref={badgeRef}
              className={`absolute top-3 left-3 ${getBadgeInfo().color} px-3 py-1 rounded-full text-xs font-bold text-white flex items-center space-x-1 shadow-lg`}
            >
              {React.createElement(getBadgeInfo().icon, { size: 12 })}
              <span>{getBadgeInfo().text}</span>
            </div>
          )}

          {/* Discount Badge */}
          {productData.originalPrice > productData.price && (
            <div className="absolute top-3 right-3 bg-gradient-secondary px-2 py-1 rounded-full text-xs font-bold text-white">
              -{productData.discount}%
            </div>
          )}

          {/* Hover Actions */}
          {showActionsProp && showActions && isHovered && (
            <div 
              ref={actionsRef}
              className="absolute inset-0 bg-black/40 flex items-center justify-center"
            >
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleToggleWishlist}
                  className={`p-3 rounded-full transition-all duration-200 ${
                    isInWishlist 
                      ? 'bg-red-500 text-white' 
                      : 'glass text-white hover:glass'
                  }`}
                >
                  <Heart size={20} className={isInWishlist ? 'fill-current' : ''} />
                </button>
                
                {onQuickView && showQuickView && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onQuickView(productData);
                    }}
                    className="p-3 glass rounded-full text-white hover:glass transition-all duration-200"
                  >
                    <Eye size={20} />
                  </button>
                )}
                
                <button
                  onClick={handleShare}
                  className="p-3 glass rounded-full text-white hover:glass transition-all duration-200"
                >
                  <Share2 size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Image Navigation Dots */}
          {productData.images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {productData.images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImage(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentImage ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 sm:p-6">
          {/* Brand */}
          <p className="text-sm text-gray-400 mb-1">{productData.brand}</p>
          
          {/* Name */}
          <h3 className="font-semibold text-white mb-2 text-lg leading-tight line-clamp-2">
            {productData.name}
          </h3>

          {/* Sizes */}
          {availableSizes.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {availableSizes.map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setSelectedSize(size);
                  }}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-xl transition-all duration-200 ${
                    selectedSize === size
                      ? 'bg-white text-slate-900 shadow-lg'
                      : 'bg-white/10 text-gray-200 hover:bg-white/20'
                  }`}
                  aria-label={`Select size ${size}`}
                >
                  {size}
                </button>
              ))}
            </div>
          )}

          {/* Rating */}
          <div className="flex items-center space-x-2 mb-3">
            <div className="flex items-center space-x-1">
              {renderStars()}
            </div>
            <span className="text-sm text-gray-400">
              ({productData.reviewCount})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-white">
                {formatCurrency(productData.price)}
              </span>
              {productData.originalPrice > productData.price && (
                <span className="text-sm text-gray-400 line-through">
                  {formatCurrency(productData.originalPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!productData.inStock}
            className={`w-full btn-premium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 ${
              isInCart ? 'bg-green-500 hover:bg-green-600' : ''
            }`}
          >
            <ShoppingBag size={18} />
            <span>
              {!productData.inStock 
                ? 'Out of Stock' 
                : isInCart 
                  ? 'In Cart' 
                  : 'Add to Cart'
              }
            </span>
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
