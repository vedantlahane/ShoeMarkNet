import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import PageMeta from '../components/seo/PageMeta';
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
import CategoryHeader from '../components/category/CategoryHeader';
import CategoryStats from '../components/category/CategoryStats';
import SubcategoryNav from '../components/category/SubcategoryNav';
import ProductQuickView from '../components/products/ProductQuickView';
import CompareDrawer from '../components/products/CompareDrawer';

// Hooks
import useLocalStorage from '../hooks/useLocalStorage';
import useDebounce from '../hooks/useDebounce';
import useInfiniteScroll from '../hooks/useInfiniteScroll';

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
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

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

  // Category icon and color mapping
  const getCategoryIcon = useCallback((category) => {
    const iconMap = {
      'electronics': 'fa-laptop',
      'fashion': 'fa-tshirt',
      'home': 'fa-home',
      'beauty': 'fa-spa',
      'sports': 'fa-running',
      'books': 'fa-book',
      'toys': 'fa-gamepad',
      'automotive': 'fa-car',
      'health': 'fa-heartbeat',
      'jewelry': 'fa-gem',
      'shoes': 'fa-shoe-prints',
      'bags': 'fa-shopping-bag',
      'accessories': 'fa-glasses',
      'outdoor': 'fa-mountain'
    };
    return iconMap[category?.toLowerCase()] || 'fa-box';
  }, []);

  const getCategoryColor = useCallback((category) => {
    const colorMap = {
      'electronics': 'from-blue-500 to-cyan-500',
      'fashion': 'from-pink-500 to-rose-500',
      'home': 'from-green-500 to-emerald-500',
      'beauty': 'from-purple-500 to-violet-500',
      'sports': 'from-orange-500 to-red-500',
      'books': 'from-indigo-500 to-purple-500',
      'toys': 'from-yellow-500 to-orange-500',
      'automotive': 'from-gray-500 to-slate-500',
      'health': 'from-green-400 to-teal-500',
      'jewelry': 'from-yellow-400 to-amber-500',
      'shoes': 'from-brown-500 to-amber-600',
      'bags': 'from-purple-600 to-pink-600',
      'accessories': 'from-indigo-400 to-blue-500',
      'outdoor': 'from-green-600 to-lime-500'
    };
    return colorMap[category?.toLowerCase()] || 'from-blue-500 to-purple-500';
  }, []);

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

  return (
    <>
      {/* SEO Meta Tags */}
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
          name: `${categoryName} Collection`,
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

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        
        {/* Animated Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-400/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${4 + Math.random() * 6}s`
              }}
            />
          ))}
        </div>

        {/* Enhanced Header Section */}
        <CategoryHeader
          categoryName={categoryName}
          breadcrumb={breadcrumb}
          categoryIcon={getCategoryIcon(categoryName)}
          categoryColor={getCategoryColor(categoryName)}
          stats={categoryStats}
          animateElements={animateElements}
          onNavigate={navigate}
        />

        {/* Subcategory Navigation */}
        {subcategories && subcategories.length > 0 && (
          <SubcategoryNav
            subcategories={subcategories}
            currentCategory={categoryName}
            animateElements={animateElements}
          />
        )}

        {/* Enhanced Controls Section */}
        <section className="py-8 bg-white/50 dark:bg-gray-900/50 backdrop-blur-lg border-y border-white/20">
          <div className="container mx-auto px-4">
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
        </section>

        {/* Enhanced Products Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            
            {/* Error State */}
            {error && (
              <ErrorMessage
                message={error.message || 'Failed to load products'}
                onRetry={() => dispatch(getProductsByCategory(categoryName, {
                  page: currentPage,
                  limit: itemsPerPage,
                  sort: sortBy
                }))}
                className="max-w-md mx-auto"
              />
            )}

            {/* Loading State */}
            {loading && productsList.length === 0 && (
              <div className={`grid gap-8 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : viewMode === 'list'
                  ? 'grid-cols-1 max-w-4xl mx-auto'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
              }`}>
                {Array.from({ length: itemsPerPage }).map((_, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-3xl overflow-hidden animate-pulse">
                    <div className="h-64 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600"></div>
                    <div className="p-6 space-y-4">
                      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full"></div>
                      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full w-3/4"></div>
                      <div className="h-6 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 rounded-full w-1/2"></div>
                      <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Products Grid/List */}
            {!loading && !error && (
              <>
                {productsList.length === 0 ? (
                  /* Enhanced Empty State */
                  <div className={`text-center py-20 ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-3xl p-12 max-w-lg mx-auto">
                      <div className={`w-24 h-24 bg-gradient-to-r ${getCategoryColor(categoryName)} rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse`}>
                        <i className={`fas ${getCategoryIcon(categoryName)} text-4xl text-white`}></i>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        No Products Found
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-8">
                        {searchTerm 
                          ? `No results found for "${searchTerm}" in ${categoryName?.toLowerCase()}`
                          : `We couldn't find any ${categoryName?.toLowerCase()} products matching your criteria.`
                        }
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                          onClick={handleClearFilters}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-200"
                        >
                          <i className="fas fa-undo mr-2"></i>
                          Clear Filters
                        </button>
                        <Link
                          to="/products"
                          className="bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 text-gray-900 dark:text-white font-bold py-3 px-6 rounded-2xl hover:bg-white/20 transition-all duration-200 text-center"
                        >
                          <i className="fas fa-search mr-2"></i>
                          Browse All Products
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Loading overlay */}
                    {loading && productsList.length > 0 && (
                      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
                        <LoadingSpinner size="medium" message="Updating products..." />
                      </div>
                    )}

                    <div className={`grid gap-8 ${
                      viewMode === 'grid' 
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                        : viewMode === 'list'
                        ? 'grid-cols-1 max-w-4xl mx-auto'
                        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
                    } ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
                      {productsList.map((product, index) => (
                        <div
                          key={product._id || index}
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
                  </>
                )}
              </>
            )}

            {/* Enhanced Pagination */}
            {!loading && !error && productsList.length > 0 && pagination && pagination.totalPages > 1 && (
              <div className={`mt-16 ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.8s' }}>
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                  showInfo={true}
                  totalItems={categoryStats.total}
                  itemsPerPage={itemsPerPage}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl shadow-2xl"
                />
              </div>
            )}
          </div>
        </section>

        {/* Category Stats Section */}
        <CategoryStats
          stats={categoryStats}
          categoryName={categoryName}
          animateElements={animateElements}
          className="py-16 bg-white/5"
        />

        {/* Floating Action Buttons */}
        <div className="fixed bottom-8 right-8 flex flex-col space-y-4 z-40">
          {/* Compare Button */}
          {compareItems.length > 0 && (
            <button
              onClick={() => setShowCompareModal(true)}
              className="w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full shadow-2xl transition-all duration-200 transform hover:scale-110 flex items-center justify-center relative"
              title={`Compare ${compareItems.length} products`}
            >
              <i className="fas fa-balance-scale text-lg"></i>
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {compareItems.length}
              </span>
            </button>
          )}

          {/* Back to Top Button */}
          {showScrollTop && (
            <button
              onClick={scrollToTop}
              className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-2xl transition-all duration-200 transform hover:scale-110 flex items-center justify-center"
              title="Back to top"
            >
              <i className="fas fa-chevron-up text-lg"></i>
            </button>
          )}
        </div>

        {/* Modals */}
        {quickViewProduct && (
          <ProductQuickView
            product={quickViewProduct}
            onClose={() => setQuickViewProduct(null)}
            onAddToCompare={() => handleAddToCompare(quickViewProduct)}
          />
        )}

        {compareItems.length > 0 && (
          <CompareDrawer
            items={compareItems}
            onRemoveItem={(productId) => {
              setCompareItems(prev => prev.filter(item => item._id !== productId));
            }}
            onClearAll={() => setCompareItems([])}
            onClose={() => setCompareItems([])}
          />
        )}

        {/* Custom Styles */}
      </div>
    </>
  );
};

export default Category;
