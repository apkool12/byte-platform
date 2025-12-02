import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/dataStore';
import { ApiAgenda } from '@/lib/dataStore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let agendas = await dataStore.getAgendas();

    // 상태 필터
    if (status && status !== '전체') {
      agendas = agendas.filter(a => a.status === status);
    }

    // 검색 필터
    if (search) {
      agendas = agendas.filter(a => 
        a.title.includes(search) || 
        a.description.includes(search) ||
        (a.assignedTo && a.assignedTo.includes(search))
      );
    }

    // 최신순 정렬
    agendas.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ agendas });
  } catch (error) {
    console.error('Get agendas error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      category,
      status,
      priority,
      assignedTo,
      department,
      relatedPostId,
      relatedEventId,
      createdBy,
      createdById,
    } = body;

    // 유효성 검사
    if (!title || !category || !status || !priority || !createdBy || !createdById) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const newAgenda = await dataStore.addAgenda({
      title,
      description: description || '',
      category,
      status,
      priority,
      assignedTo,
      department,
      relatedPostId,
      relatedEventId,
      createdBy,
      createdById,
    });

    return NextResponse.json(
      { agenda: newAgenda, message: '안건이 추가되었습니다.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create agenda error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

