import React from 'react';
import { Link } from 'react-router-dom';

const ContactCTA = ({ onCTAClick, animateElements }) => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 animate-shimmer"></div>
      </div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${4 + Math.random() * 6}s`
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center">
        <div className={`${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Find Your Perfect Pair?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Join thousands of satisfied customers who trust ShoeMarkNet for their footwear needs. 
            Discover your next favorite pair today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              to="/products"
              onClick={() => onCTAClick('start_shopping', '/products')}
              className="group bg-white text-blue-600 hover:bg-blue-50 font-bold py-4 px-8 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <i className="fas fa-shopping-bag mr-3 relative z-10"></i>
              <span className="relative z-10">Start Shopping</span>
            </Link>
            <Link
              to="/contact"
              onClick={() => onCTAClick('contact_us', '/contact')}
              className="bg-white/20 backdrop-blur-lg border border-white/30 text-white font-bold py-4 px-8 rounded-2xl hover:bg-white/30 transition-all duration-200"
            >
              <i className="fas fa-envelope mr-3"></i>
              Contact Us
            </Link>
            <Link
              to="/help"
              onClick={() => onCTAClick('learn_more', '/help')}
              className="bg-white/20 backdrop-blur-lg border border-white/30 text-white font-bold py-4 px-8 rounded-2xl hover:bg-white/30 transition-all duration-200"
            >
              <i className="fas fa-question-circle mr-3"></i>
              Learn More
            </Link>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-white/80">
            <div className="flex items-center">
              <i className="fas fa-shield-alt mr-2 text-green-400"></i>
              <span>Secure Shopping</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-truck mr-2 text-blue-400"></i>
              <span>Free Shipping</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-undo mr-2 text-purple-400"></i>
              <span>Easy Returns</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-headset mr-2 text-orange-400"></i>
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactCTA;
