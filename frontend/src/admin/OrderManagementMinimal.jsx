import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    Search,
    ShoppingCart,
    MoreVertical,
    Eye,
    Truck,
    CheckCircle,
    Clock,
    XCircle,
    Calendar,
    X,
    Package,
    MapPin,
    CreditCard
} from 'lucide-react';
import { fetchAllOrders, updateOrderStatus } from '../redux/slices/orderSlice';
import { formatCurrency, formatDate } from '../utils/helpers';
import './styles/admin.css';

const OrderManagementMinimal = () => {
    const dispatch = useDispatch();
    const { adminOrders, loading } = useSelector((state) => state.order);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showOrderDetail, setShowOrderDetail] = useState(null);
    const [actionMenu, setActionMenu] = useState(null);

    useEffect(() => {
        dispatch(fetchAllOrders());
    }, [dispatch]);

    const orders = adminOrders?.items || [];

    const filteredOrders = useMemo(() => {
        let filtered = orders;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(o =>
                o.orderNumber?.toLowerCase().includes(term) ||
                o._id?.toLowerCase().includes(term) ||
                o.user?.name?.toLowerCase().includes(term) ||
                o.shippingAddress?.fullName?.toLowerCase().includes(term)
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(o => o.status === statusFilter);
        }

        return filtered;
    }, [orders, searchTerm, statusFilter]);

    const stats = useMemo(() => ({
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        processing: orders.filter(o => o.status === 'processing').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        totalRevenue: orders.reduce((acc, o) => acc + (o.totalPrice || 0), 0)
    }), [orders]);

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await dispatch(updateOrderStatus({ orderId, status: newStatus })).unwrap();
            toast.success(`Order status updated to ${newStatus}`);
            setActionMenu(null);
            dispatch(fetchAllOrders());
        } catch (error) {
            toast.error('Failed to update order status');
        }
    };

    const getStatusIcon = (status) => {
        const icons = {
            delivered: <CheckCircle size={12} />,
            pending: <Clock size={12} />,
            processing: <Truck size={12} />,
            cancelled: <XCircle size={12} />
        };
        return icons[status] || <Clock size={12} />;
    };

    const getStatusBadge = (status) => {
        const map = {
            delivered: 'success',
            pending: 'warning',
            processing: 'info',
            cancelled: 'danger'
        };
        return map[status] || 'neutral';
    };

    const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (loading && !orders.length) {
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
                        <h1 className="admin-page-title">Orders</h1>
                        <p className="admin-page-subtitle">Manage customer orders</p>
                    </div>
                    <div className="admin-page-actions">
                        <button className="admin-btn admin-btn-secondary">
                            <Calendar size={16} />
                            Today
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="admin-stats-grid">
                    <div className="admin-stat-card">
                        <div className="admin-stat-label"><ShoppingCart size={14} /> Total Orders</div>
                        <div className="admin-stat-value">{stats.total}</div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="admin-stat-label admin-text-warning">
                            <Clock size={14} /> Pending
                        </div>
                        <div className="admin-stat-value">{stats.pending}</div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="admin-stat-label" style={{ color: 'var(--admin-info)' }}>
                            <Truck size={14} /> Processing
                        </div>
                        <div className="admin-stat-value">{stats.processing}</div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="admin-stat-label admin-text-success">
                            <CheckCircle size={14} /> Delivered
                        </div>
                        <div className="admin-stat-value">{stats.delivered}</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="admin-filters">
                    <div className="admin-search" style={{ flex: 1, maxWidth: '300px' }}>
                        <Search />
                        <input
                            type="text"
                            className="admin-input"
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <select
                        className="admin-input admin-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ width: '140px' }}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>

                    <div style={{ marginLeft: 'auto' }}>
                        <span className="admin-text-muted" style={{ fontSize: '13px' }}>
                            Total Revenue: <strong style={{ color: 'var(--admin-text-primary)' }}>{formatCurrency(stats.totalRevenue)}</strong>
                        </span>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th style={{ width: '50px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <tr key={order._id}>
                                        <td style={{ fontWeight: 600 }}>
                                            #{order.orderNumber || order._id.slice(-6).toUpperCase()}
                                        </td>
                                        <td>
                                            <div>
                                                <div style={{ fontWeight: 500 }}>
                                                    {order.user?.name || order.shippingAddress?.fullName || 'Guest'}
                                                </div>
                                                <div style={{ fontSize: '12px', color: 'var(--admin-text-secondary)' }}>
                                                    {order.user?.email || order.shippingAddress?.email || '—'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="admin-text-muted">
                                            {order.createdAt ? formatDate(order.createdAt) : '—'}
                                        </td>
                                        <td>
                                            {order.orderItems?.length || 0} items
                                        </td>
                                        <td style={{ fontWeight: 600 }}>
                                            {formatCurrency(order.totalPrice)}
                                        </td>
                                        <td>
                                            <span className={`admin-badge admin-badge-${getStatusBadge(order.status)}`}>
                                                {getStatusIcon(order.status)}
                                                <span style={{ marginLeft: '4px' }}>{order.status}</span>
                                            </span>
                                        </td>
                                        <td>
                                            <div className="admin-dropdown">
                                                <button
                                                    className="admin-btn admin-btn-ghost admin-btn-icon"
                                                    onClick={() => setActionMenu(actionMenu === order._id ? null : order._id)}
                                                >
                                                    <MoreVertical size={16} />
                                                </button>
                                                {actionMenu === order._id && (
                                                    <div className="admin-dropdown-menu" style={{ minWidth: '180px' }}>
                                                        <button
                                                            className="admin-dropdown-item"
                                                            onClick={() => { setShowOrderDetail(order); setActionMenu(null); }}
                                                        >
                                                            <Eye size={14} /> View Details
                                                        </button>
                                                        <div style={{
                                                            padding: '8px 14px',
                                                            fontSize: '11px',
                                                            fontWeight: 600,
                                                            color: 'var(--admin-text-tertiary)',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            Update Status
                                                        </div>
                                                        {statuses.filter(s => s !== order.status).map(status => (
                                                            <button
                                                                key={status}
                                                                className="admin-dropdown-item"
                                                                onClick={() => handleUpdateStatus(order._id, status)}
                                                            >
                                                                {getStatusIcon(status)}
                                                                <span style={{ marginLeft: '4px', textTransform: 'capitalize' }}>{status}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7}>
                                        <div className="admin-empty">
                                            <ShoppingCart size={40} />
                                            <p className="admin-empty-title">No orders found</p>
                                            <p className="admin-empty-text">Orders will appear here when customers place them</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Detail Modal */}
            {showOrderDetail && (
                <div className="admin-modal-overlay" onClick={() => setShowOrderDetail(null)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="admin-modal-header">
                            <h3 className="admin-modal-title">
                                Order #{showOrderDetail.orderNumber || showOrderDetail._id.slice(-6).toUpperCase()}
                            </h3>
                            <button className="admin-btn admin-btn-ghost admin-btn-icon" onClick={() => setShowOrderDetail(null)}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="admin-modal-body">
                            {/* Status */}
                            <div style={{ marginBottom: '20px' }}>
                                <span className={`admin-badge admin-badge-${getStatusBadge(showOrderDetail.status)}`}>
                                    {getStatusIcon(showOrderDetail.status)}
                                    <span style={{ marginLeft: '4px' }}>{showOrderDetail.status}</span>
                                </span>
                                <span className="admin-text-muted" style={{ marginLeft: '12px', fontSize: '13px' }}>
                                    {showOrderDetail.createdAt ? formatDate(showOrderDetail.createdAt) : ''}
                                </span>
                            </div>

                            {/* Customer Info */}
                            <div className="admin-card" style={{ marginBottom: '16px' }}>
                                <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <MapPin size={14} /> Shipping Address
                                </h4>
                                <p style={{ margin: 0, fontSize: '13px', color: 'var(--admin-text-secondary)' }}>
                                    {showOrderDetail.shippingAddress?.fullName || showOrderDetail.user?.name}<br />
                                    {showOrderDetail.shippingAddress?.address}<br />
                                    {showOrderDetail.shippingAddress?.city}, {showOrderDetail.shippingAddress?.postalCode}<br />
                                    {showOrderDetail.shippingAddress?.country}
                                </p>
                            </div>

                            {/* Order Items */}
                            <div className="admin-card" style={{ marginBottom: '16px' }}>
                                <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Package size={14} /> Items ({showOrderDetail.orderItems?.length || 0})
                                </h4>
                                {showOrderDetail.orderItems?.map((item, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '8px 0',
                                        borderTop: idx > 0 ? '1px solid var(--admin-border)' : 'none'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: 'var(--admin-bg-primary)' }} />
                                            )}
                                            <div>
                                                <div style={{ fontWeight: 500, fontSize: '13px' }}>{item.name}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--admin-text-secondary)' }}>Qty: {item.qty}</div>
                                            </div>
                                        </div>
                                        <div style={{ fontWeight: 600, fontSize: '13px' }}>
                                            {formatCurrency(item.price * item.qty)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Payment Summary */}
                            <div className="admin-card">
                                <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <CreditCard size={14} /> Payment Summary
                                </h4>
                                <div style={{ fontSize: '13px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <span className="admin-text-muted">Subtotal</span>
                                        <span>{formatCurrency(showOrderDetail.itemsPrice || 0)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <span className="admin-text-muted">Shipping</span>
                                        <span>{formatCurrency(showOrderDetail.shippingPrice || 0)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <span className="admin-text-muted">Tax</span>
                                        <span>{formatCurrency(showOrderDetail.taxPrice || 0)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, paddingTop: '8px', borderTop: '1px solid var(--admin-border)' }}>
                                        <span>Total</span>
                                        <span>{formatCurrency(showOrderDetail.totalPrice)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="admin-btn admin-btn-secondary" onClick={() => setShowOrderDetail(null)}>
                                Close
                            </button>
                            <select
                                className="admin-input admin-select"
                                value={showOrderDetail.status}
                                onChange={(e) => {
                                    handleUpdateStatus(showOrderDetail._id, e.target.value);
                                    setShowOrderDetail({ ...showOrderDetail, status: e.target.value });
                                }}
                                style={{ width: '160px' }}
                            >
                                {statuses.map(status => (
                                    <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManagementMinimal;
