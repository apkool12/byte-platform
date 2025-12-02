import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/dataStore';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: '유효하지 않은 안건 ID입니다.' },
        { status: 400 }
      );
    }

    const agenda = await dataStore.getAgendaById(id);
    if (!agenda) {
      return NextResponse.json(
        { error: '안건을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ agenda });
  } catch (error) {
    console.error('Get agenda error:', error);
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
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: '유효하지 않은 안건 ID입니다.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updatedAgenda = await dataStore.updateAgenda(id, body);

    if (!updatedAgenda) {
      return NextResponse.json(
        { error: '안건을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ agenda: updatedAgenda, message: '안건이 수정되었습니다.' });
  } catch (error) {
    console.error('Update agenda error:', error);
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
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: '유효하지 않은 안건 ID입니다.' },
        { status: 400 }
      );
    }

    const deleted = await dataStore.deleteAgenda(id);
    if (!deleted) {
      return NextResponse.json(
        { error: '안건을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: '안건이 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete agenda error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

