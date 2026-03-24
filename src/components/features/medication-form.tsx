'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import type { Medication } from '@/types';

type MedicationFormData = Omit<Medication, '_id' | 'createdAt' | 'updatedAt'>;

interface MedicationFormProps {
  petId: string;
  defaultValues?: Partial<MedicationFormData>;
  onSubmit: (data: MedicationFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function MedicationForm({
  petId,
  defaultValues,
  onSubmit,
  onCancel,
  isLoading,
}: MedicationFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<MedicationFormData>({
    defaultValues: {
      petId,
      isActive: true,
      timeSlots: [],
      ...defaultValues,
    },
  });

  const handleFormSubmit = (data: MedicationFormData) => {
    const timeSlots = typeof data.timeSlots === 'string'
      ? (data.timeSlots as string).split(',').map((t: string) => t.trim())
      : data.timeSlots;
    onSubmit({ ...data, petId, timeSlots, isActive: true });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        id="med-name"
        label="약물명"
        placeholder="예: 코세퀸"
        error={errors.name?.message}
        {...register('name', { required: '약물명을 입력해주세요' })}
      />
      <Input
        id="med-dosage"
        label="용량"
        placeholder="예: 1정, 5ml"
        error={errors.dosage?.message}
        {...register('dosage', { required: '용량을 입력해주세요' })}
      />
      <Input
        id="med-frequency"
        label="복용 주기"
        placeholder="예: 하루 2회"
        error={errors.frequency?.message}
        {...register('frequency', { required: '복용 주기를 입력해주세요' })}
      />
      <Input
        id="med-timeSlots"
        label="복용 시간 (쉼표로 구분)"
        placeholder="예: 09:00, 21:00"
        {...register('timeSlots')}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          id="med-startDate"
          type="date"
          label="시작일"
          error={errors.startDate?.message}
          {...register('startDate', { required: '시작일을 입력해주세요' })}
        />
        <Input
          id="med-endDate"
          type="date"
          label="종료일 (선택)"
          {...register('endDate')}
        />
      </div>
      <Input
        id="med-notes"
        label="주의사항 (선택)"
        placeholder="식후 복용 등"
        {...register('notes')}
      />

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? '저장 중...' : '저장'}
        </Button>
      </div>
    </form>
  );
}
