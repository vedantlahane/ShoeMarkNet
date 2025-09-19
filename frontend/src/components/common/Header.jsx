import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Header = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Redux state
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

  // Simple calculations
  const cartItemCount = cartItems?.length || 0;
  const wishlistCount = wishlistItems?.length || 0;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle theme toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const navigationLinks = [
    { to: '/', label: 'Home', icon: 'fas fa-home' },
    { to: '/products', label: 'Products', icon: 'fas fa-th-large' },
    { to: '/categories', label: 'Categories', icon: 'fas fa-tags' },
    { to: '/sale', label: 'Sale', icon: 'fas fa-percentage' }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      isScrolled
        ? 'glass shadow-2xl border-b border-white/20 dark:border-gray-700/50'
        : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md'
    }`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">

          {/* Enhanced Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:shadow-blue-500/25 transition-all duration-300 micro-bounce">
              <span className="text-white font-bold text-lg">SM</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-2xl font-heading font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                ShoeMarkNet
              </span>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Premium Footwear
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigationLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-4 py-2 rounded-xl font-medium transition-all duration-300 group ${
                  location.pathname === link.to
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                <i className={`${link.icon} mr-2 text-sm`}></i>
                {link.label}
                <span className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 group-hover:w-3/4 ${
                  location.pathname === link.to ? 'w-3/4' : ''
                }`}></span>
              </Link>
            ))}
          </nav>

          {/* Enhanced Actions */}
          <div className="flex items-center space-x-2">

            {/* Search Toggle */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="group p-3 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl micro-bounce"
              title="Search"
            >
              <i className="fas fa-search text-lg group-hover:scale-110 transition-transform duration-300"></i>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="group p-3 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-xl micro-bounce"
              title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
            >
              <i className={`fas text-lg group-hover:scale-110 transition-transform duration-300 ${
                isDarkMode ? 'fa-sun' : 'fa-moon'
              }`}></i>
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="group relative p-3 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all duration-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl micro-bounce"
              title="Wishlist"
            >
              <i className="fas fa-heart text-lg group-hover:scale-110 transition-transform duration-300"></i>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="group relative p-3 text-gray-600 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-all duration-300 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-xl micro-bounce"
              title="Cart"
            >
              <i className="fas fa-shopping-cart text-lg group-hover:scale-110 transition-transform duration-300"></i>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center font-bold shadow-lg animate-bounce">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-medium text-sm shadow-lg group-hover:shadow-xl group-hover:shadow-blue-500/25 transition-all duration-300 micro-bounce">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden lg:block text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {user?.name?.split(' ')[0]}
                  </span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg hover:shadow-blue-500/25 rounded-xl transition-all duration-300 transform hover:scale-105 micro-bounce"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-3 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl micro-bounce"
            >
              <i className={`fas text-lg transition-transform duration-300 ${isMenuOpen ? 'fa-times rotate-180' : 'fa-bars'}`}></i>
            </button>
          </div>
        </div>

        {/* Enhanced Search Bar */}
        <div className={`overflow-hidden transition-all duration-300 ${
          isSearchOpen ? 'max-h-20 opacity-100 mt-4' : 'max-h-0 opacity-0'
        }`}>
          <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for shoes, brands, categories..."
                className="w-full px-4 py-3 pl-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                autoFocus={isSearchOpen}
              />
              <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg hover:shadow-blue-500/25 text-white rounded-xl transition-all duration-300 transform hover:scale-105 font-medium"
            >
              Search
            </button>
          </form>
        </div>

        {/* Enhanced Mobile Navigation */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ${
          isMenuOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
        }`}>
          <nav className="glass rounded-2xl p-4 border border-white/20 dark:border-gray-700/50">
            <div className="flex flex-col space-y-2">
              {navigationLinks.map((link, index) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center space-x-3 p-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                    isMenuOpen ? 'translate-x-0' : 'translate-x-4'
                  } ${
                    location.pathname === link.to
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                  style={{ transitionDelay: `${index * 50}ms` }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className={`${link.icon} text-lg`}></i>
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
