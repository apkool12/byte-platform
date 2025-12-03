import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/dataStore';
import { ApiPost } from '@/lib/dataStore';
import { sendMentionEmail, sendPostNotificationEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let posts = await dataStore.getPosts();

    // 카테고리 필터
    if (category && category !== '전체') {
      posts = posts.filter(p => p.category === category);
    }

    // 검색 필터
    if (search) {
      posts = posts.filter(p => 
        p.title.includes(search) || 
        p.author.includes(search)
      );
    }

    // 정렬: 고정 게시글 우선, 그 다음 최신순
    posts.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, author, authorId, department, category, pinned, attachments, permission } = body;

    // 유효성 검사
    if (!title || !author || !authorId || !department || !category) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const newPost = await dataStore.addPost({
      title,
      content: content || '',
      author,
      authorId,
      department,
      category,
      pinned: pinned || false,
      attachments: attachments || [],
      permission,
    });

    // 알림 생성: 멘션된 사용자 및 특정 부서 사용자에게
    try {
      const allUsers = await dataStore.getUsers();
      const mentionedUserIds = new Set<number>();
      
      // 멘션 추출 (data-mention 속성에서)
      if (content) {
        const mentionRegex = /<span[^>]*data-mention="(\d+)"[^>]*>@([^<]+)<\/span>/g;
        let match;
        while ((match = mentionRegex.exec(content)) !== null) {
          const userId = parseInt(match[1]);
          mentionedUserIds.add(userId);
        }
      }

      // 멘션된 사용자에게 알림 및 이메일 전송
      for (const userId of mentionedUserIds) {
        if (userId !== authorId) {
          const mentionedUser = allUsers.find(u => u.id === userId);
          
          // 알림 생성
          await dataStore.createNotification({
            userId,
            type: 'mention',
            title: '새로운 멘션',
            message: `${author}님이 게시글에서 당신을 언급했습니다: "${title}"`,
            relatedPostId: newPost.id,
          });

          // 이메일 전송 (비동기로 실행하여 게시글 생성을 막지 않음)
          if (mentionedUser && mentionedUser.email) {
            sendMentionEmail(
              mentionedUser.email,
              mentionedUser.name,
              author,
              title,
              content || '',
              newPost.id
            ).catch(error => {
              console.error(`이메일 전송 실패 (사용자 ID: ${userId}):`, error);
            });
          }
        }
      }

      // 특정 부서 게시글인 경우 해당 부서 사용자에게 알림 및 이메일 전송
      if (permission?.read === '특정 부서' && permission.allowedDepartments && permission.allowedDepartments.length > 0) {
        for (const user of allUsers) {
          if (
            permission.allowedDepartments.includes(user.department) &&
            user.id !== authorId &&
            !mentionedUserIds.has(user.id)
          ) {
            // 알림 생성
            await dataStore.createNotification({
              userId: user.id,
              type: 'post',
              title: '새로운 게시글',
              message: `${author}님이 "${title}" 게시글을 작성했습니다.`,
              relatedPostId: newPost.id,
            });

            // 이메일 전송 (비동기로 실행하여 게시글 생성을 막지 않음)
            if (user.email) {
              const userDepartment = user.department || permission.allowedDepartments[0];
              sendPostNotificationEmail(
                user.email,
                user.name,
                author,
                title,
                content || '',
                newPost.id,
                'department',
                userDepartment
              ).catch(error => {
                console.error(`이메일 전송 실패 (사용자 ID: ${user.id}):`, error);
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Notification creation error:', error);
      // 알림 생성 실패해도 게시글은 성공 처리
    }

    return NextResponse.json(
      { post: newPost, message: '게시글이 작성되었습니다.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

