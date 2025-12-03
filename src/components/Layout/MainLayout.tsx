'use client';

import styled from 'styled-components';
import Sidebar from './Sidebar';
import Header from './Header';
import { useState } from 'react';

const LayoutContainer = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
`;

const MainContent = styled.main`
  margin-left: 260px;
  margin-top: 64px;
  padding: 2rem;
  min-height: calc(100vh - 64px);
  transition: margin-left 0.3s ease-in-out;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    margin-left: 0;
    padding: 1rem;
  }
`;

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <LayoutContainer>
      <Header onMenuClick={() => setIsSidebarOpen(true)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <MainContent>{children}</MainContent>
    </LayoutContainer>
  );
}
