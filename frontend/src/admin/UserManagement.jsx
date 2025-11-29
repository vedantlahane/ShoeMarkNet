import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';


// Redux actions
import {
  fetchUsers,
  updateUser,
  deleteUser,
  bulkUpdateUsers,
  exportUsers
} from '../redux/slices/authSlice';
import userService from '../services/userService';

// Components
import LoadingSpinner from '../components/common/feedback/LoadingSpinner';

import ErrorMessage from '../components/common/feedback/ErrorMessage';
import Pagination from '../components/common/navigation/Pagination';
import UserCard from './users/UserCard';
import UserTable from './users/UserTable';
import UserModal from './users/UserModal';
import UserEditModal from './users/UserEditModal';
import UserFilters from './users/UserFilters';
import UserStats from './users/UserStats';
import BulkActionsPanel from './users/BulkActionsPanel';
import ExportModal from './users/ExportModal';
import ImportModal from './users/ImportModal';
import UserActivityModal from './users/UserActivityModal';
import RoleManagementModal from './users/RoleManagementModal';
import PageMeta from '../components/seo/PageMeta';

// Hooks
import useWebSocket from '../hooks/useWebSocket';
import useLocalStorage from '../hooks/useLocalStorage';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';
import usePermissions from '../hooks/usePermissions';

// Utils
import { trackEvent } from '../utils/analytics';
import { formatDate, getRelativeTime } from '../utils/helpers';
// import { validateUser, calculateLeadScore } from '../utils/userUtils';

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

const UserManagement = ({ realtimeData, onDataUpdate, isLoading, externalAction, onActionHandled }) => {
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
    searchTerm,
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

  useEffect(() => {
    if (!externalAction) {
      return;
    }

    if (externalAction.section && externalAction.section !== 'users') {
      onActionHandled?.(externalAction);
      return;
    }

    let handled = false;

    switch (externalAction.type) {
      case 'searchUsers': {
        const nextTerm = externalAction?.payload?.term || '';
        setSearchTerm(nextTerm);
        setCurrentPage(1);

        if (nextTerm && nextTerm !== searchTerm) {
          toast.info(`Filtering users for "${nextTerm}"`);
        }

        if (externalAction?.payload?.userId) {
          const targetUser = users?.items?.find((candidate) => candidate?._id === externalAction.payload.userId);
          if (targetUser) {
            setSelectedUser(targetUser);
            setShowUserModal(true);
          }
        }

        trackEvent('admin_users_search_applied', {
          query: nextTerm,
          source: 'global_search'
        });

        handled = true;
        break;
      }
      default:
        break;
    }

    if (!handled) {
      onActionHandled?.(externalAction);
      return;
    }

    onActionHandled?.(externalAction);
  }, [externalAction, onActionHandled, users, searchTerm]);

  // Load users data with filters
  const loadUsersData = useCallback(async () => {
    try {
      const params = {
        page: currentPage,
        limit: usersPerPage,
        sort: `${sortBy}:${sortOrder}`,
        ...(searchTerm && { search: searchTerm }),
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
    searchTerm,
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

  const handleBulkExport = useCallback(async (format = 'csv', options = {}) => {
    try {
      const includeSelectionOnly = options.includeSelectionOnly ?? selectedUsers.length > 0;
      const targetUsers = includeSelectionOnly ? users.filter(u => selectedUsers.includes(u._id)) : users;
      const exportData = await userService.exportUsers(targetUsers, format);
      
      const mimeType = format === 'json' ? 'application/json' : 'text/csv';
      const extension = format === 'json' ? 'json' : 'csv';
      const blob = new Blob([exportData], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `users-export-${new Date().toISOString().split('T')[0]}.${extension}`;
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

  const handleUserFormSubmit = useCallback(async (formValues, { mode }) => {
    if (mode === 'edit' && selectedUser) {
      await dispatch(updateUser({ id: selectedUser._id, userData: formValues })).unwrap();
      toast.success('User updated successfully');
      await loadUsersData();
      return;
    }

    toast.info('Admin user creation will be available soon. For now, register users via the public signup flow.');
    throw new Error('User creation is not supported yet');
  }, [dispatch, selectedUser, loadUsersData]);

  const handleImportUsers = useCallback(async (file, options) => {
    console.info('User import requested', { fileName: file?.name, options });
    await new Promise(resolve => setTimeout(resolve, 600));
    toast.success('User import queued successfully');
    await loadUsersData();
  }, [loadUsersData]);

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
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-10 text-center shadow-lg dark:border-slate-800 dark:bg-slate-900/80">
          <LoadingSpinner size="large" />
          <h3 className="mt-6 text-lg font-semibold text-slate-900 dark:text-slate-100">
            <i className="fa-solid fa-users mr-2 text-blue-500" />
            Loading users
          </h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Fetching user data and analytics…
          </p>
        </div>
      </div>
    );
  }

  if (error && !users) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <ErrorMessage
          message={error.message || 'Failed to load users'}
          onRetry={loadUsersData}
          className="mx-auto max-w-md"
        />
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="User Management | Admin Dashboard - ShoeMarkNet"
        description="Manage user accounts, roles, permissions, and user analytics with comprehensive admin tools."
        robots="noindex, nofollow"
      />

      <section className="space-y-6">
        <div className={`${animateCards ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  <i className="fa-solid fa-users-line text-blue-500" />
                  Users
                </div>
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">User Management</h1>
                <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <i className="fa-solid fa-user-gear" />
                  Manage user accounts, roles, and permissions
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    {isConnected ? 'Live updates enabled' : 'Offline'}
                  </span>
                  {refreshing && (
                    <span className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400">
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                      Refreshing…
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-400 hover:text-blue-600 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-500"
                  title="Refresh users"
                >
                  <i className={`fa-solid fa-arrow-rotate-right ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 dark:focus:ring-offset-slate-900"
                >
                  <i className="fa-solid fa-file-arrow-up" />
                  Import
                </button>
                <button
                  onClick={() => setShowExportModal(true)}
                  className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1 dark:focus:ring-offset-slate-900"
                >
                  <i className="fa-solid fa-file-arrow-down" />
                  Export
                </button>
                {hasPermission('users.create') && (
                  <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-slate-900"
                  >
                    <i className="fa-solid fa-user-plus" />
                    Add user
                  </button>
                )}
              </div>
            </div>
          </header>
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
          <div className={`${animateCards ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                <i className="fa-solid fa-users text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                  ? 'No users match your filters'
                  : 'No users found'}
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                  ? 'Adjust your filters or search query to see more results.'
                  : 'Users will appear here after they register on the platform.'}
              </p>
              <div className="mt-6 flex justify-center gap-3">
                {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' ? (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setRoleFilter('all');
                      setStatusFilter('all');
                      setDateRange({ start: '', end: '' });
                      setLeadScoreRange({ min: 0, max: 100 });
                      setLocationFilter('');
                    }}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-500"
                  >
                    <i className="fa-solid fa-xmark" />
                    Clear filters
                  </button>
                ) : hasPermission('users.create') && (
                  <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                  >
                    <i className="fa-solid fa-user-plus" />
                    Add your first user
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
                  className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
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
            onSave={handleUserFormSubmit}
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
              await handleBulkExport(format, options);
              toast.success(`Users exported as ${format.toUpperCase()}`);
            }}
          />
        )}

        {showImportModal && (
          <ImportModal
            onClose={() => setShowImportModal(false)}
            onImport={handleImportUsers}
          />
        )}

        {showDeleteConfirm && userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
                  <i className="fa-solid fa-triangle-exclamation text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Delete user account?</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Are you sure you want to delete <strong>{userToDelete.name}</strong>? This action cannot be undone and removes all associated data.
                </p>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setUserToDelete(null);
                    }}
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-500"
                  >
                    <i className="fa-solid fa-xmark" />
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteUser}
                    className="flex-1 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
                  >
                    <i className="fa-solid fa-trash" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </section>
    </>
  );
};

export default UserManagement;
