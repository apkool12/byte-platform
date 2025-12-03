export type PermissionLevel = '전체' | '부장 이상' | '특정 부서' | '작성자만';

export interface PostPermission {
  read: PermissionLevel;
  write?: PermissionLevel;
  allowedDepartments?: string[]; // '특정 부서' 선택 시
}

export interface PostAttachment {
  name: string;
  data?: string; // base64 encoded file data
}

export interface Post {
  id: number;
  title: string;
  content?: string;
  author: string;
  authorId?: number; // 작성자 ID
  department: string;
  createdAt: string;
  views: number;
  category: '공지' | '일반' | '회의록';
  pinned?: boolean;
  attachments?: (string | PostAttachment)[]; // 호환성을 위해 string 또는 객체 배열
  permission?: PostPermission;
}

export const CATEGORIES = ['전체', '공지', '일반', '회의록'];
export const PERMISSION_LEVELS: PermissionLevel[] = ['전체', '부장 이상', '특정 부서', '작성자만'];

