'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConditionSlider } from './condition-slider';
import { SymptomTagInput } from '@/components/ui/symptom-tag-input';
import { getToday } from '@/lib/utils';

import type { ConditionLog } from '@/types';

type ConditionLogFormData = Omit<ConditionLog, '_id' | 'createdAt' | 'updatedAt'>;

interface ConditionLogFormProps {
  petId: string;
  onSubmit: (data: ConditionLogFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConditionLogForm({ petId, onSubmit, onCancel, isLoading }: ConditionLogFormProps) {
  const [appetite, setAppetite] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [activity, setActivity] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [pain, setPain] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [weight, setWeight] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    onSubmit({
      petId,
      date: getToday(),
      appetite,
      activity,
      pain,
      mood,
      weight: weight ? Number(weight) : undefined,
      symptoms: symptoms.length > 0 ? symptoms : undefined,
      notes: notes || undefined,
    });
  };

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <ConditionSlider field="appetite" value={appetite} onChange={(v) => setAppetite(v as 1|2|3|4|5)} />
        <ConditionSlider field="activity" value={activity} onChange={(v) => setActivity(v as 1|2|3|4|5)} />
        <ConditionSlider field="pain" value={pain} onChange={(v) => setPain(v as 1|2|3|4|5)} />
        <ConditionSlider field="mood" value={mood} onChange={(v) => setMood(v as 1|2|3|4|5)} />
      </div>

      <Input
        id="cond-weight"
        type="number"
        step="0.1"
        label="체중 (kg, 선택)"
        placeholder="예: 5.2"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">증상 태그</label>
        <SymptomTagInput tags={symptoms} onChange={setSymptoms} />
      </div>

      <div>
        <label htmlFor="cond-notes" className="block text-sm font-medium text-gray-700 mb-1">
          메모
        </label>
        <textarea
          id="cond-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="오늘의 특이사항..."
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          rows={3}
        />
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          취소
        </Button>
        <Button className="flex-1" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? '저장 중...' : '저장'}
        </Button>
      </div>
    </div>
  );
}
