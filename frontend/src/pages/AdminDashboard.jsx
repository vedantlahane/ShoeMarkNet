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
  
  // Render the appropriate section
  const renderSection = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-3">Loading dashboard data...</p>
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
    <div className="flex h-screen bg-gray-100">
      {/* Admin Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold text-blue-600">Admin Dashboard</h2>
        </div>
        <nav className="mt-4">
          <ul>
            <li>
              <button 
                onClick={() => handleSectionChange('overview')}
                className={`flex items-center w-full px-4 py-2 text-left ${activeSection === 'overview' ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                Dashboard Overview
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleSectionChange('products')}
                className={`flex items-center w-full px-4 py-2 text-left ${activeSection === 'products' ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                </svg>
                Products
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleSectionChange('orders')}
                className={`flex items-center w-full px-4 py-2 text-left ${activeSection === 'orders' ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
                Orders
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleSectionChange('users')}
                className={`flex items-center w-full px-4 py-2 text-left ${activeSection === 'users' ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />
                </svg>
                Users
              </button>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {renderSection()}
      </div>
    </div>
  );
};

export default AdminDashboard;
