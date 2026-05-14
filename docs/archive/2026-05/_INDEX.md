# Archive Index — 2026-05

> Completed PDCA cycles archived in May 2026.

## Features

| Feature | Match Rate | Iterations | Archived | Documents |
|---------|:----------:|:----------:|----------|-----------|
| [pet-disease-display](./pet-disease-display/) | 100% | 0 | 2026-05-14 | Plan · Design · Analysis · Report |
| [medication-daily-reset](./medication-daily-reset/) | 98% | 0 | 2026-05-14 | Plan · Design (v0.2) · Analysis · Report |
| [medication-status-clarity](./medication-status-clarity/) | 99% | 0 | 2026-05-14 | Plan · Design (v0.2) · Analysis · Report |

## Summary

| Feature | Cycle Duration | Core Value |
|---------|---------------|------------|
| pet-disease-display | 2일 (2026-05-13 ~ 2026-05-14) | `pet.conditions`를 자기소개 톤 해시태그(`#심장병`)로 노출하는 atom 컴포넌트 도입 |
| medication-daily-reset | 1일 (2026-05-14) | UTC 기준 날짜 계산을 KST 기준으로 일괄 전환 → "오늘의 투약"이 매일 한국 시간 자정에 새로 시작. timezone 버그 픽스 |
| medication-status-clarity | 1일 (2026-05-14) | "오늘의 투약" 3-tier 상태(체크/지남/미래) 시각 무게 차별화 + 의미 충돌 아이콘 매핑(`✅`/`⏰`/`☐`) + 접근성 강화 |

## Out-of-PDCA Quick Fixes (참고)

| Fix | Date | Files | Source |
|-----|------|-------|--------|
| condition-chart 점 stretched 버그 | 2026-05-14 | `condition-chart.tsx` | 사용자 발견 직후 단독 픽스 — SVG circle → HTML div 분리 |

## Reusable Patterns Established

- **Read/Write 컴포넌트 분리** (pet-disease-display): 표시 컨텍스트는 가벼운 톤, 편집 컨텍스트는 강조 톤으로 의도적 분리
- **Single Source of Truth for Date Calculation** (medication-daily-reset): `lib/utils.ts`가 모든 timezone-sensitive 계산의 단일 진입점
- **`Intl.DateTimeFormat('en-CA', ...)` ISO 형식 추출** (medication-daily-reset): 라이브러리 없이 표준 날짜 string 보장
- **Plan §2.2 Out of Scope 명시 → 후속 feature 분리 가이드** (medication-daily-reset): Do 단계에서 발견된 인접 이슈를 별도 사이클로 깨끗하게 분리
- **Design 사후 보강 패턴 (Check 후)** (medication-daily-reset v0.2): gap-detector 권고에 따른 implementation/문서 동기화
- **Design 사후 보강 패턴 (Check 전)** (medication-status-clarity v0.2): Do 발견을 Check 전 동기화하여 매치율 자연 상승
- **3-Tier Visual Hierarchy** (medication-status-clarity): 행동 가능 액션의 "결과/주의/대기" 상태를 시각 무게로 위계화
- **Cultural Icon Semantics** (medication-status-clarity): 이모지 선택 시 문화권 의미 검토 (⭕=OK in 한국/일본)
- **Color Semantic Conflict Avoidance** (medication-status-clarity): 기존 코드베이스의 색상 의미와 충돌 회피 (빨강은 ConditionBadge에 점유 → 알람은 amber)
- **Accessibility-First Toggle Button** (medication-status-clarity): `aria-pressed` + 동적 `aria-label` + `aria-hidden` 아이콘
- **HTML/SVG Hybrid for Aspect-Ratio Independent Markers** (out-of-PDCA condition-chart fix): SVG `preserveAspectRatio="none"` line + HTML div 점으로 분리하여 정사각형 보장

## Follow-up Features Tracked

From `medication-status-clarity` (Report §5):
- `medication-midnight-refresh` — 보류
- `medication-log-tz-migration` — 보류
- `motion-reduce-pulse-disable` — 보류
- `accessibility-audit` — 보류
- `eslint-strict-setup` — 직전 2 사이클 누적 권고
- `medication-empty-state-guide` — 보류

From `pet-disease-display` (Report §5):
- `community-pet-profile` — 보류
- `pet-disease-search` — 보류
- `pet-disease-model` — 보류
