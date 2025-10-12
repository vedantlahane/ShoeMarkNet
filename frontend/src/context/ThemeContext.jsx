/**
 * ThemeContext.jsx - React context for managing light/dark theme preferences.
 * 
 * This module provides a ThemeProvider component and useTheme hook to handle
 * theme switching (light, dark, system), persistence via localStorage, and
 * synchronization with OS preferences. It integrates with Tailwind CSS for
 * dark mode and supports SSR-safe operations.
 * 
 * Features:
 * - User-set preferences: 'light', 'dark', or 'system' (follows OS).
 * - Automatic OS preference detection and updates.
 * - Persistence across sessions and tabs.
 * - DOM class/data attribute updates for styling.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';

// Use layout effect when available to avoid visible flicker during theme switches
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// Key for storing theme preference in localStorage
const STORAGE_KEY = 'theme';

// Valid theme options
const VALID_THEMES = ['light', 'dark', 'system'];

// Create the theme context (undefined by default to catch misuse)
const ThemeContext = createContext(undefined);

/**
 * Gets the current system theme preference (light or dark).
 * 
 * @returns {string} 'dark' if OS prefers dark mode, otherwise 'light'.
 * Defaults to 'light' if window or matchMedia is unavailable (e.g., SSR).
 */
const getSystemPreference = () => {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'light';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

/**
 * Reads the stored theme preference from localStorage.
 * 
 * @returns {string|null} The stored theme if valid, otherwise null.
 * Handles errors gracefully (e.g., storage disabled).
 */
const readStoredTheme = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return VALID_THEMES.includes(stored) ? stored : null;
  } catch (error) {
    console.warn('Unable to read theme from localStorage', error);
    return null;
  }
};

/**
 * Writes the theme preference to localStorage.
 * 
 * @param {string} theme - The theme to store ('light', 'dark', or 'system').
 * Handles errors gracefully (e.g., storage disabled).
 */
const writeStoredTheme = (theme) => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch (error) {
    console.warn('Unable to persist theme to localStorage', error);
  }
};

/**
 * ThemeProvider component - Provides theme context to child components.
 * 
 * Manages theme state, listens for OS changes, applies themes to DOM,
 * and syncs preferences across tabs. Wrap your app with this provider.
 * 
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - Child components to render.
 * @returns {JSX.Element} The provider wrapping children.
 */
export const ThemeProvider = ({ children }) => {
  // User's theme preference ('light', 'dark', 'system'), initialized from storage or 'system'
  const [preference, setPreference] = useState(
    () => readStoredTheme() || 'system'
  );
  
  // Current system theme ('light' or 'dark'), updated dynamically
  const [systemTheme, setSystemTheme] = useState(() => getSystemPreference());

  // Resolved theme: if preference is 'system', use systemTheme; otherwise, use preference
  const resolvedTheme = preference === 'system' ? systemTheme : preference;

  // Effect: Listen for OS theme changes and update systemTheme
  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = (event) => {
      setSystemTheme(event.matches ? 'dark' : 'light');
    };

    const canUseEventListener = typeof mediaQuery.addEventListener === 'function';
    if (canUseEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
      return () => mediaQuery.removeEventListener('change', handleMediaChange);
    }

    if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(handleMediaChange);
      return () => mediaQuery.removeListener(handleMediaChange);
    }

    return undefined;
  }, []);

  // Effect: Apply resolved theme to DOM and persist preference
  useIsomorphicLayoutEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const root = document.documentElement; // <html> element
    const body = document.body; // <body> element
    const nextTheme = resolvedTheme === 'dark' ? 'dark' : 'light';

    // Toggle theme-related classes on <html> and <body>
    root.classList.toggle('dark', nextTheme === 'dark');
    root.dataset.theme = nextTheme;
    root.style.colorScheme = nextTheme;

    if (body) {
      body.dataset.theme = nextTheme;
      body.style.colorScheme = nextTheme;
    }

    // Persist preference to localStorage
    writeStoredTheme(preference);
  }, [resolvedTheme, preference]);

  // Effect: Sync theme changes across tabs/windows via storage events
  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleStorage = (event) => {
      if (event.key !== STORAGE_KEY) return;
      if (VALID_THEMES.includes(event.newValue)) {
        setPreference(event.newValue);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  /**
   * Sets the theme preference.
   * 
   * @param {string} nextTheme - 'light', 'dark', or 'system'.
   * If invalid, resets to 'system'.
   */
  const setThemePreference = useCallback((nextTheme) => {
    setPreference((current) => {
      if (!VALID_THEMES.includes(nextTheme)) {
        return 'system';
      }
      return nextTheme === current ? current : nextTheme;
    });
  }, []);

  /**
   * Toggles between light and dark themes.
   * If current preference is 'system', toggles to the opposite of systemTheme.
   */
  const toggleTheme = useCallback(() => {
    setPreference((current) => {
      if (current === 'system') {
        return systemTheme === 'dark' ? 'light' : 'dark';
      }
      return current === 'dark' ? 'light' : 'dark';
    });
  }, [systemTheme]);

  // Memoized context value to avoid unnecessary re-renders
  const value = useMemo(
    () => ({
      theme: resolvedTheme,        // Current applied theme ('light' or 'dark')
      preference,                  // User's preference ('light', 'dark', 'system')
      isDarkMode: resolvedTheme === 'dark', // Boolean for convenience
      setTheme: setThemePreference, // Alias for setThemePreference
      setPreference: setThemePreference, // Direct setter
      toggleTheme,                 // Toggle function
    }),
    [resolvedTheme, preference, setThemePreference, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

/**
 * Custom hook to access the theme context.
 * 
 * Must be used within a ThemeProvider; throws an error otherwise.
 * 
 * @returns {Object} Theme context value: { theme, preference, isDarkMode, setTheme, setPreference, toggleTheme }
 * @throws {Error} If used outside ThemeProvider.
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
