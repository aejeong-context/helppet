'use client';

import { Card } from '@/components/ui/card';

import type { Medication } from '@/types';

interface MedicationCardProps {
  medication: Medication;
  currentTime?: string;
  onEdit?: () => void;
  onToggleActive?: () => void;
}

export function MedicationCard({ medication, onEdit, onToggleActive }: MedicationCardProps) {
  return (
    <Card padding="sm" className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{medication.name}</span>
          {!medication.isActive && (
            <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">종료</span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5">
          {medication.dosage} · {medication.frequency}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {medication.timeSlots.join(', ')}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {onEdit && (
          <button onClick={onEdit} className="text-xs text-gray-500 hover:text-gray-700">
            수정
          </button>
        )}
        {onToggleActive && (
          <button
            onClick={onToggleActive}
            className="text-xs text-red-500 hover:text-red-700"
          >
            {medication.isActive ? '중단' : '재개'}
          </button>
        )}
      </div>
    </Card>
  );
}
