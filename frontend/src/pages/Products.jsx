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
import ErrorMessage from '../components/common/feedback/ErrorMessage';
import SortDropdown from "../components/products/SortDropdown";
import ProductGrid from "../components/products/ProductGrid";
import PageLayout from '../components/common/layout/PageLayout';

// Hooks
import useLocalStorage from "../hooks/useLocalStorage";

// Utils
import { trackEvent } from "../utils/analytics";
import { formatCurrency } from "../utils/helpers";

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

const GENDER_LABELS = {
  men: "Men",
  women: "Women",
  unisex: "Unisex",
};

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
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1", 10)
  );
  const [itemsPerPage, setItemsPerPage] = useLocalStorage(
    "productsPerPage",
    parseInt(searchParams.get("limit") || "12", 10)
  );
  const [activeFilters, setActiveFilters] = useState([]);

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
    () =>
      debounce((query, filterParams) => {
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
    () =>
      debounce((filterParams) => {
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
    const chips = [];

    if (filters.search) {
      chips.push({
        key: "search",
        label: `Search: "${filters.search}"`,
        removable: true,
      });
    }

    if (filters.category) {
      const categoryMatch = categories.find(
        (category) => (category._id || category.name) === filters.category
      );
      chips.push({
        key: "category",
        label: `Category: ${categoryMatch?.name || filters.category}`,
        removable: true,
      });
    }

    if (filters.brand) {
      chips.push({
        key: "brand",
        label: `Brand: ${filters.brand}`,
        removable: true,
      });
    }

    if (filters.gender) {
      const genderLabel = GENDER_LABELS[filters.gender] || filters.gender;
      chips.push({
        key: "gender",
        label: `Gender: ${genderLabel}`,
        removable: true,
      });
    }

    if (filters.rating > 0) {
      chips.push({
        key: "rating",
        label: `Rating: ${filters.rating}+`,
        removable: true,
      });
    }

    if (filters.inStock) {
      chips.push({ key: "inStock", label: "In stock only", removable: true });
    }

    if (filters.onSale && !isSalePage) {
      chips.push({
        key: "onSale",
        label: "On sale",
        removable: true,
      });
    }

    const minPriceValue = Number(
      filters.priceRange?.min ?? DEFAULT_PRICE_RANGE.min
    );
    const maxPriceValue = Number(
      filters.priceRange?.max ?? DEFAULT_PRICE_RANGE.max
    );

    if (
      minPriceValue > DEFAULT_PRICE_RANGE.min ||
      maxPriceValue < DEFAULT_PRICE_RANGE.max
    ) {
      const maxLabel =
        maxPriceValue >= DEFAULT_PRICE_RANGE.max
          ? `${formatCurrency(DEFAULT_PRICE_RANGE.max)}+`
          : formatCurrency(maxPriceValue);

      chips.push({
        key: "priceRange",
        label: `Price: ${formatCurrency(minPriceValue)} - ${maxLabel}`,
        removable: true,
      });
    }

    setActiveFilters(chips);
  }, [filters, categories, isSalePage]);

  // Load categories on mount
  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length]);

  // Clear errors on mount
  useEffect(() => {
    dispatch(clearProductError());

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
    setCurrentPage(1);
    setFilters((prev) => ({ ...prev, ...newFilters }));

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
      previous_filter_count: activeFilters.length,
    });
  }, [dispatch, activeFilters.length, isSalePage]);

  const handleRemoveActiveFilter = useCallback(
    (key) => {
      switch (key) {
        case "category":
          handleFilterChange({ category: "" });
          break;
        case "brand":
          handleFilterChange({ brand: "" });
          break;
        case "gender":
          handleFilterChange({ gender: "" });
          break;
        case "rating":
          handleFilterChange({ rating: 0 });
          break;
        case "inStock":
          handleFilterChange({ inStock: false });
          break;
        case "priceRange":
          handleFilterChange({ priceRange: { ...DEFAULT_PRICE_RANGE } });
          break;
        case "onSale":
          if (!isSalePage) {
            handleFilterChange({ onSale: false });
          }
          break;
        case "search":
          handleFilterChange({ search: "" });
          dispatch(clearSearchResults());
          break;
        default:
          break;
      }
    },
    [dispatch, handleFilterChange, isSalePage]
  );

  // Render pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const showEllipsis = totalPages > 7;

    if (showEllipsis) {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pageNumbers.push(i);
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) pageNumbers.push(i);
      } else {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++)
          pageNumbers.push(i);
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    } else {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    }

    return (
      <div className="flex items-center justify-center gap-1">
        {/* Previous Button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex h-9 items-center gap-1 rounded-lg border border-gray-300 px-3 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path
              fillRule="evenodd"
              d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
              clipRule="evenodd"
            />
          </svg>
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Page Numbers */}
        {pageNumbers.map((page, index) =>
          page === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="flex h-9 w-9 items-center justify-center text-gray-500 dark:text-gray-400"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`flex h-9 min-w-[36px] items-center justify-center rounded-lg border px-3 text-sm transition-colors ${
                currentPage === page
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              {page}
            </button>
          )
        )}

        {/* Next Button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex h-9 items-center gap-1 rounded-lg border border-gray-300 px-3 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <span className="hidden sm:inline">Next</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path
              fillRule="evenodd"
              d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    );
  };

  return (
    <PageLayout
      title={isSalePage ? "Sale" : "All Products"}
      description={isSalePage ? "Great deals on your favorite shoes" : "Browse our complete collection of premium footwear"}
      breadcrumbs={
        <nav className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
          <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</Link>
          <span className="opacity-60">/</span>
          <span className="text-gray-900 dark:text-gray-200">{isSalePage ? "Sale" : "Products"}</span>
        </nav>
      }
    >
      <div className="space-y-6">
        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {/* Items per page */}
            <select
              value={itemsPerPage}
              onChange={(e) =>
                handlePerPageChange(parseInt(e.target.value, 10))
              }
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 transition-colors hover:border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:border-slate-600"
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
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setIsFilterPanelOpen(true)}
              className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 transition-colors hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:border-slate-600 dark:hover:bg-slate-700"
            >
              <i className="fas fa-filter text-xs" />
              <span>Filters</span>
              {activeFilters.length > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1.5 text-xs font-semibold text-white">
                  {activeFilters.length}
                </span>
              )}
            </button>
          </div>

          {/* Active Filters Display */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Active:
              </span>
              {activeFilters.map((filter) => (
                <span
                  key={filter.key}
                  className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                >
                  <span>{filter.label}</span>
                  {filter.removable && (
                    <button
                      type="button"
                      onClick={() => handleRemoveActiveFilter(filter.key)}
                      className="flex h-3.5 w-3.5 items-center justify-center rounded-full hover:bg-blue-200 dark:hover:bg-blue-800"
                      aria-label={`Remove ${filter.label}`}
                    >
                      <i className="fas fa-times text-[9px]" />
                    </button>
                  )}
                </span>
              ))}
              <button
                onClick={handleClearAllFilters}
                className="text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          {/* Loading State */}
          {currentLoading && productsList.length === 0 && (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-3 border-blue-500 border-t-transparent"></div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {isSearchMode ? "Searching..." : "Loading..."}
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
              <ErrorMessage message={error} onRetry={handleRetry} />
            </div>
          )}

          {/* Products Display */}
          {!currentLoading && !error && productsList.length > 0 && (
            <ProductGrid
              products={productsList}
              onAddToCart={handleAddProductToCart}
              onToggleWishlist={handleToggleProductWishlist}
              wishlistProductIds={wishlistProductIds}
            />
          )}

          {/* No Products */}
          {!currentLoading &&
            !error &&
            productsList.length === 0 &&
            !isSearchMode && (
              <div className="flex min-h-[300px] items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                    <i className="fas fa-box-open text-xl text-slate-400 dark:text-slate-500" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    No products found
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Try adjusting your filters or check back later.
                  </p>
                </div>
              </div>
            )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">{renderPagination()}</div>
          )}
        </div>

      {isFilterPanelOpen && (
        <div className="fixed inset-0" style={{ zIndex: 'var(--z-modal)' }}>
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setIsFilterPanelOpen(false)}
          />
          <div className="relative z-10 flex min-h-full items-start justify-center px-4 py-12 sm:px-6">
            <div className="w-full max-w-3xl rounded-2xl border border-slate-200/70 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/95">
              <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-3 dark:border-slate-700/60">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Filters</h2>
                <button
                  type="button"
                  onClick={() => setIsFilterPanelOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                  aria-label="Close filters"
                >
                  <i className="fas fa-times" />
                </button>
              </div>
              <div className="max-h-[65vh] overflow-y-auto px-5 py-4 custom-scrollbar">
                <ProductFilter
                  currentFilters={filters}
                  onFilterChange={handleFilterChange}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default Products;
