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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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
      {/* Enhanced Header */}
      <header className="fixed top-0 w-full bg-white/10 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/20 z-40 transition-all duration-300">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo with enhanced animation */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 md:h-12 md:w-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 md:rounded-2xl rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                S
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-200">
                ShoeMarkNet
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className="nav-link text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 font-medium hover:scale-105 flex items-center"
              >
                <i className="fas fa-home mr-2"></i>Home
              </Link>
              <Link
                to="/products"
                className="nav-link text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 font-medium hover:scale-105 flex items-center"
              >
                <i className="fas fa-box mr-2"></i>Products
              </Link>
              <Link
                to="/categories"
                className="nav-link text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 font-medium hover:scale-105 flex items-center"
              >
                <i className="fas fa-th-large mr-2"></i>Categories
              </Link>
              <Link
                to="/about"
                className="nav-link text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 font-medium hover:scale-105 flex items-center"
              >
                <i className="fas fa-info-circle mr-2"></i>About
              </Link>
              <Link
                to="/contact"
                className="nav-link text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 font-medium hover:scale-105 flex items-center"
              >
                <i className="fas fa-envelope mr-2"></i>Contact
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-2 md:space-x-3">
              {/* Search Button */}
              <button
                onClick={toggleSearch}
                className="p-2 md:p-3 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/20 transition-all duration-200 hover:scale-105"
              >
                <i className="fas fa-search"></i>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 md:p-3 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/20 transition-all duration-200 hover:scale-105"
              >
                <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
              </button>

              {/* Cart Button with Enhanced Animation */}
              <Link
                to="/cart"
                className="relative p-2 md:p-3 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/20 transition-all duration-200 hover:scale-105"
              >
                <i className="fas fa-shopping-cart"></i>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse font-bold">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </Link>

              {/* User Account */}
              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center space-x-2 p-2 md:p-3 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/20 transition-all duration-200 hover:scale-105"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="hidden md:block font-medium">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <i className="fas fa-chevron-down text-xs"></i>
                  </button>

                  {/* Enhanced Dropdown */}
                  <div
                    className={`absolute right-0 mt-2 w-64 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl shadow-2xl py-2 z-50 transition-all duration-300 ${
                      isDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                    }`}
                  >
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <i className="fas fa-user mr-3 text-blue-500"></i>
                        Profile Settings
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <i className="fas fa-shopping-bag mr-3 text-green-500"></i>
                        My Orders
                      </Link>
                      <Link
                        to="/wishlist"
                        className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <i className="fas fa-heart mr-3 text-pink-500"></i>
                        Wishlist
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <i className="fas fa-cog mr-3 text-purple-500"></i>
                          Admin Dashboard
                        </Link>
                      )}
                      <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsDropdownOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                      >
                        <i className="fas fa-sign-out-alt mr-3 text-red-500"></i>
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Link to="/login">
                    <button className="px-4 py-2 text-sm bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-white/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:scale-105">
                      <i className="fas fa-sign-in-alt mr-2"></i>
                      Login
                    </button>
                  </Link>
                  <Link to="/register">
                    <button className="px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 hover:scale-105 shadow-lg">
                      <i className="fas fa-user-plus mr-2"></i>
                      Register
                    </button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={toggleMenu}
                className="md:hidden p-2 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/20 transition-all duration-200"
              >
                <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
              </button>
            </div>
          </div>

          {/* Enhanced Mobile Navigation */}
          <div
            className={`md:hidden mt-4 transition-all duration-300 overflow-hidden ${
              isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl p-4">
              <div className="flex flex-col space-y-2">
                <Link
                  to="/"
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-white/20 rounded-xl transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="fas fa-home mr-3 text-blue-500"></i>Home
                </Link>
                <Link
                  to="/products"
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-white/20 rounded-xl transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="fas fa-box mr-3 text-purple-500"></i>Products
                </Link>
                <Link
                  to="/categories"
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-white/20 rounded-xl transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="fas fa-th-large mr-3 text-pink-500"></i>Categories
                </Link>
                <Link
                  to="/about"
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-white/20 rounded-xl transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="fas fa-info-circle mr-3 text-green-500"></i>About
                </Link>
                <Link
                  to="/contact"
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-white/20 rounded-xl transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="fas fa-envelope mr-3 text-cyan-500"></i>Contact
                </Link>

                <div className="border-t border-white/20 dark:border-gray-700/20 my-3"></div>

                <Link
                  to="/cart"
                  className="flex items-center justify-between px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-white/20 rounded-xl transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <i className="fas fa-shopping-cart mr-3 text-blue-500"></i>
                    Shopping Cart
                  </div>
                  {cartItemCount > 0 && (
                    <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full px-2 py-1 font-bold">
                      {cartItemCount}
                    </span>
                  )}
                </Link>

                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-white/20 rounded-xl transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <i className="fas fa-user mr-3 text-purple-500"></i>Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-white/20 rounded-xl transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <i className="fas fa-shopping-bag mr-3 text-green-500"></i>Orders
                    </Link>
                    <Link
                      to="/wishlist"
                      className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-white/20 rounded-xl transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <i className="fas fa-heart mr-3 text-pink-500"></i>Wishlist
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-white/20 rounded-xl transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <i className="fas fa-cog mr-3 text-indigo-500"></i>Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-white/20 rounded-xl transition-all duration-200"
                    >
                      <i className="fas fa-sign-out-alt mr-3 text-red-500"></i>Logout
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col space-y-2 pt-2">
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      <button className="w-full px-4 py-3 text-sm bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-white/20 transition-all duration-200">
                        <i className="fas fa-sign-in-alt mr-2"></i>Login
                      </button>
                    </Link>
                    <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                      <button className="w-full px-4 py-3 text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200">
                        <i className="fas fa-user-plus mr-2"></i>Register
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Search Modal */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-all duration-300 ${
          isSearchOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={() => setIsSearchOpen(false)}
      >
        <div className="flex items-center justify-center min-h-screen p-4">
          <div
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl w-full max-w-2xl p-8 transform transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                <i className="fas fa-search mr-2 text-blue-500"></i>Search Products
              </h3>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <i className="fas fa-times text-gray-600 dark:text-gray-400"></i>
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search for shoes, brands, categories..."
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
            <div className="mt-6 text-center text-gray-500 dark:text-gray-400">
              <i className="fas fa-lightbulb mr-2"></i>
              Start typing to search for products...
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
