export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD format (시작일)
  endDate?: string; // YYYY-MM-DD format (종료일, 기간 일정인 경우)
  startTime: string; // HH:mm format
  endTime?: string; // HH:mm format
  location?: string;
  category?: '회의' | '행사' | '일정' | '기타';
  color?: string;
  postId?: number; // 연결된 게시글 ID
  noTime?: boolean;
  isPeriod?: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const EVENT_CATEGORIES = ['회의', '행사', '일정', '기타'];

