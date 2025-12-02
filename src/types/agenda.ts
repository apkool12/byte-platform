// 안건 타입 정의
export interface Agenda {
  id: number;
  title: string;
  description: string;
  category: '회의안건' | '의결사항' | '논의사항' | '기타';
  status: '진행중' | '완료' | '보류';
  priority: '높음' | '보통' | '낮음';
  assignedTo?: string; // 담당자
  department?: string; // 담당 부서
  createdAt: string;
  updatedAt: string;
  relatedPostId?: number; // 관련 게시글 ID
  relatedEventId?: string; // 관련 일정 ID
  createdBy: string;
  createdById: number;
}

export const AGENDA_CATEGORIES = ['회의안건', '의결사항', '논의사항', '기타'] as const;
export const AGENDA_STATUS = ['진행중', '완료', '보류'] as const;
export const AGENDA_PRIORITY = ['높음', '보통', '낮음'] as const;

