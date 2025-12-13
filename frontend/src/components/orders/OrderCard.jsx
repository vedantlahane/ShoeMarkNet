import React from 'react';
import { formatCurrency, getRelativeTime } from '../../utils/helpers';

const OrderCard = ({ 
  order, 
  index, 
  isSelected, 
  priority, 
  onSelect, 
  onStatusUpdate, 
  onViewDetails, 
  onTrackOrder,
  animateCards 
}) => {
  const getStatusColor = (order) => {
    if (order.isDelivered) return 'from-green-500 to-emerald-500';
    if (order.isPaid) return 'from-blue-500 to-cyan-500';
    return 'from-yellow-500 to-orange-500';
  };

  const getPriorityBadge = (priority) => {
    const configs = {
      high: { color: 'bg-red-500', icon: 'fa-exclamation-triangle', label: 'Urgent' },
      medium: { color: 'bg-yellow-500', icon: 'fa-clock', label: 'Medium' },
      low: { color: 'bg-green-500', icon: 'fa-check', label: 'Normal' }
    };
    return configs[priority] || configs.low;
  };

  const priorityConfig = getPriorityBadge(priority);

  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl dark:shadow-none hover:scale-[1.02] transition-all duration-500 relative group cursor-pointer ${
        animateCards ? 'animate-fade-in-up' : 'opacity-0'
      }`}
      style={{ animationDelay: `${index * 0.1}s` }}
      onClick={() => onViewDetails(order)}
    >
      
      {/* Selection Checkbox */}
      <div className="absolute top-4 left-4 z-20">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="w-5 h-5 text-blue-600 bg-white/20 border-white/30 rounded focus:ring-blue-500 focus:ring-2"
        />
      </div>

      {/* Priority Indicator */}
      {priority !== 'low' && (
        <div className={`absolute top-4 right-4 w-3 h-3 ${priorityConfig.color} rounded-full ${
          priority === 'high' ? 'animate-pulse' : ''
        }`} title={`${priorityConfig.label} Priority`}></div>
      )}

      {/* Shimmer Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

      <div className="p-6 relative z-10">
        
        {/* Order Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Order #{order._id.substring(order._id.length - 8)}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <i className="fas fa-clock mr-1"></i>
              {getRelativeTime(order.createdAt)}
            </p>
          </div>
          <div className={`w-12 h-12 bg-gradient-to-r ${getStatusColor(order)} rounded-2xl flex items-center justify-center shadow-lg`}>
            <i className={`fas ${
              order.isDelivered ? 'fa-truck' : 
              order.isPaid ? 'fa-credit-card' : 'fa-clock'
            } text-white`}></i>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
              {order.user?.name?.charAt(0)?.toUpperCase() || 'G'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 dark:text-white truncate">
                {order.user?.name || 'Guest User'}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                {order.user?.email || 'No email provided'}
              </p>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Amount</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(order.totalPrice)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Items</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {order.orderItems?.length || 0}
            </p>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex gap-2 mb-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
            order.isPaid 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
          }`}>
            <i className={`fas ${order.isPaid ? 'fa-check-circle' : 'fa-times-circle'} mr-1`}></i>
            {order.isPaid ? 'Paid' : 'Unpaid'}
          </span>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
            order.isDelivered 
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' 
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
          }`}>
            <i className={`fas ${order.isDelivered ? 'fa-truck' : 'fa-clock'} mr-1`}></i>
            {order.isDelivered ? 'Delivered' : 'Processing'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTrackOrder();
            }}
            className="flex items-center justify-center py-2 px-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200"
          >
            <i className="fas fa-map-marker-alt mr-2 text-blue-500"></i>
            Track
          </button>
          
          {!order.isPaid && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStatusUpdate(order._id, 'isPaid', true);
              }}
              className="flex items-center justify-center py-2 px-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-medium transition-all duration-200"
            >
              <i className="fas fa-check mr-2"></i>
              Mark Paid
            </button>
          )}
          
          {order.isPaid && !order.isDelivered && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStatusUpdate(order._id, 'isDelivered', true);
              }}
              className="flex items-center justify-center py-2 px-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-medium transition-all duration-200"
            >
              <i className="fas fa-truck mr-2"></i>
              Deliver
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
