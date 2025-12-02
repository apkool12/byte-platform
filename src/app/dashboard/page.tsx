'use client';

import styled from 'styled-components';
import { motion, Variants } from 'framer-motion';
import PostList from '@/components/Dashboard/PostList';
import CalendarWidget from '@/components/Dashboard/CalendarWidget';
import { Users, Calendar, FileText, ArrowUpRight, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { usersApi, eventsApi, agendasApi } from '@/lib/api';
import { format, startOfDay, isSameDay } from 'date-fns';

const PageContainer = styled(motion.div)`
  max-width: 1400px;
  margin: 0 auto;
`;

const HeaderSection = styled(motion.div)`
  margin-bottom: 2.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

const WelcomeText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: -1px;
  line-height: 1.1;
`;

const Slogan = styled.p`
  font-size: 1.125rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;
  letter-spacing: -0.2px;
`;

const BentoGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: auto auto;
  gap: 1.5rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled(motion.div)<{ $colSpan?: number; $rowSpan?: number; $bg?: string; $dark?: boolean }>`
  background: ${({ theme, $bg }) => $bg || theme.colors.surfaceOpaque};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  padding: 1.75rem;
  grid-column: span ${({ $colSpan }) => $colSpan || 1};
  grid-row: span ${({ $rowSpan }) => $rowSpan || 1};
  box-shadow: ${({ theme }) => theme.shadows.small};
  display: flex;
  flex-direction: column;
  color: ${({ theme, $dark }) => $dark ? '#FFFFFF' : theme.colors.text.primary};
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0.03);
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: auto;
`;

const IconWrapper = styled.div<{ $color?: string; $bg?: string }>`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background-color: ${({ $bg }) => $bg || 'rgba(0, 0, 0, 0.05)'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  color: ${({ $color, theme }) => $color || theme.colors.text.primary};
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: -1px;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div<{ $dark?: boolean }>`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${({ theme, $dark }) => $dark ? 'rgba(255, 255, 255, 0.7)' : theme.colors.text.secondary};
`;

const ActionButton = styled(motion.button)`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 0.5rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
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
      stiffness: 100,
      damping: 10
    }
  },
  hover: {
    y: -5,
    boxShadow: "0 12px 24px rgba(0, 0, 0, 0.1)",
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25
    }
  }
};

export default function Home() {
  const router = useRouter();
  const [memberCount, setMemberCount] = useState(0);
  const [todayEventsCount, setTodayEventsCount] = useState(0);
  const [pendingIssuesCount, setPendingIssuesCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 부원 수
        const usersResponse = await usersApi.getAll();
        setMemberCount(usersResponse.users.length);

        // 오늘의 일정
        const today = format(startOfDay(new Date()), 'yyyy-MM-dd');
        const eventsResponse = await eventsApi.getAll({ date: today });
        setTodayEventsCount(eventsResponse.events.length);

        // 진행중인 안건
        const agendasResponse = await agendasApi.getAll({ status: '진행중' });
        setPendingIssuesCount(agendasResponse.agendas.length);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <PageContainer
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <HeaderSection variants={itemVariants}>
        <WelcomeText>
          <Slogan>Run Together, Think Shaper</Slogan>
          <Title>Dashboard</Title>
        </WelcomeText>
      </HeaderSection>

      <BentoGrid variants={containerVariants}>
        {/* Primary Stats Card - Monochrome Black */}
        <Card 
          $colSpan={2} 
          $bg="#191C32" 
          $dark
          variants={itemVariants}
          whileHover="hover"
          onClick={() => router.push('/members')}
        >
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <StatHeader>
              <IconWrapper $bg="rgba(255, 255, 255, 0.15)" $color="#FFFFFF">
                <Users size={24} strokeWidth={2.5} />
              </IconWrapper>
              <ActionButton 
                whileHover={{ scale: 1.1, rotate: 45 }} 
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  router.push('/members');
                }}
              >
                <ArrowUpRight size={20} />
              </ActionButton>
            </StatHeader>
            <div>
              <StatValue>{memberCount}</StatValue>
              <StatLabel $dark>전체 부원</StatLabel>
            </div>
          </div>
        </Card>

        {/* Secondary Stats - Monochrome White/Gray */}
        <Card 
          variants={itemVariants} 
          whileHover="hover"
          onClick={() => router.push('/calendar')}
        >
          <IconWrapper>
            <Calendar size={24} strokeWidth={2.5} />
          </IconWrapper>
          <StatValue>{todayEventsCount}</StatValue>
          <StatLabel>오늘의 일정</StatLabel>
        </Card>

        <Card 
          variants={itemVariants} 
          whileHover="hover"
          onClick={() => router.push('/agenda')}
        >
          <IconWrapper>
            <Zap size={24} strokeWidth={2.5} fill="currentColor" />
          </IconWrapper>
          <StatValue>{pendingIssuesCount}</StatValue>
          <StatLabel>진행중인 안건</StatLabel>
        </Card>

        {/* Calendar Widget - Large */}
        <Card $colSpan={2} $rowSpan={2} style={{ padding: 0, overflow: 'hidden' }} variants={itemVariants}>
          <CalendarWidget />
        </Card>

        {/* Posts List - Large */}
        <Card 
          $colSpan={2} 
          $rowSpan={2} 
          style={{ padding: 0, overflow: 'hidden', backgroundColor: 'transparent', boxShadow: 'none', border: 'none' }}
          variants={itemVariants}
        >
          <PostList />
        </Card>
      </BentoGrid>
    </PageContainer>
  );
}
