'use client';

import styled from 'styled-components';
import { ExternalLink } from 'lucide-react';

const LinkCard = styled.a<{ $editable?: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  background-color: #fff;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
  margin: 0.75rem 0;
  cursor: ${({ $editable }) => ($editable ? 'default' : 'pointer')};

  &:hover {
    ${({ $editable }) =>
      !$editable &&
      `
      background-color: #f5f5f7;
      border-color: rgba(0, 0, 0, 0.12);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    `}
  }
`;

const LinkIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background-color: #f5f5f7;
  flex-shrink: 0;

  svg {
    width: 20px;
    height: 20px;
    color: #86868b;
  }
`;

const LinkContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const LinkUrl = styled.div`
  font-size: 0.85rem;
  color: #86868b;
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const LinkTitle = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
  color: #1d1d1f;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const LinkDescription = styled.div`
  font-size: 0.85rem;
  color: #86868b;
  margin-top: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background-color: transparent;
  color: #86868b;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    background-color: #f5f5f7;
    color: #1d1d1f;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

interface LinkPreviewProps {
  url: string;
  title?: string;
  description?: string;
  editable?: boolean;
  onRemove?: () => void;
}

export default function LinkPreview({
  url,
  title,
  description,
  editable = false,
  onRemove,
}: LinkPreviewProps) {
  const displayUrl = url.length > 50 ? url.substring(0, 50) + '...' : url;
  const displayTitle = title || new URL(url).hostname.replace('www.', '');

  const handleClick = (e: React.MouseEvent) => {
    if (editable) {
      e.preventDefault();
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <LinkCard
      href={url}
      onClick={handleClick}
      $editable={editable}
      contentEditable={false}
    >
      <LinkIcon>
        <ExternalLink />
      </LinkIcon>
      <LinkContent>
        <LinkUrl>{displayUrl}</LinkUrl>
        <LinkTitle>{displayTitle}</LinkTitle>
        {description && <LinkDescription>{description}</LinkDescription>}
      </LinkContent>
      {editable && onRemove && (
        <RemoveButton
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          title="링크 제거"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </RemoveButton>
      )}
    </LinkCard>
  );
}

