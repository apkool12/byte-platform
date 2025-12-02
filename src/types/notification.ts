export interface Notification {
  id: number;
  userId: number;
  type: 'mention' | 'post' | 'event' | 'agenda';
  title: string;
  message: string;
  relatedPostId?: number;
  relatedEventId?: string;
  relatedAgendaId?: number;
  read: boolean;
  createdAt: string;
}

