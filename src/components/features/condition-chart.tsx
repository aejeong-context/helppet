'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { formatShortDate } from '@/lib/utils';

import type { ConditionLog } from '@/types';

interface ConditionChartProps {
  logs: ConditionLog[];
  /** 지정 시 각 행이 해당 pet의 condition 편집 화면으로 가는 링크가 됨 */
  petId?: string;
}

const MAX_ROWS = 7;

function scoreStyle(avg: number) {
  if (avg >= 4) return { color: '#22c55e', emoji: '😊' };
  if (avg >= 3) return { color: '#f59b20', emoji: '😐' };
  return { color: '#ef4444', emoji: '😟' };
}

export function ConditionChart({ logs, petId }: ConditionChartProps) {
  if (logs.length === 0) {
    return (
      <Card>
        <p className="text-sm text-gray-400 text-center py-4">
          아직 컨디션 기록이 없습니다
        </p>
      </Card>
    );
  }

  const displayLogs = logs.slice(-MAX_ROWS).reverse();

  return (
    <Card>
      <ul className="divide-y divide-gray-100">
        {displayLogs.map((log) => {
          // pain은 "높음=심한 통증"이므로 종합 점수 계산 시 반전
          const adjustedPain = 6 - log.pain;
          const avg = (log.appetite + log.activity + adjustedPain + log.mood) / 4;
          const { color, emoji } = scoreStyle(avg);
          const filled = Math.round(avg);
          const hasExtras =
            log.waterIntake !== undefined ||
            log.stoolCount !== undefined ||
            (log.symptoms && log.symptoms.length > 0);

          const rowBody = (
            <>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-medium text-gray-600 w-9 flex-shrink-0">
                  {formatShortDate(log.date)}
                </span>
                <div className="flex gap-0.5 flex-shrink-0" aria-hidden>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-3 h-2 rounded-sm"
                      style={{ backgroundColor: i <= filled ? color : '#e5e7eb' }}
                    />
                  ))}
                </div>
                <span className="text-base leading-none flex-shrink-0">{emoji}</span>
                <span
                  className="text-sm font-bold w-8 text-right flex-shrink-0"
                  style={{ color }}
                >
                  {avg.toFixed(1)}
                </span>
                {petId && (
                  <span className="ml-auto text-gray-300 text-sm flex-shrink-0" aria-hidden>
                    ›
                  </span>
                )}
              </div>
              {hasExtras && (
                <div className="mt-1 ml-[2.875rem] flex items-center gap-2 text-[11px] text-gray-500">
                  {log.waterIntake !== undefined && (
                    <span className="text-blue-500">💧 {log.waterIntake}/5</span>
                  )}
                  {log.stoolCount !== undefined && (
                    <span className="text-amber-600">💩 {log.stoolCount}회</span>
                  )}
                  {log.symptoms && log.symptoms.length > 0 && (
                    <span className="text-red-400 truncate min-w-0">
                      {log.symptoms.join(', ')}
                    </span>
                  )}
                </div>
              )}
            </>
          );

          return (
            <li key={log._id} className="first:[&>*]:pt-0 last:[&>*]:pb-0">
              {petId ? (
                <Link
                  href={`/pets/${petId}/condition?edit=${log._id}&from=/dashboard`}
                  aria-label={`${formatShortDate(log.date)} 컨디션 편집`}
                  className="block py-2 -mx-1 px-1 rounded-md hover:bg-gray-50 active:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300"
                >
                  {rowBody}
                </Link>
              ) : (
                <div className="py-2">{rowBody}</div>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
