import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    Search,
    Users,
    UserPlus,
    MoreVertical,
    Shield,
    User,
    CheckCircle,
    XCircle,
    X,
    Mail,
    Calendar,
    Edit2,
    Trash2,
    Ban
} from 'lucide-react';
import { fetchUsers, updateUser, deleteUser } from '../redux/slices/authSlice';
import { formatDate } from '../utils/helpers';
import './styles/admin.css';

const UserManagementMinimal = () => {
    const dispatch = useDispatch();
    const { users, loading } = useSelector((state) => state.auth);

    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [actionMenu, setActionMenu] = useState(null);
    const [showUserDetail, setShowUserDetail] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'user',
        isActive: true
    });

    useEffect(() => {
        dispatch(fetchUsers());
    }, [dispatch]);

    const userList = Array.isArray(users) ? users : [];

    const filteredUsers = useMemo(() => {
        let filtered = userList;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(u =>
                u.name?.toLowerCase().includes(term) ||
                u.email?.toLowerCase().includes(term)
            );
        }

        if (roleFilter !== 'all') {
            filtered = filtered.filter(u => u.role === roleFilter);
        }

        return filtered;
    }, [userList, searchTerm, roleFilter]);

    const stats = useMemo(() => ({
        total: userList.length,
        admins: userList.filter(u => u.role === 'admin').length,
        active: userList.filter(u => u.isActive !== false).length,
        newThisMonth: userList.filter(u => {
            if (!u.createdAt) return false;
            const date = new Date(u.createdAt);
            const now = new Date();
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).length
    }), [userList]);

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name || '',
                email: user.email || '',
                role: user.role || 'user',
                isActive: user.isActive !== false
            });
        } else {
            setEditingUser(null);
            setFormData({
                name: '',
                email: '',
                role: 'user',
                isActive: true
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingUser(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email) {
            toast.error('Please fill in required fields');
            return;
        }

        try {
            if (editingUser) {
                await dispatch(updateUser({ id: editingUser._id, userData: formData })).unwrap();
                toast.success('User updated successfully');
            }
            handleCloseModal();
            dispatch(fetchUsers());
        } catch (error) {
            toast.error(error?.message || 'Failed to save user');
        }
    };

    const handleDelete = async (userId) => {
        try {
            await dispatch(deleteUser(userId)).unwrap();
            toast.success('User deleted');
            setShowDeleteConfirm(null);
            dispatch(fetchUsers());
        } catch (error) {
            toast.error('Failed to delete user');
        }
    };

    const handleToggleStatus = async (user) => {
        try {
            await dispatch(updateUser({
                id: user._id,
                userData: { isActive: !user.isActive }
            })).unwrap();
            toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
            dispatch(fetchUsers());
        } catch (error) {
            toast.error('Failed to update user status');
        }
    };

    const handleRoleChange = async (user, newRole) => {
        try {
            await dispatch(updateUser({
                id: user._id,
                userData: { role: newRole }
            })).unwrap();
            toast.success(`User role changed to ${newRole}`);
            setActionMenu(null);
            dispatch(fetchUsers());
        } catch (error) {
            toast.error('Failed to update user role');
        }
    };

    const toggleSelect = (id) => {
        setSelectedUsers(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    if (loading && !userList.length) {
        return (
            <div className="admin-root">
                <div className="admin-loading">
                    <div className="admin-spinner" />
                </div>
            </div>
        );
    }

    return (
        <div className="admin-root">
            <div className="admin-container">
                {/* Page Header */}
                <div className="admin-page-header admin-flex-between">
                    <div>
                        <h1 className="admin-page-title">Users</h1>
                        <p className="admin-page-subtitle">Manage user accounts</p>
                    </div>
                    <div className="admin-page-actions">
                        <button
                            className="admin-btn admin-btn-primary"
                            onClick={() => toast.info('User registration is handled through the signup form')}
                        >
                            <UserPlus size={16} />
                            Invite User
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="admin-stats-grid">
                    <div className="admin-stat-card">
                        <div className="admin-stat-label"><Users size={14} /> Total Users</div>
                        <div className="admin-stat-value">{stats.total}</div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="admin-stat-label"><Shield size={14} /> Admins</div>
                        <div className="admin-stat-value">{stats.admins}</div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="admin-stat-label admin-text-success">
                            <CheckCircle size={14} /> Active
                        </div>
                        <div className="admin-stat-value">{stats.active}</div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="admin-stat-label" style={{ color: 'var(--admin-info)' }}>
                            <UserPlus size={14} /> New This Month
                        </div>
                        <div className="admin-stat-value">{stats.newThisMonth}</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="admin-filters">
                    <div className="admin-search" style={{ flex: 1, maxWidth: '300px' }}>
                        <Search />
                        <input
                            type="text"
                            className="admin-input"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <select
                        className="admin-input admin-select"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        style={{ width: '140px' }}
                    >
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                    </select>
                </div>

                {/* Users Table */}
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th style={{ width: '40px' }}>
                                    <input type="checkbox" />
                                </th>
                                <th>User</th>
                                <th>Role</th>
                                <th>Joined</th>
                                <th>Status</th>
                                <th style={{ width: '50px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user._id}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.includes(user._id)}
                                                onChange={() => toggleSelect(user._id)}
                                            />
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div className="admin-avatar">
                                                    {user.avatar ? (
                                                        <img src={user.avatar} alt={user.name} />
                                                    ) : (
                                                        getInitials(user.name)
                                                    )}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 500 }}>{user.name || 'Unknown'}</div>
                                                    <div style={{ fontSize: '12px', color: 'var(--admin-text-secondary)' }}>
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`admin-badge ${user.role === 'admin' ? 'admin-badge-info' : 'admin-badge-neutral'}`}>
                                                {user.role === 'admin' ? <Shield size={10} /> : <User size={10} />}
                                                <span style={{ marginLeft: '4px' }}>{user.role}</span>
                                            </span>
                                        </td>
                                        <td className="admin-text-muted">
                                            {user.createdAt ? formatDate(user.createdAt) : '—'}
                                        </td>
                                        <td>
                                            <span className={`admin-badge ${user.isActive !== false ? 'admin-badge-success' : 'admin-badge-danger'}`}>
                                                {user.isActive !== false ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="admin-dropdown">
                                                <button
                                                    className="admin-btn admin-btn-ghost admin-btn-icon"
                                                    onClick={() => setActionMenu(actionMenu === user._id ? null : user._id)}
                                                >
                                                    <MoreVertical size={16} />
                                                </button>
                                                {actionMenu === user._id && (
                                                    <div className="admin-dropdown-menu">
                                                        <button
                                                            className="admin-dropdown-item"
                                                            onClick={() => { setShowUserDetail(user); setActionMenu(null); }}
                                                        >
                                                            <User size={14} /> View Profile
                                                        </button>
                                                        <button
                                                            className="admin-dropdown-item"
                                                            onClick={() => { handleOpenModal(user); setActionMenu(null); }}
                                                        >
                                                            <Edit2 size={14} /> Edit
                                                        </button>
                                                        <div style={{
                                                            padding: '8px 14px',
                                                            fontSize: '11px',
                                                            fontWeight: 600,
                                                            color: 'var(--admin-text-tertiary)',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            Change Role
                                                        </div>
                                                        <button
                                                            className="admin-dropdown-item"
                                                            onClick={() => handleRoleChange(user, user.role === 'admin' ? 'user' : 'admin')}
                                                        >
                                                            {user.role === 'admin' ? <User size={14} /> : <Shield size={14} />}
                                                            Make {user.role === 'admin' ? 'User' : 'Admin'}
                                                        </button>
                                                        <button
                                                            className="admin-dropdown-item"
                                                            onClick={() => handleToggleStatus(user)}
                                                        >
                                                            {user.isActive ? <Ban size={14} /> : <CheckCircle size={14} />}
                                                            {user.isActive ? 'Deactivate' : 'Activate'}
                                                        </button>
                                                        <button
                                                            className="admin-dropdown-item danger"
                                                            onClick={() => { setShowDeleteConfirm(user._id); setActionMenu(null); }}
                                                        >
                                                            <Trash2 size={14} /> Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6}>
                                        <div className="admin-empty">
                                            <Users size={40} />
                                            <p className="admin-empty-title">No users found</p>
                                            <p className="admin-empty-text">Try adjusting your search filters</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit User Modal */}
            {showModal && (
                <div className="admin-modal-overlay" onClick={handleCloseModal}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
                        <div className="admin-modal-header">
                            <h3 className="admin-modal-title">Edit User</h3>
                            <button className="admin-btn admin-btn-ghost admin-btn-icon" onClick={handleCloseModal}>
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="admin-modal-body">
                                <div className="admin-form-group">
                                    <label className="admin-form-label">Name</label>
                                    <input
                                        type="text"
                                        className="admin-input"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-form-label">Email</label>
                                    <input
                                        type="email"
                                        className="admin-input"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-form-label">Role</label>
                                    <select
                                        className="admin-input admin-select"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="admin-form-group">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            style={{ width: '16px', height: '16px' }}
                                        />
                                        <span className="admin-form-label" style={{ margin: 0 }}>Active Account</span>
                                    </label>
                                </div>
                            </div>
                            <div className="admin-modal-footer">
                                <button type="button" className="admin-btn admin-btn-secondary" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="admin-btn admin-btn-primary">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* User Detail Modal */}
            {showUserDetail && (
                <div className="admin-modal-overlay" onClick={() => setShowUserDetail(null)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
                        <div className="admin-modal-header">
                            <h3 className="admin-modal-title">User Profile</h3>
                            <button className="admin-btn admin-btn-ghost admin-btn-icon" onClick={() => setShowUserDetail(null)}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="admin-modal-body">
                            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                <div className="admin-avatar" style={{ width: '64px', height: '64px', fontSize: '24px', margin: '0 auto 12px' }}>
                                    {showUserDetail.avatar ? (
                                        <img src={showUserDetail.avatar} alt={showUserDetail.name} />
                                    ) : (
                                        getInitials(showUserDetail.name)
                                    )}
                                </div>
                                <h4 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 600 }}>{showUserDetail.name}</h4>
                                <span className={`admin-badge ${showUserDetail.role === 'admin' ? 'admin-badge-info' : 'admin-badge-neutral'}`}>
                                    {showUserDetail.role}
                                </span>
                            </div>

                            <div className="admin-card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                    <Mail size={14} style={{ color: 'var(--admin-text-secondary)' }} />
                                    <span style={{ fontSize: '13px' }}>{showUserDetail.email}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                    <Calendar size={14} style={{ color: 'var(--admin-text-secondary)' }} />
                                    <span style={{ fontSize: '13px' }}>Joined {showUserDetail.createdAt ? formatDate(showUserDetail.createdAt) : 'N/A'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {showUserDetail.isActive !== false ? (
                                        <CheckCircle size={14} style={{ color: 'var(--admin-success)' }} />
                                    ) : (
                                        <XCircle size={14} style={{ color: 'var(--admin-danger)' }} />
                                    )}
                                    <span style={{ fontSize: '13px' }}>{showUserDetail.isActive !== false ? 'Active' : 'Inactive'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="admin-btn admin-btn-secondary" onClick={() => setShowUserDetail(null)}>
                                Close
                            </button>
                            <button
                                className="admin-btn admin-btn-primary"
                                onClick={() => { handleOpenModal(showUserDetail); setShowUserDetail(null); }}
                            >
                                <Edit2 size={14} /> Edit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
                <div className="admin-modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div className="admin-modal-header">
                            <h3 className="admin-modal-title">Delete User</h3>
                            <button className="admin-btn admin-btn-ghost admin-btn-icon" onClick={() => setShowDeleteConfirm(null)}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="admin-modal-body">
                            <p style={{ color: 'var(--admin-text-secondary)', margin: 0 }}>
                                Are you sure you want to delete this user? This action cannot be undone.
                            </p>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="admin-btn admin-btn-secondary" onClick={() => setShowDeleteConfirm(null)}>
                                Cancel
                            </button>
                            <button className="admin-btn admin-btn-danger" onClick={() => handleDelete(showDeleteConfirm)}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagementMinimal;
