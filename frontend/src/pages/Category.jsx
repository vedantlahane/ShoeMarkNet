import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useSearchParams, Link } from "react-router-dom";
import PageMeta from "../components/seo/PageMeta";
import PageLayout from '../components/common/layout/PageLayout';
import { toast } from "react-toastify";

// Redux actions
import {
  fetchCategories,
  fetchCategoryTree,
  getCategoryById,
  getCategoryBreadcrumb,
  getProductsByCategory,
} from "../redux/slices/categorySlice";

// Components
import ProductCard from "../components/products/ProductCard";
import ProductGrid from "../components/products/ProductGrid";
import LoadingSpinner from "../components/common/feedback/LoadingSpinner";
import ErrorMessage from '../components/common/feedback/ErrorMessage';
import Pagination from '../components/common/navigation/Pagination';
import CategoryFilters from "../components/category/CategoryFilters";
import SubcategoryNav from "../components/category/SubcategoryNav";
import ProductQuickView from "../components/product-details/ProductQuickView";
import CompareDrawer from "../components/product-details/CompareDrawer";

// Hooks
import useLocalStorage from "../hooks/useLocalStorage";

// Utils
import { trackEvent } from "../utils/analytics";

// Constants
const SORT_OPTIONS = [
  { value: "name:asc", label: "Name: A-Z", icon: "fa-sort-alpha-up" },
  { value: "name:desc", label: "Name: Z-A", icon: "fa-sort-alpha-down" },
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
  { value: "newest", label: "Newest First", icon: "fa-clock" },
  { value: "discount:desc", label: "Best Deals", icon: "fa-percentage" },
];

const FILTER_OPTIONS = [
  { value: "all", label: "All Products", icon: "fa-th" },
  { value: "sale", label: "On Sale", icon: "fa-percentage" },
  { value: "new", label: "New Arrivals", icon: "fa-sparkles" },
  { value: "popular", label: "Popular", icon: "fa-fire" },
  { value: "featured", label: "Featured", icon: "fa-star" },
  { value: "inStock", label: "In Stock", icon: "fa-check-circle" },
];

const VIEW_MODES = [
  { value: "grid", icon: "fa-th-large", label: "Grid View" },
  { value: "list", icon: "fa-list", label: "List View" },
  { value: "compact", icon: "fa-th", label: "Compact View" },
];

const ITEMS_PER_PAGE_OPTIONS = [
  { value: 12, label: "12 items" },
  { value: 24, label: "24 items" },
  { value: 48, label: "48 items" },
  { value: 96, label: "96 items" },
];

const Category = () => {
  const routeParams = useParams();
  const categoryName =
    routeParams.categoryId ||
    routeParams.categoryName ||
    routeParams.slug ||
    routeParams.id ||
    null;
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  // Check if this is a sale page
  const isSalePage = useMemo(() => {
    const saleKeywords = ['sale', 'discount', 'offer', 'deals', 'clearance', 'promotion'];
    return categoryName && saleKeywords.some(keyword =>
      categoryName.toLowerCase().includes(keyword)
    );
  }, [categoryName]);

  // Redux state
  const {
    categories,
    categoryTree,
    currentCategory,
    breadcrumb,
    products,
    pagination,
    isLoading,
    error,
    categoryInfo,
  } = useSelector((state) => state.category);

  const wishlistItems = useSelector((state) => state.wishlist?.items || []);
  const wishlistProductIds = useMemo(() => wishlistItems.map(item => item._id), [wishlistItems]);

  // Local state
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "name:asc");
  const [filterBy, setFilterBy] = useState(searchParams.get("filter") || "all");
  const [viewMode, setViewMode] = useLocalStorage("categoryViewMode", "grid");
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1", 10)
  );
  const [itemsPerPage, setItemsPerPage] = useLocalStorage(
    "categoryItemsPerPage",
    24
  );
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [priceRange, setPriceRange] = useState({
    min: parseInt(searchParams.get("minPrice") || "0", 10),
    max: parseInt(searchParams.get("maxPrice") || "10000", 10),
  });
  const [selectedBrands, setSelectedBrands] = useState(
    searchParams.get("brands") ? searchParams.get("brands").split(",") : []
  );
  const [selectedRating, setSelectedRating] = useState(
    parseInt(searchParams.get("rating") || "0", 10)
  );

  // UI state
  const [animateElements, setAnimateElements] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [compareItems, setCompareItems] = useState([]);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Initialize animations
  useEffect(() => {
    setTimeout(() => setAnimateElements(true), 100);
  }, []);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Always fetch categories and tree for navigation
        await Promise.all([
          dispatch(fetchCategories()),
          dispatch(fetchCategoryTree()),
        ]);

        // Fetch category details and breadcrumb only if a category is selected
        if (categoryName) {
          await Promise.all([
            dispatch(getCategoryById(categoryName)),
            dispatch(getCategoryBreadcrumb(categoryName)),
          ]);
        }

        // Track page view
        trackEvent("category_page_view", {
          category: categoryName,
          is_sale_page: isSalePage,
          page_location: window.location.href,
          referrer: document.referrer,
        });
      } catch (error) {
        console.error("Failed to fetch category data:", error);
      }
    };

    fetchData();
  }, [dispatch, categoryName, isSalePage]);

  // Fetch products with filters - only when a category is selected
  useEffect(() => {
    // Don't fetch products if no category is selected
    if (!categoryName) return;

    const filters = {
      category: categoryName,
      page: currentPage,
      limit: itemsPerPage,
      sort: sortBy,
      ...(filterBy !== "all" && { filter: filterBy }),
      ...(priceRange.min > 0 && { minPrice: priceRange.min }),
      ...(priceRange.max < 10000 && { maxPrice: priceRange.max }),
      ...(selectedBrands.length > 0 && { brands: selectedBrands.join(",") }),
      ...(selectedRating > 0 && { rating: selectedRating }),
    };

    // For sale pages, automatically filter for sale items
    if (isSalePage) {
      filters.filter = "sale";
      filters.sort = "discount:desc"; // Default to best deals for sale pages
    }

    dispatch(
      getProductsByCategory({
        categoryId: categoryName,
        filters: {
          ...filters,
          ...(searchTerm && { search: searchTerm }),
        },
        includeTree: true,
      })
    );
  }, [
    dispatch,
    categoryName,
    currentPage,
    itemsPerPage,
    sortBy,
    filterBy,
    searchTerm,
    priceRange,
    selectedBrands,
    selectedRating,
    isSalePage,
  ]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (sortBy !== "name:asc") params.set("sort", sortBy);
    if (filterBy !== "all") params.set("filter", filterBy);
    if (currentPage > 1) params.set("page", currentPage.toString());
    if (searchTerm) params.set("search", searchTerm);
    if (priceRange.min > 0) params.set("minPrice", priceRange.min.toString());
    if (priceRange.max < 10000)
      params.set("maxPrice", priceRange.max.toString());
    if (selectedBrands.length > 0)
      params.set("brands", selectedBrands.join(","));
    if (selectedRating > 0) params.set("rating", selectedRating.toString());

    const newParamsString = params.toString();
    const currentParamsString = searchParams.toString();

    if (newParamsString !== currentParamsString) {
      setSearchParams(params, { replace: true });
    }
  }, [
    sortBy,
    filterBy,
    currentPage,
    searchTerm,
    priceRange,
    selectedBrands,
    selectedRating,
    searchParams,
    setSearchParams,
  ]);

  // Memoized calculations
  const productsList = useMemo(() => {
    return Array.isArray(products) ? products : [];
  }, [products]);

  const availableBrands = useMemo(() => {
    const fromProducts = productsList
      .map(
        (product) =>
          product.brand || product.manufacturer || product?.metadata?.brand
      )
      .filter(Boolean);

    const fromCategoryInfo = Array.isArray(categoryInfo?.brands)
      ? categoryInfo.brands
      : Array.isArray(categoryInfo?.availableBrands)
        ? categoryInfo.availableBrands
        : Array.isArray(categoryInfo?.facets?.brands)
          ? categoryInfo.facets.brands.map((brand) =>
            typeof brand === "string" ? brand : brand?.name
          )
          : [];

    const uniqueBrands = new Set(
      [
        ...fromProducts.map((brand) => brand?.name || brand),
        ...fromCategoryInfo.map((brand) => brand?.name || brand),
      ].filter(Boolean)
    );

    return Array.from(uniqueBrands).sort((a, b) => a.localeCompare(b));
  }, [productsList, categoryInfo]);

  const subcategoryList = useMemo(() => {
    const normalizeNode = (node) => {
      if (!node || typeof node !== "object") return null;
      const normalized = {
        ...node,
        id: node.id || node._id || node.slug || node.name,
        name: node.name || node.title || node.label || "Unknown Category",
        slug: node.slug || node.handle || node.seoHandle || node._id || node.id,
        count:
          node.count ||
          node.productCount ||
          node.totalProducts ||
          node.itemsCount ||
          0,
      };

      if (Array.isArray(node.subcategories)) {
        normalized.subcategories = node.subcategories
          .map(normalizeNode)
          .filter(Boolean);
      } else if (Array.isArray(node.children)) {
        normalized.subcategories = node.children
          .map(normalizeNode)
          .filter(Boolean);
      }

      return normalized;
    };

    const normalizeList = (list = []) =>
      list.map(normalizeNode).filter(Boolean);

    if (Array.isArray(categoryInfo?.subcategories))
      return normalizeList(categoryInfo.subcategories);
    if (Array.isArray(categoryInfo?.children))
      return normalizeList(categoryInfo.children);
    if (Array.isArray(currentCategory?.subcategories))
      return normalizeList(currentCategory.subcategories);
    if (Array.isArray(currentCategory?.children))
      return normalizeList(currentCategory.children);

    const findInTree = (nodes = []) => {
      for (const node of nodes) {
        if (!node) continue;
        const nodeSlug = node.slug || node.handle || node._id || node.id;
        const nodeId = node._id || node.id || node.slug;

        if (nodeSlug === categoryName || nodeId === categoryName) {
          return node.children || node.subcategories || [];
        }

        if (Array.isArray(node.children) && node.children.length > 0) {
          const found = findInTree(node.children);
          if (found) return found;
        }
        if (
          Array.isArray(node.subcategories) &&
          node.subcategories.length > 0
        ) {
          const found = findInTree(node.subcategories);
          if (found) return found;
        }
      }
      return null;
    };

    const resolved = findInTree(categoryTree);
    return normalizeList(Array.isArray(resolved) ? resolved : []);
  }, [categoryInfo, currentCategory, categoryTree, categoryName]);

  const currentCategoryForNav = useMemo(() => {
    if (!currentCategory) {
      return categoryInfo
        ? {
          ...categoryInfo,
          id:
            categoryInfo.id ||
            categoryInfo._id ||
            categoryInfo.slug ||
            categoryName,
          slug: categoryInfo.slug || categoryInfo.handle || categoryName,
        }
        : null;
    }

    return {
      ...currentCategory,
      id:
        currentCategory.id ||
        currentCategory._id ||
        currentCategory.slug ||
        categoryName,
      slug: currentCategory.slug || currentCategory.handle || categoryName,
    };
  }, [currentCategory, categoryInfo, categoryName]);

  // Compute category stats from available data
  const categoryStats = useMemo(() => {
    const total = pagination?.total || productsList.length;
    const onSale = productsList.filter(product => product.discount > 0 || product.onSale).length;
    const averageRating = productsList.length > 0
      ? productsList.reduce((sum, product) => sum + (product.rating || 0), 0) / productsList.length
      : 0;
    const newArrivals = productsList.filter(product => {
      const createdDate = new Date(product.createdAt || product.dateAdded);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return createdDate > thirtyDaysAgo;
    }).length;

    return {
      total,
      onSale,
      averageRating,
      newArrivals
    };
  }, [productsList, pagination]);

  // Enhanced handlers
  const handleSortChange = useCallback(
    (newSort) => {
      setSortBy(newSort);
      setCurrentPage(1);

      trackEvent("category_sort_changed", {
        category: categoryName,
        sort_option: newSort,
        previous_sort: sortBy,
      });
    },
    [categoryName, sortBy]
  );

  const handleFilterChange = useCallback(
    (newFilter) => {
      setFilterBy(newFilter);
      setCurrentPage(1);

      trackEvent("category_filter_changed", {
        category: categoryName,
        filter_option: newFilter,
        previous_filter: filterBy,
      });
    },
    [categoryName, filterBy]
  );

  const handleViewModeChange = useCallback(
    (newMode) => {
      setViewMode(newMode);

      trackEvent("category_view_mode_changed", {
        category: categoryName,
        view_mode: newMode,
      });
    },
    [categoryName, setViewMode]
  );

  const handlePageChange = useCallback(
    (page) => {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });

      trackEvent("category_pagination", {
        category: categoryName,
        page_number: page,
      });
    },
    [categoryName]
  );

  const handleSearchChange = useCallback(
    (newSearch) => {
      setSearchTerm(newSearch);
      setCurrentPage(1);

      trackEvent("category_search", {
        category: categoryName,
        search_term: newSearch,
      });
    },
    [categoryName]
  );

  const handlePriceRangeChange = useCallback(
    (newRange) => {
      setPriceRange(newRange);
      setCurrentPage(1);

      trackEvent("category_price_filter", {
        category: categoryName,
        min_price: newRange.min,
        max_price: newRange.max,
      });
    },
    [categoryName]
  );

  const handleBrandToggle = useCallback(
    (brand) => {
      setSelectedBrands((prev) => {
        const newBrands = prev.includes(brand)
          ? prev.filter((b) => b !== brand)
          : [...prev, brand];

        setCurrentPage(1);

        trackEvent("category_brand_filter", {
          category: categoryName,
          brand,
          action: prev.includes(brand) ? "remove" : "add",
          selected_brands: newBrands,
        });

        return newBrands;
      });
    },
    [categoryName]
  );

  const handleRatingFilter = useCallback(
    (rating) => {
      setSelectedRating(rating);
      setCurrentPage(1);

      trackEvent("category_rating_filter", {
        category: categoryName,
        rating,
      });
    },
    [categoryName]
  );

  const handleClearFilters = useCallback(() => {
    setFilterBy("all");
    setSortBy("name:asc");
    setSearchTerm("");
    setPriceRange({ min: 0, max: 10000 });
    setSelectedBrands([]);
    setSelectedRating(0);
    setCurrentPage(1);

    trackEvent("category_filters_cleared", {
      category: categoryName,
    });

    toast.success("🧹 Filters cleared successfully");
  }, [categoryName]);

  const handleAddToCompare = useCallback(
    (product) => {
      if (compareItems.find((item) => item._id === product._id)) {
        toast.info("Product already in comparison");
        return;
      }

      if (compareItems.length >= 4) {
        toast.warning("You can compare up to 4 products at once");
        return;
      }

      setCompareItems((prev) => [...prev, product]);
      setShowCompareModal(true);
      toast.success(`${product.name} added to comparison`);

      trackEvent("product_added_to_compare", {
        product_id: product._id,
        product_name: product.name,
        category: categoryName,
        compare_count: compareItems.length + 1,
      });
    },
    [compareItems, categoryName]
  );

  const handleQuickView = useCallback(
    (product) => {
      setQuickViewProduct(product);

      trackEvent("product_quick_view", {
        product_id: product._id,
        product_name: product.name,
        category: categoryName,
      });
    },
    [categoryName]
  );

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    trackEvent("scroll_to_top_clicked", {
      category: categoryName,
    });
  }, [categoryName]);

  // SEO meta data
  const metaTitle = useMemo(() => {
    const baseTitle = isSalePage
      ? `Sale & Discounts | ShoeMarkNet`
      : `${categoryName} Collection | ShoeMarkNet`;
    if (searchTerm) return `${searchTerm} in ${categoryName} | ShoeMarkNet`;
    if (selectedBrands.length > 0)
      return `${selectedBrands.join(", ")} ${categoryName} | ShoeMarkNet`;
    return baseTitle;
  }, [categoryName, searchTerm, selectedBrands, isSalePage]);

  const metaDescription = useMemo(() => {
    if (isSalePage) {
      return `Discover amazing deals and discounts on premium footwear. Up to 70% off on selected items. Limited time offers on running shoes, sneakers, and more.`;
    }

    const fallback = () => {
      const total = categoryStats.total;
      const onSale = categoryStats.onSale;
      return `Discover ${total} premium ${categoryName?.toLowerCase()} products. ${onSale > 0 ? `${onSale} items on sale.` : ""
        } Free shipping, easy returns, and expert customer service.`;
    };

    const descriptionCandidates = [
      categoryInfo?.seoDescription,
      categoryInfo?.metaDescription,
      categoryInfo?.description,
      currentCategory?.seoDescription,
      currentCategory?.description,
    ];

    const firstDescription = descriptionCandidates.find(
      (value) => typeof value === "string" && value.trim().length > 0
    );
    return firstDescription ? firstDescription.trim() : fallback();
  }, [categoryInfo, currentCategory, categoryName, categoryStats, isSalePage]);

  const displayCategoryName = useMemo(() => {
    if (isSalePage) return "Sale & Discounts";
    if (currentCategory?.name) return currentCategory.name;
    if (!categoryName) return "Category";
    return categoryName
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }, [currentCategory?.name, categoryName, isSalePage]);

  const headerTitle = useMemo(
    () => isSalePage ? "🔥 Sale & Discounts" : `${displayCategoryName} Collection`,
    [displayCategoryName, isSalePage]
  );

  const headerDescription = useMemo(() => {
    if (isSalePage) {
      return `Don't miss out on our amazing deals! Up to 70% off on premium footwear. Limited time offers on running shoes, sneakers, and athletic wear.`;
    }

    const total = categoryStats.total;
    if (isLoading) {
      return `Fetching the freshest ${displayCategoryName.toLowerCase()} drops...`;
    }
    if (searchTerm) {
      return `Showing ${total} ${displayCategoryName.toLowerCase()} results for "${searchTerm}".`;
    }
    if (total === 0) {
      return `No ${displayCategoryName.toLowerCase()} listings match your filters yet—adjust them to explore more styles.`;
    }
    return `${total.toLocaleString()} ${displayCategoryName.toLowerCase()} items, ${categoryStats.onSale
      } on sale, averaging ${Number(categoryStats.averageRating || 0).toFixed(
        1
      )}★ from the community.`;
  }, [categoryStats, displayCategoryName, isLoading, searchTerm, isSalePage]);

  const headerBreadcrumbs = useMemo(() => {
    const crumbs = Array.isArray(breadcrumb) ? breadcrumb : [];
    return (
      <nav
        className="flex flex-wrap items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400"
        aria-label="Breadcrumb"
      >
        <Link
          to="/"
          className="transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400"
        >
          Home
        </Link>
        <span className="opacity-60">/</span>
        <Link
          to="/products"
          className="transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400"
        >
          Products
        </Link>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          if (isLast) {
            return null;
          }
          return (
            <React.Fragment key={crumb._id || crumb.slug || index}>
              <span className="opacity-60">/</span>
              <Link
                to={`/category/${crumb.slug || crumb._id}`}
                className="transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400"
              >
                {crumb.name}
              </Link>
            </React.Fragment>
          );
        })}
        <span className="opacity-60">/</span>
        <span className="text-gray-900 dark:text-gray-200">
          {displayCategoryName}
        </span>
      </nav>
    );
  }, [breadcrumb, displayCategoryName]);

  return (
    <>
      <PageMeta
        title={metaTitle}
        description={metaDescription}
        robots="index, follow"
        canonical={`https://shoemarknet.com/category/${categoryName}${searchParams.toString() ? `?${searchParams.toString()}` : ""
          }`}
        openGraph={{
          title: metaTitle,
          description: metaDescription,
          type: "website",
          url: `https://shoemarknet.com/category/${categoryName}`,
        }}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${displayCategoryName} Collection`,
          description: metaDescription,
          url: `https://shoemarknet.com/category/${categoryName}`,
          mainEntity: {
            "@type": "ItemList",
            itemListElement: productsList.slice(0, 5).map((product, index) => ({
              "@type": "Product",
              position: index + 1,
              name: product.name,
              description: product.description,
              image: product.images?.[0],
              offers: {
                "@type": "Offer",
                price: product.price,
                priceCurrency: "USD",
                availability:
                  product.countInStock > 0
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock",
              },
            })),
          },
        }}
      />

      <PageLayout
        title={categoryName ? headerTitle : "Browse Categories"}
        description={categoryName ? headerDescription : "Explore our wide range of product categories"}
        breadcrumbs={categoryName ? headerBreadcrumbs : (
          <nav className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
            <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</Link>
            <span className="opacity-60">/</span>
            <span className="text-gray-900 dark:text-gray-200">Categories</span>
          </nav>
        )}
      >
        {!categoryName ? (
          // Category Listing Page - Show all categories when no category is selected
          <div className="space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-8 dark:border-slate-700 dark:bg-slate-800">
                <LoadingSpinner size="large" message="Loading categories..." />
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-200 bg-white p-8 dark:border-red-900 dark:bg-slate-800">
                <ErrorMessage
                  message={error}
                  onRetry={() => {
                    dispatch(fetchCategories());
                    dispatch(fetchCategoryTree());
                  }}
                />
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {(categoryTree.length > 0 ? categoryTree : categories).map((category) => (
                  <Link
                    key={category._id || category.slug}
                    to={`/categories/${category.slug || category._id}`}
                    className="group rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-600"
                  >
                    {category.image && (
                      <div className="mb-3 aspect-video overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-700">
                        <img
                          src={category.image}
                          alt={category.name}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    )}
                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                    {category.productCount > 0 && (
                      <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                        {category.productCount} products
                      </p>
                    )}
                    {category.children && category.children.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {category.children.slice(0, 3).map((child) => (
                          <span
                            key={child._id || child.slug}
                            className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                          >
                            {child.name}
                          </span>
                        ))}
                        {category.children.length > 3 && (
                          <span className="text-xs text-slate-400">
                            +{category.children.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}

            {(categoryTree.length === 0 && categories.length === 0 && !isLoading) && (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                  <i className="fas fa-folder-open text-2xl text-slate-400"></i>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No categories found</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Check back later for new categories.
                </p>
              </div>
            )}
          </div>
        ) : isSalePage ? (
          // Sale Page Layout - Focused on Discounts, Sales, and Offers
          <div className="space-y-6">
            {/* Sale Hero Section */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 p-6 text-white">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                    <i className="fas fa-fire text-xl text-yellow-300"></i>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Limited Time Sale!</h2>
                    <p className="text-white/90 text-sm">Up to 70% off on selected items</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="rounded-lg bg-white/10 p-3 text-center">
                    <div className="text-2xl font-bold">{categoryStats.total}</div>
                    <div className="text-xs text-white/80">Items on Sale</div>
                  </div>
                  <div className="rounded-lg bg-white/10 p-3 text-center">
                    <div className="text-2xl font-bold">70%</div>
                    <div className="text-xs text-white/80">Max Discount</div>
                  </div>
                  <div className="rounded-lg bg-white/10 p-3 text-center">
                    <div className="text-2xl font-bold">24hrs</div>
                    <div className="text-xs text-white/80">Time Left</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Discount Tiers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/20 p-4 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white">
                  <i className="fas fa-percentage text-lg"></i>
                </div>
                <h3 className="text-lg font-bold text-red-800 dark:text-red-200">50%+ Off</h3>
                <p className="text-sm text-red-600 dark:text-red-300">Premium Brands</p>
                <div className="mt-3 text-xl font-bold text-red-800 dark:text-red-200">
                  {productsList.filter(p => (p.discount || 0) >= 50).length} Items
                </div>
              </div>

              <div className="rounded-xl border border-orange-200 dark:border-orange-800/50 bg-orange-50 dark:bg-orange-900/20 p-4 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white">
                  <i className="fas fa-tags text-lg"></i>
                </div>
                <h3 className="text-lg font-bold text-orange-800 dark:text-orange-200">30-50% Off</h3>
                <p className="text-sm text-orange-600 dark:text-orange-300">Popular Items</p>
                <div className="mt-3 text-xl font-bold text-orange-800 dark:text-orange-200">
                  {productsList.filter(p => (p.discount || 0) >= 30 && (p.discount || 0) < 50).length} Items
                </div>
              </div>

              <div className="rounded-xl border border-yellow-200 dark:border-yellow-800/50 bg-yellow-50 dark:bg-yellow-900/20 p-4 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500 text-white">
                  <i className="fas fa-star text-lg"></i>
                </div>
                <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-200">Under 30% Off</h3>
                <p className="text-sm text-yellow-600 dark:text-yellow-300">Clearance Sale</p>
                <div className="mt-3 text-xl font-bold text-yellow-800 dark:text-yellow-200">
                  {productsList.filter(p => (p.discount || 0) > 0 && (p.discount || 0) < 30).length} Items
                </div>
              </div>
            </div>

            {/* Sale Products Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  🔥 Hot Deals
                </h3>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="discount:desc">Best Deals</option>
                  <option value="price:asc">Lowest Price</option>
                  <option value="rating:desc">Highest Rated</option>
                  <option value="newest">Newest</option>
                </select>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-8 dark:border-slate-700 dark:bg-slate-800">
                  <LoadingSpinner size="large" message="Loading amazing deals..." />
                </div>
              ) : error ? (
                <div className="rounded-xl border border-red-200 bg-white p-8 dark:border-red-900 dark:bg-slate-800">
                  <ErrorMessage
                    message={error}
                    onRetry={() => window.location.reload()}
                  />
                </div>
              ) : productsList.length === 0 ? (
                <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-8 dark:border-slate-700 dark:bg-slate-800">
                  <div className="text-center">
                    <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                      <i className="fas fa-tags text-xl text-slate-400 dark:text-slate-500" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      No sale items available
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Check back later for amazing deals!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {productsList.map((product, index) => (
                    <div key={product._id || product.id} className="relative">
                      {product.discount > 0 && (
                        <div className="absolute -top-2 -right-2 z-10 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                          -{product.discount}%
                        </div>
                      )}
                      <ProductCard
                        key={product._id || product.id || index}
                        product={product}
                        viewMode={viewMode}
                        showCompareButton={true}
                        onAddToCompare={() => handleAddToCompare(product)}
                        onQuickView={() => handleQuickView(product)}
                        categoryContext={categoryName}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Sale Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                    showInfo={true}
                    totalItems={categoryStats.total}
                    itemsPerPage={itemsPerPage}
                  />
                </div>
              )}
            </div>

            {/* Sale Footer Message */}
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center dark:border-green-800 dark:bg-green-900/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white">
                  <i className="fas fa-clock text-sm"></i>
                </div>
                <h3 className="text-base font-bold text-green-800 dark:text-green-200">
                  Limited Time Offer
                </h3>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                These amazing deals won't last long! Shop now and save big on premium footwear.
              </p>
            </div>
          </div>
        ) : (
          // Regular Category Layout
          <div className="space-y-6">
            {subcategoryList.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
                <SubcategoryNav
                  categories={subcategoryList}
                  currentCategory={currentCategoryForNav}
                  animateElements={animateElements}
                />
              </div>
            )}

            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <CategoryFilters
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                sortBy={sortBy}
                onSortChange={handleSortChange}
                filterBy={filterBy}
                onFilterChange={handleFilterChange}
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
                priceRange={priceRange}
                onPriceRangeChange={handlePriceRangeChange}
                selectedBrands={selectedBrands}
                availableBrands={availableBrands}
                onBrandToggle={handleBrandToggle}
                selectedRating={selectedRating}
                onRatingFilter={handleRatingFilter}
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters(!showFilters)}
                onClearFilters={handleClearFilters}
                currentResults={productsList.length}
                sortOptions={SORT_OPTIONS}
                filterOptions={FILTER_OPTIONS}
                viewModes={VIEW_MODES}
                itemsPerPageOptions={ITEMS_PER_PAGE_OPTIONS}
                loading={isLoading}
              />
            </div>

            {error && (
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                <ErrorMessage
                  message={
                    typeof error === "string"
                      ? error
                      : error?.message || "Failed to load products"
                  }
                  onRetry={() =>
                    dispatch(
                      getProductsByCategory({
                        categoryId: categoryName,
                        filters: {
                          page: currentPage,
                          limit: itemsPerPage,
                          sort: sortBy,
                          ...(filterBy !== "all" && { filter: filterBy }),
                          ...(selectedBrands.length > 0 && {
                            brands: selectedBrands.join(","),
                          }),
                          ...(selectedRating > 0 && { rating: selectedRating }),
                          ...(priceRange.min > 0 && { minPrice: priceRange.min }),
                          ...(priceRange.max < 10000 && {
                            maxPrice: priceRange.max,
                          }),
                          ...(searchTerm && { search: searchTerm }),
                        },
                        includeTree: true,
                      })
                    )
                  }
                  className="mb-0"
                />
              </div>
            )}

            {isLoading && productsList.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                <div
                  className={`grid gap-4 ${viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : viewMode === "list"
                      ? "grid-cols-1 max-w-4xl mx-auto"
                      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
                    }`}
                >
                  {Array.from({ length: itemsPerPage }).map((_, index) => (
                    <div
                      key={`category-skeleton-${index}`}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900"
                    >
                      <div className="flex h-full flex-col space-y-3 animate-pulse">
                        <div className="h-40 rounded-lg bg-slate-200 dark:bg-slate-700"></div>
                        <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700"></div>
                        <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-700"></div>
                        <div className="mt-auto h-8 w-2/3 rounded-lg bg-slate-200 dark:bg-slate-700"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {!isLoading && !error && productsList.length === 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-blue-500 dark:bg-slate-700">
                      <i className="fas fa-search text-2xl"></i>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                      No products found
                    </h3>
                    <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                      {searchTerm
                        ? `No results for "${searchTerm}" in ${displayCategoryName.toLowerCase()}`
                        : `We couldn't find any ${displayCategoryName.toLowerCase()} products matching your filters.`}
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                      <button
                        onClick={handleClearFilters}
                        className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                      >
                        <i className="fas fa-times mr-2"></i>
                        Clear Filters
                      </button>
                      <Link
                        to="/products"
                        className="rounded-lg border border-slate-200 bg-white px-4 py-2 font-medium text-gray-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                      >
                        <i className="fas fa-compass mr-2"></i>
                        Browse All Products
                      </Link>
                    </div>
                  </div>
                ) : (
                  <>
                    {isLoading && productsList.length > 0 && (
                      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                        <LoadingSpinner
                          size="medium"
                          message="Updating products..."
                        />
                      </div>
                    )}

                    <ProductGrid
                      products={productsList}
                      viewMode={viewMode}
                      onAddToCart={handleAddProductToCart}
                      onToggleWishlist={handleToggleProductWishlist}
                      wishlistProductIds={wishlistProductIds}
                      showCompareButton={true}
                      onAddToCompare={handleAddToCompare}
                      onQuickView={handleQuickView}
                      categoryContext={categoryName}
                    />

                    {!isLoading &&
                      !error &&
                      pagination &&
                      pagination.totalPages > 1 && (
                        <div className="flex justify-center">
                          <Pagination
                            currentPage={currentPage}
                            totalPages={pagination.totalPages}
                            onPageChange={handlePageChange}
                            showInfo={true}
                            totalItems={categoryStats.total}
                            itemsPerPage={itemsPerPage}
                          />
                        </div>
                      )}
                  </>
                )}
              </>
            )}
          </div>
        )}
      </PageLayout>

      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        {compareItems.length > 0 && (
          <button
            onClick={() => setShowCompareModal(true)}
            className="relative flex h-12 w-12 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg hover:bg-purple-700"
            title={`Compare ${compareItems.length} products`}
          >
            <i className="fas fa-balance-scale"></i>
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {compareItems.length}
            </span>
          </button>
        )}

        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700"
            title="Back to top"
          >
            <i className="fas fa-chevron-up"></i>
          </button>
        )}
      </div>

      {quickViewProduct && (
        <ProductQuickView
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCompare={() => handleAddToCompare(quickViewProduct)}
        />
      )}

      {compareItems.length > 0 && (
        <CompareDrawer
          isOpen={showCompareModal}
          items={compareItems}
          onRemoveItem={(productId) => {
            setCompareItems((prev) => {
              const next = prev.filter((item) => item._id !== productId);
              if (next.length === 0) {
                setShowCompareModal(false);
              }
              return next;
            });
          }}
          onClearAll={() => {
            setCompareItems([]);
            setShowCompareModal(false);
          }}
          onClose={() => setShowCompareModal(false)}
        />
      )}
    </>
  );
};

export default Category;
