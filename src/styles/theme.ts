export type ThemeMode = 'light' | 'dark' | 'system';

export const lightTheme = {
  colors: {
    background: '#F5F5F7', // Apple standard background
    surface: 'rgba(255, 255, 255, 0.8)', // Transparent for blur
    surfaceOpaque: '#FFFFFF',
    primary: '#007AFF',
    text: {
      primary: '#1D1D1F',
      secondary: '#86868B',
      tertiary: '#BFBFBF',
    },
    border: 'rgba(0, 0, 0, 0.05)',
    success: '#34C759',
    warning: '#FF9F0A',
    error: '#FF3B30',
  },
  shadows: {
    small: '0 2px 8px rgba(0, 0, 0, 0.02)',
    medium: '0 12px 24px rgba(0, 0, 0, 0.04)',
    large: '0 24px 48px rgba(0, 0, 0, 0.08)',
    glow: '0 0 20px rgba(0, 122, 255, 0.15)',
  },
  borderRadius: {
    small: '10px',
    medium: '16px',
    large: '24px',
    xlarge: '32px',
  },
  blur: {
    default: 'blur(20px)',
  },
};

export const darkTheme = {
  colors: {
    background: '#0F0F0F', // YouTube-style dark gray background
    surface: 'rgba(30, 30, 30, 0.9)', // Dark surface with transparency
    surfaceOpaque: '#181818', // YouTube-style dark surface opaque
    primary: '#3EA6FF', // YouTube-style blue for dark mode
    text: {
      primary: '#FFFFFF',
      secondary: '#AAAAAA', // Slightly lighter gray for better readability
      tertiary: '#717171',
    },
    border: 'rgba(255, 255, 255, 0.1)',
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A',
  },
  shadows: {
    small: '0 2px 8px rgba(0, 0, 0, 0.5)',
    medium: '0 12px 24px rgba(0, 0, 0, 0.6)',
    large: '0 24px 48px rgba(0, 0, 0, 0.7)',
    glow: '0 0 20px rgba(62, 166, 255, 0.3)',
  },
  borderRadius: {
    small: '10px',
    medium: '16px',
    large: '24px',
    xlarge: '32px',
  },
  blur: {
    default: 'blur(20px)',
  },
};

// 기본 테마는 라이트 모드 (하위 호환성 유지)
export const theme = lightTheme;

// 시스템 테마 감지
export const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};
