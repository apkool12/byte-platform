// 캘린더 이벤트 저장소 유틸리티
import { CalendarEvent } from '@/types/calendar';
import { format, isSameDay, startOfDay } from 'date-fns';

export const getEvents = (): CalendarEvent[] => {
  if (typeof window === 'undefined') return [];
  
  const eventsStr = localStorage.getItem('calendarEvents');
  if (eventsStr) {
    return JSON.parse(eventsStr);
  }
  
  return [];
};

export const saveEvents = (events: CalendarEvent[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('calendarEvents', JSON.stringify(events));
};

export const getTodayEvents = (): CalendarEvent[] => {
  const events = getEvents();
  const today = startOfDay(new Date());
  
  return events.filter(event => {
    const eventDate = startOfDay(new Date(event.date));
    if (event.isPeriod && event.endDate) {
      const endDate = startOfDay(new Date(event.endDate));
      return isSameDay(today, eventDate) || 
             isSameDay(today, endDate) ||
             (today >= eventDate && today <= endDate);
    }
    return isSameDay(today, eventDate);
  });
};

export const getEventsForDate = (date: Date): CalendarEvent[] => {
  const events = getEvents();
  const targetDate = startOfDay(date);
  
  return events.filter(event => {
    const eventDate = startOfDay(new Date(event.date));
    if (event.isPeriod && event.endDate) {
      const endDate = startOfDay(new Date(event.endDate));
      return isSameDay(targetDate, eventDate) || 
             isSameDay(targetDate, endDate) ||
             (targetDate >= eventDate && targetDate <= endDate);
    }
    return isSameDay(targetDate, eventDate);
  });
};

