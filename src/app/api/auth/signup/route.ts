import { NextRequest, NextResponse } from 'next/server';
import { dataStore, initializeData } from '@/lib/dataStore';
import crypto from 'crypto';

// 간단한 비밀번호 해시 함수 (실제로는 bcrypt 사용 권장)
function hashPassword(password: string): string {
  // 실제 프로덕션에서는 bcrypt 사용
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
    const { email, password, name, studentId } = body;

    // 유효성 검사
    if (!email || !password || !name || !studentId) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 이메일 중복 체크
    const existingUser = await dataStore.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: '이미 등록된 이메일입니다.' },
        { status: 409 }
      );
    }

    // 사용자 생성
    const newUser = await dataStore.addUser({
      name,
      email,
      password: hashPassword(password),
      studentId,
      role: '회장', // 기본 역할
      department: '총관리',
      phone: '',
      active: true,
    });

    // 응답에서 비밀번호 제외
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      { user: userWithoutPassword, message: '회원가입이 완료되었습니다.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

