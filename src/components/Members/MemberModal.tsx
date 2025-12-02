"use client";

import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { Member, DEPARTMENTS, ROLES } from "@/types/member";

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(8px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const ModalContainer = styled(motion.div)`
  background: #fff;
  width: 100%;
  max-width: 520px;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow-y: auto;
  max-height: 90vh;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: #f5f5f7;
  border: none;
  cursor: pointer;
  color: #86868b;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background-color: #e5e5ea;
    color: #1d1d1f;
  }
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.75rem;
  color: #1d1d1f;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
`;

const Label = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  color: #86868b;
`;

const Input = styled.input`
  padding: 0.85rem 1rem;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  font-size: 0.95rem;
  background-color: #fbfbfd;
  color: #1d1d1f;
  transition: all 0.2s;
  width: 100%;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #007aff;
    background-color: #fff;
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
  }

  &::placeholder {
    color: #c7c7cc;
  }
`;

const Select = styled.select`
  padding: 0.85rem 1rem;
  padding-right: 2.5rem;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  font-size: 0.95rem;
  background-color: #fbfbfd;
  color: #1d1d1f;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23333%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem top 50%;
  background-size: 0.65rem auto;
  width: 100%;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #007aff;
    background-color: #fff;
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
  }
`;

const GridRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

const Button = styled.button<{ $primary?: boolean; $danger?: boolean }>`
  padding: 0.85rem 1.5rem;
  border-radius: 10px;
  border: none;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;

  ${({ $primary, $danger }) => {
    if ($danger) {
      return `
        background-color: #fff;
        color: #FF3B30;
        border: 1px solid #FF3B30;
        &:hover { 
          background-color: #FFF5F5; 
        }
      `;
    }
    if ($primary) {
      return `
        background-color: #1d1d1f;
        color: white;
        &:hover { 
          background-color: #000; 
          transform: translateY(-1px);
        }
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      `;
    }
    return `
      background-color: #f5f5f7;
      color: #1d1d1f;
      &:hover { 
        background-color: #e5e5ea; 
      }
    `;
  }}
`;

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (member: Omit<Member, "id">) => void;
  onDelete?: () => void;
  initialData?: Member;
}

export default function MemberModal({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  initialData,
}: MemberModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    studentId: "",
    role: "부원",
    department: "기획부",
    phone: "",
    active: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        studentId: initialData.studentId,
        role: initialData.role,
        department: initialData.department,
        phone: initialData.phone,
        active: initialData.active,
      });
    } else {
      setFormData({
        name: "",
        studentId: "",
        role: "부원",
        department: "기획부",
        phone: "",
        active: true,
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as Omit<Member, "id">);
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
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <CloseButton onClick={onClose}>
              <X size={18} />
            </CloseButton>
            <Title>{initialData ? "부원 정보 수정" : "새 부원 추가"}</Title>
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>이름</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="이름을 입력하세요"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>학번</Label>
                <Input
                  value={formData.studentId}
                  onChange={(e) =>
                    setFormData({ ...formData, studentId: e.target.value })
                  }
                  placeholder="학번 8자리"
                  required
                />
              </FormGroup>

              <GridRow>
                <FormGroup>
                  <Label>부서</Label>
                  <Select
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </Select>
                </FormGroup>
                <FormGroup>
                  <Label>직책</Label>
                  <Select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </Select>
                </FormGroup>
              </GridRow>

              <FormGroup>
                <Label>연락처</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="010-0000-0000"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>활동 상태</Label>
                <Select
                  value={formData.active ? "true" : "false"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      active: e.target.value === "true",
                    })
                  }
                >
                  <option value="true">활동중</option>
                  <option value="false">활동중지</option>
                </Select>
              </FormGroup>

              <ButtonGroup>
                {initialData && onDelete && (
                  <Button
                    type="button"
                    $danger
                    onClick={() => {
                      onDelete();
                      onClose();
                    }}
                  >
                    삭제
                  </Button>
                )}
                <Button type="button" onClick={onClose}>
                  취소
                </Button>
                <Button type="submit" $primary>
                  {initialData ? "저장하기" : "추가하기"}
                </Button>
              </ButtonGroup>
            </Form>
          </ModalContainer>
        </Overlay>
      )}
    </AnimatePresence>
  );
}
