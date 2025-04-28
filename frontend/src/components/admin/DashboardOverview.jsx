import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const DashboardOverview = () => {
  const { products } = useSelector(state => state.product);
  const { orders } = useSelector(state => state.order);
  const { users } = useSelector(state => state.auth);
  
  // Calculate key metrics only when data is available
  const totalRevenue = orders?.reduce((sum, order) => sum + order.totalPrice, 0) || 0;
  const pendingOrders = orders?.filter(order => !order.isDelivered).length || 0;
  const lowStockProducts = products?.filter(product => product.countInStock <= 5).length || 0;

  // Only log once when all data is available
  useEffect(() => {
    if (products && orders && users) {
      console.log('Dashboard data loaded');
    }
  }, [products, orders, users]);
    
  if (!products || !orders || !users) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <p className="ml-3">Loading dashboard data...</p>
    </div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
          <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
          <h3 className="text-gray-500 text-sm font-medium">Total Products</h3>
          <p className="text-2xl font-bold">{products.length}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-500">
          <h3 className="text-gray-500 text-sm font-medium">Pending Orders</h3>
          <p className="text-2xl font-bold">{pendingOrders}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
          <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
          <p className="text-2xl font-bold">{users.length}</p>
        </div>
      </div>
      
      {/* Action Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.slice(0, 5).map(order => (
                <div key={order._id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">Order #{order._id.substring(order._id.length - 8)}</p>
                    <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className={`px-2 py-1 rounded text-xs ${order.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {order.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No orders yet</p>
          )}
          <div className="mt-4">
            <Link to="/admin/orders" className="text-blue-600 hover:underline text-sm">View all orders →</Link>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Low Stock Products</h2>
          {lowStockProducts > 0 ? (
            <div className="space-y-4">
              {products
                .filter(product => product.countInStock <= 5)
                .slice(0, 5)
                .map(product => (
                  <div key={product._id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">Stock: {product.countInStock}</p>
                    </div>
                    <div>
                      <span className={`px-2 py-1 rounded text-xs ${product.countInStock === 0 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {product.countInStock === 0 ? 'Out of Stock' : 'Low Stock'}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500">No low stock products</p>
          )}
          <div className="mt-4">
            <Link to="/admin/products" className="text-blue-600 hover:underline text-sm">Manage inventory →</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
