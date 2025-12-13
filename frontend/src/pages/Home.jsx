// Home.jsx - Complete Fixed Version
import { lazy, Suspense, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import HeroSection from "../components/home/HeroSection";
import { addToCart } from "../redux/slices/cartSlice";
import useFeaturedProducts from "../hooks/api/useFeaturedProducts";
import useHomeContent from "../hooks/api/useHomeContent";

const FeaturedProducts = lazy(() => import("../components/home/FeaturedProducts"));
const CardSection = lazy(() => import("../components/home/CardsSection"));
const OffersSection = lazy(() => import("../components/home/OffersSection"));

const Home = () => {
  const dispatch = useDispatch();

  const {
    data: featuredList = [],
    isPending,
    isError: featuredError,
    refetch,
  } = useFeaturedProducts({
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: homeOverview,
    isPending: isHomePending,
    isError: homeError,
    refetch: refetchHome,
  } = useHomeContent({
    staleTime: 5 * 60 * 1000,
  });

  const featuredProducts = useMemo(() => {
    if (Array.isArray(featuredList) && featuredList.length > 0) {
      return featuredList;
    }

    const overviewFallback = homeOverview?.featuredProducts;
    if (Array.isArray(overviewFallback)) {
      return overviewFallback;
    }

    return [];
  }, [featuredList, homeOverview]);

  const isFeaturedLoading =
    (isPending || isHomePending) && featuredProducts.length === 0;

  const heroData = homeOverview?.hero;
  const promotions = homeOverview?.promotions ?? [];

  const handleAddToCart = useCallback(
    (product) => {
      if (!product?._id && !product?.id) {
        console.error('Product missing required ID field');
        return;
      }

      dispatch(
        addToCart({
          productId: product._id || product.id,
          quantity: 1,
          product,
        })
      );
    },
    [dispatch]
  );

  const handleRetry = useCallback(() => {
    if (featuredError) refetch();
    if (homeError) refetchHome();
  }, [featuredError, homeError, refetch, refetchHome]);

  const SectionSkeleton = ({ title, rows = 3 }) => {
    const gridColsClass = rows > 2 ? "lg:grid-cols-3" : "lg:grid-cols-2";

    return (
      <section
        aria-label={`${title} loading state`}
        className="container-app section-spacing animate-pulse"
      >
        <div className="mb-4 h-7 w-40 rounded-full bg-theme-secondary" />
        <div className={`grid gap-4 sm:grid-cols-2 ${gridColsClass}`}>
          {Array.from({ length: rows }).map((_, index) => (
            <div
              key={index}
              className="h-40 rounded-xl border border-theme bg-card shadow-sm"
            />
          ))}
        </div>
      </section>
    );
  };

  const ErrorFallback = ({ title, onRetry }) => (
    <section
      aria-label={`${title} error state`}
      className="container-app section-spacing text-center"
    >
      <div className="mb-4">
        <h3 className="text-base font-semibold text-theme mb-1.5">
          Unable to load {title.toLowerCase()}
        </h3>
        <p className="text-sm text-theme-secondary mb-3">
          Something went wrong. Please try again.
        </p>
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors duration-200"
        >
          Try Again
        </button>
      </div>
    </section>
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-page text-theme">
      <div className="relative z-10 flex flex-col">
        {/* Hero section */}
        <HeroSection
          data={heroData}
          isLoading={isHomePending && !heroData}
          error={homeError}
          onRetry={refetchHome}
        />

        {/* Featured products section */}
        <Suspense fallback={<SectionSkeleton title="Featured products" />}>
          {featuredError ? (
            <ErrorFallback title="Featured products" onRetry={handleRetry} />
          ) : isFeaturedLoading ? (
            <SectionSkeleton title="Featured products" />
          ) : (
            <FeaturedProducts
              products={featuredProducts}
              onAddToCart={handleAddToCart}
            />
          )}
        </Suspense>

        {/* Cards showcase */}
        <Suspense
          fallback={
            <SectionSkeleton title="Spotlight collections" rows={3} />
          }
        >
          <CardSection
            partners={homeOverview?.brands?.partners ?? []}
            categories={homeOverview?.categories ?? []}
            isLoading={isHomePending}
            error={homeError}
            onRetry={handleRetry}
          />
        </Suspense>

        {/* Special offers and promotions */}
        <Suspense
          fallback={<SectionSkeleton title="Exclusive offers" rows={2} />}
        >
          {homeError ? (
            <ErrorFallback title="Exclusive offers" onRetry={handleRetry} />
          ) : isHomePending && promotions.length === 0 ? (
            <SectionSkeleton title="Exclusive offers" rows={2} />
          ) : (
            <OffersSection promotions={promotions} />
          )}
        </Suspense>
      </div>
    </main>
  );
};

export default Home;
