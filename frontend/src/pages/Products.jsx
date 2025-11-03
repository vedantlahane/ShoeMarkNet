import { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useLocation, Link } from "react-router-dom";
import { debounce } from "lodash";

// Redux actions
import {
  fetchProducts,
  fetchCategories,
  searchProducts,
  clearProductError,
  clearSearchResults,
} from "../redux/slices/productSlice";
import { addToCart } from "../redux/slices/cartSlice";
import { toggleWishlistItem } from "../redux/slices/wishlistSlice";

// Components
import ProductFilter from "../components/products/ProductFilter";
import ErrorMessage from "../components/common/ErrorMessage";
import SortDropdown from "../components/products/SortDropdown";
import ViewToggle from "../components/products/ViewToggle";
import ProductGrid from "../components/products/ProductGrid";
import ProductList from "../components/products/ProductList";
import Pagination from "../components/common/Pagination";

// Hooks
import useLocalStorage from "../hooks/useLocalStorage";

// Utils
import { trackEvent } from "../utils/analytics";

const DEFAULT_PRICE_RANGE = { min: 0, max: 1000 };

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First", icon: "fa-clock" },
  {
    value: "price:asc",
    label: "Price: Low to High",
    icon: "fa-sort-amount-up",
  },
  {
    value: "price:desc",
    label: "Price: High to Low",
    icon: "fa-sort-amount-down",
  },
  { value: "rating:desc", label: "Highest Rated", icon: "fa-star" },
  { value: "popularity:desc", label: "Most Popular", icon: "fa-fire" },
  { value: "name:asc", label: "A to Z", icon: "fa-sort-alpha-up" },
  { value: "name:desc", label: "Z to A", icon: "fa-sort-alpha-down" },
];

const ITEMS_PER_PAGE_OPTIONS = [
  { value: 12, label: "12 per page" },
  { value: 24, label: "24 per page" },
  { value: 48, label: "48 per page" },
  { value: 96, label: "96 per page" },
];

const Products = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isSalePage = location.pathname === "/sale";

  // Redux state
  const {
    products,
    searchResults,
    loading,
    searchLoading,
    error,
    pagination,
    totalProducts,
  } = useSelector((state) => state.product);
  const categories = useSelector((state) => state.product.categories || []);
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);

  // Local state
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1", 10)
  );
  const [itemsPerPage, setItemsPerPage] = useLocalStorage(
    "productsPerPage",
    parseInt(searchParams.get("limit") || "12", 10)
  );
  const [viewMode, setViewMode] = useLocalStorage("productsViewMode", "grid");
  const [activeFilters, setActiveFilters] = useState(new Set());

  // Initialize filters from URL params
  const [filters, setFilters] = useState(() => ({
    category: searchParams.get("category") || "",
    brand: searchParams.get("brand") || "",
    gender: searchParams.get("gender") || "",
    search: searchParams.get("search") || "",
    priceRange: {
      min: parseInt(
        searchParams.get("minPrice") || String(DEFAULT_PRICE_RANGE.min),
        10
      ),
      max: parseInt(
        searchParams.get("maxPrice") || String(DEFAULT_PRICE_RANGE.max),
        10
      ),
    },
    rating: parseInt(searchParams.get("rating") || "0", 10),
    inStock: searchParams.get("inStock") === "true",
    onSale: searchParams.get("onSale") === "true" || isSalePage,
    sort: searchParams.get("sort") || "newest",
    page: currentPage,
    limit: itemsPerPage,
  }));

  const wishlistProductIds = useMemo(
    () =>
      wishlistItems
        .map((item) => {
          if (item.product?._id) return item.product._id;
          if (item.product?.id) return item.product.id;
          if (item._id) return item._id;
          if (item.id) return item.id;
          return null;
        })
        .filter(Boolean),
    [wishlistItems]
  );

  // Debounced search and filter functions
  const buildFilterParams = useCallback((baseFilters, overrides = {}) => {
    const merged = { ...baseFilters, ...overrides };
    const { priceRange, ...rest } = merged;

    if (priceRange) {
      const min = Number(priceRange.min);
      const max = Number(priceRange.max);

      if (Number.isFinite(min) && min > DEFAULT_PRICE_RANGE.min) {
        rest.minPrice = min;
      } else {
        delete rest.minPrice;
      }

      if (Number.isFinite(max) && max < DEFAULT_PRICE_RANGE.max) {
        rest.maxPrice = max;
      } else {
        delete rest.maxPrice;
      }
    }

    if (!rest.search || !rest.search.trim()) {
      delete rest.search;
    }

    return rest;
  }, []);

  const debouncedSearch = useMemo(
    () => debounce((query, filterParams) => {
      if (query.trim()) {
        dispatch(searchProducts({ query, filters: filterParams }));
        trackEvent("search", {
          search_term: query,
          category: filterParams.category || "all",
        });
      } else {
        dispatch(fetchProducts(filterParams));
      }
    }, 500),
    [dispatch]
  );

  const debouncedFetchProducts = useMemo(
    () => debounce((filterParams) => {
      dispatch(fetchProducts(filterParams));
    }, 300),
    [dispatch]
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.();
      debouncedFetchProducts.cancel?.();
    };
  }, [debouncedSearch, debouncedFetchProducts]);

  // Memoized values
  const isSearchMode = useMemo(() => !!filters.search.trim(), [filters.search]);
  const productsList = useMemo(() => {
    if (isSearchMode) {
      return Array.isArray(searchResults) ? searchResults : [];
    }
    return Array.isArray(products) ? products : [];
  }, [isSearchMode, searchResults, products]);

  const currentLoading = useMemo(() => {
    return isSearchMode ? searchLoading : loading;
  }, [isSearchMode, searchLoading, loading]);

  const totalCount = useMemo(() => {
    return totalProducts || productsList.length;
  }, [totalProducts, productsList.length]);

  const totalPages = useMemo(() => {
    return pagination?.totalPages || Math.ceil(totalCount / itemsPerPage);
  }, [pagination, totalCount, itemsPerPage]);

  // Update active filters for filter chips
  useEffect(() => {
    const active = new Set();
    if (filters.category) active.add(`category:${filters.category}`);
    if (filters.brand) active.add(`brand:${filters.brand}`);
    if (filters.gender) active.add(`gender:${filters.gender}`);
    if (filters.rating > 0) active.add(`rating:${filters.rating}`);
    if (filters.inStock) active.add("inStock");
    if (filters.onSale) active.add("onSale");
    if (
      filters.priceRange?.min > DEFAULT_PRICE_RANGE.min ||
      filters.priceRange.max < DEFAULT_PRICE_RANGE.max
    ) {
      active.add(`price:${filters.priceRange.min}-${filters.priceRange.max}`);
    }
    setActiveFilters(active);
  }, [filters]);

  // Load categories on mount
  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length]);

  // Clear errors on mount
  useEffect(() => {
    dispatch(clearProductError());

    // Track page view
    trackEvent("page_view", {
      page_title: isSalePage ? "Sale" : "Products",
      page_location: window.location.href,
      content_category: "product_listing",
    });
  }, [dispatch, isSalePage]);

  useEffect(() => {
    if (isSalePage && !filters.onSale) {
      setFilters((prev) => ({ ...prev, onSale: true }));
    }
  }, [isSalePage, filters.onSale]);

  // Handle URL and data synchronization
  useEffect(() => {
    // Update URL with all current filters
    const params = new URLSearchParams();
    if (filters.category) params.set("category", filters.category);
    if (filters.brand) params.set("brand", filters.brand);
    if (filters.gender) params.set("gender", filters.gender);
    if (filters.search) params.set("search", filters.search);
    if (filters.priceRange?.min > DEFAULT_PRICE_RANGE.min)
      params.set("minPrice", filters.priceRange.min.toString());
    if (filters.priceRange?.max < DEFAULT_PRICE_RANGE.max)
      params.set("maxPrice", filters.priceRange.max.toString());
    if (filters.rating > 0) params.set("rating", filters.rating.toString());
    if (filters.inStock) params.set("inStock", "true");
    if (filters.onSale) params.set("onSale", "true");
    if (filters.sort !== "newest") params.set("sort", filters.sort);
    if (currentPage > 1) params.set("page", currentPage.toString());
    if (itemsPerPage !== 12) params.set("limit", itemsPerPage.toString());

    const newParamsString = params.toString();
    const currentParamsString = searchParams.toString();

    if (newParamsString !== currentParamsString) {
      setSearchParams(params, { replace: true });
    }

    // Fetch products with current filters
    const filterParams = buildFilterParams(filters, {
      onSale: isSalePage ? true : filters.onSale,
      page: currentPage,
      limit: itemsPerPage,
    });

    if (filters.search.trim()) {
      debouncedSearch(filters.search, filterParams);
    } else {
      debouncedFetchProducts(filterParams);
    }
  }, [
    filters,
    currentPage,
    itemsPerPage,
    debouncedSearch,
    debouncedFetchProducts,
    setSearchParams,
    searchParams,
    isSalePage,
    buildFilterParams,
  ]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters) => {
    // Reset to page 1 when filters change
    setCurrentPage(1);
    setFilters((prev) => ({ ...prev, ...newFilters }));

    // Track filter usage
    trackEvent("filter_applied", {
      filter_type: Object.keys(newFilters)[0],
      filter_value: Object.values(newFilters)[0],
    });
  }, []);

  // Handle sort change
  const handleSortChange = useCallback(
    (sortValue) => {
      handleFilterChange({ sort: sortValue });

      trackEvent("sort_applied", {
        sort_option: sortValue,
      });
    },
    [handleFilterChange]
  );

  // Handle pagination
  const handlePageChange = useCallback(
    (newPage) => {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });

      trackEvent("pagination_click", {
        page_number: newPage,
        total_pages: totalPages,
      });
    },
    [totalPages]
  );

  // Handle items per page change
  const handlePerPageChange = useCallback(
    (newLimit) => {
      setItemsPerPage(newLimit);
      setCurrentPage(1);

      trackEvent("items_per_page_changed", {
        items_per_page: newLimit,
      });
    },
    [setItemsPerPage]
  );

  // Handle view mode change
  const handleViewModeChange = useCallback(
    (mode) => {
      setViewMode(mode);

      trackEvent("view_mode_changed", {
        view_mode: mode,
      });
    },
    [setViewMode]
  );

  const handleAddProductToCart = useCallback(
    (product) => {
      const productId = product?._id || product?.id;
      if (!productId) return;

      dispatch(
        addToCart({
          productId,
          quantity: 1,
          product,
        })
      );

      trackEvent("add_to_cart", {
        product_id: productId,
        product_name: product?.name,
        price: product?.price,
      });
    },
    [dispatch]
  );

  const handleToggleProductWishlist = useCallback(
    (product) => {
      const productId = product?._id || product?.id;
      if (!productId) return;

      const isCurrentlySaved = wishlistProductIds.includes(productId);

      dispatch(
        toggleWishlistItem({
          productId,
          product,
        })
      );

      trackEvent(isCurrentlySaved ? "wishlist_removed" : "wishlist_added", {
        product_id: productId,
        product_name: product?.name,
      });
    },
    [dispatch, wishlistProductIds]
  );

  // Handle retry
  const handleRetry = useCallback(() => {
    dispatch(clearProductError());
    const filterParams = buildFilterParams(filters, {
      page: currentPage,
      limit: itemsPerPage,
    });

    if (filters.search.trim()) {
      dispatch(
        searchProducts({ query: filters.search, filters: filterParams })
      );
    } else {
      dispatch(fetchProducts(filterParams));
    }

    trackEvent("retry_clicked", {
      error_type: "products_fetch_failed",
    });
  }, [dispatch, filters, currentPage, itemsPerPage, buildFilterParams]);

  // Handle clear all filters
  const handleClearAllFilters = useCallback(() => {
    const clearedFilters = {
      category: "",
      brand: "",
      gender: "",
      search: "",
      priceRange: { ...DEFAULT_PRICE_RANGE },
      rating: 0,
      inStock: false,
      onSale: isSalePage,
      sort: "newest",
    };

    setFilters(clearedFilters);
    setCurrentPage(1);
    dispatch(clearSearchResults());

    trackEvent("filters_cleared", {
      previous_filter_count: activeFilters.size,
    });
  }, [dispatch, activeFilters.size, isSalePage]);


  

  return (
    <main className="relative min-h-screen overflow-hidden text-slate-900 transition-colors duration-500 dark:text-slate-100 pt-28 mx-auto w-full xl:max-w-11/12 px-3 sm:px-4 lg:px-6">
      <div className="relative z-10 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col gap-6 rounded-2xl border border-slate-200/70 bg-white/60 p-6 shadow-sm backdrop-blur-lg dark:border-slate-700/60 dark:bg-slate-900/40">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {isSalePage ? 'Sale Products' : 'All Products'}
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {totalCount > 0 ? `Showing ${productsList.length} of ${totalCount} products` : 'Discover our amazing collection'}
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Items per page */}
              <select
                value={itemsPerPage}
                onChange={(e) => handlePerPageChange(parseInt(e.target.value, 10))}
                className="rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-sm font-medium text-slate-900 shadow-sm backdrop-blur-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-slate-100"
              >
                {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Sort Dropdown */}
              <SortDropdown
                value={filters.sort}
                options={SORT_OPTIONS}
                onChange={handleSortChange}
              />

              {/* View Toggle */}
              <ViewToggle value={viewMode} onChange={handleViewModeChange} />

              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-slate-200/70 bg-white/70 px-4 py-2 text-sm font-medium text-slate-900 shadow-sm backdrop-blur-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg lg:hidden dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-slate-100"
              >
                <i className="fas fa-filter" />
                Filters
                {activeFilters.size > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
                    {activeFilters.size}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFilters.size > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Active filters:
              </span>
              {Array.from(activeFilters).map((filter) => (
                <span
                  key={filter}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                >
                  {filter}
                </span>
              ))}
              <button
                onClick={handleClearAllFilters}
                className="text-xs font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden w-80 lg:block">
            <div className="sticky top-32 rounded-2xl border border-slate-200/70 bg-white/60 p-6 shadow-sm backdrop-blur-lg dark:border-slate-700/60 dark:bg-slate-900/40">
              <ProductFilter
                currentFilters={filters}
                onFilterChange={handleFilterChange}
              />
            </div>
          </aside>

          {/* Products Section */}
          <div className="flex-1 space-y-6">
            {/* Loading State */}
            {currentLoading && productsList.length === 0 && (
              <div className="flex items-center justify-center rounded-2xl border border-slate-200/70 bg-white/60 p-12 shadow-sm backdrop-blur-lg dark:border-slate-700/60 dark:bg-slate-900/40">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                  <p className="text-slate-600 dark:text-slate-400">
                    {isSearchMode ? 'Searching products...' : 'Loading products...'}
                  </p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <ErrorMessage
                message={error}
                onRetry={handleRetry}
                className="rounded-2xl border border-red-200/80 bg-white/60 shadow-sm backdrop-blur-lg dark:border-red-900/60 dark:bg-slate-900/40"
              />
            )}

            {/* Products Display */}
            {!currentLoading && !error && productsList.length > 0 && (
              <div className="rounded-2xl border border-slate-200/70 bg-white/60 p-6 shadow-sm backdrop-blur-lg dark:border-slate-700/60 dark:bg-slate-900/40">
                {viewMode === 'grid' ? (
                  <ProductGrid
                    products={productsList}
                    onAddToCart={handleAddProductToCart}
                    onToggleWishlist={handleToggleProductWishlist}
                    wishlistProductIds={wishlistProductIds}
                  />
                ) : (
                  <ProductList
                    products={productsList}
                    onAddToCart={handleAddProductToCart}
                    onToggleWishlist={handleToggleProductWishlist}
                    wishlistProductIds={wishlistProductIds}
                  />
                )}
              </div>
            )}

            {/* No Products */}
            {!currentLoading && !error && productsList.length === 0 && !isSearchMode && (
              <div className="flex items-center justify-center rounded-2xl border border-slate-200/70 bg-white/60 p-12 shadow-sm backdrop-blur-lg dark:border-slate-700/60 dark:bg-slate-900/40">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <i className="fas fa-box-open text-2xl text-slate-400 dark:text-slate-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    No products found
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Try adjusting your filters or check back later.
                  </p>
                </div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center rounded-2xl border border-slate-200/70 bg-white/60 p-4 shadow-sm backdrop-blur-lg dark:border-slate-700/60 dark:bg-slate-900/40">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filter Modal */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileFilterOpen(false)} />
            <div className="absolute right-0 top-0 h-full w-80 bg-white/95 p-6 shadow-xl backdrop-blur-lg dark:bg-slate-900/95">
              <ProductFilter
                currentFilters={filters}
                onFilterChange={handleFilterChange}
                onClose={() => setIsMobileFilterOpen(false)}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Products;
