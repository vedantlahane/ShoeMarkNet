import { lazy, Suspense, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import PageMeta from '../components/seo/PageMeta';
import { AlertTriangle, RefreshCw } from 'lucide-react';

import { addToCart } from '../redux/slices/cartSlice';
import useFeaturedProducts from '../hooks/api/useFeaturedProducts';

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
      className="mx-auto max-w-screen-2xl px-4 sm:px-5 lg:px-6 py-16 animate-pulse"
    >
      <div className="h-8 w-48 rounded-full bg-white/10 mb-6"></div>
      <div className={`grid gap-6 sm:grid-cols-2 ${gridColsClass}`}>
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="h-48 rounded-3xl border border-white/10 bg-white/5"
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
  const {
    data: featuredList = [],
    isPending,
    isError,
    error,
    refetch,
  } = useFeaturedProducts({
    staleTime: 5 * 60 * 1000,
  });

  const featuredProducts = useMemo(
    () => (Array.isArray(featuredList) ? featuredList : []),
    [featuredList]
  );

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
  if (isError) {
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
            {error?.response?.data?.message || error?.message || "We couldn't load featured products."}
          </p>
          <button
            onClick={() => refetch()}
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
      <main className="relative min-h-screen overflow-hidden bg-theme text-theme transition-colors duration-500">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-500/20 via-indigo-500/15 to-purple-500/20 blur-3xl" aria-hidden="true" />
          <div className="absolute bottom-[-12rem] right-[15%] h-[32rem] w-[32rem] rounded-full bg-gradient-to-br from-fuchsia-500/10 via-purple-500/15 to-sky-500/10 blur-[220px]" aria-hidden="true" />
          <div className="absolute bottom-[-14rem] left-[12%] h-[24rem] w-[24rem] rounded-full bg-gradient-to-br from-emerald-500/10 via-cyan-500/10 to-blue-500/10 blur-[200px]" aria-hidden="true" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.12),_transparent_55%)]" aria-hidden="true" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(15,23,42,0.9)_0%,rgba(15,23,42,0.65)_40%,rgba(30,41,59,0.55)_100%)]" aria-hidden="true" />
        </div>

        <div className="relative z-10 flex flex-col">
          {/* Hero section - Main banner and call-to-action */}
          <HeroSection />

          {/* Featured products section with add-to-cart functionality */}
          <Suspense fallback={<SectionSkeleton title="Featured products" />}>
            {isPending && featuredProducts.length === 0 ? (
              <SectionSkeleton title="Featured products" />
            ) : (
              <FeaturedProducts
                products={featuredProducts}
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
        </div>
      </main>
    </>
  );
};

export default Home;
