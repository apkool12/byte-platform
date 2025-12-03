"use client";

import styled from "styled-components";
import { motion } from "framer-motion";
import {
  User,
  Bell,
  Moon,
  Shield,
  LogOut,
  Save,
  ChevronRight,
  Mail,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProfileModal from "@/components/Settings/ProfileModal";
import PasswordModal from "@/components/Settings/PasswordModal";
import { getCurrentUser } from "@/utils/permissions";
import { usersApi } from "@/lib/api";
import { useTheme } from "@/contexts/ThemeContext";

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const Header = styled.div`
  margin-bottom: 2.5rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: -0.5px;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 0.95rem;
  color: #86868b;
`;

const SettingsSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.75rem;
  padding: 0 0.5rem;
`;

const SettingsCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surfaceOpaque};
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme.shadows.small};
  border: 1px solid ${({ theme }) => theme.colors.border};
  overflow: hidden;
`;

const SettingItem = styled.div<{ $clickable?: boolean }>`
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background-color 0.15s;
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${({ theme }) => 
      theme.colors.background === '#0F0F0F' 
        ? 'rgba(255, 255, 255, 0.03)' 
        : theme.colors.background
    };
  }
`;

const SettingLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
`;

const SettingIcon = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const SettingInfo = styled.div`
  flex: 1;
`;

const SettingLabel = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.2rem;
`;

const SettingDescription = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Toggle = styled.button<{ $active: boolean }>`
  width: 50px;
  height: 30px;
  border-radius: 15px;
  border: none;
  background-color: ${({ theme, $active }) => 
    $active 
      ? theme.colors.primary 
      : (theme.colors.background === '#0F0F0F' ? '#3F3F3F' : '#e5e5ea')
  };
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s;

  &::after {
    content: "";
    position: absolute;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background-color: ${({ theme }) => 
      theme.colors.background === '#0F0F0F' ? theme.colors.surfaceOpaque : '#fff'
    };
    top: 2px;
    left: ${({ $active }) => ($active ? "22px" : "2px")};
    transition: left 0.2s;
    box-shadow: ${({ theme }) => theme.shadows.small};
  }
`;

const Select = styled.select`
  padding: 0.5rem 2rem 0.5rem 0.75rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.9rem;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22${({ theme }) => theme.colors.background === '#0F0F0F' ? '%23fff' : '%23333'}%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem top 50%;
  background-size: 0.65rem auto;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => 
      theme.colors.background === '#0F0F0F' 
        ? 'rgba(62, 166, 255, 0.2)' 
        : 'rgba(0, 0, 0, 0.05)'
    };
  }
`;

const Button = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  border: none;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 2rem;
  width: 100%;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => 
      theme.colors.background === '#0F0F0F' 
        ? '#5BB0FF' 
        : '#0066CC'
    };
  }
`;

export default function SettingsPage() {
  const router = useRouter();
  const currentUser = getCurrentUser();
  const { mode, actualTheme, setMode } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [language, setLanguage] = useState("ko");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 현재 사용자의 이메일 알림 설정 불러오기
  useEffect(() => {
    if (
      currentUser &&
      (currentUser as any).emailNotificationEnabled !== undefined
    ) {
      setEmailAlerts((currentUser as any).emailNotificationEnabled ?? true);
    }
  }, [currentUser]);

  const handleEmailAlertsToggle = async () => {
    if (!currentUser) return;

    const newValue = !emailAlerts;
    setEmailAlerts(newValue);

    try {
      await usersApi.update(currentUser.id, {
        emailNotificationEnabled: newValue,
      } as any);

      // 로컬 사용자 정보 업데이트
      const updatedUser = {
        ...currentUser,
        emailNotificationEnabled: newValue,
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("이메일 알림 설정 업데이트 실패:", error);
      setEmailAlerts(!newValue); // 롤백
      alert("설정 업데이트에 실패했습니다.");
    }
  };

  // 테마 설정은 즉시 저장되므로 별도 저장 버튼 필요 없음
  const handleSave = () => {
    // 다른 설정 저장 로직이 필요하면 여기에 추가
    alert("설정이 저장되었습니다.");
  };

  const handleLogout = async () => {
    if (confirm("로그아웃 하시겠습니까?")) {
      try {
        const { authApi_extended } = await import("@/lib/api");
        const { setCurrentUser } = await import("@/utils/permissions");

        await authApi_extended.logout();

        // localStorage에서 사용자 정보 제거
        if (typeof window !== "undefined") {
          localStorage.removeItem("currentUser");
          localStorage.removeItem("profileImage");
        }

        setCurrentUser(null);
        router.push("/");
      } catch (error: any) {
        console.error("Logout error:", error);
        // 에러가 나도 로그아웃 처리
        if (typeof window !== "undefined") {
          localStorage.removeItem("currentUser");
          localStorage.removeItem("profileImage");
        }
        router.push("/");
      }
    }
  };

  return (
    <Container>
      <Header>
        <Title>설정</Title>
        <Subtitle>플랫폼 설정을 관리하세요</Subtitle>
      </Header>

      <SettingsSection>
        <SectionTitle>프로필</SectionTitle>
        <SettingsCard>
          <SettingItem $clickable onClick={() => setIsProfileModalOpen(true)}>
            <SettingLeft>
              <SettingIcon>
                <User size={20} />
              </SettingIcon>
              <SettingInfo>
                <SettingLabel>프로필 정보</SettingLabel>
                <SettingDescription>
                  이름, 이메일 등 기본 정보 수정
                </SettingDescription>
              </SettingInfo>
            </SettingLeft>
            <ChevronRight size={20} color="#86868b" />
          </SettingItem>
        </SettingsCard>
      </SettingsSection>

      <SettingsSection>
        <SectionTitle>알림</SectionTitle>
        <SettingsCard>
          <SettingItem>
            <SettingLeft>
              <SettingIcon>
                <Bell size={20} />
              </SettingIcon>
              <SettingInfo>
                <SettingLabel>푸시 알림</SettingLabel>
                <SettingDescription>새로운 알림을 받습니다</SettingDescription>
              </SettingInfo>
            </SettingLeft>
            <Toggle
              $active={notifications}
              onClick={() => setNotifications(!notifications)}
            />
          </SettingItem>
          <SettingItem>
            <SettingLeft>
              <SettingIcon>
                <Mail size={20} />
              </SettingIcon>
              <SettingInfo>
                <SettingLabel>이메일 수신 동의</SettingLabel>
                <SettingDescription>
                  멘션 및 부서 게시글 알림을 이메일로 받습니다
                </SettingDescription>
              </SettingInfo>
            </SettingLeft>
            <Toggle $active={emailAlerts} onClick={handleEmailAlertsToggle} />
          </SettingItem>
        </SettingsCard>
      </SettingsSection>

      <SettingsSection>
        <SectionTitle>표시</SectionTitle>
        <SettingsCard>
          <SettingItem>
            <SettingLeft>
              <SettingIcon>
                <Moon size={20} />
              </SettingIcon>
              <SettingInfo>
                <SettingLabel>테마</SettingLabel>
                <SettingDescription>
                  {mode === "system"
                    ? `시스템 설정 (${
                        actualTheme === "dark" ? "다크" : "라이트"
                      })`
                    : mode === "dark"
                    ? "다크 모드"
                    : "라이트 모드"}
                </SettingDescription>
              </SettingInfo>
            </SettingLeft>
            <Select
              value={mode}
              onChange={(e) =>
                setMode(e.target.value as "light" | "dark" | "system")
              }
            >
              <option value="light">라이트</option>
              <option value="dark">다크</option>
              <option value="system">시스템 설정</option>
            </Select>
          </SettingItem>
          <SettingItem>
            <SettingLeft>
              <SettingIcon>
                <Moon size={20} />
              </SettingIcon>
              <SettingInfo>
                <SettingLabel>언어</SettingLabel>
                <SettingDescription>표시 언어를 선택하세요</SettingDescription>
              </SettingInfo>
            </SettingLeft>
            <Select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="ko">한국어</option>
              <option value="en">English</option>
            </Select>
          </SettingItem>
        </SettingsCard>
      </SettingsSection>

      <SettingsSection>
        <SectionTitle>보안</SectionTitle>
        <SettingsCard>
          <SettingItem $clickable onClick={() => setIsPasswordModalOpen(true)}>
            <SettingLeft>
              <SettingIcon>
                <Shield size={20} />
              </SettingIcon>
              <SettingInfo>
                <SettingLabel>비밀번호 변경</SettingLabel>
                <SettingDescription>
                  계정 보안을 위해 비밀번호를 변경하세요
                </SettingDescription>
              </SettingInfo>
            </SettingLeft>
            <ChevronRight size={20} color="#86868b" />
          </SettingItem>
        </SettingsCard>
      </SettingsSection>

      <SettingsSection>
        <SectionTitle>계정</SectionTitle>
        <SettingsCard>
          <SettingItem $clickable onClick={handleLogout}>
            <SettingLeft>
              <SettingIcon>
                <LogOut size={20} />
              </SettingIcon>
              <SettingInfo>
                <SettingLabel>로그아웃</SettingLabel>
                <SettingDescription>
                  현재 계정에서 로그아웃합니다
                </SettingDescription>
              </SettingInfo>
            </SettingLeft>
            <ChevronRight size={20} color="#86868b" />
          </SettingItem>
        </SettingsCard>
      </SettingsSection>

      <Button whileTap={{ scale: 0.98 }} onClick={handleSave}>
        <Save size={18} />
        설정 저장
      </Button>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </Container>
  );
}
