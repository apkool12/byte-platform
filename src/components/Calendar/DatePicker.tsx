'use client';

import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parse } from 'date-fns';

const DatePickerWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const DateInputButton = styled.button`
  width: 100%;
  padding: 0.85rem 1rem;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.95rem;
  background-color: ${({ theme }) => theme.colors.surfaceOpaque};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: all 0.2s;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => theme.colors.surfaceOpaque};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => theme.colors.surfaceOpaque};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.background === '#0F0F0F' ? 'rgba(62, 166, 255, 0.2)' : 'rgba(0, 0, 0, 0.05)'};
  }
`;

const DateDisplay = styled.span`
  flex: 1;
`;

const CalendarDropdown = styled(motion.div)`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.surfaceOpaque};
  border-radius: 16px;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 1.25rem;
  z-index: 1000;
  min-width: 320px;
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const MonthNav = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const MonthTitle = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  min-width: 120px;
  text-align: center;
`;

const NavButton = styled.button`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.primary};
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background === '#0F0F0F' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'};
  }
`;

const WeekDays = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
  margin-bottom: 0.5rem;
`;

const WeekDay = styled.div`
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 0.5rem;
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
`;

const DayButton = styled.button<{ $isToday: boolean; $isSelected: boolean; $isCurrentMonth: boolean }>`
  aspect-ratio: 1;
  border-radius: 8px;
  border: none;
  background-color: ${({ theme, $isToday, $isSelected }) => {
    if ($isSelected) return theme.colors.primary;
    if ($isToday) return theme.colors.background === '#0F0F0F' ? 'rgba(62, 166, 255, 0.1)' : theme.colors.background;
    return 'transparent';
  }};
  color: ${({ theme, $isToday, $isSelected, $isCurrentMonth }) => {
    if ($isSelected) return '#fff';
    if ($isToday) return theme.colors.primary;
    if (!$isCurrentMonth) return theme.colors.text.tertiary;
    return theme.colors.text.primary;
  }};
  font-size: 0.875rem;
  font-weight: ${({ $isToday, $isSelected }) => ($isToday || $isSelected ? 600 : 400)};
  cursor: pointer;
  transition: all 0.2s;
  border: ${({ theme, $isToday, $isSelected }) => {
    if ($isSelected) return `2px solid ${theme.colors.primary}`;
    if ($isToday) return `2px solid ${theme.colors.primary}`;
    return '2px solid transparent';
  }};

  &:hover {
    background-color: ${({ theme, $isSelected }) => 
      $isSelected 
        ? (theme.colors.background === '#0F0F0F' ? '#5BB0FF' : '#0066CC')
        : (theme.colors.background === '#0F0F0F' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)')
    };
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

interface DatePickerProps {
  value: string; // YYYY-MM-DD format
  onChange: (date: string) => void;
  min?: string;
  placeholder?: string;
}

export default function DatePicker({ value, onChange, min, placeholder = '날짜 선택' }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value ? parse(value, 'yyyy-MM-dd', new Date()) : new Date());
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedDate = value ? parse(value, 'yyyy-MM-dd', new Date()) : null;
  const minDate = min ? parse(min, 'yyyy-MM-dd', new Date()) : null;

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // value가 변경되면 currentMonth도 업데이트
  useEffect(() => {
    if (value) {
      const date = parse(value, 'yyyy-MM-dd', new Date());
      setCurrentMonth(date);
    }
  }, [value]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  const handleDateSelect = (day: Date) => {
    onChange(format(day, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  const isDateDisabled = (day: Date) => {
    if (minDate) {
      return day < minDate;
    }
    return false;
  };

  return (
    <DatePickerWrapper ref={wrapperRef}>
      <DateInputButton
        type="button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <DateDisplay>
          {value ? format(parse(value, 'yyyy-MM-dd', new Date()), 'yyyy년 M월 d일') : placeholder}
        </DateDisplay>
        <CalendarIcon size={18} color="#86868b" />
      </DateInputButton>
      <AnimatePresence>
        {isOpen && (
          <CalendarDropdown
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <CalendarHeader>
              <MonthNav>
                <NavButton onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                  <ChevronLeft size={16} />
                </NavButton>
                <MonthTitle>{format(currentMonth, 'yyyy년 M월')}</MonthTitle>
                <NavButton onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                  <ChevronRight size={16} />
                </NavButton>
              </MonthNav>
            </CalendarHeader>
            <WeekDays>
              {weekDays.map(day => (
                <WeekDay key={day}>{day}</WeekDay>
              ))}
            </WeekDays>
            <DaysGrid>
              {calendarDays.map((day, index) => {
                const isToday = isSameDay(day, new Date());
                const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isDisabled = isDateDisabled(day);

                return (
                  <DayButton
                    key={index}
                    $isToday={isToday}
                    $isSelected={isSelected}
                    $isCurrentMonth={isCurrentMonth}
                    onClick={() => !isDisabled && handleDateSelect(day)}
                    disabled={isDisabled}
                  >
                    {format(day, 'd')}
                  </DayButton>
                );
              })}
            </DaysGrid>
          </CalendarDropdown>
        )}
      </AnimatePresence>
    </DatePickerWrapper>
  );
}

