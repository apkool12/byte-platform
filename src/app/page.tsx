"use client";

import styled from "styled-components";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Eye, EyeOff, User } from "lucide-react";
import { useState } from "react";
import { setCurrentUser } from "@/utils/permissions";
import { authApi } from "@/lib/api";

const Container = styled.div`
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.background};
  position: relative;
  overflow: hidden;
  padding: 1rem;
`;

const BackgroundGradient = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: ${({ theme }) =>
    theme.colors.background === "#0F0F0F"
      ? "radial-gradient(circle at 50% 0%, #1a1a1a 0%, #0F0F0F 100%)"
      : "radial-gradient(circle at 50% 0%, #eef2f6 0%, #F5F5F7 100%)"};
  z-index: 0;
`;

const LoginCard = styled(motion.div)`
  width: 100%;
  max-width: 400px;
  background: ${({ theme }) => theme.colors.surfaceOpaque};
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: ${({ theme }) => theme.shadows.large};
  border: 1px solid ${({ theme }) => theme.colors.border};
  z-index: 1;
  position: relative;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: 2rem;
    box-shadow: none;
    background: transparent;
    border: none;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
`;

const Logo = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: -1px;
  margin-bottom: 0.5rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const InputGroup = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  background: ${({ theme }) =>
    theme.colors.background === "#0F0F0F"
      ? "rgba(255, 255, 255, 0.05)"
      : "#F5F5F7"};
  border: 1px solid transparent;
  border-radius: 16px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;
  transition: all 0.2s ease;
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }

  &:focus {
    background: ${({ theme }) => theme.colors.surfaceOpaque};
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 4px
      ${({ theme }) =>
        theme.colors.background === "#0F0F0F"
          ? "rgba(62, 166, 255, 0.1)"
          : "rgba(0, 122, 255, 0.1)"};
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.text.tertiary};
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.text.tertiary};
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const LoginButton = styled(motion.button)`
  width: 100%;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Footer = styled.div`
  margin-top: 2rem;
  text-align: center;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    font-weight: 600;
    margin-left: 0.25rem;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Badge = styled.div`
  position: absolute;
  top: 2rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.5rem 1rem;
  background: ${({ theme }) => theme.colors.surfaceOpaque};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 100px;
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
  box-shadow: ${({ theme }) => theme.shadows.small};
  z-index: 2;
  white-space: nowrap;
`;

export default function LandingPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authApi.login(email, password);
      const { user } = response;

      setCurrentUser({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || "부원",
        department: user.department || "",
        studentId: user.studentId,
      });

      router.push("/dashboard");
    } catch (error: any) {
      alert(error.message || "로그인에 실패했습니다.");
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <BackgroundGradient />
      <Badge>국립한밭대학교 제 42대 컴퓨터공학과 학생회</Badge>

      <LoginCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Header>
          <Logo>Byte</Logo>
          <Subtitle>Run Together, Think Shaper</Subtitle>
        </Header>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <IconWrapper>
              <User size={20} />
            </IconWrapper>
            <Input
              type="text"
              placeholder="이메일 또는 이름"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </InputGroup>

          <InputGroup>
            <IconWrapper>
              <Lock size={20} />
            </IconWrapper>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </PasswordToggle>
          </InputGroup>

          <LoginButton
            type="submit"
            disabled={isLoading || !email || !password}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              "로그인 중..."
            ) : (
              <>
                로그인 <ArrowRight size={18} />
              </>
            )}
          </LoginButton>
        </Form>

        <Footer>
          계정이 없으신가요?
          <Link href="/signup">회원가입</Link>
        </Footer>
      </LoginCard>
    </Container>
  );
}
