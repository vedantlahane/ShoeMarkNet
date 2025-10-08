import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'theme';
const VALID_THEMES = ['light', 'dark', 'system'];

const ThemeContext = createContext(undefined);

const getSystemPreference = () => {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

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

export const ThemeProvider = ({ children }) => {
  const [preference, setPreference] = useState(() => readStoredTheme() || 'system');
  const [systemTheme, setSystemTheme] = useState(() => getSystemPreference());

  const resolvedTheme = preference === 'system' ? systemTheme : preference;

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = (event) => {
      setSystemTheme(event.matches ? 'dark' : 'light');
    };

    try {
      mediaQuery.addEventListener('change', handleMediaChange);
    } catch (error) {
      mediaQuery.addListener(handleMediaChange);
    }

    return () => {
      try {
        mediaQuery.removeEventListener('change', handleMediaChange);
      } catch (error) {
        mediaQuery.removeListener(handleMediaChange);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const root = document.documentElement;
    const body = document.body;
    const nextTheme = resolvedTheme === 'dark' ? 'dark' : 'light';

    if (nextTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    if (body) {
      body.dataset.theme = nextTheme;
    }

    writeStoredTheme(preference);
  }, [resolvedTheme, preference]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleStorage = (event) => {
      if (event.key === STORAGE_KEY && VALID_THEMES.includes(event.newValue)) {
        setPreference(event.newValue);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const setThemePreference = useCallback((nextTheme) => {
    if (!VALID_THEMES.includes(nextTheme)) {
      setPreference('system');
      return;
    }
    setPreference(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setPreference((current) => {
      if (current === 'system') {
        return systemTheme === 'dark' ? 'light' : 'dark';
      }
      return current === 'dark' ? 'light' : 'dark';
    });
  }, [systemTheme]);

  const value = useMemo(() => ({
    theme: resolvedTheme,
    preference,
    isDarkMode: resolvedTheme === 'dark',
    setTheme: setThemePreference,
    setPreference: setThemePreference,
    toggleTheme,
  }), [resolvedTheme, preference, setThemePreference, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
