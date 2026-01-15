import React, { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
    Settings,
    Palette,
    Bell,
    Shield,
    Save,
    RotateCcw,
    ChevronRight,
    Moon,
    Sun,
    Monitor
} from 'lucide-react';
import useLocalStorage from '../hooks/useLocalStorage';
import './styles/admin.css';

const SettingsPanelMinimal = ({ isDarkMode, setIsDarkMode }) => {
    const [activeCategory, setActiveCategory] = useState('general');
    const [isSaving, setIsSaving] = useState(false);

    const [settings, setSettings] = useLocalStorage('adminSettingsMinimal', {
        general: {
            siteName: 'ShoeMarkNet',
            timezone: 'UTC-5',
            language: 'en',
            itemsPerPage: 25,
            currency: 'USD'
        },
        appearance: {
            theme: 'dark',
            compactMode: false,
            showAnimations: true
        },
        notifications: {
            emailNotifications: true,
            orderAlerts: true,
            lowStockAlerts: true,
            userSignupAlerts: false
        },
        security: {
            twoFactorAuth: false,
            sessionTimeout: 30,
            requireStrongPasswords: true
        }
    });

    const categories = [
        { id: 'general', name: 'General', icon: Settings, description: 'Basic store settings' },
        { id: 'appearance', name: 'Appearance', icon: Palette, description: 'Theme and display' },
        { id: 'notifications', name: 'Notifications', icon: Bell, description: 'Alert preferences' },
        { id: 'security', name: 'Security', icon: Shield, description: 'Security options' }
    ];

    const handleChange = useCallback((category, key, value) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: value
            }
        }));

        // Apply theme immediately
        if (category === 'appearance' && key === 'theme') {
            if (value === 'dark') {
                setIsDarkMode(true);
            } else if (value === 'light') {
                setIsDarkMode(false);
            } else {
                // Auto - use system preference
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                setIsDarkMode(prefersDark);
            }
        }
    }, [setSettings, setIsDarkMode]);

    const handleSave = async () => {
        setIsSaving(true);
        await new Promise(r => setTimeout(r, 500));
        setIsSaving(false);
        toast.success('Settings saved successfully');
    };

    const handleReset = () => {
        const defaultSettings = {
            general: { siteName: 'ShoeMarkNet', timezone: 'UTC-5', language: 'en', itemsPerPage: 25, currency: 'USD' },
            appearance: { theme: 'dark', compactMode: false, showAnimations: true },
            notifications: { emailNotifications: true, orderAlerts: true, lowStockAlerts: true, userSignupAlerts: false },
            security: { twoFactorAuth: false, sessionTimeout: 30, requireStrongPasswords: true }
        };
        setSettings(defaultSettings);
        setIsDarkMode(true);
        toast.info('Settings reset to defaults');
    };

    const ToggleSwitch = ({ checked, onChange }) => (
        <button
            type="button"
            className={`admin-toggle ${checked ? 'active' : ''}`}
            onClick={() => onChange(!checked)}
            style={{ flexShrink: 0 }}
        />
    );

    const settingsConfig = {
        general: [
            { key: 'siteName', label: 'Site Name', description: 'Your store name', type: 'text' },
            {
                key: 'timezone', label: 'Timezone', type: 'select', options: [
                    { value: 'UTC-5', label: 'Eastern Time (UTC-5)' },
                    { value: 'UTC-8', label: 'Pacific Time (UTC-8)' },
                    { value: 'UTC+0', label: 'GMT (UTC+0)' },
                    { value: 'UTC+5:30', label: 'IST (UTC+5:30)' }
                ]
            },
            {
                key: 'language', label: 'Language', type: 'select', options: [
                    { value: 'en', label: 'English' },
                    { value: 'es', label: 'Spanish' },
                    { value: 'fr', label: 'French' },
                    { value: 'de', label: 'German' }
                ]
            },
            {
                key: 'currency', label: 'Currency', type: 'select', options: [
                    { value: 'USD', label: 'USD ($)' },
                    { value: 'EUR', label: 'EUR (€)' },
                    { value: 'GBP', label: 'GBP (£)' },
                    { value: 'INR', label: 'INR (₹)' }
                ]
            },
            { key: 'itemsPerPage', label: 'Items Per Page', type: 'number', min: 10, max: 100 }
        ],
        appearance: [
            { key: 'theme', label: 'Theme', description: 'Choose your preferred theme', type: 'theme' },
            { key: 'compactMode', label: 'Compact Mode', description: 'Reduce spacing and padding', type: 'toggle' },
            { key: 'showAnimations', label: 'Animations', description: 'Enable UI animations', type: 'toggle' }
        ],
        notifications: [
            { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive email updates', type: 'toggle' },
            { key: 'orderAlerts', label: 'New Order Alerts', description: 'Get notified of new orders', type: 'toggle' },
            { key: 'lowStockAlerts', label: 'Low Stock Alerts', description: 'Alert when products are low', type: 'toggle' },
            { key: 'userSignupAlerts', label: 'New User Alerts', description: 'Notify on new registrations', type: 'toggle' }
        ],
        security: [
            { key: 'twoFactorAuth', label: 'Two-Factor Authentication', description: 'Add extra security', type: 'toggle' },
            { key: 'requireStrongPasswords', label: 'Strong Passwords', description: 'Require complex passwords', type: 'toggle' },
            { key: 'sessionTimeout', label: 'Session Timeout', description: 'Minutes before auto logout', type: 'number', min: 5, max: 480 }
        ]
    };

    const renderField = (category, field) => {
        const value = settings[category]?.[field.key];

        if (field.type === 'toggle') {
            return (
                <ToggleSwitch
                    checked={value}
                    onChange={(newValue) => handleChange(category, field.key, newValue)}
                />
            );
        }

        if (field.type === 'theme') {
            return (
                <div style={{ display: 'flex', gap: '8px' }}>
                    {[
                        { value: 'light', icon: Sun, label: 'Light' },
                        { value: 'dark', icon: Moon, label: 'Dark' },
                        { value: 'auto', icon: Monitor, label: 'Auto' }
                    ].map(option => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => handleChange(category, field.key, option.value)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 14px',
                                background: value === option.value ? 'var(--admin-accent)' : 'var(--admin-bg-primary)',
                                color: value === option.value ? 'white' : 'var(--admin-text-secondary)',
                                border: `1px solid ${value === option.value ? 'var(--admin-accent)' : 'var(--admin-border)'}`,
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: 500,
                                transition: 'all 150ms'
                            }}
                        >
                            <option.icon size={14} />
                            {option.label}
                        </button>
                    ))}
                </div>
            );
        }

        if (field.type === 'select') {
            return (
                <select
                    className="admin-input admin-select"
                    value={value}
                    onChange={(e) => handleChange(category, field.key, e.target.value)}
                    style={{ width: '200px' }}
                >
                    {field.options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            );
        }

        if (field.type === 'number') {
            return (
                <input
                    type="number"
                    className="admin-input"
                    value={value}
                    onChange={(e) => handleChange(category, field.key, parseInt(e.target.value) || field.min)}
                    min={field.min}
                    max={field.max}
                    style={{ width: '100px' }}
                />
            );
        }

        return (
            <input
                type="text"
                className="admin-input"
                value={value || ''}
                onChange={(e) => handleChange(category, field.key, e.target.value)}
                style={{ width: '200px' }}
            />
        );
    };

    return (
        <div className="admin-root">
            <div className="admin-container">
                {/* Page Header */}
                <div className="admin-page-header admin-flex-between">
                    <div>
                        <h1 className="admin-page-title">Settings</h1>
                        <p className="admin-page-subtitle">Configure your admin preferences</p>
                    </div>
                    <div className="admin-page-actions admin-gap-2">
                        <button
                            className="admin-btn admin-btn-secondary"
                            onClick={handleReset}
                        >
                            <RotateCcw size={16} />
                            Reset
                        </button>
                        <button
                            className="admin-btn admin-btn-primary"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            <Save size={16} />
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>

                {/* Settings Layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px' }}>

                    {/* Sidebar */}
                    <div className="admin-card" style={{ height: 'fit-content', padding: '12px' }}>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px',
                                    marginBottom: '4px',
                                    background: activeCategory === cat.id ? 'var(--admin-accent)' : 'transparent',
                                    color: activeCategory === cat.id ? 'white' : 'var(--admin-text-primary)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    textAlign: 'left',
                                    transition: 'all 150ms'
                                }}
                            >
                                <cat.icon size={18} style={{ opacity: activeCategory === cat.id ? 1 : 0.7 }} />
                                <div>
                                    <div>{cat.name}</div>
                                    <div style={{
                                        fontSize: '11px',
                                        fontWeight: 400,
                                        opacity: 0.7,
                                        marginTop: '2px'
                                    }}>
                                        {cat.description}
                                    </div>
                                </div>
                                <ChevronRight size={16} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                            </button>
                        ))}
                    </div>

                    {/* Settings Content */}
                    <div className="admin-card">
                        <h3 style={{
                            fontSize: '16px',
                            fontWeight: 600,
                            marginBottom: '24px',
                            color: 'var(--admin-text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            {React.createElement(categories.find(c => c.id === activeCategory)?.icon || Settings, { size: 20 })}
                            {categories.find(c => c.id === activeCategory)?.name} Settings
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {settingsConfig[activeCategory]?.map(field => (
                                <div
                                    key={field.key}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '16px',
                                        background: 'var(--admin-bg-primary)',
                                        borderRadius: '8px',
                                        marginBottom: '8px'
                                    }}
                                >
                                    <div>
                                        <label style={{
                                            fontSize: '14px',
                                            fontWeight: 500,
                                            color: 'var(--admin-text-primary)',
                                            display: 'block'
                                        }}>
                                            {field.label}
                                        </label>
                                        {field.description && (
                                            <span style={{
                                                fontSize: '12px',
                                                color: 'var(--admin-text-secondary)',
                                                marginTop: '2px',
                                                display: 'block'
                                            }}>
                                                {field.description}
                                            </span>
                                        )}
                                    </div>
                                    {renderField(activeCategory, field)}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPanelMinimal;
