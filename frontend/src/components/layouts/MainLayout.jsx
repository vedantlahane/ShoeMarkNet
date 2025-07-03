// src/components/layouts/MainLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../common/Header';
import Footer from '../common/Footer';

const MainLayout = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [pageTransition, setPageTransition] = useState(false);

  // Handle page transitions
  useEffect(() => {
    setPageTransition(true);
    setIsLoading(true);
    
    // Simulate page loading
    const timer = setTimeout(() => {
      setIsLoading(false);
      setPageTransition(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Handle scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Get dynamic background based on current route
  const getRouteBackground = () => {
    const path = location.pathname;
    if (path.includes('/products')) {
      return 'from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-900/20 dark:via-cyan-900/20 dark:to-teal-900/20';
    } else if (path.includes('/cart')) {
      return 'from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20';
    } else if (path.includes('/wishlist')) {
      return 'from-pink-50 via-rose-50 to-red-50 dark:from-pink-900/20 dark:via-rose-900/20 dark:to-red-900/20';
    } else if (path.includes('/orders')) {
      return 'from-purple-50 via-violet-50 to-indigo-50 dark:from-purple-900/20 dark:via-violet-900/20 dark:to-indigo-900/20';
    } else if (path.includes('/about')) {
      return 'from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-900/20 dark:via-amber-900/20 dark:to-yellow-900/20';
    } else if (path.includes('/contact')) {
      return 'from-indigo-50 via-blue-50 to-cyan-50 dark:from-indigo-900/20 dark:via-blue-900/20 dark:to-cyan-900/20';
    }
    return 'from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900';
  };

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      
      {/* Dynamic Animated Background */}
      <div className={`fixed inset-0 bg-gradient-to-br transition-all duration-1000 ${getRouteBackground()}`}>
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-float opacity-20"
              style={{
                width: `${Math.random() * 100 + 50}px`,
                height: `${Math.random() * 100 + 50}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: `linear-gradient(45deg, 
                  hsl(${Math.random() * 360}, 70%, 60%), 
                  hsl(${Math.random() * 360}, 70%, 80%))`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${10 + Math.random() * 20}s`
              }}
            />
          ))}
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/5 dark:from-black/20 dark:via-transparent dark:to-black/40"></div>
      </div>

      {/* Page Transition Overlay */}
      {pageTransition && (
        <div className="fixed inset-0 z-50 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center transition-opacity duration-300">
          <div className="text-center text-white">
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-xl font-bold">Loading...</h3>
          </div>
        </div>
      )}

      {/* Enhanced Header */}
      <div className="relative z-30">
        <Header />
      </div>

      {/* Main Content Area */}
      <main className={`flex-grow relative z-10 transition-all duration-500 ${
        isLoading ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
      }`}>
        {/* Content Wrapper with Glassmorphism */}
        <div className="relative">
          {/* Content Background Blur */}
          <div className="absolute inset-0 backdrop-blur-sm bg-white/5 dark:bg-black/5 pointer-events-none"></div>
          
          {/* Outlet Content */}
          <div className="relative z-10">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Enhanced Footer */}
      <div className="relative z-30">
        <Footer />
      </div>

      {/* Floating Action Elements */}
      <div className="fixed bottom-8 right-8 z-40 flex flex-col space-y-4">
        
        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 shadow-2xl hover:scale-110 transition-all duration-300 animate-fade-in-up group"
            title="Scroll to top"
          >
            <i className="fas fa-chevron-up text-lg group-hover:animate-bounce"></i>
          </button>
        )}

        {/* Quick Actions Menu */}
        <div className="flex flex-col space-y-3">
          
          {/* Quick Cart Access */}
          <button className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-all duration-300 group">
            <i className="fas fa-shopping-cart group-hover:animate-pulse"></i>
          </button>

          {/* Quick Wishlist Access */}
          <button className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-all duration-300 group">
            <i className="fas fa-heart group-hover:animate-pulse"></i>
          </button>

          {/* Quick Support */}
          <button className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-all duration-300 group">
            <i className="fas fa-headset group-hover:animate-pulse"></i>
          </button>
        </div>
      </div>

      {/* Enhanced Loading Indicator */}
      {isLoading && (
        <div className="fixed top-0 left-0 w-full h-1 z-50">
          <div className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-pulse"></div>
        </div>
      )}

      {/* Page Performance Indicators */}
      <div className="fixed top-20 right-4 z-30 space-y-2">
        
        {/* Network Status */}
        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" title="Online"></div>
        
        {/* Performance Indicator */}
        <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" title="Good Performance"></div>
      </div>

      {/* Accessibility Skip Links */}
      <div className="sr-only">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <a href="#footer" className="skip-link">Skip to footer</a>
      </div>

      {/* Custom Styles and Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg) scale(1); 
          }
          25% { 
            transform: translateY(-20px) rotate(5deg) scale(1.1); 
          }
          50% { 
            transform: translateY(-10px) rotate(-3deg) scale(0.9); 
          }
          75% { 
            transform: translateY(-15px) rotate(2deg) scale(1.05); 
          }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes pulse-glow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); 
          }
          50% { 
            box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); 
          }
        }
        
        .animate-float {
          animation: float 15s ease-in-out infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out;
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.6s ease-out;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        /* Enhanced Scrollbar Styling */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, #2563eb, #7c3aed, #db2777);
        }
        
        /* Skip Link Styling */
        .skip-link {
          position: absolute;
          top: -40px;
          left: 6px;
          background: #000;
          color: #fff;
          padding: 8px;
          text-decoration: none;
          border-radius: 4px;
          z-index: 1000;
        }
        
        .skip-link:focus {
          top: 6px;
        }
        
        /* Enhanced Focus States */
        *:focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
          border-radius: 4px;
        }
        
        /* Smooth Transitions for All Elements */
        * {
          transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
        }
        
        /* Enhanced Glass Morphism */
        .glass-morphism {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
        }
        
        /* Dark Mode Enhancements */
        @media (prefers-color-scheme: dark) {
          .glass-morphism {
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
        }
        
        /* Reduced Motion Support */
        @media (prefers-reduced-motion: reduce) {
          .animate-float,
          .animate-pulse,
          .animate-spin,
          .animate-bounce {
            animation: none;
          }
          
          * {
            transition-duration: 0.01ms !important;
          }
        }
        
        /* High Contrast Mode Support */
        @media (prefers-contrast: high) {
          .glass-morphism {
            background: rgba(255, 255, 255, 0.9);
            border: 2px solid #000;
          }
          
          @media (prefers-color-scheme: dark) {
            .glass-morphism {
              background: rgba(0, 0, 0, 0.9);
              border: 2px solid #fff;
            }
          }
        }
      `}</style>
    </div>
  );
};

export default MainLayout;
