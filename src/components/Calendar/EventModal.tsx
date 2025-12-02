"use client";

import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Link2 } from "lucide-react";
import { useState, useEffect } from "react";
import { postsApi } from "@/lib/api";
import { CalendarEvent, EVENT_CATEGORIES } from "@/types/calendar";
import { format } from "date-fns";
import { Post } from "@/types/post";
import DateRangePicker from "./DateRangePicker";

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
  max-width: 600px;
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
    border-color: #1d1d1f;
    background-color: #fff;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
  }
`;

const TextArea = styled.textarea`
  padding: 0.85rem 1rem;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  font-size: 0.95rem;
  background-color: #fbfbfd;
  color: #1d1d1f;
  transition: all 0.2s;
  width: 100%;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #1d1d1f;
    background-color: #fff;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
  }
`;

const SelectWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const Select = styled.select`
  padding: 0.85rem 1rem;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  font-size: 0.95rem;
  background-color: #fbfbfd;
  color: #1d1d1f;
  transition: all 0.2s;
  width: 100%;
  cursor: pointer;
  appearance: none;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #1d1d1f;
    background-color: #fff;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
  }
`;

const TimeRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
`;

const Button = styled.button<{ $primary?: boolean; $danger?: boolean }>`
  padding: 0.85rem 1.5rem;
  border-radius: 10px;
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
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background-color: ${({ $primary, $danger }) => {
      if ($danger) return "#c82333";
      if ($primary) return "#000";
      return "#f5f5f7";
    }};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, "id"> | CalendarEvent) => void;
  onDelete?: () => void;
  selectedDate: Date | null;
  event?: CalendarEvent | null;
  posts?: Post[];
}

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 8px;
  background-color: #fbfbfd;
  border: 1px solid rgba(0, 0, 0, 0.05);
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #1d1d1f;
`;

const PostLink = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background-color: #f5f5f7;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #1d1d1f;
  margin-top: 0.5rem;
`;

const HintText = styled.div`
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #86868b;
  padding: 0.5rem 0.75rem;
  background-color: #fbfbfd;
  border-radius: 8px;
`;

export default function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  selectedDate,
  event,
  posts = [],
}: EventModalProps) {
  const [availablePosts, setAvailablePosts] = useState<Post[]>(posts);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await postsApi.getAll();
        setAvailablePosts(response.posts);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
        // 에러 시 기본 posts 사용
        if (posts.length > 0) {
          setAvailablePosts(posts);
        }
      }
    };

    if (isOpen) {
      fetchPosts();
    }
  }, [isOpen, posts]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: selectedDate
      ? format(selectedDate, "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd"),
    endDate: "",
    startTime: "09:00",
    endTime: "",
    location: "",
    category: "일정" as CalendarEvent["category"],
    postId: undefined as number | undefined,
    isPeriod: false,
    noTime: false,
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || "",
        date: event.date,
        endDate: event.endDate || "",
        startTime: event.startTime || "09:00",
        endTime: event.endTime || "",
        location: event.location || "",
        category: event.category || "일정",
        postId: event.postId,
        isPeriod: !!event.endDate,
        noTime: !event.startTime,
      });
    } else if (selectedDate) {
      setFormData((prev) => ({
        ...prev,
        date: format(selectedDate, "yyyy-MM-dd"),
      }));
    }
  }, [event, selectedDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date) {
      alert("제목과 날짜는 필수 항목입니다.");
      return;
    }
    if (!formData.noTime && !formData.startTime) {
      alert("시간을 설정하거나 '시간 설정 없음'을 선택해주세요.");
      return;
    }
    if (formData.isPeriod && !formData.endDate) {
      alert("여러 날짜에 걸친 일정인 경우 종료 날짜를 입력해주세요.");
      return;
    }

    const eventData: Omit<CalendarEvent, "id"> = {
      title: formData.title,
      description: formData.description || undefined,
      date: formData.date,
      endDate:
        formData.isPeriod && formData.endDate ? formData.endDate : undefined,
      startTime: formData.noTime ? "" : formData.startTime,
      endTime: formData.noTime ? undefined : formData.endTime || undefined,
      location: formData.location || undefined,
      category: formData.category,
      postId: formData.postId,
      color: "#1d1d1f",
      updatedAt: new Date().toISOString(),
    };

    if (event) {
      onSave({ ...eventData, id: event.id } as CalendarEvent);
    } else {
      onSave(eventData);
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      date: format(new Date(), "yyyy-MM-dd"),
      endDate: "",
      startTime: "09:00",
      endTime: "",
      location: "",
      category: "일정",
      postId: undefined,
      isPeriod: false,
      noTime: false,
    });
    onClose();
  };

  const selectedPost = availablePosts.find((p) => p.id === formData.postId);

  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <ModalContainer
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <CloseButton onClick={handleClose}>
              <X size={18} />
            </CloseButton>
            <Title>{event ? "일정 수정" : "일정 추가"}</Title>
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>제목 *</Label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="제목을 입력하세요"
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>일정 날짜 *</Label>
                <DateRangePicker
                  value={formData.date}
                  endValue={formData.endDate}
                  onChange={(date) =>
                    setFormData({ ...formData, date, endDate: "" })
                  }
                  onEndChange={(endDate) => {
                    setFormData({
                      ...formData,
                      endDate,
                      isPeriod: !!endDate,
                    });
                  }}
                  placeholder="날짜 선택"
                  rangeMode={true}
                />
                {formData.endDate && (
                  <HintText>
                    {formData.date === formData.endDate
                      ? "하루 일정"
                      : `${formData.date} ~ ${formData.endDate} (${
                          Math.ceil(
                            (new Date(formData.endDate).getTime() -
                              new Date(formData.date).getTime()) /
                              (1000 * 60 * 60 * 24)
                          ) + 1
                        }일)`}
                  </HintText>
                )}
              </FormGroup>
              <CheckboxWrapper>
                <Checkbox
                  type="checkbox"
                  id="noTime"
                  checked={formData.noTime}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      noTime: e.target.checked,
                      startTime: e.target.checked ? "" : "09:00",
                      endTime: e.target.checked ? "" : "",
                    })
                  }
                />
                <Label
                  htmlFor="noTime"
                  style={{ margin: 0, cursor: "pointer" }}
                >
                  시간 설정 없음
                </Label>
              </CheckboxWrapper>
              {!formData.noTime && (
                <TimeRow>
                  <FormGroup>
                    <Label>시작 시간</Label>
                    <Input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData({ ...formData, startTime: e.target.value })
                      }
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>종료 시간</Label>
                    <Input
                      type="time"
                      value={formData.endTime}
                      min={formData.startTime}
                      onChange={(e) =>
                        setFormData({ ...formData, endTime: e.target.value })
                      }
                    />
                  </FormGroup>
                </TimeRow>
              )}
              <FormGroup>
                <Label>장소</Label>
                <Input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="장소"
                />
              </FormGroup>
              <FormGroup>
                <Label>카테고리</Label>
                <SelectWrapper>
                  <Select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as CalendarEvent["category"],
                      })
                    }
                  >
                    {EVENT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Select>
                </SelectWrapper>
              </FormGroup>
              <FormGroup>
                <Label>설명</Label>
                <TextArea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="설명 (선택사항)"
                />
              </FormGroup>
              <FormGroup>
                <Label>연결할 게시글</Label>
                <SelectWrapper>
                  <Select
                    value={formData.postId || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        postId: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      })
                    }
                  >
                    <option value="">선택 안 함</option>
                    {availablePosts.map((post) => (
                      <option key={post.id} value={post.id}>
                        {post.title}
                      </option>
                    ))}
                  </Select>
                </SelectWrapper>
                {selectedPost && (
                  <PostLink>
                    <Link2 size={16} />
                    <span>{selectedPost.title}</span>
                  </PostLink>
                )}
              </FormGroup>
              <ButtonGroup>
                {onDelete && (
                  <Button type="button" $danger onClick={onDelete}>
                    <Trash2 size={16} />
                    <span>삭제</span>
                  </Button>
                )}
                <div style={{ flex: 1 }} />
                <Button type="button" onClick={handleClose}>
                  취소
                </Button>
                <Button
                  type="submit"
                  $primary
                  disabled={
                    !formData.title ||
                    !formData.date ||
                    (!formData.noTime && !formData.startTime) ||
                    (formData.isPeriod && !formData.endDate)
                  }
                >
                  {event ? "수정" : "추가"}
                </Button>
              </ButtonGroup>
            </Form>
          </ModalContainer>
        </Overlay>
      )}
    </AnimatePresence>
  );
}
