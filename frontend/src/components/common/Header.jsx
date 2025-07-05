// src/components/common/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';

// Icon Components
const Icons = {
  Logo: () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
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
      </defs>
      {/* Modern shoe icon */}
      <path d="M4 20c0-1.5 1-3 2.5-3h19c1.5 0 2.5 1.5 2.5 3v4c0 1.5-1 3-2.5 3h-19C5 27 4 25.5 4 24v-4z" fill="url(#logoGradient)" />
      <path d="M6 17c0-2 1-4 3-5l4-2c1.5-.75 3-1 4.5-1h7c1.5 0 2.5 1 2.5 2.5v5.5h-21z" fill="url(#shoeGradient)" />
      <circle cx="9" cy="23" r="1.5" fill="white" opacity="0.8" />
      <circle cx="15" cy="23" r="1.5" fill="white" opacity="0.8" />
      <circle cx="21" cy="23" r="1.5" fill="white" opacity="0.8" />
    </svg>
  ),
  
  Search: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  ),
  
  Cart: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  ),
  
  Sun: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
  
  Moon: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  ),
  
  ChevronDown: ({ size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  ),
  
  Close: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  ),
  
  Menu: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12h18M3 6h18M3 18h18"/>
    </svg>
  ),
  
  Check: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
  ),
  
  // Navigation Icons
  Home: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  
  Box: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
  
  Grid: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  
  Info: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
  
  Mail: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  
  User: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  
  ShoppingBag: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  ),
  
  Heart: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  
  Settings: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v6m0 6v6m4.22-10.22l4.24-4.24M6.34 12.66l-4.24 4.24M1 12h6m6 0h6m-10.22 4.22l-4.24 4.24M17.66 6.34l4.24-4.24"/>
    </svg>
  ),
  
  LogOut: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  )
};

// Navigation configuration
const navigationLinks = [
  { to: '/', icon: Icons.Home, label: 'Home' },
  { to: '/products', icon: Icons.Box, label: 'Products' },
  { to: '/categories', icon: Icons.Grid, label: 'Categories' },
  { to: '/about', icon: Icons.Info, label: 'About' },
  { to: '/contact', icon: Icons.Mail, label: 'Contact' }
];

const userMenuItems = [
  { to: '/profile', icon: Icons.User, label: 'Profile', color: 'text-blue-500' },
  { to: '/orders', icon: Icons.ShoppingBag, label: 'Orders', color: 'text-green-500' },
  { to: '/wishlist', icon: Icons.Heart, label: 'Wishlist', color: 'text-pink-500' }
];

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

  return (
    <>
      {/* Main Header */}
      <header className="fixed top-0 w-full  backdrop-blur-xl border-b border-white/20 dark:border-gray-700/20 z-40 transition-all duration-300">
        <div className="container mx-auto px-3 py-2">
          <div className="flex items-center justify-between h-12">
            
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg blur opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
                <div className="relative bg-white dark:bg-gray-800 rounded-lg p-1.5 shadow-md hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                  <Icons.Logo />
                </div>
              </div>
              <span
  className="hidden sm:inline-block text-xl font-extrabold text-transparent bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 bg-clip-text px-4 py-1 rounded-lg backdrop-blur-3xl bg-white/10 transform transition duration-300 ease-in-out group-hover:scale-110 tracking-wide"
>
  ShoeMarkNet
</span>

            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationLinks.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={index}
                    to={item.to}
                                        className="nav-link px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/20 rounded-lg transition-all duration-200 font-medium flex items-center"
                  >
                    <Icon size={14} />
                    <span className="ml-1.5">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-1">
              
              {/* Search Button */}
              <button
                onClick={toggleSearch}
                className="p-2 rounded-lg bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/20 transition-all duration-200 hover:scale-105"
                aria-label="Search"
              >
                <Icons.Search size={16} />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/20 transition-all duration-200 hover:scale-105"
                aria-label="Toggle theme"
              >
                {isDarkMode ? <Icons.Sun size={16} /> : <Icons.Moon size={16} />}
              </button>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2 rounded-lg bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/20 transition-all duration-200 hover:scale-105"
                aria-label="Shopping cart"
              >
                <Icons.Cart size={16} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center animate-pulse font-bold text-[10px]">
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )}
              </Link>

              {/* User Account */}
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
                    <Icons.ChevronDown />
                  </button>

                  {/* Dropdown Menu */}
                  <div
                    className={`absolute right-0 mt-1 w-52 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-xl shadow-2xl py-1 z-50 transition-all duration-300 ${
                      isDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                    }`}
                  >
                    {/* User Info */}
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

                    {/* Menu Items */}
                    <div className="py-1">
                      {userMenuItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={index}
                            to={item.to}
                            className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 text-sm"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <Icon size={14} />
                            <span className="ml-2">{item.label}</span>
                          </Link>
                        );
                      })}
                      
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-200 text-sm"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <Icons.Settings size={14} />
                          <span className="ml-2">Admin Dashboard</span>
                        </Link>
                      )}
                      
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                      
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsDropdownOpen(false);
                        }}
                        className="flex items-center w-full px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 text-sm"
                      >
                        <Icons.LogOut size={14} />
                        <span className="ml-2">Sign Out</span>
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

              {/* Mobile Menu Toggle */}
              <button
                onClick={toggleMenu}
                className="lg:hidden p-2 rounded-lg bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/20 transition-all duration-200"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <Icons.Close size={16} /> : <Icons.Menu size={16} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div
            className={`lg:hidden transition-all duration-300 overflow-hidden ${
              isMenuOpen ? 'max-h-80 opacity-100 mt-2' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-xl p-3">
              <div className="flex flex-col space-y-1">
                {navigationLinks.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={index}
                      to={item.to}
                      className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-white/20 rounded-lg transition-all duration-200 text-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Icon size={14} />
                      <span className="ml-2">{item.label}</span>
                    </Link>
                  );
                })}

                <div className="border-t border-white/20 dark:border-gray-700/20 my-2"></div>

                <Link
                  to="/cart"
                  className="flex items-center justify-between px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-white/20 rounded-lg transition-all duration-200 text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <Icons.Cart size={14} />
                    <span className="ml-2">Cart</span>
                  </div>
                  {cartItemCount > 0 && (
                    <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                      {cartItemCount}
                    </span>
                  )}
                </Link>

                {isAuthenticated ? (
                  <>
                    {userMenuItems.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={index}
                          to={item.to}
                          className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-white/20 rounded-lg transition-all duration-200 text-sm"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Icon size={14} />
                          <span className="ml-2">{item.label}</span>
                        </Link>
                      );
                    })}
                    
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-white/20 rounded-lg transition-all duration-200 text-sm"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Icons.Settings size={14} />
                        <span className="ml-2">Admin Dashboard</span>
                      </Link>
                    )}
                    
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center w-full px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-white/20 rounded-lg transition-all duration-200 text-sm"
                    >
                      <Icons.LogOut size={14} />
                      <span className="ml-2">Logout</span>
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

      {/* Search Modal */}
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
                <Icons.Search size={20} />
                <span className="ml-2">Search Products</span>
              </h3>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                aria-label="Close search"
              >
                <Icons.Close size={16} />
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search for shoes, brands, categories..."
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                autoFocus
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Icons.Search size={16} />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
              <Icons.Check size={16} />
              <span className="ml-1">Press Enter to search</span>
            </div>
          </div>
        </div>
      </div>

            {/* Inline Styles */}
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
        
        /* Custom scrollbar */
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
        
        /* Smooth animations */
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .5;
          }
        }
        
        /* Glassmorphism effect */
        .glass {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .dark .glass {
          background: rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </>
  );
};

export default Header;