'use client';

import { Card } from '@/components/ui/card';
import { useTodayMedicationLogs, useCheckMedication, useUncheckMedication } from '@/hooks/use-medication-logs';

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
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      checked
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : isPast
                          ? 'bg-red-50 text-red-400 border border-red-200'
                          : 'bg-gray-50 text-gray-500 border border-gray-200'
                    }`}
                  >
                    <span>{checked ? '\u2705' : isPast ? '\u23F0' : '\u2B55'}</span>
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
