# 반려동물 편집 기능 Design Document

> **Summary**: 등록된 반려동물의 정보를 수정할 수 있는 편집 페이지 설계
>
> **Project**: HelpPet
> **Version**: 0.1.0
> **Author**: aejeong
> **Date**: 2026-04-07
> **Status**: Draft
> **Plan Reference**: `docs/01-plan/features/pet-edit.plan.md`

---

## 1. Architecture

### 1.1 User Flow

```
[상세 페이지]        [편집 페이지]           [상세 페이지]
/pets/[id]    →    /pets/[id]/edit    →    /pets/[id]
  편집 버튼 클릭      폼 수정 + 저장         변경사항 반영
```

### 1.2 Component Tree

```
EditPetPage
├── usePet(id)                    # 기존 데이터 로딩
├── useUpdatePet()                # 수정 API
├── useDeletePet()                # 삭제 API (Could)
├── useForm<PetFormData>          # defaultValues로 프리필
├── ImageUploader                 # value={[pet.profileImage]}
├── Input (name)
├── select (species)
├── Input (breed)
├── unknownBirthDate toggle
│   ├── Input (birthDate)
│   └── Input (estimatedAge)
├── isSenior 자동 계산 배너
├── Input (weight)
├── SymptomTagInput (conditions)
├── Input (specialNotes)
└── Button Group
    ├── 취소 → router.back()
    ├── 저장 → updatePet.mutate()
    └── 삭제 → deletePet.mutate() (확인 후)
```

---

## 2. File Changes

### 2.1 신규 파일

| File | Description |
|------|-------------|
| `src/app/(main)/pets/[id]/edit/page.tsx` | 편집 페이지 (핵심) |

### 2.2 수정 파일

| File | Change |
|------|--------|
| `src/app/(main)/pets/[id]/page.tsx` | 편집 버튼 추가 (Link → `/pets/[id]/edit`) |

---

## 3. Detailed Design

### 3.1 편집 페이지 (`pets/[id]/edit/page.tsx`)

**데이터 로딩 & 프리필**:
```typescript
const { id } = useParams<{ id: string }>();
const { data: pet, isLoading } = usePet(id);
const updatePet = useUpdatePet();

// pet 데이터가 로드되면 폼 defaultValues 설정
const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<PetFormData>();

useEffect(() => {
  if (pet) {
    reset({
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      birthDate: pet.birthDate,
      weight: pet.weight,
      specialNotes: pet.specialNotes || '',
    });
    setConditions(pet.conditions);
    setProfileImage(pet.profileImage ? [pet.profileImage] : []);
    // birthDate로부터 estimatedAge 역산 가능 여부 판단
  }
}, [pet, reset]);
```

**생년월일 처리**:
- 기존 `birthDate`가 있으면 → 생년월일 모드 (unknownBirthDate = false)
- 사용자가 "생년월일을 몰라요" 체크 시 → 예상 나이 모드로 전환
- 기존 birthDate에서 예상 나이 역산: `new Date().getFullYear() - new Date(birthDate).getFullYear()`

**저장 로직**:
```typescript
const onSubmit = (data: PetFormData) => {
  let finalBirthDate = data.birthDate;
  if (unknownBirthDate && data.estimatedAge) {
    const now = new Date();
    now.setFullYear(now.getFullYear() - Number(data.estimatedAge));
    finalBirthDate = now.toISOString().split('T')[0];
  }

  updatePet.mutate(
    {
      id,
      data: {
        ...data,
        birthDate: finalBirthDate,
        weight: Number(data.weight),
        conditions,
        isSenior,
        profileImage: profileImage[0] || undefined,
      },
    },
    { onSuccess: () => router.push(`/pets/${id}`) },
  );
};
```

**삭제 기능** (Could):
```typescript
const deletePet = useDeletePet();

const handleDelete = () => {
  if (window.confirm('정말 삭제하시겠습니까? 관련 건강기록도 모두 삭제됩니다.')) {
    deletePet.mutate(id, {
      onSuccess: () => router.push('/pets'),
    });
  }
};
```

### 3.2 상세 페이지 편집 버튼

프로필 카드 내 이름 옆 또는 카드 하단에 편집 버튼 추가:

```tsx
{/* 목록으로 버튼 위에 편집 버튼 추가 */}
<div className="flex gap-3">
  <Link href={`/pets/${id}/edit`} className="flex-1">
    <Button variant="outline" className="w-full">편집</Button>
  </Link>
  <Link href="/pets" className="flex-1">
    <Button variant="outline" className="w-full">← 목록으로</Button>
  </Link>
</div>
```

---

## 4. Edge Cases

| Case | Handling |
|------|----------|
| 로딩 중 | `LoadingSpinner` 표시 (상세 페이지와 동일) |
| Pet not found | "반려동물을 찾을 수 없습니다" 메시지 표시 |
| 이미지 변경 | `ImageUploader`의 `value` prop으로 기존 이미지 전달, `setInitialUrls` 자동 호출됨 |
| 저장 실패 | `updatePet.isError` 시 에러 메시지 표시 |
| 삭제 후 관련 데이터 | MVP에서는 Pet만 삭제, 관련 Medication/HealthRecord는 orphan 허용 |

---

## 5. Implementation Order

| Step | Task | File | Priority |
|------|------|------|----------|
| 1 | 편집 페이지 생성 | `src/app/(main)/pets/[id]/edit/page.tsx` | Must |
| 2 | 상세 페이지 편집 버튼 | `src/app/(main)/pets/[id]/page.tsx` | Must |
| 3 | 삭제 기능 추가 | `src/app/(main)/pets/[id]/edit/page.tsx` | Could |

---

## 6. Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| `useUpdatePet` hook | 구현됨 | `src/hooks/use-pets.ts:32` |
| `useDeletePet` hook | 구현됨 | `src/hooks/use-pets.ts:39` |
| `usePet` hook | 구현됨 | `src/hooks/use-pets.ts:15` |
| `ImageUploader` component | 구현됨 | `setInitialUrls`로 기존 URL 프리필 지원 |
| `SymptomTagInput` component | 구현됨 | `tags` + `onChange` props |
| `react-hook-form` | 설치됨 | `reset()` 메서드로 프리필 |
