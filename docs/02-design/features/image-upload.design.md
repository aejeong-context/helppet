# Image Upload Design Document

> **Summary**: bkend.ai Storage Presigned URL 기반 이미지 업로드 설계
>
> **Project**: HelpPet (오래오래)
> **Version**: 0.2.0
> **Author**: aejeong
> **Date**: 2026-03-22
> **Status**: Draft
> **Planning Doc**: [image-upload.plan.md](../../01-plan/features/image-upload.plan.md)

---

## 1. Overview

### 1.1 Design Goals

- 공용 컴포넌트 1개로 4개 영역(반려동물/건강기록/게시글/입양)의 이미지 업로드 통일 처리
- bkend.ai Presigned URL을 통한 서버 부하 없는 직접 업로드
- CDN(img.bkend.ai)을 통한 자동 이미지 최적화

### 1.2 Design Principles

- 재사용성: ImageUploader 컴포넌트는 단일/복수 업로드 모두 지원
- 관심사 분리: storage API 유틸 / upload 훅 / UI 컴포넌트 3계층
- 점진적 통합: 기존 폼을 최소 변경으로 이미지 업로드 추가

---

## 2. Architecture

### 2.1 Upload Flow

```
┌──────────────┐    ┌───────────────┐    ┌──────────┐    ┌──────────────┐
│ ImageUploader │───▶│ useFileUpload │───▶│ storage  │───▶│ bkend.ai API │
│  (UI 컴포넌트) │    │   (상태 훅)    │    │  (유틸)   │    │  + S3 직접    │
└──────────────┘    └───────────────┘    └──────────┘    └──────────────┘
       ▲                                                        │
       │                    CDN URL 반환                         │
       └────────────────────────────────────────────────────────┘
```

### 2.2 Layer Assignment

| Component | Layer | Location |
|-----------|-------|----------|
| ImageUploader | Presentation | `src/components/ui/image-uploader.tsx` |
| OptimizedImage | Presentation | `src/components/ui/optimized-image.tsx` |
| useFileUpload | Application | `src/hooks/use-file-upload.ts` |
| storage | Infrastructure | `src/lib/storage.ts` |

### 2.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| ImageUploader | useFileUpload | 업로드 상태 관리 |
| useFileUpload | storage.ts | API 호출 |
| storage.ts | bkend.ts (bkendFetch) | HTTP 요청 |
| OptimizedImage | - | CDN URL 생성 |

---

## 3. Data Model

### 3.1 Upload 관련 타입 (src/types/index.ts에 추가)

```typescript
// File upload result
export interface UploadedFile {
  id: string;          // bkend file ID
  key: string;         // S3 storage key
  url: string;         // CDN URL
  filename: string;    // 원본 파일명
  contentType: string; // MIME type
}
```

### 3.2 기존 모델 영향 (변경 없음)

| Entity | Image Field | Type | 변경 |
|--------|------------|------|------|
| Pet | profileImage | `string?` | 없음 (CDN URL 저장) |
| HealthRecord | attachments | `string[]?` | 없음 (CDN URL 배열) |
| Post | images | `string[]?` | 없음 (CDN URL 배열) |
| Adoption | images | `string[]` | 없음 (CDN URL 배열) |

---

## 4. API Specification

### 4.1 bkend.ai Storage API 사용

| Step | Method | Endpoint | Purpose |
|------|--------|----------|---------|
| 1 | POST | `/v1/files/presigned-url` | Presigned URL 발급 |
| 2 | PUT | `{presignedUrl}` | S3 직접 파일 업로드 |
| 3 | POST | `/v1/files` | 메타데이터 등록 |

### 4.2 Presigned URL 발급 요청

```typescript
// POST /v1/files/presigned-url
{
  filename: "profile.jpg",
  contentType: "image/jpeg",
  fileSize: 2048000,
  visibility: "public",
  category: "images"
}
// Response: { url, key, filename, contentType }
```

### 4.3 메타데이터 등록 요청

```typescript
// POST /v1/files
{
  key: "{서버에서 받은 key}",
  originalName: "profile.jpg",
  contentType: "image/jpeg",
  size: 2048000,
  visibility: "public",
  category: "images"
}
// Response: { id, key, ... }
```

### 4.4 CDN URL 패턴

```
https://img.bkend.ai/fit-in/{width}x{height}/filters:quality(80)/{key}
```

---

## 5. Component Design

### 5.1 storage.ts (Infrastructure)

```typescript
// src/lib/storage.ts

const IMAGE_CDN = 'https://img.bkend.ai';

interface PresignedUrlResponse {
  url: string;
  key: string;
  filename: string;
  contentType: string;
}

interface FileMetadata {
  id: string;
  key: string;
  originalName: string;
  contentType: string;
  size: number;
  visibility: string;
}

// Presigned URL 발급
function getPresignedUrl(file: File): Promise<PresignedUrlResponse>

// S3 직접 업로드 (진행률 콜백)
function uploadToStorage(url: string, file: File, onProgress?: (pct: number) => void): Promise<void>

// 메타데이터 등록
function registerFileMetadata(params: { key, originalName, contentType, size, visibility, category }): Promise<FileMetadata>

// CDN URL 생성
function getCdnUrl(key: string, width?: number, height?: number, quality?: number): string

// 통합 업로드 함수
function uploadFile(file: File, onProgress?: (pct: number) => void): Promise<UploadedFile>
```

### 5.2 useFileUpload Hook (Application)

```typescript
// src/hooks/use-file-upload.ts

interface UseFileUploadOptions {
  maxFiles?: number;      // 최대 파일 수 (default: 1)
  maxSizeMB?: number;     // 최대 파일 크기 (default: 10)
  accept?: string[];      // 허용 MIME types (default: image/*)
}

interface UseFileUploadReturn {
  files: UploadedFile[];          // 업로드 완료된 파일 목록
  previews: string[];             // 로컬 프리뷰 URL
  isUploading: boolean;           // 업로드 중 여부
  progress: number;               // 진행률 (0~100)
  error: string | null;           // 에러 메시지
  upload: (files: FileList | File[]) => Promise<void>;  // 업로드 실행
  remove: (index: number) => void; // 파일 제거
  reset: () => void;              // 초기화
}

function useFileUpload(options?: UseFileUploadOptions): UseFileUploadReturn
```

### 5.3 ImageUploader Component (Presentation)

```typescript
// src/components/ui/image-uploader.tsx

interface ImageUploaderProps {
  maxFiles?: number;              // 최대 업로드 수
  value?: string[];               // 현재 이미지 URL 배열 (제어 컴포넌트)
  onChange?: (urls: string[]) => void;  // URL 변경 콜백
  className?: string;
}
```

**UI 구조:**
```
┌─────────────────────────────────────────┐
│  [이미지1] [이미지2] [+ 추가]            │  ← 업로드된 이미지 프리뷰
│                                         │
│  ┌─────────────────────────────────┐    │
│  │   📷 이미지를 드래그하거나       │    │  ← 드래그 앤 드롭 영역
│  │      클릭하여 업로드             │    │
│  │   (JPG, PNG, WebP / 최대 10MB)  │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ████████░░░░░░░░ 45%                   │  ← 업로드 진행률 (업로드 중일 때)
└─────────────────────────────────────────┘
```

### 5.4 OptimizedImage Component (Presentation)

```typescript
// src/components/ui/optimized-image.tsx

interface OptimizedImageProps {
  src: string;                    // CDN key 또는 full URL
  alt: string;
  width?: number;                 // 리사이즈 너비
  height?: number;                // 리사이즈 높이
  quality?: number;               // 품질 (default: 80)
  className?: string;
  fallback?: string;              // 로드 실패 시 대체 이미지
}
```

---

## 6. Integration Points (기존 파일 수정)

### 6.1 반려동물 등록 (pets/new/page.tsx)

```
변경: ImageUploader (maxFiles=1) 추가
위치: 이름 입력 필드 위
저장: profileImage 필드에 CDN URL 1개 저장
```

### 6.2 건강기록 폼 (health-record-form.tsx)

```
변경: ImageUploader (maxFiles=5) 추가
위치: 다음 예정일 필드 아래
저장: attachments 필드에 CDN URL 배열 저장
```

### 6.3 게시글 작성 (post-form.tsx)

```
변경: ImageUploader (maxFiles=5) 추가
위치: 내용 textarea 아래
저장: images 필드에 CDN URL 배열 저장
```

### 6.4 입양 공고 (adoption-form.tsx)

```
변경: ImageUploader (maxFiles=10) 추가
위치: 의료 이력 필드 아래
저장: images 필드에 CDN URL 배열 저장
```

### 6.5 이미지 표시 (카드/상세 컴포넌트)

| Component | Change |
|-----------|--------|
| `pets/[id]/page.tsx` | OptimizedImage로 프로필 이미지 표시 |
| `post-card.tsx` | 첫 번째 이미지 썸네일 표시 |
| `adoption-card.tsx` | 이모지 대신 첫 번째 이미지 썸네일 표시 |
| `community/[id]/page.tsx` | 게시글 이미지 갤러리 표시 |
| `adoption/[id]/page.tsx` | 공고 이미지 갤러리 표시 |

---

## 7. Error Handling

| Error | Cause | Handling |
|-------|-------|----------|
| 파일 크기 초과 | >10MB | 업로드 전 클라이언트 검증, toast 메시지 |
| 파일 타입 불허 | 이미지 아님 | accept 속성으로 필터, 검증 메시지 |
| Presigned URL 만료 | 15분 경과 | 재발급 후 재시도 |
| 업로드 네트워크 에러 | 연결 끊김 | 에러 메시지 표시, 재시도 가능 |
| CDN 이미지 로드 실패 | 잘못된 key | fallback 이미지 표시 |

---

## 8. Security Considerations

- [x] 파일 크기 제한 (10MB)
- [x] MIME type 검증 (image/jpeg, image/png, image/webp, image/gif만)
- [x] Presigned URL은 15분 만료 (bkend.ai 기본)
- [x] public visibility로 CDN 활용 (민감한 의료 이미지는 추후 private 옵션)
- [x] 파일 업로드 시 JWT 인증 필수

---

## 9. Implementation Order

| Step | Task | Files | Depends On |
|:----:|------|-------|:----------:|
| 1 | UploadedFile 타입 추가 | `src/types/index.ts` | - |
| 2 | storage 유틸 구현 | `src/lib/storage.ts` | Step 1 |
| 3 | .env.local에 CDN URL 추가 | `.env.local` | - |
| 4 | useFileUpload 훅 구현 | `src/hooks/use-file-upload.ts` | Step 2 |
| 5 | ImageUploader 컴포넌트 | `src/components/ui/image-uploader.tsx` | Step 4 |
| 6 | OptimizedImage 컴포넌트 | `src/components/ui/optimized-image.tsx` | Step 2 |
| 7 | 반려동물 등록 폼 통합 | `src/app/(main)/pets/new/page.tsx` | Step 5 |
| 8 | 건강기록 폼 통합 | `src/components/features/health-record-form.tsx` | Step 5 |
| 9 | 게시글 폼 통합 | `src/components/features/post-form.tsx`, `community/new/page.tsx` | Step 5 |
| 10 | 입양 공고 폼 통합 | `src/components/features/adoption-form.tsx` | Step 5 |
| 11 | 카드/상세 이미지 표시 | 카드/상세 컴포넌트 5개 | Step 6 |

---

## 10. File Structure

```
src/
├── types/index.ts              ← UploadedFile 타입 추가
├── lib/
│   ├── bkend.ts                  (기존, 변경 없음)
│   └── storage.ts              ← NEW: Storage API 유틸
├── hooks/
│   └── use-file-upload.ts      ← NEW: 파일 업로드 훅
├── components/
│   └── ui/
│       ├── image-uploader.tsx  ← NEW: 이미지 업로드 UI
│       └── optimized-image.tsx ← NEW: CDN 이미지 표시
├── app/(main)/
│   ├── pets/new/page.tsx         ← MODIFY: 프로필 이미지
│   ├── pets/[id]/page.tsx        ← MODIFY: 이미지 표시
│   ├── community/[id]/page.tsx   ← MODIFY: 이미지 갤러리
│   └── adoption/[id]/page.tsx    ← MODIFY: 이미지 갤러리
└── components/features/
    ├── health-record-form.tsx    ← MODIFY: 첨부파일
    ├── post-form.tsx             ← MODIFY: 이미지 추가
    ├── adoption-form.tsx         ← MODIFY: 이미지 추가
    ├── post-card.tsx             ← MODIFY: 썸네일
    └── adoption-card.tsx         ← MODIFY: 썸네일
```

**New: 4 files / Modify: 9 files / Total: 13 files**

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-03-22 | Initial draft | aejeong |
