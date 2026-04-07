'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';

import type { ConditionLog } from '@/types';

interface SymptomFrequencyProps {
  logs: ConditionLog[];
  days?: number;
}

export function SymptomFrequency({ logs, days = 30 }: SymptomFrequencyProps) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split('T')[0];

  const frequency = useMemo(() => {
    const map: Record<string, number> = {};
    for (const log of logs) {
      if (log.date < cutoffStr || !log.symptoms) continue;
      for (const s of log.symptoms) {
        map[s] = (map[s] || 0) + 1;
      }
    }
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [logs, cutoffStr]);

  if (frequency.length === 0) {
    return null;
  }

  const max = frequency[0][1];

  return (
    <Card>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        🏷️ 증상 빈도 <span className="text-xs text-gray-400">최근 {days}일</span>
      </h3>
      <div className="space-y-2">
        {frequency.map(([symptom, count]) => (
          <div key={symptom} className="flex items-center gap-2">
            <span className="w-20 text-xs text-gray-600 truncate">{symptom}</span>
            <div className="flex-1 h-3 bg-gray-100 rounded-full">
              <div
                className="h-3 bg-red-400 rounded-full transition-all"
                style={{ width: `${(count / max) * 100}%` }}
              />
            </div>
            <span className="w-10 text-xs font-medium text-right text-red-600">{count}회</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
