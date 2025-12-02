import { NextRequest, NextResponse } from 'next/server';
import { dataStore, initializeData } from '@/lib/dataStore';
import crypto from 'crypto';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function verifyPassword(password: string, hashedPassword: string): boolean {
  return hashPassword(password) === hashedPassword;
}

export async function POST(request: NextRequest) {
  // 초기 데이터 설정
  await initializeData();
  try {
    const body = await request.json();
    const { email, password } = body;

    // 유효성 검사
    if (!email || !password) {
      return NextResponse.json(
        { error: '이메일과 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 사용자 찾기 (비밀번호 포함)
    const user = await dataStore.getUserByEmailWithPassword(email);
    if (!user) {
      return NextResponse.json(
        { error: '등록되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }

    // 비밀번호 확인 (해시된 비밀번호 비교)
    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword && user.password !== password) {
      // 개발용: 평문 비밀번호도 허용
      return NextResponse.json(
        { error: '비밀번호가 일치하지 않습니다.' },
        { status: 401 }
      );
    }

    // 비활성 사용자 체크
    if (!user.active) {
      return NextResponse.json(
        { error: '비활성화된 계정입니다.' },
        { status: 403 }
      );
    }

    // 승인 여부 체크 (회장은 제외)
    if (!user.approved && user.role !== '회장') {
      return NextResponse.json(
        { error: '회장 승인이 필요한 계정입니다. 승인 후 로그인 가능합니다.' },
        { status: 403 }
      );
    }

    // 응답에서 비밀번호 제외
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      message: '로그인 성공',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

