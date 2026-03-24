'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bkend } from '@/lib/bkend';

import type { Pet } from '@/types';

export function usePets() {
  return useQuery<Pet[]>({
    queryKey: ['Pets'],
    queryFn: () => bkend.data.list('Pets'),
  });
}

export function usePet(id: string) {
  return useQuery<Pet>({
    queryKey: ['Pets', id],
    queryFn: () => bkend.data.get('Pets', id),
    enabled: !!id,
  });
}

export function useCreatePet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Pet, '_id' | 'createdAt' | 'updatedAt' | 'userId'>) =>
      bkend.data.create('Pets', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['Pets'] }),
  });
}

export function useUpdatePet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pet> }) =>
      bkend.data.update('Pets', id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['Pets'] }),
  });
}

export function useDeletePet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bkend.data.delete('Pets', id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['Pets'] }),
  });
}
