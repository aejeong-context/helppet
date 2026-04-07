# 반려동물 편집 기능 Planning Document

> **Summary**: 등록된 반려동물의 정보를 수정할 수 있는 편집 기능
>
> **Project**: HelpPet
> **Version**: 0.1.0
> **Author**: aejeong
> **Date**: 2026-04-07
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 반려동물 정보(체중, 질병, 투약 상태 등)는 시간에 따라 변하지만, 현재 등록 후 수정할 수 있는 UI가 없어 정보가 outdated 됨 |
| **Solution** | 상세 페이지에서 편집 버튼을 통해 기존 등록 폼과 동일한 UI로 반려동물 정보를 수정할 수 있는 편집 페이지 제공 |
| **Function/UX Effect** | 보호자가 반려동물의 변화된 체중, 새로운 질병, 프로필 사진 등을 즉시 업데이트하여 항상 최신 정보 기반으로 건강관리 가능 |
| **Core Value** | 반려동물 건강 데이터의 정확성을 유지하여, 투약/진료 등 건강관리 기능의 신뢰도와 실용성을 높임 |

---

## 1. Overview

### 1.1 Purpose

반려동물 정보는 시간이 지나면서 변합니다:
- 체중 변화 (노견의 체중 감소/증가)
- 새로운 질병 진단
- 투약 상태 변경
- 프로필 사진 업데이트

현재 등록(`/pets/new`) 후 수정할 방법이 없어, 이 기능이 필요합니다.

### 1.2 Background

- 등록 페이지(`/pets/new/page.tsx`)와 상세 페이지(`/pets/[id]/page.tsx`) 구현 완료
- `useUpdatePet` 훅과 `bkend.data.update('Pets', id, data)` API 이미 존재
- 편집 페이지와 상세→편집 네비게이션만 추가하면 됨

---

## 2. Scope

### 2.1 In Scope

| # | Feature | Priority | Description |
|---|---------|----------|-------------|
| 1 | 편집 페이지 | Must | `/pets/[id]/edit` 라우트에 편집 폼 페이지 생성 |
| 2 | 기존 데이터 프리필 | Must | 현재 반려동물 데이터를 폼에 미리 채워서 표시 |
| 3 | 상세→편집 네비게이션 | Must | 상세 페이지에 "편집" 버튼 추가 |
| 4 | 프로필 이미지 변경 | Should | 기존 이미지 표시 + 새 이미지로 교체 가능 |
| 5 | 삭제 기능 | Could | 편집 페이지 하단에 반려동물 삭제 버튼 (확인 다이얼로그 포함) |

### 2.2 Out of Scope

- 반려동물 정보 변경 이력 관리 (히스토리)
- 여러 반려동물 일괄 편집
- 다른 사용자의 반려동물 편집 권한

---

## 3. Technical Approach

### 3.1 Architecture

```
[상세 페이지] --편집 버튼--> [편집 페이지] --저장--> [상세 페이지로 리다이렉트]
/pets/[id]                  /pets/[id]/edit              /pets/[id]
```

### 3.2 Key Implementation

| Component | Approach |
|-----------|----------|
| 편집 페이지 | `src/app/(main)/pets/[id]/edit/page.tsx` 신규 생성 |
| 폼 구조 | 등록 페이지(`new/page.tsx`)와 동일한 폼 필드, `useForm`의 `defaultValues`로 기존 데이터 프리필 |
| 데이터 로딩 | `usePet(id)`로 기존 데이터 조회 |
| 저장 | `useUpdatePet` 훅 사용 (이미 구현됨) |
| 이미지 | `ImageUploader`에 기존 이미지 URL 전달하여 미리보기 표시 |
| 상세 페이지 | "편집" 버튼 추가 → `/pets/[id]/edit` 링크 |

### 3.3 Reuse vs New

| 항목 | 상태 | 비고 |
|------|------|------|
| `useUpdatePet` 훅 | 기존 활용 | `use-pets.ts:32` |
| `bkend.data.update` API | 기존 활용 | `bkend.ts` |
| 폼 UI (Input, Select, SymptomTagInput, ImageUploader) | 기존 활용 | 등록 페이지와 동일 컴포넌트 |
| 편집 페이지 | **신규** | `pets/[id]/edit/page.tsx` |
| 상세 페이지 편집 버튼 | **수정** | `pets/[id]/page.tsx` |

---

## 4. Implementation Order

1. `/pets/[id]/edit/page.tsx` 편집 페이지 생성 (기존 데이터 프리필 + 저장)
2. `/pets/[id]/page.tsx` 상세 페이지에 편집 버튼 추가
3. (선택) 삭제 기능 추가

---

## 5. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| 이미지 변경 시 기존 이미지 잔존 | Low | 스토리지 정리는 후속 작업으로 분리 |
| 동시 편집 충돌 | Low | 단일 사용자 기준 MVP이므로 무시 가능 |

---

## 6. Success Criteria

- [ ] 상세 페이지에서 편집 버튼 클릭 시 편집 페이지로 이동
- [ ] 편집 페이지에 기존 반려동물 정보가 모두 프리필됨
- [ ] 수정 후 저장 시 데이터가 정상 업데이트됨
- [ ] 저장 후 상세 페이지로 리다이렉트되며 변경사항 반영됨
