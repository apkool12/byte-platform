import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/dataStore';
import { ApiEvent } from '@/lib/dataStore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); // YYYY-MM-DD 형식
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let events = await dataStore.getEvents();

    // 특정 날짜의 이벤트 필터
    if (date) {
      events = events.filter(e => {
        const eventStart = new Date(e.date);
        const eventEnd = e.endDate ? new Date(e.endDate) : eventStart;
        const targetDate = new Date(date);
        
        return (
          e.date === date ||
          (e.isPeriod && e.endDate && targetDate >= eventStart && targetDate <= eventEnd)
        );
      });
    }

    // 날짜 범위 필터
    if (startDate && endDate) {
      events = events.filter(e => {
        const eventStart = new Date(e.date);
        const eventEnd = e.endDate ? new Date(e.endDate) : eventStart;
        const rangeStart = new Date(startDate);
        const rangeEnd = new Date(endDate);
        
        return (
          (eventStart >= rangeStart && eventStart <= rangeEnd) ||
          (eventEnd >= rangeStart && eventEnd <= rangeEnd) ||
          (eventStart <= rangeStart && eventEnd >= rangeEnd)
        );
      });
    }

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Get events error:', error);
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
      date, 
      endDate, 
      startTime, 
      endTime, 
      location, 
      category, 
      color, 
      postId, 
      noTime, 
      isPeriod,
      allowedDepartments
    } = body;

    // 유효성 검사
    if (!title || !date) {
      return NextResponse.json(
        { error: '제목과 날짜는 필수 항목입니다.' },
        { status: 400 }
      );
    }

    if (isPeriod && !endDate) {
      return NextResponse.json(
        { error: '기간 일정인 경우 종료일이 필요합니다.' },
        { status: 400 }
      );
    }

    // 시간이 없으면 자동으로 noTime으로 처리
    const shouldNoTime = !startTime || noTime;

    const newEvent = await dataStore.addEvent({
      title,
      description,
      date,
      endDate,
      startTime: shouldNoTime ? '' : (startTime || ''),
      endTime: shouldNoTime ? undefined : endTime,
      location,
      category: category || '기타',
      color: color || '#1d1d1f',
      postId,
      noTime: shouldNoTime,
      isPeriod: isPeriod || false,
      createdBy: body.createdBy,
      allowedDepartments: allowedDepartments || [],
    });

    return NextResponse.json(
      { event: newEvent, message: '일정이 추가되었습니다.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

