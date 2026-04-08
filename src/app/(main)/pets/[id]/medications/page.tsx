'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useMedications, useCreateMedication, useUpdateMedication } from '@/hooks/use-medications';
import { usePet } from '@/hooks/use-pets';
import { MedicationCard } from '@/components/features/medication-card';
import { MedicationForm } from '@/components/features/medication-form';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function MedicationsPage() {
  const { id: petId } = useParams<{ id: string }>();
  const { data: pet } = usePet(petId);
  const { data: medications, isLoading } = useMedications(petId);
  const createMedication = useCreateMedication();
  const updateMedication = useUpdateMedication();
  const [showForm, setShowForm] = useState(false);

  const activeMeds = medications?.filter((m) => m.isActive) || [];
  const inactiveMeds = medications?.filter((m) => !m.isActive) || [];

  if (isLoading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div className="max-w-md mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{pet?.name}의 투약 관리</h1>
        <Button size="sm" onClick={() => setShowForm(true)}>+ 추가</Button>
      </div>

      {/* 활성 투약 */}
      {activeMeds.length > 0 ? (
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-2">활성 투약</h2>
          <div className="space-y-2">
            {activeMeds.map((med) => (
              <MedicationCard
                key={med._id}
                medication={med}
                onToggleActive={() =>
                  updateMedication.mutate({ id: med._id, data: { isActive: false } })
                }
              />
            ))}
          </div>
        </section>
      ) : (
        <EmptyState icon="💊" title="등록된 투약이 없습니다" description="투약 스케줄을 등록해보세요" />
      )}

      {/* 종료된 투약 */}
      {inactiveMeds.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 mb-2">종료된 투약</h2>
          <div className="space-y-2 opacity-60">
            {inactiveMeds.map((med) => (
              <MedicationCard
                key={med._id}
                medication={med}
                onToggleActive={() =>
                  updateMedication.mutate({ id: med._id, data: { isActive: true } })
                }
              />
            ))}
          </div>
        </section>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="투약 등록">
        <MedicationForm
          petId={petId}
          onSubmit={(data) => createMedication.mutate(data, { onSuccess: () => setShowForm(false) })}
          onCancel={() => setShowForm(false)}
          isLoading={createMedication.isPending}
        />
      </Modal>
    </div>
  );
}
