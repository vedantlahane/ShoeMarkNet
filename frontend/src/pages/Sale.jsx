import { lazy, Suspense, useCallback, useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Sparkles, Tag, Flame, Clock, ShoppingBag, Percent } from "lucide-react";
import { addToCart } from "../redux/slices/cartSlice";
import { getProductsByCategory } from "../redux/slices/categorySlice";
import PageMeta from "../components/seo/PageMeta";
import PageLayout from '../components/common/layout/PageLayout';
import ProductCard from "../components/products/ProductCard";
import LoadingSpinner from "../components/common/feedback/LoadingSpinner";
import ErrorMessage from '../components/common/feedback/ErrorMessage';
import Pagination from '../components/common/navigation/Pagination';

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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 12 }).map((_, index) => (
        <div
          key={`skeleton-${index}`}
          className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 animate-pulse"
        >
          <div className="flex h-full flex-col space-y-3">
            <div className="h-44 rounded-lg bg-gray-100 dark:bg-slate-700"></div>
            <div className="h-4 w-3/4 rounded bg-gray-100 dark:bg-slate-700"></div>
            <div className="h-4 w-1/2 rounded bg-gray-100 dark:bg-slate-700"></div>
            <div className="mt-auto h-9 w-2/3 rounded-lg bg-gray-100 dark:bg-slate-700"></div>
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
        <div className="space-y-8">
          {/* Sale Hero Section */}
          <Suspense fallback={
            <div className="rounded-2xl bg-gradient-to-r from-red-100 via-orange-100 to-yellow-100 dark:from-red-900/20 dark:via-orange-900/20 dark:to-yellow-900/20 p-6 animate-pulse">
              <div className="h-48 rounded-xl bg-white/50 dark:bg-slate-800/50"></div>
            </div>
          }>
            <SaleHeroSection stats={saleStats} />
          </Suspense>

          {/* Sale Statistics */}
          <Suspense fallback={
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 rounded-xl bg-white dark:bg-slate-800 animate-pulse"></div>
              ))}
            </div>
          }>
            <SaleStats stats={saleStats} />
          </Suspense>

          {/* Sale Products Grid */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Hot Deals
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  {saleStats.total} products on sale
                </p>
              </div>

              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="discount:desc">Best Deals</option>
                <option value="price:asc">Lowest Price</option>
                <option value="rating:desc">Highest Rated</option>
                <option value="newest">Newest</option>
              </select>
            </div>

            {error ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-gray-200 dark:border-slate-700">
                <ErrorMessage
                  message={error}
                  onRetry={() => window.location.reload()}
                />
              </div>
            ) : (
              <div>
                {isLoading ? (
                  <ProductGridSkeleton />
                ) : productsList.length === 0 ? (
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-12 border border-gray-200 dark:border-slate-700 text-center">
                    <div className="w-14 h-14 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Tag className="w-7 h-7 text-gray-400 dark:text-slate-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No sale items available
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Check back later for amazing deals!
                    </p>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  >
                    {productsList.map((product, index) => (
                      <motion.div
                        key={product._id || product.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                      >
                        <ProductCard
                          product={product}
                          onAddToCart={() => handleAddToCart(product)}
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
              <div className="flex justify-center bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
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
          <div className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800/50 p-6 text-center">
            <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">
              Don't Miss Out!
            </h3>
            <p className="text-green-700 dark:text-green-300 mb-4 text-sm max-w-xl mx-auto">
              Limited-time offers with free shipping on orders over $50.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                Shop All Products
              </Link>
              <Link
                to="/categories"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-green-600 text-green-700 dark:text-green-400 font-medium rounded-lg hover:bg-green-50 dark:hover:bg-slate-700 transition-colors"
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