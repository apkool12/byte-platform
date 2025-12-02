# Vercel 환경 변수 설정 가이드

## ⚠️ 중요: 절대 GitHub에 커밋하지 마세요!

`.env` 파일은 이미 `.gitignore`에 포함되어 있어 안전합니다.

## Vercel에 설정할 환경 변수

Vercel 프로젝트 설정 → **Environment Variables** 섹션에서 다음을 추가하세요:

### 1. DATABASE_URL (필수)
```
postgres://e0d0dd412abb7839fdba9ecdad552a401c6cecc55a9e25d43dbda38cb1a02961:sk_SyRE8mdDZ00D0jYbTHPVG@db.prisma.io:5432/postgres?sslmode=require
```

### 2. POSTGRES_URL (선택사항, DATABASE_URL과 동일한 경우)
```
postgres://e0d0dd412abb7839fdba9ecdad552a401c6cecc55a9e25d43dbda38cb1a02961:sk_SyRE8mdDZ00D0jYbTHPVG@db.prisma.io:5432/postgres?sslmode=require
```

### 3. PRISMA_DATABASE_URL (Prisma Accelerate 사용 시)
```
prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19TeVJFOG1kRFowMEQwalliVEhQVkciLCJhcGlfa2V5IjoiMDFLQkY1RkJOTlc1RUhLNkdNTjY5WUc1QlIiLCJ0ZW5hbnRfaWQiOiJlMGQwZGQ0MTJhYmI3ODM5ZmRiYTllY2RhZDU1MmE0MDFjNmNlY2M1NWE5ZTI1ZDQzZGJkYTM4Y2IxYTAyOTYxIiwiaW50ZXJuYWxfc2VjcmV0IjoiNzZlMDQ0NWQtMzNjYS00ZDJmLTljNDQtN2MzZjIxOWUyYjg3In0.3r_q_Igw2_pGf1OoFdKj3Y3MR2ebSXkqR4oglDSeDwI
```

## 설정 방법

1. Vercel 프로젝트 페이지에서 **Settings** 탭 클릭
2. 왼쪽 메뉴에서 **Environment Variables** 선택
3. 다음 순서로 추가:
   - **Key**: `DATABASE_URL`
   - **Value**: 위의 DATABASE_URL 값 붙여넣기
   - **Environment**: `Production`, `Preview`, `Development` 모두 선택
   - **Add** 버튼 클릭

4. (선택) Prisma Accelerate를 사용하는 경우:
   - **Key**: `PRISMA_DATABASE_URL`
   - **Value**: 위의 PRISMA_DATABASE_URL 값 붙여넣기
   - **Environment**: 모두 선택
   - **Add** 버튼 클릭

## 주의사항

- 환경 변수를 추가한 후 **새로운 배포를 트리거**해야 변경사항이 적용됩니다
- Production, Preview, Development 환경 모두에 같은 값을 추가하는 것을 권장합니다
- 민감한 정보이므로 절대 GitHub, 디스코드, 슬랙 등에 공유하지 마세요

