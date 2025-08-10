import React from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaFileInvoice, FaTimesCircle } from 'react-icons/fa';

const OrderCard = ({ 
  orders, 
  selectedOrders, 
  onOrderSelect, 
  onCancelOrder, 
  onDownloadInvoice,
  formatPrice,
  getRelativeTime,
  className = '',
  style = {}
}) => {
  const getStatusConfig = (status) => {
    const configs = {
      pending: { 
        color: 'from-yellow-500 to-orange-500', 
        icon: 'fa-clock', 
        label: 'Pending'
      },
      processing: { 
        color: 'from-blue-500 to-cyan-500', 
        icon: 'fa-cog', 
        label: 'Processing'
      },
      shipped: { 
        color: 'from-purple-500 to-pink-500', 
        icon: 'fa-truck', 
        label: 'Shipped'
      },
      delivered: { 
        color: 'from-green-500 to-emerald-500', 
        icon: 'fa-check-circle', 
        label: 'Delivered'
      },
      cancelled: { 
        color: 'from-red-500 to-red-600', 
        icon: 'fa-times-circle', 
        label: 'Cancelled'
      }
    };
    return configs[status?.toLowerCase()] || configs.processing;
  };

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 ${className}`} style={style}>
      {orders.map((order, index) => {
        const statusConfig = getStatusConfig(order.status);
        const isSelected = selectedOrders.includes(order._id);
        
        return (
          <div
            key={order._id}
            className={`bg-white/10 backdrop-blur-xl border rounded-3xl overflow-hidden shadow-2xl hover:scale-105 transition-all duration-500 group relative ${
              isSelected 
                ? 'border-blue-500 ring-2 ring-blue-500/50' 
                : 'border-white/20 dark:border-gray-700/20'
            }`}
          >
            {/* Selection Checkbox */}
            <div className="absolute top-4 left-4 z-10">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onOrderSelect(order._id)}
                className="w-5 h-5 text-blue-600 bg-white/20 border-white/30 rounded focus:ring-blue-500 focus:ring-2"
              />
            </div>

            {/* Order Header */}
            <div className={`bg-gradient-to-r ${statusConfig.color} p-6 text-white relative`}>
              <div className="flex justify-between items-start mb-4 mt-4">
                <div>
                  <h3 className="text-xl font-bold mb-1">
                    #{order._id?.substring(order._id.length - 8).toUpperCase()}
                  </h3>
                  <p className="text-blue-100">
                    <i className="fas fa-calendar mr-2"></i>
                    {getRelativeTime(order.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {formatPrice(order.totalPrice)}
                  </div>
                  <p className="text-blue-100 text-sm">
                    {order.orderItems?.length || 0} items
                  </p>
                </div>
              </div>
              
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className="bg-white/20 backdrop-blur-lg px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                  <i className={`fas ${statusConfig.icon} mr-2`}></i>
                  {statusConfig.label}
                </span>
                {order.isPaid && (
                  <span className="bg-green-500/30 px-3 py-1 rounded-full text-sm font-semibold">
                    <i className="fas fa-check-circle mr-1"></i>
                    Paid
                  </span>
                )}
              </div>
            </div>

            {/* Order Content */}
            <div className="p-6">
              {/* Customer Info */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  <i className="fas fa-user mr-2 text-blue-500"></i>
                  Ship to:
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {order.shippingAddress?.fullName}<br />
                  {order.shippingAddress?.address}<br />
                  {order.shippingAddress?.city}, {order.shippingAddress?.country}
                </p>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  <i className="fas fa-box mr-2 text-purple-500"></i>
                  Items ({order.orderItems?.length || 0}):
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {order.orderItems?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="text-gray-900 dark:text-white truncate">{item.name}</span>
                      <span className="text-gray-600 dark:text-gray-400 ml-2">
                        {item.qty}x {formatPrice(item.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Link
                  to={`/orders/${order._id}`}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 text-center"
                >
                  <FaEye className="inline mr-2" />
                  View Details
                </Link>
                
                <button
                  onClick={() => onDownloadInvoice(order._id)}
                  className="w-12 h-10 bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center justify-center transition-all duration-200"
                  title="Download Invoice"
                >
                  <FaFileInvoice />
                </button>
                
                {order.status !== 'cancelled' && order.status !== 'delivered' && (
                  <button
                    onClick={() => onCancelOrder(order._id)}
                    className="w-12 h-10 bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center justify-center transition-all duration-200"
                    title="Cancel Order"
                  >
                    <FaTimesCircle />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderCard;
