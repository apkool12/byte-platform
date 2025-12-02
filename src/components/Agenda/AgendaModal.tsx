"use client";

import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { X, Trash2 } from "lucide-react";
import {
  Agenda,
  AGENDA_CATEGORIES,
  AGENDA_STATUS,
  AGENDA_PRIORITY,
} from "@/types/agenda";
import { usersApi, postsApi, eventsApi } from "@/lib/api";
import { DEPARTMENTS } from "@/types/member";
import CustomDropdown from "./CustomDropdown";

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
  max-width: 600px;
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

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: #1d1d1f;
`;

const Input = styled.input`
  padding: 0.875rem 1rem;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background-color: #fbfbfd;
  color: #1d1d1f;
  font-size: 0.95rem;
  transition: all 0.2s;
  outline: none;

  &:focus {
    background-color: #fff;
    border-color: #1d1d1f;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
  }
`;

const Textarea = styled.textarea`
  padding: 0.875rem 1rem;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background-color: #fbfbfd;
  color: #1d1d1f;
  font-size: 0.95rem;
  transition: all 0.2s;
  outline: none;
  resize: vertical;
  min-height: 120px;
  font-family: inherit;

  &:focus {
    background-color: #fff;
    border-color: #1d1d1f;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
  }
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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

interface AgendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    agenda: Omit<
      Agenda,
      "id" | "createdAt" | "updatedAt" | "createdBy" | "createdById"
    >
  ) => void;
  onDelete?: () => void;
  agenda?: Agenda;
}

export default function AgendaModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  agenda,
}: AgendaModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "회의안건" as Agenda["category"],
    status: "진행중" as Agenda["status"],
    priority: "보통" as Agenda["priority"],
    assignedTo: "",
    department: "",
    relatedPostId: undefined as number | undefined,
    relatedEventId: undefined as string | undefined,
  });

  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, postsRes, eventsRes] = await Promise.all([
          usersApi.getAll(),
          postsApi.getAll(),
          eventsApi.getAll(),
        ]);
        setUsers(usersRes.users);
        setPosts(postsRes.posts);
        setEvents(eventsRes.events);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (agenda) {
      setFormData({
        title: agenda.title,
        description: agenda.description,
        category: agenda.category,
        status: agenda.status,
        priority: agenda.priority,
        assignedTo: agenda.assignedTo || "",
        department: agenda.department || "",
        relatedPostId: agenda.relatedPostId,
        relatedEventId: agenda.relatedEventId,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        category: "회의안건",
        status: "진행중",
        priority: "보통",
        assignedTo: "",
        department: "",
        relatedPostId: undefined,
        relatedEventId: undefined,
      });
    }
  }, [agenda, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    const saveData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      status: formData.status,
      priority: formData.priority,
      assignedTo:
        formData.assignedTo && formData.assignedTo.trim()
          ? formData.assignedTo.trim()
          : undefined,
      department:
        formData.department && formData.department.trim()
          ? formData.department.trim()
          : undefined,
      relatedPostId: formData.relatedPostId || undefined,
      relatedEventId: formData.relatedEventId || undefined,
    };

    onSave(saveData);
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
            <Title>{agenda ? "안건 수정" : "안건 추가"}</Title>
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>제목 *</Label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="안건 제목을 입력하세요"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>설명</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="안건 설명을 입력하세요"
                />
              </FormGroup>

              <Row>
                <FormGroup>
                  <Label>분류</Label>
                  <CustomDropdown
                    value={formData.category}
                    options={AGENDA_CATEGORIES.map((cat) => ({
                      value: cat,
                      label: cat,
                    }))}
                    onChange={(value) =>
                      setFormData({
                        ...formData,
                        category: value as Agenda["category"],
                      })
                    }
                    placeholder="분류 선택"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>상태</Label>
                  <CustomDropdown
                    value={formData.status}
                    options={AGENDA_STATUS.map((status) => ({
                      value: status,
                      label: status,
                    }))}
                    onChange={(value) =>
                      setFormData({
                        ...formData,
                        status: value as Agenda["status"],
                      })
                    }
                    placeholder="상태 선택"
                  />
                </FormGroup>
              </Row>

              <Row>
                <FormGroup>
                  <Label>우선순위</Label>
                  <CustomDropdown
                    value={formData.priority}
                    options={AGENDA_PRIORITY.map((priority) => ({
                      value: priority,
                      label: priority,
                    }))}
                    onChange={(value) =>
                      setFormData({
                        ...formData,
                        priority: value as Agenda["priority"],
                      })
                    }
                    placeholder="우선순위 선택"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>담당 부서</Label>
                  <CustomDropdown
                    value={formData.department}
                    options={[
                      { value: "", label: "선택 안 함" },
                      ...DEPARTMENTS.map((dept) => ({
                        value: dept,
                        label: dept,
                      })),
                    ]}
                    onChange={(value) =>
                      setFormData({ ...formData, department: value || "" })
                    }
                    placeholder="담당 부서 선택"
                  />
                </FormGroup>
              </Row>

              <FormGroup>
                <Label>담당자</Label>
                <CustomDropdown
                  value={formData.assignedTo}
                  options={[
                    { value: "", label: "선택 안 함" },
                    ...users.map((user) => ({
                      value: user.name,
                      label: user.name,
                    })),
                  ]}
                  onChange={(value) =>
                    setFormData({ ...formData, assignedTo: value || "" })
                  }
                  placeholder="담당자 선택"
                />
              </FormGroup>

              <Row>
                <FormGroup>
                  <Label>관련 게시글</Label>
                  <CustomDropdown
                    value={formData.relatedPostId?.toString() || ""}
                    options={[
                      { value: "", label: "선택 안 함" },
                      ...posts.map((post) => ({
                        value: post.id.toString(),
                        label: post.title,
                      })),
                    ]}
                    onChange={(value) =>
                      setFormData({
                        ...formData,
                        relatedPostId: value ? parseInt(value) : undefined,
                      })
                    }
                    placeholder="관련 게시글 선택"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>관련 일정</Label>
                  <CustomDropdown
                    value={formData.relatedEventId || ""}
                    options={[
                      { value: "", label: "선택 안 함" },
                      ...events.map((event) => ({
                        value: event.id,
                        label: event.title,
                      })),
                    ]}
                    onChange={(value) =>
                      setFormData({
                        ...formData,
                        relatedEventId: value || undefined,
                      })
                    }
                    placeholder="관련 일정 선택"
                  />
                </FormGroup>
              </Row>

              <ButtonGroup>
                {onDelete && (
                  <Button
                    type="button"
                    $danger
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onDelete}
                  >
                    <Trash2 size={18} />
                    삭제
                  </Button>
                )}
                <Button type="button" onClick={onClose}>
                  취소
                </Button>
                <Button
                  type="submit"
                  $primary
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {agenda ? "수정" : "등록"}
                </Button>
              </ButtonGroup>
            </Form>
          </ModalContainer>
        </Overlay>
      )}
    </AnimatePresence>
  );
}
