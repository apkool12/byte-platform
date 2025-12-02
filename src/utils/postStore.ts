// 게시글 저장소 유틸리티
import { Post } from '@/types/post';

export const getPosts = (): Post[] => {
  if (typeof window === 'undefined') return [];
  
  const postsStr = localStorage.getItem('posts');
  if (postsStr) {
    return JSON.parse(postsStr);
  }
  
  return [];
};

export const savePosts = (posts: Post[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('posts', JSON.stringify(posts));
};

export const getRecentPosts = (limit: number = 5): Post[] => {
  const posts = getPosts();
  // 최신순으로 정렬하고 limit만큼 반환
  return posts
    .sort((a, b) => {
      const dateA = new Date(a.createdAt.replace(/\./g, '-')).getTime();
      const dateB = new Date(b.createdAt.replace(/\./g, '-')).getTime();
      return dateB - dateA;
    })
    .slice(0, limit);
};

