import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';

// Redux actions
import { logout, updateLastActivity } from '../../redux/slices/authSlice';
import { searchProducts, clearSearch } from '../../redux/slices/searchSlice';
import { toggleWishlist } from '../../redux/slices/wishlistSlice';

// Components
import SearchModal from './SearchModal';
import NotificationDropdown from './NotificationDropdown';
import UserProfileDropdown from './UserProfileDropdown';
import NavigationMegaMenu from './NavigationMegaMenu';
import MobileNavigation from './MobileNavigation';
import QuickActionsPanel from './QuickActionsPanel';

// Hooks
import useWebSocket from '../../hooks/useWebSocket';
import useLocalStorage from '../../hooks/useLocalStorage';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';
import useScrollDirection from '../../hooks/useScrollDirection';
import useNetworkStatus from '../../hooks/useNetworkStatus';
import useDebounce from '../../hooks/useDebounce';

// Utils
import { trackEvent } from '../../utils/analytics';
import { validateSearchQuery } from '../../utils/validation';

// Enhanced Icons with animations
const Icons = {
  Logo: ({ className = "" }) => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className={className}>
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <linearGradient id="shoeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <path d="M4 20c0-1.5 1-3 2.5-3h19c1.5 0 2.5 1.5 2.5 3v4c0 1.5-1 3-2.5 3h-19C5 27 4 25.5 4 24v-4z" fill="url(#logoGradient)" filter="url(#glow)" />
      <path d="M6 17c0-2 1-4 3-5l4-2c1.5-.75 3-1 4.5-1h7c1.5 0 2.5 1 2.5 2.5v5.5h-21z" fill="url(#shoeGradient)" />
      <circle cx="9" cy="23" r="1.5" fill="white" opacity="0.8" />
      <circle cx="15" cy="23" r="1.5" fill="white" opacity="0.8" />
      <circle cx="21" cy="23" r="1.5" fill="white" opacity="0.8" />
    </svg>
  ),
  
  Search: ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  ),
  
  Cart: ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <circle cx="9" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  ),
  
  Bell: ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
    </svg>
  ),
  
  Heart: ({ size = 20, className = "", filled = false }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  
  Menu: ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M3 12h18M3 6h18M3 18h18"/>
    </svg>
  ),
  
  Close: ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  ),
  
  Sun: ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  ),
  
  Moon: ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  ),
  
  User: ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  
  ChevronDown: ({ size = 12, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="m6 9 6 6 6-6"/>
    </svg>
  ),
  
  // Navigation Icons
  Home: ({ size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  
  Box: ({ size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
  
  Grid: ({ size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
    </svg>
  )
};

// Enhanced navigation configuration
const NAVIGATION_CONFIG = {
  main: [
    { 
      to: '/', 
      icon: Icons.Home, 
      label: 'Home',
      description: 'Discover the latest trends',
      highlight: false
    },
    { 
      to: '/products', 
      icon: Icons.Box, 
      label: 'Products',
      description: 'Browse our full collection',
      highlight: true,
      megaMenu: true
    },
    { 
      to: '/categories', 
      icon: Icons.Grid, 
      label: 'Categories',
      description: 'Shop by style and type',
      highlight: false
    },
    { 
      to: '/brands', 
      icon: Icons.Box, 
      label: 'Brands',
      description: 'Top designer brands',
      highlight: false
    },
    { 
      to: '/sale', 
      icon: Icons.Heart, 
      label: 'Sale',
      description: 'Up to 70% off',
      highlight: true,
      badge: 'Hot'
    }
  ],
  user: [
    { to: '/profile', icon: Icons.User, label: 'Profile', color: 'text-blue-500' },
    { to: '/orders', icon: Icons.Box, label: 'Orders', color: 'text-green-500' },
    { to: '/wishlist', icon: Icons.Heart, label: 'Wishlist', color: 'text-pink-500' }
  ]
};

const Header = ({ 
  currentRoute, 
  routeConfig, 
  isOnline, 
  connectionType 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const { items: cartItems, totalQuantity } = useSelector((state) => state.cart);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const { user, isAuthenticated, notifications } = useSelector((state) => state.auth);
  const { results: searchResults, loading: searchLoading } = useSelector((state) => state.search);

  // Hooks
  const { isConnected, connectionQuality } = useWebSocket('/header');
  const { isOnline: networkStatus } = useNetworkStatus();
  const scrollDirection = useScrollDirection();

  // Local state with persistence
  const [isDarkMode, setIsDarkMode] = useLocalStorage('theme', false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickActions, setShowQuickActions] = useLocalStorage('headerQuickActions', true);
  const [headerTransparent, setHeaderTransparent] = useState(false);
  const [showMegaMenu, setShowMegaMenu] = useState(null);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Refs
  const headerRef = useRef(null);
  const searchRef = useRef(null);
  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  const megaMenuRef = useRef(null);

  // Debounced search
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Enhanced keyboard shortcuts
  useKeyboardShortcuts({
    'ctrl+k': () => toggleSearch(),
    'ctrl+shift+p': () => toggleProfile(),
    'ctrl+shift+n': () => toggleNotifications(),
    'ctrl+shift+t': () => toggleTheme(),
    'ctrl+shift+m': () => toggleMenu(),
    'escape': () => closeAllDropdowns(),
    'alt+h': () => navigate('/'),
    'alt+p': () => navigate('/products'),
    'alt+c': () => navigate('/cart'),
    'alt+w': () => navigate('/wishlist')
  });

  // Enhanced computed values
  const cartItemCount = useMemo(() => 
    cartItems?.reduce((total, item) => total + (item.quantity || 0), 0) || 0,
    [cartItems]
  );

  const wishlistCount = useMemo(() => wishlistItems?.length || 0, [wishlistItems]);
  
  const unreadNotifications = useMemo(() => 
    notifications?.filter(n => !n.read).length || 0,
    [notifications]
  );

  const isAdmin = useMemo(() => 
    user?.role === 'admin' || user?.role === 'super_admin',
    [user]
  );

  const headerClasses = useMemo(() => {
    const base = "fixed top-0 w-full backdrop-blur-xl border-b z-40 transition-all duration-300";
    const visibility = scrollDirection === 'down' && location.pathname !== '/' 
      ? '-translate-y-full' 
      : 'translate-y-0';
    const theme = headerTransparent 
      ? 'bg-white/10 border-white/20 dark:border-gray-700/20' 
      : 'bg-white/95 dark:bg-gray-900/95 border-gray-200 dark:border-gray-700';
    
    return `${base} ${visibility} ${theme}`;
  }, [scrollDirection, location.pathname, headerTransparent]);

  // Enhanced event handlers
  const toggleTheme = useCallback(() => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    
    trackEvent('theme_toggled', {
      new_theme: newMode ? 'dark' : 'light',
      page: location.pathname
    });
    
    toast.success(`🎨 Switched to ${newMode ? 'dark' : 'light'} mode`);
  }, [isDarkMode, location.pathname, setIsDarkMode]);

  const toggleSearch = useCallback(() => {
    setIsSearchOpen(prev => {
      const newState = !prev;
      if (newState) {
        setTimeout(() => searchRef.current?.focus(), 100);
        trackEvent('search_opened', { page: location.pathname });
      } else {
        setSearchQuery('');
        dispatch(clearSearch());
      }
      return newState;
    });
  }, [location.pathname, dispatch]);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
    trackEvent('mobile_menu_toggled', { 
      action: !isMenuOpen ? 'opened' : 'closed',
      page: location.pathname 
    });
  }, [isMenuOpen, location.pathname]);

  const toggleProfile = useCallback(() => {
    setIsProfileOpen(prev => !prev);
    closeOtherDropdowns('profile');
  }, []);

  const toggleNotifications = useCallback(() => {
    setIsNotificationsOpen(prev => !prev);
    closeOtherDropdowns('notifications');
    
    if (!isNotificationsOpen) {
      trackEvent('notifications_opened', { 
        unread_count: unreadNotifications,
        page: location.pathname 
      });
    }
  }, [isNotificationsOpen, unreadNotifications, location.pathname]);

  const closeOtherDropdowns = useCallback((except = null) => {
    if (except !== 'profile') setIsProfileOpen(false);
    if (except !== 'notifications') setIsNotificationsOpen(false);
    if (except !== 'megamenu') setShowMegaMenu(null);
  }, []);

  const closeAllDropdowns = useCallback(() => {
    setIsProfileOpen(false);
    setIsNotificationsOpen(false);
    setIsSearchOpen(false);
    setIsMenuOpen(false);
    setShowMegaMenu(null);
  }, []);

  // Enhanced search handler
  const handleSearch = useCallback(async (query) => {
    if (!query.trim() || !validateSearchQuery(query)) return;
    
    try {
      await dispatch(searchProducts({ 
        query: query.trim(),
        filters: {},
        page: 1,
        limit: 10 
      })).unwrap();
      
      trackEvent('search_performed', {
        query: query.trim(),
        page: location.pathname,
        user_authenticated: isAuthenticated
      });
      
    } catch (error) {
      toast.error('Search failed. Please try again.');
    }
  }, [dispatch, location.pathname, isAuthenticated]);

  // Enhanced logout handler
  const handleLogout = useCallback(async () => {
    try {
      await dispatch(logout()).unwrap();
      
      toast.success('👋 Successfully logged out');
      
      trackEvent('user_logged_out', {
        page: location.pathname,
        session_duration: Date.now() - lastActivity
      });
      
      navigate('/');
      closeAllDropdowns();
      
    } catch (error) {
      toast.error('Logout failed. Please try again.');
    }
  }, [dispatch, navigate, location.pathname, lastActivity, closeAllDropdowns]);

  // Initialize component
  useEffect(() => {
    // Apply saved theme
    document.documentElement.classList.toggle('dark', isDarkMode);
    
    // Track header view
    trackEvent('header_viewed', {
      page: location.pathname,
      is_authenticated: isAuthenticated,
      theme: isDarkMode ? 'dark' : 'light'
    });
    
    // Update last activity
    setLastActivity(Date.now());
    dispatch(updateLastActivity());
  }, [location.pathname, isAuthenticated, isDarkMode, dispatch]);

  // Handle search query changes
  useEffect(() => {
    if (debouncedSearchQuery) {
      handleSearch(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery, handleSearch]);

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target)) {
        setShowMegaMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle route transparency
  useEffect(() => {
    const transparentRoutes = ['/', '/home'];
    setHeaderTransparent(transparentRoutes.includes(location.pathname));
  }, [location.pathname]);

  return (
    <>
      {/* Enhanced SEO */}
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//api.shoemarknet.com" />
      </Helmet>

      {/* Main Header */}
      <header 
        ref={headerRef}
        className={headerClasses}
        role="banner"
        aria-label="Main navigation"
      >
        
        {/* Connection Status Bar */}
        {!networkStatus && (
          <div className="bg-red-500 text-white text-center py-1 text-xs animate-pulse">
            <i className="fas fa-wifi-slash mr-2"></i>
            You're offline. Some features may be limited.
          </div>
        )}

        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            
            {/* Enhanced Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-3 group"
              onClick={() => trackEvent('logo_clicked', { page: location.pathname })}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition-all duration-500" />
                <div className="relative bg-white dark:bg-gray-800 rounded-xl p-2 shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <Icons.Logo className="transition-transform duration-500 group-hover:scale-110" />
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
                  ShoeMarkNet
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Premium Footwear
                </p>
              </div>
            </Link>

            {/* Enhanced Desktop Navigation */}
            <nav 
              className="hidden lg:flex items-center space-x-1" 
              role="navigation"
              aria-label="Main menu"
            >
              {NAVIGATION_CONFIG.main.map((item, index) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                
                return (
                  <div key={index} className="relative group">
                    <Link
                      to={item.to}
                      className={`nav-link flex items-center space-x-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 ${
                        isActive 
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' 
                          : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/50 dark:hover:bg-gray-800/50'
                      }`}
                      onMouseEnter={() => item.megaMenu && setShowMegaMenu(item.label)}
                      onMouseLeave={() => item.megaMenu && setShowMegaMenu(null)}
                      onClick={() => trackEvent('nav_clicked', { 
                        link: item.label, 
                        page: location.pathname 
                      })}
                    >
                      <Icon size={16} />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full font-bold animate-pulse">
                          {item.badge}
                        </span>
                      )}
                      {item.highlight && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                      )}
                    </Link>

                    {/* Mega Menu */}
                    {item.megaMenu && showMegaMenu === item.label && (
                      <NavigationMegaMenu
                        ref={megaMenuRef}
                        category={item.label}
                        onClose={() => setShowMegaMenu(null)}
                      />
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Enhanced Actions */}
            <div className="flex items-center space-x-2">
              
              {/* Enhanced Search */}
              <button
                onClick={toggleSearch}
                className="action-button group relative"
                aria-label="Search products (Ctrl+K)"
                title="Search products (Ctrl+K)"
              >
                <Icons.Search size={18} className="group-hover:scale-110 transition-transform duration-200" />
                <span className="sr-only">Search</span>
              </button>

              {/* Enhanced Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="action-button group relative"
                aria-label="Toggle theme (Ctrl+Shift+T)"
                title="Toggle theme (Ctrl+Shift+T)"
              >
                <div className="relative">
                  {isDarkMode ? (
                    <Icons.Sun size={18} className="group-hover:rotate-180 transition-all duration-500" />
                  ) : (
                    <Icons.Moon size={18} className="group-hover:-rotate-12 transition-all duration-300" />
                  )}
                </div>
              </button>

              {/* Enhanced Wishlist */}
              <Link
                to="/wishlist"
                className="action-button group relative"
                aria-label={`Wishlist (${wishlistCount} items)`}
                title={`Wishlist (${wishlistCount} items)`}
                onClick={() => trackEvent('wishlist_clicked', { 
                  count: wishlistCount, 
                  page: location.pathname 
                })}
              >
                <Icons.Heart 
                  size={18} 
                  className="group-hover:scale-110 transition-all duration-200"
                  filled={wishlistCount > 0}
                />
                {wishlistCount > 0 && (
                  <span className="notification-badge bg-gradient-to-r from-pink-500 to-red-500">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Enhanced Cart */}
              <Link
                to="/cart"
                className="action-button group relative"
                aria-label={`Shopping cart (${cartItemCount} items)`}
                title={`Shopping cart (${cartItemCount} items)`}
                onClick={() => trackEvent('cart_clicked', { 
                  count: cartItemCount, 
                  page: location.pathname 
                })}
              >
                <Icons.Cart size={18} className="group-hover:scale-110 transition-all duration-200" />
                {cartItemCount > 0 && (
                  <span className="notification-badge bg-gradient-to-r from-blue-500 to-purple-500 animate-bounce">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </Link>

              {/* Enhanced Notifications (Authenticated Users) */}
              {isAuthenticated && (
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={toggleNotifications}
                    className="action-button group relative"
                    aria-label={`Notifications (${unreadNotifications} unread)`}
                    title={`Notifications (${unreadNotifications} unread)`}
                  >
                    <Icons.Bell size={18} className="group-hover:animate-swing transition-all duration-200" />
                    {unreadNotifications > 0 && (
                      <span className="notification-badge bg-gradient-to-r from-red-500 to-pink-500 animate-pulse">
                        {unreadNotifications > 99 ? '99+' : unreadNotifications}
                      </span>
                    )}
                  </button>

                  <NotificationDropdown
                    isOpen={isNotificationsOpen}
                    notifications={notifications}
                    onClose={() => setIsNotificationsOpen(false)}
                  />
                </div>
              )}

              {/* Enhanced User Menu */}
              {isAuthenticated ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={toggleProfile}
                    className="flex items-center space-x-2 p-1.5 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 hover:bg-white/20 transition-all duration-200 hover:scale-105 group"
                    aria-label="User menu"
                  >
                    <div className="relative">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm ring-2 ring-white/20">
                        {user?.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={user.name} 
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          user?.name?.charAt(0)?.toUpperCase() || 'U'
                        )}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                        isConnected ? 'bg-green-400' : 'bg-red-400'
                      }`}></div>
                    </div>
                    <span className="hidden md:block font-medium text-sm text-gray-900 dark:text-white max-w-24 truncate">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <Icons.ChevronDown className={`transition-transform duration-200 ${
                      isProfileOpen ? 'rotate-180' : ''
                    }`} />
                  </button>

                  <UserProfileDropdown
                    isOpen={isProfileOpen}
                    user={user}
                    isAdmin={isAdmin}
                    onClose={() => setIsProfileOpen(false)}
                    onLogout={handleLogout}
                  />
                </div>
              ) : (
                /* Enhanced Auth Buttons */
                <div className="flex items-center space-x-2">
                  <Link to="/login">
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-xl hover:bg-white/20 transition-all duration-200 hover:scale-105">
                      Login
                    </button>
                  </Link>
                  <Link to="/register">
                    <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg">
                      Register
                    </button>
                  </Link>
                </div>
              )}

              {/* Enhanced Mobile Menu Toggle */}
              <button
                onClick={toggleMenu}
                className="lg:hidden action-button group"
                aria-label="Toggle mobile menu"
                aria-expanded={isMenuOpen}
              >
                <div className="relative w-5 h-5">
                  <span className={`menu-line top-0 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                  <span className={`menu-line top-2 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                  <span className={`menu-line top-4 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                </div>
              </button>
            </div>
          </div>

          {/* Enhanced Mobile Navigation */}
          <MobileNavigation
            isOpen={isMenuOpen}
            navigationLinks={NAVIGATION_CONFIG.main}
            userLinks={NAVIGATION_CONFIG.user}
            cartItemCount={cartItemCount}
            wishlistCount={wishlistCount}
            user={user}
            isAuthenticated={isAuthenticated}
            isAdmin={isAdmin}
            onClose={() => setIsMenuOpen(false)}
            onLogout={handleLogout}
          />
        </div>

        {/* Enhanced Progress Bar */}
        {searchLoading && (
          <div className="absolute bottom-0 left-0 w-full h-0.5">
            <div className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-progress-bar"></div>
          </div>
        )}
      </header>

      {/* Enhanced Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        searchQuery={searchQuery}
        searchResults={searchResults}
        loading={searchLoading}
        onQueryChange={setSearchQuery}
        onClose={toggleSearch}
        onSearch={handleSearch}
        ref={searchRef}
      />

      {/* Quick Actions Panel */}
      {showQuickActions && (
        <QuickActionsPanel
          cartCount={cartItemCount}
          wishlistCount={wishlistCount}
          notificationCount={unreadNotifications}
          isAuthenticated={isAuthenticated}
          onToggle={() => setShowQuickActions(!showQuickActions)}
        />
      )}

      {/* Enhanced Custom Styles */}
      <style jsx>{`
        /* Action Button Base Styles */
        .action-button {
          @apply p-2.5 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/20 transition-all duration-200 hover:scale-105 relative;
        }
        
        /* Notification Badge */
        .notification-badge {
          @apply absolute -top-1 -right-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold;
          font-size: 10px;
          min-width: 20px;
        }
        
        /* Navigation Link Hover Effects */
        .nav-link {
          position: relative;
          overflow: hidden;
        }
        
        .nav-link::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          transition: left 0.5s;
        }
        
        .nav-link:hover::before {
          left: 100%;
        }
        
        /* Mobile Menu Lines */
        .menu-line {
          @apply absolute w-5 h-0.5 bg-current transition-all duration-300 origin-center;
        }
        
        /* Enhanced Animations */
        @keyframes swing {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(15deg); }
          75% { transform: rotate(-15deg); }
        }
        
        @keyframes progress-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
        }
        
        .animate-swing {
          animation: swing 0.6s ease-in-out;
        }
        
        .animate-progress-bar {
          animation: progress-bar 2s ease-in-out infinite;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        /* Glass Morphism Effects */
        .glass {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .dark .glass {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        /* Enhanced Scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899);
          border-radius: 3px;
        }
        
        /* Accessibility Improvements */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
        
        /* High Contrast Mode */
        @media (prefers-contrast: high) {
          .action-button {
            border: 2px solid currentColor;
          }
          
          .notification-badge {
            border: 2px solid white;
          }
        }
        
        /* Print Styles */
        @media print {
          header {
            position: static !important;
            background: white !important;
            color: black !important;
          }
          
          .animate-pulse,
          .animate-bounce,
          .animate-spin {
            animation: none;
          }
        }
        
        /* Mobile Optimizations */
        @media (max-width: 768px) {
          .action-button {
            @apply p-2;
          }
          
          .notification-badge {
            width: 18px;
            height: 18px;
            font-size: 9px;
          }
        }
      `}</style>
    </>
  );
};

export default Header;
