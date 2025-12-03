'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { lightTheme, darkTheme, ThemeMode, getSystemTheme } from '@/styles/theme';

interface ThemeContextType {
  mode: ThemeMode;
  actualTheme: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeContextProvider');
  }
  return context;
}

interface ThemeContextProviderProps {
  children: React.ReactNode;
}

export function ThemeContextProvider({ children }: ThemeContextProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  // 로컬 스토리지에서 테마 설정 불러오기
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('theme') as ThemeMode | null;
      if (savedMode && (savedMode === 'light' || savedMode === 'dark' || savedMode === 'system')) {
        setModeState(savedMode);
      }
    }
  }, []);

  // 실제 테마 결정 (mode가 system이면 시스템 설정 따름)
  useEffect(() => {
    if (mode === 'system') {
      const systemTheme = getSystemTheme();
      setActualTheme(systemTheme);

      // 시스템 테마 변경 감지
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
        setActualTheme(e.matches ? 'dark' : 'light');
      };

      handleChange(mediaQuery);
      mediaQuery.addEventListener('change', handleChange);

      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      setActualTheme(mode);
    }
  }, [mode]);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newMode);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    if (mode === 'system') {
      // system 모드에서 토글하면 light/dark 중 하나로 전환
      const currentActual = actualTheme;
      setMode(currentActual === 'light' ? 'dark' : 'light');
    } else {
      // light/dark 모드에서는 반대로 전환
      setMode(mode === 'light' ? 'dark' : 'light');
    }
  }, [mode, actualTheme, setMode]);

  const currentTheme = actualTheme === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ mode, actualTheme, setMode, toggleTheme }}>
      <StyledThemeProvider theme={currentTheme}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
}

