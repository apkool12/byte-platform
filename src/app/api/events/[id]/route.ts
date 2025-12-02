import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/dataStore';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const event = await dataStore.getEventById(id);

    if (!event) {
      return NextResponse.json(
        { error: '일정을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Get event error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedEvent = await dataStore.updateEvent(id, body);

    if (!updatedEvent) {
      return NextResponse.json(
        { error: '일정을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ event: updatedEvent, message: '일정이 수정되었습니다.' });
  } catch (error) {
    console.error('Update event error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await dataStore.deleteEvent(id);

    if (!deleted) {
      return NextResponse.json(
        { error: '일정을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: '일정이 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete event error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

