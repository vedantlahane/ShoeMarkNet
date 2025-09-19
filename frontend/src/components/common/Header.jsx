import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Header = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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

  const navigationLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Products' },
    { to: '/categories', label: 'Categories' },
    { to: '/sale', label: 'Sale' }
  ];

  return (
    <header className={`fixed top-0 w-full z-40 transition-all duration-300 ${
      isScrolled
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200'
        : 'bg-white shadow-md'
    }`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
              <span className="text-white font-bold text-sm">SM</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
              ShoeMarkNet
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative font-medium transition-all duration-300 group ${
                  location.pathname === link.to
                    ? 'text-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {link.label}
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 group-hover:w-full ${
                  location.pathname === link.to ? 'w-full' : ''
                }`}></span>
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">

            {/* Search */}
            <Link
              to="/search"
              className="group p-2 text-gray-600 hover:text-blue-600 transition-all duration-300 hover:bg-blue-50 rounded-lg"
              title="Search"
            >
              <i className="fas fa-search text-lg group-hover:scale-110 transition-transform duration-300"></i>
            </Link>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="group relative p-2 text-gray-600 hover:text-red-500 transition-all duration-300 hover:bg-red-50 rounded-lg"
              title="Wishlist"
            >
              <i className="fas fa-heart text-lg group-hover:scale-110 transition-transform duration-300"></i>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="group relative p-2 text-gray-600 hover:text-green-500 transition-all duration-300 hover:bg-green-50 rounded-lg"
              title="Cart"
            >
              <i className="fas fa-shopping-cart text-lg group-hover:scale-110 transition-transform duration-300"></i>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg animate-bounce">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-all duration-300 group"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                    {user?.name?.split(' ')[0]}
                  </span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-all duration-300 hover:bg-blue-50 rounded-lg"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg hover:shadow-blue-500/25 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-all duration-300 hover:bg-blue-50 rounded-lg"
            >
              <i className={`fas text-lg transition-transform duration-300 ${isMenuOpen ? 'fa-times rotate-180' : 'fa-bars'}`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <nav className="pt-4 pb-2 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              {navigationLinks.map((link, index) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`p-3 rounded-lg font-medium transition-all duration-300 transform ${
                    isMenuOpen ? 'translate-x-0' : 'translate-x-4'
                  }`}
                  style={{ transitionDelay: `${index * 50}ms` }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className={`${
                    location.pathname === link.to
                      ? 'text-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}>
                    {link.label}
                  </span>
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
