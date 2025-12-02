import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/dataStore';
import { ApiPost } from '@/lib/dataStore';

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

