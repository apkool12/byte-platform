export interface Member {
  id: number;
  name: string;
  studentId: string;
  role: '회장' | '부회장' | '부장' | '부원';
  department: string;
  phone: string;
  active: boolean;
}

export const DEPARTMENTS = ['총관리', '사무부', '문서부', '문화부', '기획부', '여학우부', '홍보부', '체육부'];
export const ROLES = ['회장', '부회장', '부장', '부원'];

