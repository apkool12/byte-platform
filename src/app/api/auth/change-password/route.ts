import { NextRequest, NextResponse } from 'next/server';
import { dataStore, initializeData } from '@/lib/dataStore';
import crypto from 'crypto';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(request: NextRequest) {
  await initializeData();
  
  try {
    const body = await request.json();
    const { currentPassword, newPassword, userId } = body;

    if (!currentPassword || !newPassword || !userId) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: '새 비밀번호는 최소 6자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    // userId로 사용자 찾기
    const userById = await dataStore.getUserById(parseInt(userId));
    
    if (!userById) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 현재 비밀번호 확인 (비밀번호 포함된 사용자 정보 가져오기)
    const userWithPassword = await dataStore.getUserByEmailWithPassword(userById.email);
    if (!userWithPassword) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const hashedCurrentPassword = hashPassword(currentPassword);
    if (userWithPassword.password !== hashedCurrentPassword && userWithPassword.password !== currentPassword) {
      return NextResponse.json(
        { error: '현재 비밀번호가 일치하지 않습니다.' },
        { status: 401 }
      );
    }

    // 비밀번호 변경
    const updatedUser = await dataStore.updateUser(userById.id, {
      password: hashPassword(newPassword),
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: '비밀번호 변경에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: '비밀번호가 변경되었습니다.' });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

