"use client";

import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";
import { getCurrentUser } from "@/utils/permissions";
import { authApi_extended } from "@/lib/api";

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
  background: ${({ theme }) => theme.colors.surfaceOpaque};
  border-radius: 20px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  box-shadow: ${({ theme }) => theme.shadows.large};
  position: relative;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background === '#0F0F0F' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
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
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem 3rem 1rem 3rem;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surfaceOpaque};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.95rem;
  transition: all 0.2s;
  outline: none;
  box-sizing: border-box;

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }

  &:focus {
    background-color: ${({ theme }) => theme.colors.surfaceOpaque};
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.background === '#0F0F0F' ? 'rgba(62, 166, 255, 0.2)' : 'rgba(0, 0, 0, 0.05)'};
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  left: 1rem;
  bottom: 1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  pointer-events: none;
  display: flex;
  align-items: center;
  z-index: 1;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

const Button = styled(motion.button)<{ $primary?: boolean }>`
  flex: 1;
  padding: 1rem;
  border-radius: 12px;
  border: ${({ theme, $primary }) => ($primary ? "none" : `1px solid ${theme.colors.border}`)};
  background-color: ${({ theme, $primary }) => ($primary ? theme.colors.primary : theme.colors.surfaceOpaque)};
  color: ${({ theme, $primary }) => ($primary ? "#fff" : theme.colors.text.primary)};
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme, $primary }) => 
      $primary 
        ? (theme.colors.background === '#0F0F0F' ? '#5BB0FF' : '#0066CC')
        : (theme.colors.background === '#0F0F0F' ? 'rgba(255, 255, 255, 0.08)' : '#f5f5f7')
    };
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.85rem;
  margin-top: -0.5rem;
`;

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PasswordModal({ isOpen, onClose }: PasswordModalProps) {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    if (formData.newPassword.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    setIsLoading(true);

    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        alert("로그인이 필요합니다.");
        setIsLoading(false);
        return;
      }

      await authApi_extended.changePassword(
        formData.currentPassword,
        formData.newPassword,
        currentUser.id
      );

      alert("비밀번호가 변경되었습니다.");
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setIsLoading(false);
      onClose();
    } catch (error: any) {
      alert(error.message || "비밀번호 변경에 실패했습니다.");
      setIsLoading(false);
    }
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    onClose();
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
            <Title>비밀번호 변경</Title>
            <Form onSubmit={handleSubmit}>
              <InputGroup>
                <Label>현재 비밀번호</Label>
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, currentPassword: e.target.value })
                  }
                  placeholder="현재 비밀번호를 입력하세요"
                  required
                />
                <IconWrapper>
                  <Lock size={20} />
                </IconWrapper>
                <PasswordToggle
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </PasswordToggle>
              </InputGroup>

              <InputGroup>
                <Label>새 비밀번호</Label>
                <Input
                  type={showNewPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                  placeholder="새 비밀번호를 입력하세요"
                  required
                />
                <IconWrapper>
                  <Lock size={20} />
                </IconWrapper>
                <PasswordToggle
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </PasswordToggle>
              </InputGroup>

              <InputGroup>
                <Label>새 비밀번호 확인</Label>
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  placeholder="새 비밀번호를 다시 입력하세요"
                  required
                />
                <IconWrapper>
                  <Lock size={20} />
                </IconWrapper>
                <PasswordToggle
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </PasswordToggle>
              </InputGroup>

              {error && <ErrorMessage>{error}</ErrorMessage>}

              <ButtonGroup>
                <Button type="button" onClick={onClose}>
                  취소
                </Button>
                <Button type="submit" $primary disabled={isLoading}>
                  {isLoading ? "변경 중..." : "변경"}
                </Button>
              </ButtonGroup>
            </Form>
          </ModalContainer>
        </Overlay>
      )}
    </AnimatePresence>
  );
}

