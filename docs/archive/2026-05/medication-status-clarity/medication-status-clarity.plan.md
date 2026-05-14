# medication-status-clarity Planning Document

> **Summary**: "오늘의 투약" 카드의 체크됨/시간 지남/미래 3가지 상태를 한눈에 구분 가능하도록 시각 대비 강화 + mock 시드의 미리 체크된 데이터 정리
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
| **Problem** | "오늘의 투약" timeSlot 버튼의 세 상태(체크됨/시간 지남/미래)가 시각적으로 구분이 어려움. 체크됨(`bg-green-100`)과 알람(`bg-red-50`)이 둘 다 옅은 색조 + 작은 아이콘 + 같은 border 구조라 사용자가 "약 먹었는지 vs 안 먹었는데 시간 지남"을 즉시 분간 못 함. 의료 도메인에 부족한 시각 명확성 |
| **Solution** | 세 상태의 시각 무게를 차별화: 체크됨은 진한 초록 + 명확한 ✓ 표시, 알람은 강조 빨강 + 깜박임 또는 진한 톤, 미래는 약화된 회색. 추가로 mock 시드(`medlog-bori-morning`, `medlog-maru-morning`)의 미리 체크된 데이터를 dev 환경 명확성을 위해 정리 |
| **Function/UX Effect** | 보호자가 한눈에 "이 약은 챙겨먹었음" / "지났는데 안 먹임 — 알림 필요" / "아직 시간 아님" 세 상태를 구분. medication adherence 트래킹 UX 정확도 향상. dev/QA에서도 깨끗한 초기 상태로 시작 |
| **Core Value** | helppet 핵심 가치 "정확한 건강관리" — 데이터 정확성(직전 사이클)뿐 아니라 **인지 정확성**까지 보장. 의료 도메인에서 잘못된 인지는 잘못된 의사결정으로 직결되므로, "보이는 것이 곧 사실"이라는 신뢰 회복 |

---

## 1. Overview

### 1.1 Purpose

`TodayMedication` 컴포넌트의 timeSlot 버튼 시각 디자인을 재설계하여, 세 상태를 한눈에 구분할 수 있게 만든다. 동시에 dev 환경의 mock 시드 혼란을 정리.

### 1.2 Background

**Bug Report 발견 경로** (2026-05-14, `medication-daily-reset` Do 단계 dev 검증 중):

> 사용자: "시간이 지난건 체크가 되어있어. 이건 시간이 지나서 체크된게 아니지?"
>
> 사용자: (확인 질문 후) "둘 다 있어 / 구분 애매해"

**진단 결과**:

1. **시각 대비 약함** (`src/components/features/today-medication.tsx:64-70`):
   ```typescript
   className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
     checked
       ? 'bg-green-100 text-green-700 border border-green-200'   // 체크됨
       : isPast
         ? 'bg-red-50 text-red-400 border border-red-200'        // 시간 지남 알람
         : 'bg-gray-50 text-gray-500 border border-gray-200'     // 미래
   }`}
   ```
   - 체크됨/알람 모두 "옅은 색조 + 같은 border 두께 + 같은 padding" 구조
   - 아이콘(`✅`/`⏰`/`⭕`)이 작아서 인지 어려움

2. **mock 시드의 미리 체크 데이터** (`src/lib/mock-data.ts:495-516`):
   - `medlog-bori-morning`: 보리 심장약 08:00, `date: isoDate(0)` (항상 오늘)
   - `medlog-maru-morning`: 마루 신장약 09:00, `date: isoDate(0)` (항상 오늘)
   - dev 환경에서 페이지 열면 매번 이 두 항목이 미리 체크된 상태 — 사용자가 "내가 체크 안 했는데 왜 체크돼 있지?" 혼란

**사용자 메타-피드백**:
- 직전 `medication-daily-reset` 사이클에서 두 가지 다른 원인(timezone 버그 + 시각 대비)이 같은 화면 혼란으로 보고됨
- timezone 버그는 해당 사이클에서 픽스 완료
- 시각 대비/시드 정리는 본 사이클(`medication-status-clarity`)로 분리

### 1.3 Related Documents

- 직전 사이클: `docs/archive/2026-05/medication-daily-reset/` (Plan §2.2 Out of Scope에서 본 feature 분리 명시)
- 대상 컴포넌트: `src/components/features/today-medication.tsx`
- mock 시드: `src/lib/mock-data.ts:495-516` (`medicationLogs` 배열)
- 호출 페이지: `src/app/(main)/dashboard/page.tsx:73`
- 직전 사이클 `pet-disease-display`: read/write 컴포넌트 분리 패턴 참조

---

## 2. Scope

### 2.1 In Scope

| # | Feature | Priority | Description |
|---|---------|----------|-------------|
| 1 | 체크됨 상태 시각 강화 | Must | 진한 초록 배경(`bg-green-500` 또는 `bg-green-600`) + 흰 글씨 + 굵은 ✓ 표시. 한눈에 "완료"가 읽힘 |
| 2 | 시간 지남(알람) 상태 시각 강화 | Must | 진한 빨강 또는 강조 톤(`bg-red-100`/`border-red-400`/`text-red-700`) + 깜박임(pulse) 옵션. "주의 필요" 신호 강화 |
| 3 | 미래 상태 약화 | Should | 더 흐린 회색(`bg-gray-50`/`text-gray-400`) + 옅은 border. 시각 우선순위 낮춤 |
| 4 | 아이콘 크기/가독성 강화 | Should | `✅`/`⏰`/`⭕` 아이콘 크기 키우거나 SVG 아이콘으로 교체 (선택) |
| 5 | mock 시드 미리 체크 데이터 정리 | Must | `medicationLogs` 시드를 빈 배열로 변경 (사용자가 직접 체크하는 깨끗한 초기 상태) |
| 6 | 상태 레이블 텍스트 (선택) | Could | 버튼에 "완료"/"지남"/"예정" 텍스트 노출 — 아이콘과 함께 또는 hover tooltip |
| 7 | 접근성: aria-label 명시 | Should | 각 버튼에 "08:00 약 — 완료" / "08:00 약 — 시간 지남, 안 챙김" 등 스크린리더 친화 텍스트 |
| 8 | 다크 모드 대응 (있다면 검토) | Could | 색상 변경이 다크 모드에서도 유효한지 확인 |

### 2.2 Out of Scope

- **자정 자동 새로고침**: `useTodayMedicationLogs`의 today 캐시가 자정에 자동 invalidate되도록 만들기는 별도 feature `medication-midnight-refresh`로 분리
- **체크 토글 동작 변경**: 클릭/탭으로 체크/언체크 토글하는 기본 동작은 유지
- **MedicationLog 데이터 모델 변경**: 시드 정리만 하고 스키마/타입 변경 없음
- **다른 페이지의 medication 표시**: pet detail, medications 관리 페이지 등은 본 사이클 범위 외 (시각 대비 강화는 today-medication에 한정)
- **시드를 dev 모드 토글로 처리**: 단순히 빈 배열로. 환경 변수 기반 토글은 over-engineering
- **알람 사운드/푸시 알림**: 시간 지남 알람을 시스템 알림으로 보내는 기능은 별도

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 체크됨 timeSlot 버튼은 진한 초록 배경 + 흰 글씨로 표시 | High | Pending |
| FR-02 | 시간 지남 미체크 timeSlot 버튼은 강조 빨강(border 두껍거나 톤 진하게)으로 표시 | High | Pending |
| FR-03 | 미래 timeSlot 버튼은 약화된 회색으로 표시 (시각 우선순위 낮음) | High | Pending |
| FR-04 | 세 상태 간 색상/명도 대비가 WCAG AA 이상 (대략 contrast ratio 4.5:1+) | Medium | Pending |
| FR-05 | mock 시드의 `medicationLogs` 배열이 빈 배열로 시작 | High | Pending |
| FR-06 | 각 timeSlot 버튼에 `aria-label`로 약 이름 + 시간 + 상태 명시 | Medium | Pending |
| FR-07 | 아이콘이 한눈에 보일 만큼 충분히 크고 또렷 (체크/시계/원 구분) | Medium | Pending |
| FR-08 | hover/focus 상태에서 시각 강화 (border accent 등) | Low | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement |
|----------|----------|-------------|
| Accessibility | WCAG AA 색상 대비 + 스크린리더 정상 | axe DevTools |
| 모바일 우선 | 360px viewport에서 timeSlots 줄바꿈 자연 | 수동 확인 |
| 일관성 | helppet warm/rose 팔레트 우선 사용, 추가 토큰 최소 | UI 리뷰 |
| 회귀 방지 | 다른 medication 관련 페이지(MedicationCard 등)에 영향 없음 | grep + 수동 |
| 성능 | 추가 fetch 없음, 순수 className 변경 | DevTools |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] 체크됨/지남/미래 세 상태가 시각적으로 즉시 구분됨 (수동 검증)
- [ ] mock 시드 `medicationLogs`가 빈 배열로 변경되어 dev 첫 진입 시 모든 timeSlot이 미체크 상태
- [ ] WCAG AA 대비 통과 (DevTools 또는 axe로 확인)
- [ ] `tsc --noEmit` pass
- [ ] design.md 작성 → gap-detector matchRate ≥ 90%
- [ ] 다른 medication 표시 영역(MedicationCard, medications 관리)에 회귀 없음

### 4.2 Quality Criteria

- [ ] 색상 변경은 Tailwind 기본 팔레트 또는 helppet warm/rose 토큰만 사용 (신규 토큰 추가 최소화)
- [ ] 컴포넌트는 여전히 atom 수준의 단순 표현 — 상태 결정 로직은 호출부(props) 유지
- [ ] 접근성 친화 — 색상에만 의존하지 않고 아이콘 + aria-label 병행

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| 진한 초록 배경이 "체크됨"으로 너무 강하게 느껴져 시각 부담 | Medium | Medium | Design 단계에서 톤 시안 비교 (3-4 후보 시각 mockup) |
| 강조 빨강이 "위급/오류"로 오해될 수 있음 (helppet은 의료지만 위급은 아님) | Medium | Low | 빨강 톤을 의료적 강조(amber/orange 혼합)로 완화하거나 별도 feature로 emergency tier 분리 |
| 다크 모드 대비 깨질 가능성 | Low | Low | 다크 모드 도입 여부 먼저 확인. 없으면 회피 |
| 시드 제거 후 dev에서 처음 보는 사용자가 "데이터 없음"을 버그로 오해 | Low | Medium | dev 가이드/README에 "시드는 비어있음, 직접 약 등록 후 체크 가능" 명시 권장 |
| `pet-bori`/`pet-maru` 시드 펫은 그대로 두는데 약/체크만 비우면 부자연 | Low | Low | 약(Medications) 시드는 유지(시간대 시드 노출에 필요). 로그(MedicationLogs)만 비우면 OK |
| 색상 변경 후 다른 곳(다른 카드)과 시각 일관성 깨짐 | Medium | Medium | Design에서 helppet 전체 색상 토큰 정책 검토 |

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
| 색상 톤 강화 정도 | 미미(border만) / 중간(배경 채도) / 강함(진한 배경 + 흰 글씨) | **Design에서 결정** (mockup 비교 후) | 의료 도메인 정확성 vs 시각 부담 trade-off |
| 알람 톤 (시간 지남) | 빨강 강조 / amber 경고 / pulse 애니메이션 | **Design에서 결정** | 위급함과 alertness 사이 균형 |
| 아이콘 처리 | 이모지 유지(✅⏰⭕) / SVG 아이콘 교체 / lucide-react 도입 | **Design에서 결정** | 일관성 vs 의존성 추가 |
| 상태 텍스트 노출 여부 | 아이콘만 / 아이콘+텍스트 / hover tooltip | **Design에서 결정** | 정보 밀도 vs 모바일 공간 |
| 시드 처리 | 빈 배열 / 환경 변수 토글 / 일자별 랜덤 | **빈 배열** | 단순 + 명확. dev 한정이라 over-engineering 회피 |

### 6.3 Clean Architecture Approach

```
Selected Level: Dynamic

영향 받는 파일:
src/
  components/features/
    today-medication.tsx                ← 수정 (시각 클래스 + aria-label)
  lib/
    mock-data.ts                        ← 수정 (medicationLogs 배열 정리)

변경 없음:
src/components/features/medication-card.tsx     ← 무관
src/app/(main)/dashboard/page.tsx               ← 호출만, 수정 없음
src/hooks/use-medication-logs.ts                ← 직전 사이클에서 완성
src/types/index.ts                              ← 타입 변경 없음
```

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [x] CLAUDE.md: 한국어 UI / 영문 코드
- [x] Tailwind warm/rose 팔레트 사용 중
- [x] React Hook Form, TanStack Query

### 7.2 Conventions to Define/Verify

| Category | Current | To Define | Priority |
|----------|---------|-----------|:--------:|
| 상태 색상 토큰 | 옅은 색조 위주 | **3-tier 강도 정책** (완료=강, 알람=강, 미래=약) | High |
| 아이콘 정책 | 이모지 인라인 | Design에서 결정 | Medium |
| Accessibility | 일부 미흡 | aria-label 명시 정책 추가 | Medium |

### 7.3 Environment Variables

변경 없음.

### 7.4 Pipeline Integration

N/A (UI 표시 변경 + mock 시드 정리).

---

## 8. Next Steps

1. [ ] `/pdca design medication-status-clarity` — Design 문서:
   - 색상 톤 3-4 시안 비교 + 최종 결정
   - 알람 톤 (빨강/amber/pulse) 결정
   - 아이콘 처리 결정
   - 상태 텍스트 노출 정책 결정
   - aria-label 패턴 명시
2. [ ] `/pdca do medication-status-clarity` — 구현 (예상 0.5일)
3. [ ] `/pdca analyze medication-status-clarity` — gap-detector
4. [ ] (필요 시) `/pdca iterate medication-status-clarity`
5. [ ] `/pdca report medication-status-clarity`
6. [ ] (후속 검토) `medication-midnight-refresh` (자정 자동 갱신)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-05-14 | Initial draft. `medication-daily-reset` Do 단계 발견 사용자 피드백 기반 | aejeong |
