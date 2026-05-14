# pet-disease-display Design Document

> **Summary**: `pet.conditions`를 `#심장병 #쿠싱` 해시태그 텍스트로 표시하는 atom 컴포넌트(`DiseaseHashtags`) 설계 및 4개 호출부 교체 설계
>
> **Project**: HelpPet
> **Version**: 0.1.0
> **Author**: aejeong
> **Date**: 2026-05-14
> **Status**: Draft
> **Plan Reference**: `docs/01-plan/features/pet-disease-display.plan.md`

---

## 1. Architecture

### 1.1 Read/Write 컴포넌트 분리 원칙

```
Pet conditions 표시 컨텍스트
├── 표시(read) → <DiseaseHashtags />   ← 신규 (이 Design)
│   ├── pet detail        (#심장병 #쿠싱 가벼운 톤)
│   ├── pets 목록 카드
│   └── adoption 상세
└── 편집(write) → <ConditionBadge />    ← 유지 (변경 없음)
    └── SymptomTagInput (편집 입력 UX)
```

원칙: **표시는 자기소개 톤(해시태그), 편집은 강조 톤(빨간 배지).** 같은 데이터를 컨텍스트 무게에 따라 다르게 노출.

### 1.2 Component Tree

```
DiseaseHashtags (presentational atom)
├── props: tags, className?, emptyState?
├── 내부 처리
│   ├── formatTag(raw) → "#태그" 변환 + 공백/특수문자 정제
│   └── 빈 배열 → emptyState 분기
└── 렌더
    ├── <ul role="list" aria-label="보유 질환">
    │   └── <li>#태그</li> × N
    └── (빈 상태) placeholder 텍스트 or null
```

---

## 2. Plan 미결정 항목 확정

Plan §3 / §6.2에서 "Design에서 확정" 표시된 항목을 다음과 같이 결정한다.

### 2.1 텍스트 가공 규칙 (Plan FR-03 확정)

| 입력 | 출력 | 규칙 |
|------|------|------|
| `"심장병"` | `#심장병` | 그대로 prepend `#` |
| `"  쿠싱  "` | `#쿠싱` | 앞뒤 trim |
| `"신장 질환"` | `#신장_질환` | 중간 공백 → `_` 치환 (해시태그 가독성) |
| `"#관절염"` | `#관절염` | 이미 `#` 시작 → 중복 prepend 안 함 |
| `""` 또는 `null` | (skip) | 빈 토큰 무시 |
| `"심장병/판막"` | `#심장병_판막` | `/`, `,`, `&` 등 구분자 → `_` 치환 |

**결정 근거**: 한국어 질환명은 대부분 공백 없는 단일 단어(`심장병`, `쿠싱`). 공백이 들어가는 경우만 예외 처리하면 충분하며, `_` 치환이 트위터/인스타 한글 해시태그 관례와 일치.

### 2.2 색상 톤 확정 (Plan FR-04 확정)

```css
/* DiseaseHashtags 기본 클래스 */
text-sm text-rose-700/90
```

| 후보 | 톤 | 선택 |
|------|----|----|
| `text-gray-600` | 너무 약함, "한눈에" 의도 약화 | ❌ |
| `text-rose-700` | 의료 톤 유지 + 부드러움 | ✅ |
| `text-warm-700` | helppet 브랜드 통일성 | △ (rose보다 약함) |
| `text-red-600` | 기존 배지와 동일 → 시각 분기 효과 없음 | ❌ |

**결정 근거**: 사용자가 명시한 레퍼런스(`specialNotes` 박스의 `text-gray-500`)는 "결을 맞추자"는 의도이지 동일 색상 의무는 아님. 의료 정보 정체성을 유지하되 박스 제거와 채도 낮춤(`/90`)으로 무게를 줄임.

### 2.3 빈 상태 처리 (Plan FR-07 확정)

```typescript
type EmptyState = 'hidden' | 'placeholder';

// 호출부별 권장값
{
  petDetail:      'placeholder',  // "등록된 질환이 없습니다"
  petList:        'hidden',       // 카드 공간 절약
  adoptionDetail: 'placeholder',  // 입양 의사결정 정보
  communityPost:  'hidden',       // 카드 노이즈 방지
}

// 기본값: 'hidden' (안전한 디폴트)
```

**placeholder 텍스트**: `등록된 질환이 없습니다` (회색 톤 `text-xs text-gray-400`)

### 2.4 Post 타입 확장 (Plan FR-05 결정)

**결론**: 본 Design에서 **보류**. 별도 feature `community-pet-profile`로 분리.

**근거**: 현재 `Post` 타입(`src/types/index.ts`)에 작성자 펫 정보 필드가 없으며, 이를 추가하려면 ① 데이터 모델 변경 ② bkend 스키마 변경 ③ 작성 시 펫 선택 UX 추가가 동반됨 → 본 feature(UI atom)의 스코프를 초과.

---

## 3. File Changes

### 3.1 신규 파일

| File | 역할 |
|------|------|
| `src/components/ui/disease-hashtags.tsx` | 핵심 atom 컴포넌트 |

### 3.2 수정 파일

| File | 변경 내용 | Priority |
|------|----------|:--------:|
| `src/app/(main)/pets/[id]/page.tsx` | conditions 표시: `ConditionBadge` → `DiseaseHashtags` (line 48-54) | Must |
| `src/app/(main)/pets/page.tsx` | 펫 목록 카드 conditions 표시 교체 (line 61) | Should |
| `src/app/(main)/adoption/[id]/page.tsx` | 입양 상세 conditions 표시 교체 (line 75) — **Plan에서 누락, Design에서 보강** | Should |

### 3.3 변경 없음 (의도적)

| File | 사유 |
|------|------|
| `src/components/ui/condition-badge.tsx` | 편집 컨텍스트에서 계속 사용 |
| `src/components/ui/symptom-tag-input.tsx` | `removable` 모드의 ConditionBadge 그대로 사용 |
| `src/types/index.ts` | Pet/Post 타입 변경 없음 |

---

## 4. Detailed Design

### 4.1 `DiseaseHashtags` 컴포넌트

**Props 인터페이스**:

```typescript
export interface DiseaseHashtagsProps {
  tags: string[];
  className?: string;
  emptyState?: 'hidden' | 'placeholder';
  emptyPlaceholder?: string;
}
```

**구현 의사코드**:

```typescript
import { cn } from '@/lib/utils';

const SEPARATORS = /[\s/,&]+/g;

function formatTag(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const stripped = trimmed.replace(/^#+/, '');
  const normalized = stripped.replace(SEPARATORS, '_');
  return `#${normalized}`;
}

export function DiseaseHashtags({
  tags,
  className,
  emptyState = 'hidden',
  emptyPlaceholder = '등록된 질환이 없습니다',
}: DiseaseHashtagsProps) {
  const formatted = tags.map(formatTag).filter((t): t is string => t !== null);

  if (formatted.length === 0) {
    if (emptyState === 'hidden') return null;
    return (
      <p className={cn('text-xs text-gray-400', className)}>{emptyPlaceholder}</p>
    );
  }

  return (
    <ul
      role="list"
      aria-label="보유 질환"
      className={cn('flex flex-wrap gap-x-1.5 gap-y-0.5 text-sm text-rose-700/90', className)}
    >
      {formatted.map((tag) => (
        <li key={tag}>{tag}</li>
      ))}
    </ul>
  );
}
```

### 4.2 pet detail (`pets/[id]/page.tsx`) 교체

**Before** (line 48-54):
```tsx
{pet.conditions.length > 0 && (
  <div className="flex flex-wrap justify-center gap-1.5 mt-3">
    {pet.conditions.map((c) => (
      <ConditionBadge key={c} condition={c} size="md" />
    ))}
  </div>
)}
```

**After**:
```tsx
<DiseaseHashtags
  tags={pet.conditions}
  emptyState="placeholder"
  className="justify-center mt-3"
/>
```

**Import 변경**:
- `pets/[id]/page.tsx`: `ConditionBadge` import 제거 (해당 파일에서 더 이상 사용 안 함)
- `DiseaseHashtags` import 추가

### 4.3 pets 목록 (`pets/page.tsx`) 교체

**Before** (line 58-65 추정):
```tsx
{pet.conditions.length > 0 && (
  <div className="flex flex-wrap gap-1">
    {pet.conditions.map((cond) => (
      <ConditionBadge key={cond} condition={cond} />
    ))}
  </div>
)}
```

**After**:
```tsx
<DiseaseHashtags tags={pet.conditions} emptyState="hidden" />
```

### 4.4 adoption 상세 (`adoption/[id]/page.tsx`) 교체

**Before** (line 73-77 추정):
```tsx
<div className="flex flex-wrap gap-1.5">
  {pet.conditions.map((c) => (
    <ConditionBadge key={c} condition={c} size="md" />
  ))}
</div>
```

**After**:
```tsx
<DiseaseHashtags tags={pet.conditions} emptyState="placeholder" />
```

---

## 5. Visual Spec

### 5.1 시각 시안 (텍스트 모형)

**pet detail 프로필 카드 (변경 후)**:
```
┌────────────────────────────────────┐
│         [프로필 이미지]              │
│           몽이                       │
│         🧓 노견                      │
│   푸들 · 12세 · 4.2kg               │
│                                    │
│   #심장병  #쿠싱  #관절염            │  ← rose-700/90, text-sm
│                                    │
│  ┌──────────────────────────────┐  │
│  │ 식사량 줄어들면 즉시 병원      │  │  ← specialNotes (warm-100)
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

**Before/After 시각 비교**:
- Before: `[심장병][쿠싱][관절염]` — 빨간 배지, 강한 무게, 의료 경고 톤
- After: `#심장병 #쿠싱 #관절염` — 가벼운 텍스트, 자기소개 톤, 공유 친화

### 5.2 색상 토큰

| 용도 | 클래스 | 헥스 (참고) |
|------|--------|-------------|
| 해시태그 텍스트 | `text-rose-700/90` | `#be123c` @ 90% alpha |
| 빈 상태 placeholder | `text-gray-400` | `#9ca3af` |

### 5.3 spacing

- `gap-x-1.5 gap-y-0.5` — 가로 6px, 세로 2px → 한 줄에 다수 태그, 줄바꿈 시 자연스러움
- 호출부에서 `mt-3`/`mb-3` 등 외부 간격 책임 (atom은 자체 margin 없음)

---

## 6. Type & Interface Contract

### 6.1 외부 의존성

```typescript
// 의존 (변경 없음)
import type { Pet } from '@/types';  // Pet.conditions: string[]
import { cn } from '@/lib/utils';     // 기존 className 유틸
```

### 6.2 컴포넌트가 모르는 것 (= 결합 차단)

- `Pet` 타입을 import하지 않음 → 향후 `User`, `AdoptionPost` 등 어떤 도메인에서도 재사용
- `useQuery`, `useState` 사용 안 함 → 순수 presentational
- 다국어 처리(추후 i18n) 책임 없음 → placeholder는 props로 주입 가능

---

## 7. Edge Cases & Behaviors

| 케이스 | 입력 예 | 기대 동작 |
|--------|---------|-----------|
| 빈 배열 (`emptyState='hidden'`) | `[]` | `null` 렌더 |
| 빈 배열 (`emptyState='placeholder'`) | `[]` | `등록된 질환이 없습니다` |
| 단일 태그 | `['심장병']` | `#심장병` |
| 중복 태그 | `['심장병', '심장병']` | 두 개 모두 렌더 (호출부 책임). React key 충돌 가능성 → index 보강 검토 |
| 공백만 있는 토큰 | `['심장병', '   ', '쿠싱']` | `#심장병 #쿠싱` (공백 토큰 skip) |
| 한자/영문 혼합 | `['Cushing\'s']` | `#Cushing's` (apostrophe 유지) |
| 매우 긴 태그 (20자+) | `['만성신부전증후군3단계']` | 그대로 렌더, 모바일 360px에서 줄바꿈 |
| 5개 이상 다수 | `['a','b','c','d','e','f']` | `flex-wrap`으로 자연 줄바꿈 |

### 7.1 React key 정책

중복 태그 가능성에 대비:
```tsx
{formatted.map((tag, idx) => (
  <li key={`${tag}-${idx}`}>{tag}</li>
))}
```

근거: `conditions` 배열은 사용자 입력이라 중복 검증되지 않을 수 있음. `tag` 단독 key는 중복 시 React warning.

---

## 8. Implementation Order (Do phase 가이드)

| # | Step | 예상 시간 | 검증 |
|---|------|----------|------|
| 1 | `src/components/ui/disease-hashtags.tsx` 컴포넌트 작성 | 15분 | `tsc` pass |
| 2 | `pets/[id]/page.tsx` 교체 + import 정리 | 5분 | 페이지 visual 확인 |
| 3 | `pets/page.tsx` 교체 (목록) | 5분 | 목록 카드 확인 |
| 4 | `adoption/[id]/page.tsx` 교체 | 5분 | 입양 상세 확인 |
| 5 | 빈 conditions / 중복 / 다수(5+) 케이스 수동 검증 | 10분 | 360px viewport |
| 6 | `tsc` / `eslint` 통과 확인 | 5분 | `npm run lint`, `npx tsc --noEmit` |

총 예상: **45분** (Plan의 0.5일 추정과 일치)

---

## 9. Test Strategy (Zero Script QA)

본 feature는 presentational atom + 4개 호출부 교체로, 자동 테스트보다 **수동 시각 검증**이 효율적.

### 9.1 검증 체크리스트

- [ ] pet detail: 3개 conditions 가진 펫 → `#A #B #C` 한 줄 노출
- [ ] pet detail: conditions 없는 펫 → "등록된 질환이 없습니다" 회색 노출
- [ ] pets 목록: conditions 없는 펫 카드 → 해당 영역 미노출 (공간 차지 X)
- [ ] adoption 상세: conditions 표시 정상
- [ ] 360px viewport: 5개 이상 태그가 줄바꿈으로 자연스럽게 표시
- [ ] 편집 페이지(`SymptomTagInput`): ConditionBadge 빨간 배지 그대로 (변경 안 됨 확인)
- [ ] 다크 모드(있다면): rose-700/90 가독성

### 9.2 회귀 위험

| 위험 | 검증 |
|------|------|
| `ConditionBadge` import 누락된 채 남아있어 빌드 오류 | `tsc --noEmit` |
| 다른 페이지에서 같은 영역의 layout 깨짐 | pets/page, adoption/[id] 둘 다 360px 확인 |

---

## 10. Open Questions

(없음 — Plan의 4가지 미결정 항목 모두 §2에서 확정)

추후 feature로 분리된 항목:
- `community-pet-profile`: Post에 작성자 펫 정보 노출 (FR-05 분리)
- `pet-disease-search`: 해시태그 클릭 → 같은 질환 보호자 검색
- `pet-disease-model`: conditions를 `Disease` 객체화 (진단일/처방/심각도)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-05-14 | Initial draft from Plan v0.2. 4개 미결정 항목 확정, adoption 페이지 사용처 보강 | aejeong |
