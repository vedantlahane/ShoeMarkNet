// src/pages/Orders.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchOrders } from '../redux/slices/orderSlice';
import Loader from '../components/common/Loader';
import { format } from 'date-fns';

const Orders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders, loading, error } = useSelector(state => state.order);
  const { user, isAuthenticated } = useSelector(state => state.auth);

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
    return format(new Date(dateString), 'PPP p');
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
        {orders.map(order => (
          <div key={order._id} className="border rounded-lg p-4 shadow-sm bg-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold">Order #{order._id.substring(order._id.length - 8)}</h2>
                <p className="text-gray-600">Placed on: {formatDate(order.createdAt)}</p>
              </div>
              <div className="mt-2 md:mt-0 text-right">
                <p className="font-semibold">Total: ${order.totalPrice.toFixed(2)}</p>
                <p className={`font-semibold ${order.isPaid ? 'text-green-600' : 'text-red-600'}`}>
                  {order.isPaid ? 'Paid' : 'Not Paid'}
                </p>
                <p className={`font-semibold ${order.isDelivered ? 'text-green-600' : 'text-orange-500'}`}>
                  {order.isDelivered ? 'Delivered' : 'Processing'}
                </p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-medium mb-3">Order Items:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {order.orderItems.map(item => (
                  <div key={item._id} className="flex items-center space-x-4">
                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
                    <div>
                      <Link to={`/products/${item.product}`} className="font-semibold hover:text-blue-600 hover:underline">
                        {item.name}
                      </Link>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      <p className="text-sm text-gray-600">Price: ${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <Link to={`/orders/${order._id}`} className="text-blue-600 hover:underline flex items-center">
                View Order Details
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              
              {!order.isPaid && (
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-4 rounded text-sm"
                  onClick={() => navigate(`/payment/${order._id}`)}
                >
                  Pay Now
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
