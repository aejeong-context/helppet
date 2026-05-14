# medication-status-clarity Design Document

> **Summary**: `today-medication.tsx`의 timeSlot 버튼 3가지 상태를 시각 무게로 차별화. 체크=진한 초록+흰 글씨, 알람=amber+pulse, 미래=약화. mock 시드 `medicationLogs`는 빈 배열로 정리
>
> **Project**: HelpPet
> **Version**: 0.1.0
> **Author**: aejeong
> **Date**: 2026-05-14
> **Status**: Draft
> **Plan Reference**: `docs/01-plan/features/medication-status-clarity.plan.md`

---

## 1. Architecture

### 1.1 3-Tier Status Visual Hierarchy

```
시각 무게 (강 → 약)
─────────────────────────────────────────
체크됨 (완료)        ▓▓▓▓▓▓  bg-green-500 + text-white
                        ↑ 가장 강한 긍정 시그널
시간 지남 (알람)     ▒▒▒▒▒▒  bg-amber-100 + text-amber-700 + animate-pulse
                        ↑ 주의 필요, 위급 아님
미래 (예정)          ░░░░░░  bg-gray-50 + text-gray-400
                        ↑ 가장 약한 시각 무게
```

**원칙**: 시각 무게가 곧 사용자 인지 우선순위. "완료/알람"이 즉시 보이고 "미래"는 배경에 가라앉음.

### 1.2 Component Scope (변경 없음)

```
TodayMedication (변경 X — 상태 결정 로직 유지)
└── timeSlot 버튼 (변경 O — className만)
    └── 이모지 아이콘 (변경 O — 크기/명확성 강화)
```

`TodayMedication`의 props/state/이벤트는 변경 없음. **className과 aria-label만** 수정.

---

## 2. Plan 미결정 항목 확정

Plan §6.2의 4개 미결정 항목을 다음과 같이 결정한다.

### 2.1 색상 톤 강화 정도 — **강함** (진한 배경 + 대비 글씨)

| 후보 | 시각 강도 | 의료 명확성 | 선택 |
|------|:---------:|:-----------:|:----:|
| 미미 (border 두께만) | 약 | △ | ❌ |
| 중간 (배경 채도 ↑) | 중 | OK | ❌ |
| **강함 (진한 배경 + 흰 글씨)** | **강** | **✅** | **✅** |

**근거**: 의료 도메인은 "약 먹었는지 vs 안 먹었는지"가 진단 의사결정의 기본. 시각 부담보다 명확성이 우선. 또한 helppet의 다른 상태 배지(`bg-amber-100` 노견, `bg-red-50` ConditionBadge)는 이미 "옅은 톤"이라 medication 체크가 진하면 그 자체로 "행동 결과"를 강조하는 차별화 효과.

### 2.2 알람 톤 — **amber + animate-pulse**

```css
/* 시간 지남 (체크 안 됨) */
bg-amber-100 text-amber-800 border-2 border-amber-400 animate-pulse
```

| 후보 | 의미 충돌 | helppet 일관성 | 선택 |
|------|:---------:|:--------------:|:----:|
| 빨강 강조 (`bg-red-200`) | ⚠️ `ConditionBadge`와 충돌 | ❌ | ❌ |
| **amber 톤** | ✅ 충돌 없음 | ✅ 노견 배지와 일관 | **✅** |
| pulse 단독 (색 변경 X) | OK | △ 약함 | ❌ |
| **amber + pulse** | ✅ | ✅ | **✅** (조합) |

**근거**:
- 빨강은 helppet에서 이미 `ConditionBadge`(질병 표시) 의미. 알람을 빨강으로 쓰면 "심각한 의료 상태"와 시각 충돌
- amber는 helppet의 노견 배지(`bg-amber-100 text-amber-700`)에 이미 "주의가 필요한 상태" 의미로 자리잡음 — 알람 톤으로 자연스럽게 연결
- `animate-pulse`는 Tailwind 기본 제공. 적당히 부드러운 깜박임으로 위급함 없이 주의 환기
- `border-2 border-amber-300`으로 시각 무게 추가 — 체크됨과 동등한 인지 우선순위 확보

### 2.3 아이콘 처리 — **이모지 유지 + 크기 강화 + 의미 충돌 회피 매핑**

```typescript
// 현재: gap-1.5 (작은 공백) + 이모지 글자 크기 그대로
// 변경: 아이콘과 텍스트를 명확히 분리 + 아이콘 크기 키움 + 의미 충돌 없는 매핑
```

| 후보 | 의존성 추가 | 일관성 | 선택 |
|------|:-----------:|:------:|:----:|
| 이모지 유지 (그대로) | ❌ 없음 | ✅ 기존 패턴 | △ 크기 부족 |
| **이모지 + 크기 강화** | ❌ 없음 | ✅ | **✅** |
| 인라인 SVG | ❌ 없음 | △ 새 패턴 | ❌ (오버) |
| `lucide-react` 도입 | ⚠️ 패키지 추가 | △ 새 패턴 | ❌ |

**근거**: helppet 전반에 이모지(🐕🐈🧓💊🐾)가 일관되게 사용 중. medication만 SVG로 전환하면 시각 분기. lucide-react 도입은 1개 컴포넌트를 위해 의존성 추가하는 over-engineering. **이모지 크기를 `text-base`로 키우고 별도 `<span>`으로 감싸 정렬 강화**가 합리적.

#### 2.3.1 아이콘 매핑 (Do 단계 사용자 피드백 반영, v0.2)

| 상태 | 이모지 | 의미 |
|------|:-----:|------|
| 체크됨 | `✅` | 체크 마크 — 완료 |
| 시간 지남 (알람) | `⏰` | 자명종 시계 — 주의 환기 |
| 미래 | `☐` (U+2610) | 빈 체크박스 — "할 일" 메타포 |

**미래 아이콘 결정 변경 — `⭕` → `☐` (v0.2)**:
- 초기 코드는 `⭕`(붉은 원) 사용
- Do 단계 dev 검증 중 사용자 피드백: "빨간 동그라미는 아직 안 한 건인데, OK처럼 보여"
- 한국/일본 문화권에서 `⭕`는 "OK/정답/완료" 시그널 — "아직 안 한 상태"와 의미 충돌
- `☐` (BALLOT BOX) 채택: TODO 리스트 체크박스 메타포로 `✅`와 자연스러운 변환 시퀀스 (`☐` → `✅`) 형성

### 2.4 상태 텍스트 노출 — **아이콘 + 시간만 (텍스트 라벨 X), aria-label로 보강**

**시각 표시**: 아이콘 + `HH:MM` 시간 텍스트만 (기존 그대로)
**스크린리더**: `aria-label` 명시로 상태 텍스트 보강

```typescript
aria-label={
  checked ? `${med.name} ${ts} 완료` :
  isPast ? `${med.name} ${ts} 미복용, 시간 지남` :
  `${med.name} ${ts} 예정`
}
```

**근거**:
- 모바일 360px 공간 제약 (1개 약마다 2~3개 timeSlot 버튼)
- 색상 강도 + 아이콘 + pulse 조합이면 시각 명확성 이미 충분
- 스크린리더 사용자에게는 색상 의존을 깨고 명시적 상태 텍스트 제공 (WCAG 친화)

### 2.5 mock 시드 정리 — **`medicationLogs: []`** (확정)

```typescript
// mock-data.ts:495-516의 medicationLogs 배열을 빈 배열로
const medicationLogs: MedicationLog[] = [];
```

**근거**: Plan §6.2에서 이미 확정. dev 환경 첫 진입 시 모든 timeSlot이 미체크 상태 → 사용자가 직접 체크하는 깨끗한 흐름.

---

## 3. File Changes

### 3.1 신규 파일

없음.

### 3.2 수정 파일

| File | 변경 내용 | Priority |
|------|----------|:--------:|
| `src/components/features/today-medication.tsx` | className 3-tier 차별화 + 아이콘 강화 + aria-label 추가 | Must |
| `src/lib/mock-data.ts` | `medicationLogs` 배열을 빈 배열로 (`[]`) | Must |

### 3.3 변경 없음 (의도적)

| File | 사유 |
|------|------|
| `src/components/features/medication-card.tsx` | medication 관리 페이지 카드 — 무관 |
| `src/hooks/use-medication-logs.ts` | 직전 사이클 완성 |
| `src/types/index.ts` | 타입 변경 없음 |
| `src/app/(main)/dashboard/page.tsx` | 호출만, 수정 없음 |

---

## 4. Detailed Design

### 4.1 `today-medication.tsx` className 재설계

**Before** (line 64-70):
```typescript
className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
  checked
    ? 'bg-green-100 text-green-700 border border-green-200'
    : isPast
      ? 'bg-red-50 text-red-400 border border-red-200'
      : 'bg-gray-50 text-gray-500 border border-gray-200'
}`}
```

**After** (v0.2 — `font-medium` → `font-semibold` 격상):
```typescript
className={cn(
  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
  'disabled:opacity-60 disabled:cursor-not-allowed',
  checked
    ? 'bg-green-500 text-white border-2 border-green-600 shadow-sm'
    : isPast
      ? 'bg-amber-100 text-amber-800 border-2 border-amber-400 animate-pulse'
      : 'bg-gray-50 text-gray-400 border border-gray-200',
)}
```

**v0.2 격상 — `font-medium` → `font-semibold`**: 체크됨 `green-500`/`white` 대비가 normal AA 경계(~3.5:1)였던 점 보완. `font-semibold`로 글자 두께를 키워 가독성 보강. §5.2의 "Do에서 결정"으로 열어둔 항목을 적용.

**변경 포인트**:
| 측면 | Before | After |
|------|--------|-------|
| 체크됨 배경 | `bg-green-100` (옅음) | `bg-green-500` (진함) |
| 체크됨 글씨 | `text-green-700` | `text-white` (대비 ↑) |
| 체크됨 border | `border` (1px) `border-green-200` | `border-2 border-green-600` (강조) |
| 체크됨 그림자 | 없음 | `shadow-sm` (떠오름) |
| 알람 색상 | red-50/400 | **amber-100/800** (의미 충돌 회피) |
| 알람 border | `border` (1px) | `border-2 border-amber-400` |
| 알람 애니메이션 | 없음 | **`animate-pulse`** |
| 미래 | 그대로 | 글씨만 `text-gray-400`로 약화 |
| 전환 | `transition-colors` | `transition-all` (border/shadow 포함) |

### 4.2 아이콘 크기 강화

**Before** (line 72):
```typescript
<span>{checked ? '✅' : isPast ? '⏰' : '⭕'}</span>
```

**After** (v0.2):
```typescript
<span className="text-sm leading-none" aria-hidden="true">
  {checked ? '✅' : isPast ? '⏰' : '☐'}
</span>
```

**변경**: `text-xs` 컨텍스트에서 이모지만 `text-sm`으로 약간 크게 + `leading-none`으로 행 높이 정렬 + `aria-hidden`(스크린리더는 aria-label로 대체). **미래 아이콘은 `⭕`(OK 의미 충돌) → `☐`(체크박스 메타포)로 변경 — v0.2, §2.3.1 참조**.

### 4.3 aria-label 추가

**Before** (line 59-71의 `<button>`):
```typescript
<button
  key={ts}
  type="button"
  onClick={() => handleToggle(med._id, ts)}
  disabled={...}
  className={...}
>
```

**After**:
```typescript
<button
  key={ts}
  type="button"
  onClick={() => handleToggle(med._id, ts)}
  disabled={checkMed.isPending || uncheckMed.isPending}
  aria-label={
    checked
      ? `${med.name} ${ts} 복용 완료`
      : isPast
        ? `${med.name} ${ts} 미복용, 시간 지남`
        : `${med.name} ${ts} 예정`
  }
  aria-pressed={checked ? true : false}
  className={...}
>
```

**추가 점**:
- `aria-label`: 약 이름 + 시간 + 상태 명시
- `aria-pressed`: toggle button 의미를 시맨틱하게 — 스크린리더가 "토글됨/해제됨" 안내

### 4.4 import 추가

```typescript
import { cn } from '@/lib/utils';
```

기존에는 template literal로 className 조합 — `cn()` 헬퍼로 통일하여 다른 컴포넌트와 일관성.

### 4.5 `mock-data.ts` 시드 정리

**Before** (line 495-516):
```typescript
const medicationLogs: MedicationLog[] = [
  {
    _id: 'medlog-bori-morning',
    petId: 'pet-bori',
    medicationId: 'med-bori-heart',
    date: isoDate(0),
    timeSlot: '08:00',
    takenAt: isoDateTime(0, 8, 4),
    createdAt: isoDateTime(0, 8, 4),
    updatedAt: isoDateTime(0, 8, 4),
  },
  {
    _id: 'medlog-maru-morning',
    petId: 'pet-maru',
    medicationId: 'med-maru-kidney',
    date: isoDate(0),
    timeSlot: '09:00',
    takenAt: isoDateTime(0, 9, 8),
    createdAt: isoDateTime(0, 9, 8),
    updatedAt: isoDateTime(0, 9, 8),
  },
];
```

**After**:
```typescript
const medicationLogs: MedicationLog[] = [];
```

**근거**: dev 첫 진입 시 모든 timeSlot 버튼이 "체크 안 됨" 상태로 시작. 사용자가 직접 체크하면서 자연스럽게 흐름 학습. medication 자체(`med-bori-heart` 등)는 시드 유지 — 약을 등록하는 단계는 건너뛰어도 됨.

---

## 5. Visual Spec

### 5.1 시안 비교 (텍스트 mockup)

**Before**: 세 상태 모두 옅은 톤 → 구분 어려움
```
[ ✅ 08:00 ]  [ ⏰ 14:00 ]  [ ⭕ 20:00 ]
   옅은 초록      옅은 빨강      옅은 회색
   (모두 비슷한 시각 무게)
```

**After**: 시각 무게 차별화
```
[ ✅ 08:00 ]  [ ⏰ 14:00 ]  [ ⭕ 20:00 ]
   진한 초록      amber 깜박       흐린 회색
   흰 글씨        진한 글씨        약한 글씨
   border-2       border-2 pulse  border-1
   shadow         (강조)           (배경)
```

### 5.2 색상 토큰 (모두 Tailwind 기본 팔레트)

| 상태 | bg | text | border | extra |
|------|-----|------|--------|-------|
| 체크됨 | `bg-green-500` | `text-white` | `border-2 border-green-600` | `shadow-sm` |
| 시간 지남 | `bg-amber-100` | `text-amber-800` | `border-2 border-amber-400` | `animate-pulse` |
| 미래 | `bg-gray-50` | `text-gray-400` | `border border-gray-200` | — |

**WCAG 대비** (대략 추정):
- 체크됨: `green-500` (#22c55e) vs `white` (#fff) → contrast ratio **~3.5:1** (large text AA 통과, normal AA는 경계)
- 알람: `amber-100` (#fef3c7) vs `amber-800` (#92400e) → contrast ratio **~10:1** (AA/AAA 통과)
- 미래: `gray-50` (#f9fafb) vs `gray-400` (#9ca3af) → contrast ratio **~2.5:1** (의도적 약화)

**노트**: 체크됨의 contrast ratio가 3.5:1 경계라 `text-xs` 크기에선 가독성 우려. 글씨 `font-semibold` 추가로 보강하는 것도 옵션 — Do 단계 시각 확인 후 결정.

### 5.3 Spacing/Layout (기존 유지)

- `gap-1.5` (아이콘-텍스트 간격)
- `px-2.5 py-1.5` (버튼 내부 여백)
- `rounded-lg` (모서리)

→ 변경 없음. **시각 무게 차별화는 색상/border/animation으로만 달성**, 크기 변경 없이 한 줄 wrap 패턴 보존.

---

## 6. Edge Cases & Behaviors

| 케이스 | 기대 동작 |
|--------|-----------|
| 체크된 상태 + disabled (저장 중) | `bg-green-500` + `opacity-60` (변경 진행 중 시각 신호) |
| 알람 상태에서 클릭 (체크 시도) | pulse 멈춤 → 체크됨 상태로 전환 (transition-all) |
| 미래 상태에서 사용자가 미리 체크 | 즉시 체크됨 상태 (현재 시각 무관, 사용자 의도 존중) |
| `medications.timeSlots` 5개 이상 | flex-wrap으로 줄바꿈 자연 (기존 동작 유지) |
| 모든 timeSlot 완료 → `allDone` 배지 | "완료" 배지(`bg-green-100 text-green-700`)는 변경 없음 (별도 영역) |
| 스크린리더 사용자 | `aria-label`로 약 이름 + 시간 + 상태 안내, `aria-pressed`로 토글 상태 |

### 6.1 `allDone` 배지와의 톤 일관성

`today-medication.tsx:48`의 `allDone` 배지(`bg-green-100 text-green-700`)는 그대로 두는 게 좋은가, 진한 톤으로 통일하는 게 좋은가?

**결정**: **그대로 유지**. 이유:
- `allDone` 배지는 약 전체 완료 시 라벨링 (메타 정보)
- 개별 timeSlot 버튼이 액션 가능 영역 — 진한 톤은 "당신이 한 행동의 결과"를 강조
- 두 영역의 톤 분리가 정보 위계를 명확히 함

---

## 7. Verification Strategy

### 7.1 Type Check

```bash
npx tsc --noEmit
```

기대: exit 0.

### 7.2 Visual Manual Test

dev server에서 다음 확인:

| # | 시나리오 | 기대 |
|---|---------|------|
| 1 | dev 첫 진입 (localStorage 클리어 후) | 모든 timeSlot이 회색(미래) 또는 amber pulse(이미 지난 시간) — 체크된 것 없음 |
| 2 | 미래 timeSlot 클릭 | 즉시 진한 초록 + 흰 글씨로 전환 (애니메이션) |
| 3 | 체크 해제 클릭 | 다시 회색 또는 amber pulse로 |
| 4 | 알람 상태 (시간 지남, 미체크) | amber 배경 + 깜박임 + `text-amber-800` 진한 글씨 |
| 5 | 모든 timeSlot 체크 | `allDone` 배지 옅은 초록 노출 (개별 버튼은 진한 초록) |
| 6 | 360px viewport | 다수 timeSlot 줄바꿈 자연, pulse 정상 동작 |
| 7 | DevTools axe (or Lighthouse Accessibility) | aria-label 노출, color-contrast 경고 확인 |

### 7.3 Regression Check

- `MedicationCard` (`/pets/[id]/medications`) — 변경 없는지 시각 확인
- 다른 영역의 `bg-green-100`/`bg-red-50` 톤 변경 없는지 grep:
  ```bash
  grep -rn "bg-green-100\|bg-red-50\|bg-amber-100" src/components/features/today-medication.tsx
  ```
  → 본 파일에서 위 옅은 톤 사용 사라졌는지 확인

---

## 8. Implementation Order (Do phase 가이드)

| # | Step | 예상 시간 | 검증 |
|---|------|----------|------|
| 1 | `today-medication.tsx` `cn` import 추가 | 1분 | `tsc` |
| 2 | `today-medication.tsx` className 3-tier 재작성 | 5분 | `tsc` + 시각 확인 |
| 3 | 아이콘 `<span>` 크기 강화 | 3분 | 시각 확인 |
| 4 | `aria-label` + `aria-pressed` 추가 | 5분 | DevTools 접근성 확인 |
| 5 | `mock-data.ts` `medicationLogs = []` 변경 | 2분 | localStorage 클리어 후 빈 상태 확인 |
| 6 | localStorage 클리어 + dev server 시각 검증 | 10분 | §7.2 체크리스트 |
| 7 | (선택) `font-semibold` 보강 결정 | 3분 | 가독성 평가 |

총 예상: **30분** (Plan의 0.5일보다 짧음 — 범위가 더 좁아짐).

---

## 9. Open Questions

(없음 — Plan §6.2의 4개 미결정 항목 모두 §2에서 확정)

추후 후속 검토:
- 체크됨 contrast ratio 4.5:1 미달 시 `font-semibold` 또는 `bg-green-600` 격상 — Do 시각 검증 후 결정
- pulse 애니메이션이 PWA 배경 탭에서 너무 강하면 `motion-reduce:animate-none` 추가
- 다크 모드 도입 시 `dark:` variant 별도 정의 필요

---

## 10. Type & Interface Contract

본 feature는 **시각/접근성 변경 only** — 인터페이스 변경 없음.

```typescript
// today-medication.tsx (변경 후에도 동일)
interface TodayMedicationProps {
  petId: string;
  medications: Medication[];
}
```

호출부 변경 0건.

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-05-14 | Initial draft. 4개 미결정 항목 확정 (강한 톤 / amber + pulse / 이모지 강화 / aria-label) | aejeong |
| 0.2 | 2026-05-14 | Do 단계 발견 반영: ① 미래 아이콘 `⭕` → `☐` (OK 의미 충돌 회피, §2.3.1 신설), ② `font-medium` → `font-semibold` 격상 (§4.1 가독성 보강) | aejeong |
