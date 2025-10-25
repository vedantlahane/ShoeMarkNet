import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

// Utils
import { trackEvent } from '../../utils/analytics';
import { formatDate, formatCurrency } from '../../utils/helpers';

// Hooks
import useLocalStorage from '../../hooks/useLocalStorage';

const UserTable = ({
  users = [],
  onEdit = () => {},
  onDelete = () => {},
  onStatusChange = () => {},
  onRoleChange = () => {},
  onBulkAction = () => {},
  variant = 'default', // default, compact, detailed
  showActions = true,
  showFilters = true,
  showBulkActions = true,
  itemsPerPage = 10,
  className = ''
}) => {
  // Default users data
  const defaultUsers = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop',
      role: 'Admin',
      status: 'active',
      department: 'IT',
      phone: '+1 (555) 123-4567',
      location: 'New York, USA',
      lastLogin: new Date().toISOString(),
      joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      orders: 145,
      totalSpent: 2500.00
    },
    {
      id: '2',
      name: 'Sarah Wilson',
      email: 'sarah.wilson@example.com',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5db?q=80&w=150&auto=format&fit=crop',
      role: 'Manager',
      status: 'active',
      department: 'Sales',
      phone: '+1 (555) 987-6543',
      location: 'Los Angeles, USA',
      lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      joinDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      orders: 89,
      totalSpent: 1800.00
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
      role: 'User',
      status: 'inactive',
      department: 'Marketing',
      phone: '+1 (555) 456-7890',
      location: 'Chicago, USA',
      lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      joinDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      orders: 23,
      totalSpent: 450.00
    }
  ];

  // Use provided users or fallback to default
  const userData = users.length > 0 ? users : defaultUsers;

  // State management
  const [filteredUsers, setFilteredUsers] = useState(userData);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [animateElements, setAnimateElements] = useState(false);

  // Local storage for table preferences
  const [tablePreferences, setTablePreferences] = useLocalStorage('userTablePreferences', {
    itemsPerPage: 10,
    sortConfig: { key: null, direction: 'asc' },
    visibleColumns: ['avatar', 'name', 'email', 'role', 'status', 'lastLogin', 'actions']
  });

  // Initialize animations
  useEffect(() => {
    setTimeout(() => setAnimateElements(true), 100);
  }, []);

  // Available columns
  const allColumns = [
    { key: 'avatar', label: 'Avatar', sortable: false },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'lastLogin', label: 'Last Login', sortable: true },
    { key: 'joinDate', label: 'Join Date', sortable: true },
    { key: 'orders', label: 'Orders', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false }
  ];

  // Filter and sort users
  useEffect(() => {
    let filtered = [...userData];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [userData, searchTerm, statusFilter, roleFilter, sortConfig]);

  // Handle sorting
  const handleSort = useCallback((key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    const newSortConfig = { key, direction };
    setSortConfig(newSortConfig);
    setTablePreferences(prev => ({ ...prev, sortConfig: newSortConfig }));

    trackEvent('user_table_sorted', {
      sort_key: key,
      sort_direction: direction
    });
  }, [sortConfig, setTablePreferences]);

  // Handle user selection
  const handleUserSelection = useCallback((userId, isSelected) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      return newSet;
    });
  }, []);

  // Handle select all
  const handleSelectAll = useCallback((isSelected) => {
    if (isSelected) {
      setSelectedUsers(new Set(paginatedUsers.map(user => user.id)));
    } else {
      setSelectedUsers(new Set());
    }
  }, []);

  // Handle bulk actions
  const handleBulkAction = useCallback((action) => {
    if (selectedUsers.size === 0) {
      toast.warning('Please select users first');
      return;
    }

    const selectedUsersList = Array.from(selectedUsers);
    onBulkAction(action, selectedUsersList);

    trackEvent('user_table_bulk_action', {
      action,
      user_count: selectedUsersList.length
    });

    // Clear selection after action
    setSelectedUsers(new Set());
  }, [selectedUsers, onBulkAction]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

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
  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'from-red-500 to-rose-500';
      case 'Manager':
        return 'from-blue-500 to-cyan-500';
      case 'Editor':
        return 'from-green-500 to-emerald-500';
      case 'User':
        return 'from-gray-500 to-gray-600';
      default:
        return 'from-purple-500 to-pink-500';
    }
  };

  // Render table header
  const renderTableHeader = () => (
    <thead className="bg-white/10 backdrop-blur-lg">
      <tr>
        {showBulkActions && (
          <th className="px-6 py-4 text-left">
            <input
              type="checkbox"
              checked={selectedUsers.size === paginatedUsers.length && paginatedUsers.length > 0}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </th>
        )}
        {allColumns.map((column) => (
          <th
            key={column.key}
            className={`px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white ${
              column.sortable ? 'cursor-pointer hover:bg-white/20 transition-colors' : ''
            }`}
            onClick={() => column.sortable && handleSort(column.key)}
          >
            <div className="flex items-center space-x-2">
              <span>{column.label}</span>
              {column.sortable && (
                <div className="flex flex-col">
                  <i className={`fas fa-chevron-up text-xs ${
                    sortConfig.key === column.key && sortConfig.direction === 'asc' 
                      ? 'text-blue-500' : 'text-gray-400'
                  }`}></i>
                  <i className={`fas fa-chevron-down text-xs ${
                    sortConfig.key === column.key && sortConfig.direction === 'desc' 
                      ? 'text-blue-500' : 'text-gray-400'
                  }`}></i>
                </div>
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );

  // Render table row
  const renderTableRow = (user, index) => {
    const statusStyle = getStatusStyle(user.status);
    const isSelected = selectedUsers.has(user.id);
    const ordersCount = Number.isFinite(Number(user.orders)) ? Number(user.orders) : 0;
    const totalSpentValue = Number.isFinite(Number(user.totalSpent))
      ? Number(user.totalSpent)
      : null;
    const formattedTotalSpent = totalSpentValue !== null
      ? formatCurrency(totalSpentValue, user.currency || 'USD')
      : '—';

    return (
      <tr
        key={user.id}
        className={`hover:bg-white/5 transition-colors border-b border-white/10 dark:border-gray-700/10 ${
          isSelected ? 'bg-blue-50/10' : ''
        } ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`}
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        {showBulkActions && (
          <td className="px-6 py-4">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => handleUserSelection(user.id, e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </td>
        )}
        
        {/* Avatar */}
        <td className="px-6 py-4">
          <div className="relative">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-white/30"
            />
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${statusStyle.dot} rounded-full border-2 border-white`}></div>
          </div>
        </td>

        {/* Name */}
        <td className="px-6 py-4">
          <div className="font-semibold text-gray-900 dark:text-white">
            {user.name}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            ID: {user.id}
          </div>
        </td>

        {/* Email */}
        <td className="px-6 py-4">
          <div className="text-gray-900 dark:text-white">
            {user.email}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {user.phone}
          </div>
        </td>

        {/* Role */}
        <td className="px-6 py-4">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white bg-gradient-to-r ${getRoleColor(user.role)}`}>
            {user.role}
          </span>
        </td>

        {/* Status */}
        <td className="px-6 py-4">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
            {user.status}
          </span>
        </td>

        {/* Department */}
        <td className="px-6 py-4">
          <div className="text-gray-900 dark:text-white">
            {user.department}
          </div>
        </td>

        {/* Last Login */}
        <td className="px-6 py-4">
          <div className="text-gray-900 dark:text-white text-sm">
            {formatDate(user.lastLogin)}
          </div>
        </td>

        {/* Join Date */}
        <td className="px-6 py-4">
          <div className="text-gray-900 dark:text-white text-sm">
            {formatDate(user.joinDate)}
          </div>
        </td>

        {/* Orders */}
        <td className="px-6 py-4">
          <div className="text-gray-900 dark:text-white font-semibold">
            {ordersCount}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {formattedTotalSpent}
          </div>
        </td>

        {/* Actions */}
        {showActions && (
          <td className="px-6 py-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onEdit(user)}
                className="w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors"
                title="Edit user"
              >
                <i className="fas fa-edit text-xs"></i>
              </button>
              <button
                onClick={() => window.open(`mailto:${user.email}`)}
                className="w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors"
                title="Send email"
              >
                <i className="fas fa-envelope text-xs"></i>
              </button>
              <button
                onClick={() => onDelete(user.id)}
                className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                title="Delete user"
              >
                <i className="fas fa-trash text-xs"></i>
              </button>
            </div>
          </td>
        )}
      </tr>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      
      {/* Header */}
      <div className={`${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`}>
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                <i className="fas fa-users mr-3"></i>
                User Management Table
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Manage and monitor user accounts with advanced filtering and bulk actions
                {selectedUsers.size > 0 && (
                  <span className="ml-2 bg-blue-500/20 border border-blue-300 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full text-sm font-semibold">
                    {selectedUsers.size} selected
                  </span>
                )}
              </p>
            </div>
            
            {/* Bulk Actions */}
            {showBulkActions && selectedUsers.size > 0 && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-2xl transition-colors"
                >
                  <i className="fas fa-check mr-2"></i>
                  Activate
                </button>
                <button
                  onClick={() => handleBulkAction('deactivate')}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-2xl transition-colors"
                >
                  <i className="fas fa-pause mr-2"></i>
                  Deactivate
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-2xl transition-colors"
                >
                  <i className="fas fa-trash mr-2"></i>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className={`${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* Search */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  <i className="fas fa-search mr-2 text-blue-500"></i>
                  Search Users
                </label>
                <input
                  type="text"
                  placeholder="Search by name, email, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  <i className="fas fa-info-circle mr-2 text-green-500"></i>
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              {/* Role Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  <i className="fas fa-user-tag mr-2 text-purple-500"></i>
                  Role
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Roles</option>
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Editor">Editor</option>
                  <option value="User">User</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className={`${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl overflow-hidden shadow-2xl">
          
          {/* Table Stats */}
          <div className="p-6 border-b border-white/20 dark:border-gray-700/20">
            <div className="grid grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {filteredUsers.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {filteredUsers.filter(u => u.status === 'active').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {filteredUsers.filter(u => u.status === 'inactive').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Inactive</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {selectedUsers.size}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Selected</div>
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full">
              {renderTableHeader()}
              <tbody className="divide-y divide-white/10 dark:divide-gray-700/10">
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user, index) => renderTableRow(user, index))
                ) : (
                  <tr>
                    <td colSpan={allColumns.length + (showBulkActions ? 1 : 0)} className="px-6 py-12 text-center">
                      <div className="text-gray-500 dark:text-gray-400">
                        <i className="fas fa-users text-4xl mb-4"></i>
                        <p className="text-lg font-semibold">No users found</p>
                        <p className="text-sm">Try adjusting your search or filter criteria</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-white/20 dark:border-gray-700/20">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl flex items-center justify-center text-gray-900 dark:text-white hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <i className="fas fa-chevron-left text-sm"></i>
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-semibold transition-colors ${
                          currentPage === page
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/20 backdrop-blur-lg border border-white/30 text-gray-900 dark:text-white hover:bg-white/30'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl flex items-center justify-center text-gray-900 dark:text-white hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <i className="fas fa-chevron-right text-sm"></i>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Styles */}
    </div>
  );
};

export default UserTable;
