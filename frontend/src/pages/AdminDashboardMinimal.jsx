import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    BarChart3,
    Settings,
    Search,
    Bell,
    Moon,
    Sun,
    ChevronDown,
    X,
    LogOut,
    User,
    Clock,
    AlertTriangle,
    CheckCircle,
    FolderTree,
    Megaphone
} from 'lucide-react';
import PageMeta from '../components/seo/PageMeta';
import useLocalStorage from '../hooks/useLocalStorage';
import usePermissions from '../hooks/usePermissions';
import { logout } from '../redux/slices/authSlice';
import { fetchProducts } from '../redux/slices/productSlice';
import { fetchAllOrders } from '../redux/slices/orderSlice';

// Minimal Components
import DashboardOverviewMinimal from '../admin/DashboardOverviewMinimal';
import ProductManagementMinimal from '../admin/ProductManagementMinimal';
import OrderManagementMinimal from '../admin/OrderManagementMinimal';
import UserManagementMinimal from '../admin/UserManagementMinimal';
import AnalyticsPanelMinimal from '../admin/AnalyticsPanelMinimal';
import SettingsPanelMinimal from '../admin/SettingsPanelMinimal';
import CategoryManagementMinimal from '../admin/CategoryManagementMinimal';
import CampaignManagementMinimal from '../admin/CampaignManagementMinimal';

import '../admin/styles/admin.css';

const NAV_ITEMS = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
];

const AdminDashboardMinimal = ({ section = 'overview' }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const { userRole } = usePermissions();
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const { products } = useSelector((state) => state.product);
    const { adminOrders } = useSelector((state) => state.order);

    const [activeSection, setActiveSection] = useLocalStorage('adminSection', section);
    const [isDarkMode, setIsDarkMode] = useLocalStorage('adminDarkMode', true);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Redirect if not admin
    useEffect(() => {
        if (!isAuthenticated || userRole !== 'admin') {
            navigate('/login');
        }
    }, [isAuthenticated, userRole, navigate]);

    // Sync with URL
    useEffect(() => {
        const urlSection = searchParams.get('section') || section;
        if (urlSection !== activeSection && NAV_ITEMS.find(n => n.id === urlSection)) {
            setActiveSection(urlSection);
        }
    }, [section, searchParams]);

    // Apply theme
    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode);
    }, [isDarkMode]);

    // Keyboard shortcut for search
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setShowSearch(true);
            }
            if (e.key === 'Escape') {
                setShowSearch(false);
                setShowNotifications(false);
                setShowUserMenu(false);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClick = () => {
            setShowUserMenu(false);
            setShowNotifications(false);
        };
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    // Generate notifications based on data
    const notifications = useMemo(() => {
        const notifs = [];
        const orders = adminOrders?.items || [];
        const productList = Array.isArray(products) ? products : [];

        const pendingOrders = orders.filter(o => o.status === 'pending');
        if (pendingOrders.length > 0) {
            notifs.push({
                id: 'pending-orders',
                type: 'warning',
                icon: Clock,
                title: `${pendingOrders.length} Pending Orders`,
                message: 'Orders waiting to be processed',
                time: 'Just now'
            });
        }

        const lowStockProducts = productList.filter(p => p.countInStock < 10 && p.countInStock > 0);
        if (lowStockProducts.length > 0) {
            notifs.push({
                id: 'low-stock',
                type: 'warning',
                icon: AlertTriangle,
                title: `${lowStockProducts.length} Low Stock Items`,
                message: 'Products running low on inventory',
                time: '5 min ago'
            });
        }

        const outOfStock = productList.filter(p => p.countInStock === 0);
        if (outOfStock.length > 0) {
            notifs.push({
                id: 'out-of-stock',
                type: 'danger',
                icon: AlertTriangle,
                title: `${outOfStock.length} Out of Stock`,
                message: 'Products need restocking',
                time: '10 min ago'
            });
        }

        if (notifs.length === 0) {
            notifs.push({
                id: 'all-good',
                type: 'success',
                icon: CheckCircle,
                title: 'All caught up!',
                message: 'No pending actions required',
                time: 'Now'
            });
        }

        return notifs;
    }, [adminOrders, products]);

    // Search results
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return { products: [], orders: [], pages: [] };

        const query = searchQuery.toLowerCase();
        const productList = Array.isArray(products) ? products : [];
        const orders = adminOrders?.items || [];

        return {
            products: productList.filter(p =>
                p.name?.toLowerCase().includes(query) ||
                p.brand?.toLowerCase().includes(query) ||
                p.sku?.toLowerCase().includes(query)
            ).slice(0, 5),
            orders: orders.filter(o =>
                o.orderNumber?.toLowerCase().includes(query) ||
                o._id?.toLowerCase().includes(query) ||
                o.user?.name?.toLowerCase().includes(query)
            ).slice(0, 3),
            pages: NAV_ITEMS.filter(n => n.label.toLowerCase().includes(query))
        };
    }, [searchQuery, products, adminOrders]);

    const handleNavClick = useCallback((id) => {
        setActiveSection(id);
        const params = new URLSearchParams(searchParams);
        if (id === 'overview') {
            params.delete('section');
        } else {
            params.set('section', id);
        }
        setSearchParams(params, { replace: true });
    }, [searchParams, setSearchParams, setActiveSection]);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const handleSearchSelect = (type, item) => {
        setShowSearch(false);
        setSearchQuery('');

        if (type === 'page') {
            handleNavClick(item.id);
        } else if (type === 'product') {
            handleNavClick('products');
        } else if (type === 'order') {
            handleNavClick('orders');
        }
    };

    const renderSection = () => {
        switch (activeSection) {
            case 'products':
                return <ProductManagementMinimal />;
            case 'categories':
                return <CategoryManagementMinimal />;
            case 'orders':
                return <OrderManagementMinimal />;
            case 'users':
                return <UserManagementMinimal />;
            case 'campaigns':
                return <CampaignManagementMinimal />;
            case 'analytics':
                return <AnalyticsPanelMinimal />;
            case 'settings':
                return <SettingsPanelMinimal isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />;
            default:
                return <DashboardOverviewMinimal />;
        }
    };

    const hasNotifications = notifications.some(n => n.type !== 'success');

    return (
        <>
            <PageMeta
                title={`Admin - ${NAV_ITEMS.find(n => n.id === activeSection)?.label || 'Dashboard'}`}
                description="ShoeMarkNet Admin Dashboard"
            />

            <div className={`admin-root ${isDarkMode ? '' : 'light'}`}>
                {/* Header */}
                <header className="admin-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                        {/* Logo */}
                        <div className="admin-logo">
                            <Package size={22} style={{ color: 'var(--admin-accent)' }} />
                            <span>ShoeMarkNet</span>
                            <span className="admin-logo-badge">ADMIN</span>
                        </div>

                        {/* Navigation */}
                        <nav className="admin-nav">
                            {NAV_ITEMS.map((item) => (
                                <button
                                    key={item.id}
                                    className={`admin-nav-item ${activeSection === item.id ? 'active' : ''}`}
                                    onClick={() => handleNavClick(item.id)}
                                >
                                    <item.icon size={16} />
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Right Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <button
                            className="admin-btn admin-btn-ghost admin-btn-icon"
                            title="Search (Ctrl+K)"
                            onClick={(e) => { e.stopPropagation(); setShowSearch(true); }}
                        >
                            <Search size={18} />
                        </button>

                        {/* Notifications */}
                        <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
                            <button
                                className="admin-btn admin-btn-ghost admin-btn-icon"
                                title="Notifications"
                                onClick={() => setShowNotifications(!showNotifications)}
                                style={{ position: 'relative' }}
                            >
                                <Bell size={18} />
                                {hasNotifications && (
                                    <span style={{
                                        position: 'absolute',
                                        top: '6px',
                                        right: '6px',
                                        width: '8px',
                                        height: '8px',
                                        background: 'var(--admin-danger)',
                                        borderRadius: '50%'
                                    }} />
                                )}
                            </button>

                            {showNotifications && (
                                <div className="admin-dropdown-menu" style={{
                                    right: 0,
                                    minWidth: '320px',
                                    maxHeight: '400px',
                                    overflow: 'auto'
                                }}>
                                    <div style={{
                                        padding: '12px 16px',
                                        borderBottom: '1px solid var(--admin-border)',
                                        fontWeight: 600,
                                        fontSize: '14px'
                                    }}>
                                        Notifications
                                    </div>
                                    {notifications.map(notif => (
                                        <div
                                            key={notif.id}
                                            style={{
                                                padding: '12px 16px',
                                                display: 'flex',
                                                gap: '12px',
                                                alignItems: 'flex-start',
                                                borderBottom: '1px solid var(--admin-border)'
                                            }}
                                        >
                                            <div style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: notif.type === 'success' ? 'var(--admin-success-bg)' :
                                                    notif.type === 'danger' ? 'var(--admin-danger-bg)' : 'var(--admin-warning-bg)',
                                                color: notif.type === 'success' ? 'var(--admin-success)' :
                                                    notif.type === 'danger' ? 'var(--admin-danger)' : 'var(--admin-warning)',
                                                flexShrink: 0
                                            }}>
                                                <notif.icon size={16} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 500, fontSize: '13px' }}>{notif.title}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--admin-text-secondary)' }}>{notif.message}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--admin-text-tertiary)', marginTop: '4px' }}>{notif.time}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            className="admin-btn admin-btn-ghost admin-btn-icon"
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            title={isDarkMode ? 'Light mode' : 'Dark mode'}
                        >
                            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

                        {/* User Menu */}
                        <div
                            style={{ marginLeft: '8px', position: 'relative' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                className="admin-btn admin-btn-ghost"
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                style={{
                                    paddingLeft: '12px',
                                    borderLeft: '1px solid var(--admin-border)',
                                    borderRadius: 0,
                                    marginLeft: '8px'
                                }}
                            >
                                <div className="admin-avatar" style={{ width: '28px', height: '28px', fontSize: '11px' }}>
                                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: 500 }}>
                                    {user?.name?.split(' ')[0] || 'Admin'}
                                </span>
                                <ChevronDown size={14} style={{ opacity: 0.6 }} />
                            </button>

                            {showUserMenu && (
                                <div className="admin-dropdown-menu" style={{ right: 0 }}>
                                    <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--admin-border)' }}>
                                        <div style={{ fontWeight: 500, fontSize: '13px' }}>{user?.name || 'Admin User'}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--admin-text-secondary)' }}>{user?.email}</div>
                                    </div>
                                    <button
                                        className="admin-dropdown-item"
                                        onClick={() => { handleNavClick('settings'); setShowUserMenu(false); }}
                                    >
                                        <User size={14} /> My Profile
                                    </button>
                                    <button
                                        className="admin-dropdown-item"
                                        onClick={() => { handleNavClick('settings'); setShowUserMenu(false); }}
                                    >
                                        <Settings size={14} /> Settings
                                    </button>
                                    <button
                                        className="admin-dropdown-item danger"
                                        onClick={handleLogout}
                                    >
                                        <LogOut size={14} /> Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main style={{ minHeight: 'calc(100vh - 57px)' }}>
                    {renderSection()}
                </main>

                {/* Search Modal */}
                {showSearch && (
                    <div
                        className="admin-modal-overlay"
                        onClick={() => setShowSearch(false)}
                        style={{ alignItems: 'flex-start', paddingTop: '100px' }}
                    >
                        <div
                            className="admin-modal"
                            onClick={e => e.stopPropagation()}
                            style={{ maxWidth: '560px', width: '100%' }}
                        >
                            <div style={{ padding: '16px', borderBottom: '1px solid var(--admin-border)' }}>
                                <div className="admin-search" style={{ width: '100%' }}>
                                    <Search />
                                    <input
                                        type="text"
                                        className="admin-input"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search products, orders, or pages..."
                                        autoFocus
                                        style={{ paddingLeft: '40px' }}
                                    />
                                </div>
                            </div>

                            <div style={{ maxHeight: '400px', overflow: 'auto' }}>
                                {!searchQuery.trim() ? (
                                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--admin-text-secondary)' }}>
                                        <Search size={32} style={{ opacity: 0.5, marginBottom: '8px' }} />
                                        <p style={{ margin: 0, fontSize: '13px' }}>Start typing to search...</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Pages */}
                                        {searchResults.pages.length > 0 && (
                                            <div>
                                                <div style={{ padding: '8px 16px', fontSize: '11px', fontWeight: 600, color: 'var(--admin-text-tertiary)', textTransform: 'uppercase' }}>
                                                    Pages
                                                </div>
                                                {searchResults.pages.map(page => (
                                                    <button
                                                        key={page.id}
                                                        className="admin-dropdown-item"
                                                        onClick={() => handleSearchSelect('page', page)}
                                                        style={{ width: '100%' }}
                                                    >
                                                        <page.icon size={16} />
                                                        {page.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Products */}
                                        {searchResults.products.length > 0 && (
                                            <div>
                                                <div style={{ padding: '8px 16px', fontSize: '11px', fontWeight: 600, color: 'var(--admin-text-tertiary)', textTransform: 'uppercase' }}>
                                                    Products ({searchResults.products.length})
                                                </div>
                                                {searchResults.products.map(product => (
                                                    <button
                                                        key={product._id}
                                                        className="admin-dropdown-item"
                                                        onClick={() => handleSearchSelect('product', product)}
                                                        style={{ width: '100%' }}
                                                    >
                                                        <Package size={16} />
                                                        <div>
                                                            <div>{product.name}</div>
                                                            <div style={{ fontSize: '11px', color: 'var(--admin-text-tertiary)' }}>
                                                                {product.brand} • ${product.price}
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Orders */}
                                        {searchResults.orders.length > 0 && (
                                            <div>
                                                <div style={{ padding: '8px 16px', fontSize: '11px', fontWeight: 600, color: 'var(--admin-text-tertiary)', textTransform: 'uppercase' }}>
                                                    Orders ({searchResults.orders.length})
                                                </div>
                                                {searchResults.orders.map(order => (
                                                    <button
                                                        key={order._id}
                                                        className="admin-dropdown-item"
                                                        onClick={() => handleSearchSelect('order', order)}
                                                        style={{ width: '100%' }}
                                                    >
                                                        <ShoppingCart size={16} />
                                                        <div>
                                                            <div>Order #{order.orderNumber || order._id.slice(-6)}</div>
                                                            <div style={{ fontSize: '11px', color: 'var(--admin-text-tertiary)' }}>
                                                                {order.user?.name} • ${order.totalPrice}
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {searchResults.pages.length === 0 &&
                                            searchResults.products.length === 0 &&
                                            searchResults.orders.length === 0 && (
                                                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--admin-text-secondary)' }}>
                                                    <p style={{ margin: 0, fontSize: '13px' }}>No results found for "{searchQuery}"</p>
                                                </div>
                                            )}
                                    </>
                                )}
                            </div>

                            <div style={{
                                padding: '12px 16px',
                                borderTop: '1px solid var(--admin-border)',
                                display: 'flex',
                                gap: '16px',
                                fontSize: '12px',
                                color: 'var(--admin-text-tertiary)'
                            }}>
                                <span><kbd style={{ padding: '2px 6px', background: 'var(--admin-bg-tertiary)', borderRadius: '4px' }}>↑↓</kbd> Navigate</span>
                                <span><kbd style={{ padding: '2px 6px', background: 'var(--admin-bg-tertiary)', borderRadius: '4px' }}>Enter</kbd> Select</span>
                                <span><kbd style={{ padding: '2px 6px', background: 'var(--admin-bg-tertiary)', borderRadius: '4px' }}>Esc</kbd> Close</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default AdminDashboardMinimal;
