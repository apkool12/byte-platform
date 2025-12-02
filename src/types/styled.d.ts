import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      background: string;
      surface: string;
      surfaceOpaque: string;
      primary: string;
      text: {
        primary: string;
        secondary: string;
        tertiary: string;
      };
      border: string;
      success: string;
      warning: string;
      error: string;
    };
    shadows: {
      small: string;
      medium: string;
      large: string;
      glow: string;
    };
    borderRadius: {
      small: string;
      medium: string;
      large: string;
      xlarge: string;
    };
    blur: {
      default: string;
    };
  }
}

