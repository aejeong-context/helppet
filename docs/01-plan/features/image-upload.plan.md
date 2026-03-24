# Image Upload Planning Document

> **Summary**: bkend.ai Storage를 활용한 이미지 업로드 기능 추가
>
> **Project**: HelpPet (오래오래)
> **Version**: 0.2.0
> **Author**: aejeong
> **Date**: 2026-03-22
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 반려동물 프로필, 건강기록, 게시글, 입양 공고에 이미지 필드가 있지만 실제 업로드 기능이 없어 사진 첨부 불가 |
| **Solution** | bkend.ai Storage Presigned URL 방식으로 이미지 업로드 구현, 공용 ImageUploader 컴포넌트 + useFileUpload 훅 |
| **Function/UX Effect** | 드래그앤드롭/클릭으로 이미지 선택, 프리뷰 확인 후 업로드, CDN 최적화 이미지 표시 |
| **Core Value** | 1개의 공용 컴포넌트로 4개 영역(반려동물/건강기록/게시글/입양)의 이미지 업로드를 통일 처리 |

---

## 1. Overview

### 1.1 Purpose

현재 오래오래 플랫폼의 데이터 모델(Pet, HealthRecord, Post, Adoption)에 이미지 필드가 정의되어 있지만, 실제 파일 업로드 기능이 없어 이미지를 등록할 수 없다. bkend.ai Storage API를 활용하여 이미지 업로드/표시 기능을 구현한다.

### 1.2 Background

- MVP 보고서에서 "이미지 업로드 미구현 (Medium)" 으로 식별됨
- 반려동물 프로필 사진, 진료 기록 사진, 커뮤니티 게시글 이미지, 입양 공고 사진 등 플랫폼 전반에서 필요
- bkend.ai Storage는 Presigned URL 방식으로 서버 부하 없이 직접 업로드 지원

### 1.3 Related Documents

- MVP Report: `docs/04-report/features/helppet.report.md`
- bkend.ai Storage Docs: Presigned URL Upload, Image Optimization CDN

---

## 2. Scope

### 2.1 In Scope

- [x] 공용 이미지 업로드 컴포넌트 (ImageUploader)
- [x] 공용 파일 업로드 훅 (useFileUpload)
- [x] bkend.ai Storage 유틸리티 (presigned URL, metadata 등록)
- [x] 반려동물 프로필 이미지 업로드 (단일)
- [x] 건강기록 첨부파일 업로드 (복수)
- [x] 게시글 이미지 업로드 (복수)
- [x] 입양 공고 이미지 업로드 (복수)
- [x] CDN 최적화 이미지 표시 컴포넌트 (OptimizedImage)

### 2.2 Out of Scope

- 동영상 업로드
- 대용량 파일 멀티파트 업로드 (100MB+)
- 이미지 에디터/크롭 기능

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | Presigned URL 발급 후 S3 직접 업로드 | High | Pending |
| FR-02 | 업로드 후 metadata 등록 (POST /v1/files) | High | Pending |
| FR-03 | 이미지 프리뷰 (업로드 전 로컬 미리보기) | High | Pending |
| FR-04 | 업로드 진행률 표시 | Medium | Pending |
| FR-05 | 반려동물 프로필 이미지 (단일 업로드) | High | Pending |
| FR-06 | 건강기록 첨부파일 (복수 업로드, 최대 5장) | High | Pending |
| FR-07 | 게시글 이미지 (복수 업로드, 최대 5장) | High | Pending |
| FR-08 | 입양 공고 이미지 (복수 업로드, 최대 10장) | High | Pending |
| FR-09 | CDN 최적화 이미지 표시 (img.bkend.ai) | Medium | Pending |
| FR-10 | 이미지 삭제 (업로드된 이미지 제거) | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | 이미지 업로드 5MB 이하 3초 이내 | 네트워크 모니터링 |
| UX | 드래그앤드롭 + 클릭 업로드 지원 | 수동 테스트 |
| 파일 제한 | 최대 10MB, jpg/png/webp/gif | 클라이언트 검증 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] 공용 ImageUploader 컴포넌트로 4개 영역 이미지 업로드 동작
- [ ] 업로드된 이미지가 CDN URL로 정상 표시
- [ ] 빌드 성공 (TypeScript 에러 없음)
- [ ] 기존 폼과 통합 완료

### 4.2 Quality Criteria

- [ ] Zero lint errors
- [ ] Build succeeds
- [ ] 모든 이미지 관련 폼에서 업로드/표시/삭제 동작

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Presigned URL 15분 만료 | Medium | Low | 업로드 직전 발급, 실패 시 재발급 |
| 대용량 이미지 업로드 지연 | Medium | Medium | 클라이언트 리사이즈 (최대 2048px), 파일 크기 제한 10MB |
| CDN 캐시 무효화 | Low | Low | 파일 key 기반 URL로 자연 캐시 갱신 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Selected |
|-------|:--------:|
| **Dynamic** (bkend.ai BaaS) | ✅ |

### 6.2 Key Architectural Decisions

| Decision | Selected | Rationale |
|----------|----------|-----------|
| 업로드 방식 | bkend.ai Presigned URL | 서버 부하 없음, 직접 S3 업로드 |
| 이미지 표시 | img.bkend.ai CDN | public 이미지 리사이즈/포맷 변환 자동 |
| visibility | public | 프로필/게시글/공고 이미지는 공개, CDN 활용 |
| 컴포넌트 구조 | 공용 ImageUploader + useFileUpload 훅 | 4개 영역 통일 처리 |

### 6.3 Upload Flow

```
[사용자] 파일 선택/드래그
    ↓
[클라이언트] 파일 검증 (크기/타입)
    ↓
[클라이언트] 로컬 프리뷰 표시
    ↓
[bkend API] POST /v1/files/presigned-url → { url, key }
    ↓
[S3] PUT presigned URL (파일 직접 업로드)
    ↓
[bkend API] POST /v1/files → metadata 등록
    ↓
[클라이언트] CDN URL로 이미지 표시
    https://img.bkend.ai/fit-in/{width}x{height}/filters:quality(80)/{key}
```

### 6.4 New Files

| File | Purpose |
|------|---------|
| `src/lib/storage.ts` | bkend Storage API 유틸 (presigned URL, metadata) |
| `src/hooks/use-file-upload.ts` | 파일 업로드 훅 (상태 관리, 진행률) |
| `src/components/ui/image-uploader.tsx` | 공용 이미지 업로드 컴포넌트 |
| `src/components/ui/optimized-image.tsx` | CDN 최적화 이미지 표시 컴포넌트 |

### 6.5 Modified Files

| File | Change |
|------|--------|
| `src/app/(main)/pets/new/page.tsx` | 프로필 이미지 업로드 추가 |
| `src/components/features/health-record-form.tsx` | 첨부파일 업로드 추가 |
| `src/components/features/post-form.tsx` | 이미지 업로드 추가 |
| `src/components/features/adoption-form.tsx` | 이미지 업로드 추가 |
| `src/components/features/post-card.tsx` | 이미지 썸네일 표시 |
| `src/components/features/adoption-card.tsx` | 이미지 썸네일 표시 |
| `src/app/(main)/pets/[id]/page.tsx` | 프로필 이미지 표시 |

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [x] `CLAUDE.md` has coding conventions section
- [x] TypeScript configuration (`tsconfig.json`)
- [x] Tailwind CSS styling

### 7.2 Environment Variables Needed

| Variable | Purpose | Scope | To Be Created |
|----------|---------|-------|:-------------:|
| `NEXT_PUBLIC_BKEND_API_URL` | API endpoint | Client | ✅ (기존) |
| `NEXT_PUBLIC_BKEND_API_KEY` | API Key | Client | ✅ (기존) |
| `NEXT_PUBLIC_IMAGE_CDN` | img.bkend.ai CDN | Client | ☐ |

---

## 8. Next Steps

1. [ ] Write design document (`image-upload.design.md`)
2. [ ] Implement: storage.ts → useFileUpload → ImageUploader → 폼 통합
3. [ ] Gap analysis

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-03-22 | Initial draft | aejeong |
