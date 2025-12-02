# Vercel 배포 설정 가이드

## 1. 환경 변수 설정 (필수)

Vercel 프로젝트 설정에서 다음 환경 변수를 추가해야 합니다:

### DATABASE_URL (필수)
- **이름**: `DATABASE_URL`
- **값**: PostgreSQL 데이터베이스 연결 URL
- **형식**: `postgresql://username:password@host:5432/database?sslmode=require`
- **예시**: 
  ```
  postgresql://user:password@ep-xxx.region.provider.com:5432/dbname?sslmode=require
  ```

### 데이터베이스 제공업체 옵션
1. **Vercel Postgres** (권장)
   - Vercel 대시보드 → Storage → Create Database → Postgres
   - 자동으로 환경 변수가 설정됩니다

2. **Neon**
   - https://neon.tech 에서 데이터베이스 생성
   - Connection String을 복사하여 `DATABASE_URL`로 설정

3. **Supabase**
   - https://supabase.com 에서 프로젝트 생성
   - Settings → Database → Connection string (URI) 복사

## 2. Build Settings 확인

### Build Command
```
prisma generate && prisma migrate deploy && next build
```

### Output Directory
```
.next
```

### Install Command
```
npm install
```

(기본값이 올바르게 설정되어 있어야 합니다)

## 3. 배포 후 할 일

1. **데이터베이스 마이그레이션**
   - 빌드 시 자동으로 `prisma migrate deploy`가 실행됩니다
   - 또는 수동으로 Vercel CLI를 통해 실행할 수 있습니다:
     ```bash
     vercel env pull
     npx prisma migrate deploy
     ```

2. **초기 데이터 확인**
   - 배포 후 애플리케이션이 정상 작동하는지 확인
   - 첫 번째 사용자 계정을 생성해야 할 수 있습니다

## 4. 트러블슈팅

### 빌드 오류: "Module not found: Can't resolve '@prisma/client'"
- `postinstall` 스크립트가 실행되는지 확인
- Build Settings에서 Install Command가 `npm install`인지 확인

### 데이터베이스 연결 오류
- `DATABASE_URL` 환경 변수가 올바르게 설정되었는지 확인
- 데이터베이스가 외부 연결을 허용하는지 확인 (SSL 모드 등)
- Vercel의 IP 주소가 화이트리스트에 포함되어 있는지 확인

### 마이그레이션 오류
- 데이터베이스에 마이그레이션 히스토리 테이블이 있는지 확인
- 필요시 `prisma migrate reset` 후 재배포

