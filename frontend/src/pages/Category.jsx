import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import PageMeta from '../components/seo/PageMeta';
import PageLayout from '../components/common/PageLayout';
import { toast } from 'react-toastify';

// Redux actions
import { 
  fetchProducts, 
  searchProducts,
  clearProductError 
} from '../redux/slices/productSlice';
import { 
  fetchCategories,
  getCategoryById,
  getCategoryBreadcrumb,
  getProductsByCategory
} from '../redux/slices/categorySlice';

// Components
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Pagination from '../components/common/Pagination';
import CategoryFilters from '../components/category/CategoryFilters';
import CategoryStats from '../components/category/CategoryStats';
import SubcategoryNav from '../components/category/SubcategoryNav';
import ProductQuickView from '../components/products/ProductQuickView';
import CompareDrawer from '../components/products/CompareDrawer';

// Hooks
import useLocalStorage from '../hooks/useLocalStorage';
import useDebounce from '../hooks/useDebounce';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import usePermissions from '../hooks/usePermissions';

// Utils
import { trackEvent } from '../utils/analytics';
import { formatPrice } from '../utils/helpers';

// Constants
const SORT_OPTIONS = [
  { value: 'name:asc', label: 'Name: A-Z', icon: 'fa-sort-alpha-up' },
  { value: 'name:desc', label: 'Name: Z-A', icon: 'fa-sort-alpha-down' },
  { value: 'price:asc', label: 'Price: Low to High', icon: 'fa-sort-amount-up' },
  { value: 'price:desc', label: 'Price: High to Low', icon: 'fa-sort-amount-down' },
  { value: 'rating:desc', label: 'Highest Rated', icon: 'fa-star' },
  { value: 'popularity:desc', label: 'Most Popular', icon: 'fa-fire' },
  { value: 'newest', label: 'Newest First', icon: 'fa-clock' },
  { value: 'discount:desc', label: 'Best Deals', icon: 'fa-percentage' }
];

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Products', icon: 'fa-th' },
  { value: 'sale', label: 'On Sale', icon: 'fa-percentage' },
  { value: 'new', label: 'New Arrivals', icon: 'fa-sparkles' },
  { value: 'popular', label: 'Popular', icon: 'fa-fire' },
  { value: 'featured', label: 'Featured', icon: 'fa-star' },
  { value: 'inStock', label: 'In Stock', icon: 'fa-check-circle' }
];

const VIEW_MODES = [
  { value: 'grid', icon: 'fa-th-large', label: 'Grid View' },
  { value: 'list', icon: 'fa-list', label: 'List View' },
  { value: 'compact', icon: 'fa-th', label: 'Compact View' }
];

const ITEMS_PER_PAGE_OPTIONS = [
  { value: 12, label: '12 items' },
  { value: 24, label: '24 items' },
  { value: 48, label: '48 items' },
  { value: 96, label: '96 items' }
];

const Category = () => {
  const { categoryName } = useParams();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const { hasRole, userRole } = usePermissions();

  // Redux state
  const { 
    products, 
    loading, 
    error,
    pagination,
    totalProducts 
  } = useSelector((state) => state.product);
  
  const { 
    categories,
    currentCategory,
    breadcrumb,
    subcategories
  } = useSelector((state) => state.category);

  // Local state
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'name:asc');
  const [filterBy, setFilterBy] = useState(searchParams.get('filter') || 'all');
  const [viewMode, setViewMode] = useLocalStorage('categoryViewMode', 'grid');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [itemsPerPage, setItemsPerPage] = useLocalStorage('categoryItemsPerPage', 24);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [priceRange, setPriceRange] = useState({
    min: parseInt(searchParams.get('minPrice') || '0', 10),
    max: parseInt(searchParams.get('maxPrice') || '10000', 10)
  });
  const [selectedBrands, setSelectedBrands] = useState(
    searchParams.get('brands') ? searchParams.get('brands').split(',') : []
  );
  const [selectedRating, setSelectedRating] = useState(parseInt(searchParams.get('rating') || '0', 10));
  
  // UI state
  const [animateElements, setAnimateElements] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [compareItems, setCompareItems] = useState([]);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const canViewAnalytics = hasRole('admin');
  
  // Debounced search
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Initialize animations
  useEffect(() => {
    setTimeout(() => setAnimateElements(true), 100);
  }, []);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch category details and breadcrumb
        if (categoryName) {
          await Promise.all([
            dispatch(getCategoryById(categoryName)),
            dispatch(getCategoryBreadcrumb(categoryName)),
            dispatch(fetchCategories())
          ]);
        }

        // Track page view
        trackEvent('category_page_view', {
          category: categoryName,
          page_location: window.location.href,
          referrer: document.referrer
        });
        
      } catch (error) {
        console.error('Failed to fetch category data:', error);
      }
    };

    fetchData();
  }, [dispatch, categoryName]);

  // Fetch products with filters
  useEffect(() => {
    const filters = {
      category: categoryName,
      page: currentPage,
      limit: itemsPerPage,
      sort: sortBy,
      ...(filterBy !== 'all' && { filter: filterBy }),
      ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
      ...(priceRange.min > 0 && { minPrice: priceRange.min }),
      ...(priceRange.max < 10000 && { maxPrice: priceRange.max }),
      ...(selectedBrands.length > 0 && { brands: selectedBrands.join(',') }),
      ...(selectedRating > 0 && { rating: selectedRating })
    };

    if (debouncedSearchTerm) {
      dispatch(searchProducts({ query: debouncedSearchTerm, filters }));
    } else {
      dispatch(getProductsByCategory(categoryName, filters));
    }
  }, [
    dispatch,
    categoryName,
    currentPage,
    itemsPerPage,
    sortBy,
    filterBy,
    debouncedSearchTerm,
    priceRange,
    selectedBrands,
    selectedRating
  ]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (sortBy !== 'name:asc') params.set('sort', sortBy);
    if (filterBy !== 'all') params.set('filter', filterBy);
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (searchTerm) params.set('search', searchTerm);
    if (priceRange.min > 0) params.set('minPrice', priceRange.min.toString());
    if (priceRange.max < 10000) params.set('maxPrice', priceRange.max.toString());
    if (selectedBrands.length > 0) params.set('brands', selectedBrands.join(','));
    if (selectedRating > 0) params.set('rating', selectedRating.toString());

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
    setSearchParams
  ]);

  // Memoized calculations
  const productsList = useMemo(() => {
    return Array.isArray(products) ? products : [];
  }, [products]);

  const categoryStats = useMemo(() => {
    const onSaleCount = productsList.filter(p => p.discountPercentage > 0).length;
    const newArrivalsCount = productsList.filter(p => p.isNew).length;
    const averageRating = productsList.length > 0 
      ? productsList.reduce((sum, p) => sum + (p.rating || 0), 0) / productsList.length 
      : 0;
    
    return {
      total: totalProducts || productsList.length,
      onSale: onSaleCount,
      newArrivals: newArrivalsCount,
      averageRating: averageRating.toFixed(1),
      averagePrice: productsList.length > 0 
        ? productsList.reduce((sum, p) => sum + (p.price || 0), 0) / productsList.length 
        : 0
    };
  }, [productsList, totalProducts]);

  const availableBrands = useMemo(() => {
    const brands = [...new Set(productsList.map(p => p.brand).filter(Boolean))];
    return brands.sort();
  }, [productsList]);

  // Enhanced handlers
  const handleSortChange = useCallback((newSort) => {
    setSortBy(newSort);
    setCurrentPage(1);
    
    trackEvent('category_sort_changed', {
      category: categoryName,
      sort_option: newSort,
      previous_sort: sortBy
    });
  }, [categoryName, sortBy]);

  const handleFilterChange = useCallback((newFilter) => {
    setFilterBy(newFilter);
    setCurrentPage(1);
    
    trackEvent('category_filter_changed', {
      category: categoryName,
      filter_option: newFilter,
      previous_filter: filterBy
    });
  }, [categoryName, filterBy]);

  const handleViewModeChange = useCallback((newMode) => {
    setViewMode(newMode);
    
    trackEvent('category_view_mode_changed', {
      category: categoryName,
      view_mode: newMode
    });
  }, [categoryName, setViewMode]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    trackEvent('category_pagination', {
      category: categoryName,
      page_number: page
    });
  }, [categoryName]);

  const handleSearchChange = useCallback((newSearch) => {
    setSearchTerm(newSearch);
    setCurrentPage(1);
    
    trackEvent('category_search', {
      category: categoryName,
      search_term: newSearch
    });
  }, [categoryName]);

  const handlePriceRangeChange = useCallback((newRange) => {
    setPriceRange(newRange);
    setCurrentPage(1);
    
    trackEvent('category_price_filter', {
      category: categoryName,
      min_price: newRange.min,
      max_price: newRange.max
    });
  }, [categoryName]);

  const handleBrandToggle = useCallback((brand) => {
    setSelectedBrands(prev => {
      const newBrands = prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand];
      
      setCurrentPage(1);
      
      trackEvent('category_brand_filter', {
        category: categoryName,
        brand,
        action: prev.includes(brand) ? 'remove' : 'add',
        selected_brands: newBrands
      });
      
      return newBrands;
    });
  }, [categoryName]);

  const handleRatingFilter = useCallback((rating) => {
    setSelectedRating(rating);
    setCurrentPage(1);
    
    trackEvent('category_rating_filter', {
      category: categoryName,
      rating
    });
  }, [categoryName]);

  const handleClearFilters = useCallback(() => {
    setFilterBy('all');
    setSortBy('name:asc');
    setSearchTerm('');
    setPriceRange({ min: 0, max: 10000 });
    setSelectedBrands([]);
    setSelectedRating(0);
    setCurrentPage(1);
    
    trackEvent('category_filters_cleared', {
      category: categoryName
    });
    
    toast.success('🧹 Filters cleared successfully');
  }, [categoryName]);

  const handleAddToCompare = useCallback((product) => {
    if (compareItems.find(item => item._id === product._id)) {
      toast.info('Product already in comparison');
      return;
    }

    if (compareItems.length >= 4) {
      toast.warning('You can compare up to 4 products at once');
      return;
    }

  setCompareItems(prev => [...prev, product]);
  setShowCompareModal(true);
    toast.success(`${product.name} added to comparison`);
    
    trackEvent('product_added_to_compare', {
      product_id: product._id,
      product_name: product.name,
      category: categoryName,
      compare_count: compareItems.length + 1
    });
  }, [compareItems, categoryName]);

  const handleQuickView = useCallback((product) => {
    setQuickViewProduct(product);
    
    trackEvent('product_quick_view', {
      product_id: product._id,
      product_name: product.name,
      category: categoryName
    });
  }, [categoryName]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    trackEvent('scroll_to_top_clicked', {
      category: categoryName
    });
  }, [categoryName]);

  // SEO meta data
  const metaTitle = useMemo(() => {
    const baseTitle = `${categoryName} Collection | ShoeMarkNet`;
    if (searchTerm) return `${searchTerm} in ${categoryName} | ShoeMarkNet`;
    if (selectedBrands.length > 0) return `${selectedBrands.join(', ')} ${categoryName} | ShoeMarkNet`;
    return baseTitle;
  }, [categoryName, searchTerm, selectedBrands]);

  const metaDescription = useMemo(() => {
    const total = categoryStats.total;
    const onSale = categoryStats.onSale;
    return `Discover ${total} premium ${categoryName?.toLowerCase()} products. ${onSale > 0 ? `${onSale} items on sale.` : ''} Free shipping, easy returns, and expert customer service.`;
  }, [categoryName, categoryStats]);

  const displayCategoryName = useMemo(() => {
    if (currentCategory?.name) return currentCategory.name;
    if (!categoryName) return 'Category';
    return categoryName
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }, [currentCategory?.name, categoryName]);

  const headerTitle = useMemo(() => `${displayCategoryName} Collection`, [displayCategoryName]);

  const headerDescription = useMemo(() => {
    const total = categoryStats.total;
    if (loading) {
      return 'Fetching the freshest drops in this category...';
    }
    if (searchTerm) {
      return `Showing matches for "${searchTerm}" with ${total} curated picks.`;
    }
    if (total === 0) {
      return `No listings match your filters yet—tune the filters below to explore more styles.`;
    }
    return `${total.toLocaleString()} items, ${categoryStats.onSale} on sale, averaging ${Number(categoryStats.averageRating || 0).toFixed(1)}★ from the community.`;
  }, [categoryStats, displayCategoryName, loading, searchTerm]);

  const headerBreadcrumbs = useMemo(() => {
    const crumbs = Array.isArray(breadcrumb) ? breadcrumb : [];
    return (
      <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400" aria-label="Breadcrumb">
        <Link to="/" className="transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400">
          Home
        </Link>
        <span className="opacity-60">/</span>
        <Link to="/products" className="transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400">
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
        <span className="text-gray-900 dark:text-gray-200">{displayCategoryName}</span>
      </nav>
    );
  }, [breadcrumb, displayCategoryName]);

  const headerAfter = useMemo(() => (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="rounded-2xl border border-white/30 bg-white/60 p-4 text-sm font-semibold text-gray-700 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-gray-200">
        <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Products</div>
        <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{categoryStats.total}</div>
      </div>
      <div className="rounded-2xl border border-white/30 bg-white/60 p-4 text-sm font-semibold text-gray-700 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-gray-200">
        <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">On Sale</div>
        <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{categoryStats.onSale}</div>
      </div>
      <div className="rounded-2xl border border-white/30 bg-white/60 p-4 text-sm font-semibold text-gray-700 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-gray-200">
        <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Avg Rating</div>
        <div className="mt-1 flex items-baseline gap-1 text-2xl font-bold text-gray-900 dark:text-white">
          {Number(categoryStats.averageRating || 0).toFixed(1)}
          <span className="text-sm text-yellow-500"><i className="fas fa-star"></i></span>
        </div>
      </div>
      <div className="rounded-2xl border border-white/30 bg-white/60 p-4 text-sm font-semibold text-gray-700 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-gray-200">
        <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">New Arrivals</div>
        <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{categoryStats.newArrivals}</div>
      </div>
    </div>
  ), [categoryStats]);

  return (
    <>
      <PageMeta
        title={metaTitle}
        description={metaDescription}
        robots="index, follow"
        canonical={`https://shoemarknet.com/category/${categoryName}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`}
        openGraph={{
          title: metaTitle,
          description: metaDescription,
          type: 'website',
          url: `https://shoemarknet.com/category/${categoryName}`,
        }}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `${displayCategoryName} Collection`,
          description: metaDescription,
          url: `https://shoemarknet.com/category/${categoryName}`,
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: categoryStats.total,
            itemListElement: productsList.slice(0, 5).map((product, index) => ({
              '@type': 'Product',
              position: index + 1,
              name: product.name,
              description: product.description,
              image: product.images?.[0],
              offers: {
                '@type': 'Offer',
                price: product.price,
                priceCurrency: 'USD',
                availability: product.countInStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
              },
            })),
          },
        }}
      />

      <PageLayout
        title={headerTitle}
        description={headerDescription}
        breadcrumbs={headerBreadcrumbs}
        afterHeader={headerAfter}
      >
        <div className="space-y-8">
          {subcategories && subcategories.length > 0 && (
            <div className="overflow-x-auto rounded-2xl border border-slate-200/70 bg-white p-4 text-slate-900 shadow-sm dark:border-slate-700/60 dark:bg-slate-900 dark:text-slate-100">
              <SubcategoryNav
                subcategories={subcategories}
                currentCategory={categoryName}
                animateElements={animateElements}
              />
            </div>
          )}

          <div className="rounded-2xl border border-slate-200/70 bg-white p-6 text-slate-900 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700/60 dark:bg-slate-900 dark:text-slate-100">
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
              totalResults={categoryStats.total}
              currentResults={productsList.length}
              sortOptions={SORT_OPTIONS}
              filterOptions={FILTER_OPTIONS}
              viewModes={VIEW_MODES}
              itemsPerPageOptions={ITEMS_PER_PAGE_OPTIONS}
              loading={loading}
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-slate-200/70 bg-white p-0 text-slate-900 shadow-sm dark:border-slate-700/60 dark:bg-slate-900 dark:text-slate-100">
              <ErrorMessage
                message={error.message || 'Failed to load products'}
                onRetry={() => dispatch(getProductsByCategory(categoryName, {
                  page: currentPage,
                  limit: itemsPerPage,
                  sort: sortBy
                }))}
                className="mb-0"
              />
            </div>
          )}

          {loading && productsList.length === 0 ? (
            <div className="rounded-2xl border border-slate-200/70 bg-white p-6 text-slate-900 shadow-sm dark:border-slate-700/60 dark:bg-slate-900 dark:text-slate-100">
              <div className={`grid gap-6 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : viewMode === 'list'
                    ? 'grid-cols-1 max-w-4xl mx-auto'
                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
              }`}>
                {Array.from({ length: itemsPerPage }).map((_, index) => (
                  <div
                    key={`category-skeleton-${index}`}
                    className="rounded-2xl border border-white/30 bg-white/60 p-4 shadow-inner dark:border-slate-800/60 dark:bg-slate-900/60"
                  >
                    <div className="flex h-full flex-col space-y-4 animate-pulse">
                      <div className="h-44 rounded-xl bg-white/70 dark:bg-slate-800/70"></div>
                      <div className="h-4 w-3/4 rounded-full bg-white/80 dark:bg-slate-800/80"></div>
                      <div className="h-4 w-1/2 rounded-full bg-white/80 dark:bg-slate-800/80"></div>
                      <div className="mt-auto h-10 w-2/3 rounded-2xl bg-white/80 dark:bg-slate-800/80"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {!loading && !error && productsList.length === 0 ? (
                <div className="rounded-2xl border border-slate-200/70 bg-white p-12 text-center text-slate-900 shadow-sm dark:border-slate-700/60 dark:bg-slate-900 dark:text-slate-100">
                  <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white/60 text-blue-500 shadow-inner dark:bg-slate-800/70">
                    <i className="fas fa-search text-3xl"></i>
                  </div>
                  <h3 className="mb-3 text-2xl font-semibold text-gray-900 dark:text-white">No products found</h3>
                  <p className="mb-6 text-gray-600 dark:text-gray-400">
                    {searchTerm
                      ? `No results for "${searchTerm}" in ${displayCategoryName.toLowerCase()}`
                      : `We couldn't find any ${displayCategoryName.toLowerCase()} products matching your filters.`}
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <button
                      onClick={handleClearFilters}
                      className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-2xl"
                    >
                      <i className="fas fa-times mr-2"></i>
                      Clear Filters
                    </button>
                    <Link
                      to="/products"
                      className="rounded-2xl border border-white/40 bg-white/60 px-6 py-3 font-semibold text-gray-900 shadow-sm transition-colors duration-200 hover:bg-white/80 dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-white dark:hover:bg-slate-900"
                    >
                      <i className="fas fa-compass mr-2"></i>
                      Browse All Products
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  {loading && productsList.length > 0 && (
                    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                      <LoadingSpinner size="medium" message="Updating products..." />
                    </div>
                  )}

                  <div className="space-y-6 rounded-2xl border border-slate-200/70 bg-white p-6 text-slate-900 shadow-sm dark:border-slate-700/60 dark:bg-slate-900 dark:text-slate-100">
                    <div className={`grid gap-6 ${
                      viewMode === 'grid'
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                        : viewMode === 'list'
                          ? 'grid-cols-1 max-w-4xl mx-auto'
                          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
                    }`}>
                      {productsList.map((product, index) => (
                        <div
                          key={product._id || product.id || index}
                          className="animate-fade-in"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <ProductCard
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
                  </div>

                  {!loading && !error && pagination && pagination.totalPages > 1 && (
                    <div className="flex justify-center rounded-2xl border border-slate-200/70 bg-white p-4 text-slate-900 shadow-sm dark:border-slate-700/60 dark:bg-slate-900 dark:text-slate-100">
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

          {canViewAnalytics ? (
            <div className="rounded-2xl border border-slate-200/70 bg-white p-6 text-slate-900 shadow-sm dark:border-slate-700/60 dark:bg-slate-900 dark:text-slate-100">
              <CategoryStats
                stats={categoryStats}
                categoryName={displayCategoryName}
                animateElements={animateElements}
              />
            </div>
          ) : (
            userRole !== 'guest' && (
              <div className="rounded-2xl border border-slate-200/70 bg-white p-8 text-center text-slate-900 shadow-sm dark:border-slate-700/60 dark:bg-slate-900 dark:text-slate-100">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                  <i className="fas fa-user-shield text-2xl"></i>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Admin access required
                </h3>
                <p className="mt-3 text-gray-600 dark:text-gray-400">
                  Category analytics are limited to administrators. Reach out to your store admin if you need access.
                </p>
              </div>
            )
          )}
        </div>
      </PageLayout>

      <div className="fixed bottom-8 right-8 z-40 flex flex-col space-y-4">
        {compareItems.length > 0 && (
          <button
            onClick={() => setShowCompareModal(true)}
            className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xl transition-all duration-200 hover:scale-105 hover:from-purple-500 hover:to-pink-500"
            title={`Compare ${compareItems.length} products`}
          >
            <i className="fas fa-balance-scale text-lg"></i>
            <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {compareItems.length}
            </span>
          </button>
        )}

        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl transition-all duration-200 hover:scale-105 hover:from-blue-500 hover:to-purple-500"
            title="Back to top"
          >
            <i className="fas fa-chevron-up text-lg"></i>
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
            setCompareItems(prev => {
              const next = prev.filter(item => item._id !== productId);
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
