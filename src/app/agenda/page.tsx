'use client';

import styled from 'styled-components';
import { motion, Variants } from 'framer-motion';
import { Plus, Search, Filter, CheckCircle2, Clock, Pause, AlertCircle, ChevronRight } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Agenda, AGENDA_CATEGORIES, AGENDA_STATUS, AGENDA_PRIORITY } from '@/types/agenda';
import { agendasApi } from '@/lib/api';
import { getCurrentUser } from '@/utils/permissions';
import AgendaModal from '@/components/Agenda/AgendaModal';
import LinkPreview from '@/components/Posts/LinkPreview';

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
        : 'rgba(0, 0, 0, 0.05)'
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
  color: #999;
  width: 16px;
  height: 16px;
`;

const Button = styled(motion.button)<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  border: ${({ theme, $primary }) => 
    $primary ? "transparent" : `1px solid ${theme.colors.border}`
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

const FilterTab = styled(motion.button)<{ $active: boolean }>`
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
  }
`;

const AgendaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const AgendaCard = styled(motion.div)<{ $status: string; $priority: string }>`
  background-color: ${({ theme }) => theme.colors.surfaceOpaque};
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.small};
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.medium};
    transform: translateY(-2px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: ${({ $status }) => {
    switch ($status) {
      case '진행중': return '#f5f5f7';
      case '완료': return '#e8f5e9';
      case '보류': return '#fff3e0';
      default: return '#f5f5f7';
    }
  }};
  color: ${({ $status }) => {
    switch ($status) {
      case '진행중': return '#1d1d1f';
      case '완료': return '#2e7d32';
      case '보류': return '#f57c00';
      default: return '#1d1d1f';
    }
  }};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const PriorityBadge = styled.span<{ $priority: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: ${({ $priority }) => {
    switch ($priority) {
      case '높음': return '#ffebee';
      case '보통': return '#f5f5f7';
      case '낮음': return '#e3f2fd';
      default: return '#f5f5f7';
    }
  }};
  color: ${({ $priority }) => {
    switch ($priority) {
      case '높음': return '#c62828';
      case '보통': return '#424242';
      case '낮음': return '#1565c0';
      default: return '#424242';
    }
  }};
`;

const CardTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.5rem;
  line-height: 1.4;
`;

const CardDescription = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.5;
  margin-bottom: 1rem;
  
  p {
    margin: 0 0 0.5rem 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  div[data-link] {
    margin: 0.5rem 0;
  }
`;

// 안건 설명 렌더러 - 링크 카드를 처리
type ContentElement =
  | { type: "html"; content: string }
  | { type: "link"; content: string; url: string };

function AgendaDescriptionRenderer({ content }: { content: string }) {
  const elements = useMemo((): ContentElement[] => {
    if (!content) return [];

    // 정규식으로 링크 카드 추출
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

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
`;

const CardMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const CategoryTag = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.tertiary};
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: #f5f5f7;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: #86868b;
`;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100
    }
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case '진행중':
      return <Clock size={14} />;
    case '완료':
      return <CheckCircle2 size={14} />;
    case '보류':
      return <Pause size={14} />;
    default:
      return <AlertCircle size={14} />;
  }
};

export default function AgendaPage() {
  const router = useRouter();
  const currentUser = getCurrentUser();
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('전체');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAgenda, setSelectedAgenda] = useState<Agenda | undefined>(undefined);

  useEffect(() => {
    const fetchAgendas = async () => {
      try {
        const response = await agendasApi.getAll({
          status: selectedStatus !== '전체' ? selectedStatus : undefined,
          search: searchTerm || undefined,
        });
        setAgendas(response.agendas);
      } catch (error) {
        console.error('Failed to fetch agendas:', error);
      }
    };

    fetchAgendas();
  }, [selectedStatus, searchTerm]);

  const filteredAgendas = agendas.filter(agenda => {
    const matchesSearch = agenda.title.includes(searchTerm) || 
                         agenda.description.includes(searchTerm) ||
                         (agenda.assignedTo && agenda.assignedTo.includes(searchTerm));
    const matchesStatus = selectedStatus === '전체' || agenda.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateAgenda = async (agendaData: Omit<Agenda, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'createdById'>) => {
    if (!currentUser) return;
    
    try {
      await agendasApi.create({
        ...agendaData,
        createdBy: currentUser.name,
        createdById: currentUser.id,
      });

      const response = await agendasApi.getAll({
        status: selectedStatus !== '전체' ? selectedStatus : undefined,
        search: searchTerm || undefined,
      });
      setAgendas(response.agendas);
      setIsModalOpen(false);
    } catch (error: any) {
      alert(error.message || "안건 등록에 실패했습니다.");
    }
  };

  const handleUpdateAgenda = async (agendaData: Omit<Agenda, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'createdById'>) => {
    if (!selectedAgenda) return;
    
    try {
      await agendasApi.update(selectedAgenda.id, agendaData);
      
      const response = await agendasApi.getAll({
        status: selectedStatus !== '전체' ? selectedStatus : undefined,
        search: searchTerm || undefined,
      });
      setAgendas(response.agendas);
      setIsModalOpen(false);
      setSelectedAgenda(undefined);
    } catch (error: any) {
      alert(error.message || "안건 수정에 실패했습니다.");
    }
  };

  const handleDeleteAgenda = async () => {
    if (!selectedAgenda) return;
    
    if (confirm('정말로 이 안건을 삭제하시겠습니까?')) {
      try {
        await agendasApi.delete(selectedAgenda.id);
        
        const response = await agendasApi.getAll({
          status: selectedStatus !== '전체' ? selectedStatus : undefined,
          search: searchTerm || undefined,
        });
        setAgendas(response.agendas);
        setIsModalOpen(false);
        setSelectedAgenda(undefined);
      } catch (error: any) {
        alert(error.message || "안건 삭제에 실패했습니다.");
      }
    }
  };

  return (
    <Container>
      <Header>
        <Title>안건 관리</Title>
        <Controls>
          <SearchBar>
            <SearchIcon />
            <SearchInput
              placeholder="검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBar>
          <Button
            $primary
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setSelectedAgenda(undefined);
              setIsModalOpen(true);
            }}
          >
            <Plus size={18} />
            <span>안건 추가</span>
          </Button>
        </Controls>
      </Header>

      <FilterTabs>
        <FilterTab
          $active={selectedStatus === '전체'}
          onClick={() => setSelectedStatus('전체')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          전체
        </FilterTab>
        {AGENDA_STATUS.map(status => (
          <FilterTab
            key={status}
            $active={selectedStatus === status}
            onClick={() => setSelectedStatus(status)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {status}
          </FilterTab>
        ))}
      </FilterTabs>

      {filteredAgendas.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AgendaGrid>
            {filteredAgendas.map((agenda) => (
              <AgendaCard
                key={agenda.id}
                $status={agenda.status}
                $priority={agenda.priority}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                onClick={() => {
                  setSelectedAgenda(agenda);
                  setIsModalOpen(true);
                }}
              >
                <CardHeader>
                  <StatusBadge $status={agenda.status}>
                    {getStatusIcon(agenda.status)}
                    {agenda.status}
                  </StatusBadge>
                  <PriorityBadge $priority={agenda.priority}>
                    {agenda.priority}
                  </PriorityBadge>
                </CardHeader>
                <CardTitle>{agenda.title}</CardTitle>
                <CardDescription>
                  <AgendaDescriptionRenderer content={agenda.description} />
                </CardDescription>
                <CardFooter>
                  <CardMeta>
                    <div>{agenda.category}</div>
                    {agenda.assignedTo && <div>담당: {agenda.assignedTo}</div>}
                    {agenda.department && <div>{agenda.department}</div>}
                  </CardMeta>
                  <ChevronRight size={20} color="#86868b" />
                </CardFooter>
              </AgendaCard>
            ))}
          </AgendaGrid>
        </motion.div>
      ) : (
        <EmptyState>
          <EmptyIcon>
            <AlertCircle size={32} />
          </EmptyIcon>
          <p>안건이 없습니다.</p>
        </EmptyState>
      )}

      <AgendaModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAgenda(undefined);
        }}
        onSave={selectedAgenda ? handleUpdateAgenda : handleCreateAgenda}
        onDelete={selectedAgenda ? handleDeleteAgenda : undefined}
        agenda={selectedAgenda}
      />
    </Container>
  );
}

