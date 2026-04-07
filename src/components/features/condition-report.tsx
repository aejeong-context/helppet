'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { CONDITION_LABELS } from '@/lib/utils';

import type { ConditionLog } from '@/types';

interface ConditionReportProps {
  logs: ConditionLog[];
  period: 'week' | 'month';
}

function avg(nums: number[]) {
  return nums.length ? Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10 : 0;
}

export function ConditionReport({ logs, period }: ConditionReportProps) {
  const now = new Date();
  const daysBack = period === 'week' ? 7 : 30;
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - daysBack);
  const cutoffStr = cutoff.toISOString().split('T')[0];

  const prevCutoff = new Date(cutoff);
  prevCutoff.setDate(prevCutoff.getDate() - daysBack);
  const prevCutoffStr = prevCutoff.toISOString().split('T')[0];

  const currentLogs = useMemo(() => logs.filter((l) => l.date >= cutoffStr), [logs, cutoffStr]);
  const prevLogs = useMemo(() => logs.filter((l) => l.date >= prevCutoffStr && l.date < cutoffStr), [logs, prevCutoffStr, cutoffStr]);

  const fields = Object.keys(CONDITION_LABELS) as Array<keyof typeof CONDITION_LABELS>;

  const currentAvgs = useMemo(() => {
    const result: Record<string, number> = {};
    for (const f of fields) {
      result[f] = avg(currentLogs.map((l) => l[f]));
    }
    result.overall = avg(fields.map((f) => result[f]));
    return result;
  }, [currentLogs, fields]);

  const prevAvgs = useMemo(() => {
    const result: Record<string, number> = {};
    for (const f of fields) {
      result[f] = avg(prevLogs.map((l) => l[f]));
    }
    result.overall = avg(fields.map((f) => result[f]));
    return result;
  }, [prevLogs, fields]);

  const stoolLogs = currentLogs.filter((l) => l.stoolCount !== undefined);
  const avgStool = avg(stoolLogs.map((l) => l.stoolCount!));
  const waterLogs = currentLogs.filter((l) => l.waterIntake !== undefined);
  const avgWater = avg(waterLogs.map((l) => l.waterIntake!));

  if (currentLogs.length === 0) {
    return (
      <Card>
        <p className="text-sm text-gray-400 text-center py-4">
          {period === 'week' ? '최근 7일' : '최근 30일'} 기록이 없습니다
        </p>
      </Card>
    );
  }

  const diff = (key: string) => {
    if (!prevAvgs[key]) return null;
    const d = Math.round((currentAvgs[key] - prevAvgs[key]) * 10) / 10;
    if (d === 0) return null;
    return d;
  };

  return (
    <Card>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        {period === 'week' ? '📊 주간 리포트' : '📊 월간 리포트'}
        <span className="text-xs text-gray-400 ml-2">{currentLogs.length}일 기록</span>
      </h3>

      {/* 종합 점수 */}
      <div className="text-center mb-4">
        <div className="text-3xl font-bold text-primary-600">{currentAvgs.overall}</div>
        <p className="text-xs text-gray-400">
          종합 평균
          {diff('overall') !== null && (
            <span className={diff('overall')! > 0 ? 'text-green-600 ml-1' : 'text-red-500 ml-1'}>
              ({diff('overall')! > 0 ? '+' : ''}{diff('overall')} vs 이전 {period === 'week' ? '주' : '달'})
            </span>
          )}
        </p>
      </div>

      {/* 항목별 */}
      <div className="space-y-2">
        {fields.map((key) => {
          const d = diff(key);
          const pct = (currentAvgs[key] / 5) * 100;
          return (
            <div key={key} className="flex items-center gap-2">
              <span className="w-12 text-xs text-gray-500">{CONDITION_LABELS[key]}</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: currentAvgs[key] >= 4 ? '#22c55e' : currentAvgs[key] >= 3 ? '#f59b20' : '#ef4444',
                  }}
                />
              </div>
              <span className="w-8 text-xs font-medium text-right">{currentAvgs[key]}</span>
              {d !== null && (
                <span className={`w-8 text-xs ${d > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {d > 0 ? '▲' : '▼'}{Math.abs(d)}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* 배변/수분 요약 */}
      {(stoolLogs.length > 0 || waterLogs.length > 0) && (
        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-gray-100">
          {stoolLogs.length > 0 && (
            <div className="text-center">
              <p className="text-xs text-gray-400">평균 배변</p>
              <p className="text-lg font-bold">{avgStool}회/일</p>
            </div>
          )}
          {waterLogs.length > 0 && (
            <div className="text-center">
              <p className="text-xs text-gray-400">평균 수분</p>
              <p className="text-lg font-bold">{avgWater}/5</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
