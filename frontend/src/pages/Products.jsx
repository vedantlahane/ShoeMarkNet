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
import SearchBar from "../components/common/SearchBar";
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

  const debouncedSearch = useCallback(
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

  const debouncedFetchProducts = useCallback(
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

  // Handle search
  const handleSearch = useCallback((searchTerm) => {
    setCurrentPage(1);
    setFilters((prev) => ({ ...prev, search: searchTerm }));
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
  }, [dispatch, filters, currentPage, itemsPerPage]);

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
  }, [dispatch, activeFilters.size]);


  

  return (
    <main className="relative min-h-screen overflow-hidden text-slate-900 transition-colors duration-500 dark:text-slate-100 pt-28 mx-auto w-full xl:max-w-11/12 px-3 sm:px-4 lg:px-6">
        
    </main>
  );
};

export default Products;
