import { lazy, Suspense, useCallback, useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Sparkles, Tag, Flame, Clock, ShoppingBag, Percent } from "lucide-react";
import { addToCart } from "../redux/slices/cartSlice";
import { getProductsByCategory } from "../redux/slices/categorySlice";
import PageMeta from "../components/seo/PageMeta";
import PageLayout from "../components/common/PageLayout";
import ProductCard from "../components/products/ProductCard";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";
import Pagination from "../components/common/Pagination";

const SaleHeroSection = lazy(() => import("../components/sale/SaleHeroSection"));
const DiscountTiers = lazy(() => import("../components/sale/DiscountTiers"));
const SaleOffersSection = lazy(() => import("../components/sale/SaleOffersSection"));
const SaleStats = lazy(() => import("../components/sale/SaleStats"));

const Sale = () => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("discount:desc");
  const [showFilters, setShowFilters] = useState(false);

  // Get sale products from Redux store
  const {
    products: productsList = [],
    pagination,
    isLoading,
    error,
  } = useSelector((state) => state.category);

  // Fetch sale products on component mount and when filters change
  useEffect(() => {
    dispatch(
      getProductsByCategory({
        categoryId: "sale",
        filters: {
          page: currentPage,
          limit: 24,
          sort: sortBy,
          discount: true, // Only fetch products with discounts
          minDiscount: 10, // Minimum 10% discount
        },
        includeTree: false,
      })
    );
  }, [dispatch, currentPage, sortBy]);

  // Handle add to cart
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

  // Handle page change
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((newSort) => {
    setSortBy(newSort);
    setCurrentPage(1);
  }, []);

  // Calculate sale statistics
  const saleStats = useMemo(() => {
    const total = pagination?.total || productsList.length;
    const onSale = productsList.filter(product => product.discount > 0).length;
    const averageDiscount = productsList.length > 0
      ? productsList.reduce((sum, product) => sum + (product.discount || 0), 0) / productsList.length
      : 0;
    const maxDiscount = Math.max(...productsList.map(p => p.discount || 0), 0);

    return {
      total,
      onSale,
      averageDiscount: Math.round(averageDiscount),
      maxDiscount,
    };
  }, [productsList, pagination]);

  // SEO Meta data
  const metaTitle = "Sale & Discounts | Up to 70% Off | ShoeMarkNet";
  const metaDescription = `Limited time offers! Save up to ${saleStats.maxDiscount}% on premium footwear. ${saleStats.total} discounted items available. Free shipping on orders over $50.`;

  // Page breadcrumbs
  const headerBreadcrumbs = useMemo(() => (
    <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
      <Link to="/" className="transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400">
        Home
      </Link>
      <span className="opacity-60">/</span>
      <span className="text-gray-900 dark:text-gray-100">Sale</span>
    </nav>
  ), []);

  // Loading skeleton component
  const ProductGridSkeleton = () => (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 12 }).map((_, index) => (
        <div
          key={`skeleton-${index}`}
          className="rounded-2xl border border-slate-200/70 bg-white/60 p-4 shadow-sm backdrop-blur-lg dark:border-slate-700/60 dark:bg-slate-900/40 animate-pulse"
        >
          <div className="flex h-full flex-col space-y-4">
            <div className="h-48 rounded-xl bg-white/70 dark:bg-slate-800/70"></div>
            <div className="h-4 w-3/4 rounded-full bg-white/80 dark:bg-slate-800/80"></div>
            <div className="h-4 w-1/2 rounded-full bg-white/80 dark:bg-slate-800/80"></div>
            <div className="mt-auto h-10 w-2/3 rounded-2xl bg-white/80 dark:bg-slate-800/80"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <PageMeta title={metaTitle} description={metaDescription} />

      <PageLayout
        title="Sale & Discounts"
        description="Limited time offers on premium footwear"
        breadcrumbs={headerBreadcrumbs}
      >
        <div className="space-y-12">
          {/* Sale Hero Section */}
          <Suspense fallback={
            <div className="rounded-3xl bg-gradient-to-r from-red-500/20 via-orange-500/20 to-yellow-500/20 p-8 animate-pulse">
              <div className="h-64 rounded-2xl bg-white/30 dark:bg-slate-800/30"></div>
            </div>
          }>
            <SaleHeroSection stats={saleStats} />
          </Suspense>

          {/* Sale Statistics */}
          <Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 rounded-2xl bg-white/60 animate-pulse"></div>
              ))}
            </div>
          }>
            <SaleStats stats={saleStats} />
          </Suspense>

          {/* Discount Tiers */}
          <Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 rounded-2xl bg-white/60 animate-pulse"></div>
              ))}
            </div>
          }>
            <DiscountTiers products={productsList} />
          </Suspense>

          {/* Sale Offers Section */}
          <Suspense fallback={
            <div className="h-96 rounded-2xl bg-white/60 animate-pulse"></div>
          }>
            <SaleOffersSection />
          </Suspense>

          {/* Sale Products Grid */}
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  🔥 Hot Deals
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Limited time offers on premium footwear
                </p>
              </div>

              <div className="flex items-center gap-4">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="rounded-xl border border-slate-200/70 bg-white/70 px-4 py-2 text-sm font-medium text-slate-900 shadow-sm backdrop-blur-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-slate-100"
                >
                  <option value="discount:desc">Best Deals</option>
                  <option value="price:asc">Lowest Price</option>
                  <option value="rating:desc">Highest Rated</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-200/80 bg-white/60 p-12 shadow-sm backdrop-blur-lg dark:border-red-900/60 dark:bg-slate-900/40">
                <ErrorMessage
                  message={error}
                  onRetry={() => window.location.reload()}
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200/70 bg-white/60 p-6 shadow-sm backdrop-blur-lg dark:border-slate-700/60 dark:bg-slate-900/40">
                {isLoading ? (
                  <ProductGridSkeleton />
                ) : productsList.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <i className="fas fa-tags text-2xl text-slate-400 dark:text-slate-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        No sale items available
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        Check back later for amazing deals!
                      </p>
                    </div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  >
                    {productsList.map((product, index) => (
                      <motion.div
                        key={product._id || product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="relative group"
                      >
                        {/* Sale Badge */}
                        {product.discount > 0 && (
                          <div className="absolute -top-2 -right-2 z-10 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                            -{product.discount}%
                          </div>
                        )}

                        <ProductCard
                          product={product}
                          onAddToCart={() => handleAddToCart(product)}
                          onQuickView={() => {}} // Placeholder for quick view
                          onToggleWishlist={() => {}} // Placeholder for wishlist
                          index={index}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center rounded-2xl border border-slate-200/70 bg-white/60 p-4 shadow-sm backdrop-blur-lg dark:border-slate-700/60 dark:bg-slate-900/40">
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                  showInfo={true}
                  totalItems={saleStats.total}
                  itemsPerPage={24}
                />
              </div>
            )}
          </div>

          {/* Sale Footer CTA */}
          <div className="rounded-3xl border border-green-200/50 bg-gradient-to-r from-green-50 to-emerald-50 p-8 text-center dark:border-green-800/50 dark:from-green-950/50 dark:to-emerald-950/50">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold text-green-800 dark:text-green-200">
                Don't Miss Out!
              </h3>
            </div>
            <p className="text-green-700 dark:text-green-300 mb-6 max-w-2xl mx-auto">
              These limited-time offers won't last long! Shop now and save big on premium footwear.
              Free shipping on orders over $50. Easy returns within 30 days.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:bg-green-700 hover:shadow-xl hover:-translate-y-0.5"
              >
                <ShoppingBag className="h-5 w-5" />
                Shop All Products
              </Link>
              <Link
                to="/categories"
                className="inline-flex items-center gap-2 rounded-xl border border-green-600 bg-white/80 px-6 py-3 font-semibold text-green-700 shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-green-50 hover:shadow-md dark:bg-slate-900/80 dark:text-green-300 dark:hover:bg-slate-900"
              >
                Browse Categories
              </Link>
            </div>
          </div>
        </div>
      </PageLayout>
    </>
  );
};

export default Sale;