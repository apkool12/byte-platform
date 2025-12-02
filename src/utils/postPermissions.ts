import { Member } from '@/types/member';
import { Post, PermissionLevel } from '@/types/post';
import { getCurrentUser as getCurrentUserFromPermissions } from '@/utils/permissions';

// 현재 로그인한 사용자 (permissions.ts에서 가져옴)
export const getCurrentUser = (): Member | null => {
  const user = getCurrentUserFromPermissions();
  if (!user) return null;
  
  return {
    id: user.id,
    name: user.name,
    studentId: user.studentId || '',
    role: user.role as Member['role'],
    department: user.department || '',
    phone: '',
    active: true,
    approved: (user as any).approved ?? true, // 기본값은 true (기존 사용자는 승인된 것으로 간주)
  };
};

// 권한 레벨 비교
const getRoleLevel = (role: Member['role']): number => {
  switch (role) {
    case '회장': return 4;
    case '부회장': return 3;
    case '부장': return 2;
    case '부원': return 1;
    default: return 0;
  }
};

// 읽기 권한 체크
export const canReadPost = (post: Post, user: Member | null): boolean => {
  if (!user) return false;
  
  // 작성자는 항상 볼 수 있음 (권한 설정과 무관하게)
  if (post.authorId === user.id || post.author === user.name) {
    return true;
  }
  
  if (!post.permission) return true; // 권한 설정이 없으면 전체 공개

  const permission = post.permission.read;

  switch (permission) {
    case '전체':
      return true;
    
    case '부장 이상':
      return getRoleLevel(user.role) >= 2;
    
    case '특정 부서':
      if (!post.permission.allowedDepartments || post.permission.allowedDepartments.length === 0) {
        return false;
      }
      return post.permission.allowedDepartments.includes(user.department);
    
    case '작성자만':
      // 이미 위에서 작성자 체크를 했으므로 여기서는 false
      return false;
    
    default:
      return false;
  }
};

// 쓰기 권한 체크
export const canWritePost = (user: Member | null): boolean => {
  if (!user) return false;
  // 기본적으로 모든 활성 부원이 작성 가능
  return user.active;
};

// 수정/삭제 권한 체크
export const canEditPost = (post: Post, user: Member | null): boolean => {
  if (!user) return false;
  // 작성자이거나 부장 이상
  return (post.authorId === user.id || post.author === user.name) || getRoleLevel(user.role) >= 3;
};

