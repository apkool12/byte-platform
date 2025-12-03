'use client';

import StyledComponentsRegistry from './registry';
import GlobalStyle from '@/styles/GlobalStyle';
import { ThemeContextProvider } from '@/contexts/ThemeContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StyledComponentsRegistry>
      <ThemeContextProvider>
        <GlobalStyle />
        {children}
      </ThemeContextProvider>
    </StyledComponentsRegistry>
  );
}

