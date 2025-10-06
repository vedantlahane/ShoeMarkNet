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
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';

gsap.registerPlugin(ScrollTrigger);

const Footer = memo(() => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const enableAnimations = !prefersReducedMotion;
  const pulseClass = enableAnimations ? 'animate-pulse-slow' : '';
  const shimmerClass = enableAnimations ? 'animate-gradient' : '';
  const floatClass = enableAnimations ? 'animate-bounce-slow' : '';
  const footerRef = useRef(null);
  const gsapContextRef = useRef(null);
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [hoveredSocial, setHoveredSocial] = useState(null);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer || !enableAnimations) {
      return undefined;
    }

    gsapContextRef.current = gsap.context(() => {
      // Target direct children of the container for animation
      const elementsToAnimate = gsap.utils.toArray('.footer-animate-child');
      gsap.set(elementsToAnimate, { y: 30, opacity: 0 });

      ScrollTrigger.create({
        trigger: footer,
        start: 'top bottom-=100',
        onEnter: () => {
          gsap.to(elementsToAnimate, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power2.out'
          });
        }
      });
    }, footerRef);

    return () => {
      if (gsapContextRef.current) {
        gsapContextRef.current.revert();
      }
    };
  }, [enableAnimations]);

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
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSubscribed(true);
      showSuccessToast('Welcome to our newsletter! Check your email for exclusive offers.');
      setEmail('');
    } catch (err) {
      console.error('Failed to subscribe to newsletter', err);
      showErrorToast('Failed to subscribe. Please try again.');
    }
  }, [email]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  const handleSocialPointerMove = useCallback((event, index) => {
    if (!enableAnimations) return;
    setHoveredSocial(index);
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--hover-x', `${x}%`);
    card.style.setProperty('--hover-y', `${y}%`);
  }, [enableAnimations]);

  const handleSocialPointerLeave = useCallback((event) => {
    setHoveredSocial(null);
    if (!enableAnimations) return;
    const card = event.currentTarget;
    card.style.removeProperty('--hover-x');
    card.style.removeProperty('--hover-y');
  }, [enableAnimations]);
  
  const handleSocialFocus = useCallback((event, index) => {
    setHoveredSocial(index);
    if (!enableAnimations) return;
    const card = event.currentTarget;
    card.style.setProperty('--hover-x', '50%');
    card.style.setProperty('--hover-y', '50%');
  }, [enableAnimations]);

  const handleSocialBlur = useCallback((event) => {
    setHoveredSocial(null);
    if (!enableAnimations) return;
    const card = event.currentTarget;
    card.style.removeProperty('--hover-x');
    card.style.removeProperty('--hover-y');
  }, [enableAnimations]);


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
    { icon: Facebook, href: 'https://facebook.com/shoemarknet', name: 'Facebook', followers: '2.5M' },
    { icon: Instagram, href: 'https://instagram.com/shoemarknet', name: 'Instagram', followers: '1.8M' },
    { icon: Twitter, href: 'https://twitter.com/shoemarknet', name: 'Twitter', followers: '890K' },
    { icon: Youtube, href: 'https://youtube.com/shoemarknet', name: 'YouTube', followers: '650K' },
    { icon: Linkedin, href: 'https://linkedin.com/company/shoemarknet', name: 'LinkedIn', followers: '320K' }
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
      <div className="absolute inset-0 opacity-10" aria-hidden="true">
        <div className={`absolute top-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full filter blur-3xl ${pulseClass}`}></div>
        <div className={`absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl ${pulseClass}`} style={{ animationDelay: enableAnimations ? '1s' : undefined }}></div>
        <div className={`absolute top-1/3 right-12 h-20 w-40 rounded-3xl border border-white/20 bg-white/10 backdrop-blur ${floatClass}`} style={{ animationDelay: enableAnimations ? '1.5s' : undefined }}></div>
        <div className={`absolute bottom-16 left-1/4 h-12 w-12 rounded-full border border-white/10 bg-white/5 ${floatClass}`} style={{ animationDelay: enableAnimations ? '2s' : undefined }}></div>
      </div>

      <div className="absolute inset-0 glass-dark" aria-hidden="true"></div>

      <div className="relative z-10 mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        
        <div className="py-8 border-b border-gray-700/50 footer-animate-child">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`relative glass p-5 rounded-xl flex items-center justify-center space-x-4 text-center overflow-hidden transition-all duration-500 ${enableAnimations ? 'hover:bg-white/10' : ''}`}
                style={enableAnimations ? { animationDelay: `${index * 120}ms` } : undefined}
              >
                <div className={`absolute inset-[1px] rounded-[0.65rem] bg-gradient-to-r from-blue-500/0 via-blue-500/15 to-purple-500/0 opacity-0 ${shimmerClass}`} style={{ opacity: enableAnimations ? 1 : 0.4 }} aria-hidden="true"></div>
                <feature.icon className={`relative z-10 h-6 w-6 text-blue-400 shrink-0 ${floatClass}`} aria-hidden="true" />
                <span className="relative z-10 text-sm text-gray-300 font-medium sm:text-base">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="py-16 footer-animate-child">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
            
            <div className="flex flex-col items-center text-center gap-6 lg:col-span-4 lg:items-start lg:text-left">
              <div className="flex items-center justify-center space-x-3">
                <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-xl font-bold" aria-hidden="true">S</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent sm:text-2xl">
                  ShoeMarkNet
                </span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed max-w-sm sm:text-base">
                Premium footwear for every step of your journey. Quality, comfort, and style in every pair.
              </p>
              
              <div className="space-y-4 w-full max-w-sm">
                <div className="relative glass p-3 rounded-lg transition-all duration-300 group overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${shimmerClass}`} aria-hidden="true"></div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-blue-400 group-hover:scale-110 transition-transform duration-300 shrink-0" aria-hidden="true" />
                    <a href="mailto:support@shoemarknet.com" className="text-sm text-gray-300 transition-colors duration-300 hover:text-blue-400 sm:text-base" aria-label="Email support">
                      support@shoemarknet.com
                    </a>
                  </div>
                </div>
                <div className="relative glass p-3 rounded-lg transition-all duration-300 group overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-r from-green-400/0 via-green-400/10 to-blue-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${shimmerClass}`} aria-hidden="true"></div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-green-400 group-hover:scale-110 transition-transform duration-300 shrink-0" aria-hidden="true" />
                    <a href="tel:+15551234567" className="text-sm text-gray-300 transition-colors duration-300 hover:text-green-400 sm:text-base" aria-label="Call support">
                      +1 (555) 123-4567
                    </a>
                  </div>
                </div>
                <div className="relative glass p-3 rounded-lg transition-all duration-300 group overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-r from-red-400/0 via-red-400/10 to-purple-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${shimmerClass}`} aria-hidden="true"></div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-red-400 group-hover:scale-110 transition-transform duration-300 shrink-0" aria-hidden="true" />
                    <span className="text-sm text-gray-300 sm:text-base">123 Fashion Ave, NY 10001</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 md:grid-cols-3 gap-8 text-center sm:text-left">
              <nav aria-label="Company links">
                <h3 className="text-base font-semibold mb-6 text-white sm:text-lg">Company</h3>
                <ul className="space-y-3">
                  {footerLinks.company.map((link, index) => (
                    <li key={index}>
                      <a href={link.href} className="inline-block rounded text-sm text-gray-300 transition-colors duration-300 hover:translate-x-1 hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 sm:text-base">
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <nav aria-label="Help and support links">
                <h3 className="text-base font-semibold mb-6 text-white sm:text-lg">Help</h3>
                <ul className="space-y-3">
                  {footerLinks.help.map((link, index) => (
                    <li key={index}>
                      <a href={link.href} className="inline-block rounded text-sm text-gray-300 transition-colors duration-300 hover:translate-x-1 hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 sm:text-base">
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <nav aria-label="Legal links" className="col-span-2 sm:col-span-1">
                <h3 className="text-base font-semibold mb-6 text-white sm:text-lg">Legal</h3>
                <ul className="space-y-3">
                  {footerLinks.legal.map((link, index) => (
                    <li key={index}>
                      <a href={link.href} className="inline-block rounded text-sm text-gray-300 transition-colors duration-300 hover:translate-x-1 hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 sm:text-base">
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            <div className="flex flex-col items-center text-center gap-8 lg:col-span-3 lg:items-start lg:text-left">
              <div>
                <h3 className="text-base font-semibold mb-6 text-white sm:text-lg">Stay Updated</h3>
                {!isSubscribed ? (
                  <form onSubmit={handleNewsletterSubmit} className="w-full max-w-sm">
                    <div className="glass rounded-lg p-2">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <label htmlFor="newsletter-email" className="sr-only">Email address for newsletter</label>
                        <input id="newsletter-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="w-full sm:flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg sm:rounded-l-lg sm:rounded-r-none sm:text-base" aria-describedby="newsletter-description" />
                        <button type="submit" className="btn-premium px-6 py-3 rounded-lg sm:rounded-r-lg sm:rounded-l-none font-medium w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900" aria-label="Subscribe to newsletter">
                          Subscribe
                        </button>
                      </div>
                    </div>
                    <p id="newsletter-description" className="text-xs text-gray-400 mt-2">Get exclusive deals and early access to new releases</p>
                  </form>
                ) : (
                  <div className="glass rounded-lg p-6 text-center w-full max-w-sm">
                    <Heart className="h-8 w-8 text-red-400 mx-auto mb-3" aria-hidden="true" />
                    <p className="text-sm font-medium text-green-400 sm:text-base">Thanks for subscribing!</p>
                    <p className="mt-1 text-xs text-gray-300 sm:text-sm">Check your email for exclusive offers</p>
                  </div>
                )}
              </div>
              
              <div>
                <h4 className="text-base font-medium text-white mb-4 sm:text-lg">Follow Us</h4>
                <div className="grid grid-cols-5 gap-3" role="list" aria-label="Social media links">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      className={`glass p-3 rounded-lg transition-all duration-300 group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${hoveredSocial === index ? 'ring-1 ring-blue-500/40 shadow-lg shadow-blue-500/10' : 'ring-1 ring-white/5'}`}
                      aria-label={`Follow us on ${social.name} - ${social.followers} followers`}
                      target="_blank"
                      rel="noopener noreferrer"
                      role="listitem"
                      onPointerMove={(event) => handleSocialPointerMove(event, index)}
                      onPointerEnter={(event) => handleSocialPointerMove(event, index)}
                      onPointerLeave={handleSocialPointerLeave}
                      onFocus={(event) => handleSocialFocus(event, index)}
                      onBlur={handleSocialBlur}
                    >
                      <div className="pointer-events-none absolute inset-0 transition-opacity duration-500" style={{ opacity: hoveredSocial === index ? 1 : enableAnimations ? 0 : 0.25, background: enableAnimations ? 'radial-gradient(circle at var(--hover-x, 50%) var(--hover-y, 50%), rgba(59,130,246,0.35), transparent 65%)' : 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(168,85,247,0.2))' }} aria-hidden="true"></div>
                      <social.icon className="relative z-10 h-5 w-5 text-gray-300 group-hover:text-white group-hover:scale-110 transition-all duration-300 mx-auto" />
                      <div className="relative z-10 mt-2 text-[0.65rem] text-gray-400 group-hover:text-gray-200">{social.followers}</div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="py-8 border-t border-gray-700/50 flex flex-col-reverse gap-6 sm:flex-row sm:justify-between sm:items-center footer-animate-child">
          <p className="text-gray-400 text-sm text-center sm:text-left">
            © 2025 ShoeMarkNet. All rights reserved. Made with{' '}
            <Heart className="inline h-4 w-4 text-red-400 mx-1" aria-label="love" />
            for sneaker lovers.
          </p>
          
          <button
            onClick={scrollToTop}
            className="glass p-3 rounded-full hover:bg-white/10 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 self-center"
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