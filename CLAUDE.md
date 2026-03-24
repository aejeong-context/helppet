# 오래오래 - 노견/환견 케어 플랫폼

## Project Level: Dynamic (bkend.ai BaaS)

## Overview
노견(7세+)과 아픈 반려동물을 위한 건강관리 중심 종합 케어 플랫폼

## Target
노견/환견 보호자 (복잡한 투약, 잦은 진료, 증상 관리가 필요한 보호자)

## Tech Stack
- Frontend: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- State: Zustand + TanStack Query
- Backend: bkend.ai (BaaS)
- Deployment: Vercel (frontend) + bkend.ai (backend)

## Core Features (건강관리 우선)
1. 건강관리(핵심): 투약 스케줄, 증상/컨디션 일지, 건강기록, 대시보드
2. 커뮤니티: 질병별 게시판, 병원 후기, 보호자 정서적 지지
3. 입양/임시보호: 노견/환견 특화 입양 공고, 임시보호 매칭

## Conventions
- Language: Korean (UI), English (code)
- Component naming: PascalCase
- File naming: kebab-case
- State: Zustand stores in src/stores/
- API calls: via src/lib/bkend.ts

## PDCA Documents
- Plan: docs/01-plan/
- Design: docs/02-design/
- Analysis: docs/03-analysis/
- Report: docs/04-report/
