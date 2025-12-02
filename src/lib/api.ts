// API 클라이언트 유틸리티
const API_BASE_URL = '/api';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || '요청을 처리할 수 없습니다.',
      response.status,
      data
    );
  }

  return data;
}

// 인증 API
export const authApi = {
  login: async (email: string, password: string) => {
    return fetchApi<{ user: any; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  signup: async (data: {
    name: string;
    email: string;
    password: string;
    studentId: string;
  }) => {
    return fetchApi<{ user: any; message: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// 사용자 API
export const usersApi = {
  getAll: async () => {
    return fetchApi<{ users: any[] }>('/users');
  },

  getById: async (id: number) => {
    return fetchApi<{ user: any }>(`/users/${id}`);
  },

  update: async (id: number, data: Partial<any>) => {
    return fetchApi<{ user: any }>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number) => {
    return fetchApi<{ message: string }>(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  approve: async (id: number, approved: boolean) => {
    return fetchApi<{ user: any; message: string }>(`/users/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ approved }),
    });
  },
};

// 게시글 API
export const postsApi = {
  getAll: async (params?: { category?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    const queryString = query.toString();
    return fetchApi<{ posts: any[] }>(
      `/posts${queryString ? `?${queryString}` : ''}`
    );
  },

  getById: async (id: number) => {
    return fetchApi<{ post: any }>(`/posts/${id}`);
  },

  create: async (data: any) => {
    return fetchApi<{ post: any; message: string }>('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<any>) => {
    return fetchApi<{ post: any; message: string }>(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number) => {
    return fetchApi<{ message: string }>(`/posts/${id}`, {
      method: 'DELETE',
    });
  },
};

// 일정 API
export const eventsApi = {
  getAll: async (params?: {
    date?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.date) query.append('date', params.date);
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    const queryString = query.toString();
    return fetchApi<{ events: any[] }>(
      `/events${queryString ? `?${queryString}` : ''}`
    );
  },

  getById: async (id: string) => {
    return fetchApi<{ event: any }>(`/events/${id}`);
  },

  create: async (data: any) => {
    return fetchApi<{ event: any; message: string }>('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<any>) => {
    return fetchApi<{ event: any; message: string }>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return fetchApi<{ message: string }>(`/events/${id}`, {
      method: 'DELETE',
    });
  },
};

// 인증 API (추가)
export const authApi_extended = {
  ...authApi,
  logout: async () => {
    return fetchApi<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  },
  changePassword: async (currentPassword: string, newPassword: string, userId: number) => {
    return fetchApi<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword, userId }),
    });
  },
};

// 안건 API
export const agendasApi = {
  getAll: async (params?: { status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    const queryString = query.toString();
    return fetchApi<{ agendas: any[] }>(
      `/agendas${queryString ? `?${queryString}` : ''}`
    );
  },

  getById: async (id: number) => {
    return fetchApi<{ agenda: any }>(`/agendas/${id}`);
  },

  create: async (data: any) => {
    return fetchApi<{ agenda: any; message: string }>('/agendas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<any>) => {
    return fetchApi<{ agenda: any; message: string }>(`/agendas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number) => {
    return fetchApi<{ message: string }>(`/agendas/${id}`, {
      method: 'DELETE',
    });
  },
};

export const notificationsApi = {
  getAll: (userId: number) => fetchApi<{ notifications: any[] }>(`/notifications?userId=${userId}`),
  markAsRead: (notificationId: number) => fetchApi<{ message: string }>(`/notifications/${notificationId}`, { method: 'PUT' }),
  markAllAsRead: (userId: number) => fetchApi<{ message: string }>(`/notifications/read-all`, { method: 'POST', body: JSON.stringify({ userId }) }),
  getUnreadCount: (userId: number) => fetchApi<{ count: number }>(`/notifications/unread-count?userId=${userId}`),
};

export { ApiError };

