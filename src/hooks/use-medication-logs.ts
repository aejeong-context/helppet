'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bkend } from '@/lib/bkend';

import type { MedicationLog } from '@/types';

export function useTodayMedicationLogs(petId: string) {
  const today = new Date().toISOString().split('T')[0];
  return useQuery<MedicationLog[]>({
    queryKey: ['MedicationLogs', petId, today],
    queryFn: () => bkend.data.list('MedicationLogs', { petId, date: today }),
    enabled: !!petId,
  });
}

export function useCheckMedication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { petId: string; medicationId: string; timeSlot: string }) =>
      bkend.data.create('MedicationLogs', {
        ...data,
        date: new Date().toISOString().split('T')[0],
        takenAt: new Date().toISOString(),
      }),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({ queryKey: ['MedicationLogs', variables.petId] }),
  });
}

export function useUncheckMedication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, petId }: { id: string; petId: string }) =>
      bkend.data.delete('MedicationLogs', id),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({ queryKey: ['MedicationLogs', variables.petId] }),
  });
}
