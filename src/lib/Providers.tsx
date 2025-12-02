'use client';

import { ThemeProvider } from 'styled-components';
import StyledComponentsRegistry from './registry';
import GlobalStyle from '@/styles/GlobalStyle';
import { theme } from '@/styles/theme';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StyledComponentsRegistry>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        {children}
      </ThemeProvider>
    </StyledComponentsRegistry>
  );
}

