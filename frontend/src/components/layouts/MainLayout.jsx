import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import PageMeta from '../seo/PageMeta';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronUp } from 'lucide-react';

// Components
import Header from '../common/Header';
import Footer from '../common/Footer';
import ErrorBoundary from '../common/ErrorBoundary';

// Hooks
import useGsap from '../../hooks/useGsap';
import useReducedMotion from '../../hooks/useReducedMotion';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Enhanced route configurations with meta data
const ROUTE_CONFIG = {
  '/': {
    title: 'ShoeMarkNet - Premium Footwear Collection',
    description: 'Discover premium sneakers and footwear with exclusive designs and unbeatable comfort.',
    background: 'gradient-primary'
  },
  '/products': {
    title: 'Premium Products - ShoeMarkNet',
    description: 'Browse our curated collection of premium sneakers and athletic footwear.',
    background: 'gradient-secondary'
  },
  '/sale': {
    title: 'Exclusive Deals - ShoeMarkNet',
    description: 'Shop limited-time offers and discounted footwear from top brands.',
    background: 'gradient-tertiary'
  },
  '/cart': {
    title: 'Shopping Cart - ShoeMarkNet',
    description: 'Review your selected items and complete your purchase.',
    background: 'gradient-tertiary'
  },
  '/wishlist': {
    title: 'My Wishlist - ShoeMarkNet',
    description: 'Your saved favorite products and future purchases.',
    background: 'gradient-quaternary'
  },
  '/orders': {
    title: 'Order History - ShoeMarkNet',
    description: 'Track and manage your orders.',
    background: 'gradient-primary'
  },
  '/logout': {
    title: 'Signing Out • ShoeMarkNet',
    description: 'Securely ending your session and keeping your account protected.',
    background: 'gradient-tertiary'
  },
  '/access-denied': {
    title: 'Access Restricted • ShoeMarkNet',
    description: 'Your current role does not have permission to view this page.',
    background: 'gradient-tertiary'
  }
};

const getPreferredTheme = () => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const storedTheme = localStorage.getItem('theme');
  if (storedTheme) {
    return storedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const MainLayout = () => {
  const location = useLocation();
  const scrollButtonRef = useRef(null);
  
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(getPreferredTheme);

  const prefersReducedMotion = useReducedMotion();

  // Get current route config
  const currentRoute = ROUTE_CONFIG[location.pathname] || {
    title: 'ShoeMarkNet',
    description: 'Premium footwear online',
    background: 'gradient-primary'
  };

  // Page transition animations
  const layoutRef = useGsap((_, element) => {
    if (prefersReducedMotion) {
      setIsPageTransitioning(false);
      return;
    }

    setIsPageTransitioning(true);
    
    const tl = gsap.timeline({
      onComplete: () => setIsPageTransitioning(false)
    });

    tl.fromTo(
      element?.querySelector('.page-content') || '.page-content', 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
    );
  }, [location.pathname, prefersReducedMotion]);

  // Optimized scroll handling with debouncing
  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    let timeoutId;

    const handleScroll = () => {
      if (timeoutId) clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        const scrollY = window.pageYOffset;
        setShowScrollTop(scrollY > 400);
      }, 16);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Theme change handler with improved performance
  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleThemeChange = () => {
      setCurrentTheme(getPreferredTheme());
    };

    window.addEventListener('storage', handleThemeChange);

    let observer;
    if (
      typeof MutationObserver !== 'undefined' &&
      typeof document !== 'undefined' &&
      document.documentElement
    ) {
      observer = new MutationObserver(handleThemeChange);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      });
    }

    return () => {
      window.removeEventListener('storage', handleThemeChange);
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  // Enhanced scroll to top with accessibility
  const scrollToTop = () => {
    // Respect reduced motion preference
    if (prefersReducedMotion) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    // Button feedback animation
    if (scrollButtonRef.current) {
      gsap.to(scrollButtonRef.current, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: 'power2.out'
      });
    }

    // Smooth scroll
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <ErrorBoundary>
      <PageMeta
        title={currentRoute.title}
        description={currentRoute.description}
        meta={[{
          name: 'theme-color',
          content: currentTheme === 'dark' ? '#0f172a' : '#ffffff',
        }]}
      />

      <div 
        ref={layoutRef}
        className={`
          relative flex flex-col min-h-screen
          ${currentTheme === 'dark' 
            ? 'bg-gray-900 text-white' 
            : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 text-gray-900'
          }
          transition-colors duration-300
        `}
      >
        {/* Simplified Background - Respects reduced motion */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div 
            className={`
              absolute inset-0 opacity-40
              ${currentRoute.background === 'gradient-primary' 
                ? 'bg-gradient-to-br from-blue-400/10 via-purple-500/10 to-pink-500/10'
                : currentRoute.background === 'gradient-secondary'
                ? 'bg-gradient-to-br from-green-400/10 via-blue-500/10 to-purple-500/10'
                : currentRoute.background === 'gradient-tertiary'
                ? 'bg-gradient-to-br from-pink-400/10 via-red-500/10 to-orange-500/10'
                : currentRoute.background === 'gradient-quaternary'
                ? 'bg-gradient-to-br from-purple-400/10 via-pink-500/10 to-red-500/10'
                : 'bg-gradient-to-br from-blue-400/10 via-purple-500/10 to-pink-500/10'
              }
              dark:opacity-20
            `}
          />
          
          {/* Subtle animated background - only if motion is allowed */}
          {!prefersReducedMotion && (
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
              <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }} />
            </div>
          )}
        </div>

        {/* Header with proper z-index */}
        <div className="relative z-30">
          <Header />
        </div>

        {/* Main Content Container */}
        <main className="relative z-20 flex-grow pt-20">
          {/* Simplified page transition overlay */}
          <div 
            className={`
              fixed inset-0 bg-white/50 dark:bg-gray-900/50 pointer-events-none z-40
              transition-opacity duration-300
              ${isPageTransitioning ? 'opacity-100' : 'opacity-0'}
            `}
          />
          
          <div className="page-content relative">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <div className="relative z-20">
          <Footer />
        </div>

        {/* Accessible Scroll to Top Button */}
        <button
          ref={scrollButtonRef}
          onClick={scrollToTop}
          className={`
            fixed bottom-8 right-8 w-12 h-12 z-50
            bg-gradient-to-r from-blue-500 to-purple-600 
            hover:from-blue-600 hover:to-purple-700
            dark:from-blue-400 dark:to-purple-500
            text-white rounded-full shadow-lg
            border border-white/20
            transition-all duration-200
            hover:scale-105 focus:scale-105
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            group
            ${showScrollTop 
              ? 'opacity-100 translate-y-0 pointer-events-auto' 
              : 'opacity-0 translate-y-4 pointer-events-none'
            }
          `}
          aria-label="Scroll to top"
          type="button"
        >
          <ChevronUp 
            className={`
              w-5 h-5 mx-auto transition-transform duration-200
              ${!prefersReducedMotion ? 'group-hover:animate-bounce' : ''}
            `} 
          />
        </button>

        {/* Loading Progress Bar - Simplified */}
        <div 
          className={`
            fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 z-50
            transition-transform duration-200 origin-left
            ${isPageTransitioning ? 'transform scale-x-100' : 'transform scale-x-0'}
          `} 
        />
      </div>
    </ErrorBoundary>
  );
};

export default MainLayout;
