import React, { useState, useEffect } from 'react';
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
  
  // Fetch necessary data when dashboard loads - with staggered loading
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // Load data sequentially to reduce server load
        console.log('Fetching products...');
        await dispatch(fetchProducts()).unwrap();
        console.log('Products fetched successfully');
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('Fetching orders...');
        await dispatch(fetchOrders()).unwrap();
        console.log('Orders fetched successfully');
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Only fetch users if we're on the users section or overview
        if (activeSection === 'users' || activeSection === 'overview') {
          console.log('Fetching users...');
          await dispatch(fetchUsers()).unwrap();
          console.log('Users fetched successfully');
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [dispatch, activeSection]);
  
  // Update active section when prop changes
  useEffect(() => {
    setActiveSection(section);
  }, [section]);
  
  const handleSectionChange = (newSection) => {
    setActiveSection(newSection);
    
    // Only fetch section-specific data if it's not already loaded
    if (newSection === 'users') {
      dispatch(fetchUsers())
        .catch(err => console.error('Error fetching users:', err));
    }
    
    navigate(`/admin/${newSection === 'overview' ? '' : newSection}`);
  };
  
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
            {/* Other navigation items remain the same */}
            {/* ... */}
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
