'use client';

import styled from 'styled-components';
import { motion } from 'framer-motion';
import { ArrowLeft, Pin, Download } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Post } from '@/types/post';
import { canReadPost, getCurrentUser } from '@/utils/postPermissions';
import { canEditPost, canDeletePost } from '@/utils/permissions';
import { postsApi } from '@/lib/api';
import { Edit, Trash2 } from 'lucide-react';
import PostModal from '@/components/Posts/PostModal';

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const BackButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background-color: #fff;
  color: #1d1d1f;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 1.5rem;
  transition: all 0.2s;

  &:hover {
    background-color: #f5f5f7;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const PostContainer = styled(motion.article)`
  background-color: #fff;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
`;

const PostHeader = styled.div`
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
`;

const PostTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1d1d1f;
  line-height: 1.4;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const PostMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.9rem;
  color: #86868b;
  flex-wrap: wrap;
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const CategoryBadge = styled.span<{ $category: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
  font-size: 0.85rem;
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

const PostContent = styled.div`
  font-size: 1rem;
  line-height: 1.8;
  color: #1d1d1f;
  min-height: 200px;

  p {
    margin: 0 0 1rem 0;
  }

  strong {
    font-weight: 600;
  }

  em {
    font-style: italic;
  }

  u {
    text-decoration: underline;
  }

  a {
    color: #007AFF;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 1.5rem 0;
    display: block;
  }

  span[data-mention] {
    background-color: #e3f2fd;
    color: #1976d2;
    padding: 0.125rem 0.5rem;
    border-radius: 6px;
    font-weight: 500;
    margin: 0 0.25rem;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
`;

const ActionButton = styled(motion.button)<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  border: 1px solid ${({ $danger }) => ($danger ? '#dc3545' : 'rgba(0, 0, 0, 0.08)')};
  background-color: ${({ $danger }) => ($danger ? '#dc3545' : '#fff')};
  color: ${({ $danger }) => ($danger ? '#fff' : '#1d1d1f')};
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ $danger }) => ($danger ? '#c82333' : '#f5f5f7')};
    border-color: ${({ $danger }) => ($danger ? '#c82333' : '#1d1d1f')};
  }
`;

const AttachmentsSection = styled.div`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
`;

const AttachmentsTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 1rem;
`;

const AttachmentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const AttachmentItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background-color: #f5f5f7;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.05);
`;

const AttachmentName = styled.span`
  font-size: 0.9rem;
  color: #1d1d1f;
  flex: 1;
`;

const DownloadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background-color: #fff;
  color: #1d1d1f;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #e5e5ea;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;


const AccessDenied = styled.div`
  text-align: center;
  padding: 4rem 0;
  color: #86868B;
`;

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const postId = parseInt(params?.id as string);
  const [post, setPost] = useState<Post | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const currentUser = getCurrentUser();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await postsApi.getById(postId);
        setPost(response.post);
      } catch (error) {
        console.error('Failed to fetch post:', error);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  if (!post) {
    return (
      <Container>
        <BackButton onClick={() => router.push('/posts')}>
          <ArrowLeft />
          <span>목록으로</span>
        </BackButton>
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#86868B' }}>
          게시글을 찾을 수 없습니다.
        </div>
      </Container>
    );
  }

  // 권한 체크
  if (!currentUser || !canReadPost(post, currentUser)) {
    return (
      <Container>
        <BackButton 
          onClick={() => router.push('/posts')}
          whileHover={{ x: -4 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowLeft />
          <span>목록으로</span>
        </BackButton>
        <PostContainer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AccessDenied>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              접근 권한이 없습니다
            </h2>
            <p>이 게시글을 볼 수 있는 권한이 없습니다.</p>
          </AccessDenied>
        </PostContainer>
      </Container>
    );
  }

  return (
    <Container>
      <BackButton 
        onClick={() => router.push('/posts')}
        whileHover={{ x: -4 }}
        whileTap={{ scale: 0.98 }}
      >
        <ArrowLeft />
        <span>목록으로</span>
      </BackButton>

      <PostContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <PostHeader>
          <PostTitle>
            {post.pinned && <Pin size={20} color="#007AFF" fill="#007AFF" />}
            {post.title}
          </PostTitle>
          <PostMeta>
            <MetaItem>{post.author}</MetaItem>
            <MetaItem>·</MetaItem>
            <MetaItem>{post.department}</MetaItem>
            <MetaItem>·</MetaItem>
            <MetaItem>{post.createdAt}</MetaItem>
            <MetaItem>·</MetaItem>
            <MetaItem>조회 {post.views}</MetaItem>
            <CategoryBadge $category={post.category}>{post.category}</CategoryBadge>
          </PostMeta>
        </PostHeader>

        <PostContent 
          dangerouslySetInnerHTML={{ __html: post.content || '' }}
        />

        {post.attachments && post.attachments.length > 0 && (
          <AttachmentsSection>
            <AttachmentsTitle>첨부파일</AttachmentsTitle>
            <AttachmentList>
              {post.attachments.map((file, index) => (
                <AttachmentItem key={index}>
                  <AttachmentName>{file}</AttachmentName>
                  <DownloadButton>
                    <Download size={16} />
                    <span>다운로드</span>
                  </DownloadButton>
                </AttachmentItem>
              ))}
            </AttachmentList>
          </AttachmentsSection>
        )}

        {(canEditPost(post.authorId) || canDeletePost(post.authorId)) && (
          <ActionButtons>
            {canEditPost(post.authorId) && (
              <ActionButton
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsEditModalOpen(true)}
              >
                <Edit size={18} />
                <span>수정</span>
              </ActionButton>
            )}
            {canDeletePost(post.authorId) && (
              <ActionButton
                $danger
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={async () => {
                  if (confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
                    try {
                      await postsApi.delete(postId);
                      router.push('/posts');
                    } catch (error: any) {
                      alert(error.message || "게시글 삭제에 실패했습니다.");
                    }
                  }
                }}
              >
                <Trash2 size={18} />
                <span>삭제</span>
              </ActionButton>
            )}
          </ActionButtons>
        )}
      </PostContainer>

      {post && (
        <PostModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={async (postData) => {
            try {
              await postsApi.update(postId, postData);
              const response = await postsApi.getById(postId);
              setPost(response.post);
              setIsEditModalOpen(false);
            } catch (error: any) {
              alert(error.message || "게시글 수정에 실패했습니다.");
            }
          }}
          initialData={post}
        />
      )}
    </Container>
  );
}

