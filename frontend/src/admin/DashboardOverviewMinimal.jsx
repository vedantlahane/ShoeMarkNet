import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    TrendingUp,
    TrendingDown,
    Package,
    ShoppingCart,
    Users,
    DollarSign,
    Clock,
    AlertTriangle,
    ArrowUpRight,
    RefreshCw
} from 'lucide-react';
import { fetchAllOrders } from '../redux/slices/orderSlice';
import { fetchProducts } from '../redux/slices/productSlice';
import { fetchUsers } from '../redux/slices/authSlice';
import adminService from '../services/adminService';
import { formatCurrency, formatNumber, formatDate } from '../utils/helpers';
import './styles/admin.css';

const DashboardOverviewMinimal = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const { products } = useSelector((state) => state.product);
    const { adminOrders } = useSelector((state) => state.order);
    const { users } = useSelector((state) => state.auth);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([
                dispatch(fetchProducts({ limit: 100 })),
                dispatch(fetchAllOrders()),
                dispatch(fetchUsers())
            ]);
            setLoading(false);
        };
        loadData();
    }, [dispatch]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([
            dispatch(fetchProducts({ limit: 100 })),
            dispatch(fetchAllOrders()),
            dispatch(fetchUsers())
        ]);
        setRefreshing(false);
    };

    const orders = adminOrders?.items || [];
    const productList = Array.isArray(products) ? products : [];
    const userList = Array.isArray(users) ? users : [];

    const stats = useMemo(() => {
        const totalRevenue = orders.reduce((acc, o) => acc + (o.totalPrice || 0), 0);
        return {
            revenue: totalRevenue,
            orders: orders.length,
            products: productList.length,
            users: userList.length,
            pendingOrders: orders.filter(o => o.status === 'pending').length,
            lowStockProducts: productList.filter(p => p.countInStock < 10).length
        };
    }, [orders, productList, userList]);

    const recentOrders = useMemo(() => {
        return [...orders]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
    }, [orders]);

    const lowStockProducts = useMemo(() => {
        return productList
            .filter(p => p.countInStock < 10)
            .sort((a, b) => a.countInStock - b.countInStock)
            .slice(0, 5);
    }, [productList]);

    const getStatusBadge = (status) => {
        const map = {
            delivered: 'success',
            pending: 'warning',
            processing: 'info',
            cancelled: 'danger'
        };
        return map[status] || 'neutral';
    };

    const StatCard = ({ icon: Icon, label, value, trend, prefix = '', color }) => (
        <div className="admin-stat-card">
            <div className="admin-stat-label" style={color ? { color } : {}}>
                <Icon size={14} />
                {label}
            </div>
            <div className="admin-stat-value">
                {loading ? '—' : `${prefix}${formatNumber(value)}`}
            </div>
            {trend !== undefined && (
                <div className={`admin-stat-trend ${trend >= 0 ? 'up' : 'down'}`}>
                    {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    <span>{Math.abs(trend)}% vs last month</span>
                </div>
            )}
        </div>
    );

    return (
        <div className="admin-root">
            <div className="admin-container">
                {/* Page Header */}
                <div className="admin-page-header admin-flex-between">
                    <div>
                        <h1 className="admin-page-title">Dashboard</h1>
                        <p className="admin-page-subtitle">Overview of your store performance</p>
                    </div>
                    <div className="admin-page-actions">
                        <button
                            className="admin-btn admin-btn-secondary"
                            onClick={handleRefresh}
                            disabled={refreshing}
                        >
                            <RefreshCw size={16} className={refreshing ? 'spinning' : ''} />
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="admin-stats-grid">
                    <StatCard
                        icon={DollarSign}
                        label="Revenue"
                        value={stats.revenue}
                        prefix="$"
                        trend={12.5}
                    />
                    <StatCard
                        icon={ShoppingCart}
                        label="Orders"
                        value={stats.orders}
                        trend={8.2}
                    />
                    <StatCard
                        icon={Package}
                        label="Products"
                        value={stats.products}
                    />
                    <StatCard
                        icon={Users}
                        label="Customers"
                        value={stats.users}
                        trend={15.3}
                    />
                </div>

                {/* Alerts */}
                {(stats.pendingOrders > 0 || stats.lowStockProducts > 0) && (
                    <div className="admin-grid-2" style={{ marginBottom: '24px' }}>
                        {stats.pendingOrders > 0 && (
                            <div className="admin-card" style={{
                                background: 'var(--admin-warning-bg)',
                                border: '1px solid rgba(245, 158, 11, 0.3)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Clock size={20} style={{ color: 'var(--admin-warning)' }} />
                                    <div>
                                        <div style={{ fontWeight: 600, color: 'var(--admin-warning)' }}>
                                            {stats.pendingOrders} Pending Orders
                                        </div>
                                        <div style={{ fontSize: '13px', color: 'var(--admin-text-secondary)' }}>
                                            Orders waiting to be processed
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {stats.lowStockProducts > 0 && (
                            <div className="admin-card" style={{
                                background: 'var(--admin-danger-bg)',
                                border: '1px solid rgba(239, 68, 68, 0.3)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <AlertTriangle size={20} style={{ color: 'var(--admin-danger)' }} />
                                    <div>
                                        <div style={{ fontWeight: 600, color: 'var(--admin-danger)' }}>
                                            {stats.lowStockProducts} Low Stock Items
                                        </div>
                                        <div style={{ fontSize: '13px', color: 'var(--admin-text-secondary)' }}>
                                            Products with less than 10 units
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Content Grid */}
                <div className="admin-grid-2">
                    {/* Recent Orders */}
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h3 className="admin-card-title">Recent Orders</h3>
                            <button className="admin-btn admin-btn-ghost" style={{ fontSize: '12px' }}>
                                View All <ArrowUpRight size={12} />
                            </button>
                        </div>

                        {recentOrders.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {recentOrders.map((order) => (
                                    <div
                                        key={order._id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '12px',
                                            background: 'var(--admin-bg-primary)',
                                            borderRadius: '8px'
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '13px' }}>
                                                #{order.orderNumber || order._id.slice(-6).toUpperCase()}
                                            </div>
                                            <div style={{ fontSize: '12px', color: 'var(--admin-text-secondary)' }}>
                                                {order.user?.name || order.shippingAddress?.fullName || 'Guest'}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 600, fontSize: '13px' }}>
                                                {formatCurrency(order.totalPrice)}
                                            </div>
                                            <span className={`admin-badge admin-badge-${getStatusBadge(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="admin-empty">
                                <ShoppingCart size={32} />
                                <p className="admin-empty-title">No orders yet</p>
                                <p className="admin-empty-text">Orders will appear here</p>
                            </div>
                        )}
                    </div>

                    {/* Low Stock Products */}
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h3 className="admin-card-title">Low Stock Alert</h3>
                            <button className="admin-btn admin-btn-ghost" style={{ fontSize: '12px' }}>
                                View All <ArrowUpRight size={12} />
                            </button>
                        </div>

                        {lowStockProducts.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {lowStockProducts.map((product) => (
                                    <div
                                        key={product._id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '12px',
                                            background: 'var(--admin-bg-primary)',
                                            borderRadius: '8px'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '6px',
                                                background: 'var(--admin-bg-tertiary)',
                                                overflow: 'hidden'
                                            }}>
                                                {product.images?.[0] ? (
                                                    <img
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div className="admin-flex-center" style={{ width: '100%', height: '100%' }}>
                                                        <Package size={14} />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 500, fontSize: '13px' }}>{product.name}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--admin-text-secondary)' }}>
                                                    {product.brand || 'No brand'}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{
                                                fontWeight: 600,
                                                fontSize: '14px',
                                                color: product.countInStock === 0 ? 'var(--admin-danger)' : 'var(--admin-warning)'
                                            }}>
                                                {product.countInStock} left
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="admin-empty">
                                <Package size={32} />
                                <p className="admin-empty-title">All stocked</p>
                                <p className="admin-empty-text">No low stock alerts</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spinning {
          animation: spin 1s linear infinite;
        }
      `}</style>
        </div>
    );
};

export default DashboardOverviewMinimal;
