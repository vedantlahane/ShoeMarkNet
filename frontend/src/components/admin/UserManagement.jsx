import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import PageMeta from '../seo/PageMeta';

// Redux actions
import { 
  fetchUsers, 
  updateUser, 
  deleteUser, 
  bulkUpdateUsers,
  exportUsers,
  clearError as clearUserError 
} from '../../redux/slices/authSlice';
import userService from '../../services/userService';

// Components
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorBoundary from '../common/ErrorBoundary';
import ErrorMessage from '../common/ErrorMessage';
import Pagination from '../common/Pagination';
import UserCard from './users/UserCard';
import UserTable from './users/UserTable';
// import UserModal from './users/UserModal';
// import UserEditModal from './users/UserEditModal';
// import UserFilters from './users/UserFilters';
// import UserStats from './users/UserStats';
// import BulkActionsPanel from './users/BulkActionsPanel';
// import ExportModal from './users/ExportModal';
// import ImportModal from './users/ImportModal';
// import UserActivityModal from './users/UserActivityModal';
// import RoleManagementModal from './users/RoleManagementModal';

// Hooks
import useWebSocket from '../../hooks/useWebSocket';
import useLocalStorage from '../../hooks/useLocalStorage';
import useDebounce from '../../hooks/useDebounce';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';
import usePermissions from '../../hooks/usePermissions';

// Utils
import { trackEvent } from '../../utils/analytics';
import { formatDate, getRelativeTime } from '../../utils/helpers';
// import { validateUser, calculateLeadScore } from '../../utils/userUtils';

// Constants
const USER_ROLES = [
  { value: 'user', label: 'Regular User', icon: 'fa-user', color: 'from-blue-500 to-blue-600' },
  { value: 'admin', label: 'Administrator', icon: 'fa-user-shield', color: 'from-purple-500 to-purple-600' },
  { value: 'moderator', label: 'Moderator', icon: 'fa-user-cog', color: 'from-green-500 to-green-600' },
  { value: 'editor', label: 'Editor', icon: 'fa-user-edit', color: 'from-orange-500 to-orange-600' }
];

const STATUS_FILTERS = [
  { value: 'all', label: 'All Users', icon: 'fa-users' },
  { value: 'active', label: 'Active', icon: 'fa-user-check' },
  { value: 'inactive', label: 'Inactive', icon: 'fa-user-times' },
  { value: 'verified', label: 'Verified', icon: 'fa-user-shield' },
  { value: 'unverified', label: 'Unverified', icon: 'fa-user-clock' },
  { value: 'banned', label: 'Banned', icon: 'fa-user-slash' }
];

const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Newest First', icon: 'fa-clock' },
  { value: 'createdAt-asc', label: 'Oldest First', icon: 'fa-history' },
  { value: 'name-asc', label: 'Name A-Z', icon: 'fa-sort-alpha-up' },
  { value: 'name-desc', label: 'Name Z-A', icon: 'fa-sort-alpha-down' },
  { value: 'lastLogin-desc', label: 'Recent Login', icon: 'fa-sign-in-alt' },
  { value: 'leadScore-desc', label: 'Highest Score', icon: 'fa-chart-line' },
  { value: 'leadScore-asc', label: 'Lowest Score', icon: 'fa-chart-line' }
];

const BULK_ACTIONS = [
  { id: 'activate', label: 'Activate Users', icon: 'fa-user-check', color: 'from-green-600 to-emerald-600' },
  { id: 'deactivate', label: 'Deactivate Users', icon: 'fa-user-times', color: 'from-orange-600 to-red-600' },
  { id: 'verify', label: 'Verify Users', icon: 'fa-user-shield', color: 'from-blue-600 to-cyan-600' },
  { id: 'unverify', label: 'Unverify Users', icon: 'fa-user-clock', color: 'from-yellow-600 to-orange-600' },
  { id: 'changeRole', label: 'Change Role', icon: 'fa-user-cog', color: 'from-purple-600 to-pink-600' },
  { id: 'export', label: 'Export Selected', icon: 'fa-download', color: 'from-indigo-600 to-purple-600' },
  { id: 'delete', label: 'Delete Users', icon: 'fa-trash', color: 'from-red-600 to-pink-600' }
];

const USERS_PER_PAGE_OPTIONS = [12, 24, 48, 96];

const UserManagement = ({ stats, realtimeData, onDataUpdate, isLoading }) => {
  const dispatch = useDispatch();

  // Redux state
  const { users, loading, error, pagination } = useSelector(state => state.auth);
  const { user: currentUser } = useSelector(state => state.auth);

  // Permissions
  const { hasPermission, userRole } = usePermissions();

  // WebSocket for real-time updates
  const { isConnected, lastMessage } = useWebSocket('/admin/users');

  // Local state with persistence
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useLocalStorage('userRoleFilter', 'all');
  const [statusFilter, setStatusFilter] = useLocalStorage('userStatusFilter', 'all');
  const [sortBy, setSortBy] = useLocalStorage('userSortBy', 'createdAt');
  const [sortOrder, setSortOrder] = useLocalStorage('userSortOrder', 'desc');
  const [viewMode, setViewMode] = useLocalStorage('userViewMode', 'cards');
  const [usersPerPage, setUsersPerPage] = useLocalStorage('usersPerPage', 12);
  const [currentPage, setCurrentPage] = useState(1);

  // UI state
  const [animateCards, setAnimateCards] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  // Advanced filtering state
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [leadScoreRange, setLeadScoreRange] = useState({ min: 0, max: 100 });
  const [locationFilter, setLocationFilter] = useState('');

  // Refs
  const tableRef = useRef(null);
  const searchInputRef = useRef(null);

  // Debounced search
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'ctrl+n': () => hasPermission('users.create') && openCreateModal(),
    'ctrl+r': () => handleRefresh(),
    'ctrl+e': () => setShowExportModal(true),
    'ctrl+i': () => setShowImportModal(true),
    'ctrl+f': () => searchInputRef.current?.focus(),
    'delete': () => selectedUsers.length > 0 && handleBulkAction('delete'),
    'escape': () => {
      setSelectedUsers([]);
      setShowUserModal(false);
      setShowEditModal(false);
    }
  });

  // Initialize component
  useEffect(() => {
    setTimeout(() => setAnimateCards(true), 100);
    loadUsersData();
    
    trackEvent('admin_users_viewed', {
      user_id: currentUser?._id,
      user_role: userRole,
      timestamp: new Date().toISOString()
    });
  }, []);

  // Handle real-time updates
  useEffect(() => {
    if (lastMessage && isConnected) {
      const data = JSON.parse(lastMessage.data);
      if (data.type === 'user_update') {
        handleRealTimeUserUpdate(data.payload);
      }
    }
  }, [lastMessage, isConnected]);

  // Load data when filters change
  useEffect(() => {
    setCurrentPage(1);
    loadUsersData();
  }, [
    debouncedSearchTerm,
    roleFilter,
    statusFilter,
    sortBy,
    sortOrder,
    dateRange,
    leadScoreRange,
    locationFilter
  ]);

  // Load data when page changes
  useEffect(() => {
    loadUsersData();
  }, [currentPage, usersPerPage]);

  // Load users data with filters
  const loadUsersData = useCallback(async () => {
    try {
      const params = {
        page: currentPage,
        limit: usersPerPage,
        sort: `${sortBy}:${sortOrder}`,
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(roleFilter !== 'all' && { role: roleFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(dateRange.start && { startDate: dateRange.start }),
        ...(dateRange.end && { endDate: dateRange.end }),
        ...(leadScoreRange.min > 0 && { minLeadScore: leadScoreRange.min }),
        ...(leadScoreRange.max < 100 && { maxLeadScore: leadScoreRange.max }),
        ...(locationFilter && { location: locationFilter })
      };

      await dispatch(fetchUsers(params));
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    }
  }, [
    dispatch,
    currentPage,
    usersPerPage,
    sortBy,
    sortOrder,
    debouncedSearchTerm,
    roleFilter,
    statusFilter,
    dateRange,
    leadScoreRange,
    locationFilter
  ]);

  // Handle real-time user updates
  const handleRealTimeUserUpdate = useCallback((updatedUser) => {
    toast.info(`User "${updatedUser.name}" has been updated`);
    if (onDataUpdate) {
      onDataUpdate(updatedUser);
    }
  }, [onDataUpdate]);

  // Enhanced user statistics
  const userStats = useMemo(() => {
    if (!users) return {};

    const totalUsers = users.length;
    const adminUsers = users.filter(u => u.role === 'admin').length;
    const regularUsers = users.filter(u => u.role === 'user').length;
    const verifiedUsers = users.filter(u => u.isVerified).length;
    const activeUsers = users.filter(u => u.isActive !== false).length;
    const bannedUsers = users.filter(u => u.status === 'banned').length;
    
    const avgLeadScore = totalUsers > 0 
      ? users.reduce((sum, u) => sum + (u.leadScore || 0), 0) / totalUsers 
      : 0;

    const newUsersThisMonth = users.filter(u => {
      const userDate = new Date(u.createdAt);
      const thisMonth = new Date();
      thisMonth.setDate(1);
      return userDate >= thisMonth;
    }).length;

    const activeLastWeek = users.filter(u => {
      if (!u.lastLogin) return false;
      const lastLogin = new Date(u.lastLogin);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return lastLogin >= oneWeekAgo;
    }).length;

    return {
      totalUsers,
      adminUsers,
      regularUsers,
      verifiedUsers,
      activeUsers,
      bannedUsers,
      avgLeadScore: avgLeadScore.toFixed(1),
      newUsersThisMonth,
      activeLastWeek,
      inactiveUsers: totalUsers - activeUsers
    };
  }, [users]);

  // Enhanced handlers
  const handleRoleUpdate = useCallback(async (userId, newRole) => {
    if (!hasPermission('users.updateRole')) {
      toast.error('You don\'t have permission to update user roles');
      return;
    }

    try {
      await dispatch(updateUser({ id: userId, userData: { role: newRole } })).unwrap();
      toast.success(`User role updated to ${newRole}`);
      
      trackEvent('user_role_updated', {
        user_id: userId,
        new_role: newRole,
        updated_by: currentUser?._id
      });
    } catch (error) {
      toast.error(error.message || 'Failed to update user role');
    }
  }, [dispatch, hasPermission, currentUser]);

  const handleStatusUpdate = useCallback(async (userId, field, value) => {
    if (!hasPermission('users.update')) {
      toast.error('You don\'t have permission to update users');
      return;
    }

    try {
      await dispatch(updateUser({ id: userId, userData: { [field]: value } })).unwrap();
      toast.success('User status updated successfully');
      
      trackEvent('user_status_updated', {
        user_id: userId,
        field,
        value,
        updated_by: currentUser?._id
      });
    } catch (error) {
      toast.error(error.message || 'Failed to update user status');
    }
  }, [dispatch, hasPermission, currentUser]);

  const handleDeleteUser = useCallback((user) => {
    if (!hasPermission('users.delete')) {
      toast.error('You don\'t have permission to delete users');
      return;
    }

    setUserToDelete(user);
    setShowDeleteConfirm(true);
  }, [hasPermission]);

  const confirmDeleteUser = useCallback(async () => {
    if (!userToDelete) return;

    try {
      await dispatch(deleteUser(userToDelete._id)).unwrap();
      toast.success(`User "${userToDelete.name}" deleted successfully`);
      
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      
      trackEvent('user_deleted', {
        user_id: userToDelete._id,
        user_name: userToDelete.name,
        deleted_by: currentUser?._id
      });
    } catch (error) {
      toast.error(error.message || 'Failed to delete user');
    }
  }, [dispatch, userToDelete, currentUser]);

  const handleBulkAction = useCallback(async (action) => {
    if (selectedUsers.length === 0) {
      toast.warning('Please select users first');
      return;
    }

    const actionLabels = {
      activate: 'activate',
      deactivate: 'deactivate',
      verify: 'verify',
      unverify: 'unverify',
      changeRole: 'change role for',
      export: 'export',
      delete: 'delete'
    };

    const confirmMessage = action === 'delete'
      ? `Are you sure you want to delete ${selectedUsers.length} user(s)?\n\nThis action cannot be undone and will permanently remove all selected users and their data.`
      : `Are you sure you want to ${actionLabels[action]} ${selectedUsers.length} user(s)?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      const loadingToast = toast.loading(`Processing ${selectedUsers.length} users...`);

      switch (action) {
        case 'activate':
          await dispatch(bulkUpdateUsers({
            userIds: selectedUsers,
            updates: { isActive: true }
          })).unwrap();
          break;
        
        case 'deactivate':
          await dispatch(bulkUpdateUsers({
            userIds: selectedUsers,
            updates: { isActive: false }
          })).unwrap();
          break;
        
        case 'verify':
          await dispatch(bulkUpdateUsers({
            userIds: selectedUsers,
            updates: { isVerified: true }
          })).unwrap();
          break;
        
        case 'unverify':
          await dispatch(bulkUpdateUsers({
            userIds: selectedUsers,
            updates: { isVerified: false }
          })).unwrap();
          break;
        
        case 'export':
          await handleBulkExport();
          break;
        
        case 'delete':
          const deletePromises = selectedUsers.map(id => dispatch(deleteUser(id)));
          await Promise.all(deletePromises);
          break;
        
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      toast.dismiss(loadingToast);
      toast.success(`Successfully ${actionLabels[action]}d ${selectedUsers.length} user(s)!`);
      
      setSelectedUsers([]);
      
      trackEvent('bulk_user_action', {
        action,
        user_count: selectedUsers.length,
        performed_by: currentUser?._id
      });
      
    } catch (error) {
      toast.error(`Bulk ${action} failed: ${error.message}`);
    }
  }, [selectedUsers, dispatch, currentUser]);

  const handleBulkExport = useCallback(async () => {
    try {
      const selectedUsersData = users.filter(u => selectedUsers.includes(u._id));
      const exportData = await userService.exportUsers(selectedUsersData, 'csv');
      
      const blob = new Blob([exportData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `selected-users-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to export users');
    }
  }, [selectedUsers, users]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadUsersData().finally(() => setRefreshing(false));
    
    trackEvent('users_refreshed', {
      user_id: currentUser?._id
    });
  }, [loadUsersData, currentUser]);

  const handleUserSelect = useCallback((userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    const currentUserIds = users?.map(user => user._id) || [];
    setSelectedUsers(prev => 
      prev.length === currentUserIds.length ? [] : currentUserIds
    );
  }, [users]);

  const openCreateModal = useCallback(() => {
    setSelectedUser(null);
    setShowEditModal(true);
    
    trackEvent('user_create_modal_opened', {
      user_id: currentUser?._id
    });
  }, [currentUser]);

  const openEditModal = useCallback((user) => {
    setSelectedUser(user);
    setShowEditModal(true);
    
    trackEvent('user_edit_modal_opened', {
      target_user_id: user._id,
      user_id: currentUser?._id
    });
  }, [currentUser]);

  const openUserDetails = useCallback((user) => {
    setSelectedUser(user);
    setShowUserModal(true);
    
    trackEvent('user_details_viewed', {
      target_user_id: user._id,
      user_id: currentUser?._id
    });
  }, [currentUser]);

  // Utility functions
  const getUserStatusColor = useCallback((user) => {
    if (user.status === 'banned') return 'from-red-500 to-red-600';
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

  const getUserStatusLabel = useCallback((user) => {
    if (user.status === 'banned') return 'Banned';
    if (user.isActive === false) return 'Inactive';
    if (user.isVerified) return 'Verified';
    return 'Active';
  }, []);

  // Loading state
  if (isLoading || (loading && !users)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="flex justify-center items-center h-96">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-12 text-center shadow-2xl">
            <LoadingSpinner size="large" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 mt-6">
              <i className="fas fa-users mr-2 text-blue-500"></i>
              Loading Users
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Fetching user data and analytics...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !users) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <ErrorMessage
          message={error.message || 'Failed to load users'}
          onRetry={loadUsersData}
          className="max-w-md mx-auto"
        />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <PageMeta
        title="User Management | Admin Dashboard - ShoeMarkNet"
        description="Manage user accounts, roles, permissions, and user analytics with comprehensive admin tools."
        robots="noindex, nofollow"
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        
        {/* Enhanced Header */}
        <div className={`mb-8 ${animateCards ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    <i className="fas fa-users mr-3"></i>
                    User Management
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-lg flex items-center">
                    <i className="fas fa-user-cog mr-2"></i>
                    Manage user accounts, roles, and permissions
                    {isConnected && (
                      <span className="ml-4 flex items-center text-green-600 dark:text-green-400">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                        Live Updates
                      </span>
                    )}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="bg-white/20 backdrop-blur-lg border border-white/30 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-2xl hover:bg-white/30 transition-all duration-200 disabled:opacity-50"
                    title="Refresh Users"
                  >
                    <i className={`fas fa-sync-alt mr-2 ${refreshing ? 'animate-spin' : ''}`}></i>
                    Refresh
                  </button>
                  <button
                    onClick={() => setShowImportModal(true)}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105"
                  >
                    <i className="fas fa-file-import mr-2"></i>
                    Import
                  </button>
                  <button
                    onClick={() => setShowExportModal(true)}
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105"
                  >
                    <i className="fas fa-file-export mr-2"></i>
                    Export
                  </button>
                  {hasPermission('users.create') && (
                    <button
                      onClick={openCreateModal}
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105"
                    >
                      <i className="fas fa-user-plus mr-2"></i>
                      Add User
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats */}
        <UserStats 
          stats={userStats}
          realtimeData={realtimeData}
          animateCards={animateCards}
          className="mb-8"
        />

        {/* Enhanced Filters */}
        <UserFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={(field, order) => {
            setSortBy(field);
            setSortOrder(order);
          }}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          usersPerPage={usersPerPage}
          onUsersPerPageChange={setUsersPerPage}
          selectedCount={selectedUsers.length}
          totalCount={users?.length || 0}
          onSelectAll={handleSelectAll}
          onClearSelection={() => setSelectedUsers([])}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          leadScoreRange={leadScoreRange}
          onLeadScoreRangeChange={setLeadScoreRange}
          locationFilter={locationFilter}
          onLocationFilterChange={setLocationFilter}
          roleFilters={USER_ROLES}
          statusFilters={STATUS_FILTERS}
          sortOptions={SORT_OPTIONS}
          perPageOptions={USERS_PER_PAGE_OPTIONS}
          animateCards={animateCards}
          className="mb-8"
          searchInputRef={searchInputRef}
        />

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <BulkActionsPanel
            selectedCount={selectedUsers.length}
            actions={BULK_ACTIONS}
            onBulkAction={handleBulkAction}
            onClearSelection={() => setSelectedUsers([])}
            animateCards={animateCards}
            className="mb-8"
          />
        )}

        {/* Users Display */}
        {!users || users.length === 0 ? (
          /* Enhanced Empty State */
          <div className={`${animateCards ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-12 text-center shadow-2xl">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <i className="fas fa-users text-4xl text-white"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {debouncedSearchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                  ? 'No Users Match Your Filters'
                  : 'No Users Found'
                }
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                {debouncedSearchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your search criteria or filters to find what you\'re looking for.'
                  : 'Users will appear here when they register for your platform.'
                }
              </p>
              <div className="flex justify-center space-x-4">
                {(debouncedSearchTerm || roleFilter !== 'all' || statusFilter !== 'all') ? (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setRoleFilter('all');
                      setStatusFilter('all');
                      setDateRange({ start: '', end: '' });
                      setLeadScoreRange({ min: 0, max: 100 });
                      setLocationFilter('');
                    }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-200"
                  >
                    <i className="fas fa-times mr-2"></i>
                    Clear Filters
                  </button>
                ) : hasPermission('users.create') && (
                  <button
                    onClick={openCreateModal}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 transform hover:scale-105"
                  >
                    <i className="fas fa-user-plus mr-3"></i>
                    Add Your First User
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Loading overlay */}
            {(loading || refreshing) && users && (
              <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
                <LoadingSpinner size="medium" message="Updating users..." />
              </div>
            )}

            {viewMode === 'cards' ? (
              /* Enhanced Cards View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {users.map((user, index) => (
                  <UserCard
                    key={user._id}
                    user={user}
                    index={index}
                    isSelected={selectedUsers.includes(user._id)}
                    statusInfo={{
                      color: getUserStatusColor(user),
                      label: getUserStatusLabel(user)
                    }}
                    leadScoreColor={getLeadScoreColor(user.leadScore || 0)}
                    onSelect={() => handleUserSelect(user._id)}
                    onEdit={() => openEditModal(user)}
                    onDelete={() => handleDeleteUser(user)}
                    onViewDetails={() => openUserDetails(user)}
                    onViewActivity={() => {
                      setSelectedUser(user);
                      setShowActivityModal(true);
                    }}
                    onRoleUpdate={handleRoleUpdate}
                    onStatusUpdate={handleStatusUpdate}
                    formatDate={formatDate}
                    getRelativeTime={getRelativeTime}
                    userRoles={USER_ROLES}
                    animateCards={animateCards}
                    hasPermission={hasPermission}
                  />
                ))}
              </div>
            ) : (
              /* Enhanced Table View */
              <UserTable
                users={users}
                selectedUsers={selectedUsers}
                onSelect={handleUserSelect}
                onSelectAll={handleSelectAll}
                onEdit={openEditModal}
                onDelete={handleDeleteUser}
                onViewDetails={openUserDetails}
                onViewActivity={(user) => {
                  setSelectedUser(user);
                  setShowActivityModal(true);
                }}
                onRoleUpdate={handleRoleUpdate}
                onStatusUpdate={handleStatusUpdate}
                getUserStatusColor={getUserStatusColor}
                getUserStatusLabel={getUserStatusLabel}
                getLeadScoreColor={getLeadScoreColor}
                formatDate={formatDate}
                getRelativeTime={getRelativeTime}
                userRoles={USER_ROLES}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={(field) => {
                  const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
                  setSortBy(field);
                  setSortOrder(newOrder);
                }}
                animateCards={animateCards}
                hasPermission={hasPermission}
                tableRef={tableRef}
                className="mb-8"
              />
            )}

            {/* Enhanced Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className={`${animateCards ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.8s' }}>
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={setCurrentPage}
                  showInfo={true}
                  totalItems={pagination.totalItems}
                  itemsPerPage={usersPerPage}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl shadow-2xl"
                />
              </div>
            )}
          </>
        )}

        {/* Modals */}
        {showUserModal && selectedUser && (
          <UserModal
            user={selectedUser}
            onClose={() => {
              setShowUserModal(false);
              setSelectedUser(null);
            }}
            onEdit={() => {
              setShowUserModal(false);
              openEditModal(selectedUser);
            }}
            onViewActivity={() => {
              setShowUserModal(false);
              setShowActivityModal(true);
            }}
            getUserStatusColor={getUserStatusColor}
            getUserStatusLabel={getUserStatusLabel}
            getLeadScoreColor={getLeadScoreColor}
            formatDate={formatDate}
            getRelativeTime={getRelativeTime}
            userRoles={USER_ROLES}
          />
        )}

        {showEditModal && (
          <UserEditModal
            user={selectedUser}
            isEditing={!!selectedUser}
            onClose={() => {
              setShowEditModal(false);
              setSelectedUser(null);
            }}
            onSave={() => {
              setShowEditModal(false);
              setSelectedUser(null);
              loadUsersData();
            }}
            userRoles={USER_ROLES}
            hasPermission={hasPermission}
          />
        )}

        {showActivityModal && selectedUser && (
          <UserActivityModal
            user={selectedUser}
            onClose={() => {
              setShowActivityModal(false);
              setSelectedUser(null);
            }}
          />
        )}

        {showRoleModal && (
          <RoleManagementModal
            onClose={() => setShowRoleModal(false)}
            userRoles={USER_ROLES}
            hasPermission={hasPermission}
          />
        )}

        {showExportModal && (
          <ExportModal
            onClose={() => setShowExportModal(false)}
            users={users}
            selectedUsers={selectedUsers}
            onExport={async (format, options) => {
              // Export logic here
              toast.success(`Users exported as ${format.toUpperCase()}`);
            }}
          />
        )}

        {showImportModal && (
          <ImportModal
            onClose={() => setShowImportModal(false)}
            onImport={async (file, options) => {
              // Import logic here
              toast.success('Users imported successfully');
              loadUsersData();
            }}
          />
        )}

        {showDeleteConfirm && userToDelete && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl w-full max-w-md shadow-2xl animate-fade-in">
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <i className="fas fa-exclamation-triangle text-white text-2xl"></i>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Delete User Account?
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to delete "<strong>{userToDelete.name}</strong>"?
                  <br />
                  <span className="text-sm">This action cannot be undone and will permanently remove all user data.</span>
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

      </div>
          
    </ErrorBoundary>
  );
};

export default UserManagement;
