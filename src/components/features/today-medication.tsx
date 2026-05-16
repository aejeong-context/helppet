'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import {
  useTodayMedicationLogs,
  useCheckMedication,
  useUncheckMedication,
} from '@/hooks/use-medication-logs';
import { cn } from '@/lib/utils';

import type { Medication } from '@/types';

interface TodayMedicationProps {
  petId: string;
  medications: Medication[];
}

export function TodayMedication({ petId, medications }: TodayMedicationProps) {
  const { data: logs } = useTodayMedicationLogs(petId);
  const checkMed = useCheckMedication();
  const uncheckMed = useUncheckMedication();

  const findLog = (medicationId: string, timeSlot: string) =>
    logs?.find((l) => l.medicationId === medicationId && l.timeSlot === timeSlot);

  const handleToggle = (medicationId: string, timeSlot: string) => {
    const existing = findLog(medicationId, timeSlot);
    if (existing) {
      uncheckMed.mutate({ id: existing._id, petId });
    } else {
      checkMed.mutate({ petId, medicationId, timeSlot });
    }
  };

  const isBusy = checkMed.isPending || uncheckMed.isPending;

  const now = new Date();
  const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return (
    <div className="space-y-2">
      {medications.map((med) => {
        const sortedTimeSlots = [...med.timeSlots].sort();
        const checkedCount = sortedTimeSlots.filter((ts) => findLog(med._id, ts)).length;
        const totalCount = sortedTimeSlots.length;
        const allDone = totalCount > 0 && checkedCount === totalCount;

        return (
          <Card key={med._id} padding="sm">
            {/* 약명/용량/메모: 클릭 시 편집 페이지로 */}
            <Link
              href={`/pets/${petId}/medications?edit=${med._id}&from=/dashboard`}
              aria-label={`${med.name} 편집`}
              className="block -m-1 p-1 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-300"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium text-sm truncate">{med.name}</span>
                    <span className="text-xs text-gray-400 flex-shrink-0">{med.dosage}</span>
                  </div>
                  {med.notes && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{med.notes}</p>
                  )}
                </div>
                {allDone ? (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex-shrink-0">
                    완료
                  </span>
                ) : (
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {checkedCount}/{totalCount}
                  </span>
                )}
              </div>
            </Link>

            {/* 시간 슬롯 체크 버튼: 편집 네비게이션과는 독립 */}
            <div className="flex flex-wrap gap-2 mt-2">
              {sortedTimeSlots.map((ts) => {
                const checked = !!findLog(med._id, ts);
                const isPast = ts <= currentHHMM;

                return (
                  <button
                    key={ts}
                    type="button"
                    onClick={() => handleToggle(med._id, ts)}
                    disabled={isBusy}
                    aria-pressed={checked}
                    aria-label={
                      checked
                        ? `${med.name} ${ts} 복용 완료`
                        : isPast
                          ? `${med.name} ${ts} 미복용, 시간 지남`
                          : `${med.name} ${ts} 예정`
                    }
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
                      'disabled:opacity-60 disabled:cursor-not-allowed',
                      checked
                        ? 'bg-green-500 text-white border-2 border-green-600 shadow-sm'
                        : isPast
                          ? 'bg-amber-100 text-amber-800 border-2 border-amber-400 animate-pulse'
                          : 'bg-gray-50 text-gray-400 border border-gray-200',
                    )}
                  >
                    <span className="text-sm leading-none" aria-hidden="true">
                      {checked ? '✅' : isPast ? '⏰' : '☐'}
                    </span>
                    <span>{ts}</span>
                  </button>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
