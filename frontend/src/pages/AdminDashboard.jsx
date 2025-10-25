import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageMeta from '../components/seo/PageMeta';
import { toast } from 'react-toastify';
import { useTheme } from '../context/ThemeContext';

// Redux actions
import { fetchProducts } from '../redux/slices/productSlice';
import { fetchAllOrders } from '../redux/slices/orderSlice';
import { fetchUsers } from '../redux/slices/authSlice';
import adminService from '../services/adminService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DashboardOverview from '../components/admin/DashboardOverview';
import ProductManagement from '../components/admin/ProductManagement';
import OrderManagement from '../components/admin/OrderManagement';
import UserManagement from '../components/admin/UserManagement';
import AnalyticsPanel from '../components/admin/AnalyticsPanel';
import SettingsPanel from '../components/admin/SettingsPanel';
import NotificationCenter from '../components/admin/NotificationCenter';
import QuickActions from '../components/admin/QuickActions';
import RealtimeStats from '../components/admin/RealtimeStats';
import AdminSearchModal from '../components/admin/AdminSearchModal';

// Hooks
import useWebSocket from '../hooks/useWebSocket';
import useLocalStorage from '../hooks/useLocalStorage';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';
import usePermissions from '../hooks/usePermissions';

// Utils
import { trackEvent } from '../utils/analytics';
import { formatCurrency, formatNumber } from '../utils/helpers';

// Constants
const ADMIN_SECTIONS = {
  overview: {
    id: 'overview',
    label: 'Dashboard Overview',
    icon: 'fa-chart-pie',
    color: 'from-blue-500 to-cyan-500',
    description: 'Analytics & insights',
    requiredPermission: 'dashboard.view'
  },
  products: {
    id: 'products',
    label: 'Product Management',
    icon: 'fa-boxes',
    color: 'from-green-500 to-emerald-500',
    description: 'Inventory & catalog',
    requiredPermission: 'products.manage'
  },
  orders: {
    id: 'orders',
    label: 'Order Management',
    icon: 'fa-shopping-cart',
    color: 'from-yellow-500 to-orange-500',
    description: 'Orders & fulfillment',
    requiredPermission: 'orders.manage'
  },
  users: {
    id: 'users',
    label: 'User Management',
    icon: 'fa-users',
    color: 'from-purple-500 to-pink-500',
    description: 'Customers & accounts',
    requiredPermission: 'users.manage'
  },
  analytics: {
    id: 'analytics',
    label: 'Advanced Analytics',
    icon: 'fa-chart-line',
    color: 'from-indigo-500 to-purple-500',
    description: 'Deep insights & reports',
    requiredPermission: 'analytics.view'
  },
  settings: {
    id: 'settings',
    label: 'System Settings',
    icon: 'fa-cogs',
    color: 'from-gray-500 to-slate-600',
    description: 'Configuration & preferences',
    requiredPermission: 'system.manage'
  }
};

const NOTIFICATION_TYPES = {
  LOW_STOCK: 'low_stock',
  NEW_ORDER: 'new_order',
  USER_SIGNUP: 'user_signup',
  SYSTEM_ALERT: 'system_alert',
  PERFORMANCE: 'performance'
};

const normalizeDashboardNotification = (notification) => {
  if (!notification) return null;

  const timeValue = notification.time || notification.timestamp || new Date();
  const dateInstance = timeValue instanceof Date ? timeValue : new Date(timeValue);

  const read = notification.read ?? !notification.unread;
  const unread = notification.unread ?? !read;

  return {
    priority: 'medium',
    category: 'general',
    actions: [],
    ...notification,
    time: dateInstance,
    timestamp: dateInstance.toISOString(),
    read,
    unread
  };
};

const AdminDashboard = ({ section = "overview" }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Hooks
  const { hasPermission, userRole } = usePermissions();
  const { isConnected, connectionStatus } = useWebSocket('/admin');
  const { isDarkMode, toggleTheme } = useTheme();
  
  // Redux state
  const { user, isAuthenticated, users } = useSelector((state) => state.auth);
  const { products } = useSelector((state) => state.product);
  const { adminOrders } = useSelector((state) => state.order);
  
  // Local state
  const [activeSection, setActiveSection] = useLocalStorage('adminActiveSection', section);
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage('adminSidebarCollapsed', false);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [realtimeData, setRealtimeData] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [pendingAction, setPendingAction] = useState(null);
  const [dataLoadingStatus, setDataLoadingStatus] = useState({
    overview: false,
    dashboard: false,
    products: false,
    orders: false,
    users: false,
    analytics: false,
    settings: false
  });

  const unreadNotifications = useMemo(
    () => notifications.filter(notification => !notification.read),
    [notifications]
  );

  // Refs
  const initialLoadComplete = useRef(false);
  const websocketRef = useRef(null);
  const notificationTimeouts = useRef(new Map());

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'ctrl+k': () => setShowSearchModal(true),
    'ctrl+1': () => handleSectionChange('overview'),
    'ctrl+2': () => handleSectionChange('products'),
    'ctrl+3': () => handleSectionChange('orders'),
    'ctrl+4': () => handleSectionChange('users'),
    'ctrl+n': () => setShowNotificationCenter(true),
    'ctrl+shift+s': () => handleSectionChange('settings')
  });

  // Filtered sections based on permissions
  const availableSections = useMemo(() => {
    return Object.values(ADMIN_SECTIONS).filter(section => 
      hasPermission(section.requiredPermission)
    );
  }, [hasPermission]);

  // Initialize dashboard
  useEffect(() => {
    if (!isAuthenticated || userRole !== 'admin') {
      navigate('/login');
      return;
    }

    if (!initialLoadComplete.current) {
      initialLoadComplete.current = true;
      initializeDashboard();
    }
  }, [isAuthenticated, userRole, navigate]);

  // Handle section changes from URL
  useEffect(() => {
    const urlSection = searchParams.get('section') || section;
    if (urlSection !== activeSection && availableSections.find(s => s.id === urlSection)) {
      setActiveSection(urlSection);
    }
  }, [section, searchParams, activeSection, availableSections, setActiveSection]);

  // Track analytics
  useEffect(() => {
    if (activeSection) {
      trackEvent('admin_section_viewed', {
        section: activeSection,
        user_role: userRole,
        session_id: user?._id
      });
    }
  }, [activeSection, userRole, user]);

  // Initialize dashboard data
  const initializeDashboard = useCallback(async () => {
    setIsInitializing(true);
    
    try {
      // Load dashboard statistics
  const statsData = await adminService.getDashboardStats();
  setDashboardStats(statsData);
  setDataLoadingStatus(prev => ({ ...prev, overview: true, dashboard: true }));

      // Load initial notifications
      const initialNotifications = await loadNotifications();
      setNotifications(
        (initialNotifications || []).map(normalizeDashboardNotification)
      );

      // Initialize WebSocket connection for real-time updates
      initializeWebSocket();

      toast.success('🚀 Admin dashboard initialized successfully!');
      
    } catch (error) {
      console.error('Dashboard initialization error:', error);
      toast.error('⚠️ Failed to initialize dashboard. Some features may be limited.');
    } finally {
      setIsInitializing(false);
    }
  }, []);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    try {
      // This would typically come from your notification service
      const mockNotifications = [
        {
          id: 'notification-low-stock',
          type: NOTIFICATION_TYPES.LOW_STOCK,
          title: 'Low Stock Alert',
          message: '3 products are running low on inventory',
          time: new Date(Date.now() - 5 * 60 * 1000),
          priority: 'high',
          unread: true,
          read: false,
          category: 'inventory',
          actions: [
            { id: 'view-low-stock', label: 'Review Products', type: 'primary' }
          ],
          data: { productCount: 3 }
        },
        {
          id: 'notification-new-order',
          type: NOTIFICATION_TYPES.NEW_ORDER,
          title: 'New Order Received',
          message: 'Order #ORD-2024-001 needs processing',
          time: new Date(Date.now() - 12 * 60 * 1000),
          priority: 'medium',
          unread: true,
          read: false,
          category: 'orders',
          actions: [
            { id: 'open-order', label: 'Open Order', type: 'primary' }
          ],
          data: { orderId: 'ORD-2024-001', amount: 149.99 }
        },
        {
          id: 'notification-user-signup',
          type: NOTIFICATION_TYPES.USER_SIGNUP,
          title: 'New User Registration',
          message: '5 new users registered in the last hour',
          time: new Date(Date.now() - 30 * 60 * 1000),
          priority: 'low',
          unread: false,
          read: true,
          category: 'users',
          data: { userCount: 5 }
        }
      ];
      
      return mockNotifications;
    } catch (error) {
      console.error('Error loading notifications:', error);
      return [];
    }
  }, []);

  // Initialize WebSocket for real-time updates
  const initializeWebSocket = useCallback(() => {
    if (websocketRef.current) return;

    try {
      // WebSocket implementation would go here
      // For now, simulate real-time updates
      const interval = setInterval(() => {
        // Simulate real-time data updates
        setRealtimeData(prev => ({
          ...prev,
          timestamp: new Date(),
          activeUsers: Math.floor(Math.random() * 100) + 50,
          ordersToday: Math.floor(Math.random() * 50) + 20,
          revenue: Math.floor(Math.random() * 10000) + 5000
        }));
      }, 30000); // Update every 30 seconds

      websocketRef.current = { interval };
    } catch (error) {
      console.error('WebSocket initialization error:', error);
    }
  }, []);

  // Handle section change
  const handleSectionChange = useCallback(async (newSection) => {
    if (newSection === activeSection) return;

    // Check permissions
    const sectionConfig = ADMIN_SECTIONS[newSection];
    if (!hasPermission(sectionConfig?.requiredPermission)) {
      toast.error('🚫 You don\'t have permission to access this section');
      return;
    }

    setActiveSection(newSection);
    
    // Update URL
    const params = new URLSearchParams(searchParams);
    if (newSection === 'overview') {
      params.delete('section');
    } else {
      params.set('section', newSection);
    }
    setSearchParams(params, { replace: true });

    // Load section-specific data
    await loadSectionData(newSection);

    trackEvent('admin_section_changed', {
      from_section: activeSection,
      to_section: newSection,
      user_role: userRole
    });
  }, [activeSection, hasPermission, searchParams, setSearchParams, setActiveSection, userRole]);

  // Load section-specific data
  const loadSectionData = useCallback(async (sectionId) => {
    try {
      switch (sectionId) {
        case 'products':
          if (!dataLoadingStatus.products) {
            await dispatch(fetchProducts()).unwrap();
            setDataLoadingStatus(prev => ({ ...prev, products: true }));
          }
          break;
        
        case 'orders':
          if (!dataLoadingStatus.orders) {
            await dispatch(fetchAllOrders()).unwrap();
            setDataLoadingStatus(prev => ({ ...prev, orders: true }));
          }
          break;
        
        case 'users':
          if (!dataLoadingStatus.users) {
            await dispatch(fetchUsers()).unwrap();
            setDataLoadingStatus(prev => ({ ...prev, users: true }));
          }
          break;
        
        default:
          setDataLoadingStatus(prev => ({ ...prev, [sectionId]: true }));
          break;
      }
    } catch (error) {
      console.error(`Error loading ${sectionId} data:`, error);
      toast.error(`Failed to load ${sectionId} data`);
    }
  }, [dispatch, dataLoadingStatus]);

  const handleSectionActionComplete = useCallback((action) => {
    setPendingAction((current) => {
      if (!current) {
        return null;
      }

      if (!action || action.at !== current.at) {
        return current;
      }

      return null;
    });
  }, []);

  // Ensure active section data is loaded on mount and when section changes
  useEffect(() => {
    if (!activeSection) return;

    if (!dataLoadingStatus[activeSection]) {
      loadSectionData(activeSection);
    }
  }, [activeSection, dataLoadingStatus, loadSectionData]);

  // Handle notification click
  const handleNotificationClick = useCallback((notification) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(n => n.id === notification.id 
        ? normalizeDashboardNotification({ ...n, unread: false, read: true })
        : n
      )
    );

    // Navigate to relevant section based on notification type
    switch (notification.type) {
      case NOTIFICATION_TYPES.LOW_STOCK:
        handleSectionChange('products');
        break;
      case NOTIFICATION_TYPES.NEW_ORDER:
        handleSectionChange('orders');
        break;
      case NOTIFICATION_TYPES.USER_SIGNUP:
        handleSectionChange('users');
        break;
      default:
        break;
    }

    trackEvent('admin_notification_clicked', {
      notification_type: notification.type,
      notification_id: notification.id
    });
  }, [handleSectionChange]);

  const handleNotificationAction = useCallback((notification, actionId) => {
    if (!notification || !actionId) return;

    switch (actionId) {
      case 'view-low-stock':
        toast.info('Opening low stock products...');
        handleSectionChange('products');
        break;
      case 'open-order':
        toast.info(`Opening order ${notification?.data?.orderId || ''}`.trim());
        handleSectionChange('orders');
        break;
      default:
        toast.info('Action triggered from notification');
        break;
    }

    trackEvent('admin_notification_action_taken', {
      notification_id: notification.id,
      action_id: actionId,
      notification_type: notification.type
    });
  }, [handleSectionChange]);

  const performAdminSearch = useCallback(async (rawQuery) => {
    const trimmedQuery = rawQuery.trim();
    if (!trimmedQuery) {
      return [];
    }

    const normalizedQuery = trimmedQuery.toLowerCase();

    const ensureProductsData = async () => {
      if (Array.isArray(products) && products.length > 0) {
        return products;
      }

      if (dataLoadingStatus.products) {
        return products || [];
      }

      try {
        const payload = await dispatch(fetchProducts()).unwrap();
        setDataLoadingStatus(prev => ({ ...prev, products: true }));
        return payload?.products || products || [];
      } catch (error) {
        console.error('Admin search: failed to fetch products', error);
        return products || [];
      }
    };

    const ensureOrdersData = async () => {
      const existingOrders = adminOrders?.items;
      if (Array.isArray(existingOrders) && existingOrders.length > 0) {
        return existingOrders;
      }

      if (dataLoadingStatus.orders) {
        return existingOrders || [];
      }

      try {
        const payload = await dispatch(fetchAllOrders()).unwrap();
        setDataLoadingStatus(prev => ({ ...prev, orders: true }));
        return payload?.orders || existingOrders || [];
      } catch (error) {
        console.error('Admin search: failed to fetch orders', error);
        return existingOrders || [];
      }
    };

    const ensureUsersData = async () => {
      if (Array.isArray(users) && users.length > 0) {
        return users;
      }

      if (dataLoadingStatus.users) {
        return users || [];
      }

      try {
        const payload = await dispatch(fetchUsers()).unwrap();
        setDataLoadingStatus(prev => ({ ...prev, users: true }));
        return Array.isArray(payload) ? payload : users || [];
      } catch (error) {
        console.error('Admin search: failed to fetch users', error);
        return users || [];
      }
    };

    const [productList, orderList, userList] = await Promise.all([
      ensureProductsData(),
      ensureOrdersData(),
      ensureUsersData()
    ]);

    const containsQuery = (value) =>
      typeof value === 'string' && value.toLowerCase().includes(normalizedQuery);

    const computeScore = (...values) => {
      return values.reduce((best, value) => {
        if (value === null || value === undefined) {
          return best;
        }

        const text = value.toString().toLowerCase();
        const index = text.indexOf(normalizedQuery);

        if (index === -1) {
          return best;
        }

        return Math.min(best, index);
      }, Number.POSITIVE_INFINITY);
    };

    const toNumber = (value) => {
      if (typeof value === 'number') return value;
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    };

    const productResults = (productList || [])
      .map((product) => {
        const searchableFields = [
          product?.name,
          product?.brand,
          product?.sku,
          Array.isArray(product?.tags) ? product.tags.join(' ') : null
        ];

        if (!searchableFields.some(containsQuery)) {
          return null;
        }

        const score = computeScore(...searchableFields);
        if (!Number.isFinite(score)) {
          return null;
        }

        const priceValue = toNumber(product?.price);
        const stockValue = toNumber(product?.countInStock);

        const subtitleParts = [
          product?.brand,
          product?.sku ? `SKU ${product.sku}` : null,
          Number.isFinite(priceValue) ? formatCurrency(priceValue) : null
        ].filter(Boolean);

        return {
          id: product?._id,
          type: 'product',
          icon: 'fa-box',
          title: product?.name || 'Unnamed Product',
          subtitle: subtitleParts.join(' • '),
          badge: Number.isFinite(stockValue)
            ? `${formatNumber(stockValue)} in stock`
            : null,
          section: 'products',
          sectionLabel: ADMIN_SECTIONS.products.label,
          payload: {
            term: product?.name || product?.sku || trimmedQuery,
            productId: product?._id
          },
          score
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.score - b.score)
      .slice(0, 6);

    const orderResults = (orderList || [])
      .map((order) => {
        const identifier = order?.orderNumber || order?.orderId || order?._id;
        const customerName = order?.customerName || order?.user?.name || order?.shippingAddress?.fullName;
        const searchableFields = [
          identifier,
          customerName,
          order?.email,
          order?.shippingAddress?.email,
          order?.status
        ];

        if (!searchableFields.some(containsQuery)) {
          return null;
        }

        const score = computeScore(...searchableFields);
        if (!Number.isFinite(score)) {
          return null;
        }

        const totalValue = toNumber(order?.totalPrice);

        const subtitleParts = [
          identifier ? `Order ${identifier}` : null,
          customerName,
          Number.isFinite(totalValue) ? formatCurrency(totalValue) : null
        ].filter(Boolean);

        return {
          id: order?._id,
          type: 'order',
          icon: 'fa-receipt',
          title: customerName || identifier || 'Order',
          subtitle: subtitleParts.join(' • '),
          badge: order?.status ? order.status.toUpperCase() : null,
          section: 'orders',
          sectionLabel: ADMIN_SECTIONS.orders.label,
          payload: {
            term: identifier || customerName || trimmedQuery,
            orderId: order?._id
          },
          score
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.score - b.score)
      .slice(0, 6);

    const userResults = (userList || [])
      .map((candidate) => {
        const searchableFields = [
          candidate?.name,
          candidate?.email,
          candidate?.phoneNumber,
          candidate?.role
        ];

        if (!searchableFields.some(containsQuery)) {
          return null;
        }

        const score = computeScore(...searchableFields);
        if (!Number.isFinite(score)) {
          return null;
        }

        const subtitleParts = [
          candidate?.email,
          candidate?.role ? candidate.role.toUpperCase() : null,
          candidate?.phoneNumber
        ].filter(Boolean);

        return {
          id: candidate?._id,
          type: 'user',
          icon: 'fa-user',
          title: candidate?.name || candidate?.email || 'User',
          subtitle: subtitleParts.join(' • '),
          badge: candidate?.status ? candidate.status.toUpperCase() : null,
          section: 'users',
          sectionLabel: ADMIN_SECTIONS.users.label,
          payload: {
            term: candidate?.name || candidate?.email || trimmedQuery,
            userId: candidate?._id
          },
          score
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.score - b.score)
      .slice(0, 6);

    const combinedResults = [...productResults, ...orderResults, ...userResults];

    if (combinedResults.length === 0) {
      return [
        {
          id: `no-results-${normalizedQuery}`,
          type: 'info',
          icon: 'fa-info-circle',
          title: 'No matching results',
          subtitle: 'Try adjusting your search terms or filters',
          section: 'overview',
          sectionLabel: ADMIN_SECTIONS.overview.label,
          payload: { term: trimmedQuery },
          score: Number.POSITIVE_INFINITY
        }
      ];
    }

    return combinedResults
      .sort((a, b) => a.score - b.score)
      .slice(0, 20);
  }, [
    products,
    adminOrders?.items,
    users,
    dataLoadingStatus.products,
    dataLoadingStatus.orders,
    dataLoadingStatus.users,
    dispatch,
    setDataLoadingStatus
  ]);

  const handleSearch = useCallback(async (query) => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setSearchQuery('');
      return [];
    }

    setSearchQuery(trimmedQuery);
    
    try {
      const searchResults = await performAdminSearch(trimmedQuery);

      trackEvent('admin_search_performed', {
        query: trimmedQuery,
        results_count: searchResults.length
      });

      return searchResults;
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
      return [];
    }
  }, [performAdminSearch]);

  const handleSearchResultSelect = useCallback(async (result) => {
    if (!result) {
      return;
    }

    setShowSearchModal(false);

    const resolvedTerm = result?.payload?.term || result?.title || searchQuery;
    if (resolvedTerm) {
      setSearchQuery(resolvedTerm);
    }

    try {
      const targetSection = result.section
        || (result.type === 'order' ? 'orders'
          : result.type === 'user' ? 'users'
          : 'products');

      if (targetSection && targetSection !== activeSection) {
        await handleSectionChange(targetSection);
      }

      const actionTypeMap = {
        product: 'searchProducts',
        order: 'searchOrders',
        user: 'searchUsers'
      };

      const actionType = actionTypeMap[result.type];

      if (actionType && targetSection) {
        setPendingAction({
          section: targetSection,
          type: actionType,
          at: Date.now(),
          payload: {
            term: resolvedTerm,
            ...(result.payload || {}),
            resultId: result.id
          }
        });
      }

      trackEvent('admin_search_result_selected', {
        query: resolvedTerm,
        result_type: result?.type,
        result_id: result?.id
      });

      if (result.navigateTo) {
        navigate(result.navigateTo);
      }
    } catch (error) {
      console.error('Failed to process search result selection', error);
      toast.error('Unable to open the selected result.');
    }
  }, [activeSection, handleSectionChange, navigate, searchQuery, setPendingAction]);

  const handleQuickAction = useCallback(async (actionId) => {
    if (!actionId) {
      return;
    }

    trackEvent('admin_quick_action', { action: actionId });

    const triggerProductAction = async (type) => {
      if (activeSection !== 'products') {
        await handleSectionChange('products');
      } else if (!dataLoadingStatus.products) {
        await loadSectionData('products');
      }

      setPendingAction({
        section: 'products',
        type,
        at: Date.now()
      });
    };

    try {
      switch (actionId) {
        case 'add_product':
          await triggerProductAction('openCreateProduct');
          break;
        case 'bulk_import':
          await triggerProductAction('openImportProducts');
          break;
        case 'export_data':
          await triggerProductAction('openExportProducts');
          break;
        default:
          toast.info('This quick action is coming soon!');
          break;
      }
    } catch (error) {
      console.error('Quick action handling error:', error);
      toast.error('Failed to process quick action');
    }
  }, [
    activeSection,
    dataLoadingStatus.products,
    handleSectionChange,
    loadSectionData,
    setPendingAction
  ]);

  // Render section content
  const renderSectionContent = useCallback(() => {
    if (isInitializing) {
      return (
        <div className="flex justify-center items-center h-full min-h-96">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-12 text-center shadow-2xl">
            <LoadingSpinner size="large" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 mt-6">
              <i className="fas fa-database mr-2 text-blue-500"></i>
              Initializing Dashboard
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Loading your admin analytics and data...
            </p>
          </div>
        </div>
      );
    }

    const sectionAction = pendingAction?.section === activeSection ? pendingAction : null;

    const sectionProps = {
      stats: dashboardStats,
      realtimeData,
      onDataUpdate: setDashboardStats,
      isLoading: !dataLoadingStatus[activeSection]
    };

    switch (activeSection) {
      case 'products':
        return (
          <ProductManagement
            {...sectionProps}
            externalAction={sectionAction}
            onActionHandled={handleSectionActionComplete}
          />
        );
      case 'orders':
        return (
          <OrderManagement
            {...sectionProps}
            externalAction={sectionAction}
            onActionHandled={handleSectionActionComplete}
          />
        );
      case 'users':
        return (
          <UserManagement
            {...sectionProps}
            externalAction={sectionAction}
            onActionHandled={handleSectionActionComplete}
          />
        );
      case 'analytics':
        return <AnalyticsPanel {...sectionProps} />;
      case 'settings':
        return <SettingsPanel {...sectionProps} />;
      default:
        return <DashboardOverview {...sectionProps} onQuickAction={handleQuickAction} />;
    }
  }, [
    isInitializing,
    activeSection,
    dashboardStats,
    realtimeData,
    dataLoadingStatus,
    pendingAction,
    handleQuickAction,
    handleSectionActionComplete
  ]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (websocketRef.current?.interval) {
        clearInterval(websocketRef.current.interval);
      }
      notificationTimeouts.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  // SEO meta data for admin
  const currentSection = ADMIN_SECTIONS[activeSection];
  const metaTitle = `${currentSection?.label || 'Dashboard'} | Admin Panel - ShoeMarkNet`;

  return (
    <>
      {/* SEO Meta Tags */}
      <PageMeta
        title={metaTitle}
        description={`ShoeMarkNet admin panel - ${currentSection?.description || 'Manage your e-commerce platform'}`}
        robots="noindex, nofollow"
      />

      <div className="admin-dashboard flex min-h-screen">
        <aside
          className={`${sidebarCollapsed ? 'w-20' : 'w-72'} admin-sidebar flex flex-col transition-all duration-300`}
        >
          <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200/60 dark:border-slate-800/60">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
                  <i className="fas fa-crown text-sm"></i>
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Admin Panel</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">ShoeMarkNet Control</p>
                </div>
              </div>
            )}

            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200/70 bg-white text-slate-500 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-blue-500"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <i className={`fas ${sidebarCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'} text-sm`}></i>
            </button>
          </div>

          {!sidebarCollapsed && (
            <div className="px-4 pb-4 pt-3">
              <div className="admin-card p-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white font-semibold">
                      {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </span>
                    <span className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 ${isConnected ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {user?.name || 'Administrator'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {userRole === 'admin' ? 'Super Admin' : 'Admin'}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                    {connectionStatus || (isConnected ? 'Connected' : 'Offline')}
                  </span>
                  <span>{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          )}

          <nav className="flex-1 overflow-y-auto px-3 pb-6">
            <ul className="space-y-1">
              {availableSections.map((item) => {
                const isActive = activeSection === item.id;

                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleSectionChange(item.id)}
                      className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                        sidebarCollapsed ? 'justify-center' : 'justify-start'
                      } ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        <i className={`fas ${item.icon}`}></i>
                      </span>
                      {!sidebarCollapsed && (
                        <span className="flex-1 text-left">
                          <span className="block">{item.label}</span>
                          <span className="block text-xs font-normal text-slate-500 dark:text-slate-400">
                            {item.description}
                          </span>
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>

            {!sidebarCollapsed && (
              <div className="mt-6 border-t border-slate-200/70 dark:border-slate-800/70 pt-6">
                <QuickActions onActionClick={(action) => handleQuickAction(action.id)} />
              </div>
            )}
          </nav>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="admin-topbar flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
            <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center md:gap-4">
              <button
                onClick={() => setSidebarCollapsed((prev) => !prev)}
                className="hidden h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-500 md:flex"
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <i className={`fas ${sidebarCollapsed ? 'fa-bars-staggered' : 'fa-bars'}`}></i>
              </button>

              <div>
                <div className="flex items-center gap-3">
                  <span className="admin-pill">
                    <i className={`fas ${currentSection?.icon || 'fa-chart-pie'}`}></i>
                    {currentSection?.label || 'Dashboard'}
                  </span>
                </div>
                <p className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 md:text-sm">
                  <i className="fas fa-calendar"></i>
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              <RealtimeStats data={realtimeData} isConnected={isConnected} />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSearchModal(true)}
                className="group hidden h-10 w-52 items-center justify-between rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-500 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-500 sm:flex"
              >
                <span className="flex items-center gap-2">
                  <i className="fas fa-search"></i>
                  Search anything...
                </span>
                <span className="rounded-md border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-400 dark:border-slate-700 dark:text-slate-500">
                  ⌘K
                </span>
              </button>

              <button
                onClick={() => setShowSearchModal(true)}
                className="sm:hidden h-10 w-10 rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-500"
                aria-label="Open search"
              >
                <i className="fas fa-search"></i>
              </button>

              <button
                onClick={() => setShowNotificationCenter(true)}
                className="relative h-10 w-10 rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-500"
                title="Notifications"
              >
                <i className="fas fa-bell"></i>
                {unreadNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-semibold text-white">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>

              <button
                onClick={toggleTheme}
                className="h-10 w-10 rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-500"
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-label="Toggle theme"
              >
                <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
              </button>

              <button
                onClick={() => handleSectionChange('settings')}
                className="h-10 w-10 rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-500"
                title="Settings"
                aria-label="Open settings"
              >
                <i className="fas fa-cog"></i>
              </button>
            </div>
          </header>

          <main className="admin-scroll flex-1">
            <div className="admin-content">
              {renderSectionContent()}
            </div>
          </main>
        </div>

        {showSearchModal && (
          <AdminSearchModal
            onClose={() => setShowSearchModal(false)}
            onSearch={handleSearch}
            searchQuery={searchQuery}
            onResultSelect={handleSearchResultSelect}
          />
        )}

        {showNotificationCenter && (
          <NotificationCenter
            isOpen={showNotificationCenter}
            notifications={notifications}
            onClose={() => setShowNotificationCenter(false)}
            onNotificationsChange={(updated) =>
              setNotifications((updated || []).map(normalizeDashboardNotification))
            }
            onNotificationClick={handleNotificationClick}
            onNotificationAction={handleNotificationAction}
            position="right"
          />
        )}
      </div>
    </>
  );
};

// Helper function for time formatting
const formatTimeAgo = (value) => {
  const targetDate = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(targetDate.getTime())) {
    return '';
  }

  const now = new Date();
  const diffInMinutes = Math.floor((now - targetDate) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
};

export default AdminDashboard;
