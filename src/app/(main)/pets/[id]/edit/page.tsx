'use client';

import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { usePet, useUpdatePet, useDeletePet } from '@/hooks/use-pets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SymptomTagInput } from '@/components/ui/symptom-tag-input';
import { ImageUploader } from '@/components/ui/image-uploader';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface PetFormData {
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed: string;
  birthDate: string;
  estimatedAge: number;
  weight: number;
  specialNotes?: string;
}

export default function EditPetPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: pet, isLoading } = usePet(id);
  const updatePet = useUpdatePet();
  const deletePet = useDeletePet();
  const [conditions, setConditions] = useState<string[]>([]);
  const [profileImage, setProfileImage] = useState<string[]>([]);
  const [unknownBirthDate, setUnknownBirthDate] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PetFormData>();

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
    }
  }, [pet, reset]);

  const birthDate = watch('birthDate');
  const estimatedAge = watch('estimatedAge');

  const isSenior = unknownBirthDate
    ? (estimatedAge ?? 0) >= 7
    : birthDate
      ? new Date().getFullYear() - new Date(birthDate).getFullYear() >= 7
      : false;

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

  const handleDelete = () => {
    if (window.confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      deletePet.mutate(id, {
        onSuccess: () => router.push('/pets'),
      });
    }
  };

  if (isLoading) return <LoadingSpinner size="lg" className="mt-20" />;
  if (!pet) return <p className="text-center mt-20 text-gray-500">반려동물을 찾을 수 없습니다</p>;

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-6">반려동물 정보 수정</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">프로필 사진 (선택)</label>
          <ImageUploader maxFiles={1} value={profileImage} onChange={setProfileImage} />
        </div>

        <Input
          id="pet-name"
          label="이름"
          placeholder="반려동물 이름"
          error={errors.name?.message}
          {...register('name', { required: '이름을 입력해주세요' })}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">종</label>
          <select
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            {...register('species', { required: true })}
          >
            <option value="dog">강아지</option>
            <option value="cat">고양이</option>
            <option value="other">기타</option>
          </select>
        </div>

        <Input
          id="pet-breed"
          label="품종"
          placeholder="예: 골든리트리버, 코리안숏헤어"
          error={errors.breed?.message}
          {...register('breed', { required: '품종을 입력해주세요' })}
        />

        <div>
          <label className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={unknownBirthDate}
              onChange={(e) => setUnknownBirthDate(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-600">생년월일을 몰라요</span>
          </label>

          {unknownBirthDate ? (
            <Input
              id="pet-estimatedAge"
              type="number"
              label="예상 나이 (살)"
              placeholder="예: 8"
              error={errors.estimatedAge?.message}
              {...register('estimatedAge', {
                required: unknownBirthDate ? '예상 나이를 입력해주세요' : false,
                min: { value: 0, message: '0 이상 입력해주세요' },
                max: { value: 30, message: '30 이하로 입력해주세요' },
              })}
            />
          ) : (
            <Input
              id="pet-birthDate"
              type="date"
              label="생년월일"
              error={errors.birthDate?.message}
              {...register('birthDate', {
                required: unknownBirthDate ? false : '생년월일을 입력해주세요',
              })}
            />
          )}
        </div>

        {isSenior && (
          <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
            7세 이상 노견으로 자동 분류됩니다
          </div>
        )}

        <Input
          id="pet-weight"
          type="number"
          step="0.1"
          label="체중 (kg)"
          placeholder="예: 5.2"
          error={errors.weight?.message}
          {...register('weight', { required: '체중을 입력해주세요' })}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            질병/상태 태그
          </label>
          <SymptomTagInput
            tags={conditions}
            onChange={setConditions}
            placeholder="질병명 입력 후 Enter (예: 관절염, 심장병)"
          />
        </div>

        <Input
          id="pet-notes"
          label="특이사항 (선택)"
          placeholder="알레르기, 주의사항 등"
          {...register('specialNotes')}
        />

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => router.back()}
          >
            취소
          </Button>
          <Button type="submit" className="flex-1" disabled={updatePet.isPending}>
            {updatePet.isPending ? '저장 중...' : '저장'}
          </Button>
        </div>

        <button
          type="button"
          onClick={handleDelete}
          disabled={deletePet.isPending}
          className="w-full text-sm text-red-500 hover:text-red-700 py-2"
        >
          {deletePet.isPending ? '삭제 중...' : '반려동물 삭제'}
        </button>
      </form>
    </div>
  );
}
