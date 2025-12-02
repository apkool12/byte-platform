import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/dataStore';
import { getCurrentUser } from '@/utils/permissions';

export async function POST(request: NextRequest) {
  try {
    // 실제로는 세션/토큰 무효화 등의 작업 수행
    // 현재는 간단히 성공 응답만 반환
    return NextResponse.json({ message: '로그아웃되었습니다.' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

