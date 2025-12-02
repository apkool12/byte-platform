'use client';

import styled from 'styled-components';
import Sidebar from './Sidebar';
import Header from './Header';

const LayoutContainer = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
`;

const MainContent = styled.main`
  margin-left: 260px;
  margin-top: 64px;
  padding: 2rem;
  min-height: calc(100vh - 64px);
`;

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <LayoutContainer>
      <Header />
      <Sidebar />
      <MainContent>{children}</MainContent>
    </LayoutContainer>
  );
}
