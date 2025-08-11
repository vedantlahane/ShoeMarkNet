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
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" message="Loading..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Error loading page. Please refresh.</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>ShoeMarkNet - Premium Footwear Online</title>
        <meta name="description" content="Discover premium footwear brands and styles" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <HeroSection />
        
        <FeaturedProducts 
          products={featuredProducts}
          onAddToCart={handleAddToCart}
        />
        
        <CategoriesSection />
      </div>
    </>
  );
};

export default Home;
