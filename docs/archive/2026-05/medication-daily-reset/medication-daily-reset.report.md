# medication-daily-reset Completion Report

> **Feature**: 오늘의 투약 매일 KST 자정 초기화 (timezone 버그 수정)
> **Project**: HelpPet
> **Date**: 2026-05-14
> **Status**: ✅ Completed
> **Cycle Duration**: 1일 (2026-05-14 Plan → Report)

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | "오늘의 투약" 체크 상태가 매일 한국 시간 자정 기준으로 새로 시작되어야 하지만, 모든 날짜 계산이 UTC 기준(`new Date().toISOString().split('T')[0]`)이라 한국 시간 자정~오전 9시 사이에는 어제 체크가 그대로 보임. 보호자가 "오늘 약 줬는지" 판단 불가 |
| **Solution** | KST 기준 날짜 유틸(`getToday`, `getDaysAgo`, **`getYearsAgo` 신규**)을 `lib/utils.ts`의 단일 진입점으로 도입. 9개 호출 지점을 일괄 교체. `Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' })`로 명시적 timezone 적용 |
| **Function/UX Effect** | 한국 시간 새벽이라도 "오늘"이 정확히 계산되어 어제 체크가 자동으로 사라짐. 과거 기록은 localStorage에 그대로 보존. `condition-report`/`symptom-frequency`도 KST 기준으로 정확한 통계 cutoff |
| **Core Value** | helppet 핵심 가치 "정확한 건강관리"의 기본 신뢰도 회복 — medication adherence 트래킹이 매일 정확히 분리되어, 투약·진료 데이터 전체의 신뢰성 기반 확보 |

### 1.3 Value Delivered

| Metric | Value |
|--------|-------|
| **Match Rate** | **98%** (PASS, threshold 90%) |
| Iteration Count | 0 (iterate 단계 불필요) |
| New Files | 0 (헬퍼는 기존 `lib/utils.ts`에 추가) |
| Modified Files | 8 |
| New Helpers | 3 (`KST_FORMATTER`, `getYearsAgo`) + 2개 재구현 (`getToday`, `getDaysAgo`) |
| Code Simplification | `condition-report.tsx` 9→3줄, `symptom-frequency.tsx` 4→1줄, `pets/new`+`edit` 5→1줄 각각 |
| Type Check | ✅ `tsc --noEmit` exit 0 |
| Grep Verification | ✅ `toISOString().split` production 0건 (utils/mock 포함 전체 0건 — 기대치 초과 달성) |
| Design 결정 항목 수 | 22개 (21개 완전 일치 + 1개 trivial 부분 일치) |
| Design Sync | v0.2 보강 — `getYearsAgo` 의도적 확장 반영 |

---

## 2. PDCA Cycle Summary

### 2.1 Plan

| Item | Detail |
|------|--------|
| Document | `docs/01-plan/features/medication-daily-reset.plan.md` (216 lines, v0.1) |
| Scope | Must 6건 (FR-01~07), Should 1건 (FR-08) |
| Key Decisions | ① 데이터 모델 변경 없음 (`MedicationLog.date`는 이미 per-date 분리), ② 기존 UTC 데이터 마이그레이션은 Out of Scope (자연 정상화), ③ 표시 로직 변경 없음 |
| Open Questions | 3개 (헬퍼 명명 / KST 계산 방식 / grep strictness) → 모두 Design에서 확정 |

### 2.2 Design

| Item | Detail |
|------|--------|
| Document | `docs/02-design/features/medication-daily-reset.design.md` (327 lines, v0.2) |
| Architecture | Single Source of Truth — `lib/utils.ts`가 모든 KST 날짜 계산의 진입점 |
| 미결정 항목 확정 | 헬퍼 명명 유지 / `Intl.DateTimeFormat('en-CA', 'Asia/Seoul')` / grep 0건 strict |
| Do 단계 발견 반영 (v0.2) | `getYearsAgo` 헬퍼 추가 — §2.4 / §3.2 / §4.1 / §4.7 / §9 보강 |

### 2.3 Do (Implementation)

| File | Type | Description |
|------|------|-------------|
| `src/lib/utils.ts` | ✏️ 수정 | `KST_FORMATTER` const + `getToday`/`getDaysAgo` 재구현 + **`getYearsAgo` 신규** + JSDoc |
| `src/hooks/use-medication-logs.ts` | ✏️ 수정 | import 추가 + 2 호출 → `getToday()`. `takenAt`은 UTC 유지 |
| `src/hooks/use-health-records.ts` | ✏️ 수정 | import 추가 + `useUpcomingSchedules`의 today → `getToday()` |
| `src/components/features/condition-report.tsx` | ✏️ 수정 | 9→3줄 단순화 (`getDaysAgo()` 2회) |
| `src/components/features/symptom-frequency.tsx` | ✏️ 수정 | 4→1줄 단순화 |
| `src/lib/mock-data.ts` | ✏️ 수정 | `MOCK_KST_FORMATTER` const + `isoDate`/`isoDateTime` KST 기준 재정의 (`hour - 9` UTC 변환) |
| `src/app/(main)/pets/new/page.tsx` | ✏️ 수정 | `getYearsAgo()` 사용 (5→1줄, 의미 보존) |
| `src/app/(main)/pets/[id]/edit/page.tsx` | ✏️ 수정 | `getYearsAgo()` 사용 (5→1줄) |

**구현 특징**:
- `Intl.DateTimeFormat` + `en-CA` 로케일 조합으로 `YYYY-MM-DD` 안정적 반환
- `getDaysAgo`는 "현재 KST string 분해 → `Date.UTC(y, m-1, d-n)` 재구성"으로 자정 경계 ±1일 오차 방지
- `getYearsAgo`는 같은 월/일 유지 + 연도만 차감 (`String(m).padStart(2, '0')` 으로 zero-pad)
- `mock-data.ts`는 utils 의존을 두지 않고 자체 `MOCK_KST_FORMATTER` 유지 (시드 빌더의 isolation)
- `takenAt: new Date().toISOString()`은 UTC ISO instant 의도이므로 그대로 보존

### 2.4 Check (Gap Analysis)

| Category | Items | Matched | Rate |
|----------|:-----:|:-------:|:----:|
| §2 Plan 미결정 항목 | 5 | 5 | 100% |
| §3 File Changes | 8 | 8 | 100% |
| §4 Detailed Design | 10 | 9.5 | 95% (trivial 0.5점 차감) |
| §5 Verification | 2 | 2 | 100% |
| §7 Implementation Order | 8 | 8 | 100% |
| **Total** | **22** | **21.5** | **98%** |

**Gap List**: 없음.

**Trivial 차이 (0.5점 차감)**: `getDaysAgo` 구현이 Design 본문에는 2줄(`const todayStr = getToday(); const [y,m,d] = todayStr.split(...)`)로 명시되었지만 실제 코드는 인라인 1줄(`getToday().split('-')`) — 의미 동등.

**Design 사후 보강** (gap-detector 권장):
- Design v0.1 → v0.2 업데이트로 `getYearsAgo` 의도적 확장 동기화 완료
- Implementation과 Design 간 단일 진실 유지

---

## 3. Architecture Patterns Introduced

### 3.1 Single Source of Truth for "Today" / "Cutoff"

```
변경 전 (분산 UTC)                    변경 후 (단일 진입점, KST)
hooks/use-*                            lib/utils.ts
components/features/*                    └── KST_FORMATTER (Intl.DateTimeFormat)
lib/mock-data.ts                            ├── getToday()
  └─ 각자 new Date().toISOString()          ├── getDaysAgo(n)
                                            └── getYearsAgo(n)
                                                ↓
                                            (all hooks/components/pages)
```

**가치**: ① timezone 정책을 한 곳에서 결정 ② 호출부는 의도(`getToday`)만 표현 ③ 향후 multi-timezone 확장 시 단일 지점 수정

### 3.2 Code Simplification As Side Effect

헬퍼 추출의 부수 효과로 호출부 가독성이 극적으로 개선:

| File | Before | After | 절감 |
|------|:------:|:-----:|:----:|
| `condition-report.tsx` | 9 lines | 3 lines | -67% |
| `symptom-frequency.tsx` | 4 lines | 1 line | -75% |
| `pets/new`, `pets/[id]/edit` (각) | 5 lines | 1 line | -80% |

**일반 패턴**: "여러 곳에서 같은 인라인 계산을 반복할 때" → "의도를 이름으로 표현하는 헬퍼 추출"하면 timezone/format 정확성과 가독성을 동시에 얻음.

### 3.3 Intentional UTC Preservation (Anti-Pattern Avoidance)

```typescript
// 같은 파일에서 의도적으로 다른 timezone 처리
date: getToday(),                  // KST — "어느 날짜의 약인가" (date label)
takenAt: new Date().toISOString(), // UTC — "절대 언제 먹었나" (instant)
```

**핵심**: "날짜"(date label, KST)와 "시각"(instant, UTC) 의미가 다름을 명시. 단순 일관성을 위해 둘 다 같은 timezone으로 바꾸는 건 안티패턴.

---

## 4. Lessons Learned

### 4.1 What Went Well

1. **Plan §1.2 영향 범위 매핑**: grep으로 11개 호출 지점을 사전 매핑 → Design에서 8개 우선순위 결정 → Do에서 한 곳도 안 빠뜨림. **Plan 단계에서 grep 매핑은 timezone/유틸 픽스의 핵심 도구**
2. **Plan §2.2 Out of Scope 명시 효과**: "표시 로직 변경"을 명시 제외했기 때문에, Do 단계에서 발견된 시각 대비 UX 이슈를 본 사이클에 욱여넣지 않고 별도 feature(`medication-status-clarity`)로 자연스럽게 분리할 수 있었음
3. **Intl.DateTimeFormat 선택**: `'en-CA'` 로케일이 ISO 8601 형식을 안정적으로 반환하는 점을 활용 — 라이브러리 의존 없이 단일 timezone 보장
4. **gap-detector의 사후 보강 권고 수용**: Design v0.2 업데이트로 implementation과 문서 동기화 — 다음 사이클에서 이 Design을 참조할 때 혼란 없음

### 4.2 What to Improve

1. **Design 작성 시 의미 검토 부족**: Design §4.7에서 `pets/new`/`edit` birthDate를 "`getToday()`로 교체"라고 명시했지만, 실제 코드의 의미는 "오늘"이 아니라 "예상 나이 N년 전"이었음 → Do 단계에서 발견. **Design 단계에서 호출부 코드를 한 번 더 들여다보고 "의미"를 확인하는 단계 필요**
2. **사용자 보고 분리 어려움**: 사용자가 "어제 체크가 보임" 하나로 보고했지만 진단 결과 두 가지 다른 원인(timezone + 시각 대비)이었음. 같은 화면에서 인지된 혼란은 분리가 까다로움. **첫 진단에서 "다른 원인이 섞여 있을 수 있다"는 가설을 적극 검토할 것**
3. **런타임 검증의 한계**: Match Rate 98%는 정적 분석 결과. 한국 시간 00:00~08:59 boundary는 직접 재현이 어려워 코드 신뢰 + console 검증에 의존. **시간대 직접 재현이 어려운 경우 `Date` mocking 단위 테스트가 유효** (본 사이클 범위 외, 후속 고려)
4. **ESLint 자동 검증 여전히 미설정**: 직전 `pet-disease-display` 사이클에서도 동일 문제 발생. **`next lint`를 Strict로 설정하는 별도 작업 필요** (재차 권고)

### 4.3 Reusable Patterns

| Pattern | 재사용 시나리오 |
|---------|-----------------|
| Single Source of Truth + Intl.DateTimeFormat | 모든 timezone-sensitive 계산 (currency, datetime display 등) |
| `Intl.DateTimeFormat('en-CA', ...)` ISO 형식 추출 | 라이브러리 없이 표준 날짜 string 보장 |
| `getDaysAgo`/`getYearsAgo` "KST string 분해 → Date.UTC 재구성" | 자정 경계 ±1일 오차 회피 |
| Plan §2.2 Out of Scope 명시 | Do 단계 발견 이슈를 다른 사이클로 분리하는 결정 가이드 |
| Design 사후 보강(v0.2) | gap-detector 권고에 따른 implementation/문서 동기화 |
| date label(KST) vs instant(UTC) 분리 | medication, payment, audit log 등 두 의미가 공존하는 모든 도메인 |

---

## 5. Follow-up Features (Out of Scope)

본 사이클에서 의도적으로 분리한 후속 feature들:

| Feature | Scope | Trigger | Source |
|---------|-------|---------|--------|
| `medication-status-clarity` | "체크됨 vs 시간 지남 알람" 시각 대비 강화 + mock 시드 미리 체크 데이터 정리 | Do 단계 dev server 시각 확인에서 사용자 발견 | **이번 세션 즉시 시작 예정** |
| `medication-midnight-refresh` | 사용자가 화면을 켠 채로 자정을 가로지를 때 `useTodayMedicationLogs`의 today 자동 갱신 | 야간 보호자가 자정 너머 사용 시 누락 발생 보고될 때 | Design §10 명시 |
| `medication-log-tz-migration` | 기존 UTC 기준으로 저장된 `MedicationLog.date` 값을 KST로 일회성 변환 | 통계 정확도 ±1일 noise가 문제 될 때 | Plan §2.2 명시 |
| `eslint-strict-setup` | `next lint`를 Strict 모드로 초기 설정 + CI 통합 | 자동 검증 자동화 필요 시 | 본 Report §4.2 추가 |

---

## 6. Documents

| Stage | Document | Lines |
|-------|----------|-------|
| Plan | `docs/01-plan/features/medication-daily-reset.plan.md` | 216 |
| Design (v0.2) | `docs/02-design/features/medication-daily-reset.design.md` | ~340 |
| Analysis | `docs/03-analysis/medication-daily-reset.analysis.md` | 139 |
| **Report (this)** | `docs/04-report/features/medication-daily-reset.report.md` | — |

---

## 7. Files Changed

```
M  src/lib/utils.ts                              (+30 -7)
M  src/hooks/use-medication-logs.ts              (+1 import, 2 calls)
M  src/hooks/use-health-records.ts               (+1 import, 1 call)
M  src/components/features/condition-report.tsx  (+1 import, -6 net)
M  src/components/features/symptom-frequency.tsx (+1 import, -3 net)
M  src/lib/mock-data.ts                          (~20 lines refactor)
M  src/app/(main)/pets/new/page.tsx              (+1 import, -3 net)
M  src/app/(main)/pets/[id]/edit/page.tsx        (+1 import, -3 net)
```

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-05-14 | Initial completion report (Match Rate 98%) | aejeong |
