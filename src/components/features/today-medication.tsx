'use client';

import { Card } from '@/components/ui/card';
import { useTodayMedicationLogs, useCheckMedication, useUncheckMedication } from '@/hooks/use-medication-logs';
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

  const isChecked = (medicationId: string, timeSlot: string) =>
    logs?.find((l) => l.medicationId === medicationId && l.timeSlot === timeSlot);

  const handleToggle = (medicationId: string, timeSlot: string) => {
    const existing = isChecked(medicationId, timeSlot);
    if (existing) {
      uncheckMed.mutate({ id: existing._id, petId });
    } else {
      checkMed.mutate({ petId, medicationId, timeSlot });
    }
  };

  const now = new Date();
  const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return (
    <div className="space-y-2">
      {medications.map((med) => {
        const checkedCount = med.timeSlots.filter((ts) => isChecked(med._id, ts)).length;
        const totalCount = med.timeSlots.length;
        const allDone = checkedCount === totalCount && totalCount > 0;

        return (
          <Card key={med._id} padding="sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{med.name}</span>
                <span className="text-xs text-gray-400">{med.dosage}</span>
              </div>
              {allDone ? (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">완료</span>
              ) : (
                <span className="text-xs text-gray-400">{checkedCount}/{totalCount}</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {med.timeSlots.map((ts) => {
                const checked = !!isChecked(med._id, ts);
                const isPast = ts <= currentHHMM;

                return (
                  <button
                    key={ts}
                    type="button"
                    onClick={() => handleToggle(med._id, ts)}
                    disabled={checkMed.isPending || uncheckMed.isPending}
                    aria-pressed={checked ? true : false}
                    aria-label={
                      checked
                        ? `${med.name} ${ts} \uBCF5\uC6A9 \uC644\uB8CC`
                        : isPast
                          ? `${med.name} ${ts} \uBBF8\uBCF5\uC6A9, \uC2DC\uAC04 \uC9C0\uB0A8`
                          : `${med.name} ${ts} \uC608\uC815`
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
                      {checked ? '\u2705' : isPast ? '\u23F0' : '\u2610'}
                    </span>
                    <span>{ts}</span>
                  </button>
                );
              })}
            </div>
            {med.notes && (
              <p className="text-xs text-gray-400 mt-1.5">{med.notes}</p>
            )}
          </Card>
        );
      })}
    </div>
  );
}
