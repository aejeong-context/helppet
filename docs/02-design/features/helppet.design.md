# HelpPet 노견/환견 케어 플랫폼 Design Document

> **Summary**: 노견/환견 특화 건강관리 중심 종합 케어 플랫폼 상세 설계
>
> **Project**: HelpPet
> **Version**: 0.1.0
> **Author**: aejeong
> **Date**: 2026-03-20
> **Status**: Draft
> **Planning Doc**: [helppet.plan.md](../../01-plan/features/helppet.plan.md)

### Pipeline References

| Phase | Document | Status |
|-------|----------|--------|
| Phase 1 | Schema Definition | ❌ (이 문서에서 정의) |
| Phase 2 | Coding Conventions | ❌ (CLAUDE.md 기본 규칙 참조) |
| Phase 3 | Mockup | N/A |
| Phase 4 | API Spec | ❌ (이 문서에서 정의) |

---

## 1. Overview

### 1.1 Design Goals

1. **건강관리 우선 UX**: 대시보드 진입 시 투약/진료 일정이 가장 먼저 보이도록 설계
2. **간편한 일일 기록**: 컨디션 일지를 1분 내로 기록할 수 있는 슬라이더 기반 UI
3. **질병별 커뮤니티**: 같은 질병을 가진 보호자끼리 쉽게 모일 수 있는 카테고리 구조
4. **노견/환견 특화 입양**: 의료 이력과 현재 상태가 투명하게 공개되는 입양 공고

### 1.2 Design Principles

- **Simple First**: 노견/환견 보호자는 바쁜 케어 일상 중 사용 → 최소 탭으로 핵심 기능 접근
- **Data-Driven Care**: 컨디션 추이를 시각화하여 수의사 방문 시 참고 자료로 활용
- **Warm & Supportive Tone**: 정서적 부담이 큰 보호자를 위한 따뜻한 UI 톤앤매너

---

## 2. Architecture

### 2.1 Component Diagram

```
┌──────────────────────────────────────────────────────────┐
│                    Client (Next.js 14)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  (auth)  │  │  (main)  │  │components│  │  stores  │ │
│  │ login    │  │dashboard │  │  ui/     │  │auth-store│ │
│  │ register │  │pets      │  │  features│  │pet-store │ │
│  │          │  │community │  │          │  │          │ │
│  │          │  │adoption  │  │          │  │          │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
│                       │                                   │
│              ┌────────┴────────┐                          │
│              │   lib/bkend.ts  │  (API Client)            │
│              └────────┬────────┘                          │
└───────────────────────┼──────────────────────────────────┘
                        │ REST API
┌───────────────────────┼──────────────────────────────────┐
│              bkend.ai (BaaS)                              │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  Auth   │  │   Data   │  │ Storage  │  │   MCP    │ │
│  │  (JWT)  │  │ (MongoDB)│  │ (Files)  │  │ (Schema) │ │
│  └─────────┘  └──────────┘  └──────────┘  └──────────┘ │
└──────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
[사용자 입력] → [React Hook Form 유효성 검사] → [TanStack Query Mutation]
    → [bkend.ts API Client] → [bkend.ai REST API] → [MongoDB]
    → [Response] → [TanStack Query Cache 업데이트] → [UI 리렌더링]
```

### 2.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| Dashboard | Pet, Medication, HealthRecord, ConditionLog | 통합 요약 정보 표시 |
| Medication | Pet | 반려동물별 투약 스케줄 |
| HealthRecord | Pet | 반려동물별 건강 기록 |
| ConditionLog | Pet | 반려동물별 일일 컨디션 |
| Community | Auth | 인증된 사용자의 게시글 |
| Adoption | Auth | 인증된 사용자의 공고 관리 |

---

## 3. Data Model

### 3.1 Entity Definitions

#### Users (bkend.ai 내장 인증)

bkend.ai의 내장 Auth를 사용하므로 별도 User 테이블 불필요.
`auth/me` 엔드포인트에서 사용자 정보 조회.

추가 프로필 정보가 필요한 경우:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | auto | Auth user ID (참조) |
| nickname | string | Y | 닉네임 |
| profileImage | string | N | 프로필 이미지 URL |

#### Pets (반려동물)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | |
| userId | string | auto (createdBy) | 보호자 ID |
| name | string | Y | 이름 |
| species | string | Y | 종 (dog/cat/other) |
| breed | string | Y | 품종 |
| birthDate | string | Y | 생년월일 (YYYY-MM-DD) |
| weight | number | Y | 체중 (kg) |
| profileImage | string | N | 프로필 사진 URL |
| conditions | string[] | Y | 질병/상태 태그 |
| isSenior | boolean | Y | 노견 여부 (7세+) |
| specialNotes | string | N | 특이사항 메모 |

#### Medications (투약 스케줄)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | |
| petId | string | Y | 반려동물 ID (참조) |
| name | string | Y | 약물명 |
| dosage | string | Y | 용량 (e.g., '1정', '5ml') |
| frequency | string | Y | 복용 주기 |
| startDate | string | Y | 시작일 |
| endDate | string | N | 종료일 (없으면 지속) |
| timeSlots | string[] | Y | 복용 시간 (e.g., ['09:00', '21:00']) |
| notes | string | N | 복용 시 주의사항 |
| isActive | boolean | Y | 활성 여부 (기본: true) |

#### HealthRecords (건강 기록)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | |
| petId | string | Y | 반려동물 ID |
| type | string | Y | checkup/vaccination/medication/surgery/emergency |
| date | string | Y | 진료일 |
| description | string | Y | 진료 내용 |
| hospital | string | N | 병원명 |
| doctor | string | N | 담당 수의사 |
| cost | number | N | 진료비 |
| nextDate | string | N | 다음 진료 예정일 |
| attachments | string[] | N | 첨부 파일 URLs |

#### ConditionLogs (컨디션 일지)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | |
| petId | string | Y | 반려동물 ID |
| date | string | Y | 기록일 (YYYY-MM-DD, 일 1회) |
| appetite | number | Y | 식욕 (1~5) |
| activity | number | Y | 활동량 (1~5) |
| pain | number | Y | 통증 (1=심함~5=없음) |
| mood | number | Y | 기분 (1~5) |
| weight | number | N | 체중 (변화 추적용) |
| symptoms | string[] | N | 오늘의 증상 태그 |
| notes | string | N | 보호자 메모 |

#### Posts (커뮤니티 게시글)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | |
| userId | string | auto | 작성자 ID |
| category | string | Y | joint/heart/kidney/tumor/senior-care/hospital-review/general |
| title | string | Y | 제목 |
| content | string | Y | 내용 |
| images | string[] | N | 첨부 이미지 URLs |
| tags | string[] | N | 검색 태그 |
| likeCount | number | Y | 좋아요 수 (기본: 0) |
| commentCount | number | Y | 댓글 수 (기본: 0) |

#### Comments (댓글)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | |
| postId | string | Y | 게시글 ID |
| userId | string | auto | 작성자 ID |
| content | string | Y | 댓글 내용 |

#### Adoptions (입양/임시보호 공고)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | |
| userId | string | auto | 작성자 ID |
| type | string | Y | adoption/foster |
| petName | string | Y | 동물 이름 |
| species | string | Y | 종 |
| breed | string | Y | 품종 |
| age | string | Y | 나이 |
| conditions | string[] | Y | 질병/상태 |
| description | string | Y | 상세 설명 |
| images | string[] | Y | 사진 (최소 1장) |
| location | string | Y | 지역 |
| status | string | Y | available/pending/completed |
| contactInfo | string | Y | 연락처 |
| medicalHistory | string | N | 의료 이력 요약 |

### 3.2 Entity Relationships

```
[User] 1 ──── N [Pet]
  │                │
  │                ├── 1 ──── N [Medication]
  │                ├── 1 ──── N [HealthRecord]
  │                └── 1 ──── N [ConditionLog]
  │
  ├── 1 ──── N [Post] 1 ──── N [Comment]
  │
  └── 1 ──── N [Adoption]
```

---

## 4. API Specification

### 4.1 bkend.ai Auto-Generated REST API

bkend.ai에서 테이블 생성 시 자동으로 CRUD API가 생성됩니다.

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| **Auth** | | | |
| POST | /auth/email/signup | 회원가입 | - |
| POST | /auth/email/signin | 로그인 | - |
| GET | /auth/me | 내 정보 조회 | Required |
| POST | /auth/refresh | 토큰 갱신 | Required |
| POST | /auth/signout | 로그아웃 | Required |
| **Pets** | | | |
| GET | /data/pets | 내 반려동물 목록 | Required |
| GET | /data/pets/:id | 반려동물 상세 | Required |
| POST | /data/pets | 반려동물 등록 | Required |
| PATCH | /data/pets/:id | 반려동물 수정 | Required |
| DELETE | /data/pets/:id | 반려동물 삭제 | Required |
| **Medications** | | | |
| GET | /data/medications?petId={id} | 투약 목록 (반려동물별) | Required |
| POST | /data/medications | 투약 등록 | Required |
| PATCH | /data/medications/:id | 투약 수정 | Required |
| DELETE | /data/medications/:id | 투약 삭제 | Required |
| **HealthRecords** | | | |
| GET | /data/health-records?petId={id} | 건강기록 목록 | Required |
| POST | /data/health-records | 건강기록 등록 | Required |
| PATCH | /data/health-records/:id | 건강기록 수정 | Required |
| DELETE | /data/health-records/:id | 건강기록 삭제 | Required |
| **ConditionLogs** | | | |
| GET | /data/condition-logs?petId={id} | 컨디션 일지 목록 | Required |
| POST | /data/condition-logs | 컨디션 기록 | Required |
| PATCH | /data/condition-logs/:id | 컨디션 수정 | Required |
| **Posts** | | | |
| GET | /data/posts?category={cat} | 게시글 목록 (카테고리별) | Required |
| GET | /data/posts/:id | 게시글 상세 | Required |
| POST | /data/posts | 게시글 작성 | Required |
| PATCH | /data/posts/:id | 게시글 수정 | Required |
| DELETE | /data/posts/:id | 게시글 삭제 | Required |
| **Comments** | | | |
| GET | /data/comments?postId={id} | 댓글 목록 | Required |
| POST | /data/comments | 댓글 작성 | Required |
| DELETE | /data/comments/:id | 댓글 삭제 | Required |
| **Adoptions** | | | |
| GET | /data/adoptions | 입양/임시보호 공고 목록 | Optional |
| GET | /data/adoptions/:id | 공고 상세 | Optional |
| POST | /data/adoptions | 공고 등록 | Required |
| PATCH | /data/adoptions/:id | 공고 수정 | Required |
| DELETE | /data/adoptions/:id | 공고 삭제 | Required |

### 4.2 주요 쿼리 패턴

```typescript
// 오늘의 투약 목록 (대시보드)
bkend.data.list('medications', {
  petId: selectedPetId,
  isActive: 'true',
});

// 최근 7일 컨디션 (차트용)
bkend.data.list('condition-logs', {
  petId: selectedPetId,
  date_gte: sevenDaysAgo,
  _sort: 'date',
  _order: 'asc',
});

// 질병별 커뮤니티 게시글
bkend.data.list('posts', {
  category: 'heart',
  _sort: 'createdAt',
  _order: 'desc',
  _page: '1',
  _limit: '20',
});

// 입양 가능한 노견 공고
bkend.data.list('adoptions', {
  status: 'available',
  type: 'adoption',
  _sort: 'createdAt',
  _order: 'desc',
});
```

---

## 5. UI/UX Design

### 5.1 Page Structure & Navigation

```
┌─────────────────────────────────────────────┐
│  Header: 로고 + 네비게이션 + 프로필          │
├─────────────────────────────────────────────┤
│                                             │
│  [대시보드] [내 반려동물] [커뮤니티] [입양]   │  ← Bottom Tab (모바일)
│                                             │   / Top Nav (데스크톱)
│  ┌─────────────────────────────────────┐   │
│  │          Main Content               │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

### 5.2 주요 화면 레이아웃

#### Dashboard (대시보드) — 메인 진입점

```
┌─────────────────────────────────────────────┐
│  🐾 {반려동물 이름}의 오늘         [동물전환] │
├─────────────────────────────────────────────┤
│ 💊 오늘의 투약                              │
│  ┌───────────────────────────────────────┐  │
│  │ ☐ 관절약 (1정) — 09:00               │  │
│  │ ☑ 심장약 (0.5정) — 09:00  ✅ 완료     │  │
│  │ ☐ 관절약 (1정) — 21:00               │  │
│  └───────────────────────────────────────┘  │
│                                             │
│ 📊 최근 컨디션 (7일)                         │
│  ┌───────────────────────────────────────┐  │
│  │  5 ┤ ···*···                          │  │
│  │  4 ┤ *·····*··*                       │  │
│  │  3 ┤ ·········*···                    │  │
│  │  2 ┤                                  │  │
│  │  1 ┤                                  │  │
│  │    └─┬──┬──┬──┬──┬──┬──              │  │
│  │     월 화 수 목 금 토 일               │  │
│  └───────────────────────────────────────┘  │
│                                             │
│ 📋 다가오는 일정                             │
│  • 3/25 정기검진 — OO동물병원               │
│  • 4/01 예방접종 — OO동물병원               │
│                                             │
│ [+ 컨디션 기록하기]                          │
└─────────────────────────────────────────────┘
```

#### 컨디션 일지 입력 (모달/시트)

```
┌─────────────────────────────────────────────┐
│  오늘의 컨디션 기록 (2026-03-20)            │
├─────────────────────────────────────────────┤
│                                             │
│  식욕    😫 ──●──────── 😊    4/5          │
│  활동량  😫 ────●────── 😊    3/5          │
│  통증    😣 ──────●──── 😌    3/5          │
│  기분    😢 ────────●── 😊    4/5          │
│                                             │
│  체중: [  5.2  ] kg                         │
│                                             │
│  증상 태그: [구토] [설사] [+ 추가]           │
│                                             │
│  메모: [                              ]     │
│                                             │
│         [취소]              [저장]            │
└─────────────────────────────────────────────┘
```

#### 투약 스케줄 관리

```
┌─────────────────────────────────────────────┐
│  💊 {반려동물 이름}의 투약 관리    [+ 추가]   │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─ 활성 투약 ──────────────────────────┐  │
│  │ 관절약 (코세퀸)                       │  │
│  │ 1정 · 하루 2회 · 09:00, 21:00       │  │
│  │ 2026-01-15 ~ 지속                    │  │
│  │                          [수정] [중단]│  │
│  ├───────────────────────────────────────┤  │
│  │ 심장약 (피모벤단)                     │  │
│  │ 0.5정 · 하루 2회 · 09:00, 21:00     │  │
│  │ 2026-02-01 ~ 지속                    │  │
│  │                          [수정] [중단]│  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌─ 종료된 투약 ────────────────────────┐  │
│  │ 항생제 (아목시실린) — 2026-01~02      │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### 5.3 User Flow

```
[회원가입/로그인]
    │
    ▼
[반려동물 등록] ← 최초 1회 (질병/상태 태그 포함)
    │
    ▼
[대시보드] ── 매일 반복 ──┐
    │                      │
    ├→ [컨디션 기록하기]    │ (1분 내 완료)
    ├→ [투약 체크]          │
    ├→ [건강기록 추가]      │ (진료 후)
    │                      │
    ├→ [커뮤니티] → 질병별 게시판 → 글쓰기/댓글
    │
    └→ [입양/임시보호] → 공고 탐색/등록
```

### 5.4 Component List

| Component | Location | Responsibility |
|-----------|----------|----------------|
| `PetSelector` | components/features/ | 반려동물 전환 드롭다운 |
| `MedicationCard` | components/features/ | 투약 항목 카드 (체크 가능) |
| `MedicationForm` | components/features/ | 투약 등록/수정 폼 |
| `ConditionSlider` | components/features/ | 컨디션 슬라이더 (1~5) |
| `ConditionChart` | components/features/ | 7일 컨디션 추이 차트 |
| `ConditionLogForm` | components/features/ | 일일 컨디션 기록 폼 |
| `HealthRecordCard` | components/features/ | 건강기록 카드 |
| `HealthRecordForm` | components/features/ | 건강기록 등록/수정 폼 |
| `UpcomingSchedule` | components/features/ | 다가오는 일정 리스트 |
| `PostCard` | components/features/ | 게시글 카드 |
| `PostForm` | components/features/ | 게시글 작성 폼 |
| `CommentList` | components/features/ | 댓글 목록 |
| `AdoptionCard` | components/features/ | 입양/임시보호 공고 카드 |
| `AdoptionForm` | components/features/ | 공고 등록 폼 |
| `SymptomTagInput` | components/ui/ | 증상 태그 입력 컴포넌트 |
| `ConditionBadge` | components/ui/ | 질병/상태 뱃지 |
| `Button` | components/ui/ | 공통 버튼 |
| `Input` | components/ui/ | 공통 입력 필드 |
| `Card` | components/ui/ | 공통 카드 컨테이너 |
| `Modal` | components/ui/ | 모달/바텀시트 |
| `EmptyState` | components/ui/ | 빈 상태 안내 |
| `LoadingSpinner` | components/ui/ | 로딩 상태 |

---

## 6. Error Handling

### 6.1 Error Strategy

| Code | Cause | Handling |
|------|-------|----------|
| 400 | 입력 유효성 검사 실패 | 폼 필드 인라인 에러 메시지 |
| 401 | 토큰 만료 | 자동 refresh → 실패 시 로그인 리다이렉트 |
| 403 | 권한 없음 (타인 데이터) | "접근 권한이 없습니다" 토스트 |
| 404 | 리소스 없음 | 404 페이지 또는 빈 상태 표시 |
| 500 | 서버 에러 | "잠시 후 다시 시도해주세요" 토스트 |

### 6.2 Client-Side Validation

```typescript
// react-hook-form + 인라인 유효성 검사 패턴
const petFormRules = {
  name: { required: '이름을 입력해주세요' },
  species: { required: '종을 선택해주세요' },
  birthDate: { required: '생년월일을 입력해주세요' },
  weight: { required: '체중을 입력해주세요', min: { value: 0.1, message: '올바른 체중을 입력해주세요' } },
};
```

---

## 7. Security Considerations

- [x] bkend.ai JWT 기반 인증 (Access 1h, Refresh 7d)
- [x] 자동 토큰 갱신 (401 → refresh → retry)
- [ ] XSS 방어: React 자동 이스케이프 + DOMPurify (게시글 content)
- [ ] 이미지 업로드 시 파일 타입/크기 검증 (client-side)
- [ ] API 요청 시 자기 데이터만 접근 (bkend.ai RLS 정책)
- [ ] HTTPS 강제 (Vercel 기본 제공)

---

## 8. Test Plan

### 8.1 Test Scope

| Type | Target | Tool |
|------|--------|------|
| Manual Testing | 주요 사용자 플로우 | 브라우저 직접 테스트 |
| Zero Script QA | API 동작 검증 | bkend.ai 로그 모니터링 |

### 8.2 Test Cases (Key)

**건강관리 (핵심)**
- [ ] 반려동물 등록 → 질병 태그 추가 → 프로필 확인
- [ ] 투약 스케줄 등록 → 대시보드에서 오늘 투약 표시 → 체크
- [ ] 컨디션 일지 기록 → 7일 차트 반영 확인
- [ ] 건강기록 등록 → 다음 진료일 대시보드 표시

**커뮤니티**
- [ ] 질병별 카테고리 게시글 작성 → 목록 필터링
- [ ] 댓글 작성/삭제 → commentCount 반영

**입양/임시보호**
- [ ] 공고 등록 (의료이력 포함) → 목록 표시
- [ ] 상태 변경 (available → pending → completed)

---

## 9. Clean Architecture

### 9.1 Layer Structure

| Layer | Responsibility | Location |
|-------|---------------|----------|
| **Presentation** | Pages, UI 컴포넌트, 이벤트 핸들링 | `src/app/`, `src/components/` |
| **Application** | Custom Hooks (비즈니스 로직 조합) | `src/hooks/` |
| **Domain** | 타입 정의, 순수 로직 | `src/types/` |
| **Infrastructure** | API 클라이언트, 상태 관리 | `src/lib/`, `src/stores/` |

### 9.2 This Feature's Layer Assignment

| Component | Layer | Location |
|-----------|-------|----------|
| Dashboard Page | Presentation | `src/app/(main)/dashboard/page.tsx` |
| PetSelector, MedicationCard | Presentation | `src/components/features/` |
| usePets, useMedications, useConditionLogs | Application | `src/hooks/` |
| Pet, Medication, ConditionLog types | Domain | `src/types/index.ts` |
| bkend API client | Infrastructure | `src/lib/bkend.ts` |
| auth-store, pet-store | Infrastructure | `src/stores/` |

---

## 10. Coding Convention Reference

### 10.1 Naming Conventions

| Target | Rule | Example |
|--------|------|---------|
| Components | PascalCase | `MedicationCard`, `ConditionChart` |
| Custom Hooks | camelCase, use 접두사 | `usePets()`, `useMedications()` |
| Store files | kebab-case | `auth-store.ts`, `pet-store.ts` |
| Type files | kebab-case | `index.ts` (단일 파일) |
| API 함수 | camelCase | `bkend.data.list()` |
| 상수 | UPPER_SNAKE_CASE | `CONDITION_LABELS`, `CATEGORY_MAP` |

### 10.2 Import Order

```typescript
// 1. React/Next.js
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. 외부 라이브러리
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

// 3. 내부 모듈
import { bkend } from '@/lib/bkend';
import { Button } from '@/components/ui/button';

// 4. 타입
import type { Pet, Medication } from '@/types';
```

### 10.3 This Feature's Conventions

| Item | Convention Applied |
|------|-------------------|
| Component naming | 기능명+역할 PascalCase (e.g., `MedicationCard`) |
| File organization | `components/features/` 하위 기능별 배치 |
| State management | Zustand (인증), TanStack Query (서버 상태) |
| Error handling | react-hook-form 유효성 + toast 알림 |
| Data fetching | TanStack Query `useQuery` / `useMutation` |

---

## 11. Implementation Guide

### 11.1 File Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (main)/
│   │   ├── dashboard/page.tsx          # 메인 대시보드
│   │   ├── pets/
│   │   │   ├── page.tsx                # 반려동물 목록
│   │   │   ├── [id]/page.tsx           # 반려동물 상세
│   │   │   └── new/page.tsx            # 반려동물 등록
│   │   ├── pets/[id]/medications/page.tsx  # 투약 관리
│   │   ├── pets/[id]/health/page.tsx       # 건강기록
│   │   ├── pets/[id]/condition/page.tsx    # 컨디션 일지
│   │   ├── community/
│   │   │   ├── page.tsx                # 게시판 목록
│   │   │   ├── [id]/page.tsx           # 게시글 상세
│   │   │   └── new/page.tsx            # 게시글 작성
│   │   ├── adoption/
│   │   │   ├── page.tsx                # 공고 목록
│   │   │   ├── [id]/page.tsx           # 공고 상세
│   │   │   └── new/page.tsx            # 공고 등록
│   │   └── settings/page.tsx           # 설정/마이페이지
│   ├── layout.tsx
│   ├── page.tsx                        # 랜딩/리다이렉트
│   └── globals.css
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── modal.tsx
│   │   ├── symptom-tag-input.tsx
│   │   ├── condition-badge.tsx
│   │   ├── empty-state.tsx
│   │   └── loading-spinner.tsx
│   └── features/
│       ├── pet-selector.tsx
│       ├── medication-card.tsx
│       ├── medication-form.tsx
│       ├── condition-slider.tsx
│       ├── condition-chart.tsx
│       ├── condition-log-form.tsx
│       ├── health-record-card.tsx
│       ├── health-record-form.tsx
│       ├── upcoming-schedule.tsx
│       ├── post-card.tsx
│       ├── post-form.tsx
│       ├── comment-list.tsx
│       ├── adoption-card.tsx
│       └── adoption-form.tsx
├── hooks/
│   ├── use-auth.ts
│   ├── use-pets.ts
│   ├── use-medications.ts
│   ├── use-health-records.ts
│   ├── use-condition-logs.ts
│   ├── use-posts.ts
│   └── use-adoptions.ts
├── lib/
│   ├── bkend.ts                        # bkend.ai API 클라이언트
│   └── utils.ts                        # 유틸리티 함수
├── stores/
│   └── auth-store.ts                   # 인증 상태 (Zustand)
└── types/
    └── index.ts                        # 모든 타입 정의
```

### 11.2 Implementation Order

| # | Task | Files | FR |
|:-:|------|-------|----|
| 1 | 프로젝트 셋업 (Next.js, Tailwind, 패키지 설치) | package.json, tsconfig.json, tailwind.config | - |
| 2 | UI 기본 컴포넌트 | components/ui/* | - |
| 3 | bkend.ai 연동 + 인증 | lib/bkend.ts, stores/auth-store.ts, hooks/use-auth.ts, (auth)/* | FR-01 |
| 4 | 반려동물 프로필 CRUD | hooks/use-pets.ts, pets/* | FR-02 |
| 5 | 투약 스케줄 관리 | hooks/use-medications.ts, medications/* | FR-04 |
| 6 | 컨디션 일지 | hooks/use-condition-logs.ts, condition/* | FR-05 |
| 7 | 건강기록 CRUD | hooks/use-health-records.ts, health/* | FR-03 |
| 8 | 대시보드 통합 | dashboard/page.tsx, features/* | FR-06 |
| 9 | 커뮤니티 | hooks/use-posts.ts, community/*, comment-list | FR-07~10 |
| 10 | 입양/임시보호 | hooks/use-adoptions.ts, adoption/* | FR-11~13 |
| 11 | 마이페이지 | settings/page.tsx | FR-14 |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-03-20 | Initial design document | aejeong |
