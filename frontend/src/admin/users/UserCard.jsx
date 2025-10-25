import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

// Utils
import { trackEvent } from '../../utils/analytics';
import { formatDate } from '../../utils/helpers';

const UserCard = ({
  user = {},
  onEdit = () => {},
  onDelete = () => {},
  onStatusChange = () => {},
  onRoleChange = () => {},
  variant = 'default', // default, compact, detailed
  showActions = true,
  className = ''
}) => {
  // Default user data structure
  const defaultUser = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop',
    role: 'Admin',
    status: 'active', // active, inactive, pending, suspended
    lastLogin: new Date().toISOString(),
    joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    department: 'IT',
    permissions: ['read', 'write', 'delete'],
    phone: '+1 (555) 123-4567',
    location: 'New York, USA',
    orders: 145,
    totalSpent: 2500.00
  };

  // Merge provided user with defaults
  const userData = { ...defaultUser, ...user };

  // Local state
  const [isExpanded, setIsExpanded] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  // Available roles
  const roles = [
    { value: 'Admin', label: 'Administrator', color: 'from-red-500 to-rose-500' },
    { value: 'Manager', label: 'Manager', color: 'from-blue-500 to-cyan-500' },
    { value: 'Editor', label: 'Editor', color: 'from-green-500 to-emerald-500' },
    { value: 'User', label: 'User', color: 'from-gray-500 to-gray-600' },
    { value: 'Guest', label: 'Guest', color: 'from-purple-500 to-pink-500' }
  ];

  // Handle role change
  const handleRoleChange = useCallback((newRole) => {
    onRoleChange(userData.id, newRole);
    
    trackEvent('admin_user_role_changed', {
      user_id: userData.id,
      old_role: userData.role,
      new_role: newRole
    });
    
    toast.success(`User role updated to ${newRole}`);
  }, [userData.id, userData.role, onRoleChange]);

  // Handle status change
  const handleStatusChange = useCallback((newStatus) => {
    onStatusChange(userData.id, newStatus);
    
    trackEvent('admin_user_status_changed', {
      user_id: userData.id,
      old_status: userData.status,
      new_status: newStatus
    });
    
    toast.success(`User status updated to ${newStatus}`);
  }, [userData.id, userData.status, onStatusChange]);

  // Handle delete user
  const handleDelete = useCallback(() => {
    if (window.confirm(`Are you sure you want to delete ${userData.name}?`)) {
      onDelete(userData.id);
      
      trackEvent('admin_user_deleted', {
        user_id: userData.id,
        user_name: userData.name
      });
      
      toast.success('User deleted successfully');
    }
  }, [userData.id, userData.name, onDelete]);

  // Get status styling
  const getStatusStyle = (status) => {
    switch (status) {
      case 'active':
        return { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-800 dark:text-green-200', dot: 'bg-green-400' };
      case 'inactive':
        return { bg: 'bg-gray-100 dark:bg-gray-900/20', text: 'text-gray-800 dark:text-gray-200', dot: 'bg-gray-400' };
      case 'pending':
        return { bg: 'bg-yellow-100 dark:bg-yellow-900/20', text: 'text-yellow-800 dark:text-yellow-200', dot: 'bg-yellow-400' };
      case 'suspended':
        return { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-800 dark:text-red-200', dot: 'bg-red-400' };
      default:
        return { bg: 'bg-gray-100 dark:bg-gray-900/20', text: 'text-gray-800 dark:text-gray-200', dot: 'bg-gray-400' };
    }
  };

  // Get role styling
  const getRoleStyle = (role) => {
    const roleData = roles.find(r => r.value === role);
    return roleData ? roleData.color : 'from-gray-500 to-gray-600';
  };

  const statusStyle = getStatusStyle(userData.status);

  // Render compact variant
  if (variant === 'compact') {
    return (
      <div className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 ${className}`}>
        <div className="flex items-center space-x-4">
          <div className="relative flex-shrink-0">
            <img
              src={userData.avatar}
              alt={userData.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
            />
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${statusStyle.dot} rounded-full border-2 border-white`}></div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate">
              {userData.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm truncate">
              {userData.email}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
                {userData.status}
              </span>
              <span className="text-xs text-gray-500">
                {userData.role}
              </span>
            </div>
          </div>

          {showActions && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onEdit(userData)}
                className="w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors"
                title="Edit user"
              >
                <i className="fas fa-edit text-xs"></i>
              </button>
              <button
                onClick={handleDelete}
                className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                title="Delete user"
              >
                <i className="fas fa-trash text-xs"></i>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render default variant
  return (
    <div className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 ${className}`}>
      
      {/* Header */}
      <div className="p-6 border-b border-white/20 dark:border-gray-700/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            
            {/* Avatar */}
            <div className="relative">
              <img
                src={userData.avatar}
                alt={userData.name}
                className="w-16 h-16 rounded-full object-cover border-3 border-white/30 shadow-lg"
              />
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${statusStyle.dot} rounded-full border-2 border-white animate-pulse`}></div>
            </div>

            {/* User Info */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {userData.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {userData.email}
              </p>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
                  {userData.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white bg-gradient-to-r ${getRoleStyle(userData.role)}`}>
                  {userData.role}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-10 h-10 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center text-gray-900 dark:text-white hover:bg-white/30 transition-all duration-200"
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setIsActionsOpen(!isActionsOpen)}
                  className="w-10 h-10 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center text-gray-900 dark:text-white hover:bg-white/30 transition-all duration-200"
                  title="More actions"
                >
                  <i className="fas fa-ellipsis-v"></i>
                </button>
                
                {isActionsOpen && (
                  <div className="absolute top-12 right-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl py-2 min-w-48 z-10">
                    <button
                      onClick={() => {
                        onEdit(userData);
                        setIsActionsOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-white/20 transition-colors text-gray-900 dark:text-white flex items-center"
                    >
                      <i className="fas fa-edit mr-3 text-blue-500"></i>
                      Edit User
                    </button>
                    
                    <div className="px-4 py-2">
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Change Role
                      </label>
                      <select
                        value={userData.role}
                        onChange={(e) => handleRoleChange(e.target.value)}
                        className="w-full bg-white/20 border border-white/30 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white"
                      >
                        {roles.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="px-4 py-2">
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Change Status
                      </label>
                      <select
                        value={userData.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="w-full bg-white/20 border border-white/30 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                    
                    <hr className="border-white/20 my-2" />
                    
                    <button
                      onClick={() => {
                        handleDelete();
                        setIsActionsOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-red-500/20 transition-colors text-red-600 dark:text-red-400 flex items-center"
                    >
                      <i className="fas fa-trash mr-3"></i>
                      Delete User
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="p-6 space-y-4">
        
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Department</label>
            <p className="text-gray-900 dark:text-white font-semibold">{userData.department}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone</label>
            <p className="text-gray-900 dark:text-white font-semibold">{userData.phone}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Location</label>
            <p className="text-gray-900 dark:text-white font-semibold">{userData.location}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Join Date</label>
            <p className="text-gray-900 dark:text-white font-semibold">{formatDate(userData.joinDate)}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20 dark:border-gray-700/20">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {userData.orders}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Orders</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${userData.totalSpent.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Spent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {userData.permissions.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Permissions</div>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="space-y-4 animate-fade-in pt-4 border-t border-white/20 dark:border-gray-700/20">
            
            {/* Permissions */}
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                Permissions
              </label>
              <div className="flex flex-wrap gap-2">
                {userData.permissions.map((permission, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            </div>

            {/* Last Login */}
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Login</label>
              <p className="text-gray-900 dark:text-white font-semibold">
                {formatDate(userData.lastLogin)}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => window.open(`mailto:${userData.email}`)}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-xl transition-colors flex items-center justify-center"
              >
                <i className="fas fa-envelope mr-2"></i>
                Email
              </button>
              <button
                onClick={() => window.open(`tel:${userData.phone}`)}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-xl transition-colors flex items-center justify-center"
              >
                <i className="fas fa-phone mr-2"></i>
                Call
              </button>
              <button
                onClick={() => onEdit(userData)}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-xl transition-colors flex items-center justify-center"
              >
                <i className="fas fa-edit mr-2"></i>
                Edit
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom Styles */}
    </div>
  );
};

export default UserCard;
