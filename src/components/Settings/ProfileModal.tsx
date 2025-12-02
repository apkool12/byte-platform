"use client";

import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Mail, UserCircle, Camera, Upload } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { usersApi } from '@/lib/api';
import { getCurrentUser, setCurrentUser } from '@/utils/permissions';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const ModalContainer = styled(motion.div)`
  background: #fff;
  border-radius: 20px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #86868b;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: #1d1d1f;
  }
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 1.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const InputGroup = styled.div`
  position: relative;
`;

const Label = styled.label`
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem 3rem 1rem 3rem;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background-color: #fbfbfd;
  color: #1d1d1f;
  font-size: 0.95rem;
  transition: all 0.2s;
  outline: none;
  box-sizing: border-box;

  &::placeholder {
    color: #86868b;
  }

  &:focus {
    background-color: #fff;
    border-color: #1d1d1f;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  left: 1rem;
  bottom: 1rem;
  color: #86868b;
  pointer-events: none;
  display: flex;
  align-items: center;
  z-index: 1;
`;

const ProfileImageSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const ProfileImageWrapper = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: visible;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
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

const ImageContainer = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  
  ${ProfileImageWrapper}:hover & {
    border-color: #1d1d1f;
  }
`;

const CameraButton = styled.button`
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 36px;
  height: 36px;
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

const HiddenInput = styled.input`
  display: none;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #86868b;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;

  &:hover {
    color: #1d1d1f;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

const Button = styled(motion.button)<{ $primary?: boolean; $danger?: boolean }>`
  flex: 1;
  padding: 1rem;
  border-radius: 12px;
  border: ${({ $primary, $danger }) => {
    if ($primary || $danger) return "none";
    return "1px solid rgba(0, 0, 0, 0.08)";
  }};
  background-color: ${({ $primary, $danger }) => {
    if ($danger) return "#dc3545";
    if ($primary) return "#1d1d1f";
    return "#fff";
  }};
  color: ${({ $primary, $danger }) => {
    if ($primary || $danger) return "#fff";
    return "#1d1d1f";
  }};
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ $primary, $danger }) => {
      if ($danger) return "#c82333";
      if ($primary) return "#000";
      return "#f5f5f7";
    }};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    studentId: "",
    department: "",
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      const currentUser = getCurrentUser();
      if (currentUser) {
        try {
          const response = await usersApi.getById(currentUser.id);
          const user = response.user;
          setFormData({
            name: user.name || '',
            phone: user.phone || '',
            studentId: user.studentId || '',
            department: user.department || '',
          });
          
          if (user.profileImage) {
            setProfileImage(user.profileImage);
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

    if (isOpen) {
      loadUserData();
    }
  }, [isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result as string;
        setProfileImage(imageData);
        // localStorage에 저장
        localStorage.setItem('profileImage', imageData);
        // 커스텀 이벤트 발생시켜 헤더 업데이트
        window.dispatchEvent(new Event('profileImageUpdated'));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        alert("로그인이 필요합니다.");
        setIsLoading(false);
        return;
      }

      // 프로필 이미지가 있으면 formData에 추가
      const updateData: any = {
        name: formData.name,
        phone: formData.phone,
        studentId: formData.studentId,
        department: formData.department,
      };

      if (profileImage) {
        updateData.profileImage = profileImage;
      }

      const response = await usersApi.update(currentUser.id, updateData);
      
      // 현재 사용자 정보 업데이트
      setCurrentUser({
        ...currentUser,
        ...response.user,
      });

      // 프로필 이미지 업데이트 이벤트 발생
      if (profileImage) {
        window.dispatchEvent(new Event('profileImageUpdated'));
      }

      alert("프로필 정보가 수정되었습니다.");
      setIsLoading(false);
      onClose();
    } catch (error: any) {
      alert(error.message || "프로필 수정에 실패했습니다.");
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <ModalContainer
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <CloseButton onClick={onClose}>
              <X size={18} />
            </CloseButton>
            <Title>프로필 정보</Title>
            <Form onSubmit={handleSubmit}>
              <ProfileImageSection>
          <ProfileImageWrapper onClick={handleImageClick}>
            <ImageContainer>
              {profileImage ? (
                <ProfileImage src={profileImage} alt="Profile" />
              ) : (
                <ProfilePlaceholder>
                  <User size={48} />
                </ProfilePlaceholder>
              )}
            </ImageContainer>
            <CameraButton type="button" onClick={(e) => e.stopPropagation()}>
              <Camera size={18} />
            </CameraButton>
          </ProfileImageWrapper>
                <HiddenInput
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </ProfileImageSection>

              <InputGroup>
                <Label>이름</Label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
                <IconWrapper>
                  <User size={20} />
                </IconWrapper>
              </InputGroup>

              <InputGroup>
                <Label>이메일 (수정 불가)</Label>
                <Input
                  type="email"
                  value={getCurrentUser()?.email || ''}
                  disabled
                  style={{ backgroundColor: '#f5f5f7', color: '#86868b' }}
                />
                <IconWrapper>
                  <Mail size={20} />
                </IconWrapper>
              </InputGroup>

              <InputGroup>
                <Label>학번</Label>
                <Input
                  type="text"
                  value={formData.studentId}
                  onChange={(e) =>
                    setFormData({ ...formData, studentId: e.target.value })
                  }
                  required
                />
                <IconWrapper>
                  <UserCircle size={20} />
                </IconWrapper>
              </InputGroup>

              <ButtonGroup>
                <Button type="button" onClick={onClose}>
                  취소
                </Button>
                <Button type="submit" $primary disabled={isLoading}>
                  {isLoading ? "저장 중..." : "저장"}
                </Button>
              </ButtonGroup>
            </Form>
          </ModalContainer>
        </Overlay>
      )}
    </AnimatePresence>
  );
}

