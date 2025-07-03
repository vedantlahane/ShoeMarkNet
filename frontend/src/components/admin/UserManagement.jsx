// src/components/admin/UserManagement.jsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser, deleteUser } from '../../redux/slices/authSlice';
import { toast } from 'react-toastify';

const UserManagement = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector(state => state.auth);
  
  // Enhanced state management
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(12);
  const [animateCards, setAnimateCards] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Trigger animations
  useEffect(() => {
    setAnimateCards(true);
  }, []);

  // Enhanced filtering and sorting
  const filteredAndSortedUsers = useMemo(() => {
    if (!users) return [];

    let filtered = users.filter(user => {
      // Search filter
      const searchMatch = !searchTerm || 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchTerm.toLowerCase());

      // Role filter
      const roleMatch = roleFilter === 'all' || user.role === roleFilter;

      // Status filter (assuming we have user status)
      const statusMatch = statusFilter === 'all' || 
        (statusFilter === 'active' && user.isActive !== false) ||
        (statusFilter === 'inactive' && user.isActive === false) ||
        (statusFilter === 'verified' && user.isVerified) ||
        (statusFilter === 'unverified' && !user.isVerified);

      return searchMatch && roleMatch && statusMatch;
    });

    // Sort users
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'email':
          aValue = a.email || '';
          bValue = b.email || '';
          break;
        case 'leadScore':
          aValue = a.leadScore || 0;
          bValue = b.leadScore || 0;
          break;
        case 'lastLogin':
          aValue = new Date(a.lastLogin || 0);
          bValue = new Date(b.lastLogin || 0);
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [users, searchTerm, roleFilter, statusFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedUsers.length / usersPerPage);
  const currentUsers = filteredAndSortedUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  // Calculate user statistics
  const userStats = useMemo(() => {
    if (!users) return {};

    const totalUsers = users.length;
    const adminUsers = users.filter(u => u.role === 'admin').length;
    const regularUsers = users.filter(u => u.role === 'user').length;
    const verifiedUsers = users.filter(u => u.isVerified).length;
    const activeUsers = users.filter(u => u.isActive !== false).length;
    const avgLeadScore = users.reduce((sum, u) => sum + (u.leadScore || 0), 0) / totalUsers;

    return {
      totalUsers,
      adminUsers,
      regularUsers,
      verifiedUsers,
      activeUsers,
      avgLeadScore: avgLeadScore.toFixed(1)
    };
  }, [users]);

  // Enhanced handlers
  const handleRoleUpdate = useCallback((userId, newRole) => {
    dispatch(updateUser({ id: userId, userData: { role: newRole } }))
      .unwrap()
      .then(() => {
        toast.success(`User role updated to ${newRole}`);
      })
      .catch((error) => {
        toast.error(error.message || 'Failed to update user role');
      });
  }, [dispatch]);

  const handleDeleteUser = useCallback((userId) => {
    setUserToDelete(userId);
    setShowDeleteConfirm(true);
  }, []);

  const confirmDeleteUser = useCallback(() => {
    if (userToDelete) {
      dispatch(deleteUser(userToDelete))
        .unwrap()
        .then(() => {
          toast.success('User deleted successfully');
          setShowDeleteConfirm(false);
          setUserToDelete(null);
        })
        .catch((error) => {
          toast.error(error.message || 'Failed to delete user');
        });
    }
  }, [dispatch, userToDelete]);

  const toggleUserSelection = useCallback((userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  }, []);

  const handleBulkAction = useCallback((action) => {
    switch (action) {
      case 'activate':
        selectedUsers.forEach(userId => {
          dispatch(updateUser({ id: userId, userData: { isActive: true } }));
        });
        toast.success(`Activated ${selectedUsers.length} users`);
        break;
      case 'deactivate':
        selectedUsers.forEach(userId => {
          dispatch(updateUser({ id: userId, userData: { isActive: false } }));
        });
        toast.success(`Deactivated ${selectedUsers.length} users`);
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
          selectedUsers.forEach(userId => {
            dispatch(deleteUser(userId));
          });
          toast.success(`Deleted ${selectedUsers.length} users`);
        }
        break;
      default:
        break;
    }
    setSelectedUsers([]);
    setShowBulkActions(false);
  }, [dispatch, selectedUsers]);

  // Utility functions
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  const getRelativeTime = useCallback((dateString) => {
    if (!dateString) return 'Never';
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 24) {
      return diffInHours < 1 ? 'Just now' : `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return formatDate(dateString);
    }
  }, [formatDate]);

  const getUserStatusColor = useCallback((user) => {
    if (user.isActive === false) return 'from-gray-500 to-gray-600';
    if (user.role === 'admin') return 'from-purple-500 to-purple-600';
    if (user.isVerified) return 'from-green-500 to-green-600';
    return 'from-blue-500 to-blue-600';
  }, []);

  const getLeadScoreColor = useCallback((score) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    if (score >= 40) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-red-600';
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="flex justify-center items-center h-96">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-12 text-center shadow-2xl">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              <i className="fas fa-users mr-2 text-blue-500"></i>
              Loading Users
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              <i className="fas fa-database mr-2"></i>
              Fetching user data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="flex justify-center items-center h-96">
          <div className="bg-red-500/20 backdrop-blur-xl border border-red-300/50 rounded-3xl p-12 text-center shadow-2xl max-w-md">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-exclamation-triangle text-white text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">
              Error Loading Users
            </h3>
            <p className="text-red-500 dark:text-red-300 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-200"
            >
              <i className="fas fa-redo mr-2"></i>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="flex justify-center items-center h-96">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-12 text-center shadow-2xl max-w-md">
            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-users text-gray-400 text-3xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              No Users Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Users will appear here when they register for your platform
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                <i className="fas fa-users mr-3"></i>
                User Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                <i className="fas fa-user-cog mr-2"></i>
                Manage user accounts, roles, and permissions
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105">
                <i className="fas fa-file-export mr-2"></i>
                Export Users
              </button>
              <button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105">
                <i className="fas fa-user-plus mr-2"></i>
                Add User
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        {[
          {
            title: 'Total Users',
            value: userStats.totalUsers?.toLocaleString() || '0',
            icon: 'fa-users',
            color: 'from-blue-500 to-blue-600',
            change: '+5%',
            positive: true
          },
          {
            title: 'Active Users',
            value: userStats.activeUsers?.toLocaleString() || '0',
            icon: 'fa-user-check',
            color: 'from-green-500 to-green-600',
            change: '+12%',
            positive: true
          },
          {
            title: 'Admin Users',
            value: userStats.adminUsers?.toLocaleString() || '0',
            icon: 'fa-user-shield',
            color: 'from-purple-500 to-purple-600',
            change: '+2%',
            positive: true
          },
          {
            title: 'Regular Users',
            value: userStats.regularUsers?.toLocaleString() || '0',
            icon: 'fa-user',
            color: 'from-cyan-500 to-cyan-600',
            change: '+8%',
            positive: true
          },
          {
            title: 'Verified Users',
            value: userStats.verifiedUsers?.toLocaleString() || '0',
            icon: 'fa-user-check',
            color: 'from-emerald-500 to-emerald-600',
            change: '+15%',
            positive: true
          },
          {
            title: 'Avg Lead Score',
            value: userStats.avgLeadScore || '0',
            icon: 'fa-chart-line',
            color: 'from-orange-500 to-orange-600',
            change: '+3%',
            positive: true
          }
        ].map((stat, index) => (
          <div
            key={index}
            className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-2xl hover:scale-105 transition-all duration-500 relative overflow-hidden ${
              animateCards ? 'animate-fade-in-up' : 'opacity-0'
            }`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/10 to-white/5 rounded-full blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <i className={`fas ${stat.icon} text-white text-lg`}></i>
                </div>
                <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                  stat.positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  <i className={`fas ${stat.positive ? 'fa-arrow-up' : 'fa-arrow-down'} mr-1`}></i>
                  {stat.change}
                </div>
              </div>
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Controls */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-2xl mb-8">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search users by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <i className="fas fa-search text-gray-400"></i>
              </div>
            </div>

            {/* Role Filter */}
            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="appearance-none bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl px-6 py-3 pr-12 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="all" className="bg-gray-800 text-white">All Roles</option>
                <option value="user" className="bg-gray-800 text-white">Regular Users</option>
                <option value="admin" className="bg-gray-800 text-white">Administrators</option>
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <i className="fas fa-user-tag text-gray-400"></i>
              </div>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl px-6 py-3 pr-12 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="all" className="bg-gray-800 text-white">All Status</option>
                <option value="active" className="bg-gray-800 text-white">Active</option>
                <option value="inactive" className="bg-gray-800 text-white">Inactive</option>
                <option value="verified" className="bg-gray-800 text-white">Verified</option>
                <option value="unverified" className="bg-gray-800 text-white">Unverified</option>
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <i className="fas fa-filter text-gray-400"></i>
              </div>
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="appearance-none bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl px-6 py-3 pr-12 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="createdAt-desc" className="bg-gray-800 text-white">Newest First</option>
                <option value="createdAt-asc" className="bg-gray-800 text-white">Oldest First</option>
                <option value="name-asc" className="bg-gray-800 text-white">Name A-Z</option>
                <option value="name-desc" className="bg-gray-800 text-white">Name Z-A</option>
                <option value="leadScore-desc" className="bg-gray-800 text-white">Highest Score</option>
                <option value="leadScore-asc" className="bg-gray-800 text-white">Lowest Score</option>
                <option value="lastLogin-desc" className="bg-gray-800 text-white">Recent Login</option>
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <i className="fas fa-sort text-gray-400"></i>
              </div>
            </div>
          </div>

          {/* View Mode and Bulk Actions */}
          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  viewMode === 'cards' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                <i className="fas fa-th-large"></i>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  viewMode === 'table' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                <i className="fas fa-table"></i>
              </button>
            </div>

            {/* Results Count */}
            <span className="text-sm text-gray-600 dark:text-gray-400">
              <i className="fas fa-users mr-1"></i>
              {filteredAndSortedUsers.length} users
            </span>

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedUsers.length} selected
                </span>
                <button
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-2xl transition-all duration-200"
                >
                  <i className="fas fa-list mr-2"></i>
                  Actions
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bulk Actions Menu */}
        {showBulkActions && selectedUsers.length > 0 && (
          <div className="mt-4 p-4 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleBulkAction('activate')}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200"
              >
                <i className="fas fa-user-check mr-2"></i>
                Activate
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200"
              >
                <i className="fas fa-user-times mr-2"></i>
                Deactivate
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200"
              >
                <i className="fas fa-trash mr-2"></i>
                Delete
              </button>
              <button
                onClick={() => setSelectedUsers([])}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200"
              >
                <i className="fas fa-times mr-2"></i>
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Users Display */}
      {viewMode === 'cards' ? (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {currentUsers.map((user, index) => (
            <div
              key={user._id}
              className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl overflow-hidden shadow-2xl hover:scale-105 transition-all duration-500 relative group ${
                animateCards ? 'animate-fade-in-up' : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              
              {/* Selection Checkbox */}
              <div className="absolute top-4 left-4 z-10">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user._id)}
                  onChange={() => toggleUserSelection(user._id)}
                  className="w-4 h-4 text-blue-600 bg-white/20 border-white/30 rounded focus:ring-blue-500"
                />
              </div>

              {/* User Avatar and Header */}
              <div className="relative h-32 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-2xl border-4 border-white/30">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      user.name?.charAt(0)?.toUpperCase() || 'U'
                    )}
                  </div>
                </div>
                
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getUserStatusColor(user)} text-white`}>
                    <i className={`fas ${
                      user.isActive === false ? 'fa-pause' :
                      user.role === 'admin' ? 'fa-crown' :
                      user.isVerified ? 'fa-check-circle' : 'fa-user'
                    } mr-1`}></i>
                    {user.isActive === false ? 'Inactive' :
                     user.role === 'admin' ? 'Admin' :
                     user.isVerified ? 'Verified' : 'User'}
                  </span>
                </div>
              </div>

              {/* User Info */}
              <div className="p-6 pt-8">
                {/* Name and Email */}
                <div className="text-center mb-4">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                    {user.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user.email}
                  </p>
                  {user.phone && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      <i className="fas fa-phone mr-1"></i>
                      {user.phone}
                    </p>
                  )}
                </div>

                {/* Lead Score */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Lead Score</span>
                    <span className="font-bold text-gray-900 dark:text-white">{user.leadScore || 0}</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full bg-gradient-to-r ${getLeadScoreColor(user.leadScore || 0)} transition-all duration-500`}
                      style={{ width: `${Math.min((user.leadScore || 0), 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* User Details */}
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <div className="flex items-center">
                    <i className="fas fa-calendar-plus text-blue-500 mr-2 w-4"></i>
                    <span>Joined {formatDate(user.createdAt)}</span>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-clock text-green-500 mr-2 w-4"></i>
                    <span>Last login {getRelativeTime(user.lastLogin)}</span>
                  </div>
                  {user.orders && (
                    <div className="flex items-center">
                      <i className="fas fa-shopping-cart text-purple-500 mr-2 w-4"></i>
                      <span>{user.orders} orders</span>
                    </div>
                  )}
                </div>

                {/* Role Selector */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    <i className="fas fa-user-tag mr-1"></i>
                    Role
                  </label>
                  <div className="relative">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleUpdate(user._id, e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none"
                    >
                      <option value="user" className="bg-gray-800 text-white">User</option>
                      <option value="admin" className="bg-gray-800 text-white">Admin</option>
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <i className="fas fa-chevron-down text-gray-400 text-xs"></i>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setShowUserModal(true);
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200"
                  >
                    <i className="fas fa-eye mr-2"></i>
                    View
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    className="w-12 h-10 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl flex items-center justify-center transition-all duration-200"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl overflow-hidden shadow-2xl mb-8">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/20 dark:divide-gray-700/20">
              <thead className="bg-white/10 backdrop-blur-lg">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === currentUsers.length && currentUsers.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(currentUsers.map(u => u._id));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                      className="w-4 h-4 text-blue-600 bg-white/20 border-white/30 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    <i className="fas fa-user mr-2"></i>User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    <i className="fas fa-envelope mr-2"></i>Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    <i className="fas fa-user-tag mr-2"></i>Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    <i className="fas fa-chart-line mr-2"></i>Lead Score
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    <i className="fas fa-calendar mr-2"></i>Last Login
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    <i className="fas fa-info-circle mr-2"></i>Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    <i className="fas fa-cog mr-2"></i>Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20 dark:divide-gray-700/20">
                {currentUsers.map((user, index) => (
                  <tr
                    key={user._id}
                    className={`hover:bg-white/10 transition-all duration-200 ${
                      animateCards ? 'animate-fade-in' : 'opacity-0'
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => toggleUserSelection(user._id)}
                        className="w-4 h-4 text-blue-600 bg-white/20 border-white/30 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-12 h-12 mr-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                            ) : (
                              user.name?.charAt(0)?.toUpperCase() || 'U'
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900 dark:text-white">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            ID: {user._id.substring(user._id.length - 8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900 dark:text-white">
                          <i className="fas fa-envelope mr-2 text-blue-500"></i>
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <i className="fas fa-phone mr-2 text-green-500"></i>
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleUpdate(user._id, e.target.value)}
                          className={`text-sm rounded-xl px-3 py-2 font-semibold border-0 focus:ring-2 focus:ring-blue-400 ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-bold text-gray-900 dark:text-white mr-3">
                          {user.leadScore || 0}
                        </div>
                        <div className="w-16 bg-white/20 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full bg-gradient-to-r ${getLeadScoreColor(user.leadScore || 0)}`}
                            style={{ width: `${Math.min((user.leadScore || 0), 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {getRelativeTime(user.lastLogin)}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {formatDate(user.lastLogin)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getUserStatusColor(user)} text-white`}>
                        <i className={`fas ${
                          user.isActive === false ? 'fa-pause' :
                          user.isVerified ? 'fa-check-circle' : 'fa-user'
                        } mr-1`}></i>
                        {user.isActive === false ? 'Inactive' :
                         user.isVerified ? 'Verified' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserModal(true);
                          }}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 transform hover:scale-105"
                        >
                          <i className="fas fa-eye mr-2"></i>
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 transform hover:scale-105"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, filteredAndSortedUsers.length)} of {filteredAndSortedUsers.length} users
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-10 h-10 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-semibold transition-all duration-200 ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                          : 'bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/20'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return <span key={page} className="text-gray-400">...</span>;
                }
                return null;
              })}
              
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-10 h-10 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
            
            {/* Modal Header */}
            <div className="bg-white/10 backdrop-blur-lg border-b border-white/20 dark:border-gray-700/20 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {selectedUser.avatar ? (
                      <img src={selectedUser.avatar} alt={selectedUser.name} className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      selectedUser.name?.charAt(0)?.toUpperCase() || 'U'
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedUser.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      <i className="fas fa-envelope mr-2"></i>
                      {selectedUser.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="w-12 h-12 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-white/20 transition-all duration-200"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* User Information */}
                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      <i className="fas fa-user mr-2 text-blue-500"></i>
                      Personal Information
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Full Name:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{selectedUser.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Email:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{selectedUser.email}</span>
                      </div>
                      {selectedUser.phone && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{selectedUser.phone}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">User ID:</span>
                        <span className="font-medium text-gray-900 dark:text-white font-mono">
                          {selectedUser._id.substring(selectedUser._id.length - 12)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      <i className="fas fa-chart-line mr-2 text-green-500"></i>
                      Lead Scoring
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Current Score:</span>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          {selectedUser.leadScore || 0}
                        </span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full bg-gradient-to-r ${getLeadScoreColor(selectedUser.leadScore || 0)} transition-all duration-500`}
                          style={{ width: `${Math.min((selectedUser.leadScore || 0), 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedUser.leadScore >= 80 ? 'High Quality Lead' :
                         selectedUser.leadScore >= 60 ? 'Medium Quality Lead' :
                         selectedUser.leadScore >= 40 ? 'Low Quality Lead' : 'Cold Lead'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity Information */}
                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      <i className="fas fa-clock mr-2 text-purple-500"></i>
                      Activity Information
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Joined:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatDate(selectedUser.createdAt)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Last Login:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {getRelativeTime(selectedUser.lastLogin)}
                        </span>
                      </div>
                      {selectedUser.orders && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Total Orders:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{selectedUser.orders}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Status:</span>
                        <span className={`font-medium px-2 py-1 rounded-full text-xs bg-gradient-to-r ${getUserStatusColor(selectedUser)} text-white`}>
                          {selectedUser.isActive === false ? 'Inactive' :
                           selectedUser.isVerified ? 'Verified' : 'Active'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 rounded-2xl p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      <i className="fas fa-shield-alt mr-2 text-orange-500"></i>
                      Permissions & Role
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Current Role:</span>
                        <span className={`font-semibold px-3 py-1 rounded-full text-sm ${
                          selectedUser.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          <i className={`fas ${selectedUser.role === 'admin' ? 'fa-crown' : 'fa-user'} mr-1`}></i>
                          {selectedUser.role === 'admin' ? 'Administrator' : 'Regular User'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedUser.role === 'admin' 
                          ? 'Full access to all administrative functions and user management.'
                          : 'Standard user permissions with access to customer features only.'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-white/10 backdrop-blur-lg border-t border-white/20 dark:border-gray-700/20 p-6">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 text-gray-900 dark:text-white font-semibold py-2 px-6 rounded-2xl hover:bg-white/20 transition-all duration-200"
                >
                  <i className="fas fa-times mr-2"></i>
                  Close
                </button>
                <button
                  onClick={() => {
                    // Edit user functionality
                    setShowUserModal(false);
                  }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-6 rounded-2xl transition-all duration-200"
                >
                  <i className="fas fa-edit mr-2"></i>
                  Edit User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Delete Confirmation Modal */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl w-full max-w-md shadow-2xl">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <i className="fas fa-exclamation-triangle text-white text-2xl"></i>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Delete User Account?
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                This action cannot be undone. All user data, orders, and activity will be permanently deleted.
              </p>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setUserToDelete(null);
                  }}
                  className="flex-1 bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-2xl hover:bg-white/20 transition-all duration-200"
                >
                  <i className="fas fa-times mr-2"></i>
                  Cancel
                </button>
                
                <button
                  onClick={confirmDeleteUser}
                  className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200"
                >
                  <i className="fas fa-trash mr-2"></i>
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
        
        select option {
          background-color: #1f2937;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default UserManagement;
