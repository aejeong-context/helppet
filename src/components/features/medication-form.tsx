'use client';

import { useForm, useWatch } from 'react-hook-form';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import type { Medication } from '@/types';

type MedicationFormData = Omit<Medication, '_id' | 'createdAt' | 'updatedAt'>;

const FREQUENCY_OPTIONS = [
  { value: 'once', label: '하루 1회', intervalHours: 24 },
  { value: 'twice', label: '하루 2회', intervalHours: 12 },
  { value: 'three', label: '하루 3회', intervalHours: 8 },
  { value: 'every6h', label: '6시간마다', intervalHours: 6 },
  { value: 'every4h', label: '4시간마다', intervalHours: 4 },
  { value: 'every3h', label: '3시간마다', intervalHours: 3 },
  { value: 'every2h', label: '2시간마다', intervalHours: 2 },
  { value: 'custom', label: '직접 입력', intervalHours: 0 },
];

function generateTimeSlots(startTime: string, intervalHours: number): string[] {
  if (!startTime || intervalHours <= 0) return [];
  const [h, m] = startTime.split(':').map(Number);
  const slots: string[] = [];
  const count = Math.floor(24 / intervalHours);

  for (let i = 0; i < count; i++) {
    const totalMinutes = (h * 60 + m + i * intervalHours * 60) % (24 * 60);
    const hh = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
    const mm = String(totalMinutes % 60).padStart(2, '0');
    slots.push(`${hh}:${mm}`);
  }
  return slots;
}

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
  const { register, handleSubmit, control, formState: { errors } } = useForm<
    MedicationFormData & { frequencyType: string; startTime: string; customTimeSlots: string }
  >({
    defaultValues: {
      petId,
      isActive: true,
      timeSlots: [],
      frequencyType: 'twice',
      startTime: '09:00',
      customTimeSlots: defaultValues?.timeSlots?.join(', ') || '',
      ...defaultValues,
    },
  });

  const frequencyType = useWatch({ control, name: 'frequencyType' });
  const startTime = useWatch({ control, name: 'startTime' });

  const selectedOption = FREQUENCY_OPTIONS.find((o) => o.value === frequencyType);
  const isCustom = frequencyType === 'custom';

  const autoTimeSlots = useMemo(
    () => (selectedOption && !isCustom ? generateTimeSlots(startTime, selectedOption.intervalHours) : []),
    [startTime, selectedOption, isCustom],
  );

  const handleFormSubmit = (data: MedicationFormData & { frequencyType: string; startTime: string; customTimeSlots: string }) => {
    const frequency = selectedOption?.label || data.frequency;
    const timeSlots = isCustom
      ? data.customTimeSlots.split(',').map((t: string) => t.trim()).filter(Boolean)
      : autoTimeSlots;

    const { frequencyType: _, startTime: __, customTimeSlots: ___, ...rest } = data;
    onSubmit({ ...rest, petId, frequency, timeSlots, isActive: true });
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

      {/* 복용 주기 선택 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">복용 주기</label>
        <select
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          {...register('frequencyType')}
        >
          {FREQUENCY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* 시작 시간 or 직접 입력 */}
      {isCustom ? (
        <Input
          id="med-customTimeSlots"
          label="복용 시간 (쉼표로 구분)"
          placeholder="예: 09:00, 15:00, 21:00"
          {...register('customTimeSlots')}
        />
      ) : (
        <>
          <Input
            id="med-startTime"
            type="time"
            label="첫 복용 시간"
            {...register('startTime')}
          />
          {autoTimeSlots.length > 0 && (
            <div className="rounded-lg bg-primary-50 p-3 text-sm text-primary-700">
              <p className="font-medium mb-1">자동 설정된 복용 시간</p>
              <p>{autoTimeSlots.join(' → ')}</p>
            </div>
          )}
        </>
      )}

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
