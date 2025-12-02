"use client";

import styled from "styled-components";
import { motion } from "framer-motion";
import { User, Mail, UserCircle, Camera } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usersApi } from "@/lib/api";
import { getCurrentUser } from "@/utils/permissions";

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

const ProfileCard = styled.div`
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
  padding: 3rem;
  margin-bottom: 2rem;
`;

const ProfileImageSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const ProfileImageWrapper = styled.div`
  position: relative;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  overflow: visible;
  border: 4px solid rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #1d1d1f;
    transform: scale(1.02);
  }
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ProfilePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f5f5f7 0%, #e5e5ea 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #86868b;
`;

const CameraButton = styled.button`
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #1d1d1f;
  border: 3px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 10;

  &:hover {
    background-color: #000;
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const InfoLabel = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  color: #86868b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InfoValue = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const IconWrapper = styled.div`
  color: #86868b;
`;

const HiddenInput = styled.input`
  display: none;
`;

const EditButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background-color: #fff;
  color: #1d1d1f;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 1.5rem;
  width: 100%;

  &:hover {
    background-color: #f5f5f7;
    border-color: #1d1d1f;
  }
`;

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('profileImage');
    }
    return null;
  });
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    studentId: "",
    department: "",
    role: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        router.push('/');
        return;
      }

      try {
        const response = await usersApi.getById(currentUser.id);
        const user = response.user;
        setProfileData({
          name: user.name || "",
          email: user.email || "",
          studentId: user.studentId || "",
          department: user.department || "",
          role: user.role || "",
        });
        
        // 프로필 이미지 설정 (API 응답 또는 localStorage에서)
        if (user.profileImage) {
          setProfileImage(user.profileImage);
        } else if (typeof window !== 'undefined') {
          const localImage = localStorage.getItem('profileImage');
          if (localImage) {
            setProfileImage(localImage);
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchProfile();

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
  }, [router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result as string;
        setProfileImage(imageData);
        localStorage.setItem('profileImage', imageData);
        window.dispatchEvent(new Event('profileImageUpdated'));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleEdit = () => {
    router.push('/settings');
  };

  return (
    <Container>
      <Header>
        <Title>프로필</Title>
        <Subtitle>프로필 정보를 확인하고 수정하세요</Subtitle>
      </Header>

      <ProfileCard>
        <ProfileImageSection>
          <ProfileImageWrapper>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden' }}>
              {profileImage ? (
                <ProfileImage src={profileImage} alt="Profile" />
              ) : (
                <ProfilePlaceholder>
                  <User size={64} />
                </ProfilePlaceholder>
              )}
            </div>
            <CameraButton type="button" onClick={handleImageClick}>
              <Camera size={18} />
            </CameraButton>
          </ProfileImageWrapper>
          <HiddenInput
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1d1d1f', margin: 0 }}>
              {profileData.name}
            </h2>
            <p style={{ fontSize: '1rem', color: '#86868b', margin: '0.5rem 0 0 0' }}>
              {profileData.department} · {profileData.role}
            </p>
          </motion.div>
        </ProfileImageSection>

        <InfoGrid>
          <InfoItem>
            <InfoLabel>이메일</InfoLabel>
            <InfoValue>
              <IconWrapper>
                <Mail size={20} />
              </IconWrapper>
              {profileData.email}
            </InfoValue>
          </InfoItem>

          <InfoItem>
            <InfoLabel>학번</InfoLabel>
            <InfoValue>
              <IconWrapper>
                <UserCircle size={20} />
              </IconWrapper>
              {profileData.studentId}
            </InfoValue>
          </InfoItem>

          <InfoItem>
            <InfoLabel>부서</InfoLabel>
            <InfoValue>
              <IconWrapper>
                <User size={20} />
              </IconWrapper>
              {profileData.department}
            </InfoValue>
          </InfoItem>

          <InfoItem>
            <InfoLabel>역할</InfoLabel>
            <InfoValue>
              <IconWrapper>
                <User size={20} />
              </IconWrapper>
              {profileData.role}
            </InfoValue>
          </InfoItem>
        </InfoGrid>

        <EditButton
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleEdit}
        >
          <User size={18} />
          <span>프로필 수정</span>
        </EditButton>
      </ProfileCard>
    </Container>
  );
}

