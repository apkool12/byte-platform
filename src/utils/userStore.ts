// 사용자 저장소 유틸리티
export const getUsers = (): any[] => {
  if (typeof window === 'undefined') return [];
  
  const usersStr = localStorage.getItem('users');
  if (usersStr) {
    return JSON.parse(usersStr);
  }
  
  return [];
};

export const addUser = (user: any) => {
  if (typeof window === 'undefined') return;
  
  const users = getUsers();
  
  // 이미 존재하는 사용자인지 확인 (이메일 또는 학번 기준)
  const exists = users.some(
    (u: any) => u.email === user.email || u.studentId === user.studentId
  );
  
  if (!exists) {
    const newUser = {
      ...user,
      id: users.length > 0 ? Math.max(...users.map((u: any) => u.id), 0) + 1 : 1,
      role: '회장', // 기본 역할을 회장으로 설정
      department: '총관리', // 기본 부서
      active: true, // 기본 활성 상태
      phone: user.phone || '',
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
  }
};

export const updateUser = (userId: number, updates: Partial<any>) => {
  if (typeof window === 'undefined') return;
  
  const users = getUsers();
  const updatedUsers = users.map((user: any) =>
    user.id === userId ? { ...user, ...updates } : user
  );
  localStorage.setItem('users', JSON.stringify(updatedUsers));
};

export const deleteUser = (userId: number) => {
  if (typeof window === 'undefined') return;
  
  const users = getUsers();
  const filteredUsers = users.filter((user: any) => user.id !== userId);
  localStorage.setItem('users', JSON.stringify(filteredUsers));
};

export const getUserById = (id: number) => {
  const users = getUsers();
  return users.find((u: any) => u.id === id);
};

export const getUserByEmail = (email: string) => {
  const users = getUsers();
  return users.find((u: any) => u.email === email);
};

