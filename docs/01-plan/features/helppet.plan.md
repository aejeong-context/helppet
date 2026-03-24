# HelpPet 노견/환견 케어 플랫폼 Planning Document

> **Summary**: 노견과 아픈 반려동물을 위한 건강관리 중심의 종합 케어 플랫폼 (커뮤니티 + 입양/임시보호 포함)
>
> **Project**: HelpPet
> **Version**: 0.1.0
> **Author**: aejeong
> **Date**: 2026-03-20
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 노견/환견 보호자는 복잡한 투약 스케줄, 잦은 진료, 증상 변화를 체계적으로 관리할 도구가 없고, 같은 상황의 보호자와 경험을 나눌 커뮤니티도 부족함 |
| **Solution** | 노견/환견 특화 건강관리(투약 알림, 증상 트래킹, 진료 기록) + 보호자 커뮤니티 + 노견/환견 입양/임시보호 매칭을 하나의 플랫폼으로 통합 |
| **Function/UX Effect** | 아픈 반려동물의 투약/진료 일정을 한눈에 관리하고, 비슷한 경험의 보호자와 정보를 교류하며, 노견/환견의 새 가족을 찾아줄 수 있음 |
| **Core Value** | 노견/환견 보호자의 케어 부담을 줄이고, 보호자 간 정서적 지지를 형성하며, 입양이 어려운 노견/환견의 새 기회를 만들어 동물 복지를 실질적으로 개선 |

---

## 1. Overview

### 1.1 Purpose

**타겟**: 노견(7세 이상) 및 질병/장애가 있는 반려동물의 보호자

노견/환견 보호자가 겪는 세 가지 핵심 문제를 해결합니다:
1. **복잡한 건강관리**: 다중 투약 스케줄, 잦은 진료 방문, 증상 변화 추적이 필요하지만 체계적 관리 도구 부재
2. **정서적 고립감**: 노견/환견 케어는 심리적 부담이 크지만, 같은 경험을 공유할 수 있는 전문 커뮤니티 부재
3. **노견/환견 입양 사각지대**: 나이 들거나 아픈 동물은 입양률이 극히 낮아 특화된 매칭 플랫폼 필요

### 1.2 Background

- 국내 반려동물 양육 가구 600만+, 이 중 노령 반려동물 비중 증가 추세
- 반려동물 고령화에 따른 의료비 증가 및 케어 부담 심화
- 기존 앱은 건강한 반려동물 중심 → 노견/환견 특화 서비스 부재
- 유기동물 보호소의 노견/환견 안락사 비율 높음 → 특화 입양 플랫폼 필요

### 1.3 Related Documents

- CLAUDE.md (프로젝트 컨텍스트)
- src/types/index.ts (데이터 모델 초안)

---

## 2. Scope

### 2.1 In Scope (MVP)

**건강관리 (핵심)**
- [ ] 회원가입/로그인 (이메일 기반)
- [ ] 반려동물 프로필 등록/관리 (나이, 질병/상태 태그 포함)
- [ ] 건강 기록 CRUD (진료, 예방접종, 투약, 수술)
- [ ] 투약 스케줄 관리 (다중 약물, 복용 주기 설정)
- [ ] 증상/컨디션 일지 (매일 상태 기록: 식욕, 활동량, 통증 등)
- [ ] 대시보드 (오늘의 투약, 다가오는 진료, 최근 컨디션 변화)

**커뮤니티**
- [ ] 게시판 (질병별 카테고리: 관절, 심장, 신장, 종양 등)
- [ ] 게시글 댓글 및 좋아요
- [ ] 병원 후기/추천

**입양/임시보호**
- [ ] 노견/환견 입양 공고 등록/조회
- [ ] 임시보호 모집 공고
- [ ] 입양 상태 관리 (가능/진행중/완료)

### 2.2 Out of Scope (v2 이후)

- 투약/진료 푸시 알림 리마인더
- 수의사 온라인 상담 연결
- 실시간 채팅/메시징
- 소셜 로그인 (Google, Kakao)
- 동물병원 예약 연동
- 반려동물 보험 비교
- 모바일 앱 (React Native)

---

## 3. Requirements

### 3.1 Functional Requirements

**건강관리 (핵심)**

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 이메일 회원가입/로그인 (JWT 인증) | High | Pending |
| FR-02 | 반려동물 프로필 CRUD (이름, 종, 품종, 나이, 체중, 질병/상태 태그) | High | Pending |
| FR-03 | 건강기록 CRUD (진료/예방접종/투약/수술 타입별) | High | Pending |
| FR-04 | 투약 스케줄 관리 (약물명, 용량, 복용 주기, 시작/종료일) | High | Pending |
| FR-05 | 증상/컨디션 일지 (날짜별 상태: 식욕, 활동량, 통증, 메모) | High | Pending |
| FR-06 | 대시보드 (오늘의 투약, 다가오는 진료, 최근 컨디션 그래프) | High | Pending |

**커뮤니티**

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-07 | 커뮤니티 게시글 CRUD (질병별 카테고리 필터링) | Medium | Pending |
| FR-08 | 게시글 댓글 작성/삭제 | Medium | Pending |
| FR-09 | 게시글 좋아요 토글 | Low | Pending |
| FR-10 | 병원 후기/추천 게시판 | Medium | Pending |

**입양/임시보호**

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-11 | 노견/환견 입양 공고 등록/조회 (상태 관리) | Medium | Pending |
| FR-12 | 임시보호 모집 공고 등록/조회 | Medium | Pending |
| FR-13 | 입양/임시보호 공고 필터링 (지역, 종, 나이, 질병) | Medium | Pending |

**공통**

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-14 | 마이페이지 (내 정보, 내 반려동물, 내 게시글, 내 공고) | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | 페이지 로딩 < 2초 (LCP) | Lighthouse |
| Security | JWT 기반 인증, XSS/CSRF 방어 | OWASP 체크리스트 |
| Accessibility | WCAG 2.1 AA 기본 준수 | Lighthouse a11y 점수 |
| Responsive | 모바일/태블릿/데스크톱 반응형 | 브라우저 테스트 |
| SEO | 주요 페이지 메타태그 적용 | Lighthouse SEO 점수 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] 모든 FR (High) 요구사항 구현 완료
- [ ] 회원가입 → 로그인 → 반려동물 등록 → 건강기록 → 커뮤니티 → 입양 플로우 동작
- [ ] 코드 리뷰 완료
- [ ] PDCA Gap Analysis >= 90%

### 4.2 Quality Criteria

- [ ] TypeScript strict 모드 에러 없음
- [ ] ESLint 에러 없음
- [ ] 빌드 성공 (next build)
- [ ] 반응형 레이아웃 정상 동작

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| bkend.ai API 제한 (무료 플랜) | Medium | Medium | 필수 기능 우선 구현, 캐싱 활용 |
| 이미지 업로드 용량 제한 | Medium | High | 클라이언트 리사이징, 용량 제한 안내 |
| 데이터 모델 변경 빈도 | Low | Medium | Schema 문서 선행 작성, 마이그레이션 계획 |
| 커뮤니티 스팸/부적절 콘텐츠 | Medium | Low | MVP에서는 신고 기능만, 이후 자동 필터링 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure | Static sites, portfolios | ☐ |
| **Dynamic** | Feature-based, BaaS integration | Web apps, SaaS MVPs | ☑ |
| **Enterprise** | Strict layer separation, microservices | High-traffic systems | ☐ |

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| Framework | Next.js / React / Vue | **Next.js 14 (App Router)** | SSR/SSG, 파일 기반 라우팅, SEO 유리 |
| State Management | Context / Zustand / Redux | **Zustand** | 경량, 보일러플레이트 최소, 러닝커브 낮음 |
| Data Fetching | fetch / axios / TanStack Query | **TanStack Query** | 캐싱, 자동 리페치, 로딩/에러 상태 관리 |
| Styling | Tailwind / CSS Modules | **Tailwind CSS** | 빠른 프로토타이핑, 일관된 디자인 |
| Backend | BaaS / Custom Server | **bkend.ai** | 인증/DB/파일스토리지 통합, 빠른 개발 |
| Form | react-hook-form / native | **react-hook-form** | 유효성 검사, 성능 최적화 |

### 6.3 Clean Architecture Approach

```
Selected Level: Dynamic

Folder Structure:
helppet/
├── src/
│   ├── app/              # Next.js App Router (Pages)
│   │   ├── (auth)/       # 인증 관련 (login, register)
│   │   └── (main)/       # 메인 (dashboard, pets, community, adoption)
│   ├── components/
│   │   ├── ui/           # 기본 UI (Button, Input, Card...)
│   │   └── features/     # 기능별 컴포넌트 (PetCard, PostList...)
│   ├── hooks/            # Custom Hooks (useAuth, usePets...)
│   ├── lib/bkend.ts      # bkend.ai API 클라이언트
│   ├── stores/           # Zustand 상태 관리
│   └── types/            # TypeScript 타입 정의
├── docs/                 # PDCA 문서
└── .mcp.json             # bkend.ai MCP 설정
```

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [x] `CLAUDE.md` has coding conventions section
- [ ] `docs/01-plan/conventions.md` exists (Phase 2 output)
- [ ] `CONVENTIONS.md` exists at project root
- [ ] ESLint configuration
- [ ] Prettier configuration
- [ ] TypeScript configuration (`tsconfig.json`)

### 7.2 Conventions to Define/Verify

| Category | Current State | To Define | Priority |
|----------|---------------|-----------|:--------:|
| **Naming** | CLAUDE.md 기본 | 컴포넌트 PascalCase, 파일 kebab-case, 변수 camelCase | High |
| **Folder structure** | 초기 생성 완료 | feature 기반 구조 규칙 | High |
| **Import order** | missing | React → Next → 외부 → 내부 → 타입 순서 | Medium |
| **Environment variables** | .env.local 생성 | NEXT_PUBLIC_ prefix 규칙 | Medium |
| **Error handling** | missing | try/catch + toast 알림 패턴 | Medium |

### 7.3 Environment Variables Needed

| Variable | Purpose | Scope | To Be Created |
|----------|---------|-------|:-------------:|
| `NEXT_PUBLIC_BKEND_API_URL` | bkend.ai API 엔드포인트 | Client | ☑ |
| `NEXT_PUBLIC_BKEND_PROJECT_ID` | bkend 프로젝트 ID | Client | ☐ (설정 필요) |
| `NEXT_PUBLIC_BKEND_ENV` | 환경 (dev/prod) | Client | ☑ |

### 7.4 Pipeline Integration

| Phase | Status | Document Location | Command |
|-------|:------:|-------------------|---------|
| Phase 1 (Schema) | ☐ | `docs/01-plan/schema.md` | `/phase-1-schema` |
| Phase 2 (Convention) | ☐ | `docs/01-plan/conventions.md` | `/phase-2-convention` |

---

## 8. Feature Development Order

MVP 기능을 단위별로 나눠 PDCA 사이클을 적용합니다 (건강관리 우선):

| Order | Feature | Dependencies | PDCA Command |
|:-----:|---------|--------------|-------------|
| 1 | 인증 (회원가입/로그인) | 없음 | `/pdca plan auth` |
| 2 | 반려동물 프로필 관리 | 인증 | `/pdca plan pet-profile` |
| 3 | 투약 스케줄 관리 | 반려동물 프로필 | `/pdca plan medication` |
| 4 | 건강기록 + 증상일지 | 반려동물 프로필 | `/pdca plan health-record` |
| 5 | 대시보드 | 투약, 건강기록 | `/pdca plan dashboard` |
| 6 | 커뮤니티 (질병별 게시판) | 인증 | `/pdca plan community` |
| 7 | 입양/임시보호 | 인증 | `/pdca plan adoption` |
| 8 | 마이페이지 | 전체 기능 | `/pdca plan mypage` |

---

## 9. Next Steps

1. [ ] Design 문서 작성 (`/pdca design helppet`)
2. [ ] Phase 1 Schema 정의 (`/phase-1-schema`)
3. [ ] Phase 2 Convention 정의 (`/phase-2-convention`)
4. [ ] 기능별 PDCA 사이클 시작 (인증부터)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-03-20 | Initial draft | aejeong |
| 0.2 | 2026-03-20 | 노견/환견 특화로 방향 전환: 투약 스케줄, 증상일지, 질병별 커뮤니티, 임시보호 추가 | aejeong |
