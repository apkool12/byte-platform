'use client';

import styled from 'styled-components';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Clock, MapPin } from 'lucide-react';
import { eventsApi } from '@/lib/api';
import { CalendarEvent as CalendarEventType } from '@/types/calendar';

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  position: relative;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 1.5rem;
  padding: 0 0.5rem;
`;

const MonthTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1;
  letter-spacing: -0.5px;
`;

const YearText = styled.span`
  font-size: 1.75rem;
  font-weight: 300;
  color: ${({ theme }) => theme.colors.text.tertiary};
  margin-left: 0.5rem;
`;

const NavControls = styled.div`
  display: flex;
  gap: 0.25rem;
`;

const NavBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background === '#0F0F0F' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0,0,0,0.05)'};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  row-gap: 0.75rem;
  flex: 1;
  align-content: start;
`;

const WeekDay = styled.div`
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.tertiary};
  margin-bottom: 0.5rem;
  text-transform: uppercase;
`;

const DateWrapper = styled.div`
  display: flex;
  justify-content: center;
  position: relative;
`;

const DateCell = styled(motion.button)<{ $isToday: boolean; $isCurrentMonth: boolean; $isSelected: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: ${({ $isToday, $isSelected }) => ($isToday || $isSelected ? 600 : 400)};
  cursor: pointer;
  position: relative;
  z-index: 1;
  
  /* Colors - Monochrome Update */
  color: ${({ theme, $isToday, $isSelected, $isCurrentMonth }) => {
    if ($isSelected) return '#fff';
    if ($isToday) return '#fff';
    if (!$isCurrentMonth) return theme.colors.text.tertiary;
    return theme.colors.text.primary;
  }};

  background-color: ${({ theme, $isToday, $isSelected }) => {
    if ($isSelected) return theme.colors.primary;
    if ($isToday) return theme.colors.primary;
    return 'transparent';
  }};

  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme, $isToday, $isSelected }) => 
      !$isToday && !$isSelected 
        ? (theme.colors.background === '#0F0F0F' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0,0,0,0.05)')
        : undefined};
  }
`;

const EventIndicator = styled.div`
  position: absolute;
  bottom: -6px;
  display: flex;
  gap: 2px;
  justify-content: center;
`;

const Dot = styled.div<{ $color: string }>`
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  opacity: 0.8;
`;

// Modal Components
const ModalOverlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borderRadius.large};
`;

const ModalContent = styled(motion.div)`
  width: 85%;
  background-color: ${({ theme }) => theme.colors.surfaceOpaque};
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: ${({ theme }) => theme.shadows.large};
  padding: 1.5rem;
  z-index: 20;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalDate = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const CloseButton = styled.button`
  background: ${({ theme }) => theme.colors.background === '#0F0F0F' ? theme.colors.surfaceOpaque : 'rgba(0, 0, 0, 0.05)'};
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.secondary};
  
  &:hover {
    background: ${({ theme }) => theme.colors.background === '#0F0F0F' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const EventItem = styled.div<{ $color: string }>`
  padding: 1rem;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.background};
  margin-bottom: 0.75rem;
  border-left: 4px solid ${({ theme }) => theme.colors.text.primary}; /* Force Black border */
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const EventTitle = styled.div`
  font-weight: 600;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.25rem;
`;

const EventMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  
  div {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
`;


export default function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    setIsModalOpen(true);
  };

  const [events, setEvents] = useState<CalendarEventType[]>([]);

  useEffect(() => {
    if (!isMounted) return;

    const fetchEvents = async () => {
      try {
        const response = await eventsApi.getAll();
        setEvents(response.events);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      }
    };

    fetchEvents();

    // 일정 업데이트 이벤트 리스너
    const handleEventsUpdate = () => {
      fetchEvents();
    };

    window.addEventListener('eventsUpdated', handleEventsUpdate);
    return () => {
      window.removeEventListener('eventsUpdated', handleEventsUpdate);
    };
  }, [isMounted, currentDate]);

  const getEventsForDay = (day: Date) => {
    if (!isSameMonth(day, currentDate)) return [];
    if (!isMounted) return [];
    
    // 현재 사용자 정보 가져오기 (부서 필터링용)
    const currentUser = typeof window !== 'undefined' 
      ? JSON.parse(localStorage.getItem('currentUser') || 'null')
      : null;
    
    const dayStr = format(day, 'yyyy-MM-dd');
    return events.filter(event => {
      // 부서 권한 체크
      if (event.allowedDepartments && event.allowedDepartments.length > 0) {
        if (!currentUser || !event.allowedDepartments.includes(currentUser.department)) {
          return false;
        }
      }
      
      const eventDate = format(new Date(event.date), 'yyyy-MM-dd');
      if (event.isPeriod && event.endDate) {
        const endDate = format(new Date(event.endDate), 'yyyy-MM-dd');
        return dayStr >= eventDate && dayStr <= endDate;
      }
      return eventDate === dayStr;
    });
  };

  const selectedEvents = selectedDate && isMounted ? getEventsForDay(selectedDate) : [];

  return (
    <Container>
      <Header>
        <div>
          <MonthTitle>
            {format(currentDate, 'MMMM')}
            <YearText>{format(currentDate, 'yyyy')}</YearText>
          </MonthTitle>
        </div>
        <NavControls>
          <NavBtn onClick={prevMonth}><ChevronLeft size={20} /></NavBtn>
          <NavBtn onClick={nextMonth}><ChevronRight size={20} /></NavBtn>
        </NavControls>
      </Header>

      <CalendarGrid>
        {weekDays.map(day => <WeekDay key={day}>{day}</WeekDay>)}
        {calendarDays.map((day, i) => {
          const isToday = isSameDay(day, new Date());
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
          const dayEvents = getEventsForDay(day);

          return (
            <DateWrapper key={i}>
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <DateCell
                  $isToday={isToday}
                  $isCurrentMonth={isSameMonth(day, monthStart)}
                  $isSelected={isSelected}
                  onClick={() => handleDateClick(day)}
                  whileTap={{ scale: 0.9 }}
                >
                  {format(day, 'd')}
                </DateCell>
                {dayEvents.length > 0 && (
                  <EventIndicator>
                    {dayEvents.map((event, idx) => (
                      <Dot key={idx} $color={event.color || '#3b82f6'} />
                    ))}
                  </EventIndicator>
                )}
              </div>
            </DateWrapper>
          );
        })}
      </CalendarGrid>

      <AnimatePresence>
        {isModalOpen && selectedDate && (
          <>
            <ModalOverlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
            />
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <ModalContent
                style={{ pointerEvents: 'auto' }}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              >
                <ModalHeader>
                  <ModalDate>{format(selectedDate, 'MMMM d, yyyy')}</ModalDate>
                  <CloseButton onClick={() => setIsModalOpen(false)}>
                    <X size={16} />
                  </CloseButton>
                </ModalHeader>
                
                {selectedEvents.length > 0 ? (
                  <div>
                    {selectedEvents.map(event => (
                      <EventItem key={event.id} $color={event.color || '#1d1d1f'}>
                        <EventTitle>{event.title}</EventTitle>
                        <EventMeta>
                          {!event.noTime && event.startTime && (
                            <div>
                              <Clock size={12} /> 
                              {event.endTime ? `${event.startTime} - ${event.endTime}` : event.startTime}
                            </div>
                          )}
                          {event.location && <div><MapPin size={12} /> {event.location}</div>}
                        </EventMeta>
                      </EventItem>
                    ))}
                  </div>
                ) : (
                  <EmptyState>
                    일정이 없습니다.
                  </EmptyState>
                )}
              </ModalContent>
            </div>
          </>
        )}
      </AnimatePresence>
    </Container>
  );
}
