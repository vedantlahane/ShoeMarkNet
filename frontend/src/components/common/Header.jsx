import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { gsap } from 'gsap';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  User, 
  Menu, 
  X, 
  Sun, 
  Moon,
  ChevronDown,
  Home,
  Grid3X3,
  Tag,
  Percent,
  LogOut
} from 'lucide-react';

const routePrefetchers = {
  '/': () => import('../../pages/Home'),
  '/products': () => import('../../pages/Products'),
  '/categories': () => import('../../pages/Category'),
  '/sale': () => import('../../pages/Products'),
  '/cart': () => import('../../pages/Cart'),
  '/wishlist': () => import('../../pages/Wishlist'),
  '/search': () => import('../../pages/Search'),
  '/profile': () => import('../../pages/Profile'),
  '/orders': () => import('../../pages/Orders'),
  '/login': () => import('../../pages/Login'),
  '/register': () => import('../../pages/Register'),
  '/logout': () => import('../../pages/Logout')
};

const prefetchedRoutes = new Set();

const normalizePath = (path = '/') => path.split('?')[0];

const prefetchRoute = (path) => {
  if (typeof window === 'undefined') return;

  const normalized = normalizePath(path);
  if (!normalized || prefetchedRoutes.has(normalized)) return;

  const loader = routePrefetchers[normalized];
  if (!loader) return;

  prefetchedRoutes.add(normalized);
  loader().catch(() => {
    prefetchedRoutes.delete(normalized);
  });
};

// Custom hooks for accessibility
const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event) => {
      setPrefersReducedMotion(event.matches);
    };

    try {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } catch (error) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return prefersReducedMotion;
};

const useFocusTrap = (isOpen, containerRef) => {
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        // Close menu on escape
        return;
      }
      
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable?.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable?.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstFocusable?.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, containerRef]);
};

const getInitialTheme = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  const storedTheme = localStorage.getItem('theme');
  if (storedTheme) {
    return storedTheme === 'dark';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const headerRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const userMenuRef = useRef(null);
  const searchInputRef = useRef(null);
  const gsapContextRef = useRef(null);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(getInitialTheme);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const prefersReducedMotion = useReducedMotion();
  
  // Redux state
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

  // Focus trap hooks
  useFocusTrap(isMenuOpen, mobileMenuRef);
  useFocusTrap(isUserMenuOpen, userMenuRef);

  // Calculations
  const cartItemCount = cartItems?.length || 0;
  const wishlistCount = wishlistItems?.length || 0;

  // Navigation links with icons
  const navigationLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/products', label: 'Products', icon: Grid3X3 },
    { to: '/categories', label: 'Categories', icon: Tag },
    { to: '/sale', label: 'Sale', icon: Percent, badge: 'Hot' }
  ];

  const iconButtonClasses =
    'relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-transparent bg-white/70 text-gray-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-600 focus-visible:outline focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-gray-800/70 dark:text-gray-300 dark:hover:text-blue-300 dark:border-gray-700/70';

  const counterBadgeClasses =
    'absolute -top-1.5 -right-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-1 text-[0.65rem] font-semibold text-white shadow-sm';

  const getNavLinkClasses = (isActive) =>
    `relative inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline focus-visible:ring-2 focus-visible:ring-blue-500 ${
      isActive
        ? 'bg-blue-50 text-blue-600 shadow-sm dark:bg-blue-500/15 dark:text-blue-200'
        : 'text-gray-600 hover:bg-white hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800/60 dark:hover:text-blue-200'
    }`;

  // Handle scroll effect with throttling
  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    let timeoutId;

    const handleScroll = () => {
      if (timeoutId) clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        const scrollTop = window.scrollY;
        setIsScrolled(scrollTop > 20);
      }, 16); // ~60fps
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Handle theme toggle
  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Optimized GSAP Animations with proper cleanup
  useLayoutEffect(() => {
    if (prefersReducedMotion || typeof window === 'undefined') return;

    gsapContextRef.current = gsap.context(() => {
      gsap.fromTo(headerRef.current, 
        { y: -50, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
      );
    }, headerRef);

    return () => {
      if (gsapContextRef.current) {
        gsapContextRef.current.revert();
      }
    };
  }, [prefersReducedMotion]);

  // Close menus on escape key
  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        setIsUserMenuOpen(false);
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const createPrefetchProps = (path) => ({
    onMouseEnter: () => prefetchRoute(path),
    onFocus: () => prefetchRoute(path),
    onTouchStart: () => prefetchRoute(path)
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      prefetchRoute('/search');
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleMobileMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleUserMenuToggle = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-md"
      >
        Skip to main content
      </a>

      <header 
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl transition-all duration-300 ${
          isScrolled
            ? 'border-b border-gray-200/70 bg-white/90 shadow-lg dark:border-gray-800 dark:bg-gray-950/85'
            : 'border-b border-transparent bg-white/75 dark:bg-gray-950/60'
        }`}
        role="banner"
      >
  <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-5 lg:px-6">
    <div className="flex flex-wrap items-center justify-between gap-3 md:gap-6 py-3 lg:py-4">
            
            {/* Logo */}
            <div className="flex items-center">
              <Link 
                to="/" 
                {...createPrefetchProps('/')}
                className="flex items-center space-x-3 group focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1"
                aria-label="ShoeMarkNet Home"
              >
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105">
                  <span className="text-white font-bold text-xl lg:text-2xl">S</span>
                </div>
                <span className="hidden sm:block text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ShoeMarkNet
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1" role="navigation" aria-label="Main navigation">
              {navigationLinks.map((link) => {
                const IconComponent = link.icon;
                const isActive = location.pathname === link.to;
                
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    {...createPrefetchProps(link.to)}
                    className={`relative px-4 py-2 rounded-xl transition-all duration-200 flex items-center space-x-2 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 group ${
                      isActive 
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/10 hover:text-blue-600 dark:hover:text-blue-400'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <IconComponent size={18} aria-hidden="true" />
                    <span className="font-medium">{link.label}</span>
                    {link.badge && (
                      <span 
                        className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 px-2 py-0.5 text-xs font-bold text-white rounded-full"
                        aria-label={`${link.label} has ${link.badge} items`}
                      >
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Search, Actions & User Menu */}
            <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:gap-3 md:w-auto">
              
              {/* Search Toggle */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 rounded-xl bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 group"
                aria-label={isSearchOpen ? "Close search" : "Open search"}
                aria-expanded={isSearchOpen}
              >
                <Search size={20} className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200" aria-hidden="true" />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 group"
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDarkMode ? (
                  <Sun size={20} className="text-yellow-500 group-hover:text-yellow-400 transition-colors duration-200" aria-hidden="true" />
                ) : (
                  <Moon size={20} className="text-blue-600 group-hover:text-blue-500 transition-colors duration-200" aria-hidden="true" />
                )}
              </button>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                {...createPrefetchProps('/wishlist')}
                className="relative p-2 rounded-xl bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 group"
                aria-label={`Wishlist with ${wishlistCount} items`}
              >
                <Heart size={20} className="text-gray-700 dark:text-gray-300 group-hover:text-red-500 transition-colors duration-200" aria-hidden="true" />
                {wishlistCount > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                    aria-hidden="true"
                  >
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Shopping Cart */}
              <Link
                to="/cart"
                {...createPrefetchProps('/cart')}
                className="relative p-2 rounded-xl bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 group"
                aria-label={`Shopping cart with ${cartItemCount} items`}
              >
                <ShoppingBag size={20} className="text-gray-700 dark:text-gray-300 group-hover:text-green-500 transition-colors duration-200" aria-hidden="true" />
                {cartItemCount > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                    aria-hidden="true"
                  >
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                {isAuthenticated ? (
                  <button
                    onClick={handleUserMenuToggle}
                    className="flex items-center space-x-2 p-2 rounded-xl bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 group"
                    aria-label="User menu"
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <User size={20} className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200" aria-hidden="true" />
                    )}
                    <ChevronDown 
                      size={14} 
                      className={`text-gray-500 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}
                      aria-hidden="true"
                    />
                  </button>
                ) : (
                  <div className="flex items-center gap-2 max-[420px]:w-full max-[420px]:flex-col max-[420px]:items-stretch">
                    <Link
                      to="/login"
                      {...createPrefetchProps('/login')}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 max-[420px]:w-full text-center"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      {...createPrefetchProps('/register')}
                      className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 max-[420px]:w-full text-center"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}

                {/* User Dropdown */}
                {isAuthenticated && isUserMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                    role="menu"
                    aria-labelledby="user-menu-button"
                  >
                    <div className="py-2">
                      <Link
                        to="/profile"
                        {...createPrefetchProps('/profile')}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
                        onClick={() => setIsUserMenuOpen(false)}
                        role="menuitem"
                      >
                        <User size={16} className="mr-3" aria-hidden="true" />
                        Profile
                      </Link>
                      <Link
                        to="/orders"
                        {...createPrefetchProps('/orders')}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
                        onClick={() => setIsUserMenuOpen(false)}
                        role="menuitem"
                      >
                        <ShoppingBag size={16} className="mr-3" aria-hidden="true" />
                        Orders
                      </Link>
                      <hr className="my-2 border-gray-200 dark:border-gray-700" />
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setIsMenuOpen(false);
                          prefetchRoute('/logout');
                          navigate('/logout');
                        }}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 focus:outline-none focus:bg-red-50 dark:focus:bg-red-900/20"
                        role="menuitem"
                      >
                        <LogOut size={16} className="mr-3" aria-hidden="true" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 rounded-xl bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={isMenuOpen ? "Close mobile menu" : "Open mobile menu"}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMenuOpen ? (
                  <X size={20} className="text-gray-700 dark:text-gray-300" aria-hidden="true" />
                ) : (
                  <Menu size={20} className="text-gray-700 dark:text-gray-300" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {isSearchOpen && (
            <div className="py-4">
              <form onSubmit={handleSearch} className="relative" role="search">
                <label htmlFor="search-input" className="sr-only">Search for shoes, brands, styles</label>
                <input
                  ref={searchInputRef}
                  id="search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for shoes, brands, styles..."
                  className="w-full pl-12 pr-20 py-3 bg-white/50 dark:bg-gray-800/50 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 backdrop-blur-lg border border-gray-200 dark:border-gray-700"
                />
                <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" aria-hidden="true" />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm px-4 py-1.5 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Search
                </button>
              </form>
            </div>
          )}

          {/* Mobile Navigation Menu */}
          {isMenuOpen && (
            <div 
              ref={mobileMenuRef}
              className="lg:hidden py-4"
              id="mobile-menu"
              role="navigation"
              aria-label="Mobile navigation"
            >
              <nav className="flex flex-col space-y-2">
                {navigationLinks.map((link) => {
                  const IconComponent = link.icon;
                  const isActive = location.pathname === link.to;
                  
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      {...createPrefetchProps(link.to)}
                      onClick={() => setIsMenuOpen(false)}
                      className={`relative flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isActive 
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 hover:text-blue-600 dark:hover:text-blue-400'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <IconComponent size={20} aria-hidden="true" />
                      <span className="font-medium">{link.label}</span>
                      {link.badge && (
                        <span 
                          className="bg-gradient-to-r from-red-500 to-pink-500 px-2 py-0.5 text-xs font-bold text-white rounded-full"
                          aria-label={`${link.label} has ${link.badge} items`}
                        >
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        {/* Mobile menu backdrop */}
        {isMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm lg:hidden -z-10"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />
        )}
      </header>
    </>
  );
};

export default Header;
