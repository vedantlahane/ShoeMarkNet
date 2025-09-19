import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { Provider, useDispatch, useSelector } from "react-redux";
import store from "./redux/store";
import { initAuth } from "./redux/slices/authSlice";

// Layout
import MainLayout from "./components/layouts/MainLayout";
import LoadingSpinner from "./components/common/LoadingSpinner";
import ErrorBoundary from "./components/common/ErrorBoundary";

// Pages
import Home from "./pages/Home";

const AppContent = () => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(initAuth());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <BrowserRouter>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              {/* Add more routes here as you share components */}
            </Routes>
          </MainLayout>
        </BrowserRouter>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

const Home = () => {
  const dispatch = useDispatch();
  const { featuredProducts } = useSelector(state => state.products);

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 transition-all duration-500">
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

export default App;
