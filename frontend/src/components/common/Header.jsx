// src/components/common/Header.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { items } = useSelector((state) => state.cart);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-primary">ShoeMarkNet</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary">Home</Link>
            <Link to="/products" className="text-gray-700 hover:text-primary">Products</Link>
            <Link to="/categories" className="text-gray-700 hover:text-primary">Categories</Link>
            <Link to="/about" className="text-gray-700 hover:text-primary">About</Link>
            <Link to="/contact" className="text-gray-700 hover:text-primary">Contact</Link>
          </nav>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search Icon */}
            <Link to="/search" className="text-gray-700 hover:text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
            
            {/* Cart Icon with Counter */}
            <Link to="/cart" className="text-gray-700 hover:text-primary relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>
            
            {/* User Account */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center text-gray-700 hover:text-primary">
                  <span className="mr-1">{user?.name?.split(' ')[0]}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</Link>
                  <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Orders</Link>
                  <Link to="/wishlist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Wishlist</Link>
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
                </div>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link to="/login">
                  {/* <Button variant="outline" size="sm">Login</Button> */}
                </Link>
                <Link to="/register">
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-md">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link to="/" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Home</Link>
            <Link to="/products" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Products</Link>
            <Link to="/categories" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Categories</Link>
            <Link to="/about" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">About</Link>
            <Link to="/contact" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Contact</Link>
            
            <div className="border-t border-gray-200 my-2"></div>
            
            <Link to="/search" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Search</Link>
            <Link to="/cart" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Cart ({items.length})</Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Profile</Link>
                <Link to="/orders" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Orders</Link>
                <Link to="/wishlist" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Wishlist</Link>
                <button className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Logout</button>
              </>
            ) : (
              <div className="flex flex-col space-y-2 px-3 py-2">
                <Link to="/login">
              
                </Link>
                <Link to="/register">
             
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
