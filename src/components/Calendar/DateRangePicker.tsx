'use client';

import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parse,
  isWithinInterval,
  isAfter,
  isBefore,
  isEqual,
} from 'date-fns';

const DatePickerWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const DateInputButton = styled.button`
  width: 100%;
  padding: 0.85rem 1rem;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  font-size: 0.95rem;
  background-color: #fbfbfd;
  color: #1d1d1f;
  transition: all 0.2s;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;

  &:hover {
    border-color: #1d1d1f;
    background-color: #fff;
  }

  &:focus {
    outline: none;
    border-color: #1d1d1f;
    background-color: #fff;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
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
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(0, 0, 0, 0.08);
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
  color: #1d1d1f;
  min-width: 120px;
  text-align: center;
`;

const NavButton = styled.button`
  background: transparent;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #1d1d1f;
  transition: all 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
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
  color: #86868b;
  padding: 0.5rem;
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
`;

const DayButton = styled.button<{
  $isToday: boolean;
  $isSelected: boolean;
  $isInRange: boolean;
  $isRangeStart: boolean;
  $isRangeEnd: boolean;
  $isCurrentMonth: boolean;
  $isHovering: boolean;
}>`
  aspect-ratio: 1;
  border-radius: ${({ $isRangeStart, $isRangeEnd, $isInRange }) => {
    if ($isRangeStart && !$isRangeEnd) return '8px 0 0 8px';
    if ($isRangeEnd && !$isRangeStart) return '0 8px 8px 0';
    if ($isInRange && !$isRangeStart && !$isRangeEnd) return '0';
    return '8px';
  }};
  border: none;
  background-color: ${({ $isSelected, $isInRange, $isRangeStart, $isRangeEnd, $isHovering }) => {
    if ($isSelected || $isRangeStart || $isRangeEnd) return '#1d1d1f';
    if ($isInRange) return 'rgba(29, 29, 31, 0.08)';
    if ($isHovering) return 'rgba(29, 29, 31, 0.05)';
    return 'transparent';
  }};
  color: ${({ $isSelected, $isRangeStart, $isRangeEnd, $isCurrentMonth }) => {
    if ($isSelected || $isRangeStart || $isRangeEnd) return '#fff';
    if (!$isCurrentMonth) return '#ccc';
    return '#1d1d1f';
  }};
  font-size: 0.875rem;
  font-weight: ${({ $isSelected, $isRangeStart, $isRangeEnd, $isToday }) =>
    $isSelected || $isRangeStart || $isRangeEnd || $isToday ? 600 : 400};
  cursor: pointer;
  transition: all 0.15s;
  position: relative;

  &:hover {
    background-color: ${({ $isSelected, $isRangeStart, $isRangeEnd }) => {
      if ($isSelected || $isRangeStart || $isRangeEnd) return '#000';
      return 'rgba(0, 0, 0, 0.08)';
    }};
    z-index: 1;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const TodayIndicator = styled.div<{ $isSelected: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: ${({ $isSelected }) => ($isSelected ? '32px' : '28px')};
  height: ${({ $isSelected }) => ($isSelected ? '32px' : '28px')};
  border: ${({ $isSelected }) => ($isSelected ? 'none' : '2px solid #1d1d1f')};
  border-radius: 50%;
  pointer-events: none;
  z-index: -1;
`;

interface DatePickerProps {
  value: string; // YYYY-MM-DD format (single date)
  endValue?: string; // YYYY-MM-DD format (end date for range)
  onChange: (date: string) => void;
  onEndChange?: (date: string) => void;
  min?: string;
  placeholder?: string;
  rangeMode?: boolean; // Enable range selection
}

export default function DatePicker({
  value,
  endValue,
  onChange,
  onEndChange,
  min,
  placeholder = '날짜 선택',
  rangeMode = false,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(
    value ? parse(value, 'yyyy-MM-dd', new Date()) : new Date()
  );
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [dragging, setDragging] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedDate = value ? parse(value, 'yyyy-MM-dd', new Date()) : null;
  const selectedEndDate = endValue ? parse(endValue, 'yyyy-MM-dd', new Date()) : null;
  const minDate = min ? parse(min, 'yyyy-MM-dd', new Date()) : null;

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHoverDate(null);
        setDragging(false);
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

  const getDateRange = () => {
    if (!rangeMode) return null;

    let start = selectedDate;
    let end = selectedEndDate || hoverDate;

    if (!start) return null;

    if (end && isBefore(end, start)) {
      [start, end] = [end, start];
    }

    return end ? { start, end } : { start, end: start };
  };

  const range = rangeMode ? getDateRange() : null;

  const handleDateClick = (day: Date) => {
    if (isDateDisabled(day)) return;

    if (!rangeMode) {
      onChange(format(day, 'yyyy-MM-dd'));
      if (onEndChange) {
        onEndChange('');
      }
      setIsOpen(false);
      return;
    }

    // Range mode
    if (!selectedDate || selectedEndDate) {
      // Start new selection
      onChange(format(day, 'yyyy-MM-dd'));
      if (onEndChange) {
        onEndChange('');
      }
    } else {
      // Complete the range
      const start = selectedDate;
      const end = day;

      if (isBefore(end, start) || isEqual(end, start)) {
        // If end is before start, swap them
        onChange(format(end, 'yyyy-MM-dd'));
        if (onEndChange) {
          onEndChange(format(start, 'yyyy-MM-dd'));
        }
      } else {
        if (onEndChange) {
          onEndChange(format(end, 'yyyy-MM-dd'));
        }
      }
    }
  };

  const handleMouseEnter = (day: Date) => {
    if (!rangeMode || !selectedDate || selectedEndDate || isDateDisabled(day)) return;
    setHoverDate(day);
  };

  const handleMouseLeave = () => {
    if (!rangeMode || selectedEndDate) return;
    setHoverDate(null);
  };

  const isDateDisabled = (day: Date) => {
    if (minDate) {
      return isBefore(day, minDate);
    }
    return false;
  };

  const isInRange = (day: Date) => {
    if (!range || !range.start || !range.end) return false;
    try {
      return isWithinInterval(day, { start: range.start, end: range.end });
    } catch {
      return false;
    }
  };

  const isRangeStart = (day: Date) => {
    if (!range || !range.start) return false;
    return isSameDay(day, range.start);
  };

  const isRangeEnd = (day: Date) => {
    if (!range || !range.end) return false;
    return isSameDay(day, range.end);
  };

  const getDisplayText = () => {
    if (!value) return placeholder;
    if (rangeMode && selectedEndDate) {
      return `${format(selectedDate!, 'yyyy년 M월 d일')} - ${format(selectedEndDate, 'yyyy년 M월 d일')}`;
    }
    return format(selectedDate!, 'yyyy년 M월 d일');
  };

  return (
    <DatePickerWrapper ref={wrapperRef}>
      <DateInputButton type="button" onClick={() => setIsOpen(!isOpen)}>
        <DateDisplay>{getDisplayText()}</DateDisplay>
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
              {weekDays.map((day) => (
                <WeekDay key={day}>{day}</WeekDay>
              ))}
            </WeekDays>
            <DaysGrid>
              {calendarDays.map((day, index) => {
                const isToday = isSameDay(day, new Date());
                const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                const isEndSelected = selectedEndDate ? isSameDay(day, selectedEndDate) : false;
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isDisabled = isDateDisabled(day);
                const inRange = rangeMode ? isInRange(day) : false;
                const rangeStart = rangeMode ? isRangeStart(day) : false;
                const rangeEnd = rangeMode ? isRangeEnd(day) : false;
                const isHovering = rangeMode && hoverDate ? isSameDay(day, hoverDate) : false;

                return (
                  <DayButton
                    key={index}
                    $isToday={isToday}
                    $isSelected={isSelected || isEndSelected}
                    $isInRange={inRange}
                    $isRangeStart={rangeStart}
                    $isRangeEnd={rangeEnd}
                    $isCurrentMonth={isCurrentMonth}
                    $isHovering={isHovering}
                    onClick={() => handleDateClick(day)}
                    onMouseEnter={() => handleMouseEnter(day)}
                    onMouseLeave={handleMouseLeave}
                    disabled={isDisabled}
                  >
                    {isToday && <TodayIndicator $isSelected={isSelected || isEndSelected} />}
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

