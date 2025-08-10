import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';

// Redux actions
import { 
  fetchFeaturedProducts, 
  fetchCategories,
  clearProductError 
} from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice';

// Components
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import CountdownTimer from '../components/common/CountdownTimer';
import HeroSection from '../components/home/HeroSection';
import FeaturedProducts from '../components/home/FeaturedProducts';
import CategoriesSection from '../components/home/CategoriesSection';
import OffersSection from '../components/home/OffersSection';
import TestimonialsSection from '../components/home/TestimonialsSection';
import NewsletterSection from '../components/home/NewsletterSection';

// Hooks
import { useAuth } from '../hooks/useAuth';
import useLocalStorage from '../hooks/useLocalStorage';

// Constants
const PROMO_OFFERS = [
  {
    id: 'weekend20',
    title: 'Weekend Flash Sale',
    description: 'Get 20% off on all products + Free shipping!',
    code: 'WEEKEND20',
    type: 'mega',
    gradient: 'from-orange-500 via-red-500 to-pink-600',
    expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  },
  {
    id: 'freeship',
    title: 'Free Shipping',
    description: 'Free shipping on orders over $75',
    code: 'FREESHIP',
    icon: 'fa-shipping-fast',
    color: 'from-blue-600 to-cyan-600'
  },
  {
    id: 'vip3free',
    title: 'VIP Deal',
    description: 'Buy 2 get 1 free on selected items',
    code: 'VIP3FREE',
    icon: 'fa-crown',
    color: 'from-purple-600 to-pink-600'
  },
  {
    id: 'welcome15',
    title: 'First Order',
    description: '15% off your first purchase',
    code: 'WELCOME15',
    icon: 'fa-user-plus',
    color: 'from-green-600 to-emerald-600'
  }
];

const TESTIMONIALS = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Verified Buyer",
    rating: 5,
    comment: "The shoes are incredibly comfortable and stylish! Best purchase I've made.",
    avatar: "SJ",
    verified: true,
    purchaseDate: "2024-01-15"
  },
  {
    id: 2,
    name: "Mike Chen",
    role: "Premium Member",
    rating: 5,
    comment: "Fast delivery and excellent quality. Highly recommend this store!",
    avatar: "MC",
    verified: true,
    purchaseDate: "2024-02-20"
  },
  {
    id: 3,
    name: "Emma Davis",
    role: "Fashion Blogger",
    rating: 4,
    comment: "Great variety and competitive prices. My go-to shoe store now.",
    avatar: "ED",
    verified: true,
    purchaseDate: "2024-03-10"
  }
];

const Home = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  
  // Redux state
  const { 
    featuredProducts, 
    categories, 
    loading: productLoading,
    error: productError,
    categoriesLoading 
  } = useSelector(state => state.product);
  
  const { items: cartItems } = useSelector(state => state.cart);
  const { items: wishlistItems } = useSelector(state => state.wishlist);
  
  // Local state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const [lastVisited, setLastVisited] = useLocalStorage('lastHomeVisit', null);
  
  // Memoized values
  const itemsPerSlide = useMemo(() => {
    if (viewportWidth >= 1280) return 4; // xl
    if (viewportWidth >= 1024) return 3; // lg
    if (viewportWidth >= 640) return 2;  // sm
    return 1; // mobile
  }, [viewportWidth]);
  
  const totalSlides = useMemo(() => 
    Math.ceil(featuredProducts.length / itemsPerSlide),
    [featuredProducts.length, itemsPerSlide]
  );
  
  const isProductInCart = useCallback((productId) => 
    cartItems.some(item => item.product?._id === productId || item.product === productId),
    [cartItems]
  );
  
  const isProductInWishlist = useCallback((productId) => 
    wishlistItems.some(item => item._id === productId || item.product?._id === productId),
    [wishlistItems]
  );

  // Handle viewport resize
  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Clear any previous errors
        dispatch(clearProductError());
        
        // Fetch data concurrently
        const promises = [
          dispatch(fetchFeaturedProducts()),
          dispatch(fetchCategories())
        ];
        
        await Promise.all(promises);
        
        // Track page visit
        setLastVisited(new Date().toISOString());
        setIsInitialized(true);
        
        // Show welcome message for returning users
        if (lastVisited) {
          const daysSinceLastVisit = Math.floor(
            (Date.now() - new Date(lastVisited).getTime()) / (1000 * 60 * 60 * 24)
          );
          
          if (daysSinceLastVisit > 0) {
            toast.info(`🎉 Welcome back! You last visited ${daysSinceLastVisit} day${daysSinceLastVisit > 1 ? 's' : ''} ago.`);
          }
        }
        
      } catch (error) {
        console.error('Failed to initialize home page:', error);
        toast.error('Failed to load some content. Please refresh the page.');
      }
    };
    
    if (!isInitialized) {
      initializeData();
    }
  }, [dispatch, isInitialized, lastVisited, setLastVisited]);

  // Auto-rotate carousel
  useEffect(() => {
    if (featuredProducts.length > itemsPerSlide) {
      const interval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % totalSlides);
      }, 6000); // 6 seconds
      
      return () => clearInterval(interval);
    }
  }, [featuredProducts.length, itemsPerSlide, totalSlides]);

  // Carousel navigation
  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide(prev => prev === 0 ? totalSlides - 1 : prev - 1);
  }, [totalSlides]);

  // Product actions
  const handleAddToCart = async (product, options = {}) => {
    try {
      if (!isAuthenticated) {
        toast.info('Please sign in to add items to cart');
        return;
      }
      
      if (isProductInCart(product._id)) {
        toast.info('Product is already in your cart');
        return;
      }
      
      await dispatch(addToCart({
        productId: product._id,
        quantity: options.quantity || 1,
        size: options.size,
        color: options.color,
        product // Include product data for optimistic updates
      })).unwrap();
      
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleToggleWishlist = async (product) => {
    try {
      if (!isAuthenticated) {
        toast.info('Please sign in to manage your wishlist');
        return;
      }
      
      const inWishlist = isProductInWishlist(product._id);
      
      if (inWishlist) {
        await dispatch(removeFromWishlist({
          productId: product._id,
          productName: product.name
        })).unwrap();
      } else {
        await dispatch(addToWishlist({
          productId: product._id,
          product
        })).unwrap();
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    }
  };

  const handleCopyPromoCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(`🎉 Promo code "${code}" copied to clipboard!`);
      
      // Track promo code copy
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'promo_code_copied', {
          event_category: 'engagement',
          event_label: code
        });
      }
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      
      try {
        document.execCommand('copy');
        toast.success(`📋 Promo code "${code}" copied!`);
      } catch (fallbackError) {
        toast.error('Failed to copy promo code');
      }
      
      document.body.removeChild(textArea);
    }
  };

  const handleNewsletterSubscribe = async (email) => {
    try {
      // Here you would typically call an API to subscribe the user
      // await newsletterService.subscribe(email);
      
      toast.success('🎉 Thank you for subscribing! Welcome to our community!');
      
      // Track newsletter subscription
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'newsletter_subscribe', {
          event_category: 'engagement'
        });
      }
    } catch (error) {
      toast.error('Failed to subscribe. Please try again.');
    }
  };

  // Loading state
  if (!isInitialized && (productLoading || categoriesLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <LoadingSpinner size="large" message="Loading amazing deals..." />
      </div>
    );
  }

  // Error state
  if (productError && !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <ErrorMessage 
          message={productError.message || 'Failed to load page content'}
          onRetry={() => {
            dispatch(clearProductError());
            setIsInitialized(false);
          }}
        />
      </div>
    );
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>ShoeMarkNet - Premium Shoes at Unbeatable Prices | Home</title>
        <meta 
          name="description" 
          content="Discover premium shoes with up to 75% off. Free shipping, AI-curated deals, and the latest collections. Shop running, casual, formal, and sports shoes." 
        />
        <meta 
          name="keywords" 
          content="shoes, sneakers, running shoes, casual shoes, formal shoes, discount, sale, premium footwear" 
        />
        <meta property="og:title" content="ShoeMarkNet - Premium Shoes at Unbeatable Prices" />
        <meta 
          property="og:description" 
          content="Discover premium shoes with up to 75% off. Free shipping and latest collections." 
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://shoemarknet.com/" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Hero Section */}
        <HeroSection
          featuredProducts={featuredProducts}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          isProductInCart={isProductInCart}
          isProductInWishlist={isProductInWishlist}
        />

        {/* Featured Products Section */}
        <FeaturedProducts
          products={featuredProducts}
          currentSlide={currentSlide}
          itemsPerSlide={itemsPerSlide}
          onNextSlide={nextSlide}
          onPrevSlide={prevSlide}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          isProductInCart={isProductInCart}
          isProductInWishlist={isProductInWishlist}
          loading={productLoading}
        />

        {/* Categories Section */}
        <CategoriesSection
          categories={categories}
          loading={categoriesLoading}
        />

        {/* Offers Section */}
        <OffersSection
          offers={PROMO_OFFERS}
          onCopyCode={handleCopyPromoCode}
        />

        {/* Testimonials Section */}
        <TestimonialsSection testimonials={TESTIMONIALS} />

        {/* Newsletter Section */}
        <NewsletterSection onSubscribe={handleNewsletterSubscribe} />

        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "ShoeMarkNet",
              "description": "Premium shoes at unbeatable prices",
              "url": "https://shoemarknet.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://shoemarknet.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </div>
    </>
  );
};

export default React.memo(Home);
