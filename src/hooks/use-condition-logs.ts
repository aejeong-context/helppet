'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bkend } from '@/lib/bkend';
import { getDaysAgo } from '@/lib/utils';

import type { ConditionLog } from '@/types';

export function useConditionLogs(petId: string, days = 7) {
  return useQuery<ConditionLog[]>({
    queryKey: ['ConditionLogs', petId, days],
    queryFn: () =>
      bkend.data.list('ConditionLogs', {
        petId,
        date_gte: getDaysAgo(days),
        _sort: 'date',
        _order: 'asc',
      }),
    enabled: !!petId,
  });
}

export function useTodayConditionLog(petId: string, today: string) {
  return useQuery<ConditionLog[]>({
    queryKey: ['ConditionLogs', petId, 'today', today],
    queryFn: () =>
      bkend.data.list('ConditionLogs', { petId, date: today }),
    enabled: !!petId,
  });
}

export function useCreateConditionLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ConditionLog, '_id' | 'createdAt' | 'updatedAt'>) =>
      bkend.data.create('ConditionLogs', data),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({ queryKey: ['ConditionLogs', variables.petId] }),
  });
}

export function useUpdateConditionLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ConditionLog> }) =>
      bkend.data.update('ConditionLogs', id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ConditionLogs'] }),
  });
}
