// 권한 관리 유틸리티
export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null;
  
  // localStorage에서 현재 사용자 정보 가져오기
  const userStr = localStorage.getItem('currentUser');
  if (userStr) {
    return JSON.parse(userStr);
  }
  
  return null;
};

export const setCurrentUser = (user: any) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('currentUser', JSON.stringify(user));
};

export const isPresident = () => {
  const user = getCurrentUser();
  return user?.role === '회장';
};

export const isManager = () => {
  const user = getCurrentUser();
  return user?.role === '회장' || user?.role === '부회장' || user?.role === '부장';
};

export const canManageMembers = () => {
  return isPresident();
};

export const canEditPost = (postAuthorId?: number) => {
  const user = getCurrentUser();
  if (!user) return false;
  
  // 회장만 모든 게시글 수정 가능
  return isPresident();
};

export const canDeletePost = (postAuthorId?: number) => {
  const user = getCurrentUser();
  if (!user) return false;
  
  // 회장만 모든 게시글 삭제 가능
  return isPresident();
};

