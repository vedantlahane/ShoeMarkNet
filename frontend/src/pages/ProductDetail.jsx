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
import ErrorMessage from '../components/common/feedback/ErrorMessage';
import Rating from '../components/common/feedback/Rating';
import StockIndicator from '../components/product-details/StockIndicator';
import SocialShare from '../components/common/social/SocialShare';
import PriceDisplay from '../components/products/PriceDisplay';
// import ProductTabs from '../components/products/ProductTabs';
import ProductGrid from '../components/products/ProductGrid';
import RecentlyViewed from '../components/product-details/RecentlyViewed';

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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="container-app py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image skeleton */}
            <div className="space-y-4">
              <div className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
              <div className="grid grid-cols-5 gap-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"></div>
                ))}
              </div>
            </div>

            {/* Content skeleton */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-3 animate-pulse"></div>
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-4 animate-pulse"></div>
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2 animate-pulse"></div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6">
                <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !product) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-10 text-center shadow-sm border border-slate-200 dark:border-slate-800 max-w-md">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-5">
            <i className="fas fa-search text-slate-400 dark:text-slate-500 text-2xl"></i>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Product Not Found
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
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

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">

        <div className="container-app py-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">

            {/* Product Images */}
            <div className="space-y-4">

              {/* Main Image Container */}
              <div className="relative bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 group">
                <div className="relative aspect-square overflow-hidden">

                  {/* Image Loading Skeleton */}
                  {imageLoading && (
                    <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 animate-pulse">
                      <div className="w-full h-full flex items-center justify-center">
                        <i className="fas fa-image text-slate-300 dark:text-slate-500 text-5xl"></i>
                      </div>
                    </div>
                  )}

                  {/* Main Product Image */}
                  <img
                    src={mainImage || '/product-placeholder.jpg'}
                    alt={product.name}
                    className={`w-full h-full object-cover transition-all duration-500 cursor-zoom-in group-hover:scale-105 ${imageLoading ? 'opacity-0' : 'opacity-100'
                      }`}
                    onClick={() => setShowImageZoom(true)}
                    onLoad={() => setImageLoading(false)}
                    loading="eager"
                  />

                  {/* Badges */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    {product.isNewArrival && (
                      <span className="bg-green-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                        NEW
                      </span>
                    )}
                    {product.discountPercentage > 0 && (
                      <span className="bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                        -{product.discountPercentage}%
                      </span>
                    )}
                  </div>

                  {/* Navigation Arrows */}
                  {availableImages.length > 1 && (
                    <>
                      <button
                        onClick={() => handleImageNavigation('prev')}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 dark:bg-slate-800/90 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-200 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <i className="fas fa-chevron-left text-sm"></i>
                      </button>
                      <button
                        onClick={() => handleImageNavigation('next')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 dark:bg-slate-800/90 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-200 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <i className="fas fa-chevron-right text-sm"></i>
                      </button>
                    </>
                  )}

                  {/* Image Indicators */}
                  {availableImages.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {availableImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex
                            ? 'bg-blue-500 scale-125'
                            : 'bg-gray-400/60 hover:bg-gray-500'
                            }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Thumbnail Gallery */}
              {availableImages.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {availableImages.map((img, index) => (
                    <button
                      key={index}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${index === currentImageIndex
                        ? 'border-blue-500 ring-1 ring-blue-500'
                        : 'border-transparent hover:border-gray-300 dark:hover:border-slate-600'
                        }`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <img
                        src={img}
                        alt={`${product.name} view ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">

              {/* Header */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">

                {/* Brand */}
                <span className="text-blue-600 dark:text-blue-400 font-medium text-sm uppercase tracking-wide">
                  {product.brand}
                </span>

                {/* Product Name */}
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mt-2 mb-3">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-4 mb-4">
                  <Rating
                    value={product.rating || 4.5}
                    size={20}
                    showValue={true}
                  />
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    ({product.numReviews || 0} reviews)
                  </span>
                </div>

                {/* Price */}
                <PriceDisplay
                  currentPrice={currentPrice}
                  originalPrice={originalPrice}
                  discountedPrice={discountedPrice}
                  discountPercentage={product.discountPercentage || 0}
                />

                {/* Wishlist & Share */}
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                  <button
                    onClick={handleToggleWishlist}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isInWishlist
                      ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600'
                      }`}
                  >
                    <i className={`fas fa-heart ${isInWishlist ? '' : 'far'}`}></i>
                    {isInWishlist ? 'Saved' : 'Save'}
                  </button>
                  <SocialShare
                    url={productUrl}
                    title={product.name}
                    description={shareDescription}
                    image={mainImage}
                  />
                </div>
              </div>

              {/* Color Selection */}
              {product.variants?.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Color: <span className="font-normal text-gray-600 dark:text-gray-400">{selectedColor || 'Select a color'}</span>
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {product.variants.map((variant, index) => (
                      <button
                        key={index}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColor === variant.color
                          ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-800'
                          : 'border-gray-200 dark:border-slate-600 hover:border-gray-400'
                          }`}
                        style={{ backgroundColor: variant.colorCode }}
                        onClick={() => handleColorSelect(variant)}
                        title={variant.color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {availableSizes.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Size: <span className="font-normal text-gray-600 dark:text-gray-400">{selectedSize || 'Select a size'}</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((size, index) => {
                      const isAvailable = size.countInStock > 0;
                      return (
                        <button
                          key={index}
                          disabled={!isAvailable}
                          className={`min-w-[48px] h-10 px-3 rounded-lg border text-sm font-medium transition-all ${selectedSize === size.size
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                            : !isAvailable
                              ? 'border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 text-gray-300 dark:text-slate-600 cursor-not-allowed line-through'
                              : 'border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-slate-500'
                            }`}
                          onClick={() => handleSizeSelect(size)}
                        >
                          {size.size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">

                {/* Stock Indicator */}
                <StockIndicator stock={maxStock} className="mb-4" />

                {/* Quantity */}
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Qty:</span>
                  <div className="flex items-center border border-gray-200 dark:border-slate-600 rounded-lg">
                    <button
                      className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={maxStock === 0 || quantity <= 1}
                    >
                      <i className="fas fa-minus text-xs"></i>
                    </button>
                    <span className="w-12 text-center font-semibold text-gray-900 dark:text-white">
                      {quantity}
                    </span>
                    <button
                      className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={maxStock === 0 || quantity >= maxStock}
                    >
                      <i className="fas fa-plus text-xs"></i>
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={maxStock === 0 || isInCart}
                    className={`flex-1 flex items-center justify-center py-3 px-6 rounded-lg font-semibold transition-all ${maxStock === 0
                      ? 'bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-not-allowed'
                      : isInCart
                        ? 'bg-green-500 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                  >
                    <i className={`fas ${maxStock === 0 ? 'fa-times' : isInCart ? 'fa-check' : 'fa-shopping-cart'} mr-2`}></i>
                    {maxStock === 0 ? 'Out of Stock' : isInCart ? 'In Cart' : 'Add to Cart'}
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={maxStock === 0}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Buy Now
                  </button>
                </div>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center text-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                  <i className="fas fa-shipping-fast text-blue-500 mb-2"></i>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Free Shipping</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                  <i className="fas fa-undo text-green-500 mb-2"></i>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">30-Day Returns</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                  <i className="fas fa-shield-alt text-purple-500 mb-2"></i>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Warranty</span>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts?.length > 0 && (
            <div className="mb-12">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  You May Also Like
                </h2>

                <ProductGrid
                  products={relatedProducts}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                  wishlistProductIds={wishlistItems.map(item => item._id)}
                />
              </div>
            </div>
          )}

          {/* Recently Viewed */}
          <RecentlyViewed
            products={recentlyViewed.slice(1)}
          />
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
