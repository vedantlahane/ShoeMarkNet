import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <div className="absolute inset-0 bg-black/20"></div>

        {/* Animated Shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative container mx-auto px-4 py-16 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">

          {/* Content */}
          <div className={`text-center lg:text-left transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-4 border border-white/20">
                ✨ Premium Footwear Collection
              </span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Step Into
              <span className="block bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-400 bg-clip-text text-transparent animate-pulse">
                Excellence
              </span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Discover unparalleled comfort and style with our curated collection of premium shoes.
              Where fashion meets function in perfect harmony.
            </p>

            {/* Enhanced Stats */}
            <div className="flex justify-center lg:justify-start space-x-8 mb-10">
              <div className="text-center group">
                <div className="text-3xl font-bold text-white mb-1 group-hover:scale-110 transition-transform duration-300">10k+</div>
                <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Happy Customers</div>
              </div>
              <div className="text-center group">
                <div className="text-3xl font-bold text-white mb-1 group-hover:scale-110 transition-transform duration-300">24h</div>
                <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Fast Delivery</div>
              </div>
              <div className="text-center group">
                <div className="text-3xl font-bold text-white mb-1 group-hover:scale-110 transition-transform duration-300">4.9★</div>
                <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Average Rating</div>
              </div>
            </div>

            {/* Enhanced Call to Action */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/products"
                className="group relative bg-gradient-to-r from-yellow-400 to-pink-500 text-black font-bold py-4 px-8 rounded-xl hover:shadow-2xl hover:shadow-yellow-400/25 transition-all duration-300 transform hover:scale-105"
              >
                <span className="relative z-10">Shop Collection</span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              <Link
                to="/categories"
                className="group border-2 border-white/30 text-white font-bold py-4 px-8 rounded-xl hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm"
              >
                <span className="flex items-center gap-2">
                  Explore Categories
                  <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform duration-300"></i>
                </span>
              </Link>
            </div>
          </div>

          {/* Enhanced Hero Image */}
          <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            <div className="relative">
              {/* Main Image */}
              <div className="relative z-10 transform hover:scale-105 transition-transform duration-500">
                <img
                  src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop"
                  alt="Premium Shoes"
                  className="w-full max-w-lg mx-auto rounded-2xl shadow-2xl"
                />

                {/* Floating Badge */}
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full font-bold shadow-lg animate-bounce">
                  <span className="flex items-center gap-1">
                    <i className="fas fa-fire"></i>
                    Hot Deal
                  </span>
                </div>

                {/* Price Tag */}
                <div className="absolute -bottom-4 -left-4 bg-white/90 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-xl font-bold shadow-lg">
                  <div className="text-sm text-gray-600">Starting from</div>
                  <div className="text-xl">$199</div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-8 -left-8 w-16 h-16 bg-yellow-400/20 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute -bottom-8 -right-8 w-20 h-20 bg-purple-400/20 rounded-full blur-xl animate-pulse delay-700"></div>

              {/* Floating Cards */}
              <div className="absolute top-4 -left-16 bg-white/10 backdrop-blur-md rounded-lg p-3 shadow-lg animate-float">
                <div className="text-white text-sm font-medium">Free Shipping</div>
              </div>
              <div className="absolute bottom-4 -right-16 bg-white/10 backdrop-blur-md rounded-lg p-3 shadow-lg animate-float delay-500">
                <div className="text-white text-sm font-medium">30-Day Returns</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
