"use client";

import styled from "styled-components";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  UserCircle,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { setCurrentUser } from "@/utils/permissions";

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 200;
  background: linear-gradient(135deg, #00050f 0%, #001a2e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const Badge = styled(motion.div)`
  position: absolute;
  top: 2rem;
  right: 2rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 100px;
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 10;
`;

const SignupContainer = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 3rem;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  z-index: 10;
  position: relative;
`;

const LogoSection = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const LogoText = styled(motion.svg)`
  width: 180px;
  height: 80px;
  overflow: visible;
  filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.2));
  font-family: "Pinyon Script", cursive;
  margin: 0 auto;

  @media (max-width: 768px) {
    width: 140px;
    height: 60px;
  }
`;

const WelcomeText = styled.div`
  margin-top: 1rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  font-weight: 400;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  text-align: center;
  margin-bottom: 2rem;
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
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  color: #fff;
  font-size: 0.95rem;
  transition: all 0.3s;
  outline: none;
  box-sizing: border-box;

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  &:focus {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.3);
    box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.1);
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.5);
  pointer-events: none;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;

  &:hover {
    color: rgba(255, 255, 255, 0.8);
  }
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const SignupButton = styled(motion.button)`
  width: 100%;
  padding: 1rem;
  background: #fff;
  color: #000;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  margin-top: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoginLink = styled.div`
  margin-top: 1.5rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;

  a {
    color: #fff;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const BackgroundDecor = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  overflow: hidden;
  pointer-events: none;
`;

const WolfSilhouette = styled.svg`
  position: absolute;
  bottom: -5vh;
  right: -10vw;
  width: 80vw;
  height: 80vh;
  opacity: 0.03;
  z-index: 2;
  pointer-events: none;
  filter: blur(1px);

  path {
    fill: #ffffff;
  }
`;

const Orb = styled(motion.div)<{
  $size: string;
  $color: string;
  $top: string;
  $left: string;
  $blur: string;
}>`
  position: absolute;
  width: ${({ $size }) => $size};
  height: ${({ $size }) => $size};
  background: ${({ $color }) => $color};
  top: ${({ $top }) => $top};
  left: ${({ $left }) => $left};
  border-radius: 50%;
  filter: blur(${({ $blur }) => $blur});
  opacity: 0.3;
  mix-blend-mode: screen;
`;

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    studentId: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        studentId: formData.studentId,
      });

      const { user } = response;

      // 회원가입 성공 시 자동 로그인 처리
      setCurrentUser({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || '회장',
        department: user.department || '',
        studentId: user.studentId,
      });
    } catch (error: any) {
      alert(error.message || "회원가입에 실패했습니다.");
      setIsLoading(false);
      return;
    }

    // 회원가입 성공 시 대시보드로 이동
    router.push("/dashboard");
    setIsLoading(false);
  };

  const isFormValid = () => {
    return (
      formData.name &&
      formData.email &&
      formData.studentId &&
      formData.password &&
      formData.confirmPassword &&
      formData.password === formData.confirmPassword
    );
  };

  return (
    <Container>
      <Badge
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        국립한밭대학교 제 42대 컴퓨터공학과 학생회
      </Badge>

      <SignupContainer
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <LogoSection>
          <LogoText viewBox="0 0 200 80">
            <motion.text
              x="100"
              y="50"
              textAnchor="middle"
              fontSize="48"
              fill="white"
              fontFamily="Pinyon Script, cursive"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              Byte
            </motion.text>
          </LogoText>
          <WelcomeText>Run Together, Think Shaper</WelcomeText>
        </LogoSection>

        <Title>회원가입</Title>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <IconWrapper>
              <User size={20} />
            </IconWrapper>
            <Input
              type="text"
              placeholder="이름"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              autoComplete="name"
            />
          </InputGroup>

          <InputGroup>
            <IconWrapper>
              <Mail size={20} />
            </IconWrapper>
            <Input
              type="email"
              placeholder="이메일"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              autoComplete="email"
            />
          </InputGroup>

          <InputGroup>
            <IconWrapper>
              <UserCircle size={20} />
            </IconWrapper>
            <Input
              type="text"
              placeholder="학번"
              value={formData.studentId}
              onChange={(e) =>
                setFormData({ ...formData, studentId: e.target.value })
              }
              required
              autoComplete="off"
            />
          </InputGroup>

          <InputGroup>
            <IconWrapper>
              <Lock size={20} />
            </IconWrapper>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="비밀번호"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              autoComplete="new-password"
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </PasswordToggle>
          </InputGroup>

          <InputGroup>
            <IconWrapper>
              <Lock size={20} />
            </IconWrapper>
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="비밀번호 확인"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              required
              autoComplete="new-password"
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </PasswordToggle>
          </InputGroup>

          <SignupButton
            type="submit"
            disabled={isLoading || !isFormValid()}
            whileHover={{ scale: isLoading || !isFormValid() ? 1 : 1.02 }}
            whileTap={{ scale: isLoading || !isFormValid() ? 1 : 0.98 }}
          >
            {isLoading ? (
              "가입 중..."
            ) : (
              <>
                회원가입
                <ArrowRight size={18} />
              </>
            )}
          </SignupButton>
        </Form>

        <LoginLink>
          이미 계정이 있으신가요? <Link href="/">로그인</Link>
        </LoginLink>
      </SignupContainer>

      <BackgroundDecor>
        <WolfSilhouette
          viewBox="0 0 500 500"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M250,100 C200,150 150,200 100,250 C150,300 200,350 250,400 C300,350 350,300 400,250 C350,200 300,150 250,100 Z" />
        </WolfSilhouette>
        <Orb
          $size="300px"
          $color="#4A90E2"
          $top="10%"
          $left="10%"
          $blur="80px"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <Orb
          $size="200px"
          $color="#7B68EE"
          $top="60%"
          $left="70%"
          $blur="60px"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </BackgroundDecor>
    </Container>
  );
}

