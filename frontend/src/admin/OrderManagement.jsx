import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import PageMeta from '../components/seo/PageMeta';

// Redux actions
import { 
  fetchAllOrders, 
  updateOrderStatus, 
  deleteOrder 
} from '../redux/slices/orderSlice';
import orderService from '../services/orderService';

// Components
import LoadingSpinner from '../components/common/feedback/LoadingSpinner';
import ErrorMessage from '../components/common/feedback/ErrorMessage';
import Pagination from '../components/common/navigation/Pagination';
import OrderCard from '../components/orders/OrderCard';
import OrderTable from '../components/orders/OrderTable';
import OrderDetailsModal from './orders/OrderDetailsModal';
import OrderFilters from '../components/orders/OrderFilters';
import OrderStats from '../components/orders/OrderStats';
import OrderBulkActions from './orders/OrderBulkActions';
import ExportModal from './orders/ExportModal';
import OrderTrackingModal from './orders/OrderTrackingModal';

// Hooks
import useWebSocket from '../hooks/useWebSocket';
import useLocalStorage from '../hooks/useLocalStorage';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';

// Utils
import { trackEvent } from '../utils/analytics';
import { formatCurrency, formatDate, getRelativeTime } from '../utils/helpers';

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
  { id: 'markPaid', label: 'Mark as Paid', icon: 'fa-check-circle', accentColor: '#166534', variant: 'primary' },
  { id: 'markDelivered', label: 'Mark as Delivered', icon: 'fa-truck', accentColor: '#1d4ed8', variant: 'primary' },
  { id: 'markProcessing', label: 'Mark as Processing', icon: 'fa-cog', accentColor: '#b45309', variant: 'primary' },
  { id: 'delete', label: 'Delete Orders', icon: 'fa-trash', accentColor: '#b91c1c', variant: 'primary' }
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
        ...(searchTerm && { search: searchTerm }),
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
  }, [dispatch, currentPage, ordersPerPage, sortBy, sortOrder, statusFilter, searchTerm, dateRange, priceRange]);

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
  }, [statusFilter, searchTerm, sortBy, sortOrder, dateRange, priceRange]);

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
      <div className="admin-surface min-h-[24rem] flex items-center justify-center px-6 py-10">
        <div className="space-y-3 text-center">
          <LoadingSpinner size="large" />
          <h3 className="admin-section-heading text-base">Loading orders</h3>
          <p className="admin-section-subheading">Fetching order data and analytics…</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !adminOrders?.items?.length) {
    return (
      <div className="admin-surface min-h-[24rem] flex items-center justify-center px-6 py-10">
        <ErrorMessage
          message={error.message || 'Failed to load orders'}
          onRetry={fetchOrdersData}
          className="w-full max-w-md"
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

      <div className="px-4 py-6 md:px-6">
        <div className="admin-grid-tight">
          <section
            className={`admin-surface ${animateCards ? 'animate-fade-in-up' : 'opacity-0'}`}
            style={{ animationDelay: '0.05s' }}
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-4">
                <span className="admin-meta-chip">
                  <i className="fa-solid fa-layer-group text-[0.65rem]"></i>
                  Admin / Orders
                </span>
                <div className="space-y-2">
                  <h1 className="admin-section-heading">Order Management</h1>
                  <p className="admin-section-subheading">
                    Monitor and control active orders across channels.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-[var(--admin-text-muted)]">
                  <span className="admin-pill">
                    <i className="fa-solid fa-chart-line text-[0.65rem]"></i>
                    Insights refreshed hourly
                  </span>
                  {isConnected && (
                    <span
                      className="admin-pill"
                      style={{ color: '#047857', backgroundColor: 'rgba(4, 120, 87, 0.08)' }}
                    >
                      <span className="inline-flex h-2 w-2 border border-current" />
                      Live updates
                    </span>
                  )}
                  {refreshing && (
                    <span
                      className="admin-pill"
                      style={{ color: '#1d4ed8', backgroundColor: 'rgba(29, 78, 216, 0.08)' }}
                    >
                      <span className="inline-flex h-2 w-2 border border-current animate-spin" />
                      Syncing…
                    </span>
                  )}
                </div>
                <span className="admin-meta-chip">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="admin-button"
                    title="Refresh orders"
                  >
                    <i className={`fa-solid fa-rotate text-xs ${refreshing ? 'animate-spin' : ''}`}></i>
                    Refresh
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowExportModal(true)}
                    className="admin-button"
                  >
                    <i className="fa-solid fa-file-arrow-down text-xs"></i>
                    Export
                  </button>
                  <button
                    type="button"
                    className="admin-button admin-button--primary"
                  >
                    <i className="fa-solid fa-plus text-xs"></i>
                    Add order
                  </button>
                </div>
                <div className="admin-surface-muted flex items-center gap-3">
                  <i className="fa-solid fa-clipboard-check text-[var(--admin-text-muted)]"></i>
                  <div className="space-y-1">
                    <span className="admin-meta-chip">Orders today</span>
                    <span className="text-base font-semibold">{orderStats.todayOrders ?? 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="admin-surface">
            <OrderStats
              stats={orderStats}
              realtimeData={realtimeData}
              animateCards={animateCards}
            />
          </section>

          <section className="admin-surface">
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
            />
          </section>

          {selectedOrders.length > 0 && (
            <OrderBulkActions
              selectedCount={selectedOrders.length}
              actions={BULK_ACTIONS}
              onBulkAction={handleBulkAction}
              onClearSelection={() => setSelectedOrders([])}
              animateCards={animateCards}
            />
          )}

          <section className="admin-surface">
            {orders.length === 0 ? (
              <div
                className={`${animateCards ? 'animate-fade-in-up' : 'opacity-0'} text-center`}
                style={{ animationDelay: '0.2s' }}
              >
                <div className="space-y-4">
                  <div
                    className="inline-flex px-4 py-3"
                    style={{ border: `1px solid var(--admin-border-color)` }}
                  >
                    <i className="fa-solid fa-cart-shopping text-sm text-[var(--admin-text-muted)]"></i>
                  </div>
                  <h3 className="admin-section-heading text-base">No orders found</h3>
                  <p className="admin-section-subheading">
                    {searchTerm || statusFilter !== ORDER_STATUSES.ALL
                      ? 'No orders match your current filters. Adjust criteria to expand the results.'
                      : 'Orders will appear here once customers begin placing them.'}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {(searchTerm || statusFilter !== ORDER_STATUSES.ALL) && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter(ORDER_STATUSES.ALL);
                          setDateRange({ start: '', end: '' });
                          setPriceRange({ min: '', max: '' });
                        }}
                        className="admin-button"
                      >
                        <i className="fa-solid fa-xmark text-xs"></i>
                        Clear filters
                      </button>
                    )}
                    <button type="button" className="admin-button admin-button--primary">
                      <i className="fa-solid fa-plus text-xs"></i>
                      Create test order
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="admin-grid-tight">
                {(loading || refreshing) && orders.length > 0 && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10">
                    <LoadingSpinner size="medium" message="Updating orders..." />
                  </div>
                )}

                {viewMode === 'cards' ? (
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
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
                  />
                )}

                {adminOrders?.pagination && adminOrders.pagination.totalPages > 1 && (
                  <div className={`${animateCards ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={adminOrders.pagination.totalPages}
                      onPageChange={setCurrentPage}
                      showInfo={true}
                      totalItems={adminOrders.pagination.totalItems}
                      itemsPerPage={ordersPerPage}
                      className="admin-surface-muted"
                    />
                  </div>
                )}
              </div>
            )}
          </section>

        </div>
      </div>

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
            search: searchTerm,
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
    </>
  );
};

export default OrderManagement;
