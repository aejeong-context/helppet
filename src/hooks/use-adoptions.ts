'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bkend } from '@/lib/bkend';

import type { Adoption } from '@/types';

export function useAdoptions(filters?: Record<string, string>) {
  return useQuery<Adoption[]>({
    queryKey: ['Adoptions', filters],
    queryFn: () =>
      bkend.data.list('Adoptions', {
        _sort: 'createdAt',
        _order: 'desc',
        ...filters,
      }),
  });
}

export function useAdoption(id: string) {
  return useQuery<Adoption>({
    queryKey: ['Adoptions', id],
    queryFn: () => bkend.data.get('Adoptions', id),
    enabled: !!id,
  });
}

export function useCreateAdoption() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Adoption, '_id' | 'createdAt' | 'updatedAt' | 'userId'>) =>
      bkend.data.create('Adoptions', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['Adoptions'] }),
  });
}

export function useUpdateAdoption() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Adoption> }) =>
      bkend.data.update('Adoptions', id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['Adoptions'] }),
  });
}
