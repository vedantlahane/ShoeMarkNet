import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import PageMeta from '../components/seo/PageMeta';

// Redux actions
import { fetchFeaturedProducts } from '../redux/slices/productSlice';

// Components
import LoadingSpinner from '../components/common/feedback/LoadingSpinner';

// Hooks
import useLocalStorage from '../hooks/useLocalStorage';

// Utils
import { trackEvent } from '../utils/analytics';

// Constants
const POPULAR_PAGES = [
  { 
    name: 'Search', 
    path: '/search', 
    icon: 'fa-search', 
    color: 'from-purple-500 to-indigo-500',
    description: 'Find products fast'
  },
  { 
    name: 'Checkout', 
    path: '/checkout', 
    icon: 'fa-credit-card', 
    color: 'from-orange-500 to-pink-500',
    description: 'Secure payment'
  },
  { 
    name: 'Categories', 
    path: '/categories', 
    icon: 'fa-th-large', 
    color: 'from-purple-500 to-pink-500',
    description: 'Shop by category'
  },
  { 
    name: 'Sale', 
    path: '/sale', 
    icon: 'fa-tags', 
    color: 'from-orange-500 to-red-500',
    description: 'Special offers'
  },
  { 
    name: 'New Arrivals', 
    path: '/products?sort=newest', 
    icon: 'fa-sparkles', 
    color: 'from-yellow-500 to-orange-500',
    description: 'Latest products'
  },
  { 
    name: 'About', 
    path: '/about', 
    icon: 'fa-info-circle', 
    color: 'from-indigo-500 to-purple-500',
    description: 'Learn about us'
  },
  { 
    name: 'Contact', 
    path: '/contact', 
    icon: 'fa-envelope', 
    color: 'from-teal-500 to-green-500',
    description: 'Get in touch'
  },
  { 
    name: 'Help', 
    path: '/help', 
    icon: 'fa-question-circle', 
    color: 'from-pink-500 to-rose-500',
    description: 'Need assistance?'
  }
];

const SEARCH_SUGGESTIONS = [
  { term: 'Running shoes', category: 'athletic', icon: 'fa-running' },
  { term: 'Sneakers', category: 'casual', icon: 'fa-shoe-prints' },
  { term: 'Boots', category: 'formal', icon: 'fa-hiking' },
  { term: 'Sandals', category: 'summer', icon: 'fa-umbrella-beach' },
  { term: 'Athletic wear', category: 'sports', icon: 'fa-dumbbell' },
  { term: 'Sale items', category: 'deals', icon: 'fa-percentage' },
  { term: 'Nike', category: 'brand', icon: 'fa-bolt' },
  { term: 'Adidas', category: 'brand', icon: 'fa-star' }
];

const ERROR_TYPES = {
  NOT_FOUND: '404',
  SERVER_ERROR: '500',
  FORBIDDEN: '403',
  NETWORK: 'network'
};

const ROUTE_PREFETCHERS = {
  '/': () => import('./Home'),
  '/products': () => import('./Products'),
  '/sale': () => import('./Products'),
  '/categories': () => import('./Category'),
  '/cart': () => import('./Cart'),
  '/wishlist': () => import('./Wishlist'),
  '/orders': () => import('./Orders'),
  '/profile': () => import('./Profile'),
  '/login': () => import('./Login'),
  '/register': () => import('./Register'),
  '/checkout': () => import('./Checkout'),
  '/search': () => import('./Search'),
};

const prefetchedRoutes = new Set();

const normalizePath = (path = '/') => path.split('?')[0];

const prefetchRoute = (path) => {
  const normalized = normalizePath(path);
  if (!normalized || prefetchedRoutes.has(normalized)) return;

  const loader = ROUTE_PREFETCHERS[normalized];
  if (!loader) return;

  prefetchedRoutes.add(normalized);
  loader().catch(() => {
    prefetchedRoutes.delete(normalized);
  });
};

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Redux state
  const { featuredProducts } = useSelector((state) => state.product);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  // Local state
  const [animateElements, setAnimateElements] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [showCountdown, setShowCountdown] = useState(false);
  const [errorReported, setErrorReported] = useState(false);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  
  // Local storage for user journey tracking
  const [recentPages, setRecentPages] = useLocalStorage('recentPages', []);
  const [visitCount, setVisitCount] = useLocalStorage('404VisitCount', 0);

  // Memoized values
  const currentPath = useMemo(() => location.pathname, [location.pathname]);
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const referrer = useMemo(() => document.referrer, []);
  
  const errorType = useMemo(() => {
    if (currentPath.includes('admin') && !user?.isAdmin) return ERROR_TYPES.FORBIDDEN;
    if (currentPath.includes('api')) return ERROR_TYPES.SERVER_ERROR;
    return ERROR_TYPES.NOT_FOUND;
  }, [currentPath, user]);

  const errorConfig = useMemo(() => {
    switch (errorType) {
      case ERROR_TYPES.FORBIDDEN:
        return {
          title: 'Access Denied',
          subtitle: 'You don\'t have permission to access this page',
          icon: 'fa-lock',
          color: 'from-red-500 to-pink-500'
        };
      case ERROR_TYPES.SERVER_ERROR:
        return {
          title: 'Server Error',
          subtitle: 'Something went wrong on our end',
          icon: 'fa-server',
          color: 'from-orange-500 to-red-500'
        };
      default:
        return {
          title: 'Page Not Found',
          subtitle: 'The page you\'re looking for seems to have stepped out',
          icon: 'fa-shoe-prints',
          color: 'from-blue-500 to-purple-500'
        };
    }
  }, [errorType]);

  useEffect(() => {
    prefetchRoute('/');

    const previousPage = recentPages.find(
      (page) => page?.path && normalizePath(page.path) !== normalizePath(currentPath)
    );

    if (previousPage?.path) {
      prefetchRoute(previousPage.path);
    }
  }, [recentPages, currentPath]);

  // Initialize animations and tracking
  useEffect(() => {
    const timer = setTimeout(() => setAnimateElements(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Track 404 analytics
  useEffect(() => {
    const trackError = async () => {
      // Update visit count
      setVisitCount(prev => prev + 1);
      
      // Track analytics
      trackEvent('404_error', {
        page_location: currentPath,
        referrer: referrer,
        search_query: searchParams.get('q') || '',
        error_type: errorType,
        user_authenticated: isAuthenticated,
        visit_count: visitCount + 1
      });
      
      // Track recent pages for breadcrumb
      const currentPage = {
        path: currentPath,
        timestamp: Date.now(),
        referrer: referrer
      };
      
      setRecentPages(prev => {
        const filtered = prev.filter(page => page.path !== currentPath);
        return [currentPage, ...filtered].slice(0, 10);
      });
    };
    
    trackError();
  }, [currentPath, referrer, searchParams, errorType, isAuthenticated, visitCount, setVisitCount, setRecentPages]);

  // Auto-redirect countdown
  useEffect(() => {
    let timer;
    if (showCountdown && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (showCountdown && countdown === 0) {
      navigate('/', { replace: true });
      toast.info('🏠 Redirected to homepage');
    }
    return () => clearTimeout(timer);
  }, [countdown, showCountdown, navigate]);

  // Fetch featured products for suggestions
  useEffect(() => {
    if (!featuredProducts || featuredProducts.length === 0) {
      dispatch(fetchFeaturedProducts());
    }
  }, [dispatch, featuredProducts]);

  // Enhanced handlers
  const handleReportError = useCallback(async () => {
    if (errorReported) return;
    
    try {
      setErrorReported(true);
      
      // Track error report
      trackEvent('error_reported', {
        page_location: currentPath,
        error_type: errorType,
        user_id: user?._id
      });
      
      // In a real app, you'd send this to your error reporting service
      const errorReport = {
        path: currentPath,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: referrer,
        userId: user?._id,
        errorType: errorType
      };
      
      console.log('Error reported:', errorReport);
      toast.success('🙏 Thank you! Error report has been sent to our team.');
      
    } catch (error) {
      console.error('Failed to report error:', error);
      toast.error('Failed to send error report. Please try again.');
      setErrorReported(false);
    }
  }, [errorReported, currentPath, errorType, user, referrer]);

  const handleSearchSuggestion = useCallback((suggestion) => {
    trackEvent('404_search_suggestion_clicked', {
      search_term: suggestion.term,
      category: suggestion.category
    });
    prefetchRoute('/products');
    
    navigate(`/products?search=${encodeURIComponent(suggestion.term)}`);
  }, [navigate]);

  const handleGoBack = useCallback(() => {
    trackEvent('404_go_back_clicked');
    setShowCountdown(false);
    setCountdown(10);

    const previousPage = recentPages.find(
      (page) => page?.path && normalizePath(page.path) !== normalizePath(currentPath)
    );
    const targetPath = previousPage?.path || '/';

    prefetchRoute(targetPath);

    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(targetPath, { replace: true });
    }
  }, [navigate, recentPages, currentPath]);

  const handleToggleCountdown = useCallback(() => {
    const newShowCountdown = !showCountdown;
    setShowCountdown(newShowCountdown);
    
    if (newShowCountdown) {
      setCountdown(10);
      trackEvent('404_auto_redirect_enabled');
    } else {
      trackEvent('404_auto_redirect_disabled');
    }
  }, [showCountdown]);

  return (
    <>
      <PageMeta
        title="Page Not Found (404) | ShoeMarkNet"
        description="The page you're looking for couldn't be found. Explore our shoe collection and find what you need at ShoeMarkNet."
        robots="noindex, nofollow"
        openGraph={{
          title: 'Page Not Found | ShoeMarkNet',
          description: "The page you're looking for couldn't be found. Explore our shoe collection instead!",
          type: 'website'
        }}
      />

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center relative overflow-hidden">
        
        {/* Enhanced Dynamic Background */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10">
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 animate-shimmer"></div>
        </div>
        
        {/* Enhanced Animated Background Elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-400/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${4 + Math.random() * 6}s`
              }}
            />
          ))}
        </div>

        {/* Enhanced Floating Icons */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute text-blue-200/20 dark:text-blue-800/20 animate-float pointer-events-none"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${1 + Math.random() * 2}rem`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${8 + Math.random() * 8}s`
            }}
          >
            <i className={`fas ${['fa-shoe-prints', 'fa-shopping-bag', 'fa-star', 'fa-heart'][Math.floor(Math.random() * 4)]}`}></i>
          </div>
        ))}

        <div className="container-app relative z-10">
          <div className="text-center">
            
            {/* Enhanced Main 404 Section */}
            <div className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 md:p-12 shadow-2xl mb-8 ${
              animateElements ? 'animate-fade-in-up' : 'opacity-0'
            }`}>
              
              {/* Enhanced 404 Text with Animation */}
              <div className="mb-8">
                <h1 className={`text-8xl md:text-9xl lg:text-[12rem] font-black bg-gradient-to-r ${errorConfig.color} bg-clip-text text-transparent mb-4 leading-none ${
                  animateElements ? 'animate-bounce-in' : 'opacity-0'
                }`} style={{ animationDelay: '0.2s' }}>
                  {errorType === ERROR_TYPES.NOT_FOUND ? (
                    <>4<span className="inline-block animate-spin-slow">0</span>4</>
                  ) : errorType === ERROR_TYPES.FORBIDDEN ? (
                    '403'
                  ) : (
                    '500'
                  )}
                </h1>
                
                {/* Enhanced Icon */}
                <div className={`w-24 h-24 bg-gradient-to-r ${errorConfig.color} rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl ${
                  animateElements ? 'animate-fade-in' : 'opacity-0'
                }`} style={{ animationDelay: '0.4s' }}>
                  <i className={`fas ${errorConfig.icon} text-3xl text-white`}></i>
                </div>
              </div>

              {/* Enhanced Error Message */}
              <div className={`mb-8 ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                  {errorConfig.title}
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto">
                  {errorConfig.subtitle}
                  {currentPath && (
                    <>
                      <br />
                      <span className="text-sm font-mono text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg mt-2 inline-block">
                        {currentPath}
                      </span>
                    </>
                  )}
                </p>
              </div>

              {/* Enhanced Error Details */}
              <div className={`mb-8 ${animateElements ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.8s' }}>
                <button
                  onClick={() => setShowErrorDetails(!showErrorDetails)}
                  className="mb-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors font-medium"
                >
                  <i className={`fas fa-chevron-${showErrorDetails ? 'up' : 'down'} mr-2`}></i>
                  {showErrorDetails ? 'Hide' : 'Show'} Error Details
                </button>
                
                {showErrorDetails && (
                  <div className="bg-red-500/20 backdrop-blur-lg border border-red-300/50 rounded-2xl p-6 mb-6 animate-fade-in">
                    <div className="flex items-start space-x-4 text-red-700 dark:text-red-300">
                      <i className="fas fa-exclamation-triangle text-2xl flex-shrink-0 mt-1"></i>
                      <div className="text-left space-y-3">
                        <div>
                          <h3 className="font-semibold text-lg mb-2">Possible Causes:</h3>
                          <ul className="text-sm space-y-1">
                            <li>• The page URL was mistyped</li>
                            <li>• The page was moved or deleted</li>
                            <li>• The link you followed is outdated</li>
                            {errorType === ERROR_TYPES.FORBIDDEN && <li>• You need proper permissions</li>}
                            {visitCount > 1 && <li>• You've visited this error page {visitCount} times</li>}
                          </ul>
                        </div>
                        
                        {referrer && (
                          <div>
                            <h4 className="font-semibold text-sm mb-1">Referred from:</h4>
                            <p className="text-xs font-mono bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded">
                              {referrer}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Action Buttons */}
              <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 ${
                animateElements ? 'animate-fade-in-up' : 'opacity-0'
              }`} style={{ animationDelay: '1s' }}>
                <Link
                  to="/"
                  onMouseEnter={() => prefetchRoute('/')}
                  onFocus={() => prefetchRoute('/')}
                  className="group bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-2xl relative overflow-hidden"
                  onClick={() => trackEvent('404_home_clicked')}
                >
                  {/* Button shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <i className="fas fa-home mr-3 group-hover:animate-bounce relative z-10"></i>
                  <span className="relative z-10">Back to Home</span>
                  <i className="fas fa-arrow-right ml-3 group-hover:translate-x-1 transition-transform duration-200 relative z-10"></i>
                </Link>
                
                <button
                  onClick={handleGoBack}
                  className="bg-white/20 backdrop-blur-lg border border-white/30 text-gray-900 dark:text-white font-bold py-4 px-8 rounded-2xl hover:bg-white/30 transition-all duration-200"
                >
                  <i className="fas fa-arrow-left mr-3"></i>
                  Go Back
                </button>
                
                <button
                  onClick={handleToggleCountdown}
                  className={`bg-green-500/20 backdrop-blur-lg border border-green-300/50 text-green-700 dark:text-green-300 font-bold py-4 px-8 rounded-2xl hover:bg-green-500/30 transition-all duration-200 ${
                    showCountdown ? 'animate-pulse' : ''
                  }`}
                >
                  <i className="fas fa-clock mr-3"></i>
                  {showCountdown ? `Auto-redirect in ${countdown}s` : 'Auto-redirect Home'}
                </button>
              </div>

              {/* Enhanced Countdown Timer */}
              {showCountdown && (
                <div className="animate-fade-in">
                  <div className="bg-green-500/20 backdrop-blur-lg border border-green-300/50 rounded-2xl p-4 mb-6">
                    <div className="flex items-center justify-center space-x-4 text-green-700 dark:text-green-300">
                      <div className="relative">
                        <div className="w-12 h-12 border-4 border-green-300 border-t-green-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                          {countdown}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">
                          <i className="fas fa-info-circle mr-2"></i>
                          Automatically redirecting to homepage...
                        </p>
                        <button 
                          onClick={() => setShowCountdown(false)}
                          className="text-xs underline hover:text-green-800 dark:hover:text-green-200"
                        >
                          Cancel auto-redirect
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Reporting */}
              <div className="pt-6 border-t border-white/20 dark:border-gray-700/20">
                <button
                  onClick={handleReportError}
                  disabled={errorReported}
                  className={`text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors ${
                    errorReported ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <i className={`fas ${errorReported ? 'fa-check' : 'fa-bug'} mr-2`}></i>
                  {errorReported ? 'Error reported - Thank you!' : 'Report this error to our team'}
                </button>
              </div>
            </div>

            {/* Enhanced Navigation Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              
              {/* Popular Pages */}
              <div className={`lg:col-span-2 bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 shadow-2xl ${
                animateElements ? 'animate-fade-in-up' : 'opacity-0'
              }`} style={{ animationDelay: '1.2s' }}>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  <i className="fas fa-compass mr-3 text-blue-500"></i>
                  Popular Destinations
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {POPULAR_PAGES.map((page, index) => (
                    <Link
                      key={index}
                      to={page.path}
                      onMouseEnter={() => prefetchRoute(page.path)}
                      onFocus={() => prefetchRoute(page.path)}
                      className={`group bg-gradient-to-r ${page.color} text-white p-6 rounded-2xl text-center hover:scale-110 transition-all duration-300 shadow-lg relative overflow-hidden`}
                      onClick={() => trackEvent('404_popular_page_clicked', { page: page.name })}
                    >
                      {/* Hover effect */}
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <i className={`fas ${page.icon} text-3xl mb-3 block group-hover:animate-bounce relative z-10`}></i>
                      <div className="relative z-10">
                        <span className="font-bold block text-lg">{page.name}</span>
                        <span className="text-xs opacity-80 block mt-1">{page.description}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Enhanced Search Suggestions */}
              <div className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 shadow-2xl ${
                animateElements ? 'animate-fade-in-up' : 'opacity-0'
              }`} style={{ animationDelay: '1.4s' }}>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  <i className="fas fa-search mr-3 text-purple-500"></i>
                  Try Searching For
                </h3>
                <div className="space-y-3">
                  {SEARCH_SUGGESTIONS.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearchSuggestion(suggestion)}
                      className="w-full flex items-center space-x-3 p-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-200 group text-left"
                    >
                      <div className={`w-10 h-10 bg-gradient-to-r ${POPULAR_PAGES[index % POPULAR_PAGES.length].color} rounded-full flex items-center justify-center flex-shrink-0`}>
                        <i className={`fas ${suggestion.icon} text-white text-sm`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-medium">
                          {suggestion.term}
                        </span>
                        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {suggestion.category}
                        </div>
                      </div>
                      <i className="fas fa-arrow-right text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0"></i>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Pages Breadcrumb */}
            {recentPages.length > 1 && (
              <div className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-2xl ${
                animateElements ? 'animate-fade-in-up' : 'opacity-0'
              }`} style={{ animationDelay: '1.6s' }}>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  <i className="fas fa-history mr-2 text-orange-500"></i>
                  Your Recent Journey
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  {recentPages.slice(1, 6).map((page, index) => (
                    <React.Fragment key={page.path + page.timestamp}>
                      <button
                        onClick={() => navigate(page.path)}
                        className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/30 transition-colors"
                      >
                        {page.path === '/' ? 'Home' : page.path.split('/').pop() || page.path}
                      </button>
                      {index < Math.min(recentPages.length - 2, 4) && (
                        <i className="fas fa-chevron-right text-gray-400 text-xs"></i>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {/* Featured Products Suggestions */}
            {featuredProducts && featuredProducts.length > 0 && (
              <div className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 shadow-2xl ${
                animateElements ? 'animate-fade-in-up' : 'opacity-0'
              }`} style={{ animationDelay: '1.8s' }}>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  <i className="fas fa-star mr-3 text-yellow-500"></i>
                  You Might Like These Instead
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {featuredProducts.slice(0, 4).map((product) => (
                    <Link
                      key={product._id}
                      to={`/products/${product._id}`}
                      className="group bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 hover:bg-white/20 transition-all duration-200 hover:scale-105"
                      onClick={() => trackEvent('404_featured_product_clicked', { product_id: product._id })}
                    >
                      <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-xl mb-3 overflow-hidden">
                        <img 
                          src={product.images?.[0] || '/product-placeholder.jpg'} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                        {product.name}
                      </h4>
                      <p className="text-blue-600 dark:text-blue-400 font-bold">
                        ${product.price}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Enhanced Help Section */}
            <div className={`bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-white/30 dark:border-gray-600/30 rounded-3xl p-8 shadow-2xl ${
              animateElements ? 'animate-fade-in-up' : 'opacity-0'
            }`} style={{ animationDelay: '2s' }}>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                <i className="fas fa-life-ring mr-3 text-blue-500"></i>
                Need More Help?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                If you're still having trouble finding what you're looking for, our support team is here to help!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/contact"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-2xl transition-colors duration-200"
                >
                  <i className="fas fa-envelope mr-2"></i>
                  Contact Support
                </Link>
                <Link
                  to="/help"
                  className="bg-white/20 backdrop-blur-lg border border-white/30 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-2xl hover:bg-white/30 transition-all duration-200"
                >
                  <i className="fas fa-book mr-2"></i>
                  Help Center
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Custom Styles */}
      </div>
    </>
  );
};

export default NotFound;
