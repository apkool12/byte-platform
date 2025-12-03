"use client";

import styled from "styled-components";
import { motion } from "framer-motion";
import { Plus, Search, Filter, MoreHorizontal, Lock, Check, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Member, DEPARTMENTS, ROLES } from "@/types/member";
import MemberModal from "@/components/Members/MemberModal";
import { canManageMembers } from "@/utils/permissions";
import { usersApi } from "@/lib/api";

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
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
  border: 1px solid
    ${({ $primary, theme }) => ($primary ? "transparent" : theme.colors.border)};
  background-color: ${({ theme, $primary }) =>
    $primary ? theme.colors.primary : theme.colors.surfaceOpaque};
  color: ${({ theme, $primary }) =>
    $primary ? "#fff" : theme.colors.text.primary};
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

const FilterDropdown = styled.select`
  padding: 0.6rem 2rem 0.6rem 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surfaceOpaque};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23333%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 0.7rem top 50%;
  background-size: 0.65rem auto;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
  }
`;

const TableContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surfaceOpaque};
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme.shadows.small};
  border: 1px solid ${({ theme }) => theme.colors.border};
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
`;

const Th = styled.th`
  text-align: left;
  padding: 1rem 1.5rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;
  font-size: 0.8rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => 
    theme.colors.background === '#0F0F0F' 
      ? theme.colors.surfaceOpaque 
      : theme.colors.background
  };
`;

const Tr = styled(motion.tr)`
  cursor: pointer;
  transition: background-color 0.1s;

  &:last-child td {
    border-bottom: none;
  }

  &:hover {
    background-color: ${({ theme }) => 
      theme.colors.background === '#0F0F0F' 
        ? 'rgba(255, 255, 255, 0.08)' 
        : '#f5f5f7'
    };
  }
`;

const Td = styled.td`
  padding: 1rem 1.5rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.9rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  vertical-align: middle;
`;

const RoleBadge = styled.span<{ $role: string }>`
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;

  ${({ $role }) => {
    switch ($role) {
      case "회장":
        return `background-color: #1D1D1F; color: #fff;`;
      case "부회장":
        return `background-color: #424245; color: #fff;`;
      case "부장":
        return `background-color: #e5e5e5; color: #1D1D1F;`;
      case "스태프":
        return `background-color: #6366f1; color: #fff;`;
      default:
        return `background-color: #f5f5f7; color: #86868b; border: 1px solid rgba(0,0,0,0.05);`;
    }
  }}
`;

const StatusBadge = styled.span<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: ${({ theme, $active }) => ($active ? theme.colors.text.primary : theme.colors.text.secondary)};

  &::before {
    content: "";
    display: block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: ${({ theme, $active }) => ($active ? theme.colors.success : theme.colors.error)};
  }
`;

const ApprovalBadge = styled.span<{ $approved: boolean }>`
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${({ $approved }) => ($approved ? "#E8F5E9" : "#FFF3E0")};
  color: ${({ $approved }) => ($approved ? "#2E7D32" : "#E65100")};
  border: 1px solid ${({ $approved }) => ($approved ? "#C8E6C9" : "#FFE0B2")};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: nowrap;
  white-space: nowrap;
`;

const ActionButton = styled.button<{ $primary?: boolean; $danger?: boolean }>`
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  border: none;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  transition: all 0.2s;
  white-space: nowrap;
  min-width: fit-content;
  background-color: ${({ $primary, $danger }) => {
    if ($primary) return "#1D1D1F";
    if ($danger) return "#FF3B30";
    return "#F5F5F7";
  }};
  color: ${({ $primary, $danger }) => {
    if ($primary || $danger) return "#fff";
    return "#1D1D1F";
  }};

  &:hover {
    opacity: 0.85;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  svg {
    flex-shrink: 0;
  }
`;


const AccessDenied = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
  text-align: center;
`;

const AccessDeniedIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: ${({ theme }) => 
    theme.colors.background === '#0F0F0F' 
      ? theme.colors.surfaceOpaque 
      : theme.colors.background
  };
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 1rem;
`;

const AccessDeniedTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const AccessDeniedText = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
`;

const InfoText = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 0.5rem 1rem;
  background-color: ${({ theme }) => 
    theme.colors.background === '#0F0F0F' 
      ? theme.colors.surfaceOpaque 
      : theme.colors.background
  };
  border-radius: 8px;
`;

export default function MembersPage() {
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("전체");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | undefined>(
    undefined
  );

  useEffect(() => {
    const fetchData = async () => {
      // 권한 체크
      if (canManageMembers()) {
        setHasAccess(true);
        try {
          const response = await usersApi.getAll();
          setMembers(response.users as Member[]);
        } catch (error) {
          console.error('Failed to fetch members:', error);
        }
      } else {
        setHasAccess(false);
      }
    };

    fetchData();
  }, []);

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.includes(searchTerm) || member.studentId.includes(searchTerm);
    const matchesFilter =
      filterDept === "전체" || member.department === filterDept;
    return matchesSearch && matchesFilter;
  });

  // 승인 대기 중인 사용자 필터링
  const pendingMembers = filteredMembers.filter(m => !m.approved);
  const approvedMembers = filteredMembers.filter(m => m.approved);

  const handleApprove = async (memberId: number, approved: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await usersApi.approve(memberId, approved);
      const response = await usersApi.getAll();
      setMembers(response.users as Member[]);
      alert(approved ? '사용자가 승인되었습니다.' : '사용자 승인이 거부되었습니다.');
    } catch (error: any) {
      alert(error.message || '처리 중 오류가 발생했습니다.');
    }
  };

  const handleUpdateMember = async (updatedMember: Omit<Member, "id">) => {
    if (!selectedMember) return;
    try {
      await usersApi.update(selectedMember.id, updatedMember);
      const response = await usersApi.getAll();
      setMembers(response.users as Member[]);
      setSelectedMember(undefined);
    } catch (error: any) {
      alert(error.message || "부원 정보 수정에 실패했습니다.");
    }
  };

  const handleDeleteMember = async () => {
    if (!selectedMember) return;
    if (window.confirm("정말로 이 부원을 삭제하시겠습니까?")) {
      try {
        await usersApi.delete(selectedMember.id);
        const response = await usersApi.getAll();
        setMembers(response.users as Member[]);
        setSelectedMember(undefined);
      } catch (error: any) {
        alert(error.message || "부원 삭제에 실패했습니다.");
      }
    }
  };

  const openEditModal = (member: Member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };


  if (!hasAccess) {
    return (
      <Container>
        <AccessDenied>
          <AccessDeniedIcon>
            <Lock size={40} />
          </AccessDeniedIcon>
          <AccessDeniedTitle>접근 권한이 없습니다</AccessDeniedTitle>
          <AccessDeniedText>
            부원 관리 기능은 회장만 사용할 수 있습니다.
          </AccessDeniedText>
        </AccessDenied>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>부원 관리</Title>
        <Controls>
          <SearchBar>
            <SearchIcon />
            <SearchInput
              placeholder="이름 또는 학번 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBar>
          <FilterDropdown
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
          >
            <option value="전체">전체 부서</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </FilterDropdown>
          <InfoText>
            부원은 회원가입 시 자동으로 추가됩니다.
          </InfoText>
        </Controls>
      </Header>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <Th>이름</Th>
              <Th>학번</Th>
              <Th>직책</Th>
              <Th>부서</Th>
              <Th>연락처</Th>
              <Th>상태</Th>
              <Th>승인</Th>
              <Th style={{ width: "120px" }}>작업</Th>
            </tr>
          </thead>
          <tbody>
            {pendingMembers.length > 0 && (
              <>
                {pendingMembers.map((member) => (
                  <Tr
                    key={member.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ backgroundColor: "#FFF9E6" }}
                  >
                    <Td>
                      <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                        {member.name}
                      </div>
                    </Td>
                    <Td style={{ color: "#86868b" }}>{member.studentId}</Td>
                    <Td>
                      <RoleBadge $role={member.role}>{member.role}</RoleBadge>
                    </Td>
                    <Td>{member.role === '스태프' ? '-' : member.department}</Td>
                    <Td style={{ color: "#86868b" }}>{member.phone || "-"}</Td>
                    <Td>
                      <StatusBadge $active={member.active}>
                        {member.active ? "온라인" : "오프라인"}
                      </StatusBadge>
                    </Td>
                    <Td>
                      <ApprovalBadge $approved={member.approved}>
                        승인 대기
                      </ApprovalBadge>
                    </Td>
                    <Td style={{ width: "140px", minWidth: "140px" }}>
                      <ActionButtons onClick={(e) => e.stopPropagation()}>
                        <ActionButton
                          $primary
                          type="button"
                          onClick={(e) => handleApprove(member.id, true, e)}
                          title="승인"
                        >
                          <Check size={14} />
                          승인
                        </ActionButton>
                        <ActionButton
                          $danger
                          type="button"
                          onClick={(e) => handleApprove(member.id, false, e)}
                          title="거절"
                        >
                          <X size={14} />
                          거절
                        </ActionButton>
                      </ActionButtons>
                    </Td>
                  </Tr>
                ))}
              </>
            )}
            {approvedMembers.map((member) => (
              <Tr
                key={member.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => openEditModal(member)}
              >
                <Td>
                  <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                    {member.name}
                  </div>
                </Td>
                <Td style={{ color: "#86868b" }}>{member.studentId}</Td>
                <Td>
                  <RoleBadge $role={member.role}>{member.role}</RoleBadge>
                </Td>
                <Td>{member.department}</Td>
                <Td style={{ color: "#86868b" }}>{member.phone}</Td>
                <Td>
                  <StatusBadge $active={member.active}>
                    {member.active ? "온라인" : "오프라인"}
                  </StatusBadge>
                </Td>
                <Td>
                  <ApprovalBadge $approved={member.approved}>
                    승인 완료
                  </ApprovalBadge>
                </Td>
                <Td>
                  <MoreHorizontal size={16} color="#C7C7CC" />
                </Td>
              </Tr>
            ))}
            {filteredMembers.length === 0 && (
              <tr>
                <Td
                  colSpan={8}
                  style={{
                    textAlign: "center",
                    color: "#86868B",
                    padding: "4rem 0",
                  }}
                >
                  검색 결과가 없습니다.
                </Td>
              </tr>
            )}
          </tbody>
        </Table>
      </TableContainer>

      {selectedMember && (
        <MemberModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedMember(undefined);
          }}
          onSubmit={handleUpdateMember}
          onDelete={handleDeleteMember}
          initialData={selectedMember}
        />
      )}
    </Container>
  );
}
