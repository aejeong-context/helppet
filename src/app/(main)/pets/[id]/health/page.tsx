'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useHealthRecords, useCreateHealthRecord, useDeleteHealthRecord } from '@/hooks/use-health-records';
import { usePet } from '@/hooks/use-pets';
import { HealthRecordCard } from '@/components/features/health-record-card';
import { HealthRecordForm } from '@/components/features/health-record-form';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function HealthRecordsPage() {
  const { id: petId } = useParams<{ id: string }>();
  const { data: pet } = usePet(petId);
  const { data: records, isLoading } = useHealthRecords(petId);
  const createRecord = useCreateHealthRecord();
  const deleteRecord = useDeleteHealthRecord();
  const [showForm, setShowForm] = useState(false);

  if (isLoading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="max-w-md mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">🩺 {pet?.name}의 건강기록</h1>
        <Button size="sm" onClick={() => setShowForm(true)}>+ 기록 추가</Button>
      </div>

      {!records || records.length === 0 ? (
        <EmptyState icon="🩺" title="건강기록이 없습니다" description="진료 기록을 추가해보세요" />
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <HealthRecordCard
              key={record._id}
              record={record}
              onDelete={() => deleteRecord.mutate(record._id)}
            />
          ))}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="건강기록 추가">
        <HealthRecordForm
          petId={petId}
          onSubmit={(data) => createRecord.mutate(data, { onSuccess: () => setShowForm(false) })}
          onCancel={() => setShowForm(false)}
          isLoading={createRecord.isPending}
        />
      </Modal>
    </div>
  );
}
