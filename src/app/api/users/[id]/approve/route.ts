import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/dataStore';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);
    const body = await request.json();
    const { approved } = body;

    if (approved === undefined) {
      return NextResponse.json(
        { error: '승인 여부를 지정해주세요.' },
        { status: 400 }
      );
    }

    const updatedUser = await dataStore.updateUser(userId, { approved });

    if (!updatedUser) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 승인된 경우 해당 사용자에게 알림
    if (approved) {
      try {
        await dataStore.createNotification({
          userId: userId,
          type: 'post',
          title: '회원가입 승인 완료',
          message: '회원가입이 승인되었습니다. 이제 로그인하실 수 있습니다.',
        });
      } catch (error) {
        console.error('Notification creation error:', error);
      }
    }

    return NextResponse.json({
      user: updatedUser,
      message: approved ? '사용자가 승인되었습니다.' : '사용자 승인이 거부되었습니다.',
    });
  } catch (error) {
    console.error('Approve user error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

