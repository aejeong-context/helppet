'use client';

import { Card } from '@/components/ui/card';
import { formatShortDate } from '@/lib/utils';

import type { ConditionLog } from '@/types';

interface ConditionChartProps {
  logs: ConditionLog[];
}

export function ConditionChart({ logs }: ConditionChartProps) {
  if (logs.length === 0) {
    return (
      <Card>
        <p className="text-sm text-gray-400 text-center py-4">
          아직 컨디션 기록이 없습니다
        </p>
      </Card>
    );
  }

  const avgScore = (log: ConditionLog) =>
    Math.round((log.appetite + log.activity + log.pain + log.mood) / 4 * 10) / 10;

  const maxBars = 7;
  const displayLogs = logs.slice(-maxBars);

  return (
    <Card>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">최근 컨디션 (7일)</h3>
      <div className="flex items-end gap-1.5 h-24">
        {displayLogs.map((log) => {
          const avg = avgScore(log);
          const heightPercent = (avg / 5) * 100;

          return (
            <div key={log._id} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-gray-500">{avg}</span>
              <div className="w-full bg-gray-100 rounded-t relative" style={{ height: '80px' }}>
                <div
                  className="absolute bottom-0 w-full rounded-t transition-all"
                  style={{
                    height: `${heightPercent}%`,
                    backgroundColor:
                      avg >= 4 ? '#22c55e' : avg >= 3 ? '#f59b20' : '#ef4444',
                  }}
                />
              </div>
              <span className="text-xs text-gray-400">{formatShortDate(log.date)}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
