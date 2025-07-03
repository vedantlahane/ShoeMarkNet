// src/pages/NotFound.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  const [animateElements, setAnimateElements] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [showCountdown, setShowCountdown] = useState(false);

  // Trigger animations on mount
  useEffect(() => {
    setAnimateElements(true);
  }, []);

  // Auto-redirect countdown (optional)
  useEffect(() => {
    if (showCountdown && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (showCountdown && countdown === 0) {
      navigate('/');
    }
  }, [countdown, showCountdown, navigate]);

  // Popular destinations
  const popularPages = [
    { name: 'Home', path: '/', icon: 'fa-home', color: 'from-blue-500 to-cyan-500' },
    { name: 'Shop', path: '/products', icon: 'fa-shopping-bag', color: 'from-green-500 to-emerald-500' },
    { name: 'About', path: '/about', icon: 'fa-info-circle', color: 'from-purple-500 to-pink-500' },
    { name: 'Contact', path: '/contact', icon: 'fa-envelope', color: 'from-orange-500 to-red-500' }
  ];

  // Search suggestions
  const searchSuggestions = [
    'Running shoes',
    'Sneakers',
    'Boots',
    'Sandals',
    'Athletic wear',
    'Sale items'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center relative overflow-hidden">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Floating Shoe Icons */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute text-blue-200/20 dark:text-blue-800/20 animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            fontSize: `${1 + Math.random() * 2}rem`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${6 + Math.random() * 6}s`
          }}
        >
          <i className="fas fa-shoe-prints"></i>
        </div>
      ))}

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          
          {/* Main 404 Section */}
          <div className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-12 shadow-2xl mb-8 ${
            animateElements ? 'animate-fade-in-up' : 'opacity-0'
          }`}>
            
            {/* 404 Text with Animation */}
            <div className="mb-8">
              <h1 className={`text-9xl lg:text-[12rem] font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 leading-none ${
                animateElements ? 'animate-bounce-in' : 'opacity-0'
              }`} style={{ animationDelay: '0.2s' }}>
                4<span className="inline-block animate-spin-slow">0</span>4
              </h1>
              
              {/* Sad Shoe Icon */}
              <div className={`w-24 h-24 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl ${
                animateElements ? 'animate-fade-in' : 'opacity-0'
              }`} style={{ animationDelay: '0.4s' }}>
                <i className="fas fa-shoe-prints text-3xl text-white"></i>
              </div>
            </div>

            {/* Error Message */}
            <div className={`mb-8 ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Oops! Page Not Found
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
                Looks like you've wandered off the beaten path! The page you're looking for seems to have 
                <span className="font-semibold text-blue-600 dark:text-blue-400"> stepped out</span> for a moment.
              </p>
            </div>

            {/* Error Details */}
            <div className={`bg-red-500/20 backdrop-blur-lg border border-red-300/50 rounded-2xl p-6 mb-8 ${
              animateElements ? 'animate-fade-in' : 'opacity-0'
            }`} style={{ animationDelay: '0.8s' }}>
              <div className="flex items-center justify-center space-x-4 text-red-700 dark:text-red-300">
                <i className="fas fa-exclamation-triangle text-2xl"></i>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">What might have happened?</h3>
                  <ul className="text-sm mt-2 space-y-1">
                    <li>• The page was moved or deleted</li>
                    <li>• You typed the URL incorrectly</li>
                    <li>• The link you followed is broken</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 ${
              animateElements ? 'animate-fade-in-up' : 'opacity-0'
            }`} style={{ animationDelay: '1s' }}>
              <Link
                to="/"
                className="group bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-2xl"
              >
                <i className="fas fa-home mr-3 group-hover:animate-bounce"></i>
                Back to Home
                <i className="fas fa-arrow-right ml-3 group-hover:translate-x-1 transition-transform duration-200"></i>
              </Link>
              
              <button
                onClick={() => window.history.back()}
                className="bg-white/20 backdrop-blur-lg border border-white/30 text-gray-900 dark:text-white font-bold py-4 px-8 rounded-2xl hover:bg-white/30 transition-all duration-200"
              >
                <i className="fas fa-arrow-left mr-3"></i>
                Go Back
              </button>
              
              <button
                onClick={() => setShowCountdown(!showCountdown)}
                className="bg-green-500/20 backdrop-blur-lg border border-green-300/50 text-green-700 dark:text-green-300 font-bold py-4 px-8 rounded-2xl hover:bg-green-500/30 transition-all duration-200"
              >
                <i className="fas fa-clock mr-3"></i>
                {showCountdown ? `Auto-redirect in ${countdown}s` : 'Auto-redirect Home'}
              </button>
            </div>

            {/* Countdown Timer */}
            {showCountdown && (
              <div className="animate-fade-in">
                <div className="bg-green-500/20 backdrop-blur-lg border border-green-300/50 rounded-2xl p-4 mb-8">
                  <p className="text-green-700 dark:text-green-300">
                    <i className="fas fa-info-circle mr-2"></i>
                    Automatically redirecting to homepage in <span className="font-bold">{countdown}</span> seconds...
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            
            {/* Popular Pages */}
            <div className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 shadow-2xl ${
              animateElements ? 'animate-fade-in-up' : 'opacity-0'
            }`} style={{ animationDelay: '1.2s' }}>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                <i className="fas fa-compass mr-3 text-blue-500"></i>
                Popular Destinations
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {popularPages.map((page, index) => (
                  <Link
                    key={index}
                    to={page.path}
                    className={`group bg-gradient-to-r ${page.color} text-white p-4 rounded-2xl text-center hover:scale-110 transition-all duration-300 shadow-lg`}
                  >
                    <i className={`fas ${page.icon} text-2xl mb-2 block group-hover:animate-bounce`}></i>
                    <span className="font-semibold">{page.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Search Suggestions */}
            <div className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 shadow-2xl ${
              animateElements ? 'animate-fade-in-up' : 'opacity-0'
            }`} style={{ animationDelay: '1.4s' }}>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                <i className="fas fa-search mr-3 text-purple-500"></i>
                Try Searching For
              </h3>
              <div className="space-y-3">
                {searchSuggestions.map((suggestion, index) => (
                  <Link
                    key={index}
                    to={`/products?search=${encodeURIComponent(suggestion)}`}
                    className="flex items-center space-x-3 p-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <i className="fas fa-search text-white text-sm"></i>
                    </div>
                    <span className="text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {suggestion}
                    </span>
                    <i className="fas fa-arrow-right text-gray-400 ml-auto group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-200"></i>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 shadow-2xl ${
            animateElements ? 'animate-fade-in-up' : 'opacity-0'
          }`} style={{ animationDelay: '1.6s' }}>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              <i className="fas fa-life-ring mr-3 text-orange-500"></i>
              Need Help?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              If you think this is a mistake or need assistance finding what you're looking for, 
              our support team is here to help!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105"
              >
                <i className="fas fa-envelope mr-2"></i>
                Contact Support
              </Link>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-200">
                <i className="fas fa-comments mr-2"></i>
                Live Chat
              </button>
              <Link
                to="/about"
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-200"
              >
                <i className="fas fa-info-circle mr-2"></i>
                Learn More
              </Link>
            </div>
          </div>

          {/* Fun Facts */}
          <div className={`mt-8 text-center ${animateElements ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '1.8s' }}>
            <div className="bg-blue-500/20 backdrop-blur-lg border border-blue-300/50 rounded-2xl p-6">
              <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                <i className="fas fa-lightbulb mr-2"></i>
                Did You Know?
              </h4>
              <p className="text-blue-700 dark:text-blue-300">
                The 404 error got its name from room 404 at CERN, where the original web servers were located. 
                When files couldn't be found, they were "not found in room 404"!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-15px) rotate(2deg); }
          66% { transform: translateY(-8px) rotate(-1deg); }
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
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3) translateY(-100px);
          }
          50% {
            opacity: 1;
            transform: scale(1.05) translateY(-10px);
          }
          70% {
            transform: scale(0.9) translateY(0);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-bounce-in {
          animation: bounce-in 1s ease-out forwards;
          opacity: 0;
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default NotFound;
