'use client';

import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import { CalendarEvent } from '@/types/calendar';
import { format } from 'date-fns';

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
`;

const ModalContainer = styled(motion.div)`
  background: #fff;
  border-radius: 20px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
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
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 0.5rem;
`;

const DateText = styled.div`
  font-size: 0.95rem;
  color: #86868b;
  margin-bottom: 1.5rem;
`;

const EventsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const EventCard = styled(motion.button)`
  width: 100%;
  text-align: left;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background-color: #fff;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #f5f5f7;
    border-color: #1d1d1f;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const EventTitle = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 0.25rem;
`;

const EventMeta = styled.div`
  font-size: 0.85rem;
  color: #86868b;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const AddButton = styled(motion.button)`
  width: 100%;
  padding: 1rem;
  border-radius: 12px;
  border: 2px dashed rgba(0, 0, 0, 0.15);
  background-color: #fbfbfd;
  color: #1d1d1f;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background-color: #fff;
    border-color: #1d1d1f;
    border-style: solid;
  }
`;

interface EventSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: CalendarEvent[];
  selectedDate: Date;
  onSelectEvent: (event: CalendarEvent) => void;
  onAddNew: () => void;
}

export default function EventSelectModal({
  isOpen,
  onClose,
  events,
  selectedDate,
  onSelectEvent,
  onAddNew,
}: EventSelectModalProps) {
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
            <Title>일정 선택</Title>
            <DateText>{format(selectedDate, 'yyyy년 M월 d일')}</DateText>
            
            {events.length > 0 && (
              <>
                <EventsList>
                  {events.map((event) => (
                    <EventCard
                      key={event.id}
                      onClick={() => {
                        onSelectEvent(event);
                        onClose();
                      }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <EventTitle>{event.title}</EventTitle>
                      <EventMeta>
                        {event.startTime && (
                          <span>
                            {event.startTime}
                            {event.endTime && ` - ${event.endTime}`}
                          </span>
                        )}
                        {event.location && <span>· {event.location}</span>}
                        {event.category && <span>· {event.category}</span>}
                      </EventMeta>
                    </EventCard>
                  ))}
                </EventsList>
              </>
            )}

            <AddButton
              onClick={() => {
                onAddNew();
                onClose();
              }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus size={18} />
              <span>새 일정 추가</span>
            </AddButton>
          </ModalContainer>
        </Overlay>
      )}
    </AnimatePresence>
  );
}

