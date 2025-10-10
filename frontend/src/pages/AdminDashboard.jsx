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

// Components
import ErrorBoundary from '../components/common/ErrorBoundary';
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
    <ErrorBoundary>
      {/* SEO Meta Tags */}
      <PageMeta
        title={metaTitle}
        description={`ShoeMarkNet admin panel - ${currentSection?.description || 'Manage your e-commerce platform'}`}
        robots="noindex, nofollow"
      />

      <div className="flex h-screen overflow-hidden">
        
        {/* Enhanced Admin Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-20' : 'w-80'} transition-all duration-300 bg-white/10 backdrop-blur-xl border-r border-white/20 dark:border-gray-700/20 shadow-2xl relative flex flex-col`}>
          
          {/* Sidebar Header */}
          <div className="p-6 border-b border-white/20 dark:border-gray-700/20 flex-shrink-0">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      <i className="fas fa-crown"></i>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Admin Panel
                      </h2>
                      <p className="text-xs text-gray-600 dark:text-gray-400">ShoeMarkNet Control Center</p>
                    </div>
                  </div>
                  
                  {/* Enhanced Admin Info */}
                  <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                          isConnected ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                          {user?.name || 'Administrator'}
                        </p>
                        <div className="flex items-center space-x-2">
                          <i className="fas fa-crown text-yellow-500 text-xs"></i>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {userRole === 'admin' ? 'Super Admin' : 'Admin'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Connection Status */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <span className="text-gray-600 dark:text-gray-400">
                          {isConnected ? 'Connected' : 'Disconnected'}
                        </span>
                      </div>
                      <span className="text-gray-500 dark:text-gray-500">
                        {new Date().toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="w-10 h-10 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/20 transition-all duration-200 ml-auto"
                title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                <i className={`fas ${sidebarCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
              </button>
            </div>
          </div>

          {/* Enhanced Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {availableSections.map((item) => {
                const isActive = activeSection === item.id;
                
                return (
                  <li key={item.id}>
                    <button 
                      onClick={() => handleSectionChange(item.id)}
                      className={`group w-full flex items-center ${sidebarCollapsed ? 'justify-center p-3' : 'justify-start p-4'} rounded-2xl transition-all duration-300 relative overflow-hidden ${
                        isActive
                          ? `bg-gradient-to-r ${item.color} text-white shadow-xl transform scale-105 ring-2 ring-white/20` 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-white/20 hover:text-gray-900 dark:hover:text-white hover:scale-102'
                      }`}
                      title={sidebarCollapsed ? item.label : ''}
                    >
                      {/* Background shimmer effect for active item */}
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 animate-shimmer"></div>
                      )}
                      
                      <div className={`${sidebarCollapsed ? 'w-10 h-10' : 'w-12 h-12'} rounded-xl flex items-center justify-center ${
                        isActive 
                          ? 'bg-white/20 text-white shadow-lg' 
                          : 'bg-white/10 group-hover:bg-white/20 text-current'
                      } transition-all duration-200 relative z-10`}>
                        <i className={`fas ${item.icon} ${sidebarCollapsed ? 'text-lg' : 'text-xl'}`}></i>
                      </div>
                      
                      {!sidebarCollapsed && (
                        <div className="ml-4 flex-1 relative z-10">
                          <span className="block font-semibold text-base leading-tight">{item.label}</span>
                          <span className="block text-xs opacity-75 mt-1">{item.description}</span>
                        </div>
                      )}
                      
                      {!sidebarCollapsed && isActive && (
                        <div className="ml-auto relative z-10">
                          <i className="fas fa-chevron-right opacity-75"></i>
                        </div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Quick Actions */}
            {!sidebarCollapsed && (
              <div className="mt-8 pt-6 border-t border-white/20 dark:border-gray-700/20">
                <QuickActions
                  onActionClick={(action) => handleQuickAction(action.id)}
                />
              </div>
            )}
          </nav>

          {/* Enhanced Notifications Panel */}
          {!sidebarCollapsed && (
            <div className="p-4 border-t border-white/20 dark:border-gray-700/20 flex-shrink-0">
              <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center">
                    <i className="fas fa-bell mr-2 text-yellow-500"></i>
                    Recent Alerts
                  </h3>
                  <div className="flex items-center space-x-2">
                    {unreadNotifications.length > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                        {unreadNotifications.length}
                      </span>
                    )}
                    <button
                      onClick={() => setShowNotificationCenter(true)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                    >
                      View All
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {notifications.slice(0, 3).map(notification => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className="w-full flex items-start space-x-2 text-xs p-2 rounded-lg hover:bg-white/10 transition-colors text-left"
                    >
                      <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
                        !notification.read ? 'bg-blue-500' : 'bg-gray-400'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 dark:text-white font-medium truncate">
                          {notification.title}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 truncate">
                          {notification.message}
                        </p>
                        <p className="text-gray-500 dark:text-gray-500 mt-1">
                          {formatTimeAgo(notification.time || notification.timestamp)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Enhanced Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Enhanced Top Bar */}
          <div className="bg-white/10 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/20 p-6 shadow-lg flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarCollapsed(prev => !prev)}
                  className="hidden md:flex w-12 h-12 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/20 transition-all duration-200"
                  title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                  aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  <i className={`fas ${sidebarCollapsed ? 'fa-bars-staggered' : 'fa-bars'}`}></i>
                </button>

                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                    <i className={`fas ${currentSection?.icon} mr-3 text-blue-500`}></i>
                    {currentSection?.label || 'Dashboard'}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 flex items-center mt-1">
                    <i className="fas fa-calendar mr-2"></i>
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>

                {/* Real-time Stats Bar */}
                <RealtimeStats 
                  data={realtimeData}
                  isConnected={isConnected}
                />
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Enhanced Search */}
                <div className="relative">
                  <button
                    onClick={() => setShowSearchModal(true)}
                    className="w-64 flex items-center justify-start pl-4 pr-12 py-2 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl text-gray-500 dark:text-gray-400 hover:bg-white/20 transition-all duration-200"
                  >
                    <i className="fas fa-search mr-3"></i>
                    <span>Search anything...</span>
                    <span className="absolute right-3 text-xs bg-white/20 px-2 py-1 rounded">⌘K</span>
                  </button>
                </div>
                
                {/* Enhanced Notifications */}
                <button 
                  onClick={() => setShowNotificationCenter(true)}
                  className="relative w-12 h-12 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/20 transition-all duration-200"
                  title="Notifications"
                >
                  <i className="fas fa-bell"></i>
                  {unreadNotifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                      {unreadNotifications.length}
                    </span>
                  )}
                </button>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="w-12 h-12 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/20 transition-all duration-200"
                  title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                  aria-label="Toggle theme"
                >
                  <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                </button>
                
                {/* Connection Status Indicator */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  isConnected 
                    ? 'bg-green-500/20 text-green-600' 
                    : 'bg-red-500/20 text-red-600'
                }`} title={`Connection: ${connectionStatus}`}>
                  <i className={`fas ${isConnected ? 'fa-wifi' : 'fa-wifi-slash'}`}></i>
                </div>
                
                {/* Settings */}
                <button 
                  onClick={() => handleSectionChange('settings')}
                  className="w-12 h-12 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/20 transition-all duration-200"
                  title="Settings"
                >
                  <i className="fas fa-cog"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-auto p-6">
            {renderSectionContent()}
          </div>
        </div>

        {/* Modals */}
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

        {/* Custom Styles */}
      </div>
    </ErrorBoundary>
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
