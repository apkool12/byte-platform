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
        { error: '유효하지 않은 게시글 ID입니다.' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json(
        { error: '파일명이 필요합니다.' },
        { status: 400 }
      );
    }

    const post = await dataStore.getPostById(id);
    if (!post) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // attachments에서 파일 찾기
    // attachments가 객체 배열인 경우와 문자열 배열인 경우 모두 처리
    let fileData: string | null = null;
    let fileFound = false;

    if (post.attachments && Array.isArray(post.attachments)) {
      for (const attachment of post.attachments) {
        if (typeof attachment === 'string') {
          // 기존 형식: 문자열 배열
          if (attachment === filename) {
            // 기존 파일은 base64 데이터가 없으므로 에러
            return NextResponse.json(
              { error: '이 파일은 다운로드할 수 없습니다. (파일 데이터 없음)' },
              { status: 404 }
            );
          }
        } else if (typeof attachment === 'object' && attachment !== null) {
          // 새 형식: {name: string, data: string} 객체
          const file = attachment as { name: string; data?: string };
          if (file.name === filename) {
            fileFound = true;
            fileData = file.data || null;
            break;
          }
        }
      }
    }

    if (!fileFound || !fileData) {
      return NextResponse.json(
        { error: '파일을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // base64 데이터를 디코딩
    try {
      const buffer = Buffer.from(fileData, 'base64');
      
      // Content-Type 결정 (파일 확장자 기반)
      let contentType = 'application/octet-stream';
      const ext = filename.split('.').pop()?.toLowerCase();
      const contentTypes: { [key: string]: string } = {
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xls: 'application/vnd.ms-excel',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ppt: 'application/vnd.ms-powerpoint',
        pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        zip: 'application/zip',
        txt: 'text/plain',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
      };
      if (ext && contentTypes[ext]) {
        contentType = contentTypes[ext];
      }

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
          'Content-Length': buffer.length.toString(),
        },
      });
    } catch (error) {
      console.error('File decode error:', error);
      return NextResponse.json(
        { error: '파일 디코딩에 실패했습니다.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Download file error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

