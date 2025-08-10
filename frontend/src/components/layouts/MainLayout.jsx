import React, { useState, useEffect, useCallback, useMemo, useRef, Suspense } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';

// Components
import Header from '../common/Header';
import Footer from '../common/Footer';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorBoundary from '../common/ErrorBoundary';
import CookieConsent from '../common/CookieConsent';
import PWAInstallPrompt from '../common/PWAInstallPrompt';
import NotificationCenter from '../common/NotificationCenter';
import QuickActions from '../common/QuickActions';
import BackgroundEffects from '../common/BackgroundEffects';
import PageTransition from '../common/PageTransition';

// Hooks
import useWebSocket from '../../hooks/useWebSocket';
import useLocalStorage from '../../hooks/useLocalStorage';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';
import usePageVisibility from '../../hooks/usePageVisibility';
import useNetworkStatus from '../../hooks/useNetworkStatus';
import usePerformanceMonitor from '../../hooks/usePerformanceMonitor';

// Utils
import { trackEvent, trackPageView } from '../../utils/analytics';
import { debounce, throttle } from '../../utils/helpers';

// Constants
const ROUTE_CONFIGS = {
  '/': {
    background: 'from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900',
    theme: 'default',
    title: 'ShoeMarkNet - Premium Footwear Online',
    description: 'Discover premium footwear brands and styles'
  },
  '/products': {
    background: 'from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-900/20 dark:via-cyan-900/20 dark:to-teal-900/20',
    theme: 'products',
    title: 'Products - ShoeMarkNet',
    description: 'Browse our extensive collection of premium footwear'
  },
  '/cart': {
    background: 'from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20',
    theme: 'cart',
    title: 'Shopping Cart - ShoeMarkNet',
    description: 'Review your selected items'
  },
  '/wishlist': {
    background: 'from-pink-50 via-rose-50 to-red-50 dark:from-pink-900/20 dark:via-rose-900/20 dark:to-red-900/20',
    theme: 'wishlist',
    title: 'Wishlist - ShoeMarkNet',
    description: 'Your favorite products'
  },
  '/orders': {
    background: 'from-purple-50 via-violet-50 to-indigo-50 dark:from-purple-900/20 dark:via-violet-900/20 dark:to-indigo-900/20',
    theme: 'orders',
    title: 'My Orders - ShoeMarkNet',
    description: 'Track your orders and history'
  },
  '/about': {
    background: 'from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-900/20 dark:via-amber-900/20 dark:to-yellow-900/20',
    theme: 'about',
    title: 'About Us - ShoeMarkNet',
    description: 'Learn about our mission and story'
  },
  '/contact': {
    background: 'from-indigo-50 via-blue-50 to-cyan-50 dark:from-indigo-900/20 dark:via-blue-900/20 dark:to-cyan-900/20',
    theme: 'contact',
    title: 'Contact Us - ShoeMarkNet',
    description: 'Get in touch with our team'
  }
};

const SCROLL_THRESHOLD = 300;
const RESIZE_DEBOUNCE_DELAY = 150;
const PAGE_TRANSITION_DURATION = 400;

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  const { wishlistItems } = useSelector((state) => state.wishlist);

  // Hooks
  const { isOnline, connectionType } = useNetworkStatus();
  const { isVisible } = usePageVisibility();
  const { performanceMetrics } = usePerformanceMonitor();
  const { isConnected } = useWebSocket('/layout');

  // Local state
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [pageTransition, setPageTransition] = useState(false);
  const [showQuickActions, setShowQuickActions] = useLocalStorage('showQuickActions', true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPWAPrompt, setShowPWAPrompt] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState('up');
  const [layoutTheme, setLayoutTheme] = useLocalStorage('layoutTheme', 'auto');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useLocalStorage('fontSize', 'medium');

  // Refs
  const layoutRef = useRef(null);
  const mainContentRef = useRef(null);
  const transitionTimeoutRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  // Memoized route config
  const currentRouteConfig = useMemo(() => {
    const exactMatch = ROUTE_CONFIGS[location.pathname];
    if (exactMatch) return exactMatch;
    
    // Find partial match for dynamic routes
    const matchingPath = Object.keys(ROUTE_CONFIGS).find(path => 
      location.pathname.startsWith(path) && path !== '/'
    );
    
    return matchingPath ? ROUTE_CONFIGS[matchingPath] : ROUTE_CONFIGS['/'];
  }, [location.pathname]);

  // Enhanced keyboard shortcuts
  useKeyboardShortcuts({
    'alt+h': () => navigate('/'),
    'alt+p': () => navigate('/products'),
    'alt+c': () => navigate('/cart'),
    'alt+w': () => navigate('/wishlist'),
    'alt+o': () => navigate('/orders'),
    'ctrl+shift+k': () => setShowQuickActions(!showQuickActions),
    'ctrl+shift+n': () => setShowNotifications(!showNotifications),
    'ctrl+home': scrollToTop,
    'ctrl+end': scrollToBottom,
    'ctrl+plus': () => increaseFontSize(),
    'ctrl+minus': () => decreaseFontSize(),
    'ctrl+0': () => setFontSize('medium'),
    'escape': () => {
      setShowNotifications(false);
      setShowPWAPrompt(false);
    }
  });

  // Enhanced scroll handler with throttling
  const handleScroll = useCallback(
    throttle(() => {
      const currentScrollY = window.pageYOffset;
      
      // Show/hide scroll to top button
      setShowScrollTop(currentScrollY > SCROLL_THRESHOLD);
      
      // Detect scroll direction
      if (Math.abs(currentScrollY - lastScrollY) > 5) {
        setScrollDirection(currentScrollY > lastScrollY ? 'down' : 'up');
        setLastScrollY(currentScrollY);
      }
      
      // Track scroll depth for analytics
      const scrollPercent = Math.min(
        Math.round((currentScrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100),
        100
      );
      
      if (scrollPercent % 25 === 0 && scrollPercent > 0) {
        trackEvent('scroll_depth', {
          page_path: location.pathname,
          scroll_depth: scrollPercent,
          user_authenticated: isAuthenticated
        });
      }
    }, 100),
    [lastScrollY, location.pathname, isAuthenticated]
  );

  // Enhanced resize handler
  const handleResize = useCallback(
    debounce(() => {
      // Trigger responsive adjustments
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      trackEvent('viewport_resize', {
        width,
        height,
        device_type: width < 768 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop'
      });
    }, RESIZE_DEBOUNCE_DELAY),
    []
  );

  // Page transition handler
  useEffect(() => {
    setPageTransition(true);
    setIsLoading(true);
    
    // Clear any existing timeout
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    
    // Track page view
    trackPageView({
      page_path: location.pathname,
      page_title: currentRouteConfig.title,
      user_authenticated: isAuthenticated,
      connection_type: connectionType,
      performance_metrics: performanceMetrics
    });
    
    transitionTimeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      setPageTransition(false);
      
      // Focus management for accessibility
      if (mainContentRef.current) {
        mainContentRef.current.focus();
      }
    }, PAGE_TRANSITION_DURATION);

    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [location.pathname, currentRouteConfig.title, isAuthenticated, connectionType, performanceMetrics]);

  // Enhanced scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [handleScroll, handleResize]);

  // Accessibility preferences detection
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    setHighContrast(contrastQuery.matches);
    
    const handleMotionChange = (e) => setReducedMotion(e.matches);
    const handleContrastChange = (e) => setHighContrast(e.matches);
    
    mediaQuery.addEventListener('change', handleMotionChange);
    contrastQuery.addEventListener('change', handleContrastChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  // PWA install prompt detection
  useEffect(() => {
    let deferredPrompt;
    
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      deferredPrompt = e;
      setShowPWAPrompt(true);
    };
    
    const handleAppInstalled = () => {
      setShowPWAPrompt(false);
      toast.success('App installed successfully!');
      
      trackEvent('pwa_installed', {
        user_authenticated: isAuthenticated
      });
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isAuthenticated]);

  // Enhanced utility functions
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: reducedMotion ? 'auto' : 'smooth'
    });
    
    trackEvent('scroll_to_top_clicked', {
      page_path: location.pathname
    });
  }, [reducedMotion, location.pathname]);

  const scrollToBottom = useCallback(() => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: reducedMotion ? 'auto' : 'smooth'
    });
    
    trackEvent('scroll_to_bottom_clicked', {
      page_path: location.pathname
    });
  }, [reducedMotion, location.pathname]);

  const increaseFontSize = useCallback(() => {
    const sizes = ['small', 'medium', 'large', 'extra-large'];
    const currentIndex = sizes.indexOf(fontSize);
    if (currentIndex < sizes.length - 1) {
      setFontSize(sizes[currentIndex + 1]);
    }
  }, [fontSize, setFontSize]);

  const decreaseFontSize = useCallback(() => {
    const sizes = ['small', 'medium', 'large', 'extra-large'];
    const currentIndex = sizes.indexOf(fontSize);
    if (currentIndex > 0) {
      setFontSize(sizes[currentIndex - 1]);
    }
  }, [fontSize, setFontSize]);

  const handleQuickAction = useCallback((action, destination) => {
    trackEvent('quick_action_clicked', {
      action,
      destination,
      page_path: location.pathname,
      user_authenticated: isAuthenticated
    });
    
    if (destination) {
      navigate(destination);
    }
  }, [location.pathname, isAuthenticated, navigate]);

  // Enhanced error boundary
  const handleError = useCallback((error, errorInfo) => {
    console.error('Layout Error:', error, errorInfo);
    
    trackEvent('layout_error', {
      error_message: error.message,
      error_stack: error.stack,
      component_stack: errorInfo.componentStack,
      page_path: location.pathname,
      user_authenticated: isAuthenticated
    });
    
    toast.error('Something went wrong. Please refresh the page.');
  }, [location.pathname, isAuthenticated]);

  // Font size class mapping
  const fontSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
    'extra-large': 'text-xl'
  };

  return (
    <ErrorBoundary onError={handleError}>
      {/* Enhanced SEO Meta Tags */}
      <Helmet>
        <title>{currentRouteConfig.title}</title>
        <meta name="description" content={currentRouteConfig.description} />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        
        {/* Performance hints */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="preconnect" href="https://api.shoemarknet.com" />
        
        {/* PWA meta tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </Helmet>

      <div 
        ref={layoutRef}
        className={`flex flex-col min-h-screen relative overflow-hidden ${fontSizeClasses[fontSize]} ${
          highContrast ? 'contrast-high' : ''
        } ${reducedMotion ? 'motion-reduced' : ''}`}
        data-theme={layoutTheme}
      >
        
        {/* Enhanced Dynamic Background */}
        <BackgroundEffects
          routeConfig={currentRouteConfig}
          reducedMotion={reducedMotion}
          isVisible={isVisible}
        />

        {/* Enhanced Page Transition */}
        <PageTransition
          isActive={pageTransition}
          duration={PAGE_TRANSITION_DURATION}
          reducedMotion={reducedMotion}
        />

        {/* Network Status Indicator */}
        {!isOnline && (
          <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 z-50 animate-slide-down">
            <i className="fas fa-wifi-slash mr-2"></i>
            You're currently offline. Some features may be limited.
          </div>
        )}

        {/* Enhanced Header */}
        <div className={`relative z-30 transition-transform duration-300 ${
          scrollDirection === 'down' && lastScrollY > 100 ? '-translate-y-full' : 'translate-y-0'
        }`}>
          <Header 
            currentRoute={location.pathname}
            routeConfig={currentRouteConfig}
            isOnline={isOnline}
            connectionType={connectionType}
          />
        </div>

        {/* Loading Progress Bar */}
        {isLoading && (
          <div className="fixed top-0 left-0 w-full h-1 z-50">
            <div className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-loading-bar"></div>
          </div>
        )}

        {/* Main Content Area */}
        <main 
          ref={mainContentRef}
          className={`flex-grow relative z-10 transition-all duration-500 focus:outline-none ${
            isLoading ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
          }`}
          id="main-content"
          tabIndex="-1"
          role="main"
          aria-live="polite"
          aria-label="Main content"
        >
          <Suspense 
            fallback={
              <div className="flex items-center justify-center min-h-96">
                <LoadingSpinner size="large" message="Loading page..." />
              </div>
            }
          >
            <ErrorBoundary 
              fallback={
                <div className="flex items-center justify-center min-h-96 p-8">
                  <div className="text-center">
                    <i className="fas fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Something went wrong
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      We're sorry, but something unexpected happened. Please try refreshing the page.
                    </p>
                    <button
                      onClick={() => window.location.reload()}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-200"
                    >
                      <i className="fas fa-redo mr-2"></i>
                      Refresh Page
                    </button>
                  </div>
                </div>
              }
            >
              <div className="relative">
                <div className="absolute inset-0 backdrop-blur-sm bg-white/5 dark:bg-black/5 pointer-events-none"></div>
                <div className="relative z-10">
                  <Outlet />
                </div>
              </div>
            </ErrorBoundary>
          </Suspense>
        </main>

        {/* Enhanced Footer */}
        <div className="relative z-30">
          <Footer 
            currentRoute={location.pathname}
            isOnline={isOnline}
            performanceMetrics={performanceMetrics}
          />
        </div>

        {/* Quick Actions Panel */}
        {showQuickActions && (
          <QuickActions
            cartCount={cartItems?.length || 0}
            wishlistCount={wishlistItems?.length || 0}
            isAuthenticated={isAuthenticated}
            onAction={handleQuickAction}
            position="bottom-right"
            scrollDirection={scrollDirection}
          />
        )}

        {/* Enhanced Floating Elements */}
        <div className="fixed bottom-8 right-8 z-40 flex flex-col space-y-4">
          
          {/* Scroll to Top Button */}
          {showScrollTop && (
            <button
              onClick={scrollToTop}
              className="w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 shadow-2xl hover:scale-110 transition-all duration-300 animate-fade-in-up group"
              title="Scroll to top (Ctrl+Home)"
              aria-label="Scroll to top"
            >
              <i className="fas fa-chevron-up text-lg group-hover:animate-bounce"></i>
            </button>
          )}

          {/* Accessibility Controls */}
          <div className="flex flex-col space-y-2">
            
            {/* Font Size Controls */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl p-2 flex flex-col space-y-1">
              <button
                onClick={increaseFontSize}
                className="w-10 h-10 rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center text-gray-700 dark:text-gray-300"
                title="Increase font size (Ctrl++)"
                aria-label="Increase font size"
              >
                <i className="fas fa-plus text-sm"></i>
              </button>
              <button
                onClick={decreaseFontSize}
                className="w-10 h-10 rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center text-gray-700 dark:text-gray-300"
                title="Decrease font size (Ctrl+-)"
                aria-label="Decrease font size"
              >
                <i className="fas fa-minus text-sm"></i>
              </button>
            </div>

            {/* Quick Actions Toggle */}
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 shadow-2xl hover:scale-110 transition-all duration-300"
              title="Toggle quick actions"
              aria-label="Toggle quick actions"
            >
              <i className="fas fa-cog"></i>
            </button>
          </div>
        </div>

        {/* Performance & Status Indicators */}
        <div className="fixed top-20 right-4 z-30 space-y-2">
          
          {/* Network Status */}
          <div 
            className={`w-3 h-3 rounded-full ${
              isOnline ? 'bg-green-400' : 'bg-red-400'
            } ${!reducedMotion ? 'animate-pulse' : ''}`}
            title={`Network: ${isOnline ? 'Online' : 'Offline'} ${connectionType ? `(${connectionType})` : ''}`}
          ></div>
          
          {/* WebSocket Status */}
          <div 
            className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-blue-400' : 'bg-yellow-400'
            } ${!reducedMotion ? 'animate-pulse' : ''}`}
            title={`Real-time: ${isConnected ? 'Connected' : 'Disconnected'}`}
          ></div>
          
          {/* Performance Indicator */}
          <div 
            className={`w-3 h-3 rounded-full ${
              performanceMetrics?.score > 80 ? 'bg-green-400' : 
              performanceMetrics?.score > 60 ? 'bg-yellow-400' : 'bg-red-400'
            } ${!reducedMotion ? 'animate-pulse' : ''}`}
            title={`Performance: ${performanceMetrics?.score || 'Unknown'}`}
          ></div>
        </div>

        {/* Notification Center */}
        {showNotifications && (
          <NotificationCenter
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
            isAuthenticated={isAuthenticated}
            user={user}
          />
        )}

        {/* PWA Install Prompt */}
        {showPWAPrompt && (
          <PWAInstallPrompt
            onInstall={() => setShowPWAPrompt(false)}
            onDismiss={() => setShowPWAPrompt(false)}
          />
        )}

        {/* Cookie Consent */}
        <CookieConsent />

        {/* Accessibility Skip Links */}
        <div className="sr-only">
          <a href="#main-content" className="skip-link">Skip to main content</a>
          <a href="#footer" className="skip-link">Skip to footer</a>
        </div>

        {/* Enhanced Custom Styles */}
        <style jsx>{`
          /* Enhanced Animations */
          @keyframes float {
            0%, 100% { 
              transform: translateY(0px) rotate(0deg) scale(1); 
            }
            25% { 
              transform: translateY(-20px) rotate(5deg) scale(1.1); 
            }
            50% { 
              transform: translateY(-10px) rotate(-3deg) scale(0.9); 
            }
            75% { 
              transform: translateY(-15px) rotate(2deg) scale(1.05); 
            }
          }
          
          @keyframes loading-bar {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(0%); }
            100% { transform: translateX(100%); }
          }
          
          @keyframes slide-down {
            from {
              transform: translateY(-100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          
          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes pulse-glow {
            0%, 100% { 
              box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); 
            }
            50% { 
              box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); 
            }
          }
          
          /* Animation Classes */
          .animate-float {
            animation: float 15s ease-in-out infinite;
          }
          
          .animate-loading-bar {
            animation: loading-bar 2s ease-in-out infinite;
          }
          
          .animate-slide-down {
            animation: slide-down 0.5s ease-out;
          }
          
          .animate-fade-in-up {
            animation: fade-in-up 0.5s ease-out;
          }
          
          .animate-pulse-glow {
            animation: pulse-glow 2s ease-in-out infinite;
          }
          
          /* Enhanced Scrollbar */
          ::-webkit-scrollbar {
            width: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899);
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(45deg, #2563eb, #7c3aed, #db2777);
          }
          
          /* Skip Links */
          .skip-link {
            position: absolute;
            top: -40px;
            left: 6px;
            background: #000;
            color: #fff;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 1000;
          }
          
          .skip-link:focus {
            top: 6px;
          }
          
          /* Enhanced Focus States */
          *:focus-visible {
            outline: 2px solid #3b82f6;
            outline-offset: 2px;
            border-radius: 4px;
          }
          
          /* High Contrast Mode */
          .contrast-high {
            filter: contrast(150%);
          }
          
          .contrast-high .bg-white\/10 {
            background: rgba(255, 255, 255, 0.9) !important;
            border: 2px solid #000 !important;
          }
          
          .contrast-high.dark .bg-white\/10 {
            background: rgba(0, 0, 0, 0.9) !important;
            border: 2px solid #fff !important;
          }
          
          /* Reduced Motion */
          .motion-reduced * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            transform: none !important;
          }
          
          /* Font Size Classes */
          .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
          .text-base { font-size: 1rem; line-height: 1.5rem; }
          .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
          .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
          
          /* Enhanced Glass Morphism */
          .glass-morphism {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
          }
          
          @media (prefers-color-scheme: dark) {
            .glass-morphism {
              background: rgba(0, 0, 0, 0.2);
              border: 1px solid rgba(255, 255, 255, 0.1);
            }
          }
          
          /* Smooth Transitions */
          * {
            transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
            transition-duration: 150ms;
          }
          
          /* Print Styles */
          @media print {
            .fixed, .sticky {
              position: static !important;
            }
            
            .no-print, .animate-float {
              display: none !important;
            }
          }
          
          /* Mobile Optimizations */
          @media (max-width: 768px) {
            .fixed.bottom-8.right-8 {
              bottom: 1rem;
              right: 1rem;
            }
            
            .fixed.top-20.right-4 {
              top: 5rem;
              right: 0.5rem;
            }
          }
        `}</style>
      </div>
    </ErrorBoundary>
  );
};

export default MainLayout;
