# pet-disease-display Planning Document

> **Summary**: 반려동물 보유 질환을 해시태그(`#심장병 #쿠싱`) 스타일로 한눈에 보이도록 노출 — 펫 프로필이 표시되는 모든 컨텍스트(상세, 커뮤니티 등)에서 재사용
>
> **Project**: HelpPet
> **Version**: 0.1.0
> **Author**: aejeong
> **Date**: 2026-05-13
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 보호자가 (1) 처음 가는 병원에서 펫 상태를 설명하거나 (2) 커뮤니티에서 다른 사람의 펫 프로필을 확인할 때, 현재 작은 빨간 배지로만 표시되는 conditions는 "한눈에 인식"되지 않아 그 자체로 의미 있는 자기소개 정보가 되지 못한다 |
| **Solution** | `#심장병 #쿠싱` 형태의 가벼운 해시태그 텍스트 컴포넌트(`<DiseaseHashtags />`)를 만들어, 특이사항(`specialNotes`)이 표시되는 톤과 결을 맞춤. pet detail 프로필 카드와 (확장 스코프) 커뮤니티 게시글 카드에서 재사용 |
| **Function/UX Effect** | 보호자가 detail 진입 즉시·커뮤니티 둘러보기 중에도 "이 아이가 가진 병"을 자기소개의 일부처럼 자연스럽게 인지. 의료 정보의 진지함을 유지하면서 공유·소통의 톤으로 부드럽게 노출 |
| **Core Value** | helppet 핵심 가치(노견/환견 케어)를 **"내 펫의 정체성"으로 공유 가능한 형태**로 노출하여, 보호자 간 정서적 지지와 정보 교류의 트리거 정보로 작동 |

---

## 1. Overview

### 1.1 Purpose

`pet.conditions` 데이터를 보호자가 **자기소개·프로필 정보의 일부**로 자연스럽게 인지할 수 있도록 시각 표현을 바꾼다. 사용 맥락 2가지:

1. **첫 진료 컨텍스트** — 처음 가는 병원에서 보호자가 상세 페이지를 의사에게 보여줄 때 "이 아이가 가진 병"이 즉각 읽혀야 함
2. **커뮤니티 프로필 컨텍스트** — 노견/환견 커뮤니티에서 다른 보호자의 펫 프로필을 볼 때 어떤 질병을 함께 겪고 있는지 한눈에 파악 → 정서적 연대/정보 교류의 진입점

### 1.2 Background

- `Pet.conditions: string[]` 필드 이미 존재 (예: `'관절염'`, `'심장병'`, `'쿠싱'`, `'신장질환'`)
- pet detail (`src/app/(main)/pets/[id]/page.tsx:48-54`)에서 `ConditionBadge`로 이미 표시 중 — 그러나 시각 무게가 작아 인식 어려움
- 사용자가 명시한 레퍼런스: 특이사항이 `<p className="text-sm text-gray-500 ... bg-warm-100 rounded-lg p-2">`로 표시되는 결 (`page.tsx:55-57`) → 그 부드러운 톤을 conditions에도 적용하길 원함
- 커뮤니티(`src/app/(main)/community/*`)의 `post-card.tsx`에는 **현재 작성자 펫 정보가 노출되지 않음** → 본 Plan에서 작성자 펫의 질환 해시태그 노출을 함께 도입(확장 스코프)

### 1.3 Related Documents

- 선행 Plan: `docs/01-plan/features/pet-edit.plan.md` (conditions 편집 UI 도입)
- 데이터 모델: `src/types/index.ts:25-37` (Pet interface)
- 현재 표시 위치: `src/app/(main)/pets/[id]/page.tsx:48-54`
- 레퍼런스(시각 결): `src/app/(main)/pets/[id]/page.tsx:55-57` (specialNotes 박스)
- 기존 빨간 배지 컴포넌트: `src/components/ui/condition-badge.tsx` (편집/태그입력에 계속 사용)

---

## 2. Scope

### 2.1 In Scope

| # | Feature | Priority | Description |
|---|---------|----------|-------------|
| 1 | `DiseaseHashtags` 컴포넌트 | Must | `src/components/ui/disease-hashtags.tsx` — `tags: string[]` props만 받는 presentational atom. `#태그` 형태 텍스트 렌더. 빈 배열 처리 옵션 |
| 2 | pet detail에서 해시태그로 교체 | Must | `pets/[id]/page.tsx`의 프로필 카드 내 conditions 표시를 `ConditionBadge` → `DiseaseHashtags`로 교체 |
| 3 | 시각 톤: 특이사항과 결 맞춤 | Must | `text-sm text-gray-600`(또는 `text-rose-600` 가벼운 색조) + 항목 간 공백 — 빨간 강한 배지가 아닌 가벼운 텍스트 |
| 4 | 빈 상태 처리 | Should | conditions 비어있을 때 detail에서는 미표시(또는 placeholder). 호출부에서 결정 |
| 5 | 커뮤니티 `post-card`에 작성자 펫 질환 노출 | Should | post에 작성자 펫 정보가 있다면 카드 하단에 `DiseaseHashtags`로 표시 (Post 타입에 펫 필드 없으면 후속 feature로 분리) |
| 6 | pets 목록(`pets/page.tsx`)에서도 해시태그로 교체 | Could | 일관성 유지: 펫 카드 목록에서도 동일 컴포넌트 사용 |
| 7 | 접근성: `aria-label="보유 질환 태그"` | Should | 스크린리더 친화 |

### 2.2 Out of Scope

- **데이터 모델 확장**: `Disease` 객체화(진단일/처방/심각도)는 후속 feature `pet-disease-model`
- **해시태그 클릭 → 검색/필터**: 후속 feature `pet-disease-search` (예: `#심장병` 클릭 시 같은 질환 보호자 커뮤니티 검색)
- **자동 해시태그 추천/표준화**: 후속 feature (현재는 사용자 자유 입력 유지)
- **`Post` 타입에 펫 정보 필드 추가/스키마 변경**: 본 Plan은 기존 필드만 사용. 작성자 펫 정보가 없으면 FR-05는 보류
- **`ConditionBadge` 제거**: pet-edit의 `SymptomTagInput`에서는 계속 사용 (편집 UX는 배지가 적합)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | `DiseaseHashtags` 컴포넌트 신규 작성 (props: `tags: string[]`, `className?: string`, `emptyState?: 'hidden' \| 'placeholder'`) | High | Pending |
| FR-02 | pet detail 페이지 프로필 카드에서 conditions를 `DiseaseHashtags`로 렌더 | High | Pending |
| FR-03 | 해시태그 텍스트: `#` + tag 문자열, 공백/특수문자는 trim 처리 | High | Pending |
| FR-04 | 시각 톤: `text-sm` 기본, 색상은 부드러운 rose/gray 계열, 배지 박스 아님 | High | Pending |
| FR-05 | 커뮤니티 `post-card`에 작성자 펫 질환 해시태그 노출 (Post에 펫 필드 존재 시) | Medium | Pending |
| FR-06 | pets 목록 카드에서도 동일 컴포넌트로 통일 | Low | Pending |
| FR-07 | 빈 conditions에 대해 `emptyState='hidden'`은 null 렌더, `'placeholder'`는 회색 안내 | Medium | Pending |
| FR-08 | `aria-label="보유 질환"` 또는 `role="list"` 시맨틱 부여 | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | 추가 fetch 없음, presentational only | DevTools |
| Accessibility | 시맨틱 마크업, 스크린리더 노출 | axe DevTools |
| 모바일 우선 | `max-w-md` 컨테이너 내 줄바꿈 안정적 | 360px viewport |
| 재사용성 | Pet 도메인 결합 없음 — `tags: string[]`만 의존 | 코드 리뷰 |
| 디자인 일관성 | 특이사항(`bg-warm-100`) 박스와 시각 위계 자연스러움 | UI 리뷰 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] `DiseaseHashtags` 컴포넌트 구현 및 export
- [ ] pet detail 페이지에 해시태그로 교체 적용
- [ ] 빈 배열 / 1개 / 다수(5+) 케이스 정상 렌더
- [ ] 한국어 텍스트(`#심장병`, `#쿠싱`) 정상 표기 (공백 포함 시 underscore 또는 그대로)
- [ ] `tsc` / `eslint` pass
- [ ] design.md 작성 → gap-detector matchRate ≥ 90%

### 4.2 Quality Criteria

- [ ] Pet 도메인을 모르는 atom 수준의 presentational 컴포넌트
- [ ] `ConditionBadge`는 편집 컨텍스트에서 그대로 보존
- [ ] 신규 컬러 토큰 추가 없이 Tailwind 기본 팔레트 또는 helppet warm 토큰만 사용

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| 해시태그 표기 vs 빨간 배지가 의료적 심각성을 약화시켜 보일 수 있음 | Medium | Medium | "한눈에 인식"이 사용자 요청의 핵심이므로 톤 변경 의도적. 단, 위급 컨텍스트(향후 알림 등)에서는 별도 강조 사용 |
| `#태그`에 공백/한자/특수문자 섞이면 시각 깨짐 | Medium | Medium | 컴포넌트 내부에서 trim/공백 → `_` 또는 그대로 표시 결정 (Design 단계에서 확정) |
| 커뮤니티 노출(FR-05)이 `Post` 모델 변경을 유발 | High | Medium | `Post`에 작성자 펫 정보가 없으면 본 Plan에서 보류 → 별도 feature `community-pet-profile`로 분리 명시 |
| 기존 빨간 ConditionBadge 사용처(pet-edit 등)와 시각 톤 분기 → 보호자에게 일관성 혼란 | Medium | Low | 표시(read) = 해시태그, 편집(write) = 배지로 의도적 구분이라는 디자인 가이드 명시 |
| `string[]`의 한계로 추후 메타데이터 요구 시 재작업 | Medium | High | Out of Scope 명시 + 후속 feature `pet-disease-model` 트래킹 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | 단순 구조 | 정적 사이트 | ☐ |
| **Dynamic** | feature 모듈, BaaS | 웹앱 + 백엔드 | ✅ |
| **Enterprise** | 엄격한 레이어 분리 | 고트래픽/복잡 | ☐ |

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| 컴포넌트 위치 | `ui/` (atom) / `features/` (도메인) | **`src/components/ui/disease-hashtags.tsx`** | Pet 도메인을 모르는 presentational atom — 향후 사용자/공유 페이지 어디서든 재사용 가능 |
| Props 설계 | `pet: Pet` / `conditions: string[]` / `tags: string[]` | **`tags: string[]`** | 가장 일반화된 형태. 호출부에서 `pet.conditions` 매핑 |
| 빈 상태 동작 | 항상 표시 / 항상 숨김 / props로 선택 | **`emptyState?: 'hidden' \| 'placeholder'`** | 호출 위치별로 결정(detail = placeholder, 커뮤니티 = hidden 등) |
| 시각 스타일 | rose-50 박스 / 단순 텍스트 / warm-100 박스 | **단순 텍스트 `text-sm text-rose-700`** (Design에서 최종 확정) | "한눈에" 핵심이 텍스트 시각 무게이지 박스가 아님 |
| Pet detail 기존 배지 제거 여부 | 즉시 제거 / 병행 / 단계적 | **즉시 교체** (양쪽 다는 정보 중복) | 사용자 요청이 명시적으로 "이런 식으로 보여줬으면" |

### 6.3 Clean Architecture Approach

```
Selected Level: Dynamic

영향 받는 파일:
src/
  components/
    ui/
      disease-hashtags.tsx              ← 신규 (이번 Plan)
      condition-badge.tsx               ← 유지 (편집용)
    features/
      post-card.tsx                     ← 수정 (FR-05, Post 모델 허용 시)
  app/(main)/
    pets/[id]/page.tsx                  ← 수정 (FR-02)
    pets/page.tsx                       ← 수정 (FR-06, Could)
    community/[id]/page.tsx             ← 수정 (FR-05, 가능 시)
  types/index.ts                        ← 변경 없음 (Post 모델 변경 시 별도 feature)
```

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [x] CLAUDE.md (한국어 UI / 영문 코드 / kebab-case / PascalCase)
- [x] tsconfig / eslint / prettier
- [x] Tailwind warm 팔레트 (`bg-warm-100`) 사용 중

### 7.2 Conventions to Define/Verify

| Category | Current State | To Define | Priority |
|----------|---------------|-----------|:--------:|
| Naming | exists | `disease-hashtags.tsx` (kebab-case file, `DiseaseHashtags` PascalCase) | High |
| Folder | exists | `src/components/ui/` 하위 atom | High |
| 해시태그 텍스트 가공 규칙 | none | 공백/특수문자 처리 방침 (Design에서 확정) | High |

### 7.3 Environment Variables Needed

변경 없음.

### 7.4 Pipeline Integration

N/A (단일 UI atom + 사용처 교체).

---

## 8. Next Steps

1. [ ] `/pdca design pet-disease-display` — Design 문서: 컴포넌트 props 인터페이스, 텍스트 가공 규칙, 시각 시안
2. [ ] `/pdca do pet-disease-display` — 구현 (예상 0.5일 — 컴포넌트 + 호출부 교체)
3. [ ] `/pdca analyze pet-disease-display` — gap-detector
4. [ ] (필요 시) `/pdca iterate pet-disease-display`
5. [ ] `/pdca report pet-disease-display` — 완료 보고서
6. [ ] (후속) `community-pet-profile`, `pet-disease-model` feature 트래킹

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-05-13 | Initial draft (별도 섹션 카드 방향) | aejeong |
| 0.2 | 2026-05-13 | 사용자 피드백 반영 — 해시태그 텍스트 스타일 + 커뮤니티 프로필 확장 컨텍스트 추가 | aejeong |
