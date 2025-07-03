// src/pages/ProductDetail.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { addToWishlist } from '../redux/slices/wishlistSlice';
import Rating from '../components/Rating';
import ReviewForm from '../components/ReviewForm';
import Loader from '../components/common/Loader';
import { toast } from 'react-toastify';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { product, loading, error } = useSelector((state) => state.product);
  const { user } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  
  // Enhanced state management
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [mainImage, setMainImage] = useState('');
  const [imageLoading, setImageLoading] = useState(true);
  const [animateElements, setAnimateElements] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

  // Trigger animations
  useEffect(() => {
    setTimeout(() => setAnimateElements(true), 100);
  }, []);

  // Calculate discounted price
  const calculateDiscountedPrice = useCallback((price, discountPercentage) => {
    if (discountPercentage && discountPercentage > 0) {
      return price - (price * discountPercentage / 100);
    }
    return null;
  }, []);

  // Fetch product details
  useEffect(() => {
    dispatch(fetchProductById(id));
    window.scrollTo(0, 0);
  }, [dispatch, id]);
  
  // Set main image
  useEffect(() => {
    if (product) {
      if (selectedVariant && selectedVariant.images && selectedVariant.images.length > 0) {
        setMainImage(selectedVariant.images[0]);
      } else if (product.images && product.images.length > 0) {
        setMainImage(product.images[0]);
      }
    }
  }, [product, selectedVariant]);
  
  // Enhanced handlers
  const handleColorSelect = (variant) => {
    setSelectedVariant(variant);
    setSelectedColor(variant.color);
    setSelectedSize('');
  };
  
  const handleSizeSelect = (size) => {
    setSelectedSize(size.size);
  };
  
  const getAvailableSizes = useCallback(() => {
    if (selectedVariant) {
      return selectedVariant.sizes || [];
    } else if (product && product.variants && product.variants.length > 0) {
      return product.variants[0].sizes || [];
    }
    return [];
  }, [product, selectedVariant]);
  
  const isSizeInStock = useCallback((size) => {
    if (selectedVariant) {
      const sizeObj = selectedVariant.sizes.find(s => s.size === size.size);
      return sizeObj && sizeObj.countInStock > 0;
    }
    return size.countInStock > 0;
  }, [selectedVariant]);
  
  const handleQuantityChange = (newQuantity) => {
    const maxStock = getMaxStock();
    setQuantity(Math.min(Math.max(1, newQuantity), maxStock));
  };
  
  const getMaxStock = useCallback(() => {
    if (selectedVariant && selectedSize) {
      const sizeObj = selectedVariant.sizes.find(s => s.size === selectedSize);
      return sizeObj ? sizeObj.countInStock : 0;
    } else if (product) {
      return product.countInStock || 0;
    }
    return 0;
  }, [product, selectedVariant, selectedSize]);
  
  // Enhanced add to cart
  const handleAddToCart = () => {
    if (product.variants && product.variants.length > 0 && !selectedColor) {
      toast.error('Please select a color first! 🎨');
      return;
    }
    
    if (getAvailableSizes().length > 0 && !selectedSize) {
      toast.error('Please select a size first! 👟');
      return;
    }
    
    const maxStock = getMaxStock();
    if (maxStock <= 0) {
      toast.error('Sorry, this item is currently out of stock! 😔');
      return;
    }
    
    const existingCartItem = cartItems.find(item => 
      item.productId === product._id && 
      item.size === selectedSize && 
      item.color === selectedColor
    );
    
    if (existingCartItem && (existingCartItem.quantity + quantity > maxStock)) {
      toast.warning(`You can only add ${maxStock - existingCartItem.quantity} more of this item to your cart! 🛒`);
      return;
    }
    
    const cartItem = {
      productId: product._id,
      quantity,
      size: selectedSize,
      color: selectedColor,
      price: selectedVariant && selectedVariant.price ? selectedVariant.price : product.price,
      name: product.name,
      image: mainImage
    };
    
    dispatch(addToCart(cartItem));
    toast.success('Added to cart successfully! 🎉');
  };
  
  // Enhanced add to wishlist
  const handleAddToWishlist = () => {
    if (!user) {
      toast.info('Please sign in to add items to your wishlist! 💝');
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    
    dispatch(addToWishlist(product._id));
    toast.success('Added to wishlist! ❤️');
  };
  
  const handleImageClick = (image) => {
    setMainImage(image);
    setImageLoading(true);
  };

  const isInWishlist = wishlistItems?.some(item => item._id === product?._id);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-500/20 backdrop-blur-xl border border-red-300/50 rounded-3xl p-12 text-center shadow-2xl max-w-md">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-exclamation-triangle text-white text-2xl"></i>
          </div>
          <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">
            Failed to Load Product
          </h3>
          <p className="text-red-500 dark:text-red-300 mb-6">{error.message || 'Something went wrong'}</p>
          <button
            onClick={() => dispatch(fetchProductById(id))}
            className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-200"
          >
            <i className="fas fa-redo mr-2"></i>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
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
  
  const salePrice = calculateDiscountedPrice(product.price, product.discountPercentage);
  const availableSizes = getAvailableSizes();
  const maxStock = getMaxStock();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        
        {/* Enhanced Navigation */}
        <div className={`mb-8 ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => navigate(-1)} 
                className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors font-semibold"
              >
                <i className="fas fa-arrow-left mr-3 text-lg"></i>
                Back to Products
              </button>
              
              {/* Enhanced Breadcrumb */}
              <div className="hidden md:flex items-center space-x-2 text-sm">
                <Link to="/" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <i className="fas fa-home mr-1"></i>
                  Home
                </Link>
                <i className="fas fa-chevron-right text-gray-400"></i>
                <Link to="/products" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Products
                </Link>
                <i className="fas fa-chevron-right text-gray-400"></i>
                <span className="text-blue-600 dark:text-blue-400 font-medium truncate max-w-40">
                  {product.name}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          
          {/* Enhanced Product Images */}
          <div className={`space-y-6 ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            
            {/* Main Image */}
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
                  src={mainImage || (product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop')} 
                  alt={product.name} 
                  className={`w-full h-full object-cover transition-all duration-700 cursor-zoom-in ${
                    isZoomed ? 'scale-150' : 'group-hover:scale-110'
                  } ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                  onClick={() => setIsZoomed(!isZoomed)}
                  onLoad={() => setImageLoading(false)}
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

                {/* Quick View Toggle */}
                <div className="absolute top-6 left-6">
                  <button
                    onClick={() => setIsZoomed(!isZoomed)}
                    className="w-12 h-12 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200"
                    title={isZoomed ? 'Exit Zoom' : 'Zoom In'}
                  >
                    <i className={`fas ${isZoomed ? 'fa-search-minus' : 'fa-search-plus'}`}></i>
                  </button>
                </div>

                {/* Image Navigation Arrows */}
                {product.images && product.images.length > 1 && (
                  <>
                    <button className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 opacity-0 group-hover:opacity-100">
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    <button className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 opacity-0 group-hover:opacity-100">
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {/* Enhanced Thumbnail Gallery */}
            {product.images && product.images.length > 0 && (
              <div className="grid grid-cols-5 gap-3">
                {product.images.map((img, index) => (
                  <div
                    key={index}
                    className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 ${
                      mainImage === img 
                        ? 'ring-4 ring-blue-500 ring-opacity-60 shadow-lg' 
                        : 'hover:ring-2 hover:ring-gray-300 hover:ring-opacity-60'
                    }`}
                    onClick={() => handleImageClick(img)}
                  >
                    <img 
                      src={img} 
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {mainImage === img && (
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
          <div className={`space-y-8 ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
            
            {/* Header Section */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 shadow-2xl">
              
              {/* Brand */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider text-sm">
                    {product.brand}
                  </span>
                </div>
                <button
                  onClick={handleAddToWishlist}
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
              
              {/* Rating */}
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
              </div>

              {/* Enhanced Price Display */}
              <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-800/50">
                {salePrice ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-4">
                      <span className="text-4xl font-black bg-gradient-to-r from-red-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                        ${salePrice.toFixed(2)}
                      </span>
                      <span className="text-xl text-gray-500 dark:text-gray-400 line-through">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                        <i className="fas fa-percentage mr-1"></i>
                        {product.discountPercentage}% OFF
                      </span>
                      <span className="bg-green-100 text-green-800 text-sm font-bold px-3 py-1 rounded-full">
                        <i className="fas fa-piggy-bank mr-1"></i>
                        Save ${(product.price - salePrice).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    ${product.price.toFixed(2)}
                  </div>
                )}
                
                {/* Payment Options */}
                <div className="mt-4 pt-4 border-t border-blue-200/50 dark:border-blue-800/50">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <i className="fas fa-credit-card mr-2 text-blue-500"></i>
                    <span>or 4 interest-free payments of ${((salePrice || product.price) / 4).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Color Selection */}
            {product.variants && product.variants.length > 0 && (
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
                  {availableSizes.map((size, index) => (
                    <button
                      key={index}
                      disabled={!isSizeInStock(size)}
                      className={`relative p-4 rounded-2xl border-2 font-semibold transition-all duration-200 hover:scale-105 ${
                        selectedSize === size.size
                          ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 shadow-lg'
                          : !isSizeInStock(size)
                            ? 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed opacity-50'
                            : 'border-white/30 bg-white/20 text-gray-900 dark:text-white hover:border-blue-300 hover:bg-white/30'
                      }`}
                      onClick={() => handleSizeSelect(size)}
                    >
                      <span className="block text-lg font-bold">{size.size}</span>
                      {!isSizeInStock(size) && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <i className="fas fa-times text-red-500"></i>
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                
                {/* Size Guide */}
                <div className="mt-6 pt-6 border-t border-white/20 dark:border-gray-700/20">
                  <button className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors text-sm font-medium">
                    <i className="fas fa-ruler-combined mr-2"></i>
                    Size Guide
                    <i className="fas fa-external-link-alt ml-2 text-xs"></i>
                  </button>
                </div>
              </div>
            )}

            {/* Enhanced Quantity & Actions */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 shadow-2xl">
              
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
                  
                  {/* Stock Status */}
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      maxStock > 10 ? 'bg-green-400' : 
                      maxStock > 0 ? 'bg-yellow-400' : 'bg-red-400'
                    }`}></div>
                    <span className={`font-semibold ${
                      maxStock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {maxStock > 0 ? `${maxStock} in stock` : 'Out of Stock'}
                    </span>
                    {maxStock > 0 && maxStock <= 5 && (
                      <span className="text-orange-500 text-sm font-medium">
                        (Hurry, only {maxStock} left!)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={handleAddToCart}
                  disabled={maxStock === 0}
                  className={`w-full flex items-center justify-center py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-200 relative overflow-hidden group ${
                    maxStock === 0
                      ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-2xl hover:scale-105 active:scale-95'
                  }`}
                >
                  {/* Button Shimmer Effect */}
                  {maxStock > 0 && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  )}
                  
                  <i className={`fas ${maxStock === 0 ? 'fa-times' : 'fa-shopping-cart'} mr-3 relative z-10`}></i>
                  <span className="relative z-10">
                    {maxStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </span>
                  {maxStock > 0 && (
                    <i className="fas fa-arrow-right ml-3 relative z-10 group-hover:translate-x-1 transition-transform duration-200"></i>
                  )}
                </button>
                
                {/* Secondary Actions */}
                <div className="grid grid-cols-2 gap-4">
                  <button className="flex items-center justify-center py-3 px-4 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl font-semibold text-gray-900 dark:text-white hover:bg-white/30 transition-all duration-200">
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
        <div className={`mb-16 ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl overflow-hidden shadow-2xl">
            
            {/* Tab Navigation */}
            <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-1">
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-2">
                <nav className="flex space-x-2">
                  {[
                    { id: 'description', label: 'Description', icon: 'fa-align-left' },
                    { id: 'specifications', label: 'Specifications', icon: 'fa-list-ul' },
                    { id: 'reviews', label: `Reviews (${product.numReviews || 0})`, icon: 'fa-star' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      className={`flex-1 flex items-center justify-center py-4 px-6 rounded-2xl font-semibold transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-white/20 text-white shadow-lg'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <i className={`fas ${tab.icon} mr-2`}></i>
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {activeTab === 'description' && (
                <div className="animate-fade-in">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    <i className="fas fa-info-circle mr-3 text-blue-500"></i>
                    Product Description
                  </h3>
                  <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>{product.description}</p>
                    
                    {/* Key Features */}
                    {product.features && product.features.length > 0 && (
                      <div className="mt-8">
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                          <i className="fas fa-check-circle mr-2 text-green-500"></i>
                          Key Features
                        </h4>
                        <ul className="space-y-2">
                          {product.features.map((feature, index) => (
                            <li key={index} className="flex items-start">
                              <i className="fas fa-check text-green-500 mr-3 mt-1 flex-shrink-0"></i>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'specifications' && (
                <div className="animate-fade-in">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    <i className="fas fa-cogs mr-3 text-purple-500"></i>
                    Product Specifications
                  </h3>
                  <div className="bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl overflow-hidden">
                    <table className="min-w-full">
                      <tbody className="divide-y divide-white/20 dark:divide-gray-700/20">
                        {[
                          { label: 'Brand', value: product.brand },
                          { label: 'Gender', value: product.gender ? product.gender.charAt(0).toUpperCase() + product.gender.slice(1) : 'Unisex' },
                          { label: 'Material', value: product.materials ? product.materials.join(', ') : 'Premium Materials' },
                          { label: 'Style', value: product.style || 'Contemporary' },
                          { label: 'Available Colors', value: product.variants ? product.variants.map(v => v.color).join(', ') : 'Multiple' },
                          { label: 'Available Sizes', value: availableSizes.length > 0 ? availableSizes.map(s => s.size).join(', ') : 'Various' },
                          { label: 'Weight', value: product.weight || 'Lightweight' },
                          { label: 'Care Instructions', value: 'Spot clean with damp cloth' }
                        ].map((spec, index) => (
                          <tr key={index} className="hover:bg-white/10 transition-colors">
                            <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white bg-white/5 w-1/3">
                              {spec.label}
                            </td>
                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                              {spec.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="animate-fade-in">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    <i className="fas fa-comments mr-3 text-orange-500"></i>
                    Customer Reviews
                  </h3>
                  
                  {product.reviews && product.reviews.length > 0 ? (
                    <div className="space-y-6">
                      {product.reviews.map((review) => (
                        <div key={review._id} className="bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                {review.name.charAt(0)}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">{review.name}</h4>
                                <div className="flex items-center">
                                  <Rating value={review.rating} size={16} />
                                </div>
                              </div>
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(review.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-star text-gray-400 text-2xl"></i>
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Reviews Yet</h4>
                      <p className="text-gray-600 dark:text-gray-400">Be the first to review this amazing product!</p>
                    </div>
                  )}

                  {/* Review Form */}
                  <div className="mt-12">
                    {user ? (
                      <ReviewForm productId={product._id} />
                    ) : (
                      <div className="bg-blue-500/20 backdrop-blur-lg border border-blue-300/50 rounded-3xl p-8 text-center">
                        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <i className="fas fa-user-circle text-white text-2xl"></i>
                        </div>
                        <h4 className="text-xl font-bold text-blue-800 dark:text-blue-200 mb-3">
                          Share Your Experience
                        </h4>
                        <p className="text-blue-700 dark:text-blue-300 mb-6">
                          Please sign in to write a review and help other customers make informed decisions.
                        </p>
                        <Link
                          to={`/login?redirect=${encodeURIComponent(window.location.pathname)}`}
                          className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105"
                        >
                          <i className="fas fa-sign-in-alt mr-2"></i>
                          Sign In to Review
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products Placeholder */}
        <div className={`${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.8s' }}>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 shadow-2xl text-center">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              <i className="fas fa-heart mr-3"></i>
              You May Also Like
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
              Discover more amazing products from our curated collection
            </p>
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-12">
              <i className="fas fa-boxes text-gray-400 text-6xl mb-4"></i>
              <p className="text-gray-500 dark:text-gray-400">Related products coming soon...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(-5px) rotate(-1deg); }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        .cursor-zoom-in {
          cursor: zoom-in;
        }
        
        .prose p {
          margin-bottom: 1rem;
          line-height: 1.7;
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;
