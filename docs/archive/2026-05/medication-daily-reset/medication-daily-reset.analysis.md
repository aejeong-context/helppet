# medication-daily-reset Analysis Report

> **Project**: HelpPet
> **Feature**: medication-daily-reset
> **Date**: 2026-05-14
> **Author**: gap-detector (agent) / aejeong
> **Match Rate**: **98%**
> **Status**: ✅ Pass (≥90%)
> **Plan Reference**: `docs/01-plan/features/medication-daily-reset.plan.md`
> **Design Reference**: `docs/02-design/features/medication-daily-reset.design.md`

---

## 1. Summary

| 지표 | 값 |
|------|----|
| 총 분석 항목 수 | 22 |
| 완전 일치 | 21 |
| 부분 일치 (0.5점) | 1 (trivial — `getDaysAgo` 인라인 작성 스타일 차이) |
| 불일치/누락 | 0 |
| 의도된 확장 (채점 제외) | 1 (`getYearsAgo` 헬퍼 신규) |
| Match Rate | **97.7% ≈ 98%** |
| 다음 단계 권장 | Report (`/pdca report medication-daily-reset`) |

---

## 2. Detailed Matching

### §2 Plan 미결정 항목 확정 (5개)

| Design 항목 | 코드 위치 | 일치 | 비고 |
|---|---|:---:|---|
| §2.1 헬퍼 명명 (`getToday`/`getDaysAgo` 유지) | `utils.ts:36,44` | ✅ | 시그니처 보존 |
| §2.2 `Intl.DateTimeFormat('en-CA', 'Asia/Seoul')` | `utils.ts:26-31` | ✅ | 4 옵션 모두 일치 |
| §2.3 grep `toISOString().split` 0건 | `src/` 전체 | ✅ (초과 달성) | utils/mock 포함 전체 0건 |
| §2.4 birthDate 헬퍼 사용 | `pets/new:48`, `pets/[id]/edit:69` | ✅ (의도된 확장) | `getYearsAgo()` 사용 — §4 별도 처리 |
| §2.5 `takenAt` UTC ISO instant 유지 | `use-medication-logs.ts:25` | ✅ | |

### §3 File Changes (8개 수정 파일)

| Design 항목 | 코드 위치 | 일치 |
|---|---|:---:|
| `lib/utils.ts` KST 헬퍼 | line 22-57 | ✅ |
| `use-medication-logs.ts` 3 호출 | line 5,10,24 | ✅ |
| `use-health-records.ts` 1 호출 | line 5,23 | ✅ |
| `condition-report.tsx` 단순화 | line 5,20,21 | ✅ |
| `symptom-frequency.tsx` 단순화 | line 5,15 | ✅ |
| `mock-data.ts` 재정의 | line 60-79 | ✅ |
| `pets/new/page.tsx` | line 48 | ✅ |
| `pets/[id]/edit/page.tsx` | line 69 | ✅ |

### §4 Detailed Design (구현 매칭)

| Design 항목 | 코드 위치 | 일치 | 비고 |
|---|---|:---:|---|
| §4.1 `KST_FORMATTER` 정의 | `utils.ts:26-31` | ✅ | |
| §4.1 `getToday()` 시그니처+JSDoc+구현 | `utils.ts:33-38` | ✅ | |
| §4.1 `getDaysAgo()` 구현 | `utils.ts:40-48` | 🟡 0.5 | `const todayStr` 분해 후 vs `getToday().split('-')` 인라인 — 의미 동등 |
| §4.2 `use-medication-logs.ts` before/after | line 9-26 | ✅ | |
| §4.3 `use-health-records.ts` before/after | line 22-23 | ✅ | |
| §4.4 `condition-report.tsx` 단순화 | line 18-21 | ✅ | 5→3줄 |
| §4.5 `symptom-frequency.tsx` 단순화 | line 14-15 | ✅ | 4→1줄 |
| §4.6 `MOCK_KST_FORMATTER` 자체 정의 | mock-data.ts:60-65 | ✅ | DRY 회피 의도 |
| §4.6 `isoDate` KST 재구현 | mock-data.ts:67-72 | ✅ | |
| §4.6 `isoDateTime` KST 재구현 (`hour-9`) | mock-data.ts:74-79 | ✅ | KST→UTC 변환 정확 |

### §5 Verification Strategy

| Design 항목 | 결과 | 일치 |
|---|---|:---:|
| §5.1 `tsc --noEmit` | exit 0 | ✅ |
| §5.2 grep production 0건 | 전체 0건 (초과 달성) | ✅ |

### §7 Implementation Order (9 steps)

| Step | 상태 |
|---|:----:|
| 1-8 (코드 구현 + 검증) | ✅ 완료 |
| 9 (localStorage/dev server 시각 검증) | N/A (런타임 — 사용자 수행) |

---

## 3. Gap List

**없음.** Production 코드에서 `toISOString().split` 호출이 완전히 제거되었으며 (utils/mock 포함 전체 0건), 모든 매핑이 design과 일치.

### 3.1 Trivial 차이 (0.5점 차감)

**위치**: `src/lib/utils.ts:44-48`

- Design 본문: `const todayStr = getToday(); const [y,m,d] = todayStr.split('-').map(Number);` (2줄)
- 실제 코드: `const [y, m, d] = getToday().split('-').map(Number);` (1줄 인라인)
- 의미 동등, 가독성 trivial 차이 — 0.5점만 차감

---

## 4. Intentional Extension (Design 보강 권장)

### `getYearsAgo(years: number)` 헬퍼 신규 추가

**위치**: `src/lib/utils.ts:54-57`

```typescript
export function getYearsAgo(years: number): string {
  const [y, m, d] = getToday().split('-').map(Number);
  return `${y - years}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
```

**컨텍스트**:
- Design §2.4/§4.7은 `pets/new`/`pets/[id]/edit`의 birthDate fallback을 `getToday()`로 교체하라고 명시
- 실제 구현 코드를 확인한 결과, 해당 위치의 원래 계산은 "오늘"이 아니라 "예상 나이 N년 전" 의미 (`now.setFullYear(getFullYear() - estimatedAge)`)
- 단순히 `getToday()`로 바꾸면 의미가 깨짐 → 의미 보존을 위해 `getYearsAgo(years)` 헬퍼를 신규 추가하고 두 페이지 모두 이를 사용

**Design 보강 권장 사항** (Report 작성 시 또는 즉시):
1. §2.4 birthDate 결정에 "estimatedAge 케이스는 `getYearsAgo()` 별도 헬퍼로 처리" 명시
2. §3.2 File Changes 테이블에 `utils.ts` 변경 내용 보강
3. §4.1에 `getYearsAgo` 시그니처 + JSDoc 추가
4. §4.7 before/after를 `getYearsAgo()` 패턴으로 수정
5. §9 Type Contract에 `getYearsAgo` 추가

---

## 5. Non-Verifiable Items (정적 분석 한계)

다음 항목은 정적 분석으로 검증 불가능 — **수동/런타임 검증 필요**:

- [ ] 한국 시간 00:00 ~ 08:59 사이 페이지 열어 어제 데이터 안 보임 확인 (timezone 경계 직접 재현)
- [ ] `localStorage.removeItem('helppet.mock.db.v1')` 후 새 시드가 KST 기준으로 생성되는지
- [ ] dashboard "오늘의 투약" 영역 시각 동작

본 사이클 시점(2026-05-14)에서는 timezone 경계 직접 재현이 어려워 코드 신뢰 + DevTools Console 검증으로 갈음.

---

## 6. Conclusion & Recommendations

### 결론

`medication-daily-reset` feature는 **Match Rate 98%** 로 PDCA Check 단계를 통과. Design 문서의 모든 결정 사항(헬퍼 명명, KST 계산 방식, grep strictness, takenAt 정책)이 코드에 정확히 반영되었으며, 9개 호출 지점이 모두 헬퍼 호출로 교체됨. Production 코드에서 `toISOString().split` 패턴이 0건으로 완전히 제거되어 design 기대치(utils/mock 제외 0건)를 초과 달성.

`mock-data.ts`의 `MOCK_KST_FORMATTER` 자체 정의(DRY 회피) 결정도 design §4.6 명시 권고대로 적용. KST→UTC 변환 (`hour - 9`)도 정확.

### 다음 단계 권장

1. **Design 보강** (선택): `getYearsAgo` 헬퍼를 Design 문서에 반영하여 implementation과 동기화 (후속 사이클 혼란 방지)
2. **Report 단계 진행**: `/pdca report medication-daily-reset`
3. **후속 feature 분리 확인**:
   - `medication-midnight-refresh` (자정 가로지를 때 화면 자동 갱신)
   - `medication-log-tz-migration` (기존 UTC 데이터 변환, 사용자 요청 시)
   - `medication-status-clarity` (Do 단계에서 발견된 시각 대비 UX 이슈 — 별도 사이클)
4. **localStorage 클리어 안내**: dev 검증 가이드를 팀에 공유

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-05-14 | gap-detector 자동 분석 결과 (Match Rate 98%) | gap-detector (agent) |
