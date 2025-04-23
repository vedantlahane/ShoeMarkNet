import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchOrders, clearOrderError } from '../redux/slices/orderSlice';
import Loader from '../components/common/Loader';
import { format } from 'date-fns';
import { FaSearch, FaEye, FaFileInvoice, FaTimesCircle } from 'react-icons/fa';

const Orders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Add safety checks to prevent undefined errors
  const orderState = useSelector(state => state.order);
  const { orders = [], loading = false, error = null } = orderState || {};
  
  const authState = useSelector(state => state.auth);
  const { user = null, isAuthenticated = false } = authState || {};

  // State for filtering and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(5);
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login?redirect=/orders');
      return;
    }
    
    // Fetch orders if authenticated
    dispatch(fetchOrders());
    
    // Clear any errors when component unmounts
    return () => {
      dispatch(clearOrderError());
    };
  }, [dispatch, isAuthenticated, navigate]);

  // Format date for better readability
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'PPP p');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Format price with currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };
  
  // Get status badge class based on order status
  const getStatusBadgeClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'paid':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Filter orders based on search term and status
  const filteredOrders = Array.isArray(orders) 
    ? orders.filter(order => {
        const matchesSearch = searchTerm === '' || 
          order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.shippingAddress?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === 'all' || 
          order.status?.toLowerCase() === filterStatus.toLowerCase();
        
        return matchesSearch && matchesStatus;
      })
    : [];
    
  // Get current orders for pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Handle retry on error
  const handleRetry = () => {
    dispatch(clearOrderError());
    dispatch(fetchOrders());
  };

  if (loading && orders.length === 0) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error.message || 'Failed to load orders'}</span>
          <button 
            onClick={handleRetry}
            className="mt-2 bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Orders</h1>
      
      {(!orders || orders.length === 0) ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h2 className="text-2xl font-bold mb-4">You have no orders yet.</h2>
          <p className="text-gray-600 mb-6">Browse our products and place your first order!</p>
          <Link to="/products">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
              Start Shopping
            </button>
          </Link>
        </div>
      ) : (
        <>
          {/* Filters and Search */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="pl-10 pr-4 py-2 border rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search by order ID or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="processing">Processing</option>
              <option value="paid">Paid</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          {/* Orders List */}
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentOrders.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{order._id.substring(order._id.length - 8).toUpperCase()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(order.totalPrice)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.orderItems?.length || 0} {order.orderItems?.length === 1 ? 'item' : 'items'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                        {order.status || 'Processing'}
                      </span>
                      {order.isPaid && (
                        <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Paid
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        to={`/orders/${order._id}`}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="View Order Details"
                      >
                        <FaEye className="inline-block" />
                      </Link>
                      {order.status !== 'cancelled' && order.status !== 'delivered' && (
                        <button
                          className="text-red-600 hover:text-red-900 mr-3"
                          title="Cancel Order"
                          onClick={() => {/* Add cancel order functionality */}}
                        >
                          <FaTimesCircle className="inline-block" />
                        </button>
                      )}
                      <button
                        className="text-gray-600 hover:text-gray-900"
                        title="Download Invoice"
                        onClick={() => {/* Add invoice download functionality */}}
                      >
                        <FaFileInvoice className="inline-block" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {filteredOrders.length > ordersPerPage && (
            <div className="flex justify-center mt-6">
              <nav className="flex items-center">
                <button
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-l-md ${
                    currentPage === 1 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  Previous
                </button>
                
                {[...Array(Math.ceil(filteredOrders.length / ordersPerPage)).keys()].map(number => (
                  <button
                    key={number + 1}
                    onClick={() => paginate(number + 1)}
                    className={`px-3 py-1 ${
                      currentPage === number + 1
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    {number + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => paginate(Math.min(Math.ceil(filteredOrders.length / ordersPerPage), currentPage + 1))}
                  disabled={currentPage === Math.ceil(filteredOrders.length / ordersPerPage)}
                  className={`px-3 py-1 rounded-r-md ${
                    currentPage === Math.ceil(filteredOrders.length / ordersPerPage)
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Orders;
