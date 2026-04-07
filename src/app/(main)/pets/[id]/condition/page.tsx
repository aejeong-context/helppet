'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useConditionLogs, useCreateConditionLog } from '@/hooks/use-condition-logs';
import { usePet } from '@/hooks/use-pets';
import { ConditionChart } from '@/components/features/condition-chart';
import { ConditionLogForm } from '@/components/features/condition-log-form';
import { ConditionReport } from '@/components/features/condition-report';
import { SymptomFrequency } from '@/components/features/symptom-frequency';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatDate, CONDITION_LABELS } from '@/lib/utils';

const STOOL_LABELS: Record<string, string> = {
  normal: '✅ 정상',
  soft: '💧 묽음',
  diarrhea: '⚠️ 설사',
  hard: '🪨 딱딱함',
  bloody: '🚨 혈변',
};

export default function ConditionLogPage() {
  const { id: petId } = useParams<{ id: string }>();
  const { data: pet } = usePet(petId);
  const { data: logs, isLoading } = useConditionLogs(petId, 30);
  const createLog = useCreateConditionLog();
  const [showForm, setShowForm] = useState(false);
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
          {[...sortedLogs].reverse().map((log) => (
            <Card key={log._id} padding="sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{formatDate(log.date)}</span>
                <span className="text-xs text-gray-400">
                  평균 {((log.appetite + log.activity + log.pain + log.mood) / 4).toFixed(1)}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs text-center">
                {(Object.keys(CONDITION_LABELS) as Array<keyof typeof CONDITION_LABELS>).map((key) => (
                  <div key={key}>
                    <span className="text-gray-500">{CONDITION_LABELS[key]}</span>
                    <div className="font-bold text-primary-600">{log[key]}/5</div>
                  </div>
                ))}
              </div>

              {/* 배변/수분 */}
              {(log.stoolCount !== undefined || log.waterIntake !== undefined) && (
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  {log.stoolCount !== undefined && (
                    <span>💩 {log.stoolCount}회 {log.stoolType && STOOL_LABELS[log.stoolType]}</span>
                  )}
                  {log.waterIntake !== undefined && (
                    <span>💧 수분 {log.waterIntake}/5</span>
                  )}
                </div>
              )}

              {/* 증상 태그 */}
              {log.symptoms && log.symptoms.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {log.symptoms.map((s) => (
                    <span key={s} className="text-xs bg-red-50 text-red-600 px-1.5 py-0.5 rounded">{s}</span>
                  ))}
                </div>
              )}

              {/* 사진 */}
              {log.images && log.images.length > 0 && (
                <div className="flex gap-1.5 mt-2">
                  {log.images.map((img, i) => (
                    <img key={i} src={img} alt={`상태사진-${i}`} className="w-16 h-16 rounded-lg object-cover border border-gray-200" />
                  ))}
                </div>
              )}

              {log.notes && (
                <p className="text-xs text-gray-400 mt-1.5">{log.notes}</p>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-8">아직 기록이 없습니다</p>
      )}

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
