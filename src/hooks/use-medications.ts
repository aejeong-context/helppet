'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bkend } from '@/lib/bkend';

import type { Medication } from '@/types';

export function useMedications(petId: string) {
  return useQuery<Medication[]>({
    queryKey: ['Medications', petId],
    queryFn: () => bkend.data.list('Medications', { petId }),
    enabled: !!petId,
  });
}

export function useActiveMedications(petId: string) {
  return useQuery<Medication[]>({
    queryKey: ['Medications', petId, 'active'],
    queryFn: () => bkend.data.list('Medications', { petId, isActive: 'true' }),
    enabled: !!petId,
  });
}

export function useCreateMedication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Medication, '_id' | 'createdAt' | 'updatedAt'>) =>
      bkend.data.create('Medications', data),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({ queryKey: ['Medications', variables.petId] }),
  });
}

export function useUpdateMedication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Medication> }) =>
      bkend.data.update('Medications', id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['Medications'] }),
  });
}
