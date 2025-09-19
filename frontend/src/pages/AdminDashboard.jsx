import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';

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

const AdminDashboard = ({ section = "overview" }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Hooks
  const { hasPermission, userRole } = usePermissions();
  const { isConnected, connectionStatus } = useWebSocket('/admin');
  
  // Redux state
  const { user, isAuthenticated } = useSelector((state) => state.auth);
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
  const [dataLoadingStatus, setDataLoadingStatus] = useState({
    dashboard: false,
    products: false,
    orders: false,
    users: false
  });

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
      setDataLoadingStatus(prev => ({ ...prev, dashboard: true }));

      // Load initial notifications
      const initialNotifications = await loadNotifications();
      setNotifications(initialNotifications);

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
          id: 1,
          type: NOTIFICATION_TYPES.LOW_STOCK,
          title: 'Low Stock Alert',
          message: '3 products are running low on inventory',
          time: new Date(Date.now() - 5 * 60 * 1000),
          priority: 'high',
          unread: true,
          data: { productCount: 3 }
        },
        {
          id: 2,
          type: NOTIFICATION_TYPES.NEW_ORDER,
          title: 'New Order Received',
          message: 'Order #ORD-2024-001 needs processing',
          time: new Date(Date.now() - 12 * 60 * 1000),
          priority: 'medium',
          unread: true,
          data: { orderId: 'ORD-2024-001', amount: 149.99 }
        },
        {
          id: 3,
          type: NOTIFICATION_TYPES.USER_SIGNUP,
          title: 'New User Registration',
          message: '5 new users registered in the last hour',
          time: new Date(Date.now() - 30 * 60 * 1000),
          priority: 'low',
          unread: false,
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
          break;
      }
    } catch (error) {
      console.error(`Error loading ${sectionId} data:`, error);
      toast.error(`Failed to load ${sectionId} data`);
    }
  }, [dispatch, dataLoadingStatus]);

  // Handle notification click
  const handleNotificationClick = useCallback((notification) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, unread: false } : n)
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

  // Search functionality
  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) return;

    setSearchQuery(query);
    
    try {
      // Implement global admin search
      // This would search across products, orders, users, etc.
      const searchResults = await performAdminSearch(query);
      
      // Handle search results
      trackEvent('admin_search_performed', {
        query,
        results_count: searchResults.length
      });
      
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    }
  }, []);

  // Mock search function (replace with actual implementation)
  const performAdminSearch = useCallback(async (query) => {
    // This would integrate with your search service
    return [];
  }, []);

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

    const sectionProps = {
      stats: dashboardStats,
      realtimeData,
      onDataUpdate: setDashboardStats,
      isLoading: !dataLoadingStatus[activeSection]
    };

    switch (activeSection) {
      case 'products':
        return <ProductManagement {...sectionProps} />;
      case 'orders':
        return <OrderManagement {...sectionProps} />;
      case 'users':
        return <UserManagement {...sectionProps} />;
      case 'analytics':
        return <AnalyticsPanel {...sectionProps} />;
      case 'settings':
        return <SettingsPanel {...sectionProps} />;
      default:
        return <DashboardOverview {...sectionProps} />;
    }
  }, [isInitializing, activeSection, dashboardStats, realtimeData, dataLoadingStatus]);

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
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={`ShoeMarkNet admin panel - ${currentSection?.description || 'Manage your e-commerce platform'}`} />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
        
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
              {availableSections.map((item, index) => {
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
                  onActionClick={(action) => {
                    trackEvent('admin_quick_action', { action: action.id });
                  }}
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
                    {notifications.filter(n => n.unread).length > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                        {notifications.filter(n => n.unread).length}
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
                        notification.unread ? 'bg-blue-500' : 'bg-gray-400'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 dark:text-white font-medium truncate">
                          {notification.title}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 truncate">
                          {notification.message}
                        </p>
                        <p className="text-gray-500 dark:text-gray-500 mt-1">
                          {formatTimeAgo(notification.time)}
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
                  {notifications.filter(n => n.unread).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                      {notifications.filter(n => n.unread).length}
                    </span>
                  )}
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
          />
        )}

        {showNotificationCenter && (
          <NotificationCenter
            notifications={notifications}
            onClose={() => setShowNotificationCenter(false)}
            onNotificationClick={handleNotificationClick}
            onMarkAllRead={() => {
              setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
            }}
          />
        )}

        {/* Custom Styles */}
      </div>
    </ErrorBoundary>
  );
};

// Helper function for time formatting
const formatTimeAgo = (date) => {
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
};

export default AdminDashboard;
