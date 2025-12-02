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

    // 사용자 생성 (승인 대기 상태)
    const newUser = await dataStore.addUser({
      name,
      email,
      password: hashPassword(password),
      studentId,
      role: '부원', // 기본 역할은 부원
      department: '총관리', // 기본 부서
      phone: '',
      active: true,
      approved: false, // 승인 대기 상태
    });

    // 회장에게 승인 요청 알림 생성
    try {
      const allUsers = await dataStore.getUsers();
      const president = allUsers.find(u => u.role === '회장');
      
      if (president) {
        await dataStore.createNotification({
          userId: president.id,
          type: 'post',
          title: '새로운 회원가입 요청',
          message: `${name}(${email})님이 회원가입을 요청했습니다. 승인해주세요.`,
        });
      }
    } catch (error) {
      console.error('Notification creation error:', error);
      // 알림 생성 실패해도 회원가입은 성공 처리
    }

    // 응답에서 비밀번호 제외
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      { user: userWithoutPassword, message: '회원가입이 완료되었습니다. 회장 승인 후 로그인 가능합니다.' },
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

