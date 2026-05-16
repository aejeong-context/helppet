'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const { data: pet } = usePet(petId);
  const { data: medications, isLoading } = useMedications(petId);
  const createMedication = useCreateMedication();
  const updateMedication = useUpdateMedication();
  const [showForm, setShowForm] = useState(false);

  const editingMed = editId ? medications?.find((m) => m._id === editId) : undefined;

  // ?edit=... 으로 진입 시 자동으로 편집 모달 오픈 (medications 로드 후)
  useEffect(() => {
    if (editId && editingMed) {
      setShowForm(true);
    }
  }, [editId, editingMed]);

  const closeForm = () => {
    setShowForm(false);
    if (editId) {
      router.replace(`/pets/${petId}/medications`);
    }
  };

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
                onEdit={() => router.push(`/pets/${petId}/medications?edit=${med._id}`)}
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

      <Modal
        isOpen={showForm}
        onClose={closeForm}
        title={editingMed ? '투약 편집' : '투약 등록'}
      >
        {editingMed ? (
          <MedicationForm
            key={editingMed._id}
            petId={petId}
            defaultValues={editingMed}
            onSubmit={(data) =>
              updateMedication.mutate(
                { id: editingMed._id, data },
                { onSuccess: closeForm },
              )
            }
            onCancel={closeForm}
            isLoading={updateMedication.isPending}
          />
        ) : (
          <MedicationForm
            petId={petId}
            onSubmit={(data) =>
              createMedication.mutate(data, { onSuccess: closeForm })
            }
            onCancel={closeForm}
            isLoading={createMedication.isPending}
          />
        )}
      </Modal>
    </div>
  );
}
