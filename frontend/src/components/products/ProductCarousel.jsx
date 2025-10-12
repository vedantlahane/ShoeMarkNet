import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import {
  Heart,
  ShoppingBag,
  Eye,
  Star,
  TrendingUp,
  Zap,
  Award,
  Package,
  Filter,
  SortAsc
} from 'lucide-react';
import Carousel from './Carousel';
import { addToCart } from '../../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../redux/slices/wishlistSlice';
import { formatCurrency } from '../../utils/helpers';
import useReducedMotion from '../../hooks/useReducedMotion';

const ProductCarousel = ({
  products = [],
  title = 'Featured Products',
  subtitle = 'Discover amazing deals and trending items',
  
  // Layout options
  variant = 'featured', // featured, trending, recommended, deals
  showHeader = true,
  showFilters = false,
  showViewOptions = true,
  
  // Carousel settings
  slidesToShow = 4,
  autoPlay = true,
  autoPlayInterval = 5000,
  
  // Product display options
  showQuickActions = true,
  showRatings = true,
  showBadges = true,
  showPrices = true,
  compactMode = false,
  
  // Callbacks
  onProductClick,
  onProductQuickView,
  onFilterChange,
  
  // Styling
  className = '',
  headerClassName = '',
  
  // Advanced options
  enableVirtualScrolling = false,
  preloadImages = true,
  animateOnScroll = true,
  
}) => {
  
  // Redux state
  const { items: wishlistItems } = useSelector(state => state.wishlist || { items: [] });
  const { items: cartItems } = useSelector(state => state.cart || { items: [] });
  const dispatch = useDispatch();
  
  // Local state
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [sortBy, setSortBy] = useState('featured');
  const [filterBy, setFilterBy] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs
  const headerRef = useRef(null);
  
  // Effect to handle product filtering/sorting
  useEffect(() => {
    let result = [...products];
    
    // Filter products
    if (filterBy !== 'all') {
      result = result.filter(product => {
        switch (filterBy) {
          case 'sale':
            return product.originalPrice && product.originalPrice > product.price;
          case 'new':
            return new Date(product.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          case 'popular':
            return product.sales > 50 || product.rating >= 4.5;
          case 'inStock':
            return product.stock > 0;
          default:
            return true;
        }
      });
    }
    
    // Sort products
    result.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'sales':
          return (b.sales || 0) - (a.sales || 0);
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
    
    setFilteredProducts(result);
    onFilterChange?.(filterBy, sortBy, result);
  }, [products, filterBy, sortBy, onFilterChange]);
  
  const prefersReducedMotion = useReducedMotion();
  const [headerVisible, setHeaderVisible] = useState(!animateOnScroll);

  useEffect(() => {
    const element = headerRef.current;
    if (!element) {
      return undefined;
    }

    if (!animateOnScroll || prefersReducedMotion) {
      setHeaderVisible(true);
      return undefined;
    }

    setHeaderVisible(false);
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry?.isIntersecting) {
        setHeaderVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.2 });

    observer.observe(element);

    return () => observer.disconnect();
  }, [animateOnScroll, prefersReducedMotion]);
  
  // Helper functions
  const isInWishlist = (productId) => 
    wishlistItems.some(item => item.id === productId);
  
  const isInCart = (productId) => 
    cartItems.some(item => item.productId === productId);
  
  const getProductBadge = (product) => {
    if (product.originalPrice && product.originalPrice > product.price) {
      const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
      return { 
        text: `-${discount}%`, 
        color: 'bg-gradient-to-r from-red-500 to-pink-500', 
        icon: TrendingUp 
      };
    }
    if (product.featured) {
      return { 
        text: 'Featured', 
        color: 'bg-gradient-to-r from-yellow-500 to-orange-500', 
        icon: Award 
      };
    }
    if (product.isNew) {
      return { 
        text: 'New', 
        color: 'bg-gradient-to-r from-green-500 to-emerald-500', 
        icon: Zap 
      };
    }
    if (product.stock <= 5 && product.stock > 0) {
      return { 
        text: 'Limited', 
        color: 'bg-gradient-to-r from-orange-500 to-red-500', 
        icon: Package 
      };
    }
    return null;
  };
  
  const getVariantIcon = () => {
    switch (variant) {
      case 'trending':
        return TrendingUp;
      case 'deals':
        return Zap;
      case 'recommended':
        return Award;
      default:
        return Star;
    }
  };
  
  const getVariantGradient = () => {
    switch (variant) {
      case 'trending':
        return 'from-orange-500 to-red-500';
      case 'deals':
        return 'from-green-500 to-emerald-500';
      case 'recommended':
        return 'from-purple-500 to-pink-500';
      default:
        return 'from-blue-500 to-purple-500';
    }
  };
  
  const triggerButtonFeedback = useCallback((element) => {
    if (prefersReducedMotion || !element?.animate) {
      return;
    }

    element.animate(
      [
        { transform: 'scale(1)' },
        { transform: 'scale(1.15)' },
        { transform: 'scale(1)' }
      ],
      {
        duration: 200,
        easing: 'ease-in-out'
      }
    );
  }, [prefersReducedMotion]);

  const headerAnimationClass = (!animateOnScroll || headerVisible || prefersReducedMotion)
    ? 'opacity-100 translate-y-0'
    : 'opacity-0 translate-y-4';

  // Event handlers
  const handleAddToCart = (product, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    dispatch(addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || product.image,
      brand: product.brand,
      quantity: 1
    }));
    
    toast.success(`${product.name} added to cart!`, {
      icon: '🛍️',
      duration: 3000,
    });
    
    // Add cart animation
    if (e?.currentTarget) {
      triggerButtonFeedback(e.currentTarget);
    }
  };
  
  const handleToggleWishlist = (product, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (isInWishlist(product.id)) {
      dispatch(removeFromWishlist(product.id));
      toast.success('Removed from wishlist');
    } else {
      dispatch(addToWishlist(product));
      toast.success('Added to wishlist!', { icon: '❤️' });
    }
    
    // Add heart animation
    if (e?.currentTarget) {
      triggerButtonFeedback(e.currentTarget);
    }
  };
  
  const handleProductClick = (product) => {
    if (onProductClick) {
      onProductClick(product);
    } else {
      // Default navigation logic
      window.location.href = `/products/${product.id}`;
    }
  };
  
  const handleQuickView = (product, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    onProductQuickView?.(product);
    
    toast.success('Opening quick view...', { 
      icon: '👁️',
      duration: 1500 
    });
  };
  
  // Render product card
  const renderProductCard = (product, index) => {
    const badge = getProductBadge(product);
    const inWishlist = isInWishlist(product.id);
    const inCart = isInCart(product.id);
    
    return (
      <div
        key={product.id || index}
        className={`group relative glass rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer ${
          compactMode ? 'h-80' : 'h-96'
        }`}
        onClick={() => handleProductClick(product)}
      >
        
        {/* Product Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={product.images?.[0] || product.image || '/api/placeholder/400/300'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading={preloadImages ? 'eager' : 'lazy'}
            onError={(e) => {
              e.target.src = '/api/placeholder/400/300';
            }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Badge */}
          {showBadges && badge && (
            <div className={`absolute top-3 left-3 ${badge.color} text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg`}>
              {React.createElement(badge.icon, { size: 12 })}
              <span>{badge.text}</span>
            </div>
          )}
          
          {/* Stock Status */}
          {product.stock <= 0 && (
            <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
              Out of Stock
            </div>
          )}
          
          {/* Quick Actions */}
          {showQuickActions && (
            <div className="absolute inset-0 flex items-center justify-center space-x-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <button
                onClick={(e) => handleToggleWishlist(product, e)}
                className={`p-3 rounded-full backdrop-blur-lg border border-white/30 transition-all duration-200 hover:scale-110 ${
                  inWishlist 
                    ? 'bg-red-500 text-white border-red-500' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart size={16} className={inWishlist ? 'fill-current' : ''} />
              </button>
              
              {onProductQuickView && (
                <button
                  onClick={(e) => handleQuickView(product, e)}
                  className="p-3 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full text-white hover:bg-white/30 transition-all duration-200 hover:scale-110"
                  title="Quick view"
                >
                  <Eye size={16} />
                </button>
              )}
              
              <button
                onClick={(e) => handleAddToCart(product, e)}
                disabled={product.stock <= 0 || inCart}
                className={`p-3 rounded-full backdrop-blur-lg border border-white/30 transition-all duration-200 hover:scale-110 ${
                  product.stock <= 0 
                    ? 'bg-gray-500 text-white cursor-not-allowed' 
                    : inCart
                      ? 'bg-green-500 text-white border-green-500'
                      : 'bg-white/20 text-white hover:bg-blue-500 hover:border-blue-500'
                }`}
                title={inCart ? 'In cart' : 'Add to cart'}
              >
                <ShoppingBag size={16} />
              </button>
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div className="p-4 space-y-3">
          
          {/* Brand */}
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {product.brand}
          </p>
          
          {/* Name */}
          <h3 className="font-bold text-gray-900 dark:text-white text-lg line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {product.name}
          </h3>
          
          {/* Rating */}
          {showRatings && product.rating && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={`${
                      i < Math.floor(product.rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                ({product.reviewCount || 0})
              </span>
            </div>
          )}
          
          {/* Price */}
          {showPrices && (
            <div className="flex items-baseline space-x-2">
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-gray-500 line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>
          )}
          
          {/* Compact mode - Add to Cart Button */}
          {!compactMode && (
            <button
              onClick={(e) => handleAddToCart(product, e)}
              disabled={product.stock <= 0 || inCart}
              className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                product.stock <= 0
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                  : inCart
                    ? 'bg-green-500 text-white'
                    : 'btn-premium micro-bounce'
              }`}
            >
              <ShoppingBag size={16} />
              <span>
                {product.stock <= 0 
                  ? 'Out of Stock' 
                  : inCart 
                    ? 'In Cart' 
                    : 'Add to Cart'
                }
              </span>
            </button>
          )}
        </div>
      </div>
    );
  };
  
  if (!products.length) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="glass rounded-3xl p-8 max-w-md mx-auto">
          <Package size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No Products Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            We couldn't find any products to display right now.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`w-full space-y-6 ${className}`}>
      
      {/* Header */}
      {showHeader && (
        <div
          ref={headerRef}
          className={`text-center space-y-4 transition-all duration-400 ${headerAnimationClass} ${headerClassName}`}
        >
          <div className="inline-flex items-center space-x-2 glass bg-blue-100/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full px-6 py-3">
            {React.createElement(getVariantIcon(), { size: 16, className: 'animate-pulse' })}
            <span className="text-sm font-medium">{variant.charAt(0).toUpperCase() + variant.slice(1)}</span>
          </div>
          
          <h2 className="text-4xl lg:text-6xl font-heading font-bold text-gray-900 dark:text-white">
            <span className={`bg-gradient-to-r ${getVariantGradient()} bg-clip-text text-transparent`}>
              {title}
            </span>
          </h2>
          
          {subtitle && (
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      {/* Filters and Controls */}
      {showFilters && (
        <div className="flex flex-wrap items-center justify-between gap-4 glass rounded-2xl p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-600 dark:text-gray-400" />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="glass rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Products</option>
                <option value="sale">On Sale</option>
                <option value="new">New Arrivals</option>
                <option value="popular">Popular</option>
                <option value="inStock">In Stock</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <SortAsc size={16} className="text-gray-600 dark:text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="glass rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="sales">Best Selling</option>
                <option value="newest">Newest First</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </div>
      )}
      
      {/* Product Carousel */}
      <Carousel
        items={filteredProducts}
        renderItem={renderProductCard}
        slidesToShow={slidesToShow}
        autoPlay={autoPlay}
        autoPlayInterval={autoPlayInterval}
        showArrows={true}
        showDots={true}
        showProgress={true}
        showPlayPause={showViewOptions}
        variant="glass"
        animation="slide"
        infinite={true}
        touchEnabled={true}
        pauseOnHover={true}
        responsive={{
          320: { slidesToShow: 1, slidesToScroll: 1 },
          640: { slidesToShow: 2, slidesToScroll: 1 },
          1024: { slidesToShow: 3, slidesToScroll: 1 },
          1280: { slidesToShow: slidesToShow, slidesToScroll: 1 },
        }}
        onItemClick={handleProductClick}
        className="px-4"
        itemClassName="px-2"
      />
    </div>
  );
};

export default ProductCarousel;
