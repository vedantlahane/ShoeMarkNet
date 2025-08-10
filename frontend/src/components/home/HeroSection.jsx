import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CountdownTimer from '../common/CountdownTimer';

const HeroSection = ({ 
  featuredProducts, 
  onAddToCart, 
  onToggleWishlist,
  isProductInCart,
  isProductInWishlist 
}) => {
  const [stats] = useState({
    customers: '10k+',
    delivery: '24h',
    rating: '4.9★'
  });

  const featuredProduct = featuredProducts[0];

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 animate-gradient-x"></div>
      
      {/* Interactive Particles */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
          <div className="text-center lg:text-left">
            {/* AI Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-lg border border-white/20 text-white rounded-full px-6 py-3 mb-8">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <i className="fas fa-sparkles text-yellow-400"></i>
              <span className="text-sm font-medium">AI-Powered Shopping</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="block text-white">Discover</span>
              <span className="block bg-gradient-to-r from-yellow-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Premium Shoes
              </span>
              <span className="block text-white">at Lightning Speed</span>
            </h1>

            {/* Enhanced Subtitle */}
            <h2 className="text-xl lg:text-3xl font-semibold mb-6 text-blue-100">
              <i className="fas fa-fire mr-2"></i>Save up to 75% with AI-Curated Deals
            </h2>

            {/* Interactive Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8 text-center">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4">
                <div className="text-2xl font-bold text-white">
                  <i className="fas fa-users text-blue-300 mb-2"></i>
                  <br />{stats.customers}
                </div>
                <div className="text-sm text-blue-100">Happy Customers</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4">
                <div className="text-2xl font-bold text-white">
                  <i className="fas fa-shipping-fast text-green-300 mb-2"></i>
                  <br />{stats.delivery}
                </div>
                <div className="text-sm text-blue-100">Fast Delivery</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4">
                <div className="text-2xl font-bold text-white">
                  <i className="fas fa-star text-yellow-300 mb-2"></i>
                  <br />{stats.rating}
                </div>
                <div className="text-sm text-blue-100">Rating</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                to="/products"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-bold rounded-2xl hover:bg-blue-50 transform hover:scale-105 transition-all duration-200 shadow-2xl"
              >
                <i className="fas fa-rocket mr-3"></i>
                Start Shopping
                <i className="fas fa-arrow-right ml-3"></i>
              </Link>
              <button
                onClick={() => document.getElementById('offers')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-lg border-2 border-white text-white font-bold rounded-2xl hover:bg-white hover:text-blue-600 transform hover:scale-105 transition-all duration-200"
              >
                <i className="fas fa-gift mr-3"></i>
                View Deals
              </button>
            </div>

            {/* Countdown Timer */}
            <CountdownTimer 
              targetDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
              title="Flash Sale Ends In:"
            />
          </div>

          {/* Hero Product Showcase */}
          <div className="relative">
            {featuredProduct && (
              <>
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl overflow-hidden shadow-2xl mb-6">
                  <div className="relative">
                    <img
                      src={featuredProduct.images?.[0] || '/product-placeholder.jpg'}
                      alt={featuredProduct.name}
                      className="w-full h-64 object-cover"
                      loading="eager"
                    />
                    {featuredProduct.discount && (
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold px-3 py-1 rounded-full animate-pulse">
                        <i className="fas fa-percentage mr-1"></i>{featuredProduct.discount}% OFF
                      </div>
                    )}
                    <button
                      onClick={() => onToggleWishlist(featuredProduct)}
                      className={`absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                        isProductInWishlist(featuredProduct._id)
                          ? 'bg-red-500 text-white'
                          : 'bg-white/20 backdrop-blur-sm text-white hover:bg-red-500'
                      }`}
                    >
                      <i className="fas fa-heart"></i>
                    </button>
                  </div>
                  <div className="p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">{featuredProduct.name}</h3>
                    <div className="flex items-center mb-3">
                      <div className="flex text-yellow-400 mr-2">
                        {[...Array(5)].map((_, i) => (
                          <i key={i} className={`fas ${i < Math.floor(featuredProduct.rating || 0) ? 'fa-star' : i < (featuredProduct.rating || 0) ? 'fa-star-half-alt' : 'fa-star'} ${i >= Math.floor(featuredProduct.rating || 0) && i >= (featuredProduct.rating || 0) ? 'far' : ''}`}></i>
                        ))}
                      </div>
                      <span className="text-sm">({featuredProduct.rating || 0})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold">${featuredProduct.price}</span>
                        {featuredProduct.originalPrice && (
                          <span className="text-lg line-through text-gray-300 ml-2">${featuredProduct.originalPrice}</span>
                        )}
                      </div>
                      <button 
                        onClick={() => onAddToCart(featuredProduct)}
                        disabled={isProductInCart(featuredProduct._id)}
                        className={`font-bold py-2 px-4 rounded-xl transition-all duration-200 ${
                          isProductInCart(featuredProduct._id)
                            ? 'bg-green-500 text-white cursor-not-allowed'
                            : 'bg-white text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        <i className={`fas ${isProductInCart(featuredProduct._id) ? 'fa-check' : 'fa-cart-plus'} mr-2`}></i>
                        {isProductInCart(featuredProduct._id) ? 'In Cart' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Product Grid */}
                {featuredProducts.length > 1 && (
                  <div className="grid grid-cols-2 gap-4">
                    {featuredProducts.slice(1, 3).map((product) => (
                      <div key={product._id} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 text-white">
                        <img
                          src={product.images?.[0] || '/product-placeholder.jpg'}
                          alt={product.name}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                          loading="lazy"
                        />
                        <h4 className="font-bold text-sm truncate">{product.name}</h4>
                        <p className="text-blue-300 font-bold">${product.price}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(-5px) rotate(-1deg); }
        }
        
        .animate-gradient-x {
          background-size: 400% 400%;
          animation: gradient-x 15s ease infinite;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default React.memo(HeroSection);
