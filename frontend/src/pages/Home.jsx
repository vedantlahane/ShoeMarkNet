
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { AlertTriangle, RefreshCw } from 'lucide-react';

// Redux actions
import { fetchFeaturedProducts } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';

// Components
import HeroSection from '../components/home/HeroSection';
import FeaturedProducts from '../components/home/FeaturedProducts';
import CategoriesSection from '../components/home/CategoriesSection';
import OffersSection from '../components/home/OffersSection';
import LoadingSpinner from '../components/common/LoadingSpinner';

/**
 * Home page component for ShoeMarkNet e-commerce application.
 * Displays the main landing page with hero section, featured products,
 * categories, and special offers. Integrates with Redux for state management.
 *
 * @component
 * @returns {JSX.Element} The home page layout with all sections
 */
const Home = () => {
  const dispatch = useDispatch();

  // Redux state - Extract product-related state from the store
  const {
    featuredProducts,
    featuredLoading,
    error
  } = useSelector(state => state.product);

  // Initialize component by fetching featured products on mount
  useEffect(() => {
    dispatch(fetchFeaturedProducts());
  }, [dispatch]);

  /**
   * Handles adding a product to the cart.
   * Dispatches the addToCart action with product details.
   *
   * @param {Object} product - The product object to add to cart
   * @param {string} product._id - Product ID
   * @param {Object} product - Full product object for cart display
   */
  const handleAddToCart = useCallback((product) => {
    dispatch(addToCart({
      productId: product._id,
      quantity: 1,
      product
    }));
  }, [dispatch]);

  // Show loading spinner while fetching featured products
  if (featuredLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <LoadingSpinner size="large" message="Loading premium products..." />
      </div>
    );
  }

  // Show error state if featured products failed to load
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <AlertTriangle 
            size={64} 
            className="mx-auto mb-4 text-red-500 dark:text-red-400" 
            aria-hidden="true"
          />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We couldn't load the page. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Reload page"
          >
            <RefreshCw size={16} aria-hidden="true" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SEO metadata for search engines */}
      <Helmet>
        <title>ShoeMarkNet - Premium Footwear Online</title>
        <meta name="description" content="Discover premium footwear brands and styles with AI-powered recommendations and lightning-fast delivery" />
        <meta name="keywords" content="shoes, footwear, sneakers, premium, online shopping, AI recommendations" />
      </Helmet>

      {/* Main page content with gradient background */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-500">
        {/* Hero section - Main banner and call-to-action */}
        <HeroSection />

        {/* Featured products section with add-to-cart functionality */}
        <FeaturedProducts
          products={featuredProducts}
          onAddToCart={handleAddToCart}
        />

        {/* Product categories navigation */}
        <CategoriesSection />

        {/* Special offers and promotions */}
        <OffersSection />
      </div>
    </>
  );
};

export default Home;
