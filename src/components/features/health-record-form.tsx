'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImageUploader } from '@/components/ui/image-uploader';

import type { HealthRecord } from '@/types';

type HealthRecordFormData = Omit<HealthRecord, '_id' | 'createdAt' | 'updatedAt'>;

interface HealthRecordFormProps {
  petId: string;
  defaultValues?: Partial<HealthRecordFormData>;
  onSubmit: (data: HealthRecordFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function HealthRecordForm({ petId, defaultValues, onSubmit, onCancel, isLoading }: HealthRecordFormProps) {
  const [attachments, setAttachments] = useState<string[]>(defaultValues?.attachments || []);
  const { register, handleSubmit, formState: { errors } } = useForm<HealthRecordFormData>({
    defaultValues: { petId, ...defaultValues },
  });

  const handleFormSubmit = (data: HealthRecordFormData) => {
    onSubmit({
      ...data,
      petId,
      cost: data.cost ? Number(data.cost) : undefined,
      attachments: attachments.length > 0 ? attachments : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">유형</label>
        <select
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          {...register('type', { required: true })}
        >
          <option value="checkup">정기검진</option>
          <option value="vaccination">예방접종</option>
          <option value="medication">투약</option>
          <option value="surgery">수술</option>
          <option value="emergency">응급</option>
        </select>
      </div>

      <Input
        id="hr-date"
        type="date"
        label="진료일"
        error={errors.date?.message}
        {...register('date', { required: '진료일을 입력해주세요' })}
      />
      <Input
        id="hr-description"
        label="진료 내용"
        placeholder="진료 내용을 입력하세요"
        error={errors.description?.message}
        {...register('description', { required: '진료 내용을 입력해주세요' })}
      />
      <Input id="hr-hospital" label="병원명 (선택)" placeholder="예: OO동물병원" {...register('hospital')} />
      <Input id="hr-doctor" label="담당 수의사 (선택)" placeholder="수의사 이름" {...register('doctor')} />
      <Input id="hr-cost" type="number" label="진료비 (선택)" placeholder="원" {...register('cost')} />
      <Input id="hr-nextDate" type="date" label="다음 예정일 (선택)" {...register('nextDate')} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">첨부 사진 (선택, 최대 5장)</label>
        <ImageUploader maxFiles={5} value={attachments} onChange={setAttachments} />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>취소</Button>
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? '저장 중...' : '저장'}
        </Button>
      </div>
    </form>
  );
}
