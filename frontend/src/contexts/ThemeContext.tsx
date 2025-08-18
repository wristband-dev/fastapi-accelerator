import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  effectiveTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

  // Get system preference
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Calculate effective theme based on current theme setting
  const calculateEffectiveTheme = (currentTheme: Theme): 'light' | 'dark' => {
    if (currentTheme === 'system') {
      return getSystemTheme();
    }
    return currentTheme;
  };

  // Update theme and apply to document
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
    
    const effective = calculateEffectiveTheme(newTheme);
    setEffectiveTheme(effective);
    
    // Apply to document
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      if (effective === 'dark') {
        root.classList.add('dark');
        root.style.setProperty('--background', '#0a0a0a');
        root.style.setProperty('--foreground', '#ededed');
      } else {
        root.classList.remove('dark');
        root.style.setProperty('--background', '#ffffff');
        root.style.setProperty('--foreground', '#171717');
      }
    }
  };

  // Toggle between light and dark (ignoring system)
  const toggleTheme = () => {
    const newTheme = effectiveTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // Initialize theme on mount
  useEffect(() => {
    // Get saved theme or default to system
    const savedTheme = (typeof window !== 'undefined' ? localStorage.getItem('theme') : null) as Theme | null;
    const initialTheme = savedTheme || 'system';
    
    const effective = calculateEffectiveTheme(initialTheme);
    setThemeState(initialTheme);
    setEffectiveTheme(effective);
    
    // Apply initial theme
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      if (effective === 'dark') {
        root.classList.add('dark');
        root.style.setProperty('--background', '#0a0a0a');
        root.style.setProperty('--foreground', '#ededed');
      } else {
        root.classList.remove('dark');
        root.style.setProperty('--background', '#ffffff');
        root.style.setProperty('--foreground', '#171717');
      }
    }
  }, []);

  // Listen for system theme changes when using system theme
  useEffect(() => {
    if (theme !== 'system' || typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      const systemTheme = mediaQuery.matches ? 'dark' : 'light';
      setEffectiveTheme(systemTheme);
      
      const root = document.documentElement;
      if (systemTheme === 'dark') {
        root.classList.add('dark');
        root.style.setProperty('--background', '#0a0a0a');
        root.style.setProperty('--foreground', '#ededed');
      } else {
        root.classList.remove('dark');
        root.style.setProperty('--background', '#ffffff');
        root.style.setProperty('--foreground', '#171717');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        effectiveTheme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
