# 버그 수정 및 문제 해결 기록

## 주요 오류 및 해결 방법

### 1. useEffect import 누락
- **문제**: `src/app/calendar/page.tsx`에서 `useEffect`를 사용했지만 import하지 않음
- **해결**: `import { useState, useMemo, useEffect } from 'react';`에 `useEffect` 추가

### 2. 사용자 관련 함수 import 누락
- **문제**: `src/app/signup/page.tsx`에서 `addUser`, `getUserByEmail`, `setCurrentUser` import 누락
- **해결**: `@/utils/userStore`와 `@/utils/permissions`에서 필요한 함수들 import

### 3. handleAddMember 함수 누락
- **문제**: `src/app/members/page.tsx`에서 `handleAddMember` 함수 참조 오류
- **해결**: 회원 추가는 signup 페이지를 통해 처리하도록 변경, `MemberModal`은 편집 전용으로 수정

### 4. Hydration Mismatch 에러
- **문제**: `src/components/Dashboard/CalendarWidget.tsx`에서 서버/클라이언트 렌더링 불일치
- **해결**: `isMounted` state를 도입하여 클라이언트 측에서만 이벤트 데이터를 렌더링하도록 수정

### 5. Prisma 클라이언트 생성 오류
- **문제**: `Module not found: Can't resolve '@prisma/client'` 빌드 오류
- **해결**: 
  - `package.json`에 `postinstall` 스크립트 추가: `"postinstall": "prisma generate"`
  - `npm install` 실행하여 Prisma 클라이언트 생성
  - 빌드 스크립트에 `prisma generate` 명시적 추가

### 6. 중복 import 오류
- **문제**: `src/components/Dashboard/CalendarWidget.tsx`에서 `format` 함수 중복 import
- **해결**: 중복된 `import { format } from 'date-fns';` 제거

### 7. API 연동 관련 누락
- **문제**: 여러 컴포넌트에서 `usersApi`, `postsApi`, `eventsApi`, `authApi` import 누락
- **해결**: `src/lib/api.ts`에서 필요한 API 클라이언트들 import

## 주요 기술적 도전 과제

### 1. localStorage에서 API로의 마이그레이션
- 모든 프론트엔드 페이지의 데이터 저장 방식을 `localStorage`에서 Next.js API Routes로 변경
- 비동기 처리 및 에러 핸들링 구현
- 상태 관리 및 실시간 업데이트를 위한 이벤트 시스템 구현

### 2. Prisma + PostgreSQL 설정
- Vercel 배포를 위한 Prisma ORM 및 PostgreSQL 데이터베이스 설정
- 기존 메모리 기반 데이터 스토어를 데이터베이스 기반으로 전환
- 비동기 메서드로 전환 및 모든 API Routes 업데이트

### 3. 커스텀 드롭다운 UI 구현
- 기본 `<select>` 요소를 `framer-motion`을 활용한 커스텀 드롭다운으로 교체
- 클릭 외부 영역 감지 및 애니메이션 구현
- undefined 값 처리 및 옵션 선택 로직 구현

### 4. 권한 시스템 구현
- 사용자 역할 기반 권한 체크 (`회장`, `부회장`, `부장`, `부원`)
- 게시글 읽기/쓰기/삭제 권한 체크
- 회원 관리 권한 체크

### 5. 인증 시스템 구현
- 비밀번호 해싱 (bcrypt)
- 로그인/로그아웃 상태 관리
- 세션 관리 및 자동 로그인 기능

