# medication-daily-reset Design Document

> **Summary**: `lib/utils.ts`의 `getToday()`/`getDaysAgo()`를 KST 기준으로 재작성하고, 7개 파일에서 직접 `toISOString().split` 호출을 헬퍼 호출로 일괄 교체. 데이터 모델/표시 로직은 변경 없음
>
> **Project**: HelpPet
> **Version**: 0.1.0
> **Author**: aejeong
> **Date**: 2026-05-14
> **Status**: Draft
> **Plan Reference**: `docs/01-plan/features/medication-daily-reset.plan.md`

---

## 1. Architecture

### 1.1 Single Source of Truth for "Today"

```
변경 전 (분산)
├── lib/utils.ts          → new Date().toISOString().split('T')[0]
├── hooks/use-*           → new Date().toISOString().split('T')[0]
├── components/features/  → cutoff.toISOString().split('T')[0]
└── lib/mock-data.ts      → date.toISOString().split('T')[0]
                              (각자 UTC 기준 계산)

변경 후 (단일 진입점)
└── lib/utils.ts
    ├── KST_FORMATTER (internal const)
    ├── getToday()  ← KST YYYY-MM-DD
    └── getDaysAgo(n)  ← KST n일 전
        │
        ├── hooks/use-medication-logs.ts (3 호출)
        ├── hooks/use-health-records.ts (1 호출)
        ├── components/features/condition-report.tsx (2 호출)
        ├── components/features/symptom-frequency.tsx (1 호출)
        ├── lib/mock-data.ts (isoDate, isoDateTime 재정의)
        └── app/(main)/pets/new, [id]/edit (2 호출)
```

### 1.2 변경되지 않는 영역

- `MedicationLog.date` 데이터 타입 (`string` YYYY-MM-DD)
- `MedicationLog.takenAt` — UTC ISO instant (timestamp는 UTC가 정확)
- TanStack Query 캐싱 정책 — `queryKey: ['MedicationLogs', petId, today]`에서 `today`만 KST 기준으로 자동 변경
- `today-medication.tsx` 표시 로직 — 받은 logs를 그대로 렌더

---

## 2. Plan 미결정 항목 확정

### 2.1 헬퍼 명명 (Plan §6.2 결정 1)

**결정**: `getToday()` / `getDaysAgo()` **이름 유지**, 의미만 KST로 변경

| 후보 | 호출부 변경 | 명시성 | 선택 |
|------|:-----------:|:------:|:----:|
| `getToday()` 유지 (의미만 KST) | ✅ 최소 (0 추가) | △ JSDoc 필요 | ✅ |
| `getKSTToday()` 신규 + `getToday` 제거 | ❌ 전 호출부 수정 | ✅ 명시적 | ❌ |
| 둘 다 export (`getKSTToday`만 새로 사용) | ⚠️ 점진적 | △ 혼란 | ❌ |

**결정 근거**: ① helppet은 한국 단일 시장 → KST가 default가 자연스러움 ② JSDoc 주석으로 ambiguity 차단 ③ 호출부 변경 표면 축소로 회귀 위험 감소.

### 2.2 KST 계산 방식 (Plan §6.2 결정 2)

**결정**: `Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' })`

```typescript
const KST_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
```

| 후보 | 명시성 | DST-safe | SSR 일관성 | 선택 |
|------|:------:|:--------:|:----------:|:----:|
| `Intl.DateTimeFormat` | ✅ | ✅ | ✅ | ✅ |
| 수동 `+9h` offset | ❌ magic 9 | ❌ DST 국가 확장 시 깨짐 | ✅ | ❌ |
| `date-fns-tz` 라이브러리 | ✅ | ✅ | ✅ | ❌ (의존성 추가 회피) |

**선택 근거**: ① `en-CA` 로케일이 `YYYY-MM-DD` 형식을 안정적으로 반환 ② 명시적 `timeZone: 'Asia/Seoul'`로 의도 코드에 박힘 ③ Next.js 14가 돌 만한 브라우저는 모두 `Intl` 지원 ④ SSR에서도 server timezone과 무관하게 일관 동작 ⑤ DST 없는 KST지만 패턴 자체가 미래 확장에 안전.

### 2.3 grep 검증 strictness (Plan §4.1 결정 3)

**결정**: production 코드에서 **`new Date().toISOString().split` 0건**, `cutoff.toISOString().split` / `date.toISOString().split` 등도 모두 0건. 단, `lib/utils.ts`의 `KST_FORMATTER` 내부와 `mock-data.ts`의 `MOCK_KST_FORMATTER` 내부는 허용.

**검증 명령**:
```bash
grep -rn "\.toISOString()\.split" src/ | grep -v "lib/utils.ts" | grep -v "lib/mock-data.ts"
```

기대: **0건**. 위 두 파일은 헬퍼 정의 자체이므로 제외.

### 2.4 birthDate 페이지 처리 (Plan §2.1 #6)

**결정**: `pets/new/page.tsx`, `pets/[id]/edit/page.tsx`의 birthDate fallback은 **`getYearsAgo(estimatedAge)` 신규 헬퍼**로 교체.

**근거 및 정정 (Do 단계 발견)**:
- 초기 Design에서는 `getToday()`로 단순 교체 권장
- 실제 코드 검토 결과 birthDate fallback 계산은 "오늘"이 아니라 "예상 나이 N년 전" 의미 (`now.setFullYear(getFullYear() - estimatedAge)`)
- 단순 `getToday()`로는 의미가 깨짐 → `getYearsAgo(years)` 헬퍼를 `lib/utils.ts`에 추가하고 두 페이지 모두 이를 사용
- 동일 월/일 유지 + 연도만 차감하는 의미적 정확성 보존

### 2.5 `takenAt` 처리 (신규 명시)

**결정**: `takenAt: new Date().toISOString()`는 **그대로 둠** (UTC ISO instant).

**근거**: `takenAt`은 "약을 실제로 먹은 절대 시각(timestamp)"이지 날짜가 아님. 이런 instant 값은 UTC ISO가 정확함. 표시 시점에 `toLocaleString('ko-KR')` 등으로 KST 변환되어야 하지만 그건 표시 로직 영역으로 본 feature 범위 외.

---

## 3. File Changes

### 3.1 신규 파일

없음.

### 3.2 수정 파일

| File | 변경 내용 | Priority |
|------|----------|:--------:|
| `src/lib/utils.ts` | `KST_FORMATTER` 추가 + `getToday`/`getDaysAgo` 재구현 + **`getYearsAgo` 신규** + JSDoc | Must |
| `src/hooks/use-medication-logs.ts` | 3 호출 (line 9, 23) → `getToday()` 사용. `takenAt`은 유지 | Must |
| `src/hooks/use-health-records.ts` | 1 호출 (line 22) → `getToday()` | Must |
| `src/components/features/condition-report.tsx` | 2 호출 (line 23, 27) → `getDaysAgo()` (코드 단순화) | Must |
| `src/components/features/symptom-frequency.tsx` | 1 호출 (line 16) → `getDaysAgo()` | Must |
| `src/lib/mock-data.ts` | `isoDate`/`isoDateTime` 함수 내부 재구현 (KST 기준). 시드 데이터 자체는 변경 없음 | Must |
| `src/app/(main)/pets/new/page.tsx` | 1 호출 (line 49) → `getToday()` | Should |
| `src/app/(main)/pets/[id]/edit/page.tsx` | 1 호출 (line 70) → `getToday()` | Should |

### 3.3 변경 없음 (의도적)

| File | 사유 |
|------|------|
| `src/types/index.ts` | `MedicationLog.date: string` 그대로 (모델 변경 없음) |
| `src/components/features/today-medication.tsx` | 표시/토글 로직 변경 없음 — 받은 logs를 그대로 렌더 |
| `src/components/features/medication-card.tsx` | 무관 |
| `use-medication-logs.ts`의 `takenAt: new Date().toISOString()` | UTC ISO instant 의도 유지 |

---

## 4. Detailed Design

### 4.1 `src/lib/utils.ts`

**Before**:
```typescript
export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function getDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}
```

**After**:
```typescript
/**
 * Asia/Seoul (KST, UTC+9) 기준 날짜 포매터.
 * 한국 단일 시장 가정. 다국가 지원 시 사용자 timezone 필드로 확장.
 */
const KST_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/**
 * KST 기준 오늘 날짜를 YYYY-MM-DD 형식으로 반환.
 */
export function getToday(): string {
  return KST_FORMATTER.format(new Date());
}

/**
 * KST 기준 n일 전 날짜를 YYYY-MM-DD 형식으로 반환.
 * @param days - 0 이상의 정수. 0이면 오늘과 동일.
 */
export function getDaysAgo(days: number): string {
  const [y, m, d] = getToday().split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d - days));
  return KST_FORMATTER.format(date);
}

/**
 * KST 기준 n년 전 (같은 월/일) 날짜를 YYYY-MM-DD 형식으로 반환.
 * birthDate fallback 등 연도 기반 계산에 사용.
 */
export function getYearsAgo(years: number): string {
  const [y, m, d] = getToday().split('-').map(Number);
  return `${y - years}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
```

**구현 설명**:
- `en-CA` 로케일은 ISO 8601 `YYYY-MM-DD` 형식을 안정적으로 반환 (다른 로케일은 `2026/5/14` 같이 다양)
- `getDaysAgo`는 "현재 KST의 YYYY-MM-DD" → 거기서 d 일 빼기 → 다시 KST 포맷. UTC base에서 빼면 timezone 경계에서 ±1일 오차 발생 가능하므로 KST string에서 분해 후 계산
- `Date.UTC(y, m-1, d-days)`는 month가 0-indexed인 점 주의 (`m - 1`)

### 4.2 `src/hooks/use-medication-logs.ts`

**Before** (line 8-15, 17-29):
```typescript
export function useTodayMedicationLogs(petId: string) {
  const today = new Date().toISOString().split('T')[0];
  return useQuery<MedicationLog[]>({
    queryKey: ['MedicationLogs', petId, today],
    queryFn: () => bkend.data.list('MedicationLogs', { petId, date: today }),
    enabled: !!petId,
  });
}

export function useCheckMedication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { petId: string; medicationId: string; timeSlot: string }) =>
      bkend.data.create('MedicationLogs', {
        ...data,
        date: new Date().toISOString().split('T')[0],
        takenAt: new Date().toISOString(),
      }),
    // ...
  });
}
```

**After**:
```typescript
import { getToday } from '@/lib/utils';

export function useTodayMedicationLogs(petId: string) {
  const today = getToday();
  return useQuery<MedicationLog[]>({
    queryKey: ['MedicationLogs', petId, today],
    queryFn: () => bkend.data.list('MedicationLogs', { petId, date: today }),
    enabled: !!petId,
  });
}

export function useCheckMedication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { petId: string; medicationId: string; timeSlot: string }) =>
      bkend.data.create('MedicationLogs', {
        ...data,
        date: getToday(),
        takenAt: new Date().toISOString(),  // ← UTC ISO instant 그대로
      }),
    // ...
  });
}
```

### 4.3 `src/hooks/use-health-records.ts`

**Before** (line 21-22):
```typescript
export function useUpcomingSchedules(petId: string) {
  const today = new Date().toISOString().split('T')[0];
  // ...
}
```

**After**:
```typescript
import { getToday } from '@/lib/utils';

export function useUpcomingSchedules(petId: string) {
  const today = getToday();
  // ...
}
```

### 4.4 `src/components/features/condition-report.tsx`

**Before** (line 18-27):
```typescript
export function ConditionReport({ logs, period }: ConditionReportProps) {
  const now = new Date();
  const daysBack = period === 'week' ? 7 : 30;
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - daysBack);
  const cutoffStr = cutoff.toISOString().split('T')[0];

  const prevCutoff = new Date(cutoff);
  prevCutoff.setDate(prevCutoff.getDate() - daysBack);
  const prevCutoffStr = prevCutoff.toISOString().split('T')[0];
  // ...
}
```

**After**:
```typescript
import { getDaysAgo } from '@/lib/utils';

export function ConditionReport({ logs, period }: ConditionReportProps) {
  const daysBack = period === 'week' ? 7 : 30;
  const cutoffStr = getDaysAgo(daysBack);
  const prevCutoffStr = getDaysAgo(daysBack * 2);
  // ...
}
```

**부수 효과**: 5줄 → 3줄로 단순화.

### 4.5 `src/components/features/symptom-frequency.tsx`

**Before** (line 13-16):
```typescript
export function SymptomFrequency({ logs, days = 30 }: SymptomFrequencyProps) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split('T')[0];
  // ...
}
```

**After**:
```typescript
import { getDaysAgo } from '@/lib/utils';

export function SymptomFrequency({ logs, days = 30 }: SymptomFrequencyProps) {
  const cutoffStr = getDaysAgo(days);
  // ...
}
```

### 4.6 `src/lib/mock-data.ts`

**Before** (line 60-71):
```typescript
function isoDate(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split('T')[0];
}

function isoDateTime(offsetDays = 0, hour = 9, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}
```

**After**:
```typescript
const MOCK_KST_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** KST 기준 (오늘 + offsetDays)의 YYYY-MM-DD */
function isoDate(offsetDays = 0) {
  const todayKST = MOCK_KST_FORMATTER.format(new Date());
  const [y, m, d] = todayKST.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + offsetDays));
  return MOCK_KST_FORMATTER.format(date);
}

/**
 * KST 기준 (오늘 + offsetDays, hour:minute)의 ISO datetime.
 * hour/minute은 KST 시각으로 해석되어 UTC instant ISO를 반환.
 */
function isoDateTime(offsetDays = 0, hour = 9, minute = 0) {
  const todayKST = MOCK_KST_FORMATTER.format(new Date());
  const [y, m, d] = todayKST.split('-').map(Number);
  // KST hour → UTC hour-9 (음수면 Date.UTC가 자동으로 전날로 정규화)
  const date = new Date(Date.UTC(y, m - 1, d + offsetDays, hour - 9, minute, 0));
  return date.toISOString();
}
```

**대안 검토** (DRY): `lib/utils.ts`의 헬퍼 재사용도 가능하지만, mock-data는 internal seed builder라 utils 의존을 두지 않고 자체 formatter를 유지 — utils 변경 시 mock 시드가 깨지는 결합 회피. 동일 패턴 2회 정의는 허용.

### 4.7 `src/app/(main)/pets/new/page.tsx`, `pets/[id]/edit/page.tsx`

**Before** (각각 line 45-49, 66-70):
```typescript
let finalBirthDate = data.birthDate;
if (unknownBirthDate && data.estimatedAge) {
  const now = new Date();
  now.setFullYear(now.getFullYear() - Number(data.estimatedAge));
  finalBirthDate = now.toISOString().split('T')[0];
}
```

**After**:
```typescript
import { getYearsAgo } from '@/lib/utils';
// ...
let finalBirthDate = data.birthDate;
if (unknownBirthDate && data.estimatedAge) {
  finalBirthDate = getYearsAgo(Number(data.estimatedAge));
}
```

**의미 보존**: 단순히 `getToday()`로 교체하면 "오늘이 birthDate"가 되어 의미가 깨짐. `getYearsAgo`로 "예상 나이만큼 전" 의미 유지.

---

## 5. Verification Strategy

### 5.1 Type Check

```bash
npx tsc --noEmit
```

기대: exit 0.

### 5.2 Grep Verification (FR-08)

```bash
grep -rn "\.toISOString()\.split" src/ | grep -v "src/lib/utils.ts" | grep -v "src/lib/mock-data.ts"
```

기대: **0건 출력**.

### 5.3 KST Boundary Manual Test

브라우저 DevTools Console에서:
```javascript
// 1. 현재 KST 오늘
new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date())
// → "2026-05-14" (KST 기준)

// 2. UTC 기준 오늘 (비교용)
new Date().toISOString().split('T')[0]
// → 한국 시간 09:00 이전이면 "2026-05-13", 이후면 "2026-05-14"
```

두 값이 다른 시간대(한국 시간 00:00 ~ 08:59)에 페이지 진입 시:
- **Before 동작**: UTC 어제로 필터 → 어제 체크 보임 (버그)
- **After 동작**: KST 오늘로 필터 → 어제 체크 안 보임 (정상)

### 5.4 시뮬레이션 방법 (Optional)

`useTodayMedicationLogs`에 임시 console.log 추가하여 `today` 값 확인:
```typescript
const today = getToday();
console.log('[medication-daily-reset] today =', today);
```

검증 후 제거 또는 Design §10의 dev-only logger 패턴으로 영구화 — 본 사이클에서는 임시 + 제거.

### 5.5 데이터 보존 검증

브라우저 DevTools → Application → Local Storage → `helppet.mock.db.v1` 확인:
- 변경 전 저장된 `MedicationLogs[].date` 값 (UTC 기준)이 그대로 유지되어야 함
- 변경 후 새로 체크하는 데이터는 KST 기준으로 저장됨

---

## 6. Edge Cases

| 케이스 | 시각 | 기대 동작 |
|--------|------|-----------|
| 한국 시간 자정 직후 (00:01 KST) | UTC 15:01 (전날) | `getToday()` → KST 오늘 (정상). `new Date().toISOString().split('T')[0]`은 UTC 어제 (버그) |
| 한국 시간 오전 8:59 KST | UTC 23:59 (전날) | `getToday()` → KST 오늘. 어제 데이터 안 보임 |
| 한국 시간 오전 9:00 KST | UTC 00:00 (당일) | `getToday()` → KST 오늘. 양쪽 일치 |
| 한국 시간 오후 6:00 KST | UTC 09:00 (당일) | `getToday()` → KST 오늘. 양쪽 일치 |
| 한국 시간 오후 11:59 KST | UTC 14:59 (당일) | `getToday()` → KST 오늘. 양쪽 일치 |
| 한국 시간 24:00 = 다음날 00:00 | UTC 15:00 (전날) | 자정 경계에서 KST는 새 날짜로, UTC는 같은 날 → KST가 정확 |

### 6.1 자정 경계 데이터

한국 시간 자정 직전(23:59) 체크 → `date = 오늘`, 자정 직후(00:01) 체크 → `date = 다음날`. 의도된 동작.

### 6.2 `useTodayMedicationLogs`의 stale 처리

TanStack Query는 mount 시점에 `today` 값을 캡처. 사용자가 자정을 가로지르며 같은 화면에 머무르면 `today`가 자동 갱신되지 않음. 본 feature 범위 외 (refresh 또는 navigation에서 새로 캡처됨).

후속 검토: `useEffect`로 KST 자정 시점 자동 invalidate (필요 시 후속 feature `medication-midnight-refresh`).

---

## 7. Implementation Order (Do phase 가이드)

| # | Step | 예상 시간 | 검증 |
|---|------|----------|------|
| 1 | `src/lib/utils.ts` 수정 (`KST_FORMATTER`, `getToday`, `getDaysAgo`) | 10분 | `tsc` pass |
| 2 | `use-medication-logs.ts` 교체 (3 호출, import 추가) | 5분 | `tsc` pass |
| 3 | `use-health-records.ts` 교체 (1 호출) | 3분 | `tsc` pass |
| 4 | `condition-report.tsx` 교체 (2 호출 → 단순화) | 5분 | `tsc` pass |
| 5 | `symptom-frequency.tsx` 교체 (1 호출) | 3분 | `tsc` pass |
| 6 | `mock-data.ts` `isoDate`/`isoDateTime` 재정의 | 10분 | mock data 시드 정상 로드 확인 |
| 7 | `pets/new/page.tsx`, `pets/[id]/edit/page.tsx` 교체 | 5분 | `tsc` pass |
| 8 | grep 검증 (§5.2) | 2분 | 0건 확인 |
| 9 | localStorage 초기화 후 dev server 재기동 + 시각 검증 | 10분 | 어제 데이터 안 보임 확인 |

총 예상: **53분** (Plan의 0.5일 추정과 일치).

### 7.1 localStorage 클리어 권장

기존 `helppet.mock.db.v1`에 UTC 기준 데이터가 남아있으면 검증 시 혼란. dev 환경에서 다음 실행 권장:
```javascript
localStorage.removeItem('helppet.mock.db.v1');
location.reload();
```
시드가 KST 기준으로 새로 생성됨.

---

## 8. Risks (Design 단계 추가 검토)

| Risk | Impact | Mitigation |
|------|--------|------------|
| `Intl.DateTimeFormat` 인스턴스가 모듈 로드 시점에 생성 — SSR/CSR 일관성 | Low | `timeZone` 옵션 명시로 timezone 의존성 차단 |
| `en-CA` 로케일이 일부 브라우저에서 `2026-05-14` 외 다른 형식 반환 | Very Low | ECMA-402 spec상 안정적. Node.js 18+/Modern browsers 보장 |
| `Date.UTC(y, m-1, d-days)`의 month underflow (예: 1월에서 -10일) | Low | `Date.UTC`가 자동 정규화 (월/년 wraparound) |
| 기존 UTC 데이터와 새 KST 데이터 혼재로 통계 ±1일 noise | Medium | Plan §2.2 Out of Scope — 새 데이터부터 정상화로 자연 해소 |

---

## 9. Type & Interface Contract

```typescript
// lib/utils.ts (변경 후 시그니처)
export function getToday(): string;                 // "YYYY-MM-DD" (KST)
export function getDaysAgo(days: number): string;   // "YYYY-MM-DD" (KST)
export function getYearsAgo(years: number): string; // "YYYY-MM-DD" (KST, 같은 MM-DD)
```

시그니처는 변경 없음 — 호출부는 import만 추가하면 됨.

---

## 10. Open Questions

(없음 — Plan §6.2의 미결정 3개 + birthDate 처리 + takenAt 정책 모두 §2에서 확정)

추후 검토 항목 (본 feature 범위 외):
- 자정 가로지를 때 화면 자동 새로고침 (`medication-midnight-refresh`)
- 기존 UTC 데이터 마이그레이션 (`medication-log-tz-migration`)
- 표시 시점 KST 변환 일관성 (`takenAt` 표시 포맷 통일)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-05-14 | Initial draft. 3개 미결정 항목 확정 + birthDate/takenAt 정책 명시 + 9개 호출 지점 before/after 매핑 | aejeong |
| 0.2 | 2026-05-14 | Do 단계 발견 반영: `getYearsAgo` 헬퍼 추가, §2.4 / §3.2 / §4.1 / §4.7 / §9 보강 (gap-detector 권장) | aejeong |
