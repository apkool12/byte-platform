'use client';

import styled from 'styled-components';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DropdownWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const DropdownButton = styled(motion.button)`
  width: 100%;
  padding: 0.875rem 1rem;
  padding-right: 2.5rem;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background-color: #fbfbfd;
  color: #1d1d1f;
  font-size: 0.95rem;
  transition: all 0.2s;
  outline: none;
  cursor: pointer;
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;

  &:hover {
    background-color: #fff;
    border-color: rgba(0, 0, 0, 0.12);
  }

  &:focus {
    background-color: #fff;
    border-color: #1d1d1f;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
  }
`;

const DropdownValue = styled.span<{ $placeholder?: boolean }>`
  color: ${({ $placeholder }) => ($placeholder ? '#86868b' : '#1d1d1f')};
`;

const ChevronIcon = styled(ChevronDown)<{ $isOpen: boolean }>`
  color: #86868b;
  width: 18px;
  height: 18px;
  transition: transform 0.2s;
  transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  flex-shrink: 0;
`;

const DropdownMenu = styled(motion.div)`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.surfaceOpaque};
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  z-index: 1000;
  max-height: 240px;
  overflow-y: auto;
  margin-top: 4px;
`;

const DropdownItem = styled(motion.button)`
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.95rem;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.15s;
  display: flex;
  align-items: center;

  &:hover {
    background-color: ${({ theme }) =>
      theme.colors.background === "#0F0F0F"
        ? "rgba(255, 255, 255, 0.08)"
        : "#f5f5f7"};
  }

  &:first-child {
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
  }

  &:last-child {
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
  }
`;

interface CustomDropdownProps<T extends string> {
  value: T | '';
  options: Array<{ value: T | ''; label: string }>;
  onChange: (value: T | '') => void;
  placeholder?: string;
}

export default function CustomDropdown<T extends string>({
  value,
  options,
  onChange,
  placeholder = '선택 안 함',
}: CustomDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const selectedOption = options.find(opt => {
    // 빈 문자열과 undefined 모두 처리
    if (value === '' || value === undefined) {
      return opt.value === '' || opt.value === undefined;
    }
    return opt.value === value;
  });
  const displayValue = selectedOption ? selectedOption.label : placeholder;
  const isPlaceholder = !selectedOption;

  return (
    <DropdownWrapper ref={dropdownRef}>
      <DropdownButton
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <DropdownValue $placeholder={isPlaceholder}>
          {displayValue}
        </DropdownValue>
        <ChevronIcon $isOpen={isOpen} size={18} />
      </DropdownButton>
      <AnimatePresence>
        {isOpen && (
          <DropdownMenu
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            {options.map((option, index) => (
              <DropdownItem
                key={option.value === '' ? `empty-${index}` : option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                whileTap={{ scale: 0.98 }}
              >
                {option.label}
              </DropdownItem>
            ))}
          </DropdownMenu>
        )}
      </AnimatePresence>
    </DropdownWrapper>
  );
}

