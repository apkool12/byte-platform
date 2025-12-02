"use client";

import styled from "styled-components";
import Link from "next/link";
import { Bell, LogOut, User, Settings } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { authApi_extended } from "@/lib/api";
import { getCurrentUser, setCurrentUser } from "@/utils/permissions";

const HeaderContainer = styled.header`
  height: 64px;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  z-index: 100;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const Logo = styled(Link)`
  font-size: 1.25rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: -0.5px;
  text-decoration: none;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.7;
  }
`;

const Slogan = styled.div`
  font-size: 0.9rem;
  font-weight: 400;
  color: #86868b;
  letter-spacing: 0.3px;
  position: relative;
  padding-left: 1.5rem;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 1px;
    height: 16px;
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const ProfileImage = styled.div<{ $image?: string }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ $image }) => ($image ? `url(${$image})` : 'linear-gradient(135deg, #e1e1e1 0%, #d1d1d6 100%)')};
  background-size: cover;
  background-position: center;
  cursor: pointer;
  border: 2px solid rgba(0, 0, 0, 0.05);
  transition: all 0.2s;

  &:hover {
    border-color: rgba(0, 0, 0, 0.1);
    transform: scale(1.05);
  }
`;

const ProfileDropdown = styled(motion.div)`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(0, 0, 0, 0.08);
  min-width: 200px;
  overflow: hidden;
  z-index: 1000;
`;

const DropdownItem = styled(Link)<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  color: ${({ $danger }) => ($danger ? '#dc3545' : '#1d1d1f')};
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  text-align: left;

  &:hover {
    background-color: ${({ $danger }) => ($danger ? 'rgba(220, 53, 69, 0.05)' : '#f5f5f7')};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const DropdownButton = styled.button<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  color: ${({ $danger }) => ($danger ? '#dc3545' : '#1d1d1f')};
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  text-align: left;

  &:hover {
    background-color: ${({ $danger }) => ($danger ? 'rgba(220, 53, 69, 0.05)' : '#f5f5f7')};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const DropdownDivider = styled.div`
  height: 1px;
  background: rgba(0, 0, 0, 0.05);
  margin: 0.25rem 0;
`;

const ProfileWrapper = styled.div`
  position: relative;
`;

export default function Header() {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadUserData = async () => {
      const currentUser = getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        try {
          const response = await import('@/lib/api').then(m => m.usersApi.getById(currentUser.id));
          if (response.user.profileImage) {
            setProfileImage(response.user.profileImage);
          } else if (typeof window !== 'undefined') {
            const localImage = localStorage.getItem('profileImage');
            if (localImage) {
              setProfileImage(localImage);
            }
          }
        } catch (error) {
          console.error('Failed to load user data:', error);
        }
      }
    };

    loadUserData();

    // 프로필 이미지 업데이트 이벤트 리스너
    const handleProfileImageUpdate = () => {
      if (typeof window !== 'undefined') {
        const image = localStorage.getItem('profileImage');
        setProfileImage(image);
      }
    };

    window.addEventListener('profileImageUpdated', handleProfileImageUpdate);

    return () => {
      window.removeEventListener('profileImageUpdated', handleProfileImageUpdate);
    };
  }, []);

  useEffect(() => {
    // 외부 클릭 시 드롭다운 닫기
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  const handleLogout = async () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      try {
        await authApi_extended.logout();
        
        // localStorage에서 사용자 정보 제거
        if (typeof window !== 'undefined') {
          localStorage.removeItem('currentUser');
          localStorage.removeItem('profileImage');
        }
        
        setCurrentUser(null);
        router.push('/');
      } catch (error: any) {
        console.error('Logout error:', error);
        // 에러가 나도 로그아웃 처리
        if (typeof window !== 'undefined') {
          localStorage.removeItem('currentUser');
          localStorage.removeItem('profileImage');
        }
        router.push('/');
      }
    }
  };

  return (
    <HeaderContainer>
      <LeftSection>
        <Logo href="/dashboard">BYTE</Logo>
        <Slogan>Run Together, Think Shaper</Slogan>
      </LeftSection>
      <RightSection>
        <IconButton>
          <Bell size={20} />
        </IconButton>
        <ProfileWrapper ref={dropdownRef}>
          <ProfileImage
            $image={profileImage || undefined}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          />
          <AnimatePresence>
            {isDropdownOpen && (
              <ProfileDropdown
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <DropdownItem href="/profile">
                  <User size={18} />
                  <span>프로필</span>
                </DropdownItem>
                <DropdownItem href="/settings">
                  <Settings size={18} />
                  <span>설정</span>
                </DropdownItem>
                <DropdownDivider />
                <DropdownButton $danger onClick={handleLogout}>
                  <LogOut size={18} />
                  <span>로그아웃</span>
                </DropdownButton>
              </ProfileDropdown>
            )}
          </AnimatePresence>
        </ProfileWrapper>
      </RightSection>
    </HeaderContainer>
  );
}
