'use client';

import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Plus, Search, Pin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Post, CATEGORIES } from '@/types/post';
import PostModal from '@/components/Posts/PostModal';
import { canReadPost, getCurrentUser } from '@/utils/postPermissions';
import { postsApi } from '@/lib/api';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: -0.5px;
`;

const Controls = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

const SearchBar = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  padding: 0.6rem 1rem 0.6rem 2.25rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surfaceOpaque};
  font-size: 0.9rem;
  width: 240px;
  transition: all 0.2s ease;
  color: ${({ theme }) => theme.colors.text.primary};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => 
      theme.colors.background === '#0F0F0F' 
        ? 'rgba(62, 166, 255, 0.2)' 
        : 'rgba(0, 122, 255, 0.1)'
    };
    width: 280px;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 0.75rem;
  color: ${({ theme }) => theme.colors.text.tertiary};
  width: 16px;
  height: 16px;
`;

const Button = styled(motion.button)<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme, $primary }) => 
    $primary ? "transparent" : theme.colors.border
  };
  background-color: ${({ theme, $primary }) => 
    $primary ? theme.colors.primary : theme.colors.surfaceOpaque
  };
  color: ${({ theme, $primary }) => 
    $primary ? "#fff" : theme.colors.text.primary
  };
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme, $primary }) => 
      $primary 
        ? (theme.colors.background === '#0F0F0F' ? '#5BB0FF' : '#0066CC')
        : (theme.colors.background === '#0F0F0F' ? 'rgba(255, 255, 255, 0.08)' : '#f5f5f7')
    };
  }
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const FilterTab = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: none;
  background-color: ${({ theme, $active }) => 
    $active ? theme.colors.primary : "transparent"
  };
  color: ${({ theme, $active }) => 
    $active ? "#fff" : theme.colors.text.secondary
  };
  font-size: 0.9rem;
  font-weight: ${({ $active }) => ($active ? 600 : 500)};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme, $active }) => 
      $active 
        ? (theme.colors.background === '#0F0F0F' ? '#5BB0FF' : '#0066CC')
        : (theme.colors.background === '#0F0F0F' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0,0,0,0.05)')
    };
    color: ${({ theme, $active }) => 
      $active ? "#fff" : theme.colors.text.primary
    };
  }
`;

const PostList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const PostCard = styled(motion.div)<{ $pinned?: boolean }>`
  background-color: ${({ theme }) => theme.colors.surfaceOpaque};
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.small};
  border: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;
`;

const PostHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.75rem;
`;

const PostTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
`;

const TitleText = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.4;
`;

const CategoryBadge = styled.span<{ $category: string }>`
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${({ $category }) => {
    switch ($category) {
      case '공지': return '#1d1d1f';
      case '회의록': return '#424245';
      default: return '#f5f5f7';
    }
  }};
  color: ${({ $category }) => {
    switch ($category) {
      case '공지': return '#fff';
      case '회의록': return '#fff';
      default: return '#86868b';
    }
  }};
`;

const PostMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.85rem;
  color: #86868b;
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

export default function PostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const currentUser = getCurrentUser();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await postsApi.getAll({
          category: selectedCategory !== '전체' ? selectedCategory : undefined,
          search: searchTerm || undefined,
        });
        setPosts(response.posts);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      }
    };

    fetchPosts();
  }, [selectedCategory, searchTerm]);

  const filteredPosts = posts
    .filter(post => {
      // 권한 체크
      if (!currentUser || !canReadPost(post, currentUser)) {
        return false;
      }
      const matchesSearch = post.title.includes(searchTerm) || post.author.includes(searchTerm);
      const matchesCategory = selectedCategory === '전체' || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // 초기 로드 후 애니메이션 플래그 설정
  useEffect(() => {
    if (!hasAnimated) {
      const timer = setTimeout(() => setHasAnimated(true), 500);
      return () => clearTimeout(timer);
    }
  }, [hasAnimated]);

  const handleCreatePost = async (postData: Omit<Post, 'id' | 'createdAt' | 'views' | 'author' | 'department'>) => {
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }
    
    try {
      await postsApi.create({
        ...postData,
        author: currentUser.name,
        authorId: currentUser.id,
        department: currentUser.department || '',
        attachments: postData.attachments || [],
      });

      // 게시글 목록 새로고침
      const response = await postsApi.getAll({
        category: selectedCategory !== '전체' ? selectedCategory : undefined,
        search: searchTerm || undefined,
      });
      setPosts(response.posts);
      setIsModalOpen(false);
    } catch (error: any) {
      alert(error.message || "게시글 작성에 실패했습니다.");
    }
  };

  return (
    <Container>
      <Header>
        <Title>게시판</Title>
        <Controls>
          <SearchBar>
            <SearchIcon />
            <SearchInput 
              placeholder="검색" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBar>
          <Button $primary whileTap={{ scale: 0.95 }} onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            <span>글쓰기</span>
          </Button>
        </Controls>
      </Header>

      <FilterTabs>
        {CATEGORIES.map(category => (
          <FilterTab
            key={category}
            $active={selectedCategory === category}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </FilterTab>
        ))}
      </FilterTabs>

      <PostList>
        {filteredPosts.map((post, index) => (
          <PostCard
            key={post.id}
            $pinned={post.pinned}
            initial={!hasAnimated ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={!hasAnimated ? { delay: index * 0.03, duration: 0.2, ease: 'easeOut' } : { duration: 0 }}
            whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}
            onClick={() => router.push(`/posts/${post.id}`)}
          >
            <PostHeader>
              <PostTitle>
                {post.pinned && <Pin size={16} color="#007AFF" fill="#007AFF" />}
                <TitleText>{post.title}</TitleText>
                <CategoryBadge $category={post.category}>{post.category}</CategoryBadge>
              </PostTitle>
            </PostHeader>
            <PostMeta>
              <MetaItem>{post.author}</MetaItem>
              <MetaItem>·</MetaItem>
              <MetaItem>{post.department}</MetaItem>
              <MetaItem>·</MetaItem>
              <MetaItem>{post.createdAt}</MetaItem>
              <MetaItem>·</MetaItem>
              <MetaItem>조회 {post.views}</MetaItem>
            </PostMeta>
          </PostCard>
        ))}
        {filteredPosts.length === 0 && (
          <div style={{ textAlign: 'center', color: '#86868B', padding: '4rem 0' }}>
            검색 결과가 없습니다.
          </div>
        )}
      </PostList>
      <PostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreatePost}
      />
    </Container>
  );
}

