import React, { useRef, useEffect, useState, useCallback, memo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Linkedin,
  ArrowUp,
  Heart,
  Shield,
  Truck,
  CreditCard
} from 'lucide-react';
import { showSuccessToast, showErrorToast } from '../../utils/toast.jsx';

gsap.registerPlugin(ScrollTrigger);

const Footer = memo(() => {
  const footerRef = useRef(null);
  const gsapContextRef = useRef(null);
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;
    
    gsapContextRef.current = gsap.context(() => {
      // Footer entrance animation
      gsap.set(footer.children, { y: 30, opacity: 0 });
      
      ScrollTrigger.create({
        trigger: footer,
        start: "top bottom-=100",
        onEnter: () => {
          gsap.to(footer.children, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out"
          });
        }
      });
    }, footerRef);

    return () => {
      if (gsapContextRef.current) {
        gsapContextRef.current.revert();
      }
    };
  }, []);

  const handleNewsletterSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!email) {
      showErrorToast('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showErrorToast('Please enter a valid email address');
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubscribed(true);
      showSuccessToast('Welcome to our newsletter! Check your email for exclusive offers.');
      setEmail('');
    } catch (error) {
      showErrorToast('Failed to subscribe. Please try again.');
    }
  }, [email]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  const footerLinks = {
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Our Story', href: '/story' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press', href: '/press' },
      { name: 'Blog', href: '/blog' }
    ],
    help: [
      { name: 'Customer Service', href: '/support' },
      { name: 'Size Guide', href: '/size-guide' },
      { name: 'Shipping Info', href: '/shipping' },
      { name: 'Returns', href: '/returns' },
      { name: 'FAQ', href: '/faq' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Accessibility', href: '/accessibility' }
    ]
  };

  const socialLinks = [
    { 
      icon: Facebook, 
      href: 'https://facebook.com/shoemarknet', 
      name: 'Facebook',
      followers: '2.5M'
    },
    { 
      icon: Instagram, 
      href: 'https://instagram.com/shoemarknet', 
      name: 'Instagram',
      followers: '1.8M'
    },
    { 
      icon: Twitter, 
      href: 'https://twitter.com/shoemarknet', 
      name: 'Twitter',
      followers: '890K'
    },
    { 
      icon: Youtube, 
      href: 'https://youtube.com/shoemarknet', 
      name: 'YouTube',
      followers: '650K'
    },
    { 
      icon: Linkedin, 
      href: 'https://linkedin.com/company/shoemarknet', 
      name: 'LinkedIn',
      followers: '320K'
    }
  ];

  const features = [
    { icon: Truck, text: 'Free Shipping Over $100' },
    { icon: Shield, text: '30-Day Returns' },
    { icon: CreditCard, text: 'Secure Payments' }
  ];

  return (
    <footer 
      ref={footerRef} 
      className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden"
      role="contentinfo"
      aria-label="Site footer"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10" aria-hidden="true">
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Glass overlay */}
      <div className="absolute inset-0 glass-dark" aria-hidden="true"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Features Banner */}
        <div className="py-8 border-b border-gray-700/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center justify-center space-x-3 text-center">
                <feature.icon className="h-6 w-6 text-blue-400" aria-hidden="true" />
                <span className="text-gray-300 font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-xl font-bold" aria-hidden="true">S</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  ShoeMarkNet
                </span>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Premium footwear for every step of your journey. Quality, comfort, and style in every pair.
              </p>
              
              {/* Contact Cards */}
              <div className="space-y-4">
                <div className="glass p-3 rounded-lg hover:bg-white/10 transition-all duration-300 group">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-blue-400 group-hover:scale-110 transition-transform duration-300" aria-hidden="true" />
                    <a 
                      href="mailto:support@shoemarknet.com" 
                      className="text-gray-300 hover:text-blue-400 transition-colors duration-300"
                      aria-label="Email support"
                    >
                      support@shoemarknet.com
                    </a>
                  </div>
                </div>
                <div className="glass p-3 rounded-lg hover:bg-white/10 transition-all duration-300 group">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-green-400 group-hover:scale-110 transition-transform duration-300" aria-hidden="true" />
                    <a 
                      href="tel:+15551234567" 
                      className="text-gray-300 hover:text-green-400 transition-colors duration-300"
                      aria-label="Call support"
                    >
                      +1 (555) 123-4567
                    </a>
                  </div>
                </div>
                <div className="glass p-3 rounded-lg hover:bg-white/10 transition-all duration-300 group">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-red-400 group-hover:scale-110 transition-transform duration-300" aria-hidden="true" />
                    <span className="text-gray-300">123 Fashion Ave, NY 10001</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Links Sections */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-8">
              <nav aria-label="Company links">
                <h3 className="text-lg font-semibold mb-6 text-white">Company</h3>
                <ul className="space-y-3">
                  {footerLinks.company.map((link, index) => (
                    <li key={index}>
                      <a 
                        href={link.href} 
                        className="text-gray-300 hover:text-blue-400 transition-colors duration-300 hover:translate-x-1 inline-block focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <nav aria-label="Help and support links">
                <h3 className="text-lg font-semibold mb-6 text-white">Help</h3>
                <ul className="space-y-3">
                  {footerLinks.help.map((link, index) => (
                    <li key={index}>
                      <a 
                        href={link.href} 
                        className="text-gray-300 hover:text-blue-400 transition-colors duration-300 hover:translate-x-1 inline-block focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <nav aria-label="Legal links">
                <h3 className="text-lg font-semibold mb-6 text-white">Legal</h3>
                <ul className="space-y-3">
                  {footerLinks.legal.map((link, index) => (
                    <li key={index}>
                      <a 
                        href={link.href} 
                        className="text-gray-300 hover:text-blue-400 transition-colors duration-300 hover:translate-x-1 inline-block focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Newsletter Section */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold mb-6 text-white">Stay Updated</h3>
              
              {!isSubscribed ? (
                <form onSubmit={handleNewsletterSubmit} className="mb-8">
                  <div className="glass rounded-lg p-2">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <label htmlFor="newsletter-email" className="sr-only">
                        Email address for newsletter
                      </label>
                      <input
                        id="newsletter-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full sm:flex-1 bg-transparent px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg sm:rounded-l-lg sm:rounded-r-none"
                        aria-describedby="newsletter-description"
                      />
                      <button
                        type="submit"
                        className="btn-premium px-6 py-3 rounded-lg sm:rounded-r-lg sm:rounded-l-none font-medium w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                        aria-label="Subscribe to newsletter"
                      >
                        Subscribe
                      </button>
                    </div>
                  </div>
                  <p id="newsletter-description" className="text-xs text-gray-400 mt-2">
                    Get exclusive deals and early access to new releases
                  </p>
                </form>
              ) : (
                <div className="glass rounded-lg p-6 mb-8 text-center">
                  <Heart className="h-8 w-8 text-red-400 mx-auto mb-3" aria-hidden="true" />
                  <p className="text-green-400 font-medium">Thanks for subscribing!</p>
                  <p className="text-gray-300 text-sm mt-1">Check your email for exclusive offers</p>
                </div>
              )}

              {/* Social Media */}
              <div>
                <h4 className="text-white font-medium mb-4">Follow Us</h4>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3" role="list" aria-label="Social media links">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      className="glass p-3 rounded-lg hover:bg-white/10 transition-all duration-300 group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                      aria-label={`Follow us on ${social.name} - ${social.followers} followers`}
                      target="_blank"
                      rel="noopener noreferrer"
                      role="listitem"
                    >
                      <social.icon className="h-5 w-5 text-gray-300 group-hover:text-white group-hover:scale-110 transition-all duration-300 mx-auto" />
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-all duration-300"></div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="py-8 border-t border-gray-700/50 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 sm:mb-0">
            © 2025 ShoeMarkNet. All rights reserved. Made with{' '}
            <Heart className="inline h-4 w-4 text-red-400 mx-1" aria-label="love" />
            for sneaker lovers.
          </p>
          
          <button
            onClick={scrollToTop}
            className="glass p-3 rounded-full hover:bg-white/10 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            aria-label="Scroll to top of page"
          >
            <ArrowUp className="h-5 w-5 text-gray-300 group-hover:text-white group-hover:-translate-y-1 transition-all duration-300" />
          </button>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;
