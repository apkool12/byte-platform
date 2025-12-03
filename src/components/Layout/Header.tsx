"use client";

import styled from "styled-components";
import Link from "next/link";
import { Bell, LogOut, User, Settings } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { authApi_extended, notificationsApi } from "@/lib/api";
import { getCurrentUser, setCurrentUser } from "@/utils/permissions";
import { Notification } from "@/types/notification";

const HeaderContainer = styled.header`
  height: 64px;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  background-color: ${({ theme }) => theme.colors.surface};
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
  color: ${({ theme }) => theme.colors.text.secondary};
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
    background-color: ${({ theme }) => theme.colors.border};
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
    background-color: ${({ theme }) => 
      theme.colors.background === '#0F0F0F' 
        ? 'rgba(255, 255, 255, 0.05)' 
        : 'rgba(0, 0, 0, 0.05)'
    };
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

const NotificationWrapper = styled.div`
  position: relative;
`;

const NotificationBadge = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  background-color: #dc3545;
  color: #fff;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.7rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
`;

const NotificationDropdown = styled(motion.div)`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(0, 0, 0, 0.08);
  min-width: 320px;
  max-width: 400px;
  max-height: 500px;
  overflow-y: auto;
  z-index: 1000;
`;

const NotificationHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NotificationTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
`;

const MarkAllReadButton = styled.button`
  font-size: 0.85rem;
  color: #007AFF;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(0, 122, 255, 0.1);
  }
`;

const NotificationList = styled.div`
  display: flex;
  flex-direction: column;
`;

const NotificationItem = styled.div<{ $unread: boolean }>`
  padding: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  cursor: pointer;
  background-color: ${({ $unread }) => ($unread ? '#f5f5f7' : '#fff')};
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ $unread }) => ($unread ? '#e5e5ea' : '#f5f5f7')};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const NotificationItemTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 0.25rem;
`;

const NotificationItemMessage = styled.div`
  font-size: 0.85rem;
  color: #86868b;
  line-height: 1.4;
`;

const NotificationItemTime = styled.div`
  font-size: 0.75rem;
  color: #86868b;
  margin-top: 0.25rem;
`;

const EmptyNotification = styled.div`
  padding: 2rem;
  text-align: center;
  color: #86868b;
  font-size: 0.9rem;
`;

export default function Header() {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

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
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    if (isDropdownOpen || isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen, isNotificationOpen]);

  useEffect(() => {
    // 알림 가져오기
    const loadNotifications = async () => {
      if (!user?.id) return;
      
      try {
        const [notificationsResponse, countResponse] = await Promise.all([
          notificationsApi.getAll(user.id),
          notificationsApi.getUnreadCount(user.id),
        ]);
        setNotifications(notificationsResponse.notifications);
        setUnreadCount(countResponse.count);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    };

    if (user?.id) {
      loadNotifications();
      // 30초마다 알림 새로고침
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await notificationsApi.markAsRead(notification.id);
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    // 관련 항목으로 이동
    if (notification.relatedPostId) {
      router.push(`/posts/${notification.relatedPostId}`);
    } else if (notification.relatedEventId) {
      router.push(`/calendar`);
    } else if (notification.relatedAgendaId) {
      router.push(`/agenda`);
    }
    
    setIsNotificationOpen(false);
  };

  const handleMarkAllRead = async () => {
    if (!user?.id) return;
    
    try {
      await notificationsApi.markAllAsRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

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
        <NotificationWrapper ref={notificationRef}>
          <IconButton onClick={() => setIsNotificationOpen(!isNotificationOpen)}>
            <Bell size={20} />
            {unreadCount > 0 && (
              <NotificationBadge>
                {unreadCount > 9 ? '9+' : unreadCount}
              </NotificationBadge>
            )}
          </IconButton>
          <AnimatePresence>
            {isNotificationOpen && (
              <NotificationDropdown
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <NotificationHeader>
                  <NotificationTitle>알림</NotificationTitle>
                  {unreadCount > 0 && (
                    <MarkAllReadButton onClick={handleMarkAllRead}>
                      모두 읽음
                    </MarkAllReadButton>
                  )}
                </NotificationHeader>
                <NotificationList>
                  {notifications.length === 0 ? (
                    <EmptyNotification>알림이 없습니다.</EmptyNotification>
                  ) : (
                    notifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        $unread={!notification.read}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <NotificationItemTitle>{notification.title}</NotificationItemTitle>
                        <NotificationItemMessage>{notification.message}</NotificationItemMessage>
                        <NotificationItemTime>{formatTime(notification.createdAt)}</NotificationItemTime>
                      </NotificationItem>
                    ))
                  )}
                </NotificationList>
              </NotificationDropdown>
            )}
          </AnimatePresence>
        </NotificationWrapper>
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
