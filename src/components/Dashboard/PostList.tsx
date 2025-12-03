'use client';

import styled from 'styled-components';
import { MoreHorizontal } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { postsApi } from '@/lib/api';
import { Post } from '@/types/post';

const Container = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.surfaceOpaque};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.small};
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ListItem = styled(motion.div)`
  padding: 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background-color: ${({ theme }) => 
    theme.colors.background === '#0F0F0F' 
      ? theme.colors.surfaceOpaque 
      : theme.colors.background
  };
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme }) =>
      theme.colors.background === "#0F0F0F"
        ? "rgba(255, 255, 255, 0.08)"
        : "#f5f5f7"};
  }
`;

const PostTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.4;
`;

const PostMeta = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 0.25rem;
`;

const Badge = styled.span`
  font-size: 0.75rem;
  font-weight: 500;
  padding: 2px 8px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
`;


const listVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { x: -20, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100
    }
  }
};

export default function PostList() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await postsApi.getAll();
        const recentPosts = response.posts.slice(0, 5);
        setPosts(recentPosts);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      }
    };

    fetchPosts();
  }, []);

  return (
    <Container transition={{ type: 'spring', stiffness: 300 }}>
      <Header>
        <Title>최근 게시글</Title>
        <MoreHorizontal 
          size={20} 
          color="#86868B" 
          style={{ cursor: 'pointer' }} 
          onClick={() => router.push('/posts')}
        />
      </Header>
      <List as={motion.div} variants={listVariants} initial="hidden" animate="visible">
        {posts.length > 0 ? (
          posts.map((post) => (
            <ListItem 
              key={post.id}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.02, 
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)' 
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(`/posts/${post.id}`)}
            >
              <PostTitle>{post.title}</PostTitle>
              <PostMeta>
                <Badge>{post.department}</Badge>
                <span>{post.createdAt}</span>
              </PostMeta>
            </ListItem>
          ))
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#86868B', fontSize: '0.9rem' }}>
            게시글이 없습니다.
          </div>
        )}
      </List>
    </Container>
  );
}
