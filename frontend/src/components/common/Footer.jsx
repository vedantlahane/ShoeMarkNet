import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

// Redux actions
import { subscribeNewsletter } from '../../redux/slices/newsletterSlice';
import { trackFooterInteraction } from '../../redux/slices/analyticsSlice';

// Components
import LoadingSpinner from './LoadingSpinner';
import SocialMediaButtons from './SocialMediaButtons';
import PaymentMethods from './PaymentMethods';
import BackToTopButton from './BackToTopButton';

// Hooks
import useLocalStorage from '../../hooks/useLocalStorage';
import useWebSocket from '../../hooks/useWebSocket';
import useNetworkStatus from '../../hooks/useNetworkStatus';

// Utils
import { trackEvent } from '../../utils/analytics';
import { validateEmail } from '../../utils/validation';
import { formatCurrency } from '../../utils/helpers';

// Constants
const SOCIAL_LINKS = [
  { name: 'Facebook', url: 'https://facebook.com/shoemarknet', icon: 'fab fa-facebook-f', color: 'hover:text-blue-500' },
  { name: 'Twitter', url: 'https://twitter.com/shoemarknet', icon: 'fab fa-twitter', color: 'hover:text-blue-400' },
  { name: 'Instagram', url: 'https://instagram.com/shoemarknet', icon: 'fab fa-instagram', color: 'hover:text-pink-500' },
  { name: 'LinkedIn', url: 'https://linkedin.com/company/shoemarknet', icon: 'fab fa-linkedin-in', color: 'hover:text-blue-600' },
  { name: 'YouTube', url: 'https://youtube.com/shoemarknet', icon: 'fab fa-youtube', color: 'hover:text-red-500' },
  { name: 'TikTok', url: 'https://tiktok.com/@shoemarknet', icon: 'fab fa-tiktok', color: 'hover:text-gray-800' }
];

const PAYMENT_METHODS = [
  { name: 'Visa', image: '/images/payments/visa.svg', alt: 'Visa' },
  { name: 'Mastercard', image: '/images/payments/mastercard.svg', alt: 'Mastercard' },
  { name: 'PayPal', image: '/images/payments/paypal.svg', alt: 'PayPal' },
  { name: 'American Express', image: '/images/payments/amex.svg', alt: 'American Express' },
  { name: 'Apple Pay', image: '/images/payments/apple-pay.svg', alt: 'Apple Pay' },
  { name: 'Google Pay', image: '/images/payments/google-pay.svg', alt: 'Google Pay' },
  { name: 'Stripe', image: '/images/payments/stripe.svg', alt: 'Stripe' },
  { name: 'Crypto', image: '/images/payments/crypto.svg', alt: 'Cryptocurrency' }
];

const FOOTER_SECTIONS = {
  company: {
    title: 'Company',
    links: [
      { name: 'About Us', path: '/about', icon: 'fas fa-info-circle' },
      { name: 'Our Story', path: '/our-story', icon: 'fas fa-book-open' },
      { name: 'Careers', path: '/careers', icon: 'fas fa-briefcase' },
      { name: 'Press', path: '/press', icon: 'fas fa-newspaper' },
      { name: 'Investors', path: '/investors', icon: 'fas fa-chart-line' }
    ]
  },
  shop: {
    title: 'Shop',
    links: [
      { name: 'All Products', path: '/products', icon: 'fas fa-shopping-bag' },
      { name: 'New Arrivals', path: '/products?filter=new', icon: 'fas fa-star' },
      { name: 'Best Sellers', path: '/products?filter=bestsellers', icon: 'fas fa-fire' },
      { name: 'Sale', path: '/products?filter=sale', icon: 'fas fa-percentage' },
      { name: 'Gift Cards', path: '/gift-cards', icon: 'fas fa-gift' }
    ]
  },
  support: {
    title: 'Customer Support',
    links: [
      { name: 'Help Center', path: '/help', icon: 'fas fa-question-circle' },
      { name: 'Contact Us', path: '/contact', icon: 'fas fa-envelope' },
      { name: 'Live Chat', path: '/chat', icon: 'fas fa-comments' },
      { name: 'Size Guide', path: '/size-guide', icon: 'fas fa-ruler' },
      { name: 'Order Tracking', path: '/track-order', icon: 'fas fa-map-marker-alt' }
    ]
  },
  policies: {
    title: 'Policies',
    links: [
      { name: 'Shipping Policy', path: '/shipping-policy', icon: 'fas fa-truck' },
      { name: 'Return Policy', path: '/return-policy', icon: 'fas fa-undo' },
      { name: 'Privacy Policy', path: '/privacy-policy', icon: 'fas fa-shield-alt' },
      { name: 'Terms of Service', path: '/terms-of-service', icon: 'fas fa-file-contract' },
      { name: 'Cookie Policy', path: '/cookie-policy', icon: 'fas fa-cookie-bite' }
    ]
  }
};

const Footer = ({ currentRoute, isOnline, performanceMetrics }) => {
  const location = useLocation();
  const dispatch = useDispatch();

  // Redux state
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const { stats } = useSelector(state => state.analytics);
  const { isSubscribing, subscriptionStatus } = useSelector(state => state.newsletter);

  // Hooks
  const { isConnected } = useWebSocket('/footer');
  const { connectionType } = useNetworkStatus();

  // Local state
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [animateFooter, setAnimateFooter] = useState(false);
  const [showNewsletter, setShowNewsletter] = useLocalStorage('showNewsletterSignup', true);
  const [visitCount, setVisitCount] = useLocalStorage('visitCount', 0);
  const [lastVisit, setLastVisit] = useLocalStorage('lastVisit', null);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [currentYear] = useState(new Date().getFullYear());

  // Refs
  const footerRef = useRef(null);
  const newsletterFormRef = useRef(null);

  // Initialize footer
  useEffect(() => {
    setTimeout(() => setAnimateFooter(true), 500);
    
    // Update visit tracking
    setVisitCount(prev => prev + 1);
    setLastVisit(new Date().toISOString());
    
    // Track footer view
    trackEvent('footer_viewed', {
      page: location.pathname,
      is_authenticated: isAuthenticated,
      visit_count: visitCount + 1,
      connection_type: connectionType
    });
  }, [location.pathname, isAuthenticated, visitCount, connectionType, setVisitCount, setLastVisit]);

  // Enhanced newsletter subscription
  const handleNewsletterSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Validate email
    if (!email) {
      setEmailError('Email address is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    setEmailError('');
    
    try {
      await dispatch(subscribeNewsletter({ 
        email, 
        source: 'footer',
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        page: location.pathname
      })).unwrap();
      
      toast.success('🎉 Successfully subscribed to our newsletter!');
      setEmail('');
      setShowNewsletter(false);
      
      trackEvent('newsletter_subscribed', {
        email_domain: email.split('@')[1],
        source: 'footer',
        page: location.pathname,
        is_authenticated: isAuthenticated
      });
      
    } catch (error) {
      toast.error(error.message || 'Failed to subscribe. Please try again.');
      setEmailError('Subscription failed. Please try again.');
    }
  }, [email, dispatch, location.pathname, isAuthenticated, setShowNewsletter]);

  // Handle social media clicks
  const handleSocialClick = useCallback((platform, url) => {
    trackEvent('social_media_clicked', {
      platform,
      url,
      source: 'footer',
      page: location.pathname
    });
    
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [location.pathname]);

  // Handle footer link clicks
  const handleLinkClick = useCallback((linkName, linkPath, section) => {
    trackEvent('footer_link_clicked', {
      link_name: linkName,
      link_path: linkPath,
      section,
      page: location.pathname,
      is_authenticated: isAuthenticated
    });
  }, [location.pathname, isAuthenticated]);

  // Company info with dynamic content
  const companyInfo = useMemo(() => ({
    name: 'ShoeMarkNet',
    tagline: 'Your one-stop destination for premium footwear.',
    description: 'Quality, style, and comfort in every step. Discover the perfect shoes for every occasion.',
    stats: {
      customers: '50,000+',
      products: '10,000+',
      brands: '500+',
      countries: '25+'
    },
    contact: {
      phone: '+1 (555) 123-4567',
      email: 'support@shoemarknet.com',
      address: '123 Fashion Street, Style City, SC 12345'
    }
  }), []);

  // Get current page info for breadcrumb
  const currentPageInfo = useMemo(() => {
    const path = location.pathname;
    if (path === '/') return 'Home';
    if (path.startsWith('/products')) return 'Products';
    if (path.startsWith('/admin')) return 'Admin';
    return path.slice(1).charAt(0).toUpperCase() + path.slice(2);
  }, [location.pathname]);

  return (
    <footer 
      ref={footerRef}
      className="relative bg-gray-900/95 backdrop-blur-xl border-t border-gray-700/50 text-white overflow-hidden"
      id="footer"
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/10 via-purple-900/10 to-pink-900/10"></div>
        
        {/* Animated Background Elements */}
        {animateFooter && (
          <div className="absolute inset-0">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full animate-float opacity-10"
                style={{
                  width: `${50 + Math.random() * 100}px`,
                  height: `${50 + Math.random() * 100}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  background: `linear-gradient(45deg, 
                    hsl(${200 + Math.random() * 160}, 60%, 60%), 
                    hsl(${200 + Math.random() * 160}, 60%, 80%))`,
                  animationDelay: `${Math.random() * 10}s`,
                  animationDuration: `${15 + Math.random() * 10}s`
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="relative z-10">
        
        {/* Newsletter Banner */}
        {showNewsletter && (
          <div className={`bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 py-6 ${
            animateFooter ? 'animate-slide-down' : 'opacity-0'
          }`}>
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left">
                  <h3 className="text-xl font-bold text-white mb-1">
                    <i className="fas fa-envelope mr-2"></i>
                    Stay in the Loop!
                  </h3>
                  <p className="text-blue-100">
                    Get exclusive deals, new arrivals, and style tips delivered to your inbox.
                  </p>
                </div>
                
                <form 
                  ref={newsletterFormRef}
                  onSubmit={handleNewsletterSubmit} 
                  className="flex flex-col sm:flex-row gap-3 min-w-0 md:min-w-96"
                >
                  <div className="relative flex-1">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200"
                      disabled={isSubscribing}
                    />
                    {emailError && (
                      <p className="absolute -bottom-6 left-0 text-red-200 text-xs">
                        <i className="fas fa-exclamation-triangle mr-1"></i>
                        {emailError}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isSubscribing || !email}
                      className="bg-white/20 backdrop-blur-lg border border-white/30 hover:bg-white/30 text-white font-semibold px-6 py-3 rounded-2xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isSubscribing ? (
                        <LoadingSpinner size="small" color="white" />
                      ) : (
                        <>
                          <i className="fas fa-paper-plane mr-2"></i>
                          Subscribe
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setShowNewsletter(false)}
                      className="w-12 h-12 bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20 rounded-2xl flex items-center justify-center text-white/70 hover:text-white transition-all duration-200"
                      title="Dismiss newsletter signup"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Main Footer Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            
            {/* Enhanced Company Info */}
            <div className={`lg:col-span-2 ${animateFooter ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <div className="mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
                  {companyInfo.name}
                </h3>
                <p className="text-gray-400 mb-4 leading-relaxed">
                  {companyInfo.description}
                </p>
                
                {/* Company Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {Object.entries(companyInfo.stats).map(([key, value], index) => (
                    <div key={key} className="text-center bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-3">
                      <div className="text-lg font-bold text-white">{value}</div>
                      <div className="text-xs text-gray-400 capitalize">{key}</div>
                    </div>
                  ))}
                </div>
                
                {/* Contact Toggle */}
                <button
                  onClick={() => setShowContactInfo(!showContactInfo)}
                  className="flex items-center text-gray-400 hover:text-white transition-colors duration-200 mb-4"
                >
                  <i className={`fas ${showContactInfo ? 'fa-chevron-up' : 'fa-chevron-down'} mr-2`}></i>
                  Contact Information
                </button>
                
                {/* Contact Info (Collapsible) */}
                {showContactInfo && (
                  <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4 space-y-2 animate-fade-in">
                    <div className="flex items-center text-sm text-gray-400">
                      <i className="fas fa-phone mr-3 w-4"></i>
                      <a href={`tel:${companyInfo.contact.phone}`} className="hover:text-white transition-colors">
                        {companyInfo.contact.phone}
                      </a>
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <i className="fas fa-envelope mr-3 w-4"></i>
                      <a href={`mailto:${companyInfo.contact.email}`} className="hover:text-white transition-colors">
                        {companyInfo.contact.email}
                      </a>
                    </div>
                    <div className="flex items-start text-sm text-gray-400">
                      <i className="fas fa-map-marker-alt mr-3 w-4 mt-0.5"></i>
                      <span>{companyInfo.contact.address}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Enhanced Social Media */}
              <div>
                <h4 className="text-lg font-semibold mb-4 flex items-center">
                  <i className="fas fa-share-alt mr-2 text-blue-400"></i>
                  Follow Us
                </h4>
                <div className="flex flex-wrap gap-3">
                  {SOCIAL_LINKS.map((social, index) => (
                    <button
                      key={social.name}
                      onClick={() => handleSocialClick(social.name, social.url)}
                      className={`w-12 h-12 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl flex items-center justify-center text-gray-400 ${social.color} transition-all duration-200 transform hover:scale-110 hover:bg-white/20 ${
                        animateFooter ? 'animate-fade-in-up' : 'opacity-0'
                      }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                      title={`Follow us on ${social.name}`}
                    >
                      <i className={social.icon}></i>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Enhanced Footer Sections */}
            {Object.entries(FOOTER_SECTIONS).map(([sectionKey, section], sectionIndex) => (
              <div 
                key={sectionKey}
                className={`${animateFooter ? 'animate-fade-in-up' : 'opacity-0'}`}
                style={{ animationDelay: `${(sectionIndex + 1) * 0.2}s` }}
              >
                <h4 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                  {section.title}
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={link.name}>
                      <Link
                        to={link.path}
                        onClick={() => handleLinkClick(link.name, link.path, section.title)}
                        className="group flex items-center text-gray-400 hover:text-white transition-all duration-200 transform hover:translate-x-1"
                      >
                        <i className={`${link.icon} mr-3 w-4 text-blue-400 group-hover:text-white transition-colors duration-200`}></i>
                        <span className="group-hover:underline">{link.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Bottom Section */}
        <div className="border-t border-gray-800/50 bg-gray-900/50 backdrop-blur-lg">
          <div className="container mx-auto px-4 py-8">
            
            {/* Payment Methods */}
            <div className={`mb-8 ${animateFooter ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '1.2s' }}>
              <h4 className="text-lg font-semibold mb-4 text-center flex items-center justify-center">
                <i className="fas fa-credit-card mr-2 text-green-400"></i>
                Secure Payment Methods
              </h4>
              <div className="flex flex-wrap justify-center items-center gap-4">
                {PAYMENT_METHODS.map((method, index) => (
                  <div
                    key={method.name}
                    className="w-12 h-8 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg flex items-center justify-center p-1 hover:bg-white/20 transition-all duration-200 transform hover:scale-110"
                    title={`Pay with ${method.name}`}
                  >
                    <img
                      src={method.image}
                      alt={method.alt}
                      className="max-w-full max-h-full object-contain filter brightness-0 invert opacity-70 hover:opacity-100 transition-opacity duration-200"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Copyright and Additional Info */}
            <div className={`flex flex-col md:flex-row justify-between items-center gap-4 ${
              animateFooter ? 'animate-fade-in-up' : 'opacity-0'
            }`} style={{ animationDelay: '1.4s' }}>
              
              {/* Copyright */}
              <div className="text-center md:text-left">
                <p className="text-gray-400 text-sm flex items-center justify-center md:justify-start">
                  <i className="fas fa-copyright mr-2"></i>
                  {currentYear} {companyInfo.name}. All rights reserved.
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Built with ❤️ using React & Modern Web Technologies
                </p>
              </div>

              {/* Status Indicators */}
              <div className="flex items-center space-x-4 text-xs">
                
                {/* Online Status */}
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                  <span className="text-gray-400">
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>

                {/* Performance Indicator */}
                {performanceMetrics?.score && (
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      performanceMetrics.score > 80 ? 'bg-green-400' : 
                      performanceMetrics.score > 60 ? 'bg-yellow-400' : 'bg-red-400'
                    }`}></div>
                    <span className="text-gray-400">
                      Performance: {performanceMetrics.score}
                    </span>
                  </div>
                )}

                {/* Last Updated */}
                <div className="text-gray-500">
                  <i className="fas fa-clock mr-1"></i>
                  Updated {currentPageInfo}
                </div>
              </div>
            </div>

            {/* Additional Links */}
            <div className={`mt-6 pt-6 border-t border-gray-800/30 text-center ${
              animateFooter ? 'animate-fade-in-up' : 'opacity-0'
            }`} style={{ animationDelay: '1.6s' }}>
              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
                <Link to="/sitemap" className="hover:text-white transition-colors">
                  <i className="fas fa-sitemap mr-1"></i>
                  Sitemap
                </Link>
                <Link to="/accessibility" className="hover:text-white transition-colors">
                  <i className="fas fa-universal-access mr-1"></i>
                  Accessibility
                </Link>
                <Link to="/security" className="hover:text-white transition-colors">
                  <i className="fas fa-shield-alt mr-1"></i>
                  Security
                </Link>
                <a 
                  href="mailto:legal@shoemarknet.com" 
                  className="hover:text-white transition-colors"
                >
                  <i className="fas fa-gavel mr-1"></i>
                  Legal
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <BackToTopButton />

      {/* Enhanced Custom Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg) scale(1); 
          }
          25% { 
            transform: translateY(-15px) rotate(2deg) scale(1.05); 
          }
          50% { 
            transform: translateY(-8px) rotate(-1deg) scale(0.95); 
          }
          75% { 
            transform: translateY(-12px) rotate(1deg) scale(1.02); 
          }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .animate-slide-down {
          animation: slide-down 0.6s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
        
        /* Enhanced scrollbar for newsletter */
        .newsletter-form::-webkit-scrollbar {
          width: 4px;
        }
        
        .newsletter-form::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .newsletter-form::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .animate-float,
          .animate-fade-in-up,
          .animate-slide-down {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }
        
        /* High contrast mode */
        @media (prefers-contrast: high) {
          .bg-white\/10 {
            background: rgba(255, 255, 255, 0.2) !important;
            border: 1px solid rgba(255, 255, 255, 0.4) !important;
          }
        }
        
        /* Print styles */
        @media print {
          .animate-float,
          .animate-fade-in-up {
            display: none;
          }
          
          footer {
            background: white !important;
            color: black !important;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
