// src/contexts/ThemeContext.jsx
import { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from '../themes';

const STORAGE_KEY = 'themeMode';

/** Devuelve el modo inicial leyendo localStorage; si no existe, devuelve 'system'. */
const getInitialMode = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
  return 'system'; // default: respetar el SO
};

/** Lee la preferencia actual del SO. */
const getSystemPreference = () =>
  window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

// ─────────────────────────────────────────────────────────────────────────────
const ThemeContext = createContext(null);

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useThemeMode debe usarse dentro de ThemeProvider');
  return context;
};

// ─────────────────────────────────────────────────────────────────────────────
export const ThemeProvider = ({ children }) => {
  /**
   * themeMode: preferencia del usuario → 'light' | 'dark' | 'system'
   * resolvedMode: modo real aplicado → 'light' | 'dark'
   */
  const [themeMode, setThemeModeState] = useState(getInitialMode);
  const [systemPreference, setSystemPreference] = useState(getSystemPreference);

  // ── Escuchar cambios del SO siempre (para reflejarlos cuando mode === 'system') ──
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setSystemPreference(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  /** Cambia la preferencia y la persiste en localStorage. */
  const setThemeMode = useCallback((mode) => {
    if (!['light', 'dark', 'system'].includes(mode)) return;
    localStorage.setItem(STORAGE_KEY, mode);
    setThemeModeState(mode);
  }, []);

  /** Alterna entre light ↔ dark (compatibilidad hacia atrás). */
  const toggleTheme = useCallback(() => {
    setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
  }, [themeMode, setThemeMode]);

  /** Modo que realmente se aplica al tema de MUI. */
  const resolvedMode = themeMode === 'system' ? systemPreference : themeMode;

  const theme = useMemo(
    () => (resolvedMode === 'dark' ? darkTheme : lightTheme),
    [resolvedMode],
  );

  const value = useMemo(
    () => ({
      themeMode,        // 'light' | 'dark' | 'system'  ← preferencia guardada
      resolvedMode,     // 'light' | 'dark'              ← lo que MUI aplica realmente
      setThemeMode,     // (mode) => void
      toggleTheme,      // () => void  (compatibilidad)
      isDarkMode: resolvedMode === 'dark',
    }),
    [themeMode, resolvedMode, setThemeMode, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

/*import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from '../themes';

const ThemeContext = createContext();

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode debe usarse dentro de ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    // 1. Primero verificar si hay preferencia guardada en localStorage
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode === 'light' || savedMode === 'dark') {
      return savedMode;
    }
    
    // 2. Si no hay preferencia guardada, usar la del sistema operativo
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  });

  // Escuchar cambios en la preferencia del sistema (solo si no hay preferencia guardada)
  useEffect(() => {
    const savedMode = localStorage.getItem('themeMode');
    
    // Solo escuchar cambios del sistema si no hay preferencia manual guardada
    if (!savedMode) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e) => {
        setMode(e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  const toggleTheme = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode);
      return newMode;
    });
  };

  const theme = useMemo(
    () => (mode === 'light' ? lightTheme : darkTheme),
    [mode]
  );

  const value = {
    mode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};*/