import { NextRequest, NextResponse } from 'next/server';
import { dataStore, ApiUser } from '@/lib/dataStore';

export async function GET(request: NextRequest) {
  try {
    const users = await dataStore.getUsers();
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

