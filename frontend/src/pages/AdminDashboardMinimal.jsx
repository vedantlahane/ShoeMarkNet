import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
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
    ChevronDown
} from 'lucide-react';
import PageMeta from '../components/seo/PageMeta';
import useLocalStorage from '../hooks/useLocalStorage';
import usePermissions from '../hooks/usePermissions';

// Minimal Components
import DashboardOverviewMinimal from '../admin/DashboardOverviewMinimal';
import ProductManagementMinimal from '../admin/ProductManagementMinimal';
import OrderManagementMinimal from '../admin/OrderManagementMinimal';
import UserManagementMinimal from '../admin/UserManagementMinimal';
import AnalyticsPanelMinimal from '../admin/AnalyticsPanelMinimal';
import SettingsPanelMinimal from '../admin/SettingsPanelMinimal';

import '../admin/styles/admin.css';

const NAV_ITEMS = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
];

const AdminDashboardMinimal = ({ section = 'overview' }) => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { userRole } = usePermissions();
    const { user, isAuthenticated } = useSelector((state) => state.auth);

    const [activeSection, setActiveSection] = useLocalStorage('adminSection', section);
    const [isDarkMode, setIsDarkMode] = useLocalStorage('adminDarkMode', true);
    const [showUserMenu, setShowUserMenu] = useState(false);

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

    const renderSection = () => {
        switch (activeSection) {
            case 'products':
                return <ProductManagementMinimal />;
            case 'orders':
                return <OrderManagementMinimal />;
            case 'users':
                return <UserManagementMinimal />;
            case 'analytics':
                return <AnalyticsPanelMinimal />;
            case 'settings':
                return <SettingsPanelMinimal isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />;
            default:
                return <DashboardOverviewMinimal />;
        }
    };

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
                        <button className="admin-btn admin-btn-ghost admin-btn-icon" title="Search (Ctrl+K)">
                            <Search size={18} />
                        </button>
                        <button className="admin-btn admin-btn-ghost admin-btn-icon" title="Notifications">
                            <Bell size={18} />
                        </button>
                        <button
                            className="admin-btn admin-btn-ghost admin-btn-icon"
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            title={isDarkMode ? 'Light mode' : 'Dark mode'}
                        >
                            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

                        {/* User Menu */}
                        <div
                            className="admin-dropdown"
                            style={{ marginLeft: '8px', position: 'relative' }}
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
                                <div className="admin-dropdown-menu">
                                    <button className="admin-dropdown-item" onClick={() => navigate('/profile')}>
                                        Profile
                                    </button>
                                    <button className="admin-dropdown-item" onClick={() => handleNavClick('settings')}>
                                        Settings
                                    </button>
                                    <button className="admin-dropdown-item danger" onClick={() => navigate('/logout')}>
                                        Sign Out
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
            </div>
        </>
    );
};

export default AdminDashboardMinimal;
