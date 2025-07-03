// src/pages/AdminDashboard.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchProducts } from '../redux/slices/productSlice';
import { fetchOrders } from '../redux/slices/orderSlice';
import { fetchUsers } from '../redux/slices/authSlice';

// Dashboard sections
import DashboardOverview from '../components/admin/DashboardOverview';
import ProductManagement from '../components/admin/ProductManagement';
import OrderManagement from '../components/admin/OrderManagement';
import UserManagement from '../components/admin/UserManagement';

const AdminDashboard = ({ section = "overview" }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(section);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'warning', message: 'Low stock alert: 3 products', time: '5m ago' },
    { id: 2, type: 'success', message: 'New order received', time: '12m ago' },
    { id: 3, type: 'info', message: 'Weekly report ready', time: '1h ago' }
  ]);
  
  // Use ref to track initial mount
  const initialLoadComplete = useRef(false);
  
  // Track data loading status with a ref to avoid dependency issues
  const dataStatusRef = useRef({
    products: false,
    orders: false,
    users: false
  });
  
  // State version for UI updates
  const [dataStatus, setDataStatus] = useState({
    products: false,
    orders: false,
    users: false
  });
  
  // Get current loading states from Redux store if available
  const productsStatus = useSelector(state => state.products?.status);
  const ordersStatus = useSelector(state => state.orders?.status);
  const usersStatus = useSelector(state => state.auth?.status);
  const { user } = useSelector(state => state.auth);
  
  // Memoized function to fetch data only when needed
  const fetchData = useCallback(async () => {
    try {
      // Only fetch products if not already loaded
      if (!dataStatusRef.current.products && productsStatus !== 'succeeded') {
        console.log('Fetching products...');
        await dispatch(fetchProducts()).unwrap();
        console.log('Products fetched successfully');
        dataStatusRef.current.products = true;
        setDataStatus(prev => ({ ...prev, products: true }));
      }
      
      // Only fetch orders if not already loaded
      if (!dataStatusRef.current.orders && ordersStatus !== 'succeeded') {
        console.log('Fetching orders...');
        await dispatch(fetchOrders()).unwrap();
        console.log('Orders fetched successfully');
        dataStatusRef.current.orders = true;
        setDataStatus(prev => ({ ...prev, orders: true }));
      }
      
      // Only fetch users if we're on the users section or overview AND not already loaded
      if (!dataStatusRef.current.users && usersStatus !== 'succeeded' && 
          (activeSection === 'users' || activeSection === 'overview')) {
        console.log('Fetching users...');
        await dispatch(fetchUsers()).unwrap();
        console.log('Users fetched successfully');
        dataStatusRef.current.users = true;
        setDataStatus(prev => ({ ...prev, users: true }));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, activeSection, productsStatus, ordersStatus, usersStatus]);
  
  // Initial data loading - only run once
  useEffect(() => {
    if (!initialLoadComplete.current) {
      initialLoadComplete.current = true;
      setIsLoading(true);
      fetchData();
    }
  }, [fetchData]);
  
  // Handle section change from props
  useEffect(() => {
    if (section !== activeSection) {
      setActiveSection(section);
      
      // If changing to users section and users not loaded, set loading state
      if (section === 'users' && !dataStatusRef.current.users && usersStatus !== 'succeeded') {
        setIsLoading(true);
        fetchData();
      }
    }
  }, [section, activeSection, fetchData, usersStatus]);
  
  // Handle section change from navigation
  const handleSectionChange = useCallback((newSection) => {
    if (newSection === activeSection) return;
    
    setActiveSection(newSection);
    
    // If changing to users section and users not loaded, fetch users
    if (newSection === 'users' && !dataStatusRef.current.users && usersStatus !== 'succeeded') {
      setIsLoading(true);
      dispatch(fetchUsers())
        .then(() => {
          dataStatusRef.current.users = true;
          setDataStatus(prev => ({ ...prev, users: true }));
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Error fetching users:', err);
          setIsLoading(false);
        });
    }
    
    navigate(`/admin/${newSection === 'overview' ? '' : newSection}`);
  }, [dispatch, navigate, activeSection, usersStatus]);

  // Navigation items with enhanced styling
  const navigationItems = [
    {
      id: 'overview',
      label: 'Dashboard Overview',
      icon: 'fa-home',
      color: 'from-blue-500 to-blue-600',
      description: 'Main analytics dashboard'
    },
    {
      id: 'products',
      label: 'Products',
      icon: 'fa-box',
      color: 'from-green-500 to-green-600',
      description: 'Manage inventory & catalog'
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: 'fa-shopping-cart',
      color: 'from-yellow-500 to-orange-500',
      description: 'Order management & fulfillment'
    },
    {
      id: 'users',
      label: 'Users',
      icon: 'fa-users',
      color: 'from-purple-500 to-purple-600',
      description: 'Customer & user management'
    }
  ];
  
  // Render the appropriate section
  const renderSection = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-12 text-center shadow-2xl">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              <i className="fas fa-database mr-2 text-blue-500"></i>
              Loading Dashboard Data
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we fetch your analytics...
            </p>
          </div>
        </div>
      );
    }
    
    switch(activeSection) {
      case 'products':
        return <ProductManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'users':
        return <UserManagement />;
      default:
        return <DashboardOverview />;
    }
  };
  
  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      
      {/* Enhanced Admin Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-20' : 'w-80'} transition-all duration-300 bg-white/10 backdrop-blur-xl border-r border-white/20 dark:border-gray-700/20 shadow-2xl relative`}>
        
        {/* Sidebar Header */}
        <div className="p-6 border-b border-white/20 dark:border-gray-700/20">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    A
                  </div>
                  <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Admin Panel
                    </h2>
                    <p className="text-xs text-gray-600 dark:text-gray-400">ShoeMarkNet</p>
                  </div>
                </div>
                {/* Admin Info */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl p-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{user?.name || 'Administrator'}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        <i className="fas fa-crown mr-1 text-yellow-500"></i>
                        Super Admin
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-10 h-10 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/20 transition-all duration-200"
            >
              <i className={`fas ${sidebarCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-4">
          <ul className="space-y-3">
            {navigationItems.map((item, index) => (
              <li key={item.id}>
                <button 
                  onClick={() => handleSectionChange(item.id)}
                  className={`group w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-start'} p-4 rounded-2xl transition-all duration-300 ${
                    activeSection === item.id 
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg transform scale-105` 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-white/20 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  title={sidebarCollapsed ? item.label : ''}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    activeSection === item.id 
                      ? 'bg-white/20' 
                      : 'bg-white/10 group-hover:bg-white/20'
                  } transition-all duration-200`}>
                    <i className={`fas ${item.icon} text-xl`}></i>
                  </div>
                  
                  {!sidebarCollapsed && (
                    <div className="ml-4 flex-1">
                      <span className="block font-semibold text-lg">{item.label}</span>
                      <span className="block text-xs opacity-75">{item.description}</span>
                    </div>
                  )}
                  
                  {!sidebarCollapsed && activeSection === item.id && (
                    <div className="ml-auto">
                      <i className="fas fa-chevron-right"></i>
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Notifications Panel */}
        {!sidebarCollapsed && (
          <div className="absolute bottom-6 left-4 right-4">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                  <i className="fas fa-bell mr-2 text-yellow-500"></i>
                  Recent Alerts
                </h3>
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {notifications.length}
                </span>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {notifications.slice(0, 3).map(notification => (
                  <div key={notification.id} className="flex items-start space-x-2 text-xs">
                    <div className={`w-2 h-2 rounded-full mt-1 ${
                      notification.type === 'warning' ? 'bg-yellow-500' :
                      notification.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white">{notification.message}</p>
                      <p className="text-gray-500 dark:text-gray-400">{notification.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Enhanced Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-white/10 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/20 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {navigationItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                <i className="fas fa-calendar mr-1"></i>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 pl-10 pr-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <i className="fas fa-search text-gray-400"></i>
                </div>
              </div>
              
              {/* Notifications */}
              <button className="relative w-12 h-12 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/20 transition-all duration-200">
                <i className="fas fa-bell"></i>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              </button>
              
              {/* Settings */}
              <button className="w-12 h-12 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/20 transition-all duration-200">
                <i className="fas fa-cog"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-6">
          {renderSection()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
