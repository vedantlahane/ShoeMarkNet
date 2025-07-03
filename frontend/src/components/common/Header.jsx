// src/components/common/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const dropdownRef = useRef(null);
  const { items } = useSelector((state) => state.cart);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDarkMode ? 'light' : 'dark');
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const isAdmin = user?.role === 'admin';
  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  // Vector/SVG Icons
  const LogoIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" className="text-white">
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>
      <path d="M16 2L28 8v16L16 30 4 24V8z" fill="url(#logoGradient)" />
      <text x="16" y="20" textAnchor="middle" className="text-white font-bold text-sm">S</text>
    </svg>
  );

  const SearchIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  );

  const CartIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="m1 1 4 4 0 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9H7"/>
      <path d="M13 1 8 6"/>
    </svg>
  );

  return (
    <>
      {/* Compact Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/20 z-40 transition-all duration-300">
        <div className="container mx-auto px-3 py-2">
          <div className="flex items-center justify-between h-12">
            
            {/* Compact Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <LogoIcon />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hidden sm:block group-hover:scale-105 transition-transform duration-200">
                ShoeMarkNet
              </span>
            </Link>

            {/* Compact Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {[
                { to: '/', icon: 'fa-home', label: 'Home' },
                { to: '/products', icon: 'fa-box', label: 'Products' },
                { to: '/categories', icon: 'fa-th-large', label: 'Categories' },
                { to: '/about', icon: 'fa-info-circle', label: 'About' },
                { to: '/contact', icon: 'fa-envelope', label: 'Contact' }
              ].map((item, index) => (
                <Link
                  key={index}
                  to={item.to}
                  className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/20 rounded-lg transition-all duration-200 font-medium flex items-center"
                >
                  <i className={`fas ${item.icon} mr-1.5 text-xs`}></i>
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Compact Actions */}
            <div className="flex items-center space-x-1">
              
              {/* Search Button */}
              <button
                onClick={toggleSearch}
                className="p-2 rounded-lg bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/20 transition-all duration-200 hover:scale-105"
                title="Search"
              >
                <SearchIcon />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/20 transition-all duration-200 hover:scale-105"
                title="Toggle Theme"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {isDarkMode ? (
                    <circle cx="12" cy="12" r="5"/>
                  ) : (
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  )}
                </svg>
              </button>

              {/* Compact Cart */}
              <Link
                to="/cart"
                className="relative p-2 rounded-lg bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/20 transition-all duration-200 hover:scale-105"
                title="Shopping Cart"
              >
                <CartIcon />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center animate-pulse font-bold text-[10px]">
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )}
              </Link>

              {/* Compact User Account */}
              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center space-x-1.5 p-1.5 rounded-lg bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/20 transition-all duration-200 hover:scale-105"
                  >
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="hidden md:block font-medium text-sm max-w-20 truncate">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </button>

                  {/* Compact Dropdown */}
                  <div
                    className={`absolute right-0 mt-1 w-52 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-xl shadow-2xl py-1 z-50 transition-all duration-300 ${
                      isDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                    }`}
                  >
                    {/* Compact User Info */}
                    <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{user?.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Compact Menu Items */}
                    <div className="py-1">
                      {[
                        { to: '/profile', icon: 'fa-user', label: 'Profile', color: 'text-blue-500' },
                        { to: '/orders', icon: 'fa-shopping-bag', label: 'Orders', color: 'text-green-500' },
                        { to: '/wishlist', icon: 'fa-heart', label: 'Wishlist', color: 'text-pink-500' },
                        ...(isAdmin ? [{ to: '/admin', icon: 'fa-cog', label: 'Admin', color: 'text-purple-500' }] : [])
                      ].map((item, index) => (
                        <Link
                          key={index}
                          to={item.to}
                          className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 text-sm"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <i className={`fas ${item.icon} mr-2 ${item.color} text-xs w-3`}></i>
                          {item.label}
                        </Link>
                      ))}
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsDropdownOpen(false);
                        }}
                        className="flex items-center w-full px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 text-sm"
                      >
                        <i className="fas fa-sign-out-alt mr-2 text-red-500 text-xs w-3"></i>
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex space-x-1">
                  <Link to="/login">
                    <button className="px-3 py-1.5 text-xs bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-white/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:scale-105">
                      Login
                    </button>
                  </Link>
                  <Link to="/register">
                    <button className="px-3 py-1.5 text-xs bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-md">
                      Register
                    </button>
                  </Link>
                </div>
              )}

              {/* Compact Mobile Menu Toggle */}
              <button
                onClick={toggleMenu}
                className="lg:hidden p-2 rounded-lg bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/20 transition-all duration-200"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {isMenuOpen ? (
                    <path d="m18 6-12 12M6 6l12 12"/>
                  ) : (
                    <path d="M3 12h18M3 6h18M3 18h18"/>
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Compact Mobile Navigation */}
          <div
            className={`lg:hidden transition-all duration-300 overflow-hidden ${
              isMenuOpen ? 'max-h-80 opacity-100 mt-2' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-xl p-3">
              <div className="flex flex-col space-y-1">
                {[
                  { to: '/', icon: 'fa-home', label: 'Home', color: 'text-blue-500' },
                  { to: '/products', icon: 'fa-box', label: 'Products', color: 'text-purple-500' },
                  { to: '/categories', icon: 'fa-th-large', label: 'Categories', color: 'text-pink-500' },
                  { to: '/about', icon: 'fa-info-circle', label: 'About', color: 'text-green-500' },
                  { to: '/contact', icon: 'fa-envelope', label: 'Contact', color: 'text-cyan-500' }
                ].map((item, index) => (
                  <Link
                    key={index}
                    to={item.to}
                    className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-white/20 rounded-lg transition-all duration-200 text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <i className={`fas ${item.icon} mr-2 ${item.color} text-xs w-4`}></i>
                    {item.label}
                  </Link>
                ))}

                <div className="border-t border-white/20 dark:border-gray-700/20 my-2"></div>

                <Link
                  to="/cart"
                  className="flex items-center justify-between px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-white/20 rounded-lg transition-all duration-200 text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <i className="fas fa-shopping-cart mr-2 text-blue-500 text-xs w-4"></i>
                    Cart
                  </div>
                  {cartItemCount > 0 && (
                    <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                      {cartItemCount}
                    </span>
                  )}
                </Link>

                {isAuthenticated ? (
                  <>
                    {[
                      { to: '/profile', icon: 'fa-user', label: 'Profile', color: 'text-purple-500' },
                      { to: '/orders', icon: 'fa-shopping-bag', label: 'Orders', color: 'text-green-500' },
                      { to: '/wishlist', icon: 'fa-heart', label: 'Wishlist', color: 'text-pink-500' },
                      ...(isAdmin ? [{ to: '/admin', icon: 'fa-cog', label: 'Admin', color: 'text-indigo-500' }] : [])
                    ].map((item, index) => (
                      <Link
                        key={index}
                        to={item.to}
                        className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-white/20 rounded-lg transition-all duration-200 text-sm"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <i className={`fas ${item.icon} mr-2 ${item.color} text-xs w-4`}></i>
                        {item.label}
                      </Link>
                    ))}
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center w-full px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-white/20 rounded-lg transition-all duration-200 text-sm"
                    >
                      <i className="fas fa-sign-out-alt mr-2 text-red-500 text-xs w-4"></i>
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col space-y-1 pt-1">
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      <button className="w-full px-3 py-2 text-sm bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-white/20 transition-all duration-200">
                        Login
                      </button>
                    </Link>
                    <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                      <button className="w-full px-3 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200">
                        Register
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Compact Search Modal */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-all duration-300 ${
          isSearchOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={() => setIsSearchOpen(false)}
      >
        <div className="flex items-center justify-center min-h-screen p-4">
          <div
            className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl w-full max-w-lg p-6 transform transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                <SearchIcon />
                <span className="ml-2">Search</span>
              </h3>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m18 6-12 12M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                autoFocus
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <SearchIcon />
              </div>
            </div>
            <div className="mt-4 text-center text-gray-500 dark:text-gray-400 text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline mr-1">
                <path d="M9 11l3 3L22 4"/>
              </svg>
              Press Enter to search
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .nav-link {
          position: relative;
        }
        
        .nav-link::after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: -4px;
          left: 50%;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899);
          transition: all 0.3s ease;
          transform: translateX(-50%);
        }
        
        .nav-link:hover::after {
          width: 100%;
        }
        
        /* Compact scrollbar */
        ::-webkit-scrollbar {
          width: 4px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #3b82f6, #8b5cf6);
          border-radius: 2px;
        }
      `}</style>
    </>
  );
};

export default Header;
