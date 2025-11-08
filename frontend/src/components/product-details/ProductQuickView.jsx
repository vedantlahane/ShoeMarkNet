import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

// Utils
import { trackEvent } from '../../utils/analytics';
import { formatCurrency } from '../../utils/helpers';

// Hooks
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';
import useLocalStorage from '../../hooks/useLocalStorage';

const ProductQuickView = ({
  product = null,
  isOpen = false,
  onClose = () => {},
  onAddToCart = () => {},
  onAddToWishlist = () => {},
  variant = 'default', // default, compact, featured
  showSocialShare = true,
  className = ''
}) => {
  // Default product structure
  const defaultProduct = {
    id: '1',
    name: 'Premium Running Shoes',
    brand: 'ShoeMarkNet',
    price: 129.99,
    originalPrice: 159.99,
    discount: 19,
    rating: 4.8,
    reviewCount: 156,
    inStock: true,
    stockCount: 12,
    sku: 'SMN-RUN-001',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=600&auto=format&fit=crop'
    ],
    thumbnails: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=150&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=150&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=150&auto=format&fit=crop'
    ],
    description: 'Experience ultimate comfort and performance with our premium running shoes. Engineered for athletes and casual runners alike.',
    features: [
      'Breathable mesh upper',
      'Responsive cushioning',
      'Durable rubber outsole',
      'Lightweight design'
    ],
    sizes: [
      { id: '7', label: 'US 7', available: true },
      { id: '8', label: 'US 8', available: true },
      { id: '9', label: 'US 9', available: true },
      { id: '10', label: 'US 10', available: false },
      { id: '11', label: 'US 11', available: true }
    ],
    colors: [
      { id: 'black', name: 'Black', hex: '#000000', available: true },
      { id: 'white', name: 'White', hex: '#FFFFFF', available: true },
      { id: 'blue', name: 'Navy Blue', hex: '#1e3a8a', available: true },
      { id: 'red', name: 'Red', hex: '#dc2626', available: false }
    ],
    category: 'Running Shoes',
    tags: ['running', 'athletic', 'comfortable', 'lightweight'],
    freeShipping: true,
    returnPolicy: '30-day return',
    warranty: '1 year manufacturer warranty'
  };

  // Use provided product or fallback to default
  const productData = product || defaultProduct;

  // State management
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [animationClass, setAnimationClass] = useState('');

  // Refs
  const modalRef = useRef(null);
  const imageRef = useRef(null);

  // Redux state
  const { cart, wishlist } = useSelector(state => ({
    cart: state.cart?.items || [],
    wishlist: state.wishlist?.items || []
  }));
  const dispatch = useDispatch();

  // Local storage for recently viewed
  const [recentlyViewed, setRecentlyViewed] = useLocalStorage('recentlyViewed', []);

  // Initialize animations when opened
  useEffect(() => {
    if (isOpen) {
      setAnimationClass('animate-fade-in-scale');
      // Add to recently viewed
      if (productData && !recentlyViewed.find(item => item.id === productData.id)) {
        const newRecentlyViewed = [
          { id: productData.id, name: productData.name, image: productData.images[0], price: productData.price },
          ...recentlyViewed.slice(0, 4)
        ];
        setRecentlyViewed(newRecentlyViewed);
      }
    } else {
      setAnimationClass('animate-fade-out-scale');
    }
  }, [isOpen, productData, recentlyViewed, setRecentlyViewed]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'escape': () => onClose(),
    'arrowleft': () => setSelectedImage(prev => prev > 0 ? prev - 1 : productData.images.length - 1),
    'arrowright': () => setSelectedImage(prev => prev < productData.images.length - 1 ? prev + 1 : 0),
    'enter': () => handleAddToCart()
  });

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle add to cart
  const handleAddToCart = useCallback(async () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }

    if (!selectedColor) {
      toast.error('Please select a color');
      return;
    }

    setIsAddingToCart(true);

    try {
      const cartItem = {
        ...productData,
        selectedSize,
        selectedColor,
        quantity,
        cartId: `${productData.id}-${selectedSize}-${selectedColor}`
      };

      await onAddToCart(cartItem);
      
      toast.success(`${productData.name} added to cart!`);
      
      trackEvent('product_quick_view_add_to_cart', {
        product_id: productData.id,
        product_name: productData.name,
        price: productData.price,
        size: selectedSize,
        color: selectedColor,
        quantity
      });

    } catch (error) {
      toast.error('Failed to add to cart. Please try again.');
      console.error('Add to cart error:', error);
    } finally {
      setIsAddingToCart(false);
    }
  }, [productData, selectedSize, selectedColor, quantity, onAddToCart]);

  // Handle add to wishlist
  const handleAddToWishlist = useCallback(async () => {
    setIsAddingToWishlist(true);

    try {
      await onAddToWishlist(productData);
      toast.success(`${productData.name} added to wishlist!`);
      
      trackEvent('product_quick_view_add_to_wishlist', {
        product_id: productData.id,
        product_name: productData.name
      });

    } catch (error) {
      toast.error('Failed to add to wishlist. Please try again.');
      console.error('Add to wishlist error:', error);
    } finally {
      setIsAddingToWishlist(false);
    }
  }, [productData, onAddToWishlist]);

  // Handle image zoom
  const handleMouseMove = useCallback((e) => {
    if (!showImageZoom || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x, y });
  }, [showImageZoom]);

  // Check if product is in wishlist
  const isInWishlist = wishlist.some(item => item.id === productData?.id);

  // Handle social share
  const handleSocialShare = useCallback((platform) => {
    const url = window.location.href;
    const text = `Check out ${productData.name} at ShoeMarkNet!`;
    
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'pinterest':
        shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(text)}&media=${encodeURIComponent(productData.images[0])}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
    
    trackEvent('product_quick_view_social_share', {
      product_id: productData.id,
      platform
    });
  }, [productData]);

  if (!isOpen || !productData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        ref={modalRef}
        className={`relative w-full max-w-6xl max-h-[90vh] bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl shadow-2xl overflow-hidden ${animationClass} ${className}`}
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-20 w-10 h-10 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center text-gray-900 dark:text-white hover:bg-white/30 transition-all duration-200 hover:scale-110 group"
          title="Close (ESC)"
        >
          <i className="fas fa-times group-hover:scale-110 transition-transform duration-200"></i>
        </button>

        {/* Content */}
        <div className="flex flex-col lg:flex-row h-full">
          
          {/* Image Section */}
          <div className="lg:w-1/2 p-6 space-y-4">
            
            {/* Main Image */}
            <div className="relative group">
              <div 
                className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden cursor-zoom-in"
                onMouseEnter={() => setShowImageZoom(true)}
                onMouseLeave={() => setShowImageZoom(false)}
                onMouseMove={handleMouseMove}
              >
                <img
                  ref={imageRef}
                  src={productData.images[selectedImage]}
                  alt={productData.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                
                {/* Zoom Overlay */}
                {showImageZoom && (
                  <div 
                    className="absolute inset-0 bg-black/20 pointer-events-none"
                    style={{
                      backgroundImage: `url(${productData.images[selectedImage]})`,
                      backgroundSize: '200%',
                      backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      backgroundRepeat: 'no-repeat'
                    }}
                  />
                )}

                {/* Discount Badge */}
                {productData.discount > 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    -{productData.discount}%
                  </div>
                )}

                {/* Stock Badge */}
                {productData.stockCount <= 5 && (
                  <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
                    Only {productData.stockCount} left!
                  </div>
                )}
              </div>

              {/* Image Navigation */}
              {productData.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(prev => prev > 0 ? prev - 1 : productData.images.length - 1)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200"
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  <button
                    onClick={() => setSelectedImage(prev => prev < productData.images.length - 1 ? prev + 1 : 0)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200"
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {productData.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {productData.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                      selectedImage === index
                        ? 'border-blue-500 shadow-lg scale-105'
                        : 'border-white/30 hover:border-blue-300'
                    }`}
                  >
                    <img
                      src={productData.thumbnails[index]}
                      alt={`${productData.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="lg:w-1/2 p-6 overflow-y-auto">
            
            {/* Product Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                  {productData.brand}
                </span>
                <div className="flex items-center space-x-2">
                  {/* Wishlist Button */}
                  <button
                    onClick={handleAddToWishlist}
                    disabled={isAddingToWishlist}
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                      isInWishlist
                        ? 'border-red-500 text-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-300 text-gray-500 hover:border-red-500 hover:text-red-500'
                    }`}
                    title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <i className={`fas fa-heart ${isAddingToWishlist ? 'animate-pulse' : ''}`}></i>
                  </button>

                  {/* Social Share */}
                  {showSocialShare && (
                    <div className="relative group">
                      <button className="w-10 h-10 rounded-full border-2 border-gray-300 text-gray-500 flex items-center justify-center hover:border-blue-500 hover:text-blue-500 transition-all duration-200">
                        <i className="fas fa-share-alt"></i>
                      </button>
                      <div className="absolute top-12 right-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 space-y-2">
                        <button
                          onClick={() => handleSocialShare('facebook')}
                          className="flex items-center space-x-2 w-full text-left px-3 py-2 rounded-xl hover:bg-white/20 transition-colors text-blue-600"
                        >
                          <i className="fab fa-facebook"></i>
                          <span className="text-sm">Facebook</span>
                        </button>
                        <button
                          onClick={() => handleSocialShare('twitter')}
                          className="flex items-center space-x-2 w-full text-left px-3 py-2 rounded-xl hover:bg-white/20 transition-colors text-blue-400"
                        >
                          <i className="fab fa-twitter"></i>
                          <span className="text-sm">Twitter</span>
                        </button>
                        <button
                          onClick={() => handleSocialShare('pinterest')}
                          className="flex items-center space-x-2 w-full text-left px-3 py-2 rounded-xl hover:bg-white/20 transition-colors text-red-600"
                        >
                          <i className="fab fa-pinterest"></i>
                          <span className="text-sm">Pinterest</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-3">
                {productData.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={`fas fa-star text-sm ${
                        i < Math.floor(productData.rating) ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-yellow-500 font-bold">{productData.rating}</span>
                <span className="text-gray-500">({productData.reviewCount} reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline space-x-3 mb-4">
                <span className="text-3xl font-black text-gray-900 dark:text-white">
                  {formatCurrency(productData.price)}
                </span>
                {productData.originalPrice > productData.price && (
                  <span className="text-xl text-gray-500 line-through">
                    {formatCurrency(productData.originalPrice)}
                  </span>
                )}
                {productData.discount > 0 && (
                  <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                    Save {productData.discount}%
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center space-x-2 mb-6">
                <div className={`w-3 h-3 rounded-full ${productData.inStock ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
                <span className={`font-semibold ${productData.inStock ? 'text-green-600' : 'text-red-600'}`}>
                  {productData.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
                {productData.inStock && (
                  <span className="text-gray-500">• {productData.stockCount} available</span>
                )}
              </div>
            </div>

            {/* Product Options */}
            <div className="space-y-6 mb-8">
              
              {/* Size Selection */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <i className="fas fa-ruler mr-2 text-purple-500"></i>
                  Size {selectedSize && <span className="ml-2 text-blue-600">({selectedSize})</span>}
                </h3>
                <div className="grid grid-cols-5 gap-2">
                  {productData.sizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => size.available && setSelectedSize(size.label)}
                      disabled={!size.available}
                      className={`p-3 border-2 rounded-xl font-semibold transition-all duration-200 hover:scale-105 ${
                        selectedSize === size.label
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                          : size.available
                          ? 'border-gray-300 hover:border-blue-300 text-gray-700 dark:text-gray-300'
                          : 'border-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                      }`}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <i className="fas fa-palette mr-2 text-pink-500"></i>
                  Color {selectedColor && <span className="ml-2 text-blue-600">({productData.colors.find(c => c.name === selectedColor)?.name})</span>}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {productData.colors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => color.available && setSelectedColor(color.name)}
                      disabled={!color.available}
                      className={`relative w-12 h-12 rounded-full border-4 transition-all duration-200 hover:scale-110 ${
                        selectedColor === color.name
                          ? 'border-blue-500 shadow-lg'
                          : 'border-gray-300 hover:border-gray-400'
                      } ${!color.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      {!color.available && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-8 h-0.5 bg-red-500 transform rotate-45"></div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <i className="fas fa-calculator mr-2 text-green-500"></i>
                  Quantity
                </h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-white/20 rounded-l-2xl transition-colors"
                    >
                      <i className="fas fa-minus"></i>
                    </button>
                    <span className="w-16 h-10 flex items-center justify-center font-bold text-gray-900 dark:text-white">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(productData.stockCount, quantity + 1))}
                      className="w-10 h-10 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-white/20 rounded-r-2xl transition-colors"
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
                    Max: {productData.stockCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart || !productData.inStock || !selectedSize || !selectedColor}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-xl flex items-center justify-center space-x-2"
              >
                {isAddingToCart ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Adding to Cart...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-shopping-cart"></i>
                    <span>Add to Cart • {formatCurrency(productData.price * quantity)}</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button className="bg-white/20 backdrop-blur-lg border border-white/30 text-gray-900 dark:text-white font-semibold py-3 px-4 rounded-2xl hover:bg-white/30 transition-all duration-200 flex items-center justify-center space-x-2">
                  <i className="fas fa-heart"></i>
                  <span>Save</span>
                </button>
                <button className="bg-white/20 backdrop-blur-lg border border-white/30 text-gray-900 dark:text-white font-semibold py-3 px-4 rounded-2xl hover:bg-white/30 transition-all duration-200 flex items-center justify-center space-x-2">
                  <i className="fas fa-external-link-alt"></i>
                  <span>View Full Details</span>
                </button>
              </div>
            </div>

            {/* Product Features */}
            <div className="border-t border-white/20 pt-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <i className="fas fa-star mr-2 text-yellow-500"></i>
                Key Features
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {productData.features.map((feature, index) => (
                  <div key={index} className="flex items-center bg-white/10 backdrop-blur-lg rounded-xl p-3">
                    <i className="fas fa-check text-green-500 mr-3"></i>
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="border-t border-white/20 pt-6 mt-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-2">
                  <i className="fas fa-shipping-fast text-green-500 text-2xl"></i>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Free Shipping
                  </div>
                </div>
                <div className="space-y-2">
                  <i className="fas fa-undo text-blue-500 text-2xl"></i>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    30-Day Returns
                  </div>
                </div>
                <div className="space-y-2">
                  <i className="fas fa-shield-alt text-purple-500 text-2xl"></i>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    1 Year Warranty
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Styles */}
      </div>
    </div>
  );
};

export default ProductQuickView;
