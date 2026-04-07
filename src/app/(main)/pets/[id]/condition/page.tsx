'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useConditionLogs, useCreateConditionLog } from '@/hooks/use-condition-logs';
import { usePet } from '@/hooks/use-pets';
import { ConditionChart } from '@/components/features/condition-chart';
import { ConditionLogForm } from '@/components/features/condition-log-form';
import { ConditionReport } from '@/components/features/condition-report';
import { SymptomFrequency } from '@/components/features/symptom-frequency';
import { ConditionDetail } from '@/components/features/condition-detail';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatDate, CONDITION_LABELS } from '@/lib/utils';

import type { ConditionLog } from '@/types';

export default function ConditionLogPage() {
  const { id: petId } = useParams<{ id: string }>();
  const { data: pet } = usePet(petId);
  const { data: logs, isLoading } = useConditionLogs(petId, 30);
  const createLog = useCreateConditionLog();
  const [showForm, setShowForm] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ConditionLog | null>(null);
  const [reportPeriod, setReportPeriod] = useState<'week' | 'month'>('week');

  if (isLoading) return <LoadingSpinner size="lg" className="mt-20" />;

  const sortedLogs = logs ? [...logs].sort((a, b) => a.date.localeCompare(b.date)) : [];
  const previousLog = sortedLogs.length > 0 ? sortedLogs[sortedLogs.length - 1] : null;

  return (
    <div className="max-w-md mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">📊 {pet?.name}의 컨디션 일지</h1>
        <Button size="sm" onClick={() => setShowForm(true)}>+ 기록</Button>
      </div>

      {/* 7일 차트 */}
      <ConditionChart logs={sortedLogs.slice(-7)} />

      {/* 주간/월간 리포트 */}
      <div>
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setReportPeriod('week')}
            className={`text-xs px-3 py-1 rounded-full ${reportPeriod === 'week' ? 'bg-primary-100 text-primary-700 font-medium' : 'text-gray-400'}`}
          >
            주간
          </button>
          <button
            onClick={() => setReportPeriod('month')}
            className={`text-xs px-3 py-1 rounded-full ${reportPeriod === 'month' ? 'bg-primary-100 text-primary-700 font-medium' : 'text-gray-400'}`}
          >
            월간
          </button>
        </div>
        <ConditionReport logs={sortedLogs} period={reportPeriod} />
      </div>

      {/* 증상 빈도 */}
      <SymptomFrequency logs={sortedLogs} days={reportPeriod === 'week' ? 7 : 30} />

      {/* 일지 리스트 */}
      {sortedLogs.length > 0 ? (
        <div className="space-y-2">
          {[...sortedLogs].reverse().map((log) => {
            const avg = ((log.appetite + log.activity + log.pain + log.mood) / 4);
            const avgStr = avg.toFixed(1);
            const color = avg >= 4 ? 'green' : avg >= 3 ? 'amber' : 'red';
            const colorMap = { green: '#22c55e', amber: '#f59b20', red: '#ef4444' };

            return (
              <button
                key={log._id}
                type="button"
                onClick={() => setSelectedLog(log)}
                className="w-full text-left rounded-xl border border-gray-200 bg-white shadow-sm p-3 hover:border-primary-400 hover:shadow-md transition-all active:scale-[0.98]"
              >
                {/* 상단: 날짜 + 종합점수 바 */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-800">{formatDate(log.date)}</span>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: i <= Math.round(avg) ? colorMap[color] : '#e5e7eb' }}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-bold" style={{ color: colorMap[color] }}>
                      {avgStr}
                    </span>
                  </div>
                </div>

                {/* 중단: 4항목 한줄 요약 */}
                <div className="flex gap-3 text-xs">
                  {(Object.keys(CONDITION_LABELS) as Array<keyof typeof CONDITION_LABELS>).map((key) => (
                    <span key={key} className="text-gray-500">
                      {CONDITION_LABELS[key]} <strong className="text-gray-700">{log[key]}</strong>
                    </span>
                  ))}
                </div>

                {/* 하단: 태그/아이콘 요약 */}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {log.waterIntake !== undefined && (
                    <span className="text-xs text-blue-500">💧{log.waterIntake}</span>
                  )}
                  {log.stoolCount !== undefined && (
                    <span className="text-xs text-amber-600">💩{log.stoolCount}</span>
                  )}
                  {log.images && log.images.length > 0 && (
                    <span className="text-xs text-gray-400">📷{log.images.length}</span>
                  )}
                  {log.symptoms && log.symptoms.length > 0 && log.symptoms.slice(0, 2).map((s) => (
                    <span key={s} className="text-xs bg-red-50 text-red-500 px-1.5 py-0.5 rounded">{s}</span>
                  ))}
                  {log.symptoms && log.symptoms.length > 2 && (
                    <span className="text-xs text-gray-400">+{log.symptoms.length - 2}</span>
                  )}
                  {log.notes && (
                    <span className="text-xs text-gray-400">📝</span>
                  )}
                  <span className="ml-auto text-xs text-gray-300">상세 &gt;</span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-8">아직 기록이 없습니다</p>
      )}

      {/* 상세 조회 모달 */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title={selectedLog ? `${formatDate(selectedLog.date)} 컨디션` : ''}
      >
        {selectedLog && (
          <ConditionDetail
            log={selectedLog}
            previousLog={sortedLogs.find((l) => l.date < selectedLog.date && l._id !== selectedLog._id) ? [...sortedLogs].filter((l) => l.date < selectedLog.date).pop() : null}
          />
        )}
      </Modal>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="오늘의 컨디션 기록">
        <ConditionLogForm
          petId={petId}
          previousLog={previousLog}
          onSubmit={(data) => createLog.mutate(data, { onSuccess: () => setShowForm(false) })}
          onCancel={() => setShowForm(false)}
          isLoading={createLog.isPending}
        />
      </Modal>
    </div>
  );
}
