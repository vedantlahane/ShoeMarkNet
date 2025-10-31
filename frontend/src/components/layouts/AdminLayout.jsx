import React, { useEffect, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';
import { useTheme } from '../../context/ThemeContext';

/**
 * Provides the chrome for all admin-only experiences.
 * Applies channel-specific body attributes so global styling
 * and keyboard shortcuts can adapt without leaking into the
 * consumer storefront.
 */
const AdminLayout = () => {
  const location = useLocation();
  const prefersReducedMotion = usePrefersReducedMotion();
  const { theme } = useTheme();

  useEffect(() => {
    const previousAttribute = document.body.getAttribute('data-app-channel');
    document.body.setAttribute('data-app-channel', 'admin');

    return () => {
      if (previousAttribute) {
        document.body.setAttribute('data-app-channel', previousAttribute);
      } else {
        document.body.removeAttribute('data-app-channel');
      }
    };
  }, []);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });
  }, [location.pathname, prefersReducedMotion]);

  const shellClassName = useMemo(() => (
    theme === 'dark'
      ? 'admin-shell dark'
      : 'admin-shell'
  ), [theme]);

  return (
    <div className={`${shellClassName} selection:bg-blue-200/60 dark:selection:bg-blue-500/40`} data-theme={theme}>
      <Outlet />
    </div>
  );
};

export default AdminLayout;
