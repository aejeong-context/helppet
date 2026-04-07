'use client';

import { Card } from '@/components/ui/card';
import { formatShortDate, CONDITION_LABELS } from '@/lib/utils';

import type { ConditionLog } from '@/types';

interface ConditionChartProps {
  logs: ConditionLog[];
}

const FIELD_COLORS: Record<string, string> = {
  appetite: '#f97316',
  activity: '#3b82f6',
  pain: '#ef4444',
  mood: '#a855f7',
};

const FIELD_EMOJI: Record<string, string> = {
  appetite: '🍽️',
  activity: '🏃',
  pain: '💊',
  mood: '😊',
};

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

  const maxBars = 7;
  const displayLogs = logs.slice(-maxBars);
  const fields = Object.keys(CONDITION_LABELS) as Array<keyof typeof CONDITION_LABELS>;

  return (
    <Card>
      {/* 범례 */}
      <div className="flex flex-wrap gap-3 mb-3">
        {fields.map((f) => (
          <span key={f} className="flex items-center gap-1 text-[11px] text-gray-500">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: FIELD_COLORS[f] }} />
            {FIELD_EMOJI[f]} {CONDITION_LABELS[f]}
          </span>
        ))}
      </div>

      {/* 항목별 라인 차트 영역 */}
      <div className="relative h-32 mb-1">
        {/* 가로 기준선 */}
        {[1, 2, 3, 4, 5].map((v) => (
          <div
            key={v}
            className="absolute w-full border-t border-dashed border-gray-100"
            style={{ bottom: `${((v - 1) / 4) * 100}%` }}
          >
            <span className="absolute -left-0 -top-2.5 text-[9px] text-gray-300">{v}</span>
          </div>
        ))}

        {/* 각 항목 점 + 선 */}
        {fields.map((field) => {
          const points = displayLogs.map((log, i) => ({
            x: displayLogs.length === 1 ? 50 : (i / (displayLogs.length - 1)) * 100,
            y: ((log[field] - 1) / 4) * 100,
          }));

          return (
            <svg
              key={field}
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              style={{ overflow: 'visible' }}
            >
              {/* 선 */}
              <polyline
                fill="none"
                stroke={FIELD_COLORS[field]}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.6"
                vectorEffect="non-scaling-stroke"
                points={points.map((p) => `${p.x},${100 - p.y}`).join(' ')}
              />
              {/* 점 */}
              {points.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={100 - p.y}
                  r="2"
                  fill={FIELD_COLORS[field]}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>
          );
        })}
      </div>

      {/* X축 날짜 */}
      <div className="flex justify-between px-0">
        {displayLogs.map((log) => (
          <span key={log._id} className="text-[10px] text-gray-400">{formatShortDate(log.date)}</span>
        ))}
      </div>

      {/* 하단: 수분/배변/증상 요약 */}
      {displayLogs.some((l) => l.waterIntake !== undefined || l.stoolCount !== undefined || (l.symptoms && l.symptoms.length > 0)) && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex gap-1 overflow-x-auto">
            {displayLogs.map((log) => (
              <div key={log._id} className="flex-1 min-w-0 text-center space-y-0.5">
                <p className="text-[10px] text-gray-400">{formatShortDate(log.date)}</p>
                {log.waterIntake !== undefined && (
                  <p className="text-[10px]">{'💧'.repeat(Math.min(log.waterIntake, 3))}</p>
                )}
                {log.stoolCount !== undefined && (
                  <p className="text-[10px] text-amber-600">{log.stoolCount}회</p>
                )}
                {log.symptoms && log.symptoms.length > 0 && (
                  <p className="text-[10px] text-red-400 truncate">{log.symptoms[0]}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
