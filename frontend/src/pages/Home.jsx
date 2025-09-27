import { lazy, Suspense, useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageMeta from '../components/seo/PageMeta';
import { AlertTriangle, RefreshCw } from 'lucide-react';

// Redux actions
import { fetchFeaturedProducts } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';

// Components
import HeroSection from '../components/home/HeroSection';

const FeaturedProducts = lazy(() => import('../components/home/FeaturedProducts'));
const CategoriesSection = lazy(() => import('../components/home/CategoriesSection'));
const OffersSection = lazy(() => import('../components/home/OffersSection'));

const SectionSkeleton = ({ title, rows = 3 }) => {
  const gridColsClass = rows > 2 ? 'lg:grid-cols-3' : 'lg:grid-cols-2';

  return (
    <section
      aria-label={`${title} loading state`}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse"
    >
      <div className="h-8 w-48 bg-white/40 dark:bg-gray-700 rounded-full mb-6"></div>
      <div className={`grid gap-6 sm:grid-cols-2 ${gridColsClass}`}>
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="rounded-3xl bg-white/40 dark:bg-gray-800 border border-white/30 dark:border-gray-700 h-48"
          ></div>
        ))}
      </div>
    </section>
  );
};

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

  const featuredList = useMemo(
    () => (Array.isArray(featuredProducts) ? featuredProducts : []),
    [featuredProducts]
  );
  const featuredCount = featuredList.length;

  // Initialize component by fetching featured products on mount
  useEffect(() => {
    if (featuredLoading || error) {
      return;
    }

    if (featuredCount === 0) {
      dispatch(fetchFeaturedProducts());
    }
  }, [dispatch, featuredLoading, featuredCount, error]);

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
      <PageMeta
        title="ShoeMarkNet - Premium Footwear Online"
        description="Discover premium footwear brands and styles with AI-powered recommendations and lightning-fast delivery"
        keywords="shoes, footwear, sneakers, premium, online shopping, AI recommendations"
      />

      {/* Main page content with gradient background */}
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-500">
        {/* Hero section - Main banner and call-to-action */}
        <HeroSection />

        {/* Featured products section with add-to-cart functionality */}
        <Suspense fallback={<SectionSkeleton title="Featured products" />}>
          {featuredLoading && featuredList.length === 0 ? (
            <SectionSkeleton title="Featured products" />
          ) : (
            <FeaturedProducts
              products={featuredList}
              onAddToCart={handleAddToCart}
            />
          )}
        </Suspense>

        {/* Product categories navigation */}
        <Suspense fallback={<SectionSkeleton title="Shop by category" rows={4} />}>
          <CategoriesSection />
        </Suspense>

        {/* Special offers and promotions */}
        <Suspense fallback={<SectionSkeleton title="Exclusive offers" rows={2} />}>
          <OffersSection />
        </Suspense>
      </main>
    </>
  );
};

export default Home;
