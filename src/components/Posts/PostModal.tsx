'use client';

import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Post, CATEGORIES, PERMISSION_LEVELS, PostPermission } from '@/types/post';
import RichTextEditor from './RichTextEditor';
import { Member } from '@/types/member';
import { DEPARTMENTS } from '@/types/member';
import { usersApi } from '@/lib/api';

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
  background: ${({ theme }) => theme.colors.surfaceOpaque};
  width: 100%;
  max-width: 900px;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: ${({ theme }) => theme.shadows.large};
  position: relative;
  overflow-y: auto;
  max-height: 90vh;
  border: 1px solid ${({ theme }) => theme.colors.border};
  
  /* 스크롤바 숨기기 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: ${({ theme }) => theme.colors.background === '#0F0F0F' ? theme.colors.surfaceOpaque : theme.colors.background};
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.secondary};
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background === '#0F0F0F' ? 'rgba(255, 255, 255, 0.08)' : '#e5e5ea'};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.75rem;
  color: ${({ theme }) => theme.colors.text.primary};
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
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Input = styled.input`
  padding: 0.85rem 1rem;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.95rem;
  background-color: ${({ theme }) => theme.colors.surfaceOpaque};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: all 0.2s;
  width: 100%;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => theme.colors.surfaceOpaque};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.background === '#0F0F0F' ? 'rgba(62, 166, 255, 0.2)' : 'rgba(0, 0, 0, 0.05)'};
  }
`;


const SelectWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const Select = styled.select`
  padding: 0.85rem 1rem;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.95rem;
  background-color: ${({ theme }) => theme.colors.surfaceOpaque};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: all 0.2s;
  width: 100%;
  cursor: pointer;
  appearance: none;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => theme.colors.surfaceOpaque};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.background === '#0F0F0F' ? 'rgba(62, 166, 255, 0.2)' : 'rgba(0, 0, 0, 0.05)'};
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem;
  background-color: ${({ theme }) => theme.colors.background === '#0F0F0F' ? theme.colors.surfaceOpaque : theme.colors.background};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  margin-top: 0.75rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 0.625rem 0.875rem;
  border-radius: 8px;
  transition: all 0.2s;
  user-select: none;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background === '#0F0F0F' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'};
  }
`;

const CheckboxWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
  margin: 0;
  appearance: none;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 5px;
  background-color: ${({ theme }) => theme.colors.surfaceOpaque};
  transition: all 0.2s;
  position: relative;

  &:checked {
    background-color: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:checked::before {
    content: '✓';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    line-height: 1;
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const DepartmentCheckboxes = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
`;

const Button = styled.button<{ $primary?: boolean }>`
  padding: 0.85rem 1.5rem;
  border-radius: 10px;
  border: ${({ theme, $primary }) => ($primary ? 'none' : `1px solid ${theme.colors.border}`)};
  background-color: ${({ theme, $primary }) => ($primary ? theme.colors.primary : theme.colors.surfaceOpaque)};
  color: ${({ theme, $primary }) => ($primary ? '#fff' : theme.colors.text.primary)};
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
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (post: Omit<Post, 'id' | 'createdAt' | 'views' | 'author' | 'department'>) => void;
  members?: Member[];
  initialData?: Post;
}

export default function PostModal({ isOpen, onClose, onSubmit, members = [], initialData }: PostModalProps) {
  const [availableMembers, setAvailableMembers] = useState<Member[]>(members);
  
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await usersApi.getAll();
        setAvailableMembers(response.users as Member[]);
      } catch (error) {
        console.error('Failed to fetch members:', error);
        // 에러 시 기본 members 사용
        if (members.length > 0) {
          setAvailableMembers(members);
        }
      }
    };

    if (isOpen) {
      fetchMembers();
    }
  }, [isOpen, members]);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '일반' as '공지' | '일반' | '회의록',
    pinned: false,
    permission: {
      read: '전체' as PostPermission['read'],
      allowedDepartments: [] as string[],
    },
  });
  const [attachments, setAttachments] = useState<File[]>([]);

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        title: initialData.title || '',
        content: initialData.content || '',
        category: initialData.category || '일반',
        pinned: initialData.pinned || false,
        permission: initialData.permission ? {
          read: initialData.permission.read,
          allowedDepartments: initialData.permission.allowedDepartments || [],
        } : {
          read: '전체',
          allowedDepartments: [],
        },
      });
    } else if (!initialData && isOpen) {
      // 새 게시글 작성 시 초기화
      setFormData({
        title: '',
        content: '',
        category: '일반',
        pinned: false,
        permission: {
          read: '전체',
          allowedDepartments: [],
        },
      });
    }
  }, [initialData, isOpen]);

  const isContentEmpty = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = div.textContent || div.innerText || '';
    return text.trim().length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || isContentEmpty(formData.content)) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }
    
    // 파일을 base64로 변환
    const attachmentsWithData = await Promise.all(
      attachments.map(async (file) => {
        return new Promise<{ name: string; data: string }>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1]; // data:xxx;base64, 부분 제거
            resolve({ name: file.name, data: base64 });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      })
    );

    const postData = {
      ...formData,
      attachments: attachmentsWithData,
      permission: {
        read: formData.permission.read,
        allowedDepartments: formData.permission.read === '특정 부서' 
          ? formData.permission.allowedDepartments 
          : undefined,
      },
    };
    onSubmit(postData);
    setFormData({ 
      title: '', 
      content: '', 
      category: '일반', 
      pinned: false,
      permission: {
        read: '전체',
        allowedDepartments: [],
      },
    });
    setAttachments([]);
    onClose();
  };

  const handleClose = () => {
    setFormData({ 
      title: '', 
      content: '', 
      category: '일반', 
      pinned: false,
      permission: {
        read: '전체',
        allowedDepartments: [],
      },
    });
    setAttachments([]);
    onClose();
  };

  const handleDepartmentToggle = (dept: string) => {
    setFormData(prev => ({
      ...prev,
      permission: {
        ...prev.permission,
        allowedDepartments: prev.permission.allowedDepartments.includes(dept)
          ? prev.permission.allowedDepartments.filter(d => d !== dept)
          : [...prev.permission.allowedDepartments, dept],
      },
    }));
  };

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
            <Title>{initialData ? '게시글 수정' : '새 게시글 작성'}</Title>
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>카테고리</Label>
                <SelectWrapper>
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  >
                    {CATEGORIES.filter(c => c !== '전체').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </Select>
                </SelectWrapper>
              </FormGroup>
              <FormGroup>
                <Label>제목</Label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="제목을 입력하세요"
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>열람 권한</Label>
                <SelectWrapper>
                  <Select
                    value={formData.permission.read}
                    onChange={(e) => setFormData({
                      ...formData,
                      permission: {
                        ...formData.permission,
                        read: e.target.value as PostPermission['read'],
                        allowedDepartments: e.target.value === '특정 부서' ? formData.permission.allowedDepartments : [],
                      },
                    })}
                  >
                    {PERMISSION_LEVELS.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </Select>
                </SelectWrapper>
                {formData.permission.read === '특정 부서' && (
                  <CheckboxGroup>
                    <Label style={{ marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: 600 }}>접근 가능한 부서</Label>
                    <DepartmentCheckboxes>
                      {DEPARTMENTS.map(dept => (
                        <CheckboxLabel key={dept}>
                          <CheckboxWrapper>
                            <Checkbox
                              type="checkbox"
                              checked={formData.permission.allowedDepartments.includes(dept)}
                              onChange={() => handleDepartmentToggle(dept)}
                            />
                          </CheckboxWrapper>
                          <span>{dept}</span>
                        </CheckboxLabel>
                      ))}
                    </DepartmentCheckboxes>
                  </CheckboxGroup>
                )}
              </FormGroup>
              <FormGroup>
                <Label>내용</Label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  placeholder="내용을 입력하세요. @를 입력하여 멘션할 수 있습니다."
                  members={availableMembers.filter(m => m.active)}
                  onFilesChange={setAttachments}
                />
              </FormGroup>
              <ButtonGroup>
                <Button type="button" onClick={handleClose}>
                  취소
                </Button>
                <Button type="submit" $primary disabled={!formData.title || isContentEmpty(formData.content)}>
                  등록
                </Button>
              </ButtonGroup>
            </Form>
          </ModalContainer>
        </Overlay>
      )}
    </AnimatePresence>
  );
}

