import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// Components
import Header from '../common/Header';
import Footer from '../common/Footer';
import ErrorBoundary from '../common/ErrorBoundary';

// Simple route configurations
const ROUTE_TITLES = {
  '/': 'ShoeMarkNet - Premium Footwear Online',
  '/products': 'Products - ShoeMarkNet',
  '/cart': 'Shopping Cart - ShoeMarkNet',
  '/wishlist': 'Wishlist - ShoeMarkNet',
  '/orders': 'My Orders - ShoeMarkNet'
};

const MainLayout = () => {
  const location = useLocation();
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Simple scroll handling
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Simple scroll to top with smooth animation
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Get page title
  const pageTitle = ROUTE_TITLES[location.pathname] || 'ShoeMarkNet';

  return (
    <ErrorBoundary>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>

      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* Header with proper spacing */}
        <Header />

        {/* Main Content with top padding for fixed header */}
        <main className="flex-grow pt-20">
          <Outlet />
        </main>

        {/* Footer */}
        <Footer />

        {/* Enhanced Scroll to Top Button */}
        <button
          onClick={scrollToTop}
          className={`fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-xl hover:shadow-blue-500/25 text-white rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 z-40 flex items-center justify-center group ${
            showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
          aria-label="Scroll to top"
        >
          <i className="fas fa-chevron-up text-lg group-hover:animate-bounce"></i>
        </button>

        {/* Loading indicator for route changes */}
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          {/* This could be enhanced with a global loading state */}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default MainLayout;
