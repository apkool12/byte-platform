'use client';

import styled from 'styled-components';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Bold, Italic, Underline, Link, Image, FileText, AtSign, X, Upload, Palette } from 'lucide-react';
import { Member } from '@/types/member';

const Toolbar = styled.div`
  display: flex;
  gap: 0.25rem;
  padding: 0.75rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background-color: #fbfbfd;
  border-radius: 10px 10px 0 0;
  flex-wrap: wrap;
  align-items: center;
`;

const ToolbarButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 6px;
  border: none;
  background-color: ${({ $active }) => ($active ? '#e5e5ea' : 'transparent')};
  color: ${({ $active }) => ($active ? '#1d1d1f' : '#86868b')};
  cursor: pointer;
  transition: all 0.2s;
  width: 32px;
  height: 32px;

  &:hover {
    background-color: ${({ $active }) => ($active ? '#e5e5ea' : 'rgba(0, 0, 0, 0.05)')};
    color: #1d1d1f;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const EditorWrapper = styled.div`
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  background-color: #fff;
  overflow: hidden;
  position: relative;
`;

const EditorContent = styled.div`
  padding: 1rem;
  min-height: 300px;
  max-height: 500px;
  overflow-y: auto;
  font-size: 0.95rem;
  line-height: 1.6;
  color: #1d1d1f;

  &:focus {
    outline: none;
  }

  p {
    margin: 0 0 0.75rem 0;
  }

  strong {
    font-weight: 600;
  }

  em {
    font-style: italic;
  }

  u {
    text-decoration: underline;
  }

  a {
    color: #007AFF;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  span[data-mention] {
    background-color: #e3f2fd;
    color: #1976d2;
    padding: 0.125rem 0.375rem;
    border-radius: 4px;
    font-weight: 500;
  }
`;

const ColorInput = styled.input`
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  padding: 2px;
  background: transparent;

  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  &::-webkit-color-swatch {
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 4px;
  }
`;

const FileUploadWrapper = styled.div`
  margin-top: 0.75rem;
  padding: 0.75rem;
  border: 1px dashed rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  background-color: #fbfbfd;
`;

const FileInput = styled.input`
  display: none;
`;

const ImageInput = styled.input`
  display: none;
`;

const FileUploadButton = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background-color: #fff;
  color: #1d1d1f;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #f5f5f7;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const FileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.75rem;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  background-color: #fff;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  font-size: 0.85rem;
`;

const FileName = styled.span`
  color: #1d1d1f;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RemoveFileButton = styled.button`
  background: none;
  border: none;
  color: #86868b;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #1d1d1f;
  }
`;

const MentionDropdown = styled.div<{ $visible: boolean }>`
  position: absolute;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  display: ${({ $visible }) => ($visible ? 'block' : 'none')};
  min-width: 200px;
`;

const MentionItem = styled.div<{ $selected?: boolean }>`
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  background-color: ${({ $selected }) => ($selected ? '#f5f5f7' : 'transparent')};
  font-size: 0.9rem;

  &:hover {
    background-color: #f5f5f7;
  }
`;

const MentionName = styled.div`
  font-weight: 500;
  color: #1d1d1f;
`;

const MentionInfo = styled.div`
  font-size: 0.75rem;
  color: #86868b;
  margin-top: 0.125rem;
`;

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  members?: Member[];
  onFilesChange?: (files: File[]) => void;
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = '내용을 입력하세요...',
  members = [],
  onFilesChange
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [textColor, setTextColor] = useState('#1d1d1f');
  const [files, setFiles] = useState<File[]>([]);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [isMentioning, setIsMentioning] = useState(false);

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
    m.department.toLowerCase().includes(mentionQuery.toLowerCase())
  ).slice(0, 5);

  const handleInput = useCallback(() => {
    if (!editorRef.current) return;
    
    const text = editorRef.current.innerText || '';
    const html = editorRef.current.innerHTML;
    onChange(html);
    
    // 멘션 체크 (@)
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const textNode = range.startContainer;
    
    if (textNode.nodeType === Node.TEXT_NODE) {
      const textContent = textNode.textContent || '';
      const cursorPos = range.startOffset;
      const beforeCursor = textContent.substring(0, cursorPos);
      // 한국어와 영문 모두 지원
      const match = beforeCursor.match(/@([\w가-힣]*)$/);
      
      if (match) {
        setIsMentioning(true);
        setMentionQuery(match[1]);
        
        // 커서 위치를 기준으로 정확한 위치 계산
        const rect = range.getBoundingClientRect();
        const editorRect = editorRef.current?.getBoundingClientRect();
        const wrapperRect = editorRef.current?.parentElement?.getBoundingClientRect();
        
        if (editorRect && wrapperRect && editorRef.current) {
          // 에디터 래퍼 기준으로 상대 위치 계산
          const scrollTop = editorRef.current.scrollTop || 0;
          const scrollLeft = editorRef.current.scrollLeft || 0;
          
          // EditorContent의 padding 고려 (1rem = 16px)
          const contentPadding = 16;
          
          // 커서 위치에서 래퍼 위치를 뺀 상대 위치
          // Toolbar 높이 고려 (약 48px)
          const toolbarHeight = 48;
          const top = rect.bottom - wrapperRect.top + scrollTop - toolbarHeight + 8;
          const left = rect.left - wrapperRect.left + scrollLeft + contentPadding;
          
          setMentionPosition({
            top: Math.max(0, top),
            left: Math.max(0, left)
          });
        } else {
          // 폴백: 절대 위치 사용
          setMentionPosition({
            top: rect.bottom + window.scrollY + 8,
            left: rect.left + window.scrollX
          });
        }
        
        setShowMentionDropdown(true);
        setSelectedMentionIndex(0);
      } else {
        setIsMentioning(false);
        setShowMentionDropdown(false);
      }
    }
  }, [onChange, members]);

  const insertMention = useCallback((member: Member) => {
    if (!editorRef.current) return;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const mentionSpan = document.createElement('span');
    mentionSpan.contentEditable = 'false';
    mentionSpan.setAttribute('data-mention', member.id.toString());
    mentionSpan.textContent = `@${member.name}`;
    mentionSpan.style.backgroundColor = '#e3f2fd';
    mentionSpan.style.color = '#1976d2';
    mentionSpan.style.padding = '0.125rem 0.375rem';
    mentionSpan.style.borderRadius = '4px';
    mentionSpan.style.fontWeight = '500';
    
    // @ 제거하고 멘션 삽입
    const textNode = range.startContainer;
    if (textNode.nodeType === Node.TEXT_NODE) {
      const textContent = textNode.textContent || '';
      const cursorPos = range.startOffset;
      const beforeCursor = textContent.substring(0, cursorPos);
      const match = beforeCursor.match(/@([\w가-힣]*)$/);
      if (match) {
        const startPos = cursorPos - match[0].length;
        range.setStart(textNode, startPos);
        range.setEnd(textNode, cursorPos);
        range.deleteContents();
      }
    }
    
    range.insertNode(mentionSpan);
    range.setStartAfter(mentionSpan);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    
    setIsMentioning(false);
    setShowMentionDropdown(false);
    handleInput();
  }, [handleInput]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (showMentionDropdown) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMentionIndex(prev => 
          Math.min(prev + 1, filteredMembers.length - 1)
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMentionIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredMembers[selectedMentionIndex]) {
          insertMention(filteredMembers[selectedMentionIndex]);
        }
      } else if (e.key === 'Escape') {
        setShowMentionDropdown(false);
        setIsMentioning(false);
      }
    }
  }, [showMentionDropdown, filteredMembers, selectedMentionIndex, insertMention]);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  }, [handleInput]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const newFiles = [...files, ...selectedFiles];
    setFiles(newFiles);
    onFilesChange?.(newFiles);
  }, [files, onFilesChange]);

  const removeFile = useCallback((index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesChange?.(newFiles);
  }, [files, onFilesChange]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 이미지 파일인지 확인
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    // FileReader로 이미지를 base64로 변환
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      if (imageUrl && editorRef.current) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          
          // 이미지 요소 생성
          const img = document.createElement('img');
          img.src = imageUrl;
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
          img.style.borderRadius = '8px';
          img.style.margin = '0.5rem 0';
          
          range.insertNode(img);
          range.setStartAfter(img);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
          
          handleInput();
        }
      }
    };
    reader.readAsDataURL(file);
    
    // input 초기화
    e.target.value = '';
  }, [handleInput]);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      const isFocused = document.activeElement === editorRef.current;
      if (!isFocused) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  // 초기값 설정
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML && value) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <EditorWrapper>
        <Toolbar>
          <ToolbarButton
            type="button"
            onClick={(e) => {
              e.preventDefault();
              execCommand('bold');
            }}
            onMouseDown={(e) => e.preventDefault()}
            title="굵게 (Ctrl+B)"
          >
            <Bold />
          </ToolbarButton>
          <ToolbarButton
            type="button"
            onClick={(e) => {
              e.preventDefault();
              execCommand('italic');
            }}
            onMouseDown={(e) => e.preventDefault()}
            title="기울임 (Ctrl+I)"
          >
            <Italic />
          </ToolbarButton>
          <ToolbarButton
            type="button"
            onClick={(e) => {
              e.preventDefault();
              execCommand('underline');
            }}
            onMouseDown={(e) => e.preventDefault()}
            title="밑줄 (Ctrl+U)"
          >
            <Underline />
          </ToolbarButton>
          <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(0,0,0,0.1)', margin: '0 0.25rem' }} />
          <ColorInput
            type="color"
            value={textColor}
            onChange={(e) => {
              setTextColor(e.target.value);
              execCommand('foreColor', e.target.value);
            }}
            title="텍스트 색상"
          />
          <ToolbarButton
            type="button"
            onClick={(e) => {
              e.preventDefault();
              const url = prompt('링크 URL을 입력하세요:');
              if (url) execCommand('createLink', url);
            }}
            onMouseDown={(e) => e.preventDefault()}
            title="링크 삽입"
          >
            <Link />
          </ToolbarButton>
          <ToolbarButton
            type="button"
            onClick={(e) => {
              e.preventDefault();
              const imageInput = document.getElementById('image-upload-input') as HTMLInputElement;
              imageInput?.click();
            }}
            onMouseDown={(e) => e.preventDefault()}
            title="이미지 업로드"
          >
            <Image />
          </ToolbarButton>
          <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(0,0,0,0.1)', margin: '0 0.25rem' }} />
          <ToolbarButton
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editorRef.current?.focus();
              const selection = window.getSelection();
              if (selection) {
                const range = selection.getRangeAt(0);
                const textNode = document.createTextNode('@');
                range.insertNode(textNode);
                range.setStartAfter(textNode);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
                setIsMentioning(true);
              }
            }}
            onMouseDown={(e) => e.preventDefault()}
            title="멘션 (@)"
          >
            <AtSign />
          </ToolbarButton>
        </Toolbar>
        <ImageInput
          id="image-upload-input"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
        />
        <EditorContent
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          suppressContentEditableWarning
          style={{ color: textColor }}
          data-placeholder={placeholder}
        />
        <style jsx>{`
          [contenteditable][data-placeholder]:empty:before {
            content: attr(data-placeholder);
            color: #999;
            pointer-events: none;
          }
          [contenteditable] img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin: 0.5rem 0;
            display: block;
          }
        `}</style>
      </EditorWrapper>
      
      <FileUploadWrapper>
        <FileInput
          type="file"
          id="file-upload"
          multiple
          onChange={handleFileUpload}
          accept="*/*"
        />
        <FileUploadButton htmlFor="file-upload">
          <Upload size={16} />
          <span>파일 첨부</span>
        </FileUploadButton>
        {files.length > 0 && (
          <FileList>
            {files.map((file, index) => (
              <FileItem key={index}>
                <FileName>{file.name}</FileName>
                <RemoveFileButton onClick={() => removeFile(index)}>
                  <X size={16} />
                </RemoveFileButton>
              </FileItem>
            ))}
          </FileList>
        )}
      </FileUploadWrapper>

      {showMentionDropdown && filteredMembers.length > 0 && (
        <MentionDropdown
          $visible={showMentionDropdown}
          style={{
            top: `${mentionPosition.top}px`,
            left: `${Math.max(0, mentionPosition.left)}px`
          }}
        >
          {filteredMembers.map((member, index) => (
            <MentionItem
              key={member.id}
              $selected={index === selectedMentionIndex}
              onClick={() => insertMention(member)}
              onMouseEnter={() => setSelectedMentionIndex(index)}
            >
              <MentionName>{member.name}</MentionName>
              <MentionInfo>{member.department}</MentionInfo>
            </MentionItem>
          ))}
        </MentionDropdown>
      )}
    </div>
  );
}

