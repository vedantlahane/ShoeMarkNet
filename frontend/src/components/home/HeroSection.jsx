import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-blue-600 to-purple-600">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row items-center justify-between min-h-screen">
          
          {/* Content */}
          <div className="text-center lg:text-left lg:w-1/2">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Discover Premium 
              <span className="block text-yellow-400">Footwear</span>
            </h1>
            
            <p className="text-xl text-blue-100 mb-8">
              Shop the latest collection of premium shoes with fast delivery and great prices.
            </p>
            
            {/* Simple Stats */}
            <div className="flex justify-center lg:justify-start space-x-8 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">10k+</div>
                <div className="text-sm text-blue-200">Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">24h</div>
                <div className="text-sm text-blue-200">Delivery</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">4.9★</div>
                <div className="text-sm text-blue-200">Rating</div>
              </div>
            </div>
            
            {/* Call to Action */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/products"
                className="bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Shop Now
              </Link>
              <Link
                to="/categories"
                className="border-2 border-white text-white font-bold py-3 px-8 rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
              >
                Browse Categories
              </Link>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="lg:w-1/2 mt-12 lg:mt-0">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop"
                alt="Premium Shoes"
                className="w-full max-w-md mx-auto rounded-lg shadow-2xl"
              />
              <div className="absolute -top-4 -right-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold">
                30% OFF
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
