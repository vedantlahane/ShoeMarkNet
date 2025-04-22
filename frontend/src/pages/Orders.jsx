import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchOrders } from '../redux/slices/orderSlice';
import Loader from '../components/common/Loader';
import { format } from 'date-fns';

const Orders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Add safety checks to prevent undefined errors
  const orderState = useSelector(state => state.order);
  const { orders = [], loading = false, error = null } = orderState || {};
  
  const authState = useSelector(state => state.auth);
  const { user = null, isAuthenticated = false } = authState || {};

  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login?redirect=/orders');
    } else {
      // Fetch orders if authenticated
      dispatch(fetchOrders());
    }
  }, [dispatch, isAuthenticated, navigate]);

  // Format date for better readability
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'PPP p');
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error.message || 'Failed to load orders'}</span>
        </div>
      </div>
    );
  }

  // Handle empty orders
  if (!orders || orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">You have no orders yet.</h2>
        <p className="text-gray-600 mb-6">Browse our products and place your first order!</p>
        <Link to="/products">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Start Shopping
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Orders</h1>
      <div className="space-y-6">
        {Array.isArray(orders) && orders.map(order => (
          <div key={order._id} className="border rounded-lg p-4 shadow-sm bg-white">
            {/* Rest of your component remains the same */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
