import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/dataStore';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const notificationId = parseInt(id);
    
    await dataStore.markNotificationAsRead(notificationId);
    return NextResponse.json({ message: '알림이 읽음 처리되었습니다.' });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

