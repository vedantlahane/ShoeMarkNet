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

  // Simple scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get page title
  const pageTitle = ROUTE_TITLES[location.pathname] || 'ShoeMarkNet';

  return (
    <ErrorBoundary>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>

      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="flex-grow">
          <Outlet />
        </main>

        {/* Footer */}
        <Footer />

        {/* Simple Scroll to Top */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-200 flex items-center justify-center z-40"
            aria-label="Scroll to top"
          >
            <i className="fas fa-chevron-up"></i>
          </button>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default MainLayout;
