import React, { useRef, useEffect, useState } from 'react';
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

const Footer = () => {
  const footerRef = useRef(null);
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const footer = footerRef.current;
    
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
  }, []);

  const handleNewsletterSubmit = async (e) => {
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
  };

  const scrollToTop = () => {
    gsap.to(window, {
      duration: 1.5,
      scrollTo: { y: 0 },
      ease: "power2.inOut"
    });
  };

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
    <footer ref={footerRef} className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Glass overlay */}
      <div className="absolute inset-0 glass-dark"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Features Banner */}
        <div className="py-8 border-b border-gray-700/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center justify-center space-x-3 text-center">
                <feature.icon className="h-6 w-6 text-blue-400" />
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
                  <span className="text-xl font-bold">S</span>
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
                    <Mail className="h-5 w-5 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-gray-300">support@shoemarknet.com</span>
                  </div>
                </div>
                <div className="glass p-3 rounded-lg hover:bg-white/10 transition-all duration-300 group">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-green-400 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-gray-300">+1 (555) 123-4567</span>
                  </div>
                </div>
                <div className="glass p-3 rounded-lg hover:bg-white/10 transition-all duration-300 group">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-red-400 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-gray-300">123 Fashion Ave, NY 10001</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Links Sections */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-6 text-white">Company</h3>
                <ul className="space-y-3">
                  {footerLinks.company.map((link, index) => (
                    <li key={index}>
                      <a 
                        href={link.href} 
                        className="text-gray-300 hover:text-blue-400 transition-colors duration-300 hover:translate-x-1 inline-block"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-6 text-white">Help</h3>
                <ul className="space-y-3">
                  {footerLinks.help.map((link, index) => (
                    <li key={index}>
                      <a 
                        href={link.href} 
                        className="text-gray-300 hover:text-blue-400 transition-colors duration-300 hover:translate-x-1 inline-block"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-6 text-white">Legal</h3>
                <ul className="space-y-3">
                  {footerLinks.legal.map((link, index) => (
                    <li key={index}>
                      <a 
                        href={link.href} 
                        className="text-gray-300 hover:text-blue-400 transition-colors duration-300 hover:translate-x-1 inline-block"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Newsletter Section */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold mb-6 text-white">Stay Updated</h3>
              
              {!isSubscribed ? (
                <form onSubmit={handleNewsletterSubmit} className="mb-8">
                  <div className="glass rounded-lg p-1">
                    <div className="flex">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="flex-1 bg-transparent px-4 py-3 text-white placeholder-gray-400 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="btn-premium px-6 py-3 rounded-lg font-medium"
                      >
                        Subscribe
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Get exclusive deals and early access to new releases
                  </p>
                </form>
              ) : (
                <div className="glass rounded-lg p-6 mb-8 text-center">
                  <Heart className="h-8 w-8 text-red-400 mx-auto mb-3" />
                  <p className="text-green-400 font-medium">Thanks for subscribing!</p>
                  <p className="text-gray-300 text-sm mt-1">Check your email for exclusive offers</p>
                </div>
              )}

              {/* Social Media */}
              <div>
                <h4 className="text-white font-medium mb-4">Follow Us</h4>
                <div className="grid grid-cols-3 gap-3">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      className="glass p-3 rounded-lg hover:bg-white/10 transition-all duration-300 group relative overflow-hidden"
                      title={`${social.name} - ${social.followers} followers`}
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
            <Heart className="inline h-4 w-4 text-red-400 mx-1" />
            for sneaker lovers.
          </p>
          
          <button
            onClick={scrollToTop}
            className="glass p-3 rounded-full hover:bg-white/10 transition-all duration-300 group"
            title="Scroll to top"
          >
            <ArrowUp className="h-5 w-5 text-gray-300 group-hover:text-white group-hover:-translate-y-1 transition-all duration-300" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
