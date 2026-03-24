'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SymptomTagInput } from '@/components/ui/symptom-tag-input';
import { ImageUploader } from '@/components/ui/image-uploader';

import type { Adoption } from '@/types';

type AdoptionFormData = Omit<Adoption, '_id' | 'createdAt' | 'updatedAt' | 'userId'>;

interface AdoptionFormProps {
  onSubmit: (data: AdoptionFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AdoptionForm({ onSubmit, onCancel, isLoading }: AdoptionFormProps) {
  const [conditions, setConditions] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const { register, handleSubmit, formState: { errors } } = useForm<AdoptionFormData>({
    defaultValues: { type: 'adoption', status: 'available', species: 'dog', conditions: [], images: [] },
  });

  const handleFormSubmit = (data: AdoptionFormData) => {
    onSubmit({ ...data, conditions, images });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">공고 유형</label>
        <select className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none" {...register('type')}>
          <option value="adoption">입양</option>
          <option value="foster">임시보호</option>
        </select>
      </div>
      <Input id="ad-petName" label="동물 이름" placeholder="이름" error={errors.petName?.message} {...register('petName', { required: '이름을 입력해주세요' })} />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">종</label>
          <select className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none" {...register('species')}>
            <option value="dog">강아지</option>
            <option value="cat">고양이</option>
            <option value="other">기타</option>
          </select>
        </div>
        <Input id="ad-breed" label="품종" placeholder="품종" error={errors.breed?.message} {...register('breed', { required: '품종을 입력해주세요' })} />
      </div>
      <Input id="ad-age" label="나이" placeholder="예: 10세" error={errors.age?.message} {...register('age', { required: '나이를 입력해주세요' })} />
      <Input id="ad-location" label="지역" placeholder="예: 서울 강남구" error={errors.location?.message} {...register('location', { required: '지역을 입력해주세요' })} />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">질병/상태</label>
        <SymptomTagInput tags={conditions} onChange={setConditions} placeholder="질병명 입력 후 Enter" />
      </div>
      <div>
        <label htmlFor="ad-desc" className="block text-sm font-medium text-gray-700 mb-1">상세 설명</label>
        <textarea id="ad-desc" placeholder="동물에 대한 상세 설명" className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none" rows={4} {...register('description', { required: '설명을 입력해주세요' })} />
      </div>
      <Input id="ad-contact" label="연락처" placeholder="전화번호 또는 이메일" error={errors.contactInfo?.message} {...register('contactInfo', { required: '연락처를 입력해주세요' })} />
      <Input id="ad-medical" label="의료 이력 (선택)" placeholder="주요 의료 이력 요약" {...register('medicalHistory')} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">사진 (최대 10장)</label>
        <ImageUploader maxFiles={10} value={images} onChange={setImages} />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>취소</Button>
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? '등록 중...' : '등록'}
        </Button>
      </div>
    </form>
  );
}
