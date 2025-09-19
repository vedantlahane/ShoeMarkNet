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
import OffersSection from '../components/home/OffersSection';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Home = () => {
  const dispatch = useDispatch();

  // Redux state
  const {
    featuredProducts,
    featuredLoading,
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

  if (featuredLoading) {
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

export default Home;
