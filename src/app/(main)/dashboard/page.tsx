'use client';

import { useState } from 'react';
import { usePets } from '@/hooks/use-pets';
import { useActiveMedications } from '@/hooks/use-medications';
import { useConditionLogs } from '@/hooks/use-condition-logs';
import { useUpcomingSchedules } from '@/hooks/use-health-records';
import { useCreateConditionLog } from '@/hooks/use-condition-logs';
import { PetSelector } from '@/components/features/pet-selector';
import { TodayMedication } from '@/components/features/today-medication';
import { ConditionChart } from '@/components/features/condition-chart';
import { ConditionLogForm } from '@/components/features/condition-log-form';
import { UpcomingSchedule } from '@/components/features/upcoming-schedule';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: pets, isLoading: petsLoading } = usePets();
  const [selectedPetId, setSelectedPetId] = useState('');
  const [showConditionForm, setShowConditionForm] = useState(false);

  const activePetId = selectedPetId || pets?.[0]?._id || '';

  const { data: medications } = useActiveMedications(activePetId);
  const { data: conditionLogs } = useConditionLogs(activePetId);
  const { data: upcomingRecords } = useUpcomingSchedules(activePetId);
  const createConditionLog = useCreateConditionLog();

  const selectedPet = pets?.find((p) => p._id === activePetId);

  if (petsLoading) return <LoadingSpinner size="lg" className="mt-20" />;

  if (!pets || pets.length === 0) {
    return (
      <EmptyState
        icon="🐾"
        title="반려동물을 등록해주세요"
        description="건강관리를 시작하려면 먼저 반려동물을 등록하세요"
        action={
          <Link href="/pets/new">
            <Button>반려동물 등록하기</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">
          {selectedPet?.isSenior ? '🧓' : '🐾'} {selectedPet?.name}의 오늘
        </h1>
        <PetSelector
          pets={pets}
          selectedId={activePetId}
          onSelect={setSelectedPetId}
        />
      </div>

      {/* 오늘의 투약 */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-700">💊 오늘의 투약</h2>
          <Link href={`/pets/${activePetId}/medications`} className="text-xs text-primary-600">
            관리 →
          </Link>
        </div>
        {medications && medications.length > 0 ? (
          <TodayMedication petId={activePetId} medications={medications} />
        ) : (
          <Card>
            <p className="text-sm text-gray-400 text-center">등록된 투약이 없습니다</p>
          </Card>
        )}
      </section>

      {/* 컨디션 차트 */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 mb-2">📊 최근 컨디션</h2>
        <ConditionChart logs={conditionLogs || []} />
      </section>

      {/* 다가오는 일정 */}
      {upcomingRecords && upcomingRecords.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-2">📋 다가오는 일정</h2>
          <UpcomingSchedule records={upcomingRecords} />
        </section>
      )}

      {/* 컨디션 기록 버튼 */}
      <Button
        className="w-full"
        size="lg"
        onClick={() => setShowConditionForm(true)}
      >
        + 컨디션 기록하기
      </Button>

      {/* 컨디션 기록 모달 */}
      <Modal
        isOpen={showConditionForm}
        onClose={() => setShowConditionForm(false)}
        title={`오늘의 컨디션 기록`}
      >
        <ConditionLogForm
          petId={activePetId}
          previousLog={conditionLogs?.[conditionLogs.length - 1] || null}
          onSubmit={(data) => {
            createConditionLog.mutate(data, {
              onSuccess: () => setShowConditionForm(false),
            });
          }}
          onCancel={() => setShowConditionForm(false)}
          isLoading={createConditionLog.isPending}
        />
      </Modal>
    </div>
  );
}
