import { lazy, Suspense, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import PageMeta from '../components/seo/PageMeta';
import HeroSection from '../components/home/HeroSection';
import { addToCart } from '../redux/slices/cartSlice';
import useFeaturedProducts from '../hooks/api/useFeaturedProducts';
import useHomeContent from '../hooks/api/useHomeContent';

const FeaturedProducts = lazy(() => import('../components/home/FeaturedProducts'));
const BrandsSection = lazy(() => import('../components/home/BrandsSection'));
const CategoriesSection = lazy(() => import('../components/home/CategoriesSection'));
const OffersSection = lazy(() => import('../components/home/OffersSection'));

const SectionSkeleton = ({ title, rows = 3 }) => {
  const gridColsClass = rows > 2 ? 'lg:grid-cols-3' : 'lg:grid-cols-2';

  return (
    <section
      aria-label={`${title} loading state`}
      className="mx-auto w-full  px-4 py-16 sm:px-6 lg:px-8 animate-pulse"
    >
      <div className="mb-6 h-8 w-48 rounded-full bg-slate-900/10 backdrop-blur dark:bg-slate-100/10" />
      <div className={`grid gap-6 sm:grid-cols-2 ${gridColsClass}`}>
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="h-48 rounded-3xl border border-slate-900/10 bg-white/60 shadow-lg shadow-slate-900/5 backdrop-blur dark:border-slate-100/10 dark:bg-slate-900/40 dark:shadow-slate-900/30"
          />
        ))}
      </div>
    </section>
  );
};

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

  const {
    data: homeOverview,
    isPending: isHomePending,
    refetch: refetchHome,
  } = useHomeContent({
    staleTime: 5 * 60 * 1000,
  });

  const featuredProducts = useMemo(
    () => (Array.isArray(featuredList) ? featuredList : []),
    [featuredList]
  );

  const heroData = homeOverview?.hero;
  const brandPartners = homeOverview?.brands?.partners ?? [];
  const brandMetrics = homeOverview?.brands?.metrics ?? [];
  const categoryCollection = homeOverview?.categories ?? [];
  const promotions = homeOverview?.promotions ?? [];
  const handleRefetch = useCallback(() => {
    if (isError) {
      refetch();
    }
    if (isHomeError) {
      refetchHome();
    }
  }, [refetch, refetchHome]);

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

  return (
    <>
      {/* SEO metadata for search engines */}
      <PageMeta
        title="ShoeMarkNet - Premium Footwear Online"
        description="Discover premium footwear brands and styles with AI-powered recommendations and lightning-fast delivery"
        keywords="shoes, footwear, sneakers, premium, online shopping, AI recommendations"
      />

      {/* Main page content with gradient background */}
      <main className="relative min-h-screen overflow-hidden text-slate-900 transition-colors duration-500 dark:text-slate-100">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.12),_transparent_55%)] dark:bg-[radial-gradient(circle_at_top,_rgba(71,85,105,0.15),_transparent_55%)]" aria-hidden="true" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.65)_0%,rgba(255,255,255,0.2)_45%,rgba(248,250,252,0.1)_100%)] dark:bg-[linear-gradient(120deg,rgba(15,23,42,0.92)_0%,rgba(15,23,42,0.65)_45%,rgba(15,23,42,0.5)_100%)]" aria-hidden="true" />
          <div className="absolute -top-48 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 blur-3xl dark:from-blue-500/20 dark:via-indigo-500/15 dark:to-purple-500/20" aria-hidden="true" />
          <div className="absolute bottom-[-12rem] right-[12%] h-[26rem] w-[26rem] rounded-full bg-gradient-to-br from-fuchsia-500/10 via-purple-500/10 to-sky-500/10 blur-[220px] dark:from-fuchsia-500/20 dark:via-purple-500/20 dark:to-sky-500/20" aria-hidden="true" />
          <div className="absolute bottom-[-10rem] left-[15%] h-[22rem] w-[22rem] rounded-full bg-gradient-to-br from-emerald-500/10 via-cyan-500/10 to-blue-500/10 blur-[200px] dark:from-emerald-500/20 dark:via-cyan-500/15 dark:to-blue-500/20" aria-hidden="true" />
        </div>

        <div className="relative z-10 flex flex-col gap-20 pb-24 pt-12 sm:pt-16">
          {/* Hero section - Main banner and call-to-action */}
          <HeroSection data={heroData} isLoading={isHomePending && !heroData} />

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

          {/* Partner brand showcase */}
          <Suspense fallback={<SectionSkeleton title="Partner brands" rows={3} />}>
            {isHomePending && brandPartners.length === 0 ? (
              <SectionSkeleton title="Partner brands" rows={3} />
            ) : (
              <BrandsSection partners={brandPartners} metrics={brandMetrics} />
            )}
          </Suspense>

          {/* Product categories navigation */}
          <Suspense fallback={<SectionSkeleton title="Shop by category" rows={4} />}>
            {isHomePending && categoryCollection.length === 0 ? (
              <SectionSkeleton title="Shop by category" rows={4} />
            ) : (
              <CategoriesSection categories={categoryCollection} />
            )}
          </Suspense>

          {/* Special offers and promotions */}
          <Suspense fallback={<SectionSkeleton title="Exclusive offers" rows={2} />}>
            {isHomePending && promotions.length === 0 ? (
              <SectionSkeleton title="Exclusive offers" rows={2} />
            ) : (
              <OffersSection promotions={promotions} />
            )}
          </Suspense>
        </div>
      </main>
    </>
  );
};

export default Home;
