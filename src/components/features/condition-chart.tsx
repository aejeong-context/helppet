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

const fields = Object.keys(CONDITION_LABELS) as Array<keyof typeof CONDITION_LABELS>;

function ScoreDot({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex gap-px">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: i <= value ? color : '#e5e7eb' }}
        />
      ))}
    </div>
  );
}

/** 데이터 4개 이하: 일별 카드형 */
function CardView({ logs }: { logs: ConditionLog[] }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(logs.length, 3)}, 1fr)` }}>
      {logs.map((log) => {
        const avg = (log.appetite + log.activity + log.pain + log.mood) / 4;
        const colorKey = avg >= 4 ? '#22c55e' : avg >= 3 ? '#f59b20' : '#ef4444';
        return (
          <div key={log._id} className="rounded-lg bg-gray-50 p-2.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700">{formatShortDate(log.date)}</span>
              <span className="text-xs font-bold" style={{ color: colorKey }}>{avg.toFixed(1)}</span>
            </div>
            <div className="space-y-1.5">
              {fields.map((f) => (
                <div key={f} className="flex items-center justify-between gap-1">
                  <span className="text-[10px] text-gray-400">{FIELD_EMOJI[f]}</span>
                  <ScoreDot value={log[f]} color={FIELD_COLORS[f]} />
                  <span className="text-[10px] font-medium text-gray-600 w-3 text-right">{log[f]}</span>
                </div>
              ))}
            </div>
            {/* 부가 정보 */}
            <div className="space-y-0.5 pt-1 border-t border-gray-100">
              {log.waterIntake !== undefined && (
                <p className="text-[10px] text-blue-500">💧 {log.waterIntake}/5</p>
              )}
              {log.stoolCount !== undefined && (
                <p className="text-[10px] text-amber-600">💩 {log.stoolCount}회</p>
              )}
              {log.symptoms && log.symptoms.length > 0 && (
                <p className="text-[10px] text-red-400 truncate">{log.symptoms.join(', ')}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** 데이터 5개 이상: 라인차트 */
function LineChart({ logs }: { logs: ConditionLog[] }) {
  const padding = 8; // % 좌우 여백

  return (
    <>
      {/* 범례 */}
      <div className="flex flex-wrap gap-3 mb-3">
        {fields.map((f) => (
          <span key={f} className="flex items-center gap-1 text-[11px] text-gray-500">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: FIELD_COLORS[f] }} />
            {FIELD_EMOJI[f]} {CONDITION_LABELS[f]}
          </span>
        ))}
      </div>

      {/* 차트 */}
      <div className="relative h-28 mb-1">
        {[1, 2, 3, 4, 5].map((v) => (
          <div
            key={v}
            className="absolute w-full border-t border-dashed border-gray-100"
            style={{ bottom: `${((v - 1) / 4) * 100}%` }}
          >
            <span className="absolute -left-0 -top-2.5 text-[9px] text-gray-300">{v}</span>
          </div>
        ))}

        {fields.map((field) => {
          const points = logs.map((log, i) => ({
            x: padding + (i / (logs.length - 1)) * (100 - padding * 2),
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
              {points.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={100 - p.y}
                  r="2.5"
                  fill={FIELD_COLORS[field]}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>
          );
        })}
      </div>

      {/* X축 */}
      <div className="flex justify-between" style={{ padding: `0 ${padding - 2}%` }}>
        {logs.map((log) => (
          <span key={log._id} className="text-[10px] text-gray-400">{formatShortDate(log.date)}</span>
        ))}
      </div>

      {/* 하단 부가 정보 */}
      {logs.some((l) => l.waterIntake !== undefined || l.stoolCount !== undefined || (l.symptoms && l.symptoms.length > 0)) && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex" style={{ padding: `0 ${padding - 2}%` }}>
            {logs.map((log) => (
              <div key={log._id} className="flex-1 min-w-0 text-center space-y-0.5">
                {log.waterIntake !== undefined && (
                  <p className="text-[10px] text-blue-500">💧{log.waterIntake}</p>
                )}
                {log.stoolCount !== undefined && (
                  <p className="text-[10px] text-amber-600">💩{log.stoolCount}</p>
                )}
                {log.symptoms && log.symptoms.length > 0 && (
                  <p className="text-[10px] text-red-400 truncate">{log.symptoms[0]}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
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

  const maxBars = 7;
  const displayLogs = logs.slice(-maxBars);

  return (
    <Card>
      {displayLogs.length < 5 ? (
        <CardView logs={displayLogs} />
      ) : (
        <LineChart logs={displayLogs} />
      )}
    </Card>
  );
}
