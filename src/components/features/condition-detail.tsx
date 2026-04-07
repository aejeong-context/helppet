'use client';

import { Card } from '@/components/ui/card';
import { CONDITION_LABELS } from '@/lib/utils';
import { OptimizedImage } from '@/components/ui/optimized-image';

import type { ConditionLog } from '@/types';

const STOOL_LABELS: Record<string, string> = {
  normal: '✅ 정상',
  soft: '💧 묽음',
  diarrhea: '⚠️ 설사',
  hard: '🪨 딱딱함',
  bloody: '🚨 혈변',
};

const WATER_LABELS = ['', '매우 적음', '적음', '보통', '충분', '매우 충분'];

interface ConditionDetailProps {
  log: ConditionLog;
  previousLog?: ConditionLog | null;
}

function DiffBadge({ current, previous }: { current: number; previous?: number }) {
  if (previous === undefined) return null;
  const diff = current - previous;
  if (diff === 0) return <span className="text-xs text-gray-300 ml-1">-</span>;
  return (
    <span className={`text-xs ml-1 font-medium ${diff > 0 ? 'text-green-600' : 'text-red-500'}`}>
      {diff > 0 ? `+${diff}` : diff}
    </span>
  );
}

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="h-2 flex-1 rounded-full"
          style={{ backgroundColor: i <= value ? color : '#e5e7eb' }}
        />
      ))}
    </div>
  );
}

function getScoreColor(value: number) {
  if (value >= 4) return '#22c55e';
  if (value >= 3) return '#f59b20';
  return '#ef4444';
}

export function ConditionDetail({ log, previousLog }: ConditionDetailProps) {
  const fields = Object.keys(CONDITION_LABELS) as Array<keyof typeof CONDITION_LABELS>;
  const avgScore = Math.round((log.appetite + log.activity + log.pain + log.mood) / 4 * 10) / 10;

  return (
    <div className="space-y-4">
      {/* 종합 점수 */}
      <div className="text-center py-2">
        <div
          className="text-4xl font-bold"
          style={{ color: getScoreColor(avgScore) }}
        >
          {avgScore}
        </div>
        <p className="text-xs text-gray-400 mt-1">종합 컨디션</p>
      </div>

      {/* 항목별 상세 */}
      <Card padding="sm">
        <div className="space-y-3">
          {fields.map((key) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">{CONDITION_LABELS[key]}</span>
                <div className="flex items-center">
                  <span className="text-sm font-bold" style={{ color: getScoreColor(log[key]) }}>
                    {log[key]}/5
                  </span>
                  {previousLog && <DiffBadge current={log[key]} previous={previousLog[key]} />}
                </div>
              </div>
              <ScoreBar value={log[key]} color={getScoreColor(log[key])} />
            </div>
          ))}
        </div>
      </Card>

      {/* 수분 섭취 */}
      {log.waterIntake !== undefined && (
        <Card padding="sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">💧 수분 섭취</span>
            <span className="text-sm font-bold">{log.waterIntake}/5 ({WATER_LABELS[log.waterIntake]})</span>
          </div>
          <ScoreBar value={log.waterIntake} color="#3b82f6" />
        </Card>
      )}

      {/* 배변 기록 */}
      {log.stoolCount !== undefined && (
        <Card padding="sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">💩 배변</span>
            <span className="text-sm font-bold">
              {log.stoolCount}회 · {log.stoolType ? STOOL_LABELS[log.stoolType] : '-'}
            </span>
          </div>
        </Card>
      )}

      {/* 체중 */}
      {log.weight !== undefined && (
        <Card padding="sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">체중</span>
            <div className="flex items-center">
              <span className="text-sm font-bold">{log.weight}kg</span>
              {previousLog?.weight !== undefined && (
                <DiffBadge
                  current={log.weight * 10}
                  previous={previousLog.weight * 10}
                />
              )}
            </div>
          </div>
        </Card>
      )}

      {/* 증상 태그 */}
      {log.symptoms && log.symptoms.length > 0 && (
        <div>
          <p className="text-sm text-gray-600 mb-1.5">증상</p>
          <div className="flex flex-wrap gap-1.5">
            {log.symptoms.map((s) => (
              <span key={s} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-lg">{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* 사진 */}
      {log.images && log.images.length > 0 && (
        <div>
          <p className="text-sm text-gray-600 mb-1.5">상태 사진</p>
          <div className="grid grid-cols-3 gap-2">
            {log.images.map((img, i) => (
              <OptimizedImage
                key={i}
                src={img}
                alt={`상태사진-${i + 1}`}
                width={200}
                height={200}
                className="w-full aspect-square rounded-lg object-cover border border-gray-200"
                fallback="📷"
              />
            ))}
          </div>
        </div>
      )}

      {/* 메모 */}
      {log.notes && (
        <div>
          <p className="text-sm text-gray-600 mb-1">메모</p>
          <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">{log.notes}</p>
        </div>
      )}
    </div>
  );
}
