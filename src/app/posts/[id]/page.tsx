"use client";

import styled from "styled-components";
import { motion } from "framer-motion";
import { ArrowLeft, Pin, Download } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { Post } from "@/types/post";
import { canReadPost, getCurrentUser } from "@/utils/postPermissions";
import { canEditPost, canDeletePost } from "@/utils/permissions";
import { postsApi } from "@/lib/api";
import { Edit, Trash2 } from "lucide-react";
import PostModal from "@/components/Posts/PostModal";
import LinkPreview from "@/components/Posts/LinkPreview";

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
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surfaceOpaque};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 1.5rem;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme }) =>
      theme.colors.background === "#0F0F0F"
        ? "rgba(255, 255, 255, 0.05)"
        : theme.colors.background};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const PostContainer = styled(motion.article)`
  background-color: ${({ theme }) => theme.colors.surfaceOpaque};
  border-radius: 16px;
  padding: 2rem;
  box-shadow: ${({ theme }) => theme.shadows.small};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const PostHeader = styled.div`
  padding-bottom: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 2rem;
`;

const PostTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
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
  color: ${({ theme }) => theme.colors.text.secondary};
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
      case "공지":
        return "#1d1d1f";
      case "회의록":
        return "#424245";
      default:
        return "#f5f5f7";
    }
  }};
  color: ${({ $category }) => {
    switch ($category) {
      case "공지":
        return "#fff";
      case "회의록":
        return "#fff";
      default:
        return "#86868b";
    }
  }};
`;

const PostContent = styled.div`
  font-size: 1rem;
  line-height: 1.8;
  color: ${({ theme }) => theme.colors.text.primary};
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
    color: ${({ theme }) => theme.colors.primary};
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
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const ActionButton = styled(motion.button)<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  border: 1px solid
    ${({ theme, $danger }) =>
      $danger ? theme.colors.error : theme.colors.border};
  background-color: ${({ theme, $danger }) =>
    $danger ? theme.colors.error : theme.colors.surfaceOpaque};
  color: ${({ theme, $danger }) =>
    $danger ? "#fff" : theme.colors.text.primary};
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme, $danger }) =>
      $danger
        ? "#c82333"
        : theme.colors.background === "#0F0F0F"
        ? "rgba(255, 255, 255, 0.05)"
        : theme.colors.background};
    border-color: ${({ theme, $danger }) =>
      $danger ? "#c82333" : theme.colors.text.primary};
  }
`;

const AttachmentsSection = styled.div`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const AttachmentsTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
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
  background-color: ${({ theme }) =>
    theme.colors.background === "#0F0F0F"
      ? theme.colors.surfaceOpaque
      : theme.colors.background};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const AttachmentName = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.primary};
  flex: 1;
`;

const DownloadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surfaceOpaque};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme }) =>
      theme.colors.background === "#0F0F0F"
        ? "rgba(255, 255, 255, 0.12)"
        : "#e5e5ea"};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const AccessDenied = styled.div`
  text-align: center;
  padding: 4rem 0;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

// 게시글 내용 요소 타입
type ContentElement =
  | { type: "html"; content: string }
  | { type: "link"; content: string; url: string };

// 더 나은 방법: HTML을 파싱해서 직접 렌더링
function ContentRendererV2({ content }: { content: string }) {
  const elements = useMemo((): ContentElement[] => {
    if (!content) return [];

    // 간단한 방법: 정규식으로 링크 카드 추출
    const linkPattern = /<div[^>]*data-link="([^"]*)"[^>]*>.*?<\/div>/gi;
    const parts: ContentElement[] = [];
    let lastIndex = 0;
    let match;

    while ((match = linkPattern.exec(content)) !== null) {
      // 링크 전의 HTML 추가
      if (match.index > lastIndex) {
        parts.push({
          type: "html",
          content: content.substring(lastIndex, match.index),
        });
      }
      // 링크 URL 추출
      const urlMatch = match[1];
      if (urlMatch) {
        parts.push({ type: "link", content: "", url: urlMatch });
      }
      lastIndex = match.index + match[0].length;
    }

    // 남은 HTML 추가
    if (lastIndex < content.length) {
      parts.push({ type: "html", content: content.substring(lastIndex) });
    }

    return parts.length > 0 ? parts : [{ type: "html", content }];
  }, [content]);

  return (
    <>
      {elements.map((item, index) => {
        if (item.type === "link") {
          return <LinkPreview key={`link-${index}`} url={item.url} />;
        }
        return (
          <div
            key={`html-${index}`}
            dangerouslySetInnerHTML={{ __html: item.content }}
          />
        );
      })}
    </>
  );
}

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
        console.error("Failed to fetch post:", error);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  if (!post) {
    return (
      <Container>
        <BackButton onClick={() => router.push("/posts")}>
          <ArrowLeft />
          <span>목록으로</span>
        </BackButton>
        <div
          style={{ textAlign: "center", padding: "4rem 0", color: "#86868B" }}
        >
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
          onClick={() => router.push("/posts")}
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
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
              }}
            >
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
        onClick={() => router.push("/posts")}
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
            <CategoryBadge $category={post.category}>
              {post.category}
            </CategoryBadge>
          </PostMeta>
        </PostHeader>

        <PostContent>
          <ContentRendererV2 content={post.content || ""} />
        </PostContent>

        {post.attachments && post.attachments.length > 0 && (
          <AttachmentsSection>
            <AttachmentsTitle>첨부파일</AttachmentsTitle>
            <AttachmentList>
              {post.attachments.map((file, index) => {
                // 파일명 추출 (문자열 또는 객체)
                const fileName =
                  typeof file === "string" ? file : (file as any).name || file;
                const fileObj =
                  typeof file === "object" && file !== null
                    ? (file as { name: string; data?: string })
                    : null;

                const handleDownload = () => {
                  // base64 데이터가 있으면 클라이언트에서 다운로드
                  if (fileObj && fileObj.data) {
                    try {
                      // base64 데이터 디코딩
                      const base64Data = fileObj.data;
                      const binaryString = atob(base64Data);
                      const bytes = new Uint8Array(binaryString.length);
                      for (let i = 0; i < binaryString.length; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                      }

                      // 파일 확장자에 따른 MIME 타입 결정
                      const ext = fileName.split(".").pop()?.toLowerCase();
                      const mimeTypes: { [key: string]: string } = {
                        pdf: "application/pdf",
                        doc: "application/msword",
                        docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                        xls: "application/vnd.ms-excel",
                        xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        ppt: "application/vnd.ms-powerpoint",
                        pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                        zip: "application/zip",
                        txt: "text/plain",
                        jpg: "image/jpeg",
                        jpeg: "image/jpeg",
                        png: "image/png",
                        gif: "image/gif",
                      };
                      const mimeType =
                        ext && mimeTypes[ext]
                          ? mimeTypes[ext]
                          : "application/octet-stream";

                      // Blob 생성
                      const blob = new Blob([bytes], { type: mimeType });

                      // 다운로드
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = fileName;
                      link.style.display = "none";
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                    } catch (error) {
                      console.error("Download error:", error);
                      alert("파일 다운로드에 실패했습니다.");
                    }
                  } else {
                    // API를 통한 다운로드 (기존 방식 호환)
                    const downloadUrl = `/api/posts/${
                      post.id
                    }/download?filename=${encodeURIComponent(fileName)}`;
                    const link = document.createElement("a");
                    link.href = downloadUrl;
                    link.download = fileName;
                    link.style.display = "none";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }
                };

                return (
                  <AttachmentItem key={index}>
                    <AttachmentName>{fileName}</AttachmentName>
                    <DownloadButton onClick={handleDownload} type="button">
                      <Download size={16} />
                      <span>다운로드</span>
                    </DownloadButton>
                  </AttachmentItem>
                );
              })}
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
                  if (confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
                    try {
                      await postsApi.delete(postId);
                      router.push("/posts");
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
