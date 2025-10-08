import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import PageMeta from '../seo/PageMeta';

// Redux actions
import { 
  fetchAllOrders, 
  updateOrderStatus, 
  deleteOrder 
} from '../../redux/slices/orderSlice';
import orderService from '../../services/orderService';

// Components
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import Pagination from '../common/Pagination';
import OrderCard from '../orders/OrderCard';
import OrderTable from '../orders/OrderTable';
import OrderDetailsModal from './orders/OrderDetailsModal';
import OrderFilters from '../orders/OrderFilters';
import OrderStats from '../orders/OrderStats';
import OrderBulkActions from './orders/OrderBulkActions';
import ExportModal from './orders/ExportModal';
import OrderTrackingModal from './orders/OrderTrackingModal';

// Hooks
import useWebSocket from '../../hooks/useWebSocket';
import useLocalStorage from '../../hooks/useLocalStorage';
import useDebounce from '../../hooks/useDebounce';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';

// Utils
import { trackEvent } from '../../utils/analytics';
import { formatCurrency, formatDate, getRelativeTime } from '../../utils/helpers';

// Constants
const ORDER_STATUSES = {
  ALL: 'all',
  PENDING: 'pending',
  PAID: 'paid',
  UNPAID: 'unpaid',
  DELIVERED: 'delivered',
  PROCESSING: 'processing',
  CANCELLED: 'cancelled'
};

const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Newest First', icon: 'fa-clock' },
  { value: 'createdAt-asc', label: 'Oldest First', icon: 'fa-history' },
  { value: 'totalPrice-desc', label: 'Highest Value', icon: 'fa-arrow-up' },
  { value: 'totalPrice-asc', label: 'Lowest Value', icon: 'fa-arrow-down' },
  { value: 'customer-asc', label: 'Customer A-Z', icon: 'fa-sort-alpha-up' },
  { value: 'customer-desc', label: 'Customer Z-A', icon: 'fa-sort-alpha-down' }
];

const BULK_ACTIONS = [
  { id: 'markPaid', label: 'Mark as Paid', icon: 'fa-check-circle', color: 'from-green-600 to-emerald-600' },
  { id: 'markDelivered', label: 'Mark as Delivered', icon: 'fa-truck', color: 'from-blue-600 to-cyan-600' },
  { id: 'markProcessing', label: 'Mark as Processing', icon: 'fa-cog', color: 'from-yellow-600 to-orange-600' },
  { id: 'delete', label: 'Delete Orders', icon: 'fa-trash', color: 'from-red-600 to-pink-600' }
];

const OrderManagement = ({ stats, realtimeData, onDataUpdate, isLoading, externalAction, onActionHandled }) => {
  const dispatch = useDispatch();

  // Redux state
  const { adminOrders, loading, error } = useSelector(state => state.order);
  const { user } = useSelector(state => state.auth);

  // WebSocket for real-time updates
  const { isConnected, lastMessage } = useWebSocket('/admin/orders');

  // Local state
  const [statusFilter, setStatusFilter] = useLocalStorage('orderStatusFilter', ORDER_STATUSES.ALL);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useLocalStorage('orderSortBy', 'createdAt');
  const [sortOrder, setSortOrder] = useLocalStorage('orderSortOrder', 'desc');
  const [viewMode, setViewMode] = useLocalStorage('orderViewMode', 'cards');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useLocalStorage('ordersPerPage', 12);
  const [animateCards, setAnimateCards] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  // Debounced search
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Initialize
  useEffect(() => {
    setTimeout(() => setAnimateCards(true), 100);
    fetchOrdersData();
    
    trackEvent('admin_orders_viewed', {
      user_id: user?._id,
      timestamp: new Date().toISOString()
    });
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'ctrl+r': () => handleRefresh(),
    'ctrl+e': () => setShowExportModal(true),
    'ctrl+f': () => document.getElementById('order-search')?.focus(),
    'delete': () => selectedOrders.length > 0 && handleBulkAction('delete')
  });

  // Handle real-time updates
  useEffect(() => {
    if (lastMessage && isConnected) {
      const data = JSON.parse(lastMessage.data);
      if (data.type === 'order_update') {
        handleRealTimeOrderUpdate(data.payload);
      }
    }
  }, [lastMessage, isConnected]);

  // Fetch orders data
  const fetchOrdersData = useCallback(async () => {
    try {
      setRefreshing(true);
      const queryParams = {
        page: currentPage,
        limit: ordersPerPage,
        sort: `${sortBy}:${sortOrder}`,
        ...(statusFilter !== ORDER_STATUSES.ALL && { status: statusFilter }),
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(dateRange.start && { startDate: dateRange.start }),
        ...(dateRange.end && { endDate: dateRange.end }),
        ...(priceRange.min && { minPrice: priceRange.min }),
        ...(priceRange.max && { maxPrice: priceRange.max })
      };

      await dispatch(fetchAllOrders(queryParams));
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, currentPage, ordersPerPage, sortBy, sortOrder, statusFilter, debouncedSearchTerm, dateRange, priceRange]);

  useEffect(() => {
    if (!externalAction) {
      return;
    }

    if (externalAction.section && externalAction.section !== 'orders') {
      onActionHandled?.(externalAction);
      return;
    }

    let handled = false;

    switch (externalAction.type) {
      case 'searchOrders': {
        const nextTerm = externalAction?.payload?.term || '';
        setSearchTerm(nextTerm);
        setCurrentPage(1);

        if (externalAction?.payload?.orderId) {
          const targetOrder = adminOrders?.items?.find(
            (order) => order?._id === externalAction.payload.orderId
          );

          if (targetOrder) {
            setSelectedOrder(targetOrder);
            setShowOrderDetails(true);
          }
        }

        if (nextTerm && nextTerm !== searchTerm) {
          toast.info(`Filtering orders for "${nextTerm}"`);
        }

        trackEvent('admin_orders_search_applied', {
          query: nextTerm,
          source: 'global_search'
        });

        handled = true;
        break;
      }
      default:
        break;
    }

    if (!handled) {
      onActionHandled?.(externalAction);
      return;
    }

    onActionHandled?.(externalAction);
  }, [externalAction, onActionHandled, adminOrders, searchTerm]);

  // Refetch when filters change
  useEffect(() => {
    setCurrentPage(1);
    fetchOrdersData();
  }, [statusFilter, debouncedSearchTerm, sortBy, sortOrder, dateRange, priceRange]);

  // Refetch when page or page size changes
  useEffect(() => {
    fetchOrdersData();
  }, [currentPage, ordersPerPage]);

  // Handle real-time order updates
  const handleRealTimeOrderUpdate = useCallback((updatedOrder) => {
    // Update local state or refetch if needed
    toast.info(`Order #${updatedOrder._id.slice(-8)} has been updated`);
    if (onDataUpdate) {
      onDataUpdate(updatedOrder);
    }
  }, [onDataUpdate]);

  // Enhanced order calculations
  const orderStats = useMemo(() => {
    const orders = adminOrders?.items || [];
    
    const totalOrders = orders.length;
    const paidOrders = orders.filter(order => order.isPaid).length;
    const deliveredOrders = orders.filter(order => order.isDelivered).length;
    const processingOrders = orders.filter(order => order.isPaid && !order.isDelivered).length;
    const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;
    
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const todaysOrders = orders.filter(order => {
      const today = new Date().toDateString();
      return new Date(order.createdAt).toDateString() === today;
    }).length;

    const pendingPayments = orders.filter(order => !order.isPaid).length;
    
    return {
      totalOrders,
      paidOrders,
      deliveredOrders,
      processingOrders,
      cancelledOrders,
      totalRevenue,
      avgOrderValue,
      todaysOrders,
      pendingPayments,
      conversionRate: totalOrders > 0 ? (paidOrders / totalOrders) * 100 : 0
    };
  }, [adminOrders?.items]);

  // Enhanced handlers
  const handleStatusUpdate = useCallback(async (orderId, field, value) => {
    try {
      await dispatch(updateOrderStatus({ orderId, updates: { [field]: value } })).unwrap();
      
      toast.success(`Order status updated successfully!`);
      
      trackEvent('order_status_updated', {
        order_id: orderId,
        field,
        value,
        user_id: user?._id
      });
      
    } catch (error) {
      toast.error(`Failed to update order: ${error.message}`);
    }
  }, [dispatch, user]);

  const handleBulkAction = useCallback(async (action) => {
    if (selectedOrders.length === 0) return;

    const confirmMessage = action === 'delete' 
      ? `Are you sure you want to delete ${selectedOrders.length} order(s)? This action cannot be undone.`
      : `Are you sure you want to ${action.replace(/([A-Z])/g, ' $1').toLowerCase()} ${selectedOrders.length} order(s)?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      const loadingToast = toast.loading(`Processing ${selectedOrders.length} orders...`);

      const promises = selectedOrders.map(orderId => {
        switch (action) {
          case 'markPaid':
            return dispatch(updateOrderStatus({ orderId, updates: { isPaid: true } }));
          case 'markDelivered':
            return dispatch(updateOrderStatus({ orderId, updates: { isDelivered: true } }));
          case 'markProcessing':
            return dispatch(updateOrderStatus({ orderId, updates: { status: 'processing' } }));
          case 'delete':
            return dispatch(deleteOrder(orderId));
          default:
            return Promise.resolve();
        }
      });

      await Promise.all(promises);
      
      toast.dismiss(loadingToast);
      toast.success(`Successfully processed ${selectedOrders.length} orders!`);
      
      setSelectedOrders([]);
      
      trackEvent('bulk_order_action', {
        action,
        order_count: selectedOrders.length,
        user_id: user?._id
      });
      
    } catch (error) {
      toast.error(`Bulk action failed: ${error.message}`);
    }
  }, [selectedOrders, dispatch, user]);

  const handleRefresh = useCallback(() => {
    fetchOrdersData();
    trackEvent('orders_refreshed', { user_id: user?._id });
  }, [fetchOrdersData, user]);

  const handleExport = useCallback(async (format, filters) => {
    try {
      const exportSource = Array.isArray(adminOrders?.items) ? adminOrders.items : [];
      const exportData = await orderService.exportOrders(exportSource, format);
      
      // Create download link
      const blob = new Blob([exportData], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orders-export-${new Date().toISOString().split('T')[0]}.${format}`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success(`Orders exported successfully as ${format.toUpperCase()}!`);
      
      trackEvent('orders_exported', {
        format,
        filters,
        exported_count: exportSource.length,
        user_id: user?._id
      });
      
    } catch (error) {
      toast.error(`Export failed: ${error.message}`);
    }
  }, [adminOrders?.items, user]);

  const handleOrderSelect = useCallback((orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    const currentOrderIds = (adminOrders?.items || []).map(order => order._id);
    setSelectedOrders(prev => 
      prev.length === currentOrderIds.length ? [] : currentOrderIds
    );
  }, [adminOrders?.items]);

  const handleOrderDetails = useCallback((order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
    
    trackEvent('order_details_viewed', {
      order_id: order._id,
      user_id: user?._id
    });
  }, [user]);

  const handleTrackOrder = useCallback((orderId) => {
    setTrackingOrderId(orderId);
    setShowTrackingModal(true);
    
    trackEvent('order_tracking_viewed', {
      order_id: orderId,
      user_id: user?._id
    });
  }, [user]);

  const handleFilterChange = useCallback((filterType, value) => {
    switch (filterType) {
      case 'status':
        setStatusFilter(value);
        break;
      case 'search':
        setSearchTerm(value);
        break;
      case 'sort':
        const [field, order] = value.split('-');
        setSortBy(field);
        setSortOrder(order);
        break;
      case 'dateRange':
        setDateRange(value);
        break;
      case 'priceRange':
        setPriceRange(value);
        break;
      default:
        break;
    }
  }, [setStatusFilter, setSortBy, setSortOrder]);

  // Get priority level for orders
  const getPriorityLevel = useCallback((order) => {
    const orderAge = (new Date() - new Date(order.createdAt)) / (1000 * 60 * 60 * 24);
    if (!order.isPaid && orderAge > 7) return 'high';
    if (order.isPaid && !order.isDelivered && orderAge > 3) return 'medium';
    return 'low';
  }, []);

  // Loading state
  if (isLoading || (loading && !adminOrders?.items?.length)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="flex justify-center items-center h-96">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-12 text-center shadow-2xl">
            <LoadingSpinner size="large" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 mt-6">
              <i className="fas fa-shopping-cart mr-2 text-blue-500"></i>
              Loading Orders
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Fetching order data and analytics...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !adminOrders?.items?.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <ErrorMessage
          message={error.message || 'Failed to load orders'}
          onRetry={fetchOrdersData}
          className="max-w-md mx-auto"
        />
      </div>
    );
  }

  const orders = adminOrders?.items || [];

  return (
    <>
      <PageMeta
        title="Order Management | Admin Dashboard - ShoeMarkNet"
        description="Manage customer orders, track payments, handle fulfillment, and analyze order data with comprehensive admin tools."
        robots="noindex, nofollow"
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        
        {/* Enhanced Header */}
        <div className={`mb-8 ${animateCards ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    <i className="fas fa-shopping-cart mr-3"></i>
                    Order Management
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-lg flex items-center">
                    <i className="fas fa-chart-line mr-2"></i>
                    Monitor and manage all customer orders
                    {isConnected && (
                      <span className="ml-4 flex items-center text-green-600 dark:text-green-400">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                        Live Updates
                      </span>
                    )}
                  </p>
                </div>
                
                {/* Enhanced Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="bg-white/20 backdrop-blur-lg border border-white/30 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-2xl hover:bg-white/30 transition-all duration-200 disabled:opacity-50"
                    title="Refresh Orders"
                  >
                    <i className={`fas fa-sync-alt mr-2 ${refreshing ? 'animate-spin' : ''}`}></i>
                    Refresh
                  </button>
                  <button
                    onClick={() => setShowExportModal(true)}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105"
                  >
                    <i className="fas fa-file-export mr-2"></i>
                    Export
                  </button>
                  <button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105">
                    <i className="fas fa-plus mr-2"></i>
                    Add Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats */}
        <OrderStats 
          stats={orderStats}
          realtimeData={realtimeData}
          animateCards={animateCards}
          className="mb-8"
        />

        {/* Enhanced Filters */}
        <OrderFilters
          statusFilter={statusFilter}
          searchTerm={searchTerm}
          sortBy={sortBy}
          sortOrder={sortOrder}
          viewMode={viewMode}
          ordersPerPage={ordersPerPage}
          dateRange={dateRange}
          priceRange={priceRange}
          selectedCount={selectedOrders.length}
          totalCount={orders.length}
          onFilterChange={handleFilterChange}
          onViewModeChange={setViewMode}
          onOrdersPerPageChange={setOrdersPerPage}
          onSelectAll={handleSelectAll}
          onClearSelection={() => setSelectedOrders([])}
          sortOptions={SORT_OPTIONS}
          animateCards={animateCards}
          className="mb-8"
        />

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <OrderBulkActions
            selectedCount={selectedOrders.length}
            actions={BULK_ACTIONS}
            onBulkAction={handleBulkAction}
            onClearSelection={() => setSelectedOrders([])}
            animateCards={animateCards}
            className="mb-8"
          />
        )}

        {/* Orders Display */}
        {orders.length === 0 ? (
          /* Empty State */
          <div className={`${animateCards ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-12 text-center shadow-2xl">
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-shopping-cart text-gray-400 text-4xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                No Orders Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {debouncedSearchTerm || statusFilter !== ORDER_STATUSES.ALL
                  ? 'No orders match your current filters. Try adjusting your search criteria.'
                  : 'Orders will appear here when customers start placing them.'
                }
              </p>
              <div className="flex justify-center space-x-4">
                {(debouncedSearchTerm || statusFilter !== ORDER_STATUSES.ALL) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter(ORDER_STATUSES.ALL);
                      setDateRange({ start: '', end: '' });
                      setPriceRange({ min: '', max: '' });
                    }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-200"
                  >
                    <i className="fas fa-times mr-2"></i>
                    Clear Filters
                  </button>
                )}
                <button className="bg-white/20 backdrop-blur-lg border border-white/30 text-gray-900 dark:text-white font-bold py-3 px-6 rounded-2xl hover:bg-white/30 transition-all duration-200">
                  <i className="fas fa-plus mr-2"></i>
                  Create Test Order
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Loading overlay */}
            {(loading || refreshing) && orders.length > 0 && (
              <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
                <LoadingSpinner size="medium" message="Updating orders..." />
              </div>
            )}

            {viewMode === 'cards' ? (
              /* Cards View */
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {orders.map((order, index) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    index={index}
                    isSelected={selectedOrders.includes(order._id)}
                    priority={getPriorityLevel(order)}
                    onSelect={() => handleOrderSelect(order._id)}
                    onStatusUpdate={handleStatusUpdate}
                    onViewDetails={() => handleOrderDetails(order)}
                    onTrackOrder={() => handleTrackOrder(order._id)}
                    animateCards={animateCards}
                  />
                ))}
              </div>
            ) : (
              /* Table View */
              <OrderTable
                orders={orders}
                selectedOrders={selectedOrders}
                onSelect={handleOrderSelect}
                onSelectAll={handleSelectAll}
                onStatusUpdate={handleStatusUpdate}
                onViewDetails={handleOrderDetails}
                onTrackOrder={handleTrackOrder}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={(field) => {
                  const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
                  setSortBy(field);
                  setSortOrder(newOrder);
                }}
                animateCards={animateCards}
                className="mb-8"
              />
            )}

            {/* Enhanced Pagination */}
            {adminOrders?.pagination && adminOrders.pagination.totalPages > 1 && (
              <div className={`${animateCards ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.8s' }}>
                <Pagination
                  currentPage={currentPage}
                  totalPages={adminOrders.pagination.totalPages}
                  onPageChange={setCurrentPage}
                  showInfo={true}
                  totalItems={adminOrders.pagination.totalItems}
                  itemsPerPage={ordersPerPage}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl shadow-2xl"
                />
              </div>
            )}
          </>
        )}

        {/* Modals */}
        {showOrderDetails && selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={() => {
              setShowOrderDetails(false);
              setSelectedOrder(null);
            }}
            onStatusUpdate={handleStatusUpdate}
            onTrackOrder={() => {
              setShowOrderDetails(false);
              handleTrackOrder(selectedOrder._id);
            }}
          />
        )}

        {showExportModal && (
          <ExportModal
            onClose={() => setShowExportModal(false)}
            onExport={handleExport}
            totalOrders={orderStats.totalOrders}
            filters={{
              status: statusFilter,
              search: debouncedSearchTerm,
              dateRange,
              priceRange
            }}
          />
        )}

        {showTrackingModal && trackingOrderId && (
          <OrderTrackingModal
            orderId={trackingOrderId}
            onClose={() => {
              setShowTrackingModal(false);
              setTrackingOrderId(null);
            }}
          />
        )}

        {/* Custom Styles */}
      </div>
    </>
  );
};

export default OrderManagement;
