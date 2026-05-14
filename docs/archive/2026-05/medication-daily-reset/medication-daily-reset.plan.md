# medication-daily-reset Planning Document

> **Summary**: "오늘의 투약" 체크 상태가 매일 한국 시간(KST) 자정에 새로 시작되도록 timezone 버그 수정 — 기존 기록은 보존, 매일 새 기록 시작
>
> **Project**: HelpPet
> **Version**: 0.1.0
> **Author**: aejeong
> **Date**: 2026-05-14
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | "오늘의 투약" 체크 상태가 매일 한국 시간 자정 기준으로 새로 시작되어야 하지만, 모든 날짜 계산이 UTC 기준(`new Date().toISOString().split('T')[0]`)이라 한국 시간 자정~오전 9시 사이에는 어제 체크가 그대로 보임. 보호자가 "오늘 약 줬는지" 확인이 불가능 |
| **Solution** | KST 기준 날짜 유틸(`getKSTToday()`, `getKSTDaysAgo()` 등)을 도입하고, 코드 전체의 UTC 날짜 계산 호출 지점을 일괄 교체. `MedicationLog` 데이터 모델은 이미 per-date 분리 구조라 변경 불필요 |
| **Function/UX Effect** | 보호자가 한국 시간 새벽 일찍 앱을 열어도 "오늘"이 올바르게 계산되어 어제 체크가 사라지고 빈 상태로 시작. 과거 기록은 그대로 보존되어 medication adherence 통계 기반 유지 |
| **Core Value** | helppet 핵심 가치인 "정확한 건강관리"의 기본 신뢰도 확보 — "약 챙겨먹었는지"를 매일 정확히 트래킹할 수 있어야 투약·진료 데이터 신뢰성 전체가 살아남 |

---

## 1. Overview

### 1.1 Purpose

`MedicationLog`의 `date` 필드 계산 및 "오늘" 비교 로직을 **KST 기준**으로 통일하여, 사용자 인지의 "오늘"(한국 시간 자정 기준)과 코드의 "오늘"이 항상 일치하도록 만든다.

### 1.2 Background

**Bug Report** (2026-05-14, 사용자):
> "오늘의 투약에서 옛날에 체크해두었던 시간들이 여전히 체크되어있다. 하루에 한 번씩 초기화되어야 한다. 기존 데이터를 지우는 것이 아니라 새로 써야 한다."

**진단 결과**:

| 위치 | 코드 | 기준 |
|------|------|:----:|
| `src/hooks/use-medication-logs.ts:9` | `new Date().toISOString().split('T')[0]` | UTC |
| `src/hooks/use-medication-logs.ts:23` | `new Date().toISOString().split('T')[0]` | UTC |
| `src/hooks/use-health-records.ts:22` | `new Date().toISOString().split('T')[0]` | UTC |
| `src/lib/utils.ts:23` (`getToday`) | `new Date().toISOString().split('T')[0]` | UTC |
| `src/lib/utils.ts:29` (`getDaysAgo`) | `date.toISOString().split('T')[0]` | UTC |
| `src/lib/mock-data.ts:63` (`isoDate`) | `date.toISOString().split('T')[0]` | UTC (시드 freeze 이슈 동반) |
| `src/components/features/condition-report.tsx:23,27` | `cutoff.toISOString().split('T')[0]` | UTC |
| `src/components/features/symptom-frequency.tsx:16` | `cutoff.toISOString().split('T')[0]` | UTC |
| `src/app/(main)/pets/new/page.tsx:49` | `now.toISOString().split('T')[0]` | UTC (birthDate — 정상 영역) |
| `src/app/(main)/pets/[id]/edit/page.tsx:70` | `now.toISOString().split('T')[0]` | UTC (birthDate — 정상 영역) |

**버그 시나리오**:
```
어제 한국 시간 오후 6시 체크
  → new Date().toISOString() = "2026-05-13T09:00:00Z"
  → date 저장값 = "2026-05-13"

오늘 한국 시간 새벽 5시 페이지 열람
  → new Date() = 한국 05:00 = UTC 어제 20:00
  → today 필터값 = "2026-05-13"
  → 어제 체크가 그대로 매칭되어 표시됨 ⚠️
```

### 1.3 Related Documents

- 데이터 모델: `src/types/index.ts` (MedicationLog interface — 변경 없음)
- 영향 받는 훅: `src/hooks/use-medication-logs.ts`, `src/hooks/use-health-records.ts`
- 영향 받는 컴포넌트: `src/components/features/today-medication.tsx`, `condition-report.tsx`, `symptom-frequency.tsx`
- 영향 받는 유틸: `src/lib/utils.ts` (`getToday`, `getDaysAgo`)
- 시드 / mock: `src/lib/mock-data.ts` (`isoDate`, `isoDateTime`)
- 본 사이클 직전 PDCA: `docs/archive/2026-05/pet-disease-display/`

---

## 2. Scope

### 2.1 In Scope

| # | Feature | Priority | Description |
|---|---------|----------|-------------|
| 1 | KST 기준 날짜 유틸 신규/교체 | Must | `getToday()`, `getDaysAgo()`를 KST 기준으로 수정 (또는 새 함수 + alias). `src/lib/utils.ts` |
| 2 | `use-medication-logs.ts` 호출 지점 교체 | Must | 3개 `new Date().toISOString()` 직접 호출을 `getToday()` 유틸 호출로 교체 |
| 3 | `use-health-records.ts` 호출 지점 교체 | Must | 1개 호출 교체 (일관성) |
| 4 | `condition-report.tsx` / `symptom-frequency.tsx` 교체 | Must | cutoff 날짜 계산도 KST 기준으로 (통계 정확도) |
| 5 | `mock-data.ts` `isoDate`/`isoDateTime` KST 기준화 | Must | 시드 데이터의 날짜 계산도 KST로 통일 (시드 freeze 영향 완화) |
| 6 | birthDate 입력 페이지 (pets/new, edit) 검토 | Should | 사용자가 "오늘" 출생일을 입력하는 경우 KST 기준이 맞으므로 교체 권장 |
| 7 | 단위 테스트 또는 수동 검증 시나리오 | Should | KST 자정 직전/직후, KST 새벽 시간 케이스 검증 |
| 8 | 데이터 마이그레이션 | Out | 기존 `MedicationLog.date` 값(UTC 기준)을 KST로 변환할지 — Out of Scope (§2.2 참조) |

### 2.2 Out of Scope

- **기존 데이터 마이그레이션**: 이미 저장된 `MedicationLog.date`(UTC 기준)를 KST로 다시 환산하지 않음. 이유: ① 마이그레이션은 데이터 위험 동반 ② 대부분의 차이가 ±1일 수준이고 보호자가 "어제/오늘"만 신경 쓰면 충분 ③ 새 코드는 신규 데이터를 올바르게 저장하므로 자연 정상화. (사용자가 명시적으로 요구 시 후속 feature `medication-log-tz-migration`으로 분리)
- **타임존 사용자 설정**: 다국가 지원이 아니므로 KST 하드코딩. 추후 글로벌화 시 `Intl.DateTimeFormat`이나 사용자 timezone 필드로 확장
- **자동 일별 초기화 트리거**: "초기화"는 표시 로직(필터)만으로 충분. 별도 cron/이벤트 트리거 도입 안 함
- **`condition-report` / `symptom-frequency` 통계 정확도 검증**: 본 feature는 표시 정확도 회복이 목적. 통계 알고리즘 자체 변경은 별도

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | `getToday()` 유틸이 KST 기준 YYYY-MM-DD를 반환 | High | Pending |
| FR-02 | `getDaysAgo(n)` 유틸이 KST 기준 n일 전 YYYY-MM-DD 반환 | High | Pending |
| FR-03 | `use-medication-logs.ts` 3개 호출이 `getToday()` 사용 | High | Pending |
| FR-04 | `use-health-records.ts` 1개 호출이 `getToday()` 사용 | High | Pending |
| FR-05 | `condition-report.tsx`, `symptom-frequency.tsx`의 cutoff 계산이 KST 기준 | High | Pending |
| FR-06 | `mock-data.ts`의 `isoDate`/`isoDateTime`이 KST 기준 | High | Pending |
| FR-07 | 한국 시간 새벽 5시에 앱을 열어도 "오늘"이 어제와 동일한 날짜를 가리키지 않음 | High | Pending |
| FR-08 | 직접 `new Date().toISOString().split('T')[0]` 호출이 production 코드에서 0건 (mock 시드 함수 제외) | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Backward Compatibility | 기존 `MedicationLog.date` 데이터(UTC 기준)는 그대로 보존 | localStorage 검사 |
| Performance | 날짜 계산 O(1), 매번 새 Date 생성하지 않도록 caching 불필요 (월/일 변경 시점만 호출됨) | DevTools |
| Code Consistency | `getToday()` / `getDaysAgo()` 유틸 단일 진입점 | grep `toISOString().split` |
| Type Safety | KST 헬퍼 시그니처가 기존과 동일 (`string` 반환) | `tsc` |
| Reliability | DST(서머타임) 없는 KST 특성상 단순 +9시간 offset | N/A (KST는 서머타임 없음) |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] `getToday()` / `getDaysAgo()`가 KST 기준 동작 — 단위 검증 (한국 시간 새벽 5시 시뮬레이션)
- [ ] `grep -rn "toISOString().split" src/` 결과: production 코드에서 0건 (mock 시드 내부 함수 제외)
- [ ] 어제 체크한 MedicationLog가 한국 시간 자정 이후 "오늘의 투약"에 표시되지 않음 (수동 검증)
- [ ] 어제 데이터는 localStorage에 그대로 보존됨 (확인: `DB_STORAGE_KEY`에서 어제 date 값 조회)
- [ ] `tsc --noEmit` pass
- [ ] design.md 작성 → gap-detector matchRate ≥ 90%

### 4.2 Quality Criteria

- [ ] KST 변환 로직은 단일 함수로 캡슐화 (DRY)
- [ ] 기존 헬퍼 함수명(`getToday`, `getDaysAgo`)을 유지하여 호출부 변경 최소화 (또는 명시적 이름 `getKSTToday`로 변경 — Design에서 결정)
- [ ] 시드 freeze 이슈는 KST 기준으로 옮기는 것만으로는 완전 해결되지 않음 (별도 영역) → 본 plan에서는 동작 정확성만 보장

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| 기존 UTC 기준 데이터와 새 KST 기준 비교 시 ±1일 mismatch | Medium | High | Out of Scope 명시. 사용자에게 "데이터 정상화는 새 데이터부터" 안내. 마이그레이션은 후속 feature |
| 헬퍼 함수명 그대로 유지 시 의미 모호("getToday이 UTC인지 KST인지") | Low | Medium | JSDoc 주석으로 "KST 기준" 명시 또는 Design에서 새 이름 결정 |
| 다른 곳에서 직접 `toISOString().split` 호출이 남아있어 부분 픽스됨 | High | Medium | FR-08의 grep 검증으로 보장 |
| 시드 freeze로 인한 dev 환경 혼란 | Low | High | Out of Scope. dev 환경 한정 + localStorage 클리어로 해결 가능. README 또는 dev 가이드에 명시 권장 |
| DST 존재 국가로 확장 시 단순 +9 offset 깨짐 | Medium | Low (현재 KST only) | 명시적 단일 timezone 가정 주석 |
| `Intl.DateTimeFormat` 의존 시 일부 브라우저 호환성 | Low | Low | Next.js 14 + 모던 브라우저 가정. 대안: 수동 offset 계산 — Design에서 선택 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Selected |
|-------|:--------:|
| Starter | ☐ |
| **Dynamic** | ✅ |
| Enterprise | ☐ |

### 6.2 Key Architectural Decisions

| Decision | Options | Selected (Plan 수준) | Rationale |
|----------|---------|----------------------|-----------|
| 헬퍼 함수명 | `getToday` 유지 / `getKSTToday` 신규 / 둘 다 | **Design에서 확정** | 호출부 변경 최소화 vs 명시성 trade-off |
| KST 계산 방식 | `Intl.DateTimeFormat('en-CA', {tz: 'Asia/Seoul'})` / 수동 `+9h` offset | **Design에서 확정** | Intl은 명시적 & DST-safe, 수동은 단순 |
| 데이터 마이그레이션 | 없음 / 일회성 변환 스크립트 / 점진적 | **없음** (Out of Scope) | 위험 회피 + 자연 정상화 |
| 시드 freeze 처리 | KST 기준 + 매번 새로 빌드 / KST만 변경 / 둘 다 무시 | **KST만 변경** | dev 한정 이슈, production 영향 없음 |
| `useTodayMedicationLogs` 캐시 정책 | `today` 키 갱신 시 stale 처리 / 수동 invalidate | **today 키만 변경** (이미 queryKey에 포함) | 기존 TanStack Query 동작 활용 |

### 6.3 Clean Architecture Approach

```
Selected Level: Dynamic

영향 받는 파일:
src/
  lib/
    utils.ts                              ← 수정 (getToday, getDaysAgo)
    mock-data.ts                          ← 수정 (isoDate, isoDateTime — mock 한정)
  hooks/
    use-medication-logs.ts                ← 수정 (3 호출 지점)
    use-health-records.ts                 ← 수정 (1 호출 지점)
  components/features/
    condition-report.tsx                  ← 수정 (cutoff 계산 2건)
    symptom-frequency.tsx                 ← 수정 (cutoff 계산 1건)
  app/(main)/pets/
    new/page.tsx                          ← 검토 (birthDate)
    [id]/edit/page.tsx                    ← 검토 (birthDate)

변경 없음:
src/types/index.ts                        ← MedicationLog 타입 유지
src/components/features/today-medication.tsx ← 표시 로직 변경 없음
```

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [x] CLAUDE.md: 한국어 UI / 영문 코드
- [x] TypeScript, eslint, prettier
- [x] 유틸 단일 진입점 패턴 (`src/lib/utils.ts`)

### 7.2 Conventions to Define/Verify

| Category | Current | To Define | Priority |
|----------|---------|-----------|:--------:|
| Timezone 정책 | 암묵적 UTC | **명시적 KST (한국 단일 시장)** | High |
| 헬퍼 명명 | `getToday`, `getDaysAgo` | `getToday` 유지 (KST 의미 변경) vs `getKSTToday` 신규 | Design에서 확정 |
| JSDoc | 미작성 | `getToday`에 "KST 기준" 명시 주석 추가 | Medium |

### 7.3 Environment Variables

변경 없음.

### 7.4 Pipeline Integration

N/A (코드 레벨 변경, 인프라 영향 없음).

---

## 8. Next Steps

1. [ ] `/pdca design medication-daily-reset` — Design 문서:
   - KST 변환 방식 확정 (Intl vs 수동 offset)
   - 헬퍼 명명 확정
   - 각 호출 지점의 before/after 명시
   - 검증 시나리오 시간 시뮬레이션 방법 명시
2. [ ] `/pdca do medication-daily-reset` — 구현 (예상 0.5일 — 유틸 + 6~8 호출부 교체)
3. [ ] `/pdca analyze medication-daily-reset` — gap-detector
4. [ ] (필요 시) `/pdca iterate medication-daily-reset`
5. [ ] `/pdca report medication-daily-reset`
6. [ ] (후속) `medication-log-tz-migration` (기존 데이터 변환, 사용자 요청 시)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-05-14 | Initial draft from bug report. UTC→KST 전환 범위 매핑 | aejeong |
