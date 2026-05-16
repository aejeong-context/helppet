'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';

import type { Medication } from '@/types';

interface TodayMedicationProps {
  petId: string;
  medications: Medication[];
}

export function TodayMedication({ petId, medications }: TodayMedicationProps) {
  return (
    <div className="space-y-2">
      {medications.map((med) => (
        <Link
          key={med._id}
          href={`/pets/${petId}/medications?edit=${med._id}`}
          aria-label={`${med.name} 편집`}
          className="block focus:outline-none focus:ring-2 focus:ring-primary-300 rounded-lg"
        >
          <Card padding="sm" className="hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer">
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
              <span className="text-gray-300 text-sm flex-shrink-0" aria-hidden>›</span>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
