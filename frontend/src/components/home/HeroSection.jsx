import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/slices/cartSlice';

const HeroSection = () => {
  const dispatch = useDispatch();
  const [timeLeft, setTimeLeft] = useState({
    days: 7,
    hours: 15,
    minutes: 23,
    seconds: 42
  });

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else if (days > 0) {
          days--;
          hours = 23;
          minutes = 59;
          seconds = 59;
        }

        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAddToCart = (product) => {
    dispatch(addToCart({
      productId: product.id,
      quantity: 1,
      product
    }));
  };

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const headerHeight = 80;
      const elementPosition = section.offsetTop - headerHeight;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="hero" className="pt-20 min-h-screen relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 hero-gradient"></div>

      {/* Interactive Particles */}
      <div id="particles-container" className="absolute inset-0">
        {/* Particles will be added via JavaScript */}
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
          <div className="text-center lg:text-left reveal">
            {/* Enhanced AI Badge */}
            <div className="inline-flex items-center space-x-2 glass text-white rounded-full px-6 py-3 mb-8 micro-bounce">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <i className="fas fa-sparkles text-yellow-400"></i>
              <span className="text-sm font-medium">AI-Powered Shopping</span>
            </div>

            {/* Main Heading with Enhanced Animation */}
            <h1 className="text-4xl lg:text-7xl font-heading font-bold mb-6 leading-tight">
              <span className="block text-white">Discover</span>
              <span className="block bg-gradient-to-r from-yellow-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Premium Footwear
              </span>
              <span className="block text-white">at Lightning Speed</span>
            </h1>

            {/* Enhanced Subtitle */}
            <h2 className="text-xl lg:text-3xl font-semibold mb-6 text-blue-100">
              <i className="fas fa-bolt mr-2"></i>Save up to 75% with AI-Curated
              Deals
            </h2>

            {/* Interactive Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8 text-center">
              <div className="glass rounded-2xl p-4 micro-bounce">
                <div className="text-2xl lg:text-3xl font-bold text-white">
                  <i className="fas fa-users text-blue-300 mb-2"></i>
                  <br />10k+
                </div>
                <div className="text-xs lg:text-sm text-blue-100">Happy Customers</div>
              </div>
              <div className="glass rounded-2xl p-4 micro-bounce">
                <div className="text-2xl lg:text-3xl font-bold text-white">
                  <i className="fas fa-shipping-fast text-green-300 mb-2"></i>
                  <br />24h
                </div>
                <div className="text-xs lg:text-sm text-blue-100">Fast Delivery</div>
              </div>
              <div className="glass rounded-2xl p-4 micro-bounce">
                <div className="text-2xl lg:text-3xl font-bold text-white">
                  <i className="fas fa-star text-yellow-300 mb-2"></i>
                  <br />4.9★
                </div>
                <div className="text-xs lg:text-sm text-blue-100">Rating</div>
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={() => scrollToSection('featured')}
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-bold rounded-2xl hover:bg-blue-50 transform hover:scale-105 transition-all duration-200 shadow-2xl micro-bounce"
              >
                <i className="fas fa-rocket mr-3"></i>
                Start Shopping
                <i className="fas fa-arrow-right ml-3"></i>
              </button>
              <button
                onClick={() => scrollToSection('offers')}
                className="inline-flex items-center justify-center px-8 py-4 glass border-2 border-white text-white font-bold rounded-2xl hover:bg-white hover:text-blue-600 transform hover:scale-105 transition-all duration-200 micro-bounce"
              >
                <i className="fas fa-gift mr-3"></i>
                View Deals
              </button>
            </div>

            {/* Enhanced Countdown Timer */}
            <div className="glass rounded-3xl p-6">
              <h3 className="text-lg font-bold mb-4 text-center text-white flex items-center justify-center">
                <i className="fas fa-clock mr-2 text-yellow-400"></i>
                <i className="fas fa-bolt mr-2"></i>Flash Sale Ends In:
              </h3>
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="glass rounded-2xl p-3 micro-bounce">
                  <div id="days" className="text-2xl lg:text-3xl font-bold text-white">
                    {timeLeft.days.toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs lg:text-sm text-blue-100">Days</div>
                </div>
                <div className="glass rounded-2xl p-3 micro-bounce">
                  <div id="hours" className="text-2xl lg:text-3xl font-bold text-white">
                    {timeLeft.hours.toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs lg:text-sm text-blue-100">Hours</div>
                </div>
                <div className="glass rounded-2xl p-3 micro-bounce">
                  <div id="minutes" className="text-2xl lg:text-3xl font-bold text-white">
                    {timeLeft.minutes.toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs lg:text-sm text-blue-100">Min</div>
                </div>
                <div className="glass rounded-2xl p-3 micro-bounce">
                  <div id="seconds" className="text-2xl lg:text-3xl font-bold text-white">
                    {timeLeft.seconds.toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs lg:text-sm text-blue-100">Sec</div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Hero Product Showcase */}
          <div className="relative reveal">
            <div id="hero-products" className="relative">
              {/* Main Featured Product */}
              <div className="product-card glass rounded-3xl overflow-hidden shadow-2xl mb-6">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop"
                    alt="Premium Athletic Sneakers"
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold px-3 py-1 rounded-full animate-pulse">
                    <i className="fas fa-percentage mr-1"></i>35% OFF
                  </div>
                </div>
                <div className="p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">Premium Athletic Sneakers</h3>
                  <div className="flex items-center mb-3">
                    <div className="flex text-yellow-400 mr-2">
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star-half-alt"></i>
                    </div>
                    <span className="text-sm">(4.8)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold">$129.99</span>
                      <span className="text-lg line-through text-gray-300 ml-2">$199.99</span>
                    </div>
                    <button
                      className="add-to-cart bg-white text-blue-600 hover:bg-blue-50 font-bold py-2 px-4 rounded-xl transition-all duration-200 micro-bounce"
                      onClick={() => handleAddToCart({
                        id: 'hero-1',
                        name: 'Premium Athletic Sneakers',
                        price: 129.99,
                        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop'
                      })}
                    >
                      <i className="fas fa-cart-plus mr-2"></i>
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Product Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="product-card glass rounded-2xl p-4 text-white">
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=300&auto=format&fit=crop"
                    alt="Wireless Headphones"
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <h4 className="font-bold text-sm">
                    <i className="fas fa-headphones mr-1"></i>Wireless Headphones
                  </h4>
                  <p className="text-blue-300 font-bold">$149.99</p>
                </div>
                <div className="product-card glass rounded-2xl p-4 text-white">
                  <img
                    src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=300&auto=format&fit=crop"
                    alt="Smart Watch"
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <h4 className="font-bold text-sm">
                    <i className="fas fa-clock mr-1"></i>Smart Watch Pro
                  </h4>
                  <p className="text-blue-300 font-bold">$299.00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
