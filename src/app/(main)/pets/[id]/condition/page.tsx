'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useConditionLogs, useCreateConditionLog } from '@/hooks/use-condition-logs';
import { usePet } from '@/hooks/use-pets';
import { ConditionChart } from '@/components/features/condition-chart';
import { ConditionLogForm } from '@/components/features/condition-log-form';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatDate, CONDITION_LABELS } from '@/lib/utils';

export default function ConditionLogPage() {
  const { id: petId } = useParams<{ id: string }>();
  const { data: pet } = usePet(petId);
  const { data: logs, isLoading } = useConditionLogs(petId, 30);
  const createLog = useCreateConditionLog();
  const [showForm, setShowForm] = useState(false);

  if (isLoading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="max-w-md mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">📊 {pet?.name}의 컨디션 일지</h1>
        <Button size="sm" onClick={() => setShowForm(true)}>+ 기록</Button>
      </div>

      <ConditionChart logs={logs?.slice(-7) || []} />

      {/* 일지 리스트 */}
      {logs && logs.length > 0 ? (
        <div className="space-y-2">
          {[...logs].reverse().map((log) => (
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
              {log.symptoms && log.symptoms.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {log.symptoms.map((s) => (
                    <span key={s} className="text-xs bg-red-50 text-red-600 px-1.5 py-0.5 rounded">{s}</span>
                  ))}
                </div>
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
          onSubmit={(data) => createLog.mutate(data, { onSuccess: () => setShowForm(false) })}
          onCancel={() => setShowForm(false)}
          isLoading={createLog.isPending}
        />
      </Modal>
    </div>
  );
}
