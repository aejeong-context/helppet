'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConditionSlider } from './condition-slider';
import { SymptomTagInput } from '@/components/ui/symptom-tag-input';
import { ImageUploader } from '@/components/ui/image-uploader';
import { getToday, CONDITION_LABELS } from '@/lib/utils';

import type { ConditionLog } from '@/types';

type ConditionLogFormData = Omit<ConditionLog, '_id' | 'createdAt' | 'updatedAt'>;

const STOOL_OPTIONS = [
  { value: 'normal', label: '정상', emoji: '✅' },
  { value: 'soft', label: '묽음', emoji: '💧' },
  { value: 'diarrhea', label: '설사', emoji: '⚠️' },
  { value: 'hard', label: '딱딱함', emoji: '🪨' },
  { value: 'bloody', label: '혈변', emoji: '🚨' },
] as const;

interface ConditionLogFormProps {
  petId: string;
  previousLog?: ConditionLog | null;
  onSubmit: (data: ConditionLogFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

function DiffBadge({ current, previous }: { current: number; previous?: number }) {
  if (previous === undefined) return null;
  const diff = current - previous;
  if (diff === 0) return null;
  return (
    <span className={`text-xs ml-1 ${diff > 0 ? 'text-green-600' : 'text-red-500'}`}>
      {diff > 0 ? `▲${diff}` : `▼${Math.abs(diff)}`}
    </span>
  );
}

export function ConditionLogForm({ petId, previousLog, onSubmit, onCancel, isLoading }: ConditionLogFormProps) {
  const [appetite, setAppetite] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [activity, setActivity] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [pain, setPain] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [weight, setWeight] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [stoolCount, setStoolCount] = useState('');
  const [stoolType, setStoolType] = useState<ConditionLog['stoolType']>('normal');
  const [waterIntake, setWaterIntake] = useState<1 | 2 | 3 | 4 | 5>(3);

  const scores = { appetite, activity, pain, mood };

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
      images: images.length > 0 ? images : undefined,
      stoolCount: stoolCount ? Number(stoolCount) : undefined,
      stoolType: stoolCount ? stoolType : undefined,
      waterIntake,
    });
  };

  return (
    <div className="space-y-5">
      {/* 어제 대비 변화 요약 */}
      {previousLog && (
        <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
          <p className="font-medium mb-1">어제 기록 대비</p>
          <div className="grid grid-cols-4 gap-2 text-center">
            {(Object.keys(CONDITION_LABELS) as Array<keyof typeof CONDITION_LABELS>).map((key) => (
              <div key={key}>
                <span className="text-gray-400">{CONDITION_LABELS[key]}</span>
                <div className="font-bold">
                  {previousLog[key]}
                  <DiffBadge current={scores[key]} previous={previousLog[key]} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 기본 컨디션 슬라이더 */}
      <div className="space-y-3">
        <ConditionSlider field="appetite" value={appetite} onChange={(v) => setAppetite(v as 1|2|3|4|5)} />
        <ConditionSlider field="activity" value={activity} onChange={(v) => setActivity(v as 1|2|3|4|5)} />
        <ConditionSlider field="pain" value={pain} onChange={(v) => setPain(v as 1|2|3|4|5)} />
        <ConditionSlider field="mood" value={mood} onChange={(v) => setMood(v as 1|2|3|4|5)} />
      </div>

      {/* 수분 섭취 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">💧 수분 섭취</label>
        <div className="flex gap-2">
          {([1, 2, 3, 4, 5] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setWaterIntake(v)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                waterIntake === v
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                  : 'bg-gray-50 text-gray-500 border border-gray-200'
              }`}
            >
              {'💧'.repeat(v)}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-1">1=매우 적음 ~ 5=충분</p>
      </div>

      {/* 배변 기록 */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          id="cond-stool-count"
          type="number"
          label="💩 배변 횟수"
          placeholder="0"
          min={0}
          value={stoolCount}
          onChange={(e) => setStoolCount(e.target.value)}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">배변 상태</label>
          <select
            value={stoolType}
            onChange={(e) => setStoolType(e.target.value as ConditionLog['stoolType'])}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          >
            {STOOL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.emoji} {opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 체중 */}
      <Input
        id="cond-weight"
        type="number"
        step="0.1"
        label="체중 (kg, 선택)"
        placeholder="예: 5.2"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
      />

      {/* 증상 태그 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">증상 태그</label>
        <SymptomTagInput tags={symptoms} onChange={setSymptoms} />
      </div>

      {/* 상태 사진 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">📷 상태 사진 (선택)</label>
        <ImageUploader maxFiles={3} value={images} onChange={setImages} />
        <p className="text-xs text-gray-400 mt-1">피부, 눈, 상처 등 변화 기록</p>
      </div>

      {/* 메모 */}
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
