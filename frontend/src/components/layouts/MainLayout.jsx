import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronUp, Sparkles } from 'lucide-react';

// Components
import Header from '../common/Header';
import Footer from '../common/Footer';
import ErrorBoundary from '../common/ErrorBoundary';

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
  '/toast-demo': {
    title: 'Toast Demo - ShoeMarkNet',
    description: 'Interactive demonstration of premium toast notifications.',
    background: 'gradient-demo'
  }
};

const MainLayout = () => {
  const location = useLocation();
  const layoutRef = useRef(null);
  const backgroundRef = useRef(null);
  const scrollButtonRef = useRef(null);
  const sparklesRef = useRef(null);
  
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('theme') || 
           (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  // Get current route config
  const currentRoute = ROUTE_CONFIG[location.pathname] || {
    title: 'ShoeMarkNet',
    description: 'Premium footwear online',
    background: 'gradient-primary'
  };

  // Enhanced scroll handling with GSAP
  useEffect(() => {
    let scrollTrigger;
    
    const handleScroll = () => {
      const scrollY = window.pageYOffset;
      setShowScrollTop(scrollY > 400);
      
      // Parallax background effect
      if (backgroundRef.current) {
        gsap.to(backgroundRef.current, {
          y: scrollY * 0.3,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    };

    // Smooth scroll animations for elements
    scrollTrigger = ScrollTrigger.create({
      trigger: layoutRef.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const velocity = self.getVelocity();
        
        // Add blur effect during fast scrolling
        if (Math.abs(velocity) > 1000) {
          gsap.to(layoutRef.current, {
            filter: 'blur(2px)',
            duration: 0.1
          });
        } else {
          gsap.to(layoutRef.current, {
            filter: 'blur(0px)',
            duration: 0.3
          });
        }
      }
    });

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      scrollTrigger?.kill();
    };
  }, []);

  // Page transition animations
  useEffect(() => {
    setIsPageTransitioning(true);
    
    // Animate page entrance
    gsap.fromTo('.page-content', 
      { 
        opacity: 0, 
        y: 30,
        filter: 'blur(10px)'
      },
      { 
        opacity: 1, 
        y: 0,
        filter: 'blur(0px)',
        duration: 0.6,
        ease: 'power3.out',
        onComplete: () => setIsPageTransitioning(false)
      }
    );

    // Animate background gradient change
    if (backgroundRef.current) {
      gsap.to(backgroundRef.current, {
        opacity: 0.8,
        duration: 0.8,
        ease: 'power2.inOut'
      });
    }
  }, [location.pathname]);

  // Floating sparkles animation
  useEffect(() => {
    if (sparklesRef.current) {
      const sparkles = sparklesRef.current.children;
      
      Array.from(sparkles).forEach((sparkle, index) => {
        gsap.to(sparkle, {
          y: -20,
          rotation: 360,
          opacity: 0.6,
          duration: 3 + index * 0.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: index * 0.3
        });
      });
    }
  }, []);

  // Theme change handler
  useEffect(() => {
    const handleThemeChange = () => {
      const newTheme = localStorage.getItem('theme') || 
                      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      setCurrentTheme(newTheme);
      
      // Animate theme transition
      gsap.to(layoutRef.current, {
        opacity: 0.3,
        duration: 0.2,
        onComplete: () => {
          gsap.to(layoutRef.current, {
            opacity: 1,
            duration: 0.3
          });
        }
      });
    };

    window.addEventListener('storage', handleThemeChange);
    const observer = new MutationObserver(() => {
      handleThemeChange();
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      window.removeEventListener('storage', handleThemeChange);
      observer.disconnect();
    };
  }, []);

  // Enhanced scroll to top with premium animation
  const scrollToTop = () => {
    // Button click animation
    gsap.to(scrollButtonRef.current, {
      scale: 0.9,
      duration: 0.1,
      yoyo: true,
      repeat: 1
    });

    // Smooth scroll with custom easing
    const scrollDuration = 1.2;
    const startTime = performance.now();
    const startScrollTop = window.pageYOffset;
    
    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / (scrollDuration * 1000), 1);
      
      // Custom easing function (power3.inOut)
      const easeProgress = progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      window.scrollTo(0, startScrollTop * (1 - easeProgress));
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };
    
    requestAnimationFrame(animateScroll);
  };

  return (
    <ErrorBoundary>
      <Helmet>
        <title>{currentRoute.title}</title>
        <meta name="description" content={currentRoute.description} />
        <meta name="theme-color" content={currentTheme === 'dark' ? '#0f172a' : '#ffffff'} />
      </Helmet>

      <div 
        ref={layoutRef}
        className={`
          relative flex flex-col min-h-screen overflow-hidden
          ${currentTheme === 'dark' 
            ? 'bg-gray-900 text-white' 
            : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 text-gray-900'
          }
          transition-colors duration-500
        `}
      >
        {/* Animated Background Layers */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {/* Primary gradient background */}
          <div 
            ref={backgroundRef}
            className={`
              absolute inset-0 opacity-70
              ${currentRoute.background === 'gradient-primary' 
                ? 'bg-gradient-to-br from-blue-400/20 via-purple-500/20 to-pink-500/20'
                : currentRoute.background === 'gradient-secondary'
                ? 'bg-gradient-to-br from-green-400/20 via-blue-500/20 to-purple-500/20'
                : currentRoute.background === 'gradient-tertiary'
                ? 'bg-gradient-to-br from-pink-400/20 via-red-500/20 to-orange-500/20'
                : currentRoute.background === 'gradient-quaternary'
                ? 'bg-gradient-to-br from-purple-400/20 via-pink-500/20 to-red-500/20'
                : currentRoute.background === 'gradient-demo'
                ? 'bg-gradient-to-br from-indigo-400/20 via-purple-500/20 to-cyan-500/20'
                : 'bg-gradient-to-br from-blue-400/20 via-purple-500/20 to-pink-500/20'
              }
              dark:opacity-30
            `}
          />
          
          {/* Animated mesh gradient overlay */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-6000" />
          </div>

          {/* Floating sparkles */}
          <div 
            ref={sparklesRef}
            className="absolute inset-0 pointer-events-none"
          >
            {[...Array(8)].map((_, i) => (
              <Sparkles
                key={i}
                className={`
                  absolute w-4 h-4 text-purple-400/40 
                  ${i % 2 === 0 ? 'top-1/4' : 'top-3/4'}
                  ${i % 3 === 0 ? 'left-1/4' : i % 3 === 1 ? 'left-1/2' : 'left-3/4'}
                `}
                style={{
                  left: `${20 + (i * 10)}%`,
                  top: `${10 + (i * 8)}%`,
                  transform: `rotate(${i * 45}deg)`
                }}
              />
            ))}
          </div>
        </div>

        {/* Header with proper z-index */}
        <div className="relative z-30">
          <Header />
        </div>

        {/* Main Content Container */}
        <main className="relative z-20 flex-grow pt-20">
          {/* Page transition overlay */}
          <div 
            className={`
              fixed inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm
              transition-all duration-500 pointer-events-none z-40
              ${isPageTransitioning ? 'opacity-100' : 'opacity-0'}
            `}
          />
          
          {/* Content wrapper with glassmorphism effect */}
          <div className="page-content relative">
            <Outlet />
          </div>
        </main>

        {/* Footer with enhanced styling */}
        <div className="relative z-20">
          <Footer />
        </div>

        {/* Premium Scroll to Top Button */}
        <button
          ref={scrollButtonRef}
          onClick={scrollToTop}
          className={`
            fixed bottom-8 right-8 w-14 h-14 z-50
            bg-gradient-to-r from-blue-500 to-purple-600 
            hover:from-blue-600 hover:to-purple-700
            dark:from-blue-400 dark:to-purple-500
            text-white rounded-full shadow-2xl
            backdrop-blur-lg border border-white/20
            transition-all duration-300 transform 
            hover:scale-110 hover:rotate-12
            group overflow-hidden
            ${showScrollTop 
              ? 'opacity-100 translate-y-0 pointer-events-auto' 
              : 'opacity-0 translate-y-4 pointer-events-none'
            }
          `}
          aria-label="Scroll to top"
        >
          {/* Button gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Icon with animation */}
          <ChevronUp className="w-6 h-6 relative z-10 group-hover:animate-bounce transition-transform duration-200" />
          
          {/* Ripple effect */}
          <div className="absolute inset-0 rounded-full bg-white/30 scale-0 group-active:scale-100 transition-transform duration-200" />
        </button>

        {/* Loading Progress Bar */}
        <div className={`
          fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 z-50
          transition-transform duration-300 origin-left
          ${isPageTransitioning ? 'transform scale-x-100' : 'transform scale-x-0'}
        `} />

        {/* Theme-aware cursor trail effect */}
        <div className="fixed inset-0 pointer-events-none z-10">
          <div className="cursor-trail opacity-20" />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default MainLayout;
