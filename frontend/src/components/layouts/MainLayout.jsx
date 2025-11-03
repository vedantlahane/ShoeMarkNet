import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import PageMeta from '../seo/PageMeta';
import { ChevronUp } from 'lucide-react';

import Header from '../common/Header';
import Footer from '../common/Footer';

import useReducedMotion from '../../hooks/useReducedMotion';

const ROUTE_CONFIG = {
  '/': {
    title: 'ShoeMarkNet - Premium Footwear Collection',
    description:
      'Discover premium sneakers and footwear with exclusive designs and unbeatable comfort.',
    background: 'gradient-primary',
  },
  '/products': {
    title: 'Premium Products - ShoeMarkNet',
    description:
      'Browse our curated collection of premium sneakers and athletic footwear.',
    background: 'gradient-secondary',
  },
  '/sale': {
    title: 'Exclusive Deals - ShoeMarkNet',
    description:
      'Shop limited-time offers and discounted footwear from top brands.',
    background: 'gradient-tertiary',
  },
  '/cart': {
    title: 'Shopping Cart - ShoeMarkNet',
    description: 'Review your selected items and complete your purchase.',
    background: 'gradient-tertiary',
  },
  '/wishlist': {
    title: 'My Wishlist - ShoeMarkNet',
    description: 'Your saved favorite products and future purchases.',
    background: 'gradient-quaternary',
  },
  '/orders': {
    title: 'Order History - ShoeMarkNet',
    description: 'Track and manage your orders.',
    background: 'gradient-primary',
  },
  '/logout': {
    title: 'Signing Out • ShoeMarkNet',
    description:
      'Securely ending your session and keeping your account protected.',
    background: 'gradient-tertiary',
  },
  '/access-denied': {
    title: 'Access Restricted • ShoeMarkNet',
    description:
      'Your current role does not have permission to view this page.',
    background: 'gradient-tertiary',
  },
};


const MainLayout = () => {
  const location = useLocation();
  const scrollButtonRef = useRef(null);

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);

  const prefersReducedMotion = useReducedMotion();

  const currentRoute = ROUTE_CONFIG[location.pathname] || {
    title: 'ShoeMarkNet',
    description: 'Premium footwear online',
    background: 'gradient-primary',
  };

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsPageTransitioning(false);
      return;
    }

    setIsPageTransitioning(true);
    const timeout = window.setTimeout(() => {
      setIsPageTransitioning(false);
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [location.pathname, prefersReducedMotion]);

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

  const scrollToTop = () => {
    if (prefersReducedMotion) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      <PageMeta
        title={currentRoute.title}
        description={currentRoute.description}
      />

      <div className="relative flex min-h-screen max-w-screen flex-col overflow-x-hidden bg-white text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100 ">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div
            className={`absolute inset-0 bg-gradient-to-br opacity-30`}
          />

          {!prefersReducedMotion && (
            <div className="absolute inset-0 opacity-15">
              <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-purple-300 mix-blend-multiply blur-3xl opacity-20 dark:bg-purple-400/60 animate-pulse" />
              <div
                className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-blue-300 mix-blend-multiply blur-3xl opacity-20 dark:bg-blue-400/60 animate-pulse"
                style={{ animationDelay: '2s' }}
              />
            </div>
          )}
        </div>

        <div className="relative z-30">
          <Header />
        </div>

        <main className="relative z-20  flex-grow">
          <div
            className={`pointer-events-none fixed inset-0 z-40 bg-white/70 transition-opacity duration-300 dark:bg-slate-950/70 ${
              isPageTransitioning ? 'opacity-100' : 'opacity-0'
            }`}
          />

          <div className="page-content relative w-full">
            <Outlet />
          </div>
        </main>

        <div className="relative z-20">
          <Footer />
        </div>

        <button
          ref={scrollButtonRef}
          onClick={scrollToTop}
          className={`fixed bottom-8 right-8 z-50 h-12 w-12 rounded-full border border-white/40 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-blue-600 hover:to-purple-700 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:border-slate-700/60 dark:from-blue-400 dark:to-purple-500 dark:hover:from-blue-500 dark:hover:to-purple-600 dark:focus:ring-offset-slate-950 ${
            showScrollTop
              ? 'pointer-events-auto translate-y-0 opacity-100'
              : 'pointer-events-none translate-y-4 opacity-0'
          } group`}
          aria-label="Scroll to top"
          type="button"
        >
          <ChevronUp
            className={`h-5 w-5 mx-auto transition-transform duration-200 ${
              !prefersReducedMotion ? 'group-hover:translate-y-[-4px]' : ''
            }`}
          />
        </button>

        <div
          className={`fixed left-0 right-0 top-0 z-50 h-1 transform bg-gradient-to-r from-blue-500 to-purple-600 transition-transform duration-200 ${
            isPageTransitioning ? 'scale-x-100' : 'scale-x-0'
          }`}
        />
      </div>
    </>
  );
};

export default MainLayout;
