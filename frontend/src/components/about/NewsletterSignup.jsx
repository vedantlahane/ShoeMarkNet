import React from 'react';

const NewsletterSignup = ({ 
  onSignup, 
  loading, 
  email, 
  onEmailChange, 
  animateElements 
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      onSignup(email);
    }
  };

  return (
    <div className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 lg:p-12 shadow-2xl text-center ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
      <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
        <i className="fas fa-envelope text-3xl text-white"></i>
      </div>
      
      <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Stay Updated
      </h3>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
        Subscribe to our newsletter and be the first to know about new arrivals, exclusive deals, and company updates.
      </p>
      
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <div className="flex gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="Enter your email address"
            className="flex-1 px-4 py-3 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
            required
          />
          <button
            type="submit"
            disabled={loading || !email}
            className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <i className="fas fa-spinner animate-spin"></i>
            ) : (
              <i className="fas fa-paper-plane"></i>
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </form>
    </div>
  );
};

export default NewsletterSignup;
