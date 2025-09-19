import React, { useState, useEffect, useRef } from 'react';
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

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const headerRef = useRef(null);
  const logoRef = useRef(null);
  const cartBadgeRef = useRef(null);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
           (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Redux state
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

  // Calculations
  const cartItemCount = cartItems?.length || 0;
  const wishlistCount = wishlistItems?.length || 0;

  // Navigation links with icons
  const navigationLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/products', label: 'Products', icon: Grid3X3 },
    { to: '/categories', label: 'Categories', icon: Tag },
    { to: '/sale', label: 'Sale', icon: Percent, badge: 'Hot' },
    ...(process.env.NODE_ENV === 'development' ? [{ to: '/toast-demo', label: 'Toast Demo', icon: ChevronDown }] : [])
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 20);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle theme toggle with GSAP animation
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // GSAP Animations
  useEffect(() => {
    // Header entrance animation
    gsap.fromTo(headerRef.current, 
      { y: -100, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.2 }
    );

    // Logo animation
    gsap.fromTo(logoRef.current,
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1, ease: "bounce.out", delay: 0.5 }
    );
  }, []);

  // Cart badge animation
  useEffect(() => {
    if (cartBadgeRef.current && cartItemCount > 0) {
      gsap.fromTo(cartBadgeRef.current,
        { scale: 0, rotate: -180 },
        { scale: 1, rotate: 0, duration: 0.5, ease: "bounce.out" }
      );
    }
  }, [cartItemCount]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    
    // Theme toggle animation
    gsap.to(document.body, {
      duration: 0.3,
      ease: "power2.inOut"
    });
  };

  const toggleMobileMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleUserMenuToggle = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  return (
    <header 
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'glass-header shadow-glass backdrop-blur-2xl' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div 
                ref={logoRef}
                className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow group-hover:shadow-neon transition-all duration-300 transform group-hover:scale-110"
              >
                <span className="text-white font-bold text-xl lg:text-2xl font-heading">S</span>
              </div>
              <span className="hidden sm:block text-xl lg:text-2xl font-bold gradient-text font-heading">
                ShoeMarkNet
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigationLinks.map((link) => {
              const IconComponent = link.icon;
              const isActive = location.pathname === link.to;
              
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative px-4 py-2 rounded-xl transition-all duration-300 flex items-center space-x-2 hover-scale group ${
                    isActive 
                      ? 'glass text-white' 
                      : 'text-gray-700 dark:text-gray-300 hover:glass hover:text-white'
                  }`}
                >
                  <IconComponent size={18} />
                  <span className="font-medium">{link.label}</span>
                  {link.badge && (
                    <span className="absolute -top-1 -right-1 bg-gradient-secondary px-2 py-0.5 text-xs font-bold text-white rounded-full animate-pulse-glow">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Search, Actions & User Menu */}
          <div className="flex items-center space-x-3">
            
            {/* Search Toggle */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 rounded-xl glass hover:glass transition-all duration-300 hover-scale group"
              aria-label="Search"
            >
              <Search size={20} className="text-gray-700 dark:text-gray-300 group-hover:text-white transition-colors duration-300" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl glass hover:glass transition-all duration-300 hover-scale group relative overflow-hidden"
              aria-label="Toggle theme"
            >
              <div className="relative z-10">
                {isDarkMode ? (
                  <Sun size={20} className="text-yellow-400 group-hover:text-white transition-colors duration-300" />
                ) : (
                  <Moon size={20} className="text-blue-600 group-hover:text-white transition-colors duration-300" />
                )}
              </div>
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2 rounded-xl glass hover:glass transition-all duration-300 hover-scale group"
              aria-label="Wishlist"
            >
              <Heart size={20} className="text-gray-700 dark:text-gray-300 group-hover:text-red-400 transition-colors duration-300" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-secondary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce-in">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Cart */}
            <Link
              to="/cart"
              className="relative p-2 rounded-xl glass hover:glass transition-all duration-300 hover-scale group"
              aria-label="Shopping cart"
            >
              <ShoppingBag size={20} className="text-gray-700 dark:text-gray-300 group-hover:text-green-400 transition-colors duration-300" />
              {cartItemCount > 0 && (
                <span 
                  ref={cartBadgeRef}
                  className="absolute -top-1 -right-1 bg-gradient-accent text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse-glow"
                >
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className="relative">
              {isAuthenticated ? (
                <button
                  onClick={handleUserMenuToggle}
                  className="flex items-center space-x-2 p-2 rounded-xl glass hover:glass transition-all duration-300 hover-scale group"
                  aria-label="User menu"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <User size={20} className="text-gray-700 dark:text-gray-300 group-hover:text-blue-400 transition-colors duration-300" />
                  )}
                  <ChevronDown 
                    size={14} 
                    className={`text-gray-500 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} 
                  />
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="btn-glass text-sm font-medium hover:text-white"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="btn-premium text-sm font-medium"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* User Dropdown */}
              {isAuthenticated && isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 glass rounded-2xl shadow-glass border border-glass-border overflow-hidden animate-slide-up">
                  <div className="py-2">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/10 transition-colors duration-200"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User size={16} className="mr-3" />
                      Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/10 transition-colors duration-200"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <ShoppingBag size={16} className="mr-3" />
                      Orders
                    </Link>
                    <hr className="my-2 border-glass-border" />
                    <button
                      onClick={() => {
                        // Handle logout
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors duration-200"
                    >
                      <LogOut size={16} className="mr-3" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-xl glass hover:glass transition-all duration-300 hover-scale"
              aria-label="Toggle mobile menu"
            >
              {isMenuOpen ? (
                <X size={20} className="text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu size={20} className="text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="py-4 animate-slide-up">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for shoes, brands, styles..."
                className="w-full pl-12 pr-4 py-3 glass rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                autoFocus
              />
              <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-premium text-sm px-4 py-1.5"
              >
                Search
              </button>
            </form>
          </div>
        )}

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 animate-slide-up">
            <nav className="flex flex-col space-y-2">
              {navigationLinks.map((link) => {
                const IconComponent = link.icon;
                const isActive = location.pathname === link.to;
                
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMenuOpen(false)}
                    className={`relative flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive 
                        ? 'glass text-white' 
                        : 'text-gray-700 dark:text-gray-300 hover:glass hover:text-white'
                    }`}
                  >
                    <IconComponent size={20} />
                    <span className="font-medium">{link.label}</span>
                    {link.badge && (
                      <span className="bg-gradient-secondary px-2 py-0.5 text-xs font-bold text-white rounded-full">
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
    </header>
  );
};

export default Header;
