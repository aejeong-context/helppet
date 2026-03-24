'use client';

import { CONDITION_LABELS } from '@/lib/utils';

interface ConditionSliderProps {
  field: keyof typeof CONDITION_LABELS;
  value: number;
  onChange: (value: number) => void;
}

const EMOJIS: Record<string, [string, string]> = {
  appetite: ['😫', '😊'],
  activity: ['😫', '😊'],
  pain: ['😣', '😌'],
  mood: ['😢', '😊'],
};

export function ConditionSlider({ field, value, onChange }: ConditionSliderProps) {
  const [lowEmoji, highEmoji] = EMOJIS[field] || ['😫', '😊'];

  return (
    <div className="flex items-center gap-3">
      <span className="w-16 text-sm font-medium text-gray-700">
        {CONDITION_LABELS[field]}
      </span>
      <span className="text-lg">{lowEmoji}</span>
      <input
        type="range"
        min={1}
        max={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
      />
      <span className="text-lg">{highEmoji}</span>
      <span className="w-8 text-sm font-medium text-primary-600 text-right">{value}/5</span>
    </div>
  );
}
