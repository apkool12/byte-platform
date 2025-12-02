'use client';

import styled from 'styled-components';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parse, isWithinInterval } from 'date-fns';
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { CalendarEvent } from '@/types/calendar';
import EventModal from '@/components/Calendar/EventModal';
import EventSelectModal from '@/components/Calendar/EventSelectModal';
import { Post } from '@/types/post';
import { eventsApi, postsApi } from '@/lib/api';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: -0.5px;
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const MonthNav = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #fff;
  border-radius: 12px;
  padding: 0.5rem;
  border: 1px solid rgba(0, 0, 0, 0.05);
`;

const MonthTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  min-width: 140px;
  text-align: center;
  padding: 0 1rem;
`;

const NavBtn = styled.button`
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  padding: 0.5rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const Button = styled(motion.button)<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  border: 1px solid ${({ $primary }) => ($primary ? "transparent" : "rgba(0,0,0,0.08)")};
  background-color: ${({ $primary }) => ($primary ? "#1d1d1f" : "#fff")};
  color: ${({ $primary }) => ($primary ? "#fff" : "#1d1d1f")};
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${({ $primary }) => ($primary ? "0 2px 8px rgba(0,0,0,0.1)" : "none")};

  &:hover {
    background-color: ${({ $primary }) => ($primary ? "#000" : "#f5f5f7")};
    transform: ${({ $primary }) => ($primary ? "translateY(-1px)" : "none")};
    box-shadow: ${({ $primary }) => ($primary ? "0 4px 12px rgba(0,0,0,0.15)" : "none")};
  }
`;

const CalendarGrid = styled.div`
  background-color: #fff;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.05);
`;

const WeekDays = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`;

const WeekDay = styled.div`
  text-align: center;
  font-size: 0.85rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.75rem;
`;

const DateCell = styled(motion.div)<{ $isToday: boolean; $isCurrentMonth: boolean; $isInRange: boolean; $isRangeStart: boolean; $isRangeEnd: boolean }>`
  min-height: 100px;
  border-radius: 12px;
  padding: 0.75rem;
  cursor: pointer;
  position: relative;
  border: 2px solid ${({ $isToday, $isInRange, $isRangeStart, $isRangeEnd }) => {
    if ($isToday) return '#1d1d1f';
    if ($isRangeStart || $isRangeEnd) return '#1d1d1f';
    return 'transparent';
  }};
  background-color: ${({ $isToday, $isInRange }) => {
    if ($isToday) return '#f5f5f7';
    if ($isInRange) return 'rgba(0, 0, 0, 0.02)';
    return 'transparent';
  }};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ $isToday, $isInRange }) => {
      if ($isToday) return '#e5e5ea';
      if ($isInRange) return 'rgba(0, 0, 0, 0.04)';
      return 'rgba(0, 0, 0, 0.02)';
    }};
    transform: scale(1.02);
  }
`;

const DateNumber = styled.div<{ $isToday: boolean; $isCurrentMonth: boolean }>`
  font-size: 0.95rem;
  font-weight: ${({ $isToday }) => ($isToday ? 700 : 500)};
  color: ${({ $isCurrentMonth, $isToday }) => {
    if ($isToday) return '#1d1d1f';
    if (!$isCurrentMonth) return '#ccc';
    return '#1d1d1f';
  }};
  margin-bottom: 0.5rem;
`;

const EventsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.25rem;
`;

const EventItem = styled(motion.div)`
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  background-color: #1d1d1f;
  color: #fff;
  font-weight: 500;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: all 0.2s;

  &:hover {
    background-color: #000;
    transform: translateX(2px);
  }
`;

const MoreEvents = styled.div`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 0.25rem;
  font-weight: 500;
`;


export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsResponse = await eventsApi.getAll();
        setEvents(eventsResponse.events);
        
        const postsResponse = await postsApi.getAll();
        setPosts(postsResponse.posts);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, []);

  // 현재 사용자 정보 가져오기 (부서 필터링용)
  const currentUser = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('currentUser') || 'null')
    : null;

  // 날짜별 이벤트 그룹화 (기간 일정 포함, 부서 필터링)
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {};
    events.forEach(event => {
      // 부서 권한 체크
      if (event.allowedDepartments && event.allowedDepartments.length > 0) {
        if (!currentUser || !event.allowedDepartments.includes(currentUser.department)) {
          return; // 부서 권한이 없으면 스킵
        }
      }
      
      const start = parse(event.date, 'yyyy-MM-dd', new Date());
      const end = event.endDate ? parse(event.endDate, 'yyyy-MM-dd', new Date()) : start;
      
      // 기간 내 모든 날짜에 이벤트 추가
      const dates = eachDayOfInterval({ start, end });
      dates.forEach(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        if (!grouped[dateStr]) {
          grouped[dateStr] = [];
        }
        if (!grouped[dateStr].some(e => e.id === event.id)) {
          grouped[dateStr].push(event);
        }
      });
    });
    return grouped;
  }, [events, currentUser]);

  const getEventsForDay = (day: Date): CalendarEvent[] => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return eventsByDate[dateStr] || [];
  };

  const isDateInEventRange = (day: Date, event: CalendarEvent): boolean => {
    if (!event.endDate) return false;
    const start = parse(event.date, 'yyyy-MM-dd', new Date());
    const end = parse(event.endDate, 'yyyy-MM-dd', new Date());
    return isWithinInterval(day, { start, end }) && !isSameDay(day, start) && !isSameDay(day, end);
  };

  const isRangeStart = (day: Date, event: CalendarEvent): boolean => {
    return isSameDay(day, parse(event.date, 'yyyy-MM-dd', new Date()));
  };

  const isRangeEnd = (day: Date, event: CalendarEvent): boolean => {
    if (!event.endDate) return false;
    return isSameDay(day, parse(event.endDate, 'yyyy-MM-dd', new Date()));
  };

  const handleDateClick = (day: Date) => {
    const dayEvents = getEventsForDay(day);
    
    if (dayEvents.length > 0) {
      // 일정이 있으면 선택 모달 표시
      setSelectedDate(day);
      setIsSelectModalOpen(true);
    } else {
      // 일정이 없으면 바로 추가 모달 표시
      setSelectedDate(day);
      setSelectedEvent(null);
      setIsModalOpen(true);
    }
  };

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setSelectedDate(parse(event.date, 'yyyy-MM-dd', new Date()));
    setIsModalOpen(true);
  };

  const handleAddEvent = () => {
    setSelectedDate(new Date());
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (eventData: Omit<CalendarEvent, 'id'> | CalendarEvent) => {
    try {
      if (selectedEvent) {
        await eventsApi.update(selectedEvent.id, eventData);
      } else {
        await eventsApi.create(eventData);
      }

      // 이벤트 목록 새로고침
      const response = await eventsApi.getAll();
      setEvents(response.events);
      setIsModalOpen(false);
      setSelectedDate(null);
      setSelectedEvent(null);
    } catch (error: any) {
      alert(error.message || "일정 저장에 실패했습니다.");
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('정말로 이 일정을 삭제하시겠습니까?')) return;
    
    try {
      await eventsApi.delete(eventId);
      const response = await eventsApi.getAll();
      setEvents(response.events);
      setIsModalOpen(false);
      setSelectedDate(null);
      setSelectedEvent(null);
    } catch (error: any) {
      alert(error.message || "일정 삭제에 실패했습니다.");
    }
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setSelectedDate(parse(event.date, 'yyyy-MM-dd', new Date()));
    setIsModalOpen(true);
  };

  const handleAddNewEvent = () => {
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  return (
    <Container>
      <Header>
        <Title>일정</Title>
        <Controls>
          <MonthNav>
            <NavBtn onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
              <ChevronLeft size={18} />
            </NavBtn>
            <MonthTitle>{format(currentDate, 'yyyy년 M월')}</MonthTitle>
            <NavBtn onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
              <ChevronRight size={18} />
            </NavBtn>
          </MonthNav>
          <Button $primary whileTap={{ scale: 0.95 }} onClick={handleAddEvent}>
            <Plus size={16} />
            <span>일정 추가</span>
          </Button>
        </Controls>
      </Header>

      <CalendarGrid>
        <WeekDays>
          {weekDays.map(day => (
            <WeekDay key={day}>{day}</WeekDay>
          ))}
        </WeekDays>
        <DaysGrid>
          {calendarDays.map((day, index) => {
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, monthStart);
            const dayEvents = getEventsForDay(day);
            
            // 기간 일정 체크
            const rangeEvents = dayEvents.filter(e => e.endDate);
            const isInRange = rangeEvents.some(e => isDateInEventRange(day, e));
            const isRangeStartDate = rangeEvents.some(e => isRangeStart(day, e));
            const isRangeEndDate = rangeEvents.some(e => isRangeEnd(day, e));

            return (
              <DateCell
                key={index}
                $isToday={isToday}
                $isCurrentMonth={isCurrentMonth}
                $isInRange={isInRange}
                $isRangeStart={isRangeStartDate}
                $isRangeEnd={isRangeEndDate}
                onClick={() => handleDateClick(day)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                <DateNumber $isToday={isToday} $isCurrentMonth={isCurrentMonth}>
                  {format(day, 'd')}
                </DateNumber>
                {dayEvents.length > 0 && (
                  <EventsList>
                    {dayEvents.slice(0, 2).map((event) => (
                      <EventItem
                        key={event.id}
                        onClick={(e) => handleEventClick(event, e)}
                        title={event.title}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {event.title}
                      </EventItem>
                    ))}
                    {dayEvents.length > 2 && (
                      <MoreEvents>+{dayEvents.length - 2}개 더</MoreEvents>
                    )}
                  </EventsList>
                )}
              </DateCell>
            );
          })}
        </DaysGrid>
      </CalendarGrid>

      <EventSelectModal
        isOpen={isSelectModalOpen}
        onClose={() => {
          setIsSelectModalOpen(false);
          setSelectedDate(null);
        }}
        events={selectedDate ? getEventsForDay(selectedDate) : []}
        selectedDate={selectedDate || new Date()}
        onSelectEvent={handleSelectEvent}
        onAddNew={handleAddNewEvent}
      />

      <EventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDate(null);
          setSelectedEvent(null);
        }}
        onSave={handleSaveEvent}
        onDelete={selectedEvent ? () => handleDeleteEvent(selectedEvent.id) : undefined}
        selectedDate={selectedDate}
        event={selectedEvent}
        posts={posts}
      />
    </Container>
  );
}
