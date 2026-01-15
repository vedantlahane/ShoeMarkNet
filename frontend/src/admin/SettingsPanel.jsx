import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

// Utils
import { trackEvent } from '../utils/analytics';

// Hooks
import useLocalStorage from '../hooks/useLocalStorage';

const SettingsPanel = ({
  variant = 'default', // default, compact, tabbed
  showCategories = true,
  className = ''
}) => {
  // Redux state
  const { user, notifications } = useSelector(state => ({
    user: state.auth?.user || {},
    notifications: state.notifications?.preferences || {}
  }));

  // Local state
  const [activeCategory, setActiveCategory] = useState('general');
  const [settings, setSettings] = useLocalStorage('adminSettings', {
    general: {
      siteName: 'ShoeMarkNet Admin',
      timezone: 'UTC-5',
      language: 'en',
      dateFormat: 'MM/DD/YYYY',
      itemsPerPage: 25
    },
    appearance: {
      theme: 'auto',
      primaryColor: '#3B82F6',
      sidebarCollapsed: false,
      showAnimations: true,
      compactMode: false
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      orderAlerts: true,
      systemAlerts: true,
      marketingEmails: false
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      loginAlerts: true,
      ipWhitelist: ''
    },
    system: {
      maintenanceMode: false,
      debugMode: false,
      cacheEnabled: true,
      analyticsEnabled: true,
      backupFrequency: 'daily'
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [animateElements, setAnimateElements] = useState(false);

  // Initialize animations
  useEffect(() => {
    setTimeout(() => setAnimateElements(true), 100);
  }, []);

  // Apply theme changes to document when settings change
  useEffect(() => {
    const applyTheme = (themeSetting) => {
      const root = document.documentElement;
      if (themeSetting === 'dark' || (themeSetting === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };
    if (settings?.appearance?.theme) {
      applyTheme(settings.appearance.theme);
    }
  }, [settings?.appearance?.theme]);

  // Settings categories
  const categories = [
    {
      id: 'general',
      name: 'General',
      icon: 'fas fa-cog',
      color: 'from-blue-500 to-cyan-500',
      description: 'Basic site configuration and preferences'
    },
    {
      id: 'appearance',
      name: 'Appearance',
      icon: 'fas fa-palette',
      color: 'from-purple-500 to-pink-500',
      description: 'Theme, colors, and visual settings'
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: 'fas fa-bell',
      color: 'from-green-500 to-emerald-500',
      description: 'Email and push notification preferences'
    },
    {
      id: 'security',
      name: 'Security',
      icon: 'fas fa-shield-alt',
      color: 'from-red-500 to-orange-500',
      description: 'Authentication and access control'
    },
    {
      id: 'system',
      name: 'System',
      icon: 'fas fa-server',
      color: 'from-indigo-500 to-purple-500',
      description: 'Advanced system and maintenance settings'
    }
  ];

  // Handle setting change
  const handleSettingChange = useCallback((category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setHasChanges(true);

    trackEvent('admin_setting_changed', {
      category,
      setting: key,
      value: typeof value === 'boolean' ? value.toString() : value
    });
  }, [setSettings]);

  // Handle save settings
  const handleSaveSettings = useCallback(async () => {
    setIsSaving(true);

    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));

      setHasChanges(false);
      toast.success('Settings saved successfully!');

      trackEvent('admin_settings_saved', {
        categories_modified: Object.keys(settings),
        user_id: user.id
      });

    } catch (error) {
      toast.error('Failed to save settings. Please try again.');
      console.error('Settings save error:', error);
    } finally {
      setIsSaving(false);
    }
  }, [settings, user.id]);

  // Handle reset settings
  const handleResetSettings = useCallback(() => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      setSettings({
        general: {
          siteName: 'ShoeMarkNet Admin',
          timezone: 'UTC-5',
          language: 'en',
          dateFormat: 'MM/DD/YYYY',
          itemsPerPage: 25
        },
        appearance: {
          theme: 'auto',
          primaryColor: '#3B82F6',
          sidebarCollapsed: false,
          showAnimations: true,
          compactMode: false
        },
        notifications: {
          emailNotifications: true,
          pushNotifications: true,
          orderAlerts: true,
          systemAlerts: true,
          marketingEmails: false
        },
        security: {
          twoFactorAuth: false,
          sessionTimeout: 30,
          passwordExpiry: 90,
          loginAlerts: true,
          ipWhitelist: ''
        },
        system: {
          maintenanceMode: false,
          debugMode: false,
          cacheEnabled: true,
          analyticsEnabled: true,
          backupFrequency: 'daily'
        }
      });

      setHasChanges(true);
      toast.info('Settings reset to default values');

      trackEvent('admin_settings_reset', {
        user_id: user.id
      });
    }
  }, [setSettings, user.id]);

  // Render form field
  const renderField = useCallback((category, key, config) => {
    const value = settings[category][key];
    const fieldId = `${category}-${key}`;

    switch (config.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <input
            id={fieldId}
            type={config.type}
            value={value}
            onChange={(e) => handleSettingChange(category, key, config.type === 'number' ? parseInt(e.target.value) : e.target.value)}
            className="w-full px-4 py-3 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
            placeholder={config.placeholder}
            min={config.min}
            max={config.max}
          />
        );

      case 'select':
        return (
          <select
            id={fieldId}
            value={value}
            onChange={(e) => handleSettingChange(category, key, e.target.value)}
            className="w-full px-4 py-3 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
          >
            {config.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'toggle':
        return (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleSettingChange(category, key, e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        );

      case 'color':
        return (
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={value}
              onChange={(e) => handleSettingChange(category, key, e.target.value)}
              className="w-12 h-12 rounded-full border-2 border-white/30 cursor-pointer"
            />
            <input
              type="text"
              value={value}
              onChange={(e) => handleSettingChange(category, key, e.target.value)}
              className="flex-1 px-4 py-3 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              placeholder="#000000"
            />
          </div>
        );

      case 'textarea':
        return (
          <textarea
            id={fieldId}
            value={value}
            onChange={(e) => handleSettingChange(category, key, e.target.value)}
            className="w-full px-4 py-3 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
            placeholder={config.placeholder}
            rows={config.rows || 3}
          />
        );

      default:
        return null;
    }
  }, [settings, handleSettingChange]);

  // Settings configuration
  const settingsConfig = {
    general: {
      siteName: { type: 'text', label: 'Site Name', placeholder: 'Enter site name' },
      timezone: {
        type: 'select',
        label: 'Timezone',
        options: [
          { value: 'UTC-12', label: '(UTC-12:00) International Date Line West' },
          { value: 'UTC-5', label: '(UTC-05:00) Eastern Time' },
          { value: 'UTC-6', label: '(UTC-06:00) Central Time' },
          { value: 'UTC-7', label: '(UTC-07:00) Mountain Time' },
          { value: 'UTC-8', label: '(UTC-08:00) Pacific Time' },
          { value: 'UTC+0', label: '(UTC+00:00) Greenwich Mean Time' }
        ]
      },
      language: {
        type: 'select',
        label: 'Language',
        options: [
          { value: 'en', label: 'English' },
          { value: 'es', label: 'Español' },
          { value: 'fr', label: 'Français' },
          { value: 'de', label: 'Deutsch' },
          { value: 'it', label: 'Italiano' }
        ]
      },
      dateFormat: {
        type: 'select',
        label: 'Date Format',
        options: [
          { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
          { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
          { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
        ]
      },
      itemsPerPage: { type: 'number', label: 'Items Per Page', min: 10, max: 100 }
    },
    appearance: {
      theme: {
        type: 'select',
        label: 'Theme',
        options: [
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
          { value: 'auto', label: 'Auto (System)' }
        ]
      },
      primaryColor: { type: 'color', label: 'Primary Color' },
      sidebarCollapsed: { type: 'toggle', label: 'Collapsed Sidebar by Default' },
      showAnimations: { type: 'toggle', label: 'Enable Animations' },
      compactMode: { type: 'toggle', label: 'Compact Mode' }
    },
    notifications: {
      emailNotifications: { type: 'toggle', label: 'Email Notifications' },
      pushNotifications: { type: 'toggle', label: 'Push Notifications' },
      orderAlerts: { type: 'toggle', label: 'Order Alerts' },
      systemAlerts: { type: 'toggle', label: 'System Alerts' },
      marketingEmails: { type: 'toggle', label: 'Marketing Emails' }
    },
    security: {
      twoFactorAuth: { type: 'toggle', label: 'Two-Factor Authentication' },
      sessionTimeout: { type: 'number', label: 'Session Timeout (minutes)', min: 5, max: 480 },
      passwordExpiry: { type: 'number', label: 'Password Expiry (days)', min: 30, max: 365 },
      loginAlerts: { type: 'toggle', label: 'Login Alerts' },
      ipWhitelist: { type: 'textarea', label: 'IP Whitelist (one per line)', placeholder: 'Enter IP addresses, one per line', rows: 4 }
    },
    system: {
      maintenanceMode: { type: 'toggle', label: 'Maintenance Mode' },
      debugMode: { type: 'toggle', label: 'Debug Mode' },
      cacheEnabled: { type: 'toggle', label: 'Cache Enabled' },
      analyticsEnabled: { type: 'toggle', label: 'Analytics Enabled' },
      backupFrequency: {
        type: 'select',
        label: 'Backup Frequency',
        options: [
          { value: 'hourly', label: 'Hourly' },
          { value: 'daily', label: 'Daily' },
          { value: 'weekly', label: 'Weekly' },
          { value: 'monthly', label: 'Monthly' }
        ]
      }
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>

      {/* Header */}
      <div className={`${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`}>
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                <i className="fas fa-cogs mr-3"></i>
                Admin Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Configure your admin dashboard preferences and system settings
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {hasChanges && (
                <span className="bg-orange-500/20 border border-orange-300 text-orange-700 dark:text-orange-400 px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                  Unsaved Changes
                </span>
              )}

              <button
                onClick={handleResetSettings}
                className="bg-white/20 backdrop-blur-lg border border-white/30 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-2xl hover:bg-white/30 transition-all duration-200"
              >
                <i className="fas fa-undo mr-2"></i>
                Reset
              </button>

              <button
                onClick={handleSaveSettings}
                disabled={!hasChanges || isSaving}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2"></i>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Categories Sidebar */}
        {showCategories && (
          <div className={`lg:col-span-1 ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-2xl">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Settings Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center p-4 rounded-2xl transition-all duration-200 hover:scale-105 ${activeCategory === category.id
                        ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                        : 'bg-white/20 text-gray-700 dark:text-gray-300 hover:bg-white/30'
                      }`}
                  >
                    <i className={`${category.icon} mr-3 text-lg`}></i>
                    <div className="text-left">
                      <div className="font-semibold">{category.name}</div>
                      <div className={`text-xs ${activeCategory === category.id ? 'text-white/80' : 'text-gray-500'}`}>
                        {category.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Form */}
        <div className={`${showCategories ? 'lg:col-span-3' : 'lg:col-span-4'} ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 shadow-2xl">

            {/* Category Header */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${categories.find(c => c.id === activeCategory)?.color} rounded-2xl flex items-center justify-center mr-4`}>
                  <i className={`${categories.find(c => c.id === activeCategory)?.icon} text-white text-xl`}></i>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {categories.find(c => c.id === activeCategory)?.name} Settings
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {categories.find(c => c.id === activeCategory)?.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Settings Fields */}
            <div className="space-y-6">
              {Object.entries(settingsConfig[activeCategory] || {}).map(([key, config]) => (
                <div key={key} className="space-y-2">
                  <label htmlFor={`${activeCategory}-${key}`} className="block text-sm font-semibold text-gray-900 dark:text-white">
                    {config.label}
                  </label>
                  {renderField(activeCategory, key, config)}
                  {config.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {config.description}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Security Warning for System Settings */}
            {activeCategory === 'system' && (
              <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-2xl">
                <div className="flex items-start">
                  <i className="fas fa-exclamation-triangle text-yellow-500 mr-3 mt-1"></i>
                  <div>
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
                      Warning: System Settings
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      Changing these settings may affect system performance and stability. Please ensure you understand the implications before making changes.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Styles */}
    </div>
  );
};

export default SettingsPanel;
