import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import PageMeta from '../components/seo/PageMeta';
import PageLayout from '../components/common/layout/PageLayout';
import { toast } from 'react-toastify';
import PageHeader from '../components/common/layout/PageHeader';

// Redux actions
import {
  fetchOrders,
  cancelOrder,
  clearOrderError,
  resetOrderSuccess
} from '../redux/slices/orderSlice';

// Components
import LoadingSpinner from '../components/common/feedback/LoadingSpinner';
import ErrorMessage from '../components/common/feedback/ErrorMessage';
import Pagination from '../components/common/navigation/Pagination';
import OrderCard from '../components/orders/OrderCard';
import OrderTable from '../components/orders/OrderTable';
import OrderFilters from '../components/orders/OrderFilters';
import OrderStats from '../components/orders/OrderStats';
// import ExportModal from '../components/orders/ExportModal';

// Hooks
import useLocalStorage from '../hooks/useLocalStorage';

// Utils
import { trackEvent } from '../utils/analytics';
import { formatPrice, formatDate, getRelativeTime } from '../utils/helpers';

// Constants
const ORDER_STATUSES = [
  { value: 'all', label: 'All Orders', icon: 'fa-list' },
  { value: 'pending', label: 'Pending', icon: 'fa-clock', color: 'yellow' },
  { value: 'processing', label: 'Processing', icon: 'fa-cog', color: 'blue' },
  { value: 'shipped', label: 'Shipped', icon: 'fa-truck', color: 'purple' },
  { value: 'delivered', label: 'Delivered', icon: 'fa-check-circle', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', icon: 'fa-times-circle', color: 'red' }
];

const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest First', icon: 'fa-sort-amount-down' },
  { value: 'createdAt:asc', label: 'Oldest First', icon: 'fa-sort-amount-up' },
  { value: 'totalPrice:desc', label: 'Highest Amount', icon: 'fa-dollar-sign' },
  { value: 'totalPrice:asc', label: 'Lowest Amount', icon: 'fa-dollar-sign' },
  { value: 'status:asc', label: 'Status A-Z', icon: 'fa-sort-alpha-up' }
];

const ITEMS_PER_PAGE_OPTIONS = [
  { value: 6, label: '6 per page' },
  { value: 12, label: '12 per page' },
  { value: 24, label: '24 per page' },
  { value: 48, label: '48 per page' }
];

const Orders = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  // Redux state
  const {
    orders,
    loading,
    error,
    success: orderSuccess
  } = useSelector((state) => state.order);

  const {
    user,
    isAuthenticated,
    isInitialized
  } = useSelector((state) => state.auth);

  // Local state
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'createdAt:desc');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [itemsPerPage, setItemsPerPage] = useLocalStorage('ordersPerPage', parseInt(searchParams.get('limit') || '12', 10));
  const [viewMode, setViewMode] = useLocalStorage('ordersViewMode', 'cards');
  const [dateRange, setDateRange] = useState({
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || ''
  });
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [animateElements, setAnimateElements] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Trigger animations
  useEffect(() => {
    setTimeout(() => setAnimateElements(true), 100);
  }, []);

  // Authentication check
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      toast.info('Please sign in to view your orders');
      navigate(`/login?redirect=${encodeURIComponent('/orders')}`);
    }
  }, [isAuthenticated, isInitialized, navigate]);

  // Fetch orders
  useEffect(() => {
    if (isAuthenticated) {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sort: sortBy,
        ...(filterStatus !== 'all' && { status: filterStatus }),
        ...(searchTerm && { search: searchTerm }),
        ...(dateRange.startDate && { startDate: dateRange.startDate }),
        ...(dateRange.endDate && { endDate: dateRange.endDate })
      };

      dispatch(fetchOrders(params));

      // Track page view
      trackEvent('page_view', {
        page_title: 'Orders',
        page_location: window.location.href,
        content_category: 'orders'
      });
    }
  }, [
    dispatch,
    isAuthenticated,
    currentPage,
    itemsPerPage,
    sortBy,
    filterStatus,
    searchTerm,
    dateRange
  ]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (itemsPerPage !== 12) params.set('limit', itemsPerPage.toString());
    if (sortBy !== 'createdAt:desc') params.set('sort', sortBy);
    if (filterStatus !== 'all') params.set('status', filterStatus);
    if (searchTerm) params.set('search', searchTerm);
    if (dateRange.startDate) params.set('startDate', dateRange.startDate);
    if (dateRange.endDate) params.set('endDate', dateRange.endDate);

    const newParamsString = params.toString();
    const currentParamsString = searchParams.toString();

    if (newParamsString !== currentParamsString) {
      setSearchParams(params, { replace: true });
    }
  }, [
    currentPage,
    itemsPerPage,
    sortBy,
    filterStatus,
    searchTerm,
    dateRange,
    setSearchParams,
    searchParams
  ]);

  // Handle success notifications
  useEffect(() => {
    if (orderSuccess) {
      setTimeout(() => {
        dispatch(resetOrderSuccess());
      }, 3000);
    }
  }, [orderSuccess, dispatch]);

  // Memoized calculations
  const orderStats = useMemo(() => {
    if (!orders || !Array.isArray(orders)) return {
      total: 0,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      totalValue: 0,
      averageValue: 0
    };

    const stats = orders.reduce((acc, order) => {
      acc.total += 1;
      acc[order.status?.toLowerCase()] = (acc[order.status?.toLowerCase()] || 0) + 1;
      acc.totalValue += order.totalPrice || 0;
      return acc;
    }, {
      total: 0,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      totalValue: 0
    });

    stats.averageValue = stats.total > 0 ? stats.totalValue / stats.total : 0;
    return stats;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (!orders || !Array.isArray(orders)) return [];

    return orders.filter(order => {
      const matchesSearch = !searchTerm ||
        order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shippingAddress?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderItems?.some(item =>
          item.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesStatus = filterStatus === 'all' ||
        order.status?.toLowerCase() === filterStatus.toLowerCase();

      const matchesDateRange = (!dateRange.startDate || new Date(order.createdAt) >= new Date(dateRange.startDate)) &&
        (!dateRange.endDate || new Date(order.createdAt) <= new Date(dateRange.endDate));

      return matchesSearch && matchesStatus && matchesDateRange;
    });
  }, [orders, searchTerm, filterStatus, dateRange]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const totalPages = useMemo(() =>
    Math.ceil(filteredOrders.length / itemsPerPage),
    [filteredOrders.length, itemsPerPage]
  );

  // Enhanced handlers
  const handleSearchChange = useCallback((newSearch) => {
    setSearchTerm(newSearch);
    setCurrentPage(1);

    trackEvent('order_search', {
      search_term: newSearch
    });
  }, []);

  const handleFilterChange = useCallback((newFilter) => {
    setFilterStatus(newFilter);
    setCurrentPage(1);

    trackEvent('order_filter', {
      filter_type: 'status',
      filter_value: newFilter
    });
  }, []);

  const handleSortChange = useCallback((newSort) => {
    setSortBy(newSort);
    setCurrentPage(1);

    trackEvent('order_sort', {
      sort_option: newSort
    });
  }, []);

  const handleDateRangeChange = useCallback((newDateRange) => {
    setDateRange(newDateRange);
    setCurrentPage(1);

    trackEvent('order_date_filter', {
      start_date: newDateRange.startDate,
      end_date: newDateRange.endDate
    });
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    trackEvent('pagination_click', {
      page_number: page,
      total_pages: totalPages
    });
  }, [totalPages]);

  const handleItemsPerPageChange = useCallback((newLimit) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);

    trackEvent('items_per_page_changed', {
      items_per_page: newLimit
    });
  }, [setItemsPerPage]);

  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);

    trackEvent('view_mode_changed', {
      view_mode: mode
    });
  }, [setViewMode]);

  const handleCancelOrder = useCallback(async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      await dispatch(cancelOrder(orderId)).unwrap();

      trackEvent('order_cancelled', {
        order_id: orderId
      });
    } catch (error) {
      console.error('Failed to cancel order:', error);
    }
  }, [dispatch]);

  const handleDownloadInvoice = useCallback((orderId) => {
    // Simulate invoice download
    toast.info(`📄 Preparing invoice for order ${orderId}...`);

    trackEvent('invoice_download', {
      order_id: orderId
    });

    // In a real app, this would trigger an actual download
    setTimeout(() => {
      toast.success('📥 Invoice download started!');
    }, 1000);
  }, []);

  const handleBulkAction = useCallback(async (action) => {
    if (selectedOrders.length === 0) {
      toast.warning('Please select orders first');
      return;
    }

    setBulkActionLoading(true);

    try {
      switch (action) {
        case 'cancel':
          if (window.confirm(`Cancel ${selectedOrders.length} selected orders?`)) {
            for (const orderId of selectedOrders) {
              await dispatch(cancelOrder(orderId)).unwrap();
            }
            toast.success(`${selectedOrders.length} orders cancelled successfully`);
            setSelectedOrders([]);
          }
          break;
        case 'export':
          setShowExportModal(true);
          break;
        default:
          break;
      }

      trackEvent('bulk_action', {
        action,
        order_count: selectedOrders.length
      });
    } catch (error) {
      toast.error('Bulk action failed');
    } finally {
      setBulkActionLoading(false);
    }
  }, [selectedOrders, dispatch]);

  const handleOrderSelect = useCallback((orderId) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  }, []);

  const handleSelectAllOrders = useCallback(() => {
    if (selectedOrders.length === paginatedOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(paginatedOrders.map(order => order._id));
    }
  }, [selectedOrders.length, paginatedOrders]);

  const handleRetry = useCallback(() => {
    dispatch(clearOrderError());
    dispatch(fetchOrders({
      page: currentPage,
      limit: itemsPerPage,
      sort: sortBy,
      ...(filterStatus !== 'all' && { status: filterStatus }),
      ...(searchTerm && { search: searchTerm })
    }));
  }, [dispatch, currentPage, itemsPerPage, sortBy, filterStatus, searchTerm]);

  // Loading state
  if (loading && (!orders || orders.length === 0)) {
    return (
      <div className="min-h-screen bg-theme">
        <div className="container-app py-8">
          <LoadingSpinner size="large" message="Loading your orders..." />
        </div>
      </div>
    );
  }

  // Error state
  if (error && (!orders || orders.length === 0)) {
    return (
      <div className="min-h-screen bg-theme flex items-center justify-center p-4">
        <ErrorMessage
          message={error.message || 'Failed to load orders'}
          onRetry={handleRetry}
          className="max-w-md"
        />
      </div>
    );
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <PageMeta
        title="My Orders - ShoeMarkNet | Track Your Orders"
        description="Track and manage your ShoeMarkNet orders. View order history, status updates, and download invoices."
        robots="noindex, nofollow"
        canonical="https://shoemarknet.com/orders"
      />

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">

        {/* Animated Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 bg-blue-400/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${4 + Math.random() * 6}s`
              }}
            />
          ))}
        </div>

        <div className="container-app py-6 relative z-10">
          <PageHeader
            title="My Orders"
            description={`Welcome back${user?.name ? ', ' + user.name : ''}! Track and manage your purchases here.`}
            breadcrumbItems={[{ label: 'Orders' }]}
            actions={
              filteredOrders.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <div className="bg-blue-500/20 backdrop-blur-lg border border-blue-300/50 rounded-xl px-3 py-1.5 text-sm text-blue-800 dark:text-blue-200">
                    <i className="fas fa-chart-line mr-1.5"></i>
                    {orderStats.total} Total Orders
                  </div>
                  <div className="bg-green-500/20 backdrop-blur-lg border border-green-300/50 rounded-xl px-3 py-1.5 text-sm text-green-800 dark:text-green-200">
                    <i className="fas fa-dollar-sign mr-1.5"></i>
                    {formatPrice(orderStats.totalValue)} Lifetime
                  </div>
                </div>
              )
            }
          />

          {(!orders || orders.length === 0) ? (
            /* Enhanced Empty State */
            <div className={`text-center py-12 ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl p-10 shadow-xl max-w-xl mx-auto">
                <div className="w-20 h-20 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <i className="fas fa-shopping-bag text-3xl text-white"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  No Orders Yet
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg leading-relaxed">
                  You haven't placed any orders yet. Start exploring our amazing collection of shoes
                  and find your perfect pair today!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/products">
                    <button className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-2xl">
                      <i className="fas fa-shopping-cart mr-3"></i>
                      Start Shopping
                      <i className="fas fa-arrow-right ml-3"></i>
                    </button>
                  </Link>
                  <Link to="/categories">
                    <button className="bg-white/20 backdrop-blur-lg border border-white/30 text-gray-900 dark:text-white font-bold py-4 px-8 rounded-2xl hover:bg-white/30 transition-all duration-200">
                      <i className="fas fa-th-large mr-3"></i>
                      Browse Categories
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Enhanced Statistics Cards */}
              <OrderStats
                stats={orderStats}
                className={`mb-8 ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`}
                style={{ animationDelay: '0.2s' }}
              />

              {/* Enhanced Filters */}
              <OrderFilters
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                filterStatus={filterStatus}
                onFilterChange={handleFilterChange}
                sortBy={sortBy}
                onSortChange={handleSortChange}
                dateRange={dateRange}
                onDateRangeChange={handleDateRangeChange}
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={handleItemsPerPageChange}
                totalResults={filteredOrders.length}
                loading={loading}
                statusOptions={ORDER_STATUSES}
                sortOptions={SORT_OPTIONS}
                itemsPerPageOptions={ITEMS_PER_PAGE_OPTIONS}
                className={`mb-8 ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`}
                style={{ animationDelay: '0.4s' }}
              />

              {/* Bulk Actions */}
              {selectedOrders.length > 0 && (
                <div className={`mb-6 ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.5s' }}>
                  <div className="bg-blue-500/20 backdrop-blur-xl border border-blue-300/50 rounded-2xl p-4 shadow-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-800 dark:text-blue-200 font-medium">
                        <i className="fas fa-check-square mr-2"></i>
                        {selectedOrders.length} order{selectedOrders.length > 1 ? 's' : ''} selected
                      </span>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleBulkAction('cancel')}
                          disabled={bulkActionLoading}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                        >
                          <i className="fas fa-times mr-2"></i>
                          Cancel Selected
                        </button>
                        <button
                          onClick={() => handleBulkAction('export')}
                          disabled={bulkActionLoading}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                        >
                          <i className="fas fa-download mr-2"></i>
                          Export Selected
                        </button>
                        <button
                          onClick={() => setSelectedOrders([])}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                        >
                          <i className="fas fa-times mr-2"></i>
                          Clear
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading overlay for pagination */}
              {loading && orders.length > 0 && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
                  <LoadingSpinner size="medium" message="Updating orders..." />
                </div>
              )}

              {/* Enhanced Orders Display */}
              {viewMode === 'cards' ? (
                <OrderCard
                  orders={paginatedOrders}
                  selectedOrders={selectedOrders}
                  onOrderSelect={handleOrderSelect}
                  onCancelOrder={handleCancelOrder}
                  onDownloadInvoice={handleDownloadInvoice}
                  formatPrice={formatPrice}
                  getRelativeTime={getRelativeTime}
                  className={`mb-8 ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`}
                  style={{ animationDelay: '0.6s' }}
                />
              ) : (
                <OrderTable
                  orders={paginatedOrders}
                  selectedOrders={selectedOrders}
                  onOrderSelect={handleOrderSelect}
                  onSelectAll={handleSelectAllOrders}
                  onCancelOrder={handleCancelOrder}
                  onDownloadInvoice={handleDownloadInvoice}
                  formatPrice={formatPrice}
                  formatDate={formatDate}
                  getRelativeTime={getRelativeTime}
                  className={`mb-8 ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`}
                  style={{ animationDelay: '0.6s' }}
                />
              )}

              {/* Enhanced Pagination */}
              {totalPages > 1 && (
                <div className={`${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.8s' }}>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    showInfo={true}
                    totalItems={filteredOrders.length}
                    itemsPerPage={itemsPerPage}
                    className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl shadow-2xl"
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Export Modal */}
        {/* {showExportModal && (
          <ExportModal
            selectedOrders={selectedOrders}
            allOrders={filteredOrders}
            onClose={() => setShowExportModal(false)}
            onExport={(format, data) => {
              // Handle export logic
              toast.success(`Exporting ${data.length} orders as ${format}...`);
              setShowExportModal(false);
              setSelectedOrders([]);
            }}
          />
        )} */}

        {/* Custom Styles */}
      </div>
    </>
  );
};

export default Orders;
