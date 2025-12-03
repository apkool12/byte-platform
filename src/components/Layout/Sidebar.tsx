"use client";

import styled, { keyframes } from "styled-components";
import { Home, Calendar, FileText, Settings, Users, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { canManageMembers } from "@/utils/permissions";
import { useEffect, useState } from "react";

const shimmer = keyframes`
  0% {
    opacity: 0.6;
    transform: translateY(0px) scale(1);
  }
  50% {
    opacity: 1;
    transform: translateY(10px) scale(1.05);
  }
  100% {
    opacity: 0.6;
    transform: translateY(0px) scale(1);
  }
`;

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const SidebarContainer = styled.aside<{ $isOpen?: boolean }>`
  width: 260px;
  height: calc(100vh - 64px);
  position: fixed;
  left: 0;
  top: 64px;
  display: flex;
  flex-direction: column;
  padding: 2rem 1.25rem;
  z-index: 90;
  transition: transform 0.3s ease-in-out;
  background-color: ${({ theme }) => theme.colors.background};

  /* 데스크탑에서는 항상 표시 */
  @media (min-width: ${({ theme }) => `calc(${theme.breakpoints.mobile} + 1px)`}) {
    transform: translateX(0) !important;
  }

  /* 모바일에서는 상태에 따라 표시/숨김 */
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    transform: ${({ $isOpen }) => ($isOpen ? 'translateX(0)' : 'translateX(-100%)')};
    box-shadow: ${({ theme, $isOpen }) => ($isOpen ? theme.shadows.large : 'none')};
  }
`;

const Overlay = styled.div<{ $isOpen?: boolean }>`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 89;
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  pointer-events: ${({ $isOpen }) => ($isOpen ? 'auto' : 'none')};
  transition: opacity 0.3s ease-in-out;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    display: block;
  }
`;

const SidebarBackground = styled.div`
  position: absolute;
  border-top-right-radius: 30px;
  border-bottom-right-radius: 30px;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.colors.surface};
  backdrop-filter: ${({ theme }) => theme.blur.default};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  z-index: -1;
`;

const SidebarGlow = styled.div`
  position: absolute;
  top: 0;
  right: -2px;
  bottom: 0;
  width: 20px;
  background: ${({ theme }) => 
    theme.colors.background === '#0F0F0F' // 다크모드 체크
      ? `linear-gradient(180deg, rgba(62, 166, 255, 0.3) 0%, rgba(62, 166, 255, 0.1) 100%)`
      : `linear-gradient(180deg, rgba(238, 192, 198, 0.8) 0%, #87d3f6 100%)`
  };
  opacity: 0.8;
  filter: blur(20px);
  border-top-right-radius: 30px;
  border-bottom-right-radius: 30px;
  animation: ${shimmer} 4s ease-in-out infinite;
  z-index: -2;
  pointer-events: none;
`;

const NavList = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 2;
  position: relative;
  flex: 1;
`;

const NavItem = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.text.primary : theme.colors.text.secondary};
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.surfaceOpaque : "transparent"};
  box-shadow: ${({ theme, $active }) =>
    $active ? theme.shadows.small : "none"};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: ${({ $active }) => ($active ? 600 : 500)};
  font-size: 0.95rem;

  &:hover {
    background-color: ${({ theme, $active }) => {
      if ($active) return theme.colors.surfaceOpaque;
      // 다크모드와 라이트모드에 맞는 hover 색상
      return theme.colors.background === '#0F0F0F' 
        ? 'rgba(255, 255, 255, 0.05)' 
        : 'rgba(0, 0, 0, 0.03)';
    }};
    color: ${({ theme }) => theme.colors.text.primary};
    transform: ${({ $active }) => ($active ? "none" : "translateX(4px)")};
  }

  svg {
    color: ${({ theme, $active }) =>
      $active ? theme.colors.primary : "currentColor"};
  }
`;

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [canManage, setCanManage] = useState(false);

  useEffect(() => {
    setCanManage(canManageMembers());
  }, []);

  // 모바일에서 경로 변경 시 사이드바 닫기
  useEffect(() => {
    if (onClose && typeof window !== 'undefined') {
      const isMobile = window.innerWidth <= 768;
      if (isMobile && isOpen) {
        onClose();
      }
    }
  }, [pathname]); // onClose와 isOpen을 의존성에서 제거하여 무한 루프 방지

  return (
    <>
      <Overlay $isOpen={isOpen} onClick={onClose} />
      <SidebarContainer $isOpen={isOpen}>
        <SidebarBackground />
        <SidebarGlow />
        <NavList>
          <NavItem href="/dashboard" $active={pathname === "/dashboard"}>
            <Home size={20} />
            <span>대시보드</span>
          </NavItem>
          <NavItem href="/posts" $active={pathname === "/posts"}>
            <FileText size={20} />
            <span>게시판</span>
          </NavItem>
          <NavItem href="/calendar" $active={pathname === "/calendar"}>
            <Calendar size={20} />
            <span>일정</span>
          </NavItem>
          <NavItem href="/agenda" $active={pathname === "/agenda"}>
            <Zap size={20} />
            <span>안건</span>
          </NavItem>
          {canManage && (
            <NavItem href="/members" $active={pathname === "/members"}>
              <Users size={20} />
              <span>부원 관리</span>
            </NavItem>
          )}
          <NavItem href="/settings" $active={pathname === "/settings"}>
            <Settings size={20} />
            <span>설정</span>
          </NavItem>
        </NavList>
      </SidebarContainer>
    </>
  );
}
