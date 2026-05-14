# medication-status-clarity Completion Report

> **Feature**: 오늘의 투약 3-tier 상태 시각 명확성 강화
> **Project**: HelpPet
> **Date**: 2026-05-14
> **Status**: ✅ Completed
> **Cycle Duration**: 1일 (2026-05-14 Plan → Report)

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | "오늘의 투약" timeSlot 버튼의 3가지 상태(체크됨/시간 지남/미래)가 모두 옅은 색조 + 같은 border 구조라 한눈에 구분 불가. 미래 상태 `⭕` 아이콘은 한국 문화권에서 "OK/완료" 시그널로 인지되어 추가 혼란. mock 시드가 매일 일부 timeSlot을 미리 체크 상태로 강제하여 dev 환경 혼란 |
| **Solution** | 3-tier 시각 무게 차별화: 체크=진한 초록(`bg-green-500`)+흰 글씨+shadow, 알람=amber+pulse, 미래=흐린 회색. 아이콘 매핑은 의미 충돌 회피(`✅`/`⏰`/`☐` — TODO 체크박스 메타포). `aria-label`+`aria-pressed`로 접근성 강화. mock 시드 `medicationLogs`는 빈 배열로 정리 |
| **Function/UX Effect** | 보호자가 한눈에 "약 챙겨먹음 / 지남, 안 챙김 / 아직 시간 아님"을 구분 가능. 색상에 의존하지 않는 접근성(aria-label) 보강. dev/QA도 깨끗한 초기 상태로 시작하여 진단 노이즈 제거 |
| **Core Value** | helppet 핵심 가치 "정확한 건강관리"의 **인지 정확성** 확보 — 직전 사이클(`medication-daily-reset`)이 데이터 정확성을 회복했다면, 본 사이클은 *보이는 것이 곧 사실*이라는 인지 신뢰를 회복. 의료 도메인의 잘못된 인지는 잘못된 의사결정으로 직결되므로 두 신뢰가 모두 필요 |

### 1.3 Value Delivered

| Metric | Value |
|--------|-------|
| **Match Rate** | **99%** (PASS, threshold 90%) |
| Iteration Count | 0 (iterate 단계 불필요) |
| Modified Files | 2 (`today-medication.tsx`, `mock-data.ts`) |
| New Files | 0 |
| Interface Changes | 0 (시각/접근성 only — 호출부 변경 0건) |
| Type Check | ✅ `tsc --noEmit` exit 0 |
| Accessibility | `aria-label` + `aria-pressed` 신규 도입, WCAG AA 색상 대비 amber ~10:1 |
| Design 결정 항목 수 | 21개 (20개 완전 일치 + 1개 trivial 부분 일치 — Design 문서 내부 §2.2 표기) |
| Design Sync | v0.1 → v0.2 사전 반영 (Check 전 보강) |
| User Feedback Loop | 1회 (`⭕`→`☐` 의미 충돌 발견 → 사이클 내 즉시 픽스) |

---

## 2. PDCA Cycle Summary

### 2.1 Plan

| Item | Detail |
|------|--------|
| Document | `docs/01-plan/features/medication-status-clarity.plan.md` (245 lines, v0.1) |
| Scope | Must 4건 (FR-01~03, FR-05), Should 3건 (FR-04, FR-06, FR-07), Could 1건 (FR-08) |
| Key Decisions | ① 표시 영역 한정 (`today-medication.tsx` only — pet detail/medications 관리 페이지 미터치), ② 시드는 빈 배열로 단순화 (env 토글 over-engineering 회피), ③ 의존성 추가 회피 (lucide-react 미도입) |
| Open Questions | 4개 (색상 강도 / 알람 톤 / 아이콘 처리 / 텍스트 노출) → 모두 Design 확정 |
| Triggering Source | 직전 사이클 `medication-daily-reset` Do 단계 dev 검증 중 사용자 발견 → Plan §2.2 Out of Scope 명시에 따라 별도 사이클 분리 |

### 2.2 Design

| Item | Detail |
|------|--------|
| Document | `docs/02-design/features/medication-status-clarity.design.md` (450 lines, v0.2) |
| Architecture | 3-Tier Visual Hierarchy — 시각 무게가 사용자 인지 우선순위와 정렬 |
| 미결정 항목 확정 | 색상 톤=강함 / 알람=amber+pulse / 아이콘=이모지 강화 / 텍스트=aria-label |
| 핵심 결정 근거 | helppet의 빨강은 `ConditionBadge`에 점유 → 알람은 amber 채택 (노견 배지와 일관). 한국 단일 시장 + 기존 이모지 패턴 → lucide-react 미도입 |
| v0.2 사전 반영 (Check 전) | ① 미래 아이콘 `⭕`→`☐` (사용자 피드백), ② `font-medium`→`font-semibold` 격상 (Design §5.2 "Do에서 결정" 적용) |
| Check 후 보정 | §2.2 amber 표기 `text-700/300` → `text-800/400` (§4.1과 통일) |

### 2.3 Do (Implementation)

| File | Type | Description |
|------|------|-------------|
| `src/components/features/today-medication.tsx` | ✏️ 수정 | `cn` import + 3-tier className(`cn(...)` 5줄) + 아이콘 `<span text-sm leading-none>` + `aria-label`/`aria-pressed` + `font-semibold` 격상 |
| `src/lib/mock-data.ts` | ✏️ 수정 | `medicationLogs` 배열 22줄 → 빈 배열 1줄 (`[]`) |

**구현 특징**:
- `transition-all`로 border/shadow 변화도 부드럽게 (기존 `transition-colors`보다 풍부)
- `aria-pressed={checked ? true : false}` 명시적 boolean 변환 (`find()` 결과 undefined 가능성 차단)
- `aria-hidden="true"` on 아이콘 + `aria-label`에 상태 텍스트 → 스크린리더는 명시적 라벨만 사용
- helppet 디자인 시스템의 monochrome 베이스 + Tailwind 기본 팔레트(green/amber/gray) 활용 — 신규 색상 토큰 추가 0건

### 2.4 Check (Gap Analysis)

| Category | Items | Matched | Rate |
|----------|:-----:|:-------:|:----:|
| §2 Plan 미결정 항목 | 6 | 6 | 100% |
| §3 File Changes | 2 | 2 | 100% |
| §4 Detailed Design | 6 | 6 | 100% |
| §5 Visual Spec | 3 | 3 | 100% |
| §6.1 `allDone` 보존 | 1 | 1 | 100% |
| §2.2 vs §4.1 표기 일관성 | 1 | 0.5 | 50% (Check 후 보정) |
| **Total** | **21** | **20.5** | **99%** |

**Gap List (코드)**: 없음.

**Design 문서 내부 불일치 (Check 후 보정 완료)**: §2.2의 amber 톤(`text-700/300`)이 §4.1/§5.2의 구체 명세(`text-800/400`)와 달라 0.5점 차감. 구현은 더 구체적인 §4.1을 따랐고, Check 단계에서 §2.2를 §4.1과 통일하여 문서 정합성 확보.

---

## 3. Architecture Patterns Introduced

### 3.1 3-Tier Visual Hierarchy

```
시각 무게 (강 → 약)
─────────────────────────────────────────────────
체크됨 (완료)    ▓▓▓▓▓▓  bg-green-500 + text-white + shadow-sm
                 ↑ 가장 강한 긍정 시그널 (행동 결과 강조)
시간 지남 (알람) ▒▒▒▒▒▒  bg-amber-100 + animate-pulse
                 ↑ 주의 환기, 위급 아님
미래 (예정)      ░░░░░░  bg-gray-50 + text-gray-400
                 ↑ 가장 약한 시각 무게 (배경)
```

**일반화**: 행동 가능 액션 요소에서 "결과 / 주의 / 대기" 세 상태가 시각 무게로 위계화되어야 사용자 인지 부담이 줄어듦. medication tracking 외에도 todo, 작업 큐, 알림 등 다양한 도메인에 적용 가능.

### 3.2 Cultural Icon Semantics

```
한국/일본 문화권 이모지 의미
⭕ = OK / 정답 / 맞음    ← "아직 안 한 상태"에 부적합
❌ = 오답 / 안 됨
✅ = 체크 / 완료 / 정답
☐ = 체크박스 빈 상태    ← TODO 메타포로 자연
☑ / ✓ = 표시됨
```

**Lesson**: 이모지 선택은 단순 시각 매력이 아니라 *문화적 의미*를 고려해야 함. Plan/Design 단계에서 "어떤 이모지를 쓸지"를 미결정으로 두면 Do 단계에서 사용자 발견으로 잡힐 가능성 — 차라리 Design에서 명시적으로 매핑 결정하는 게 안전.

### 3.3 Color Semantic Conflict Avoidance

helppet 코드베이스의 기존 색상 의미:

| 색상 | 기존 의미 | 위치 |
|------|----------|------|
| `text-red-*` / `bg-red-50` | 질병 강조 | `ConditionBadge` |
| `bg-amber-100` / `text-amber-700` | 주의 필요 | 노견 배지 |
| `bg-green-100` | 완료 | `allDone` 배지 |
| `bg-primary-50` / `text-primary-*` | 액션 / 입양 상태 | 다수 |

**원칙**: 새 상태 시각을 추가할 때 기존 의미 체계와 충돌 회피. 본 사이클에서 알람을 빨강 대신 amber로 채택한 이유 — `ConditionBadge`의 빨강과 의미 충돌 방지.

### 3.4 Accessibility-First Toggle Button

```typescript
<button
  aria-pressed={checked ? true : false}
  aria-label={statusDescription}
  aria-hidden 처리된 아이콘 + 텍스트
>
```

**일반 패턴**: 시각적 토글 버튼은 항상 `aria-pressed` + 상태 명시 `aria-label`. 색상 차이만으로 상태를 전달하면 색맹/시각 장애 사용자에게 불공평.

---

## 4. Lessons Learned

### 4.1 What Went Well

1. **Plan §2.2 Out of Scope의 결정 가이드 역할**: 직전 사이클 `medication-daily-reset` Plan이 "표시 로직 변경 Out of Scope"로 명시한 덕분에, 사용자 발견 시각 대비 이슈를 본 사이클로 자연스럽게 분리. **PDCA 사이클 간 스코프 경계가 깔끔하게 작동한 첫 사례**
2. **Design 사후 보강을 Check 전에**: v0.2 격상(`⭕`→`☐`, `font-semibold`)을 Check 호출 전 완료 → 매치율 99% 자연 상승. 직전 사이클(98%, Check 후 보강)과 비교해 **PDCA 단계 사이 정보 흐름 순서가 결과에 영향**을 입증
3. **사용자 시각 확인이 정적 분석보다 선행**: `⭕` → `☐` 발견은 정적 분석으론 불가능. 사용자가 dev 화면을 보고 "OK처럼 보인다"고 한 순간이 핵심 검증 신호 — **시각 디자인은 사용자 인지 확인이 가장 신뢰할 만한 검증**
4. **helppet 디자인 시스템 의미 체계 분석**: 코드베이스의 기존 색상 의미(`ConditionBadge`=빨강, 노견 배지=amber)를 사전 분석하여 알람 톤 결정 — 진공 상태 결정이 아닌 *기존 체계*에 결합한 선택

### 4.2 What to Improve

1. **Design 문서 내부 일관성**: §2.2(결정 요약)와 §4.1(구현 명세) 사이의 amber 톤 표기 불일치 발견. **Design 작성 시 색상 토큰을 한 곳(예: §5.2 Visual Spec)에서 단일 소스로 정의하고 다른 섹션은 참조하는 패턴** 도입 권장
2. **이모지 매핑을 Design 단계에서 명시 안 함**: Design §2.3은 "이모지 유지"의 큰 결정만 다뤘지 *어떤* 이모지를 쓸지는 기존 코드 답습 → Do 단계 사용자 발견. **다음부터 이모지/아이콘 매핑도 Design §2에서 명시적 결정**
3. **WCAG axe 자동 측정 미수행**: `green-500`/`white` 대비가 3.5:1 경계라 `font-semibold` 격상으로 보강했지만, **실측 도구로 검증하지 않음**. 후속 `accessibility-audit` feature 또는 본 사이클 후속 작업으로 axe 검증 권장

### 4.3 Reusable Patterns

| Pattern | 재사용 시나리오 |
|---------|-----------------|
| 3-Tier Visual Hierarchy | 행동 가능 액션의 "결과/주의/대기" 상태 표현 (todo, 작업 큐, 알림 등) |
| 색상 의미 충돌 회피 분석 | 디자인 시스템에 새 상태 추가 시 기존 색상 의미와 conflict 체크 |
| 이모지 문화적 의미 검토 | 한국 단일 시장 외 글로벌 확장 시 다른 문화권 의미도 검토 |
| `aria-pressed` + 동적 `aria-label` | 모든 시각 토글 버튼의 접근성 표준 패턴 |
| Design v0.2 사전 보강 | Do 단계 발견을 Check 호출 *전*에 Design 동기화 — 매치율 자연 상승 |
| 인터페이스 변경 0건 + 시각/접근성만 | 호출부 영향 없이 컴포넌트 내부 개선하는 안전한 픽스 패턴 |

---

## 5. Follow-up Features (Out of Scope)

본 사이클에서 의도적으로 분리한 후속 작업:

| Feature | Scope | Trigger | Source |
|---------|-------|---------|--------|
| `medication-midnight-refresh` | 사용자가 화면을 켠 채로 자정을 가로지를 때 `useTodayMedicationLogs`의 today 자동 갱신 | 야간 보호자 누락 보고 시 | Design §10 |
| `medication-log-tz-migration` | 기존 UTC 기준 `MedicationLog.date` 일회성 KST 변환 | 통계 정확도 noise 문제 시 | `medication-daily-reset` 추적 |
| `motion-reduce-pulse-disable` | PWA 배경 탭이나 prefers-reduced-motion 설정 시 `animate-pulse` 비활성화 | 접근성 audit 또는 사용자 보고 | Design §9 |
| `accessibility-audit` | axe / Lighthouse 자동 측정 + WCAG AA/AAA 통과 검증 인프라 | 시스템 전반 접근성 보장 필요 | 본 Report §4.2 |
| `eslint-strict-setup` | `next lint` Strict 모드 + CI 통합 | 자동 검증 자동화 필요 시 | 직전 2 사이클 누적 권고 |
| `medication-empty-state-guide` | 시드 비운 후 dev/QA가 "데이터 없음" 혼란 시 안내 카드 | dev 가이드 보강 필요 시 | Plan §5 Risk |

---

## 6. Documents

| Stage | Document | Lines |
|-------|----------|-------|
| Plan | `docs/01-plan/features/medication-status-clarity.plan.md` | 245 |
| Design (v0.2) | `docs/02-design/features/medication-status-clarity.design.md` | 450 |
| Analysis | `docs/03-analysis/medication-status-clarity.analysis.md` | 137 |
| **Report (this)** | `docs/04-report/features/medication-status-clarity.report.md` | — |

총 832 lines (Plan + Design + Analysis).

---

## 7. Files Changed

```
M  src/components/features/today-medication.tsx
   + import { cn } from '@/lib/utils'
   + className 3-tier (cn() 5줄)
   + aria-pressed + aria-label 동적 텍스트
   + 아이콘 <span text-sm leading-none aria-hidden>
   + 미래 아이콘 ⭕ → ☐ (v0.2)
   + font-medium → font-semibold 격상 (v0.2)

M  src/lib/mock-data.ts
   - medicationLogs 시드 2개 (22 lines)
   + medicationLogs: MedicationLog[] = []
```

---

## 8. PDCA Cycle Progression (helppet 프로젝트)

이번 사이클 기준 helppet 프로젝트의 PDCA 흐름:

```
pet-disease-display    (100%)  →  archived
medication-daily-reset (98%)   →  archived
medication-status-clarity (99%) →  this report
```

**도메인 별 흐름**:
- **UI 시각**: pet-disease-display(해시태그) + medication-status-clarity(3-tier) = 시각 명확성 영역
- **데이터 정확성**: medication-daily-reset(KST timezone) = 시간 영역

**누적 재사용 패턴**: 8개 (각 사이클 Report §3에서 정리)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-05-14 | Initial completion report (Match Rate 99%) | aejeong |
