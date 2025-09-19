import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';

// Redux actions
import { fetchFeaturedProducts } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';

// Components
import HeroSection from '../components/home/HeroSection';
import FeaturedProducts from '../components/home/FeaturedProducts';
import CategoriesSection from '../components/home/CategoriesSection';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Home = () => {
  const dispatch = useDispatch();

  // Redux state
  const {
    featuredProducts,
    loading,
    error
  } = useSelector(state => state.product);

  // Simple initialization
  useEffect(() => {
    dispatch(fetchFeaturedProducts());
  }, [dispatch]);

  // Simple add to cart
  const handleAddToCart = (product) => {
    dispatch(addToCart({
      productId: product._id,
      quantity: 1,
      product
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <LoadingSpinner size="large" message="Loading premium products..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">We couldn't load the page. Please try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 micro-bounce"
          >
            <i className="fas fa-refresh mr-2"></i>Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>ShoeMarkNet - Premium Footwear Online</title>
        <meta name="description" content="Discover premium footwear brands and styles with AI-powered recommendations and lightning-fast delivery" />
        <meta name="keywords" content="shoes, footwear, sneakers, premium, online shopping, AI recommendations" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-500">
        {/* Enhanced Hero Section */}
        <HeroSection />

        {/* Enhanced Featured Products with Dynamic Carousel */}
        <FeaturedProducts
          products={featuredProducts}
          onAddToCart={handleAddToCart}
        />

        {/* Categories Section */}
        <CategoriesSection />

        {/* Offers Section */}
        <OffersSection />
      </div>
    </>
  );
};

// Offers Section Component
const OffersSection = () => {
  const [copiedCode, setCopiedCode] = useState(null);

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const offers = [
    {
      title: 'Weekend Flash Sale',
      description: 'Get 20% off on all products + Free shipping!',
      code: 'WEEKEND20',
      bg: 'from-orange-500 via-red-500 to-pink-600',
      icon: 'fire'
    },
    {
      title: 'Free Shipping',
      description: 'Free shipping on orders over $75',
      code: 'FREESHIP',
      bg: 'from-blue-500 to-cyan-500',
      icon: 'shipping-fast'
    },
    {
      title: 'VIP Deal',
      description: 'Buy 2 get 1 free on selected items',
      code: 'VIP3FREE',
      bg: 'from-purple-500 to-pink-500',
      icon: 'crown'
    },
    {
      title: 'First Order',
      description: '15% off your first purchase',
      code: 'WELCOME15',
      bg: 'from-green-500 to-emerald-500',
      icon: 'user-plus'
    }
  ];

  return (
    <section id="offers" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 reveal">
          <h2 className="text-4xl lg:text-6xl font-heading font-bold mb-6 text-gray-900 dark:text-white">
            Exclusive
            <span className="text-gradient">
              <i className="fas fa-tags mr-2"></i>Deals
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            <i className="fas fa-discount mr-2"></i>Get the best prices on premium
            products with our exclusive discount codes
          </p>
        </div>

        {/* Mega Deal */}
        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 rounded-3xl p-12 text-white text-center mb-16 reveal">
          <h3 className="text-4xl lg:text-5xl font-heading font-bold mb-6">
            <i className="fas fa-fire mr-4"></i>Weekend Flash Sale
          </h3>
          <p className="text-2xl mb-8 text-orange-100 font-medium">
            <i className="fas fa-gift mr-2"></i>Get 20% off on all products + Free
            shipping!
          </p>
          <div className="glass rounded-2xl px-8 py-4 inline-block mb-8">
            <span className="font-mono text-3xl font-bold">WEEKEND20</span>
          </div>
          <br />
          <button
            onClick={() => copyCode('WEEKEND20')}
            className="copy-code bg-white text-orange-600 hover:bg-orange-50 font-bold px-10 py-4 rounded-2xl transition-all duration-200 micro-bounce text-lg"
          >
            <i className="fas fa-copy mr-3"></i>
            {copiedCode === 'WEEKEND20' ? 'Copied!' : 'Copy Code'}
          </button>
        </div>

        {/* Other Offers */}
        <div className="grid md:grid-cols-3 gap-8">
          {offers.slice(1).map((offer, index) => (
            <div
              key={offer.code}
              className="glass rounded-3xl p-8 hover:scale-105 transition-all duration-300 reveal"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-20 h-20 bg-gradient-to-r ${offer.bg} rounded-3xl flex items-center justify-center mb-8 mx-auto`}>
                <i className={`fas fa-${offer.icon} text-3xl text-white`}></i>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white text-center">
                {offer.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
                <i className={`fas fa-${offer.icon} mr-2`}></i>{offer.description}
              </p>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-6 py-3 text-center mb-8">
                <span className="font-mono font-bold text-gray-900 dark:text-white text-lg">{offer.code}</span>
              </div>
              <button
                onClick={() => copyCode(offer.code)}
                className={`copy-code w-full bg-gradient-to-r ${offer.bg} hover:opacity-90 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 micro-bounce`}
              >
                <i className="fas fa-copy mr-2"></i>
                {copiedCode === offer.code ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Home;
