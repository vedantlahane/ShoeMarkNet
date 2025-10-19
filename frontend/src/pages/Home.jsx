import { lazy, Suspense, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import PageMeta from "../components/seo/PageMeta";
import HeroSection from "../components/home/HeroSection";
import { addToCart } from "../redux/slices/cartSlice";
import useFeaturedProducts from "../hooks/api/useFeaturedProducts";
import useHomeContent from "../hooks/api/useHomeContent";

const FeaturedProducts = lazy(() =>
  import("../components/home/FeaturedProducts")
);
const CardSection = lazy(() => import("../components/home/CardsSection"));
const OffersSection = lazy(() => import("../components/home/OffersSection"));

const SectionSkeleton = ({ title, rows = 3 }) => {
  const gridColsClass = rows > 2 ? "lg:grid-cols-3" : "lg:grid-cols-2";

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

  // Memoized featured products list, that means it only recalculates when featuredList changes
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

  /**
   * Handles adding a product to the cart.
   * Dispatches the addToCart action with product details.
   *
   * @param {Object} product - The product object to add to cart
   * @param {string} product._id - Product ID
   * @param {Object} product - Full product object for cart display
   */
  const handleAddToCart = useCallback(
    (product) => {
      dispatch(
        addToCart({
          productId: product._id,
          quantity: 1,
          product,
        })
      );
    },
    [dispatch]
  );

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
      

        <div className="relative z-10 flex flex-col  pb-24 pt-12 sm:pt-16">
          {/* Hero section - Main banner and call-to-action */}
          <HeroSection data={heroData} isLoading={isHomePending && !heroData} />

          {/* Featured products section with add-to-cart functionality */}
          <Suspense fallback={<SectionSkeleton title="Featured products" />}>
            {isFeaturedLoading ? (
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
            fallback={<SectionSkeleton title="Spotlight collections" rows={3} />}
          >
            <CardSection />
          </Suspense>

          {/* Product categories navigation */}
          {/* <Suspense
            fallback={<SectionSkeleton title="Shop by category" rows={4} />}
          >
            {isHomePending && categoryCollection.length === 0 ? (
              <SectionSkeleton title="Shop by category" rows={4} />
            ) : (
              <CategoriesSection categories={categoryCollection} />
            )}
          </Suspense> */}

          {/* Special offers and promotions */}
          <Suspense
            fallback={<SectionSkeleton title="Exclusive offers" rows={2} />}
          >
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
