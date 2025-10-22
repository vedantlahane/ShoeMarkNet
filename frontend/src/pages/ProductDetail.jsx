import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import PageMeta from '../components/seo/PageMeta';
import { toast } from 'react-toastify';

// Redux actions
import { 
  fetchProductById, 
  fetchProductBySlug,
  fetchRelatedProducts,
  clearProductError 
} from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { 
  addToWishlist, 
  removeFromWishlist 
} from '../redux/slices/wishlistSlice';

// Components
import ErrorMessage from '../components/common/ErrorMessage';
import Rating from '../components/common/Rating';
import ProductCard from '../components/ProductCard';
import ProductBreadcrumb from '../components/products/ProductBreadcrumb';
import StockIndicator from '../components/products/StockIndicator';
import SocialShare from '../components/common/SocialShare';
import PriceDisplay from '../components/products/PriceDisplay';
import ProductTabs from '../components/products/ProductTabs';
import RecentlyViewed from '../components/products/RecentlyViewed';

// Hooks
import useLocalStorage from '../hooks/useLocalStorage';
import useScrollToTop from '../hooks/useScrollToTop';

// Utils
import { trackEvent } from '../utils/analytics';
import { calculateDiscount, truncateText } from '../utils/helpers';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const { 
    product, 
    relatedProducts,
    productLoading,
    error 
  } = useSelector((state) => state.product);
  
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  
  // Local state
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [mainImage, setMainImage] = useState('');
  const [imageLoading, setImageLoading] = useState(true);
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [viewStartTime] = useState(Date.now());
  
  // Recently viewed products
  const [recentlyViewed, setRecentlyViewed] = useLocalStorage('recentlyViewed', []);

  const isSlugId = useMemo(() => /^[0-9a-fA-F]{24}$/.test(slug ?? ''), [slug]);
  
  // Scroll to top on mount
  useScrollToTop();

  // Memoized calculations
  const availableImages = useMemo(() => {
    if (selectedVariant?.images?.length > 0) {
      return selectedVariant.images;
    }
    return product?.images || [];
  }, [product, selectedVariant]);

  const availableSizes = useMemo(() => {
    if (selectedVariant?.sizes) {
      return selectedVariant.sizes;
    }
    if (product?.variants?.length > 0) {
      return product.variants[0]?.sizes || [];
    }
    return product?.sizes || [];
  }, [product, selectedVariant]);

  const maxStock = useMemo(() => {
    if (selectedVariant && selectedSize) {
      const sizeObj = selectedVariant.sizes?.find(s => s.size === selectedSize);
      return sizeObj?.countInStock || 0;
    }
    if (selectedSize && product?.sizes) {
      const sizeObj = product.sizes.find(s => s.size === selectedSize);
      return sizeObj?.countInStock || 0;
    }
    return product?.countInStock || 0;
  }, [product, selectedVariant, selectedSize]);

  const currentPrice = useMemo(() => {
    if (selectedVariant?.price) return selectedVariant.price;
    return product?.price || 0;
  }, [product, selectedVariant]);

  const originalPrice = useMemo(() => {
    if (selectedVariant?.price) {
      return product?.originalPrice ?? selectedVariant.price;
    }
    if (product?.originalPrice) {
      return product.originalPrice;
    }
    return product?.price || 0;
  }, [product, selectedVariant]);

  const discountedPrice = useMemo(() => {
    return calculateDiscount(currentPrice, product?.discountPercentage);
  }, [currentPrice, product?.discountPercentage]);

  const productUrl = useMemo(() => {
    if (!product) return undefined;
    if (product.slug) {
      return `https://shoemarknet.com/products/${product.slug}`;
    }
    if (product._id) {
      return `https://shoemarknet.com/products/${product._id}`;
    }
    return undefined;
  }, [product]);

  const shareDescription = useMemo(() => {
    return truncateText(product?.description ?? '', 140);
  }, [product?.description]);

  const isInWishlist = useMemo(() => {
    return wishlistItems?.some(item => 
      item._id === product?._id || item.product?._id === product?._id
    );
  }, [wishlistItems, product]);

  const isInCart = useMemo(() => {
    return cartItems?.some(item => {
      const productId = item.product?._id || item.productId;
      return productId === product?._id &&
             item.size === selectedSize &&
             item.color === selectedColor;
    });
  }, [cartItems, product, selectedSize, selectedColor]);

  // Fetch product and related data
  useEffect(() => {
    if (!slug) return;

    dispatch(clearProductError());

    const action = isSlugId ? fetchProductById(slug) : fetchProductBySlug(slug);
    dispatch(action);

    trackEvent('page_view', {
      page_title: 'Product Detail',
      page_location: window.location.href,
      content_type: 'product',
      content_id: slug,
      identifier_type: isSlugId ? 'id' : 'slug'
    });
  }, [dispatch, slug, isSlugId]);

  // Fetch related products when product loads
  useEffect(() => {
    if (product?._id) {
      dispatch(fetchRelatedProducts({
        productId: product._id,
        limit: 4
      }));
    }
  }, [dispatch, product]);

  // Update recently viewed
  useEffect(() => {
  if (product && !productLoading) {
      const productSummary = {
        _id: product._id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.images?.[0],
        rating: product.rating,
        viewedAt: Date.now()
      };

      setRecentlyViewed(prev => {
        const filtered = prev.filter(item => item._id !== product._id);
        return [productSummary, ...filtered].slice(0, 10);
      });
    }
  }, [product, productLoading, setRecentlyViewed]);

  // Set main image
  useEffect(() => {
    if (availableImages.length > 0) {
      setMainImage(availableImages[currentImageIndex] || availableImages[0]);
    }
  }, [availableImages, currentImageIndex]);

  useEffect(() => {
    if (mainImage) {
      setImageLoading(true);
    }
  }, [mainImage]);

  // Track view duration on unmount
  useEffect(() => {
    return () => {
      if (product) {
        const viewDuration = Math.floor((Date.now() - viewStartTime) / 1000);
        trackEvent('product_view_duration', {
          product_id: product._id,
          product_name: product.name,
          duration_seconds: viewDuration
        });
      }
    };
  }, [product, viewStartTime]);

  // Enhanced handlers
  const handleColorSelect = useCallback((variant) => {
    setSelectedVariant(variant);
    setSelectedColor(variant.color);
    setSelectedSize('');
    setCurrentImageIndex(0);
    
    trackEvent('product_color_selected', {
      product_id: product._id,
      color: variant.color
    });
  }, [product]);

  const handleSizeSelect = useCallback((size) => {
    setSelectedSize(size.size);
    
    trackEvent('product_size_selected', {
      product_id: product._id,
      size: size.size
    });
  }, [product]);

  const handleQuantityChange = useCallback((newQuantity) => {
    const validQuantity = Math.min(Math.max(1, newQuantity), maxStock);
    setQuantity(validQuantity);
  }, [maxStock]);

  const handleImageNavigation = useCallback((direction) => {
    if (availableImages.length <= 1) return;
    
    setCurrentImageIndex(prev => {
      if (direction === 'next') {
        return prev >= availableImages.length - 1 ? 0 : prev + 1;
      } else {
        return prev <= 0 ? availableImages.length - 1 : prev - 1;
      }
    });
  }, [availableImages.length]);

  const handleAddToCart = useCallback(async () => {
    if (!isAuthenticated) {
      toast.info('Please sign in to add items to cart');
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    // Validation
    if (product.variants?.length > 0 && !selectedColor) {
      toast.error('Please select a color first! 🎨');
      return;
    }
    
    if (availableSizes.length > 0 && !selectedSize) {
      toast.error('Please select a size first! 👟');
      return;
    }
    
    if (maxStock <= 0) {
      toast.error('Sorry, this item is currently out of stock! 😔');
      return;
    }

    // Check existing cart quantity
    const existingCartItem = cartItems.find(item => {
      const productId = item.product?._id || item.productId;
      return productId === product._id &&
             item.size === selectedSize &&
             item.color === selectedColor;
    });
    
    if (existingCartItem && (existingCartItem.quantity + quantity > maxStock)) {
      toast.warning(`You can only add ${maxStock - existingCartItem.quantity} more of this item to your cart! 🛒`);
      return;
    }

    try {
      const cartItem = {
        productId: product._id,
        quantity,
        size: selectedSize,
        color: selectedColor,
        product: {
          _id: product._id,
          name: product.name,
          price: currentPrice,
          image: mainImage
        }
      };

      await dispatch(addToCart(cartItem)).unwrap();

      // Track add to cart
      trackEvent('add_to_cart', {
        currency: 'USD',
        value: currentPrice * quantity,
        items: [{
          item_id: product._id,
          item_name: product.name,
          item_category: product.category,
          item_brand: product.brand,
          price: currentPrice,
          quantity: quantity
        }]
      });

    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  }, [
    isAuthenticated,
    navigate,
    product,
    selectedColor,
    selectedSize,
    availableSizes,
    maxStock,
    cartItems,
    quantity,
    currentPrice,
    mainImage,
    dispatch
  ]);

  const handleToggleWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      toast.info('Please sign in to manage your wishlist');
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    try {
      if (isInWishlist) {
        await dispatch(removeFromWishlist({
          productId: product._id,
          productName: product.name
        })).unwrap();
        
        trackEvent('remove_from_wishlist', {
          item_id: product._id,
          item_name: product.name
        });
      } else {
        await dispatch(addToWishlist({
          productId: product._id,
          product
        })).unwrap();
        
        trackEvent('add_to_wishlist', {
          item_id: product._id,
          item_name: product.name,
          value: currentPrice
        });
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    }
  }, [
    isAuthenticated,
    navigate,
    isInWishlist,
    dispatch,
    product,
    currentPrice
  ]);

  const handleBuyNow = useCallback(() => {
    if (!isAuthenticated) {
      toast.info('Please sign in to purchase');
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    // Add to cart first, then redirect to checkout
    handleAddToCart().then(() => {
      navigate('/checkout');
      
      trackEvent('begin_checkout', {
        currency: 'USD',
        value: currentPrice * quantity,
        items: [{
          item_id: product._id,
          item_name: product.name,
          price: currentPrice,
          quantity: quantity
        }]
      });
    });
  }, [isAuthenticated, navigate, handleAddToCart, currentPrice, quantity, product]);

  // SEO meta data
  const metaTitle = product ? `${product.name} | ${product.brand} | ShoeMarkNet` : 'Product Details | ShoeMarkNet';
  const metaDescription = product ? 
    `${product.description?.substring(0, 155)}... Shop now with free shipping and easy returns.` :
    'Discover premium footwear at ShoeMarkNet. Shop the latest styles with competitive prices and fast shipping.';

  // Loading state
  if (productLoading && !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
  <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-5 lg:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image skeleton */}
            <div className="space-y-6">
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-3xl animate-pulse"></div>
              <div className="grid grid-cols-5 gap-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
                ))}
              </div>
            </div>
            
            {/* Content skeleton */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
              </div>
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <ErrorMessage
          message={error.message || 'Failed to load product'}
          onRetry={() => {
            if (!slug) return;
            const action = isSlugId ? fetchProductById(slug) : fetchProductBySlug(slug);
            dispatch(action);
          }}
          className="max-w-md"
        />
      </div>
    );
  }

  // Product not found
  if (!productLoading && !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-12 text-center shadow-2xl max-w-md">
          <div className="w-20 h-20 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-search text-white text-3xl"></i>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Product Not Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/products"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-200"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <PageMeta
        title={metaTitle}
        description={metaDescription}
        robots="index, follow"
        canonical={productUrl || 'https://shoemarknet.com/products'}
        openGraph={{
          title: metaTitle,
          description: metaDescription,
          type: 'product',
          url: productUrl || 'https://shoemarknet.com/products',
          image: mainImage || product.images?.[0],
        }}
        twitter={{
          card: 'summary_large_image',
          title: metaTitle,
          description: metaDescription,
          image: mainImage || product.images?.[0],
        }}
        meta={[
          {
            property: 'product:brand',
            content: product.brand,
          },
          {
            property: 'product:availability',
            content: maxStock > 0 ? 'in stock' : 'out of stock',
          },
          {
            property: 'product:condition',
            content: 'new',
          },
          {
            property: 'product:price:amount',
            content: `${discountedPrice || currentPrice}`,
          },
          {
            property: 'product:price:currency',
            content: 'USD',
          },
        ]}
        jsonLd={{
          '@context': 'https://schema.org/',
          '@type': 'Product',
          name: product.name,
          image: product.images,
          description: product.description,
          brand: {
            '@type': 'Brand',
            name: product.brand,
          },
          offers: {
            '@type': 'Offer',
            url: productUrl || 'https://shoemarknet.com/products',
            priceCurrency: 'USD',
            price: discountedPrice || currentPrice,
            itemCondition: 'https://schema.org/NewCondition',
            availability: maxStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          },
          aggregateRating: product.rating && product.numReviews
            ? {
                '@type': 'AggregateRating',
                ratingValue: product.rating,
                reviewCount: product.numReviews,
              }
            : undefined,
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        
        {/* Animated Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-400/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${4 + Math.random() * 6}s`
              }}
            />
          ))}
        </div>

  <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-5 lg:px-6 py-8 relative z-10">
          
          {/* Enhanced Breadcrumb Navigation */}
          <div className="mb-8">
            <ProductBreadcrumb 
              product={product}
              onBack={() => navigate(-1)}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            
            {/* Enhanced Product Images */}
            <div className="space-y-6">
              
              {/* Main Image Container */}
              <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl overflow-hidden shadow-2xl group">
                <div className="relative aspect-square overflow-hidden">
                  
                  {/* Image Loading Skeleton */}
                  {imageLoading && (
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse">
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                        <i className="fas fa-image text-gray-400 text-6xl"></i>
                      </div>
                    </div>
                  )}
                  
                  {/* Main Product Image */}
                  <img 
                    src={mainImage || '/product-placeholder.jpg'} 
                    alt={product.name} 
                    className={`w-full h-full object-cover transition-all duration-700 cursor-zoom-in group-hover:scale-105 ${
                      imageLoading ? 'opacity-0' : 'opacity-100'
                    }`}
                    onClick={() => setShowImageZoom(true)}
                    onLoad={() => setImageLoading(false)}
                    loading="eager"
                  />
                  
                  {/* Premium Badges */}
                  <div className="absolute top-6 right-6 flex flex-col space-y-3">
                    {product.isNewArrival && (
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg animate-pulse">
                        <i className="fas fa-sparkles mr-2"></i>
                        NEW ARRIVAL
                      </div>
                    )}
                    {product.discountPercentage > 0 && (
                      <div className="bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                        <i className="fas fa-percentage mr-2"></i>
                        {product.discountPercentage}% OFF
                      </div>
                    )}
                    {product.isFeatured && (
                      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                        <i className="fas fa-crown mr-2"></i>
                        FEATURED
                      </div>
                    )}
                  </div>

                  {/* Zoom Button */}
                  <div className="absolute top-6 left-6">
                    <button
                      onClick={() => setShowImageZoom(true)}
                      className="w-12 h-12 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 opacity-0 group-hover:opacity-100"
                      title="View in full size"
                    >
                      <i className="fas fa-search-plus"></i>
                    </button>
                  </div>

                  {/* Navigation Arrows */}
                  {availableImages.length > 1 && (
                    <>
                      <button 
                        onClick={() => handleImageNavigation('prev')}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 opacity-0 group-hover:opacity-100"
                      >
                        <i className="fas fa-chevron-left"></i>
                      </button>
                      <button 
                        onClick={() => handleImageNavigation('next')}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 opacity-0 group-hover:opacity-100"
                      >
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </>
                  )}

                  {/* Image Indicators */}
                  {availableImages.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {availableImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-3 h-3 rounded-full transition-all duration-200 ${
                            index === currentImageIndex 
                              ? 'bg-white scale-125' 
                              : 'bg-white/50 hover:bg-white/75'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Enhanced Thumbnail Gallery */}
              {availableImages.length > 1 && (
                <div className="grid grid-cols-5 gap-3">
                  {availableImages.map((img, index) => (
                    <div
                      key={index}
                      className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 ${
                        index === currentImageIndex
                          ? 'ring-4 ring-blue-500 ring-opacity-60 shadow-lg' 
                          : 'hover:ring-2 hover:ring-gray-300 hover:ring-opacity-60'
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <img 
                        src={img} 
                        alt={`${product.name} view ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {index === currentImageIndex && (
                        <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-sm flex items-center justify-center">
                          <i className="fas fa-eye text-white text-lg"></i>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Enhanced Product Info */}
            <div className="space-y-8">
              
              {/* Header Section */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 shadow-2xl">
                
                {/* Brand and Wishlist */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                    <span className="text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider text-sm">
                      {product.brand}
                    </span>
                  </div>
                  <button
                    onClick={handleToggleWishlist}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                      isInWishlist 
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white' 
                        : 'bg-white/20 backdrop-blur-lg border border-white/30 text-gray-600 dark:text-gray-400 hover:text-pink-500'
                    }`}
                    title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    <i className={`fas fa-heart ${isInWishlist ? 'animate-pulse' : ''}`}></i>
                  </button>
                </div>
                
                {/* Product Name */}
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                  {product.name}
                </h1>
                
                {/* Rating and Reviews */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex items-center">
                    <Rating 
                      value={product.rating || 4.5} 
                      size={24}
                      showValue={true}
                      variant="premium"
                    />
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    <i className="fas fa-users mr-2"></i>
                    {product.numReviews || 0} {product.numReviews === 1 ? 'review' : 'reviews'}
                  </div>
                  <SocialShare
                    url={productUrl}
                    title={product.name}
                    description={shareDescription}
                    image={mainImage}
                  />
                </div>

                {/* Enhanced Price Display */}
                <PriceDisplay
                  currentPrice={currentPrice}
                  originalPrice={originalPrice}
                  discountedPrice={discountedPrice}
                  discountPercentage={product.discountPercentage || 0}
                  className="mb-8"
                />
              </div>
              
              {/* Enhanced Color Selection */}
              {product.variants?.length > 0 && (
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 shadow-2xl">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <i className="fas fa-palette mr-3 text-purple-500"></i>
                    Select Color
                    {selectedColor && (
                      <span className="ml-3 text-sm font-normal text-gray-600 dark:text-gray-400">
                        ({selectedColor})
                      </span>
                    )}
                  </h3>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
                    {product.variants.map((variant, index) => (
                      <button
                        key={index}
                        className={`relative group p-2 rounded-2xl transition-all duration-300 hover:scale-110 ${
                          selectedColor === variant.color 
                            ? 'ring-4 ring-blue-500 ring-opacity-60 shadow-xl' 
                            : 'hover:ring-2 hover:ring-gray-300 hover:ring-opacity-60'
                        }`}
                        onClick={() => handleColorSelect(variant)}
                        title={variant.color}
                      >
                        <div 
                          className="w-12 h-12 rounded-xl shadow-lg border-2 border-white/50 relative overflow-hidden" 
                          style={{ backgroundColor: variant.colorCode }}
                        >
                          {selectedColor === variant.color && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <i className="fas fa-check text-white text-lg"></i>
                            </div>
                          )}
                        </div>
                        <span className="block text-xs font-medium text-gray-700 dark:text-gray-300 mt-2 text-center truncate">
                          {variant.color}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Enhanced Size Selection */}
              {availableSizes.length > 0 && (
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 shadow-2xl">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <i className="fas fa-ruler mr-3 text-orange-500"></i>
                    Select Size
                    {selectedSize && (
                      <span className="ml-3 text-sm font-normal text-gray-600 dark:text-gray-400">
                        (Size {selectedSize})
                      </span>
                    )}
                  </h3>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                    {availableSizes.map((size, index) => {
                      const isAvailable = size.countInStock > 0;
                      return (
                        <button
                          key={index}
                          disabled={!isAvailable}
                          className={`relative p-4 rounded-2xl border-2 font-semibold transition-all duration-200 hover:scale-105 ${
                            selectedSize === size.size
                              ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 shadow-lg'
                              : !isAvailable
                                ? 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed opacity-50'
                                : 'border-white/30 bg-white/20 text-gray-900 dark:text-white hover:border-blue-300 hover:bg-white/30'
                          }`}
                          onClick={() => handleSizeSelect(size)}
                        >
                          <span className="block text-lg font-bold">{size.size}</span>
                          {!isAvailable && (
                            <span className="absolute inset-0 flex items-center justify-center">
                              <i className="fas fa-times text-red-500"></i>
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Size Guide removed for minimalism */}
                </div>
              )}

              {/* Enhanced Quantity & Actions */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 shadow-2xl">
                
                {/* Stock Indicator */}
                <StockIndicator 
                  stock={maxStock}
                  className="mb-6"
                />
                
                {/* Quantity Selector */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <i className="fas fa-sort-numeric-up mr-3 text-green-500"></i>
                    Quantity
                  </h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl overflow-hidden">
                      <button
                        className="px-4 py-3 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={maxStock === 0 || quantity <= 1}
                      >
                        <i className="fas fa-minus"></i>
                      </button>
                      <div className="px-6 py-3 min-w-16 text-center font-bold text-lg">
                        {quantity}
                      </div>
                      <button
                        className="px-4 py-3 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={maxStock === 0 || quantity >= maxStock}
                      >
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="space-y-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={maxStock === 0 || isInCart}
                    className={`w-full flex items-center justify-center py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-200 relative overflow-hidden group ${
                      maxStock === 0
                        ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : isInCart
                          ? 'bg-green-500 text-white cursor-default'
                          : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-2xl hover:scale-105 active:scale-95'
                    }`}
                  >
                    {/* Button Shimmer Effect */}
                    {maxStock > 0 && !isInCart && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    )}
                    
                    <i className={`fas ${maxStock === 0 ? 'fa-times' : isInCart ? 'fa-check' : 'fa-shopping-cart'} mr-3 relative z-10`}></i>
                    <span className="relative z-10">
                      {maxStock === 0 ? 'Out of Stock' : isInCart ? 'Already in Cart' : 'Add to Cart'}
                    </span>
                    {maxStock > 0 && !isInCart && (
                      <i className="fas fa-arrow-right ml-3 relative z-10 group-hover:translate-x-1 transition-transform duration-200"></i>
                    )}
                  </button>
                  
                  {/* Secondary Actions */}
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={handleBuyNow}
                      disabled={maxStock === 0}
                      className="flex items-center justify-center py-3 px-4 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl font-semibold text-gray-900 dark:text-white hover:bg-white/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i className="fas fa-bolt mr-2 text-yellow-500"></i>
                      Buy Now
                    </button>
                    <button className="flex items-center justify-center py-3 px-4 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl font-semibold text-gray-900 dark:text-white hover:bg-white/30 transition-all duration-200">
                      <i className="fas fa-balance-scale mr-2 text-purple-500"></i>
                      Compare
                    </button>
                  </div>
                </div>

                {/* Product Features */}
                <div className="mt-8 pt-8 border-t border-white/20 dark:border-gray-700/20">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-2">
                        <i className="fas fa-shipping-fast text-white"></i>
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Free Shipping</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-2">
                        <i className="fas fa-undo text-white"></i>
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">30-Day Returns</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-2">
                        <i className="fas fa-shield-alt text-white"></i>
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Warranty</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Product Tabs */}
          <ProductTabs
            product={product}
            user={user}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            className="mb-16"
          />

          {/* Related Products */}
          {relatedProducts?.length > 0 && (
            <div className="mb-16">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 shadow-2xl">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-8 text-center">
                  <i className="fas fa-heart mr-3"></i>
                  You May Also Like
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {relatedProducts.map((relatedProduct) => (
                    <ProductCard 
                      key={relatedProduct._id} 
                      product={relatedProduct}
                      variant="compact"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recently Viewed */}
          <RecentlyViewed
            products={recentlyViewed.slice(1)} // Exclude current product
          />
        </div>

        {/* Custom Styles */}
      </div>
    </>
  );
};

export default ProductDetail;
