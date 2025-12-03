// Prisma 기반 데이터 저장소로 전환
// Vercel 배포를 위해 Prisma + PostgreSQL 사용

import { prisma } from "./db";
import crypto from "crypto";

export interface ApiUser {
  id: number;
  name: string;
  email: string;
  password?: string;
  studentId: string;
  role: "회장" | "부회장" | "부장" | "부원" | "스태프";
  department: string;
  phone: string;
  active: boolean;
  approved: boolean;
  profileImage?: string;
  emailNotificationEnabled?: boolean;
  createdAt: string;
}

export interface ApiPost {
  id: number;
  title: string;
  content: string;
  author: string;
  authorId: number;
  department: string;
  createdAt: string;
  views: number;
  category: "공지" | "일반" | "회의록";
  pinned?: boolean;
  attachments?: (string | { name: string; data?: string })[];
  permission?: {
    read: "전체" | "부장 이상" | "특정 부서" | "작성자만";
    write?: "전체" | "부장 이상" | "특정 부서" | "작성자만";
    allowedDepartments?: string[];
  };
}

export interface ApiEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  endDate?: string;
  startTime: string;
  endTime?: string;
  location?: string;
  category?: "회의" | "행사" | "일정" | "기타";
  color?: string;
  postId?: number;
  noTime?: boolean;
  isPeriod?: boolean;
  createdBy?: string;
  allowedDepartments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiAgenda {
  id: number;
  title: string;
  description: string;
  category: "회의안건" | "의결사항" | "논의사항" | "기타";
  status: "진행중" | "완료" | "보류";
  priority: "높음" | "보통" | "낮음";
  assignedTo?: string;
  department?: string;
  createdAt: string;
  updatedAt: string;
  relatedPostId?: number;
  relatedEventId?: string;
  createdBy: string;
  createdById: number;
}

// 메모리 저장소에서 Prisma로 전환
class DataStore {
  // Users
  async getUsers(): Promise<ApiUser[]> {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    return users.map(({ password, ...user }) => {
      const userWithApproved = user as any;
      return {
        ...user,
        password: undefined,
        role: user.role as ApiUser["role"],
        profileImage: user.profileImage ?? undefined,
        approved: userWithApproved.approved ?? false,
        emailNotificationEnabled:
          userWithApproved.emailNotificationEnabled ?? true,
        createdAt: user.createdAt.toISOString(),
      };
    });
  }

  getUserById(id: number): Promise<ApiUser | undefined> {
    return prisma.user
      .findUnique({
        where: { id },
      })
      .then((user) => {
        if (!user) return undefined;
        const { password, ...userWithoutPassword } = user;
        const userWithApproved = user as any;
        return {
          ...userWithoutPassword,
          password: undefined,
          role: user.role as ApiUser["role"],
          profileImage: user.profileImage ?? undefined,
          approved: userWithApproved.approved ?? false,
          emailNotificationEnabled:
            userWithApproved.emailNotificationEnabled ?? true,
          createdAt: user.createdAt.toISOString(),
        } as ApiUser;
      });
  }

  async getUserByEmailOrName(identifier: string): Promise<ApiUser | undefined> {
    // 이메일 또는 이름으로 사용자 찾기
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { name: identifier }],
      },
    });

    if (!user) return undefined;

    const userWithApproved = user as any;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      studentId: user.studentId || "",
      role: user.role as ApiUser["role"],
      department: user.department || "",
      phone: user.phone || "",
      active: user.active,
      approved: userWithApproved.approved ?? false,
      profileImage: user.profileImage ?? undefined,
      emailNotificationEnabled:
        userWithApproved.emailNotificationEnabled ?? true,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async getUserByEmail(email: string): Promise<ApiUser | undefined> {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) return undefined;
    const { password, ...userWithoutPassword } = user;
    const userWithApproved = user as any;
    return {
      ...userWithoutPassword,
      password: undefined,
      role: user.role as ApiUser["role"],
      profileImage: user.profileImage ?? undefined,
      approved: userWithApproved.approved ?? false,
      emailNotificationEnabled:
        userWithApproved.emailNotificationEnabled ?? true,
      createdAt: user.createdAt.toISOString(),
    } as ApiUser;
  }

  async getUserByEmailOrNameWithPassword(
    identifier: string
  ): Promise<ApiUser | undefined> {
    // 이메일 또는 이름으로 사용자 찾기 (비밀번호 포함)
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { name: identifier }],
      },
    });

    if (!user) return undefined;

    const userWithApproved = user as any;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password || undefined,
      studentId: user.studentId || "",
      role: user.role as ApiUser["role"],
      department: user.department || "",
      phone: user.phone || "",
      active: user.active,
      approved: userWithApproved.approved ?? false,
      profileImage: user.profileImage ?? undefined,
      emailNotificationEnabled: userWithApproved.emailNotificationEnabled ?? true,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async getUserByEmailWithPassword(
    email: string
  ): Promise<ApiUser | undefined> {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) return undefined;
    const userWithApproved = user as any;
    return {
      ...user,
      emailNotificationEnabled: userWithApproved.emailNotificationEnabled ?? true,
      createdAt: user.createdAt.toISOString(),
    } as ApiUser;
  }

  async addUser(user: Omit<ApiUser, "id" | "createdAt">): Promise<ApiUser> {
    const newUser = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password || "",
        studentId: user.studentId,
        role: user.role,
        department: user.department,
        phone: user.phone,
        active: user.active,
        approved: user.approved ?? false,
        profileImage: user.profileImage,
        emailNotificationEnabled: user.emailNotificationEnabled ?? true, // 기본값 true
      } as any,
    });
    const { password, ...userWithoutPassword } = newUser;
    const newUserWithApproved = newUser as any;
    return {
      ...userWithoutPassword,
      password: undefined,
      approved: newUserWithApproved.approved ?? false,
      emailNotificationEnabled: newUserWithApproved.emailNotificationEnabled ?? true,
      createdAt: newUser.createdAt.toISOString(),
    } as ApiUser;
  }

  async updateUser(
    id: number,
    updates: Partial<ApiUser>
  ): Promise<ApiUser | null> {
    const updateData: any = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.email) updateData.email = updates.email;
    if (updates.password) updateData.password = updates.password;
    if (updates.studentId) updateData.studentId = updates.studentId;
    if (updates.role) updateData.role = updates.role;
    if (updates.department) updateData.department = updates.department;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.active !== undefined) updateData.active = updates.active;
    if (updates.approved !== undefined) updateData.approved = updates.approved;
    if (updates.profileImage !== undefined)
      updateData.profileImage = updates.profileImage;
    if (updates.emailNotificationEnabled !== undefined)
      updateData.emailNotificationEnabled = updates.emailNotificationEnabled;

    try {
      const updated = await prisma.user.update({
        where: { id },
        data: updateData,
      });
      const { password, ...userWithoutPassword } = updated;
      const updatedWithApproved = updated as any;
      return {
        ...userWithoutPassword,
        password: undefined,
        approved: updatedWithApproved.approved ?? false,
        emailNotificationEnabled: updatedWithApproved.emailNotificationEnabled ?? true,
        createdAt: updated.createdAt.toISOString(),
      } as ApiUser;
    } catch {
      return null;
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      await prisma.user.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  // Posts
  async getPosts(): Promise<ApiPost[]> {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: { authorUser: true },
    });
    return posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      author: post.author,
      authorId: post.authorId,
      department: post.department,
      createdAt: post.createdAt.toISOString(),
      views: post.views,
      category: post.category as "공지" | "일반" | "회의록",
      pinned: post.pinned,
      attachments: Array.isArray(post.attachments)
        ? post.attachments.map((a) => {
            try {
              // JSON 문자열인 경우 파싱
              if (
                typeof a === "string" &&
                (a.startsWith("{") || a.startsWith("["))
              ) {
                return JSON.parse(a);
              }
              // 일반 문자열인 경우 (기존 호환성)
              return a;
            } catch {
              return a;
            }
          })
        : [],
      permission: post.permissionRead
        ? {
            read: post.permissionRead as
              | "전체"
              | "부장 이상"
              | "특정 부서"
              | "작성자만",
            write: post.permissionWrite as
              | "전체"
              | "부장 이상"
              | "특정 부서"
              | "작성자만"
              | undefined,
            allowedDepartments: post.allowedDepartments,
          }
        : undefined,
    }));
  }

  async getPostById(id: number): Promise<ApiPost | undefined> {
    const post = await prisma.post.findUnique({
      where: { id },
      include: { authorUser: true },
    });
    if (!post) return undefined;
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      author: post.author,
      authorId: post.authorId,
      department: post.department,
      createdAt: post.createdAt.toISOString(),
      views: post.views,
      category: post.category as "공지" | "일반" | "회의록",
      pinned: post.pinned,
      attachments: Array.isArray(post.attachments)
        ? post.attachments.map((a) => {
            try {
              // JSON 문자열인 경우 파싱
              if (
                typeof a === "string" &&
                (a.startsWith("{") || a.startsWith("["))
              ) {
                return JSON.parse(a);
              }
              // 일반 문자열인 경우 (기존 호환성)
              return a;
            } catch {
              return a;
            }
          })
        : [],
      permission: post.permissionRead
        ? {
            read: post.permissionRead as
              | "전체"
              | "부장 이상"
              | "특정 부서"
              | "작성자만",
            write: post.permissionWrite as
              | "전체"
              | "부장 이상"
              | "특정 부서"
              | "작성자만"
              | undefined,
            allowedDepartments: post.allowedDepartments,
          }
        : undefined,
    };
  }

  async addPost(
    post: Omit<ApiPost, "id" | "createdAt" | "views">
  ): Promise<ApiPost> {
    const newPost = await prisma.post.create({
      data: {
        title: post.title,
        content: post.content,
        author: post.author,
        authorId: post.authorId,
        department: post.department,
        category: post.category,
        pinned: post.pinned || false,
        attachments: Array.isArray(post.attachments)
          ? post.attachments.map((a) =>
              typeof a === "string" ? a : JSON.stringify(a)
            )
          : [],
        permissionRead: post.permission?.read,
        permissionWrite: post.permission?.write,
        allowedDepartments: post.permission?.allowedDepartments || [],
      },
    });
    return {
      ...newPost,
      createdAt: newPost.createdAt.toISOString(),
      category: newPost.category as "공지" | "일반" | "회의록",
      pinned: newPost.pinned,
      attachments: newPost.attachments,
      permission: newPost.permissionRead
        ? {
            read: newPost.permissionRead as
              | "전체"
              | "부장 이상"
              | "특정 부서"
              | "작성자만",
            write: newPost.permissionWrite as
              | "전체"
              | "부장 이상"
              | "특정 부서"
              | "작성자만"
              | undefined,
            allowedDepartments: newPost.allowedDepartments,
          }
        : undefined,
    };
  }

  async updatePost(
    id: number,
    updates: Partial<ApiPost>
  ): Promise<ApiPost | null> {
    const updateData: any = {};
    if (updates.title) updateData.title = updates.title;
    if (updates.content) updateData.content = updates.content;
    if (updates.category) updateData.category = updates.category;
    if (updates.pinned !== undefined) updateData.pinned = updates.pinned;
    if (updates.attachments) updateData.attachments = updates.attachments;
    if (updates.permission) {
      updateData.permissionRead = updates.permission.read;
      updateData.permissionWrite = updates.permission.write;
      updateData.allowedDepartments =
        updates.permission.allowedDepartments || [];
    }

    try {
      const updated = await prisma.post.update({
        where: { id },
        data: updateData,
      });
      return {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        category: updated.category as "공지" | "일반" | "회의록",
        permission: updated.permissionRead
          ? {
              read: updated.permissionRead as
                | "전체"
                | "부장 이상"
                | "특정 부서"
                | "작성자만",
              write: updated.permissionWrite as
                | "전체"
                | "부장 이상"
                | "특정 부서"
                | "작성자만"
                | undefined,
              allowedDepartments: updated.allowedDepartments,
            }
          : undefined,
      };
    } catch {
      return null;
    }
  }

  async deletePost(id: number): Promise<boolean> {
    try {
      await prisma.post.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async incrementPostViews(id: number): Promise<void> {
    await prisma.post.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  }

  // Events
  async getEvents(): Promise<ApiEvent[]> {
    const events = await prisma.event.findMany({
      orderBy: { date: "asc" },
    });
    return events.map((event) => ({
      ...event,
      description: event.description ?? undefined,
      endDate: event.endDate ?? undefined,
      endTime: event.endTime ?? undefined,
      location: event.location ?? undefined,
      category: (event.category ?? undefined) as ApiEvent["category"],
      color: event.color ?? undefined,
      postId: event.postId ?? undefined,
      createdBy: event.createdBy ?? undefined,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    }));
  }

  async getEventById(id: string): Promise<ApiEvent | undefined> {
    const event = await prisma.event.findUnique({
      where: { id },
    });
    if (!event) return undefined;
    const eventWithDepts = event as any;
    return {
      ...event,
      description: event.description ?? undefined,
      endDate: event.endDate ?? undefined,
      endTime: event.endTime ?? undefined,
      location: event.location ?? undefined,
      category: (event.category ?? undefined) as ApiEvent["category"],
      color: event.color ?? undefined,
      postId: event.postId ?? undefined,
      createdBy: event.createdBy ?? undefined,
      allowedDepartments:
        eventWithDepts.allowedDepartments?.length > 0
          ? eventWithDepts.allowedDepartments
          : undefined,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    };
  }

  async addEvent(
    event: Omit<ApiEvent, "id" | "createdAt" | "updatedAt">
  ): Promise<ApiEvent> {
    const newEvent = await prisma.event.create({
      data: {
        title: event.title,
        description: event.description,
        date: event.date,
        endDate: event.endDate,
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location,
        category: event.category,
        color: event.color,
        postId: event.postId,
        noTime: event.noTime || false,
        isPeriod: event.isPeriod || false,
        createdBy: event.createdBy,
        allowedDepartments: event.allowedDepartments || [],
      } as any,
    });
    const eventWithDepts = newEvent as any;
    return {
      ...newEvent,
      description: newEvent.description ?? undefined,
      endDate: newEvent.endDate ?? undefined,
      endTime: newEvent.endTime ?? undefined,
      location: newEvent.location ?? undefined,
      category: (newEvent.category ?? undefined) as ApiEvent["category"],
      color: newEvent.color ?? undefined,
      postId: newEvent.postId ?? undefined,
      createdBy: newEvent.createdBy ?? undefined,
      allowedDepartments:
        eventWithDepts.allowedDepartments?.length > 0
          ? eventWithDepts.allowedDepartments
          : undefined,
      createdAt: newEvent.createdAt.toISOString(),
      updatedAt: newEvent.updatedAt.toISOString(),
    };
  }

  async updateEvent(
    id: string,
    updates: Partial<ApiEvent>
  ): Promise<ApiEvent | null> {
    const updateData: any = {};
    if (updates.title) updateData.title = updates.title;
    if (updates.description !== undefined)
      updateData.description = updates.description;
    if (updates.date) updateData.date = updates.date;
    if (updates.endDate !== undefined) updateData.endDate = updates.endDate;
    if (updates.startTime) updateData.startTime = updates.startTime;
    if (updates.endTime !== undefined) updateData.endTime = updates.endTime;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.category) updateData.category = updates.category;
    if (updates.color !== undefined) updateData.color = updates.color;
    if (updates.postId !== undefined) updateData.postId = updates.postId;
    if (updates.noTime !== undefined) updateData.noTime = updates.noTime;
    if (updates.isPeriod !== undefined) updateData.isPeriod = updates.isPeriod;

    try {
      const updated = await prisma.event.update({
        where: { id },
        data: updateData as any,
      });
      const updatedWithDepts = updated as any;
      return {
        ...updated,
        description: updated.description ?? undefined,
        endDate: updated.endDate ?? undefined,
        endTime: updated.endTime ?? undefined,
        location: updated.location ?? undefined,
        category: (updated.category ?? undefined) as ApiEvent["category"],
        color: updated.color ?? undefined,
        postId: updated.postId ?? undefined,
        createdBy: updated.createdBy ?? undefined,
        allowedDepartments:
          updatedWithDepts.allowedDepartments?.length > 0
            ? updatedWithDepts.allowedDepartments
            : undefined,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    } catch {
      return null;
    }
  }

  async deleteEvent(id: string): Promise<boolean> {
    try {
      await prisma.event.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  // Agendas
  async getAgendas(): Promise<ApiAgenda[]> {
    const agendas = await prisma.agenda.findMany({
      orderBy: { createdAt: "desc" },
      include: { createdByUser: true },
    });
    return agendas.map((agenda) => ({
      id: agenda.id,
      title: agenda.title,
      description: agenda.description,
      category: agenda.category as
        | "회의안건"
        | "의결사항"
        | "논의사항"
        | "기타",
      status: agenda.status as "진행중" | "완료" | "보류",
      priority: agenda.priority as "높음" | "보통" | "낮음",
      assignedTo: agenda.assignedTo ?? undefined,
      department: agenda.department ?? undefined,
      relatedPostId: agenda.relatedPostId ?? undefined,
      relatedEventId: agenda.relatedEventId ?? undefined,
      createdBy: agenda.createdByUser.name,
      createdById: agenda.createdByUser.id,
      createdAt: agenda.createdAt.toISOString(),
      updatedAt: agenda.updatedAt.toISOString(),
    }));
  }

  async getAgendaById(id: number): Promise<ApiAgenda | undefined> {
    const agenda = await prisma.agenda.findUnique({
      where: { id },
      include: { createdByUser: true },
    });
    if (!agenda) return undefined;
    return {
      id: agenda.id,
      title: agenda.title,
      description: agenda.description,
      category: agenda.category as
        | "회의안건"
        | "의결사항"
        | "논의사항"
        | "기타",
      status: agenda.status as "진행중" | "완료" | "보류",
      priority: agenda.priority as "높음" | "보통" | "낮음",
      assignedTo: agenda.assignedTo ?? undefined,
      department: agenda.department ?? undefined,
      relatedPostId: agenda.relatedPostId ?? undefined,
      relatedEventId: agenda.relatedEventId ?? undefined,
      createdBy: agenda.createdByUser.name,
      createdById: agenda.createdByUser.id,
      createdAt: agenda.createdAt.toISOString(),
      updatedAt: agenda.updatedAt.toISOString(),
    };
  }

  async addAgenda(
    agenda: Omit<ApiAgenda, "id" | "createdAt" | "updatedAt">
  ): Promise<ApiAgenda> {
    const newAgenda = await prisma.agenda.create({
      data: {
        title: agenda.title,
        description: agenda.description,
        category: agenda.category,
        status: agenda.status,
        priority: agenda.priority,
        assignedTo: agenda.assignedTo,
        department: agenda.department,
        relatedPostId: agenda.relatedPostId,
        relatedEventId: agenda.relatedEventId,
        createdBy: agenda.createdBy,
        createdById: agenda.createdById,
      },
    });
    const createdByUser = await prisma.user.findUnique({
      where: { id: newAgenda.createdById },
    });

    return {
      id: newAgenda.id,
      title: newAgenda.title,
      description: newAgenda.description,
      category: newAgenda.category as
        | "회의안건"
        | "의결사항"
        | "논의사항"
        | "기타",
      status: newAgenda.status as "진행중" | "완료" | "보류",
      priority: newAgenda.priority as "높음" | "보통" | "낮음",
      assignedTo: newAgenda.assignedTo ?? undefined,
      department: newAgenda.department ?? undefined,
      relatedPostId: newAgenda.relatedPostId ?? undefined,
      relatedEventId: newAgenda.relatedEventId ?? undefined,
      createdBy: createdByUser?.name || newAgenda.createdBy,
      createdById: newAgenda.createdById,
      createdAt: newAgenda.createdAt.toISOString(),
      updatedAt: newAgenda.updatedAt.toISOString(),
    };
  }

  async updateAgenda(
    id: number,
    updates: Partial<ApiAgenda>
  ): Promise<ApiAgenda | null> {
    const updateData: any = {};
    if (updates.title) updateData.title = updates.title;
    if (updates.description) updateData.description = updates.description;
    if (updates.category) updateData.category = updates.category;
    if (updates.status) updateData.status = updates.status;
    if (updates.priority) updateData.priority = updates.priority;
    if (updates.assignedTo !== undefined)
      updateData.assignedTo = updates.assignedTo;
    if (updates.department !== undefined)
      updateData.department = updates.department;
    if (updates.relatedPostId !== undefined)
      updateData.relatedPostId = updates.relatedPostId;
    if (updates.relatedEventId !== undefined)
      updateData.relatedEventId = updates.relatedEventId;

    try {
      const updated = await prisma.agenda.update({
        where: { id },
        data: updateData,
      });
      const createdByUser = await prisma.user.findUnique({
        where: { id: updated.createdById },
      });

      return {
        id: updated.id,
        title: updated.title,
        description: updated.description,
        category: updated.category as
          | "회의안건"
          | "의결사항"
          | "논의사항"
          | "기타",
        status: updated.status as "진행중" | "완료" | "보류",
        priority: updated.priority as "높음" | "보통" | "낮음",
        assignedTo: updated.assignedTo ?? undefined,
        department: updated.department ?? undefined,
        relatedPostId: updated.relatedPostId ?? undefined,
        relatedEventId: updated.relatedEventId ?? undefined,
        createdBy: createdByUser?.name || updated.createdBy,
        createdById: updated.createdById,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    } catch {
      return null;
    }
  }

  async deleteAgenda(id: number): Promise<boolean> {
    try {
      await prisma.agenda.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  // Notifications
  async createNotification(notification: {
    userId: number;
    type: "mention" | "post" | "event" | "agenda";
    title: string;
    message: string;
    relatedPostId?: number;
    relatedEventId?: string;
    relatedAgendaId?: number;
  }): Promise<void> {
    await (prisma as any).notification.create({
      data: notification,
    });
  }

  async getNotifications(userId: number): Promise<any[]> {
    const notifications = await (prisma as any).notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return notifications.map((notif: any) => ({
      ...notif,
      createdAt: notif.createdAt.toISOString(),
    }));
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    await (prisma as any).notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  async markAllNotificationsAsRead(userId: number): Promise<void> {
    await (prisma as any).notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  async getUnreadNotificationCount(userId: number): Promise<number> {
    return (prisma as any).notification.count({
      where: { userId, read: false },
    });
  }
}

// 싱글톤 인스턴스
export const dataStore = new DataStore();

// 초기 데이터 설정 (서버 사이드에서만 실행)
export async function initializeData() {
  const userCount = await prisma.user.count();
  if (userCount > 0) return; // 이미 초기화됨

  // 비밀번호 해시 함수
  function hashPassword(password: string): string {
    return crypto.createHash("sha256").update(password).digest("hex");
  }

  // 초기 회장 계정 (자동 승인)
  // 환경 변수에서 초기 계정 정보 가져오기 (보안을 위해 환경 변수 필수)
  const initialAdminName = process.env.INITIAL_ADMIN_NAME;
  const initialAdminEmail = process.env.INITIAL_ADMIN_EMAIL;
  const initialAdminPassword = process.env.INITIAL_ADMIN_PASSWORD;

  // 환경 변수가 설정되지 않은 경우 초기 계정 생성을 건너뛰기
  // (프로덕션 환경에서는 반드시 환경 변수 설정 필요)
  if (!initialAdminName || !initialAdminEmail || !initialAdminPassword) {
    console.warn(
      "초기 관리자 계정 생성 스킵: INITIAL_ADMIN_NAME, INITIAL_ADMIN_EMAIL, INITIAL_ADMIN_PASSWORD 환경 변수가 설정되지 않았습니다."
    );
    console.warn(
      "데이터베이스가 비어있는 경우, 환경 변수를 설정하거나 수동으로 관리자 계정을 생성해주세요."
    );
    return;
  }

  // 이메일 중복 체크
  const existingUser = await prisma.user.findUnique({
    where: { email: initialAdminEmail },
  });

  if (existingUser) {
    console.warn(
      `초기 관리자 계정 생성 스킵: ${initialAdminEmail} 이메일의 사용자가 이미 존재합니다.`
    );
    return;
  }

  await prisma.user.create({
    data: {
      name: initialAdminName,
      email: initialAdminEmail,
      password: hashPassword(initialAdminPassword),
      studentId: "",
      role: "회장",
      department: "총관리",
      phone: "",
      active: true,
      approved: true, // 회장은 자동 승인
    } as any,
  });

  console.log(
    `초기 관리자 계정 생성 완료: ${initialAdminName} (${initialAdminEmail})`
  );
}
