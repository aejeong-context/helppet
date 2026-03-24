'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bkend } from '@/lib/bkend';

import type { HealthRecord } from '@/types';

export function useHealthRecords(petId: string) {
  return useQuery<HealthRecord[]>({
    queryKey: ['HealthRecords', petId],
    queryFn: () =>
      bkend.data.list('HealthRecords', {
        petId,
        _sort: 'date',
        _order: 'desc',
      }),
    enabled: !!petId,
  });
}

export function useUpcomingSchedules(petId: string) {
  const today = new Date().toISOString().split('T')[0];
  return useQuery<HealthRecord[]>({
    queryKey: ['HealthRecords', petId, 'upcoming'],
    queryFn: () =>
      bkend.data.list('HealthRecords', {
        petId,
        nextDate_gte: today,
        _sort: 'nextDate',
        _order: 'asc',
        _limit: '5',
      }),
    enabled: !!petId,
  });
}

export function useCreateHealthRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<HealthRecord, '_id' | 'createdAt' | 'updatedAt'>) =>
      bkend.data.create('HealthRecords', data),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({ queryKey: ['HealthRecords', variables.petId] }),
  });
}

export function useUpdateHealthRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<HealthRecord> }) =>
      bkend.data.update('HealthRecords', id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['HealthRecords'] }),
  });
}

export function useDeleteHealthRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bkend.data.delete('HealthRecords', id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['HealthRecords'] }),
  });
}
